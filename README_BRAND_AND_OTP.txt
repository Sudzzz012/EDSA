# EDSA Branded UI + Configurable OTP

## What's included
- public/track-application.html — branded with Erase Debt SA logo, shows OTP TTL from API
- public/track-portfolio.html   — branded header, log + submit
- supabase/functions/send-otp/index.ts   — reads TTL from env `EDSA_OTP_TTL_MINUTES` (default 10)
- supabase/functions/verify-otp/index.ts — reads max attempts from env `EDSA_OTP_MAX_ATTEMPTS` (default 5)

## Set (optional) new secrets
# run from your project root
supabase functions secrets set EDSA_OTP_TTL_MINUTES='10'
supabase functions secrets set EDSA_OTP_MAX_ATTEMPTS='5'

## Deploy updated functions
supabase functions deploy send-otp
supabase functions deploy verify-otp
