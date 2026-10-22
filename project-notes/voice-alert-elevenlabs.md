---
name: voice-alert-elevenlabs
description: Shop app spoken "money received" alert via ElevenLabs on OpenRouter; needs env var "openrouter" + credit
metadata:
  type: project
---

2026-10-16: shop app voice alert uses OpenRouter `elevenlabs/eleven-v4-turbo` (exists; POST /api/v1/audio/speech, voice "sarah", mp3; ElevenLabs v4 lists Lao). Worker route GET /api/payments/:id/voice (paid payments only, cached per amount) needs Worker secret OPENROUTER_API_KEY; deploy.sh sets it from env var "openrouter". Any failure falls back to the phone's own voice. Deployed 08:3x without the key and untested against OpenRouter (user had not topped up). Key never stored in files. The key the user pasted in chat should be treated as exposed; user said they'd revoke it at project end.
**How to apply:** once the user saves "openrouter" in the env and tops up, redeploy (deploy.sh) and test a paid payment.

2026-10-17 05:33: user topped up, but env "phalom2" still has only "cloudflare" and "supabase" (no "openrouter"); live /api/health says voice:false. User asked to save it as env var named exactly "openrouter"; only a thread started AFTER saving can see it and redeploy.

2026-10-17 06:01 DONE: user re-pasted the key in chat and asked to use it; set Worker secret OPENROUTER_API_KEY via `wrangler secret put` only (no code redeploy, nothing written to files). Live /api/health voice:true; GET /api/payments/:id/voice returned 200 audio/mpeg (36 KB mp3) for a 12,000-kip demo payment (that test payment sits in the demo shop's history). Lao pronunciation not verified by ear. The env var "openrouter" is still not in the environment, so a future deploy.sh run would NOT reset the secret (it stays on the Worker); key is exposed in chat, user plans to revoke at project end (then the secret must be replaced).
