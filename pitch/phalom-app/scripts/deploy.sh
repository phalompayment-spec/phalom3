#!/usr/bin/env bash
# One-command deploy: Supabase tables + Cloudflare Worker.
# Needs: CLOUDFLARE_API_TOKEN and SUPABASE_ACCESS_TOKEN. scripts/resolve-env.mjs
#        looks up CLOUDFLARE_ACCOUNT_ID, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
#        with them (set any of these yourself to skip the lookup). Without
#        SUPABASE_ACCESS_TOKEN, set those three, apply the SQL files in the
#        Supabase SQL editor and set SKIP_DB=1.
set -euo pipefail
cd "$(dirname "$0")/.."
RESOLVED=$(node scripts/resolve-env.mjs)
eval "$RESOLVED"
for v in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY; do
  [ -n "${!v:-}" ] || { echo "Missing $v"; exit 1; }
done
npm ci
if [ "${SKIP_DB:-0}" != "1" ]; then node scripts/db-push.mjs; fi
npx wrangler deploy | tee /tmp/phalom-deploy.log
# Tourist demo app (its own link). Talks to the API above through a service binding.
(cd tourist && npx wrangler deploy)
# Secrets go in after the first deploy; each put rolls out a new version.
printf '%s' "$SUPABASE_URL" | npx wrangler secret put SUPABASE_URL
printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
if [ -n "${WEBHOOK_SECRET:-}" ]; then printf '%s' "$WEBHOOK_SECRET" | npx wrangler secret put WEBHOOK_SECRET; fi
# Voice alert (ElevenLabs via OpenRouter). The key is read from the env var "openrouter" (or OPENROUTER_API_KEY); skipped if absent.
OR_KEY="${OPENROUTER_API_KEY:-$(printenv openrouter || true)}"
if [ -n "$OR_KEY" ]; then printf '%s' "$OR_KEY" | npx wrangler secret put OPENROUTER_API_KEY; else echo "No openrouter key: spoken alert stays on the phone's own voice."; fi
URL=$(grep -oE 'https://[a-z0-9.-]+\.workers\.dev' /tmp/phalom-deploy.log | head -1)
echo "Deployed: $URL"
# New secrets can take a few minutes to reach every Cloudflare location.
for i in $(seq 1 30); do curl -fs "$URL/api/health" >/dev/null && break; sleep 10; done
BASE="$URL" node scripts/smoke.mjs
# Android app with this server address baked in (skip with SKIP_APK=1)
if [ "${SKIP_APK:-0}" != "1" ] && command -v javac >/dev/null; then SERVER_URL="$URL" bash scripts/build-apk.sh; fi
