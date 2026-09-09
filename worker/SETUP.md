# Cloudflare Worker Setup

The deployed Worker serves the static site, creates signed quiz results, and verifies result codes. Teacher email delivery uses the student's local email app through `mailto:`. No email provider or email API key is required.

## Prerequisites

- A Cloudflare account
- Node.js
- Wrangler

## Configure the Worker

From the project root, create the signing secret:

```powershell
npx wrangler@4.129.1 secret put RESULT_SIGNING_SECRET
```

Use a long random value. Keep it stable and private. Changing it invalidates existing verification records.

The root `wrangler.toml` contains the Worker entry point, public asset directory, and KV bindings. The `QUIZ_SESSION_KV` namespace stores signed results. `EMAIL_RATE_KV` stores rate-limit counters.

Create namespaces only when setting up a new Cloudflare account:

```powershell
npx wrangler@4.129.1 kv namespace create QUIZ_SESSION_KV
npx wrangler@4.129.1 kv namespace create EMAIL_RATE_KV
```

Copy the returned IDs into the top-level `[[kv_namespaces]]` entries in `wrangler.toml`.

## Deploy

From the project root:

```powershell
npx wrangler@4.129.1 deploy
```

The Worker serves `public/` and exposes:

- `POST /api/create-result`
- `GET /api/verify-result?code=...`

## Result Flow

1. The student completes the five-question story quiz.
2. The browser sends the selected answer indexes and student name to `/api/create-result`.
3. The Worker calculates the score from its canonical answer key.
4. The Worker signs and stores a result record in `QUIZ_SESSION_KV` for one year.
5. The browser can download an HTML report containing the score, date, code, and verification link.
6. The email form creates the same kind of signed result and opens the student's local email app with a prefilled `mailto:` message.
7. The student may attach the downloaded report manually.
8. A teacher verifies the result at `/verify.html` or through the link in the message.

The downloaded HTML file is a presentation copy and can be edited. The online verification record is authoritative.

## Local Development

```powershell
npx wrangler@4.129.1 dev
```

Open the local URL printed by Wrangler. Opening `public/index.html` directly or using a different static server will not provide the Worker API routes.

## Security Notes

- `RESULT_SIGNING_SECRET` is stored as a Cloudflare Worker secret and never sent to the browser.
- Scores are calculated on the server from fixed answer indexes.
- Result creation and verification have separate KV-backed rate limits.
- Result codes expire after one year.
- Request bodies are validated as JSON objects with bounded fields.
- The verification page escapes values before displaying them.
- The mailto message is user-editable by design; the verification link is the trusted source.

## Cloudflare Bindings

| Binding | Purpose |
|---|---|
| `ASSETS` | Serves the `public/` directory |
| `QUIZ_SESSION_KV` | Stores signed result records |
| `EMAIL_RATE_KV` | Stores rate-limit counters |
| `RESULT_SIGNING_SECRET` | Signs and verifies result records |

## Files

| File | Purpose |
|---|---|
| `wrangler.toml` | Root Worker configuration |
| `worker/index.js` | Worker API and asset routing |
| `public/` | Deployed static files |
| `public/verify.html` | Teacher verification page |
