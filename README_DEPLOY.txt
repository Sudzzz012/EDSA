# EDSA Tracking Bundle — Deploy Guide

## Functions included
- lookup-ref
- send-otp
- verify-otp
- get-portfolio
- create-query

## 1) Place files
Unzip into your project root so you have:
```
supabase/functions/lookup-ref/index.ts
supabase/functions/send-otp/index.ts
supabase/functions/verify-otp/index.ts
supabase/functions/get-portfolio/index.ts
supabase/functions/create-query/index.ts
public/track-application.html
public/track-portfolio.html
sql/setup.sql
```

## 2) Run the SQL (one-time)
Open `sql/setup.sql` in Supabase SQL editor and run it.

## 3) Set secrets
```bash
supabase functions secrets set SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
supabase functions secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase functions secrets set EDSA_FUNCTION_TOKEN="YOUR_SHARED_TOKEN"
supabase functions secrets set SENDGRIDFINAL="YOUR_SENDGRID_API_KEY"
supabase functions secrets set EDSA_STORAGE_BUCKET="edsa-queries"
```

## 4) Deploy functions
```bash
supabase functions deploy lookup-ref
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy get-portfolio
supabase functions deploy create-query
```

Then, in the dashboard for each function, **turn OFF “Verify JWT”**.

## 5) Storage bucket
Create a **private** bucket named `edsa-queries` in Supabase Storage.

## 6) Update HTML constants
Open both HTML files and set:
```js
const PROJECT_URL = "https://YOUR-PROJECT.supabase.co";
const ANON_KEY    = "YOUR_SUPABASE_ANON_KEY";
const SHARED_TOKEN= "YOUR_SHARED_TOKEN";
```

## 7) Test the flow
1) Open `public/track-application.html`
2) Enter **ID + Email** for a client that exists in `edsa_client_database`
3) OTP arrives; verify it
4) Redirect lands on `track-portfolio.html?ref=...`
5) Portfolio loads via `get-portfolio` and you can submit a message/file via `create-query`

## Troubleshooting
- 401 Unauthorized → Ensure `x-edsa-token` matches `EDSA_FUNCTION_TOKEN` and Verify JWT is OFF.
- 400/500 from functions → check Supabase logs for the function by name.
- OTP email not arriving → confirm `SENDGRIDFINAL` is a valid API key and sender domain is verified.
- Missing data on portfolio → ensure the `sale_reference` in `edsa_client_database` matches the ref returned by `lookup-ref`.
