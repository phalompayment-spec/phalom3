# Notes for Claude

This repo is a copy of the Phalom project. Before changing anything, read `README.md` and `project-notes/MEMORY.md`: they hold the team's decisions (kip only, Lao first, fee model, PhaJay wording) and preferences (simple Lao words, sources on slides, cost-conscious: don't redo unchanged work).

- The team writes mostly in Lao, sometimes Thai or English. Keep apps and slides in Lao.
- App code: `pitch/phalom-app/`. Deploy with `scripts/deploy.sh` (needs `CLOUDFLARE_API_TOKEN`, `SUPABASE_ACCESS_TOKEN`, optional `OPENROUTER_API_KEY`). Never write keys into files.
- Latest pitch deck: `pitch-redesign/Phalom_Pitch_3D_live.html`.
- `project-notes/` is a snapshot of the project memory from 2026-10-22. Another Claude may keep working on the same project in claude.ai, so pull before you start and push your changes often.
