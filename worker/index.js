/**
 * Cloudflare Worker: Glycolysis Educational Website
 *
 * Responsibilities:
 *   1. Serve static website from /public via ASSETS binding
 *   2. Handle POST /api/send-email for quiz results
 *
 * Environment variables:
 *   RESEND_API_KEY  — Set via `wrangler secret put RESEND_API_KEY` (never in code)
 *   SEND_FROM       — Sender address (configured in wrangler.toml [vars])
 *   TURNSTILE_SECRET — (Optional) Cloudflare Turnstile secret for abuse protection
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Input length limits
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 300;
const MAX_MESSAGE_LENGTH = 10000;

// Simple email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitize: remove control characters, trim, and enforce max length
function sanitize(str, maxLength) {
  return (str || '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .substring(0, maxLength);
}

// JSON error response helper
function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// JSON success response helper
function jsonSuccess(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ── CORS preflight ──
    if (request.method === 'OPTIONS') {
      if (pathname === '/api/send-email') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }
      // Let static asset handler deal with OPTIONS for non-API routes
    }

    // ── Email API ──
    if (pathname === '/api/send-email') {
      return handleSendEmail(request, env);
    }

    // ── All other requests → static assets ──
    return env.ASSETS.fetch(request);
  },
};

/**
 * Handle POST /api/send-email
 */
async function handleSendEmail(request, env) {
  // Only POST allowed
  if (request.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  // Check that RESEND_API_KEY is configured
  if (!env.RESEND_API_KEY) {
    return jsonError('Email service not configured on the server.', 503);
  }

  // ── Turnstile verification (optional — manual setup required) ──
  // If TURNSTILE_SECRET is set, verify the Turnstile token before proceeding.
  // To enable: set TURNSTILE_SECRET via `wrangler secret put TURNSTILE_SECRET`
  // and add a Turnstile widget to the frontend form.
  if (env.TURNSTILE_SECRET) {
    let body;
    try {
      body = await request.clone().json();
    } catch {
      return jsonError('Invalid JSON', 400);
    }
    const token = body.turnstileToken;
    if (!token) {
      return jsonError('Turnstile verification required.', 403);
    }
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: token,
      }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return jsonError('Turnstile verification failed.', 403);
    }
  }

  // ── Parse request body ──
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const { teacherName, teacherEmail, studentName, subject, message } = body;

  // ── Validate required fields ──
  if (!teacherName || !teacherEmail || !studentName || !subject || !message) {
    return jsonError('All fields are required: teacherName, teacherEmail, studentName, subject, message.', 400);
  }

  // ── Sanitize inputs ──
  const safeTeacherName = sanitize(teacherName, MAX_NAME_LENGTH);
  const safeTeacherEmail = sanitize(teacherEmail, MAX_EMAIL_LENGTH);
  const safeStudentName = sanitize(studentName, MAX_NAME_LENGTH);
  const safeSubject = sanitize(subject, MAX_SUBJECT_LENGTH);
  const safeMessage = sanitize(message, MAX_MESSAGE_LENGTH);

  // ── Validate teacher email ──
  if (!isValidEmail(safeTeacherEmail)) {
    return jsonError('Invalid teacher email address.', 400);
  }

  // ── Verify required fields are not empty after sanitization ──
  if (!safeTeacherName || !safeStudentName || !safeSubject || !safeMessage) {
    return jsonError('All fields are required.', 400);
  }

  // ── Send email via Resend API ──
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.SEND_FROM || 'Glycolysis Interactive <onboarding@resend.dev>',
        to: [safeTeacherEmail],
        subject: safeSubject,
        text: safeMessage,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', res.status, data);
      return jsonError(data.message || 'Email service error.', 502);
    }

    return jsonSuccess({ success: true, id: data.id });
  } catch (err) {
    console.error('Failed to call Resend API:', err.message);
    return jsonError('Failed to send email. Please try again later.', 500);
  }
}
