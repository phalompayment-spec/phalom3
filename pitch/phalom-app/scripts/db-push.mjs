// Applies supabase/migrations/*.sql to your Supabase project through the
// Management API. Needs SUPABASE_URL (https://<ref>.supabase.co) and
// SUPABASE_ACCESS_TOKEN (a personal access token). Alternative: paste the
// files, in order, into the Supabase SQL editor.
import fs from "node:fs";
import path from "node:path";

const url = process.env.SUPABASE_URL, token = process.env.SUPABASE_ACCESS_TOKEN;
if (!url || !token) { console.error("Set SUPABASE_URL and SUPABASE_ACCESS_TOKEN"); process.exit(1); }
const ref = new URL(url).hostname.split(".")[0];
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "supabase", "migrations");
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  const query = fs.readFileSync(path.join(dir, f), "utf8");
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ query }),
  });
  if (!r.ok) { console.error(`✗ ${f}: ${r.status} ${await r.text()}`); process.exit(1); }
  console.log(`✓ ${f}`);
}
