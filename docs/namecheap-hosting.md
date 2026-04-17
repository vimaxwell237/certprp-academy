# Namecheap Hosting Guide

This project is a **Next.js 15 App Router** application. Host it on Namecheap using **cPanel > Setup Node.js App**, not as a static site in `public_html`.

## What has already been prepared

- `server.js`
  - startup file for Namecheap's Node.js app runner
- `npm run start`
  - starts the production app through `server.js`
- `npm run package:namecheap`
  - creates an upload bundle in `deploy/certprep-namecheap-upload.zip`
- `npm run package:namecheap-prebuilt`
  - creates a prebuilt upload bundle in `deploy/certprep-namecheap-prebuilt-upload.zip`

## Requirements

Before you move production traffic:

1. In cPanel, open `Setup Node.js App`.
2. Confirm you have Node.js `18.18+`.
3. Prefer Node.js `20.x` or `22.x` if Namecheap offers it.

If your cPanel only offers an older Node version, do not switch hosting yet.

## Step 1: Prepare the upload bundle locally

Run these commands from the project root:

```powershell
npm install
npm run typecheck
npm run package:namecheap
```

That generates:

```text
deploy/certprep-namecheap-upload.zip
```

The bundle excludes local-only folders such as `node_modules`, `.next`, `tests`, and `.env.local`.

If your Namecheap shared hosting hits an LVE memory limit during `next build`, use the prebuilt bundle instead:

```powershell
npm install
npm run build
npm run package:namecheap-prebuilt
```

That generates:

```text
deploy/certprep-namecheap-prebuilt-upload.zip
```

This bundle includes the already-built `.next` output from your local machine so cPanel does not need to run `next build`.

## Step 2: Upload the project to Namecheap

1. Open `cPanel > File Manager`.
2. Create a folder outside `public_html`, for example:
   - `certprep-app`
3. Upload `deploy/certprep-namecheap-upload.zip` into that folder.
4. Extract the zip there.
5. Confirm the extracted folder contains:
   - `package.json`
   - `server.js`
   - `src`
   - `next.config.mjs`

If you are using the prebuilt bundle, also confirm it contains:

- `.next`

## Step 3: Create the Node.js application

Open `cPanel > Setup Node.js App` and click `Create Application`.

Use values like these:

- `Node.js version`
  - `20.x` or `22.x`
- `Application mode`
  - `Production`
- `Application root`
  - `certprep-app`
- `Application URL`
  - `www.certprep.it.com`
- `Application startup file`
  - `server.js`

If the UI does not let you bind directly to `www.certprep.it.com`, bind the domain it allows and keep the root-to-www redirect in Next.js.

## Step 4: Add environment variables in cPanel

Do not upload `.env.local`.

Instead, add your production values in `Setup Node.js App > Environment Variables`.

At minimum, configure these:

### Core app

- `APP_BASE_URL=https://certprep.it.com`
- `NEXT_PUBLIC_APP_URL=https://certprep.it.com`
- `NEXT_PUBLIC_SITE_URL=https://certprep.it.com`
- `AUTOMATION_SECRET=your-long-random-secret`
- `FORCE_WWW_REDIRECT=false`
- `LOW_MEMORY_BUILD=true`

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### SEO and verification

- `GOOGLE_SITE_VERIFICATION`
- `BING_SITE_VERIFICATION`
- `NEXT_PUBLIC_ORGANIZATION_SAME_AS`
- `NEXT_PUBLIC_SITE_INDEXING=true`

### Email

Use either SMTP or Resend.

SMTP:

- `NOTIFICATION_FROM_EMAIL`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_SMTP_HOST`
- `EMAIL_SMTP_PORT`
- `EMAIL_SMTP_USERNAME`
- `EMAIL_SMTP_PASSWORD`
- `EMAIL_SMTP_SECURE`

Or Resend:

- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL`
- `EMAIL_FROM_ADDRESS`

### Billing

- `BILLING_PROVIDER=stripe`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PREMIUM_MONTH`
- `STRIPE_PRICE_ID_TUTOR_PLAN_MONTH`

### AI integrations

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GITHUB_MODELS_TOKEN`
- `GITHUB_MODELS_MODEL`
- `GITHUB_MODELS_FALLBACK_MODEL`
- `GITHUB_TOKEN`
- `OPENAI_API_KEY`
- `OPENAI_TUTOR_MODEL`

Use [.env.local.example](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/.env.local.example) as the checklist of names.

## Step 5: Install packages and build on Namecheap

After creating the Node.js app:

1. Open the application's shell/terminal if available.
2. Change into the app root.
3. Run:

```bash
npm install
npm run build
```

4. Restart the application from `Setup Node.js App`.

If cPanel offers a `Run NPM Install` button, you can use that for install and then run the build from the terminal.

If `next build` fails on shared hosting with a CloudLinux/LVE memory error:

1. Delete the old extracted app files from the cPanel app folder.
2. Upload `deploy/certprep-namecheap-prebuilt-upload.zip` instead.
3. Extract it.
4. Run only:

```bash
npm install
```

5. Restart the app.

In that fallback flow, you skip `npm run build` on Namecheap because the build output is already included.

## Step 6: Confirm the site is serving correctly

Test these URLs:

- `https://www.certprep.it.com/`
- `https://certprep.it.com/`
- `https://www.certprep.it.com/robots.txt`
- `https://www.certprep.it.com/sitemap.xml`
- `https://www.certprep.it.com/login`

Expected behavior:

- `certprep.it.com` loads the site during first launch
- homepage loads
- `robots.txt` returns plain text
- `sitemap.xml` returns XML

The root-to-www redirect is now configurable in [next.config.mjs](/c:/Users/OZ COMPUTER/Desktop/CertPrep Academy/next.config.mjs). Keep `FORCE_WWW_REDIRECT=false` for the first Namecheap launch unless `www.certprep.it.com` is also mapped to the same application.

## Step 7: Recreate your background automation with Cron Jobs

This app has internal automation routes for reminders, deliveries, and admin queue processing. Vercel cron will not follow you automatically.

Open `cPanel > Cron Jobs` and add these jobs.

Every 5 minutes:

```bash
*/5 * * * * /usr/bin/curl -s -X POST https://www.certprep.it.com/api/internal/process-scheduled-jobs -H "Authorization: Bearer YOUR_AUTOMATION_SECRET" > /dev/null 2>&1
```

```bash
*/5 * * * * /usr/bin/curl -s -X POST https://www.certprep.it.com/api/internal/process-notification-deliveries -H "Authorization: Bearer YOUR_AUTOMATION_SECRET" > /dev/null 2>&1
```

Every 15 minutes:

```bash
*/15 * * * * /usr/bin/curl -s -X POST https://www.certprep.it.com/api/internal/process-escalation-rules -H "Authorization: Bearer YOUR_AUTOMATION_SECRET" > /dev/null 2>&1
```

```bash
*/15 * * * * /usr/bin/curl -s -X POST https://www.certprep.it.com/api/internal/process-subscription-digests -H "Authorization: Bearer YOUR_AUTOMATION_SECRET" > /dev/null 2>&1
```

```bash
*/15 * * * * /usr/bin/curl -s -X POST https://www.certprep.it.com/api/internal/process-automation-acknowledgement-reminders -H "Authorization: Bearer YOUR_AUTOMATION_SECRET" > /dev/null 2>&1
```

If your server uses a different `curl` path, ask Namecheap support for the correct one.

## Step 8: Update third-party dashboards after cutover

After the app is live on Namecheap:

1. In Supabase Auth:
   - keep `Site URL` as `https://www.certprep.it.com`
   - keep your redirect URLs updated
2. In Stripe:
   - confirm webhook endpoint points to the live Namecheap-hosted domain
3. In Google Search Console:
   - resubmit `https://www.certprep.it.com/sitemap.xml`
   - run a live test on the homepage and sitemap

## Step 9: Enable www redirect later

After `www.certprep.it.com` is mapped to the same Namecheap application and loads successfully:

1. Set `FORCE_WWW_REDIRECT=true` in `Setup Node.js App > Environment Variables`.
2. Save the app settings.
3. Restart the app.

At that point:

- `https://certprep.it.com` redirects to `https://www.certprep.it.com`
- `https://www.certprep.it.com` serves the site directly

## Notes

- Do not upload this app as a static site.
- Do not place the Next.js project directly in `public_html`.
- Build on the Namecheap server after upload.
- Keep the production canonical domain as `https://www.certprep.it.com`.
