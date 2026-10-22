// Local stand-in for Supabase's REST RPC endpoint (POST /rest/v1/rpc/<fn>),
// backed by a local Postgres that has the migrations applied. Lets the Worker
// run end to end with `wrangler dev` without a Supabase project.
//   DATABASE_URL=postgres://postgres@localhost:54322/postgres node scripts/local-supabase.mjs
import http from "node:http";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || "postgres://postgres@localhost:54322/postgres" });
const PORT = Number(process.env.PORT || 54321);
const NAME = /^[a-z_][a-z0-9_]*$/;

http.createServer(async (req, res) => {
  const send = (status, obj) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
  const m = req.url.match(/^\/rest\/v1\/rpc\/([a-z0-9_]+)/i);
  if (req.method !== "POST" || !m || !NAME.test(m[1])) return send(404, { message: "not_found" });
  let raw = ""; for await (const c of req) raw += c;
  const args = raw ? JSON.parse(raw) : {};
  const keys = Object.keys(args).filter((k) => NAME.test(k));
  const vals = keys.map((k) => (args[k] !== null && typeof args[k] === "object" ? JSON.stringify(args[k]) : args[k]));
  const sql = `select public.${m[1]}(${keys.map((k, i) => `${k} => $${i + 1}`).join(", ")}) as r`;
  try {
    const { rows } = await pool.query(sql, vals);
    const r = rows[0]?.r;
    send(200, r === "" || r === undefined ? null : r);
  } catch (e) {
    send(400, { message: e.message, code: e.code });
  }
}).listen(PORT, () => console.log(`local supabase rpc on http://127.0.0.1:${PORT}`));
