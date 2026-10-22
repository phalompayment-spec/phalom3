#!/usr/bin/env bash
# Rebuilds Phalom_Pitch.pptx and .pdf in this folder.
#   DEMO_URL=https://phalom.<you>.workers.dev TOURIST_URL=https://phalom-tourist.<you>.workers.dev ./run.sh
#   puts the merchant app (slides 8 and 15) and the tourist app (slide 8) on the slides as links and QR codes
# Needs node, python3, LibreOffice, and the pptx skill (for apply_theme.js, validate.py, soffice.py).
set -euo pipefail
cd "$(dirname "$0")"
P=${PPTX_SKILL:-$(ls -d /root/.claude/skills/synced/*/pptx 2>/dev/null | head -1)}
export PPTX_SKILL="$P"
[ -d node_modules/pptxgenjs ] || npm install --no-audit --no-fund >/dev/null
if [ -n "${DEMO_URL:-}" ]; then npx -y qrcode@1.5.4 -o shots/demo-qr.png -w 800 -m 2 "$DEMO_URL" </dev/null; fi
if [ -n "${TOURIST_URL:-}" ]; then npx -y qrcode@1.5.4 -o shots/tourist-qr.png -w 800 -m 2 "$TOURIST_URL" </dev/null; fi
NODE_PATH="$PWD/node_modules" node build.js
python3 fixfont.py Phalom_Pitch.pptx
python3 "$P/scripts/office/validate.py" Phalom_Pitch.pptx | tail -1
python3 "$P/scripts/office/soffice.py" --headless --convert-to pdf Phalom_Pitch.pptx >/dev/null 2>&1
echo "Built Phalom_Pitch.pptx and Phalom_Pitch.pdf. Check them, then copy both to ../ (the shared pitch folder)."
