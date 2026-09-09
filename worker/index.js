const API_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
};

const RESULT_RATE_LIMIT_KEY = 'result_rate_v1';
const VERIFY_RATE_LIMIT_KEY = 'verify_rate_v1';
const RESULT_PREFIX = 'quiz_result:';
const RESULT_TTL_SECONDS = 31536000;
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_NAME_LENGTH = 200;
const MAX_REQUEST_BYTES = 10000;
const MAX_OPTIONS_PER_QUESTION = 6;
const EXPECTED_QUESTION_COUNT = 5;

const CORRECT_ANSWERS = [
  { correctIndex: 1 },
  { correctIndex: 0 },
  { correctIndex: 1 },
  { correctIndex: 0 },
  { correctIndex: 2 },
];

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: API_HEADERS,
  });
}

function jsonSuccess(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: API_HEADERS,
  });
}

function sanitizeName(value) {
  return String(value || '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .substring(0, MAX_NAME_LENGTH);
}

function generateToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let token = '';
  for (let i = 0; i < bytes.length; i++) {
    token += bytes[i].toString(16).padStart(2, '0');
  }
  return token;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function resultPayload(result) {
  return JSON.stringify({
    id: result.id,
    studentName: result.studentName,
    score: result.score,
    total: result.total,
    completedAt: result.completedAt,
  });
}

async function signResult(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifyResultSignature(secret, payload, encodedSignature) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(encodedSignature),
    new TextEncoder().encode(payload)
  );
}

function rateLimitKey(prefix, ip) {
  return prefix + ':' + ip;
}

async function checkRateLimit(env, prefix, ip) {
  if (!env.EMAIL_RATE_KV) return null;
  const key = rateLimitKey(prefix, ip);
  const now = Date.now();
  let record = await env.EMAIL_RATE_KV.get(key, { type: 'json' });
  if (record && now - record.windowStart < RATE_LIMIT_WINDOW_MS) {
    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
      return jsonError('Too many requests. Please try again later.', 429);
    }
    record.count += 1;
  } else {
    record = { windowStart: now, count: 1 };
  }
  await env.EMAIL_RATE_KV.put(key, JSON.stringify(record), {
    expirationTtl: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  });
  return null;
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    throw new Error('Request body is too large.');
  }
  const body = await request.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be an object.');
  }
  return body;
}

async function handleCreateResult(request, env) {
  if (!env.QUIZ_SESSION_KV) return jsonError('Result storage not configured.', 503);
  if (!env.RESULT_SIGNING_SECRET) return jsonError('Result verification is not configured on the server.', 503);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rateLimitError = await checkRateLimit(env, RESULT_RATE_LIMIT_KEY, ip);
  if (rateLimitError) return rateLimitError;

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    return jsonError(error.message || 'Invalid JSON.', 400);
  }

  const studentName = sanitizeName(body.studentName) || 'Student';
  const answers = body.answers;
  if (!Array.isArray(answers) || answers.length !== EXPECTED_QUESTION_COUNT) {
    return jsonError('All quiz answers are required.', 400);
  }

  let score = 0;
  for (let i = 0; i < CORRECT_ANSWERS.length; i++) {
    const answer = answers[i];
    if (!answer || answer.questionIndex !== i || !Number.isInteger(answer.answerIndex) || answer.answerIndex < 0 || answer.answerIndex >= MAX_OPTIONS_PER_QUESTION) {
      return jsonError('Invalid quiz answers.', 400);
    }
    if (answer.answerIndex === CORRECT_ANSWERS[i].correctIndex) score++;
  }

  const result = {
    id: 'GLY-' + generateToken().toUpperCase().slice(0, 10),
    studentName: studentName,
    score: score,
    total: EXPECTED_QUESTION_COUNT,
    completedAt: new Date().toISOString(),
  };
  result.signature = await signResult(env.RESULT_SIGNING_SECRET, resultPayload(result));
  result.answers = answers.map(function (answer, index) {
    return {
      questionIndex: index,
      answerIndex: answer.answerIndex,
      isCorrect: answer.answerIndex === CORRECT_ANSWERS[index].correctIndex,
    };
  });

  await env.QUIZ_SESSION_KV.put(RESULT_PREFIX + result.id, JSON.stringify(result), {
    expirationTtl: RESULT_TTL_SECONDS,
  });

  return jsonSuccess({
    resultId: result.id,
    verificationCode: result.id,
    score: result.score,
    total: result.total,
    completedAt: result.completedAt,
    verifyUrl: new URL('/verify.html?code=' + encodeURIComponent(result.id), request.url).toString(),
  });
}

async function handleVerifyResult(request, url, env) {
  if (!env.QUIZ_SESSION_KV) return jsonError('Result storage not configured.', 503);
  if (!env.RESULT_SIGNING_SECRET) return jsonError('Result verification is not configured on the server.', 503);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rateLimitError = await checkRateLimit(env, VERIFY_RATE_LIMIT_KEY, ip);
  if (rateLimitError) return rateLimitError;

  const code = (url.searchParams.get('code') || '').trim().toUpperCase();
  if (!/^GLY-[A-Z0-9]{10}$/.test(code)) return jsonError('Invalid verification code.', 400);

  const result = await env.QUIZ_SESSION_KV.get(RESULT_PREFIX + code, { type: 'json' });
  if (!result || !result.signature) return jsonError('Result not found or expired.', 404);

  let signatureIsValid = false;
  try {
    signatureIsValid = await verifyResultSignature(env.RESULT_SIGNING_SECRET, resultPayload(result), result.signature);
  } catch (error) {
    signatureIsValid = false;
  }
  if (!signatureIsValid) return jsonError('Result signature is invalid.', 409);

  return jsonSuccess({
    valid: true,
    resultId: result.id,
    studentName: result.studentName,
    score: result.score,
    total: result.total,
    completedAt: result.completedAt,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/create-result' && request.method === 'POST') {
      return handleCreateResult(request, env);
    }
    if (url.pathname === '/api/verify-result' && request.method === 'GET') {
      return handleVerifyResult(request, url, env);
    }
    return env.ASSETS.fetch(request);
  },
};
