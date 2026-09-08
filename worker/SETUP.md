# Cloudflare Worker + Resend Email Backend Setup

## What This Does

Your Glycolysis website now runs on Cloudflare Workers:

```
Browser
  |
  | POST /api/send-email
  v
Cloudflare Worker (worker/index.js)
  |
  | server-side Resend API call
  v
Resend
  |
  v
Teacher's email inbox
```

The same Worker also serves all static website files from the `public/` directory.

---

## Prerequisites

- A Cloudflare account (free tier is fine)
- A Resend account (free tier: 100 emails/day)
- Node.js installed on your computer

---

## Step 1: Get a Resend API Key

1. Go to [https://resend.com](https://resend.com) and sign up (free)
2. In the Resend dashboard, go to **API Keys**
3. Create a new API key — copy it (it starts with `re_`)
4. **Keep this key safe.** Never paste it into any source file.

---

## Step 2: Set the Resend API Key as a Cloudflare Secret

In your terminal, from the project root:

```bash
npx wrangler secret put RESEND_API_KEY
```

When prompted, paste your Resend API key. This stores it securely in Cloudflare — it will **never** appear in your source code or git history.

---

## Step 3: Deploy the Worker

```bash
npx wrangler deploy
```

This deploys both:
- The Worker code (`worker/index.js`) — handles `/api/send-email`
- The static website (`public/`) — serves all other pages

---

## Step 4: Update the Frontend

In `public/story/story.js`, the `EMAIL_API` variable is already set to:

```js
var EMAIL_API = '/api/send-email';
```

This is a **relative URL**, so it works automatically once the Worker is deployed. No changes needed.

---

## Step 5: (Optional) Custom Sending Address

By default, emails are sent from the Resend testing address:
```
Glycolysis Interactive <onboarding@resend.dev>
```

To use your own domain:

1. Go to the **Resend dashboard** → **Domains**
2. Add your domain and verify it (add DNS records as instructed)
3. Update `SEND_FROM` in `wrangler.toml`:
   ```toml
   [vars]
   SEND_FROM = "Glycolysis Interactive <results@yourdomain.com>"
   ```
4. Redeploy: `npx wrangler deploy`

---

## How It Works

### The Frontend (story.js)

1. Student completes the quiz
2. Student clicks **EMAIL RESULTS TO TEACHER**
3. Student fills in: teacher name, teacher email, student name
4. Frontend sends a POST request to `/api/send-email` with JSON body:
   ```json
   {
     "teacherName": "Mr. Smith",
     "teacherEmail": "smith@school.edu",
     "studentName": "Jane Doe",
     "subject": "Glycolysis Quiz Results - Jane Doe",
     "message": "Quiz results text..."
   }
   ```

### The Worker (worker/index.js)

1. Receives the POST request
2. Validates all fields (presence, email format, length limits)
3. Sanitizes input (removes control characters)
4. Calls the Resend API server-side (API key stays on the server)
5. Returns success or error JSON to the frontend

### Static Files

All files in `public/` are served automatically by Cloudflare's edge network. No Worker code is needed for static content.

---

## Running Locally

```bash
npx wrangler dev
```

Then open `http://localhost:8787` in your browser.

**Note:** The local dev server (`wrangler dev`) may crash on Windows due to miniflare compatibility issues. If this happens, you can test the static site by opening `public/index.html` directly in your browser. The email API won't work locally without a Resend API key.

### Testing the API Locally

To test the email API locally, you need to provide the Resend API key as a local secret:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler dev
```

Without the key, the API will return a configuration error (not crash).

---

## Where Secrets Are Stored

| Secret | Where | How to Set |
|--------|-------|------------|
| `RESEND_API_KEY` | Cloudflare Workers secrets | `npx wrangler secret put RESEND_API_KEY` |
| `TURNSTILE_SECRET` | Cloudflare Workers secrets | `npx wrangler secret put TURNSTILE_SECRET` (optional) |
| `SEND_FROM` | `wrangler.toml` [vars] | Edit the file directly |

**Never** put API keys in:
- JavaScript or HTML files
- `wrangler.toml`
- Git commits
- `.env` files that might be committed

---

## Cloudflare Dashboard Steps (Manual)

1. **Log in** to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → find your "glycolysis" worker
3. Verify it's deployed and serving the site
4. (Optional) Go to **Settings** → **Triggers** to add a custom domain route
5. (Optional) Enable **Cloudflare Turnstile** for anti-abuse protection:
   - Go to **Turnstile** → Create a site
   - Get the site key and secret key
   - Add the site key to your frontend form
   - Set the secret key: `npx wrangler secret put TURNSTILE_SECRET`

---

## Resend Dashboard Steps (Manual)

1. **Log in** to [https://resend.com](https://resend.com)
2. Verify your sending domain (if using custom domain)
3. Check the **Emails** tab to see sent emails
4. Monitor your usage (free tier: 100 emails/day)

---

## Security Features

- ✅ All input validated server-side (presence, format, length)
- ✅ Control characters stripped from all inputs
- ✅ Input length limits enforced
- ✅ API key stored as Cloudflare secret (never in code)
- ✅ No secret leakage in error messages or logs
- ✅ CORS headers configured for API endpoints
- ✅ Turnstile anti-abuse integration point (optional, requires manual setup)
- ⚠️ Rate limiting requires Cloudflare dashboard configuration (manual)

---

## Files

| File | Purpose |
|------|---------|
| `wrangler.toml` | Cloudflare Worker configuration (root) |
| `worker/index.js` | Worker code: email API + static asset serving |
| `worker/SETUP.md` | This file |
| `public/` | All static website files |

---

## GitHub Pages

The original GitHub Pages deployment at `https://github.com/Rainier-PS/Glycolysis` remains **completely untouched**. The `main` branch has not been modified. This migration was done on the `cloudflare-migration` branch.

Once you've verified the Cloudflare deployment works, you can:
1. Keep both deployments running (GitHub Pages as backup)
2. Switch the GitHub Pages deployment to the `cloudflare-migration` branch
3. Or disable GitHub Pages entirely (your choice)

---

## Troubleshooting

**"Email service not configured on the server"**
→ You haven't set the RESEND_API_KEY secret. Run: `npx wrangler secret put RESEND_API_KEY`

**"Failed to send email"**
→ Check your Resend dashboard for API errors. Make sure the API key is valid.

**"Turnstile verification failed"**
→ If you enabled Turnstile, make sure the site key and secret key match.

**Static files not loading**
→ Make sure the `public/` directory contains your website files and `wrangler.toml` points to it.
