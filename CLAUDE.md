# Notes for Claude

Phalom won the Innovative Business Challenge (Oct 2026). **The pitch is over; the team is now building Phalom as a real business.** Before changing anything, read `BUSINESS.md` (status, open decisions, go-live to-do), `README.md` (layout, deploy) and `project-notes/MEMORY.md` (every decision and preference from the pitch).

- The team writes mostly in Lao, sometimes Thai or English. Keep apps and anything for shop owners in plain Lao. Lao kip only in the app.
- Be honest about what is real: payments are simulated, PhaJay is not signed or connected, no real shops yet, and many pitch numbers (1.5% fee, 30% share, market size, 700 shops) are estimates. Never present them as facts.
- App code: `pitch/phalom-app/`. Deploy with `scripts/deploy.sh` (needs `CLOUDFLARE_API_TOKEN`, `SUPABASE_ACCESS_TOKEN`, optional `OPENROUTER_API_KEY`). Never write keys into files.
- The live app is a demo with no shop login. Don't put real shop or customer data into it until the go-live items in `BUSINESS.md` are done.
- The team is cost-conscious: don't redo unchanged work, and ask before paid services.
- `project-notes/` is a snapshot of the project memory from 2026-10-22. Another Claude also works on this project in claude.ai, so work on the `main` branch (the only shared branch since 2026-10-23), `git pull` before you start, push small commits often, and update `BUSINESS.md` when something changes.
