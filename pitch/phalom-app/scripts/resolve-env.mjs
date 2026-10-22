// Fills in what deploy.sh needs from just the two account tokens, so
// CLOUDFLARE_API_TOKEN and SUPABASE_ACCESS_TOKEN are enough on their own:
//   CLOUDFLARE_ACCOUNT_ID       the token's account (CF_ACCOUNT_NAME picks one if it sees several)
//   workers.dev subdomain       registered if the account has none yet (WORKERS_SUBDOMAIN, else phalom-<id>)
//   SUPABASE_URL                the project named SUPABASE_PROJECT_NAME (default "phalom"), or the only project;
//                               created in Singapore if the account has none, and restored if it is paused
//   SUPABASE_SERVICE_ROLE_KEY   read from that project's API keys
// Values already set are kept. Prints `export NAME='value'` lines for deploy.sh to eval; progress goes to
// stderr and never includes a key.
const CF = process.env.CF_API || "https://api.cloudflare.com/client/v4";
const SB = process.env.SUPABASE_API || "https://api.supabase.com";
const env = process.env;
const out = {};
const log = (m) => console.error(m);
const fail = (m) => { log("✗ " + m); process.exit(1); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cf(method, path, body) {
  const r = await fetch(CF + path, {
    method, body: body && JSON.stringify(body),
    headers: { authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "content-type": "application/json" },
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok && j.success !== false, status: r.status, result: j.result, errors: j.errors || [] };
}

async function sb(method, path, body) {
  const r = await fetch(SB + path, {
    method, body: body && JSON.stringify(body),
    headers: { authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, "content-type": "application/json" },
  });
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { j = text; }
  if (!r.ok) fail(`Supabase ${method} ${path}: ${r.status} ${typeof j === "string" ? j : JSON.stringify(j)}`.slice(0, 400));
  return j;
}

// ---- Cloudflare ----
if (env.CLOUDFLARE_API_TOKEN) {
  let id = env.CLOUDFLARE_ACCOUNT_ID;
  if (!id) {
    const a = await cf("GET", "/accounts?per_page=50");
    if (!a.ok) fail(`Cloudflare token was refused (${a.status}): ${a.errors.map((e) => e.message).join("; ")}`);
    const list = a.result || [];
    const pick = env.CF_ACCOUNT_NAME ? list.filter((x) => x.name === env.CF_ACCOUNT_NAME) : list;
    if (pick.length !== 1) fail(`Set CF_ACCOUNT_NAME to one of: ${list.map((x) => x.name).join(", ") || "(the token sees no account)"}`);
    id = out.CLOUDFLARE_ACCOUNT_ID = pick[0].id;
    log(`✓ Cloudflare account: ${pick[0].name}`);
  }
  const s = await cf("GET", `/accounts/${id}/workers/subdomain`);
  if (s.ok && s.result?.subdomain) {
    log(`✓ workers.dev subdomain: ${s.result.subdomain}`);
  } else {
    const name = (env.WORKERS_SUBDOMAIN || `phalom-${id.slice(0, 6)}`).toLowerCase();
    const p = await cf("PUT", `/accounts/${id}/workers/subdomain`, { subdomain: name });
    if (!p.ok) fail(`Could not register the workers.dev subdomain "${name}": ${p.errors.map((e) => e.message).join("; ")}. Pick one in the Cloudflare dashboard (Workers & Pages) or set WORKERS_SUBDOMAIN.`);
    log(`✓ registered workers.dev subdomain: ${name}`);
  }
}

// ---- Supabase ----
if (env.SUPABASE_ACCESS_TOKEN && (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)) {
  let ref = env.SUPABASE_URL ? new URL(env.SUPABASE_URL).hostname.split(".")[0] : null;
  if (!ref) {
    const want = env.SUPABASE_PROJECT_NAME || "phalom";
    const projects = await sb("GET", "/v1/projects");
    let p = projects.find((x) => x.name === want) || (projects.length === 1 ? projects[0] : null);
    if (!p && projects.length > 1) fail(`Set SUPABASE_PROJECT_NAME to one of: ${projects.map((x) => x.name).join(", ")}`);
    if (!p) {
      const orgs = await sb("GET", "/v1/organizations");
      if (!orgs.length) fail("The Supabase account has no organization. Create one in the dashboard first.");
      const pass = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 55]).join("");
      p = await sb("POST", "/v1/projects", { name: want, organization_id: orgs[0].id, region: "ap-southeast-1", db_pass: pass });
      log(`✓ created Supabase project "${want}" in Singapore (database password not kept; reset it in Project Settings › Database if you need it)`);
    }
    ref = p.ref || p.id;
    out.SUPABASE_URL = `https://${ref}.supabase.co`;
    log(`✓ Supabase project: ${p.name} (${ref})`);
  }
  // Wait for a new project to come up, and wake a paused one.
  for (let i = 0; ; i++) {
    const st = (await sb("GET", `/v1/projects/${ref}`)).status;
    if (st === "ACTIVE_HEALTHY") break;
    if (st === "INACTIVE" && i === 0) { await sb("POST", `/v1/projects/${ref}/restore`); log("… project was paused, restoring"); }
    if (i >= 60) fail(`Supabase project is still ${st} after 10 minutes`);
    if (i % 6 === 0) log(`… waiting for Supabase project (${st})`);
    await sleep(10000);
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    const keys = await sb("GET", `/v1/projects/${ref}/api-keys?reveal=true`);
    const k = keys.find((x) => x.name === "service_role") || keys.find((x) => x.type === "secret");
    if (!k?.api_key) fail("No service_role or secret key found on the Supabase project");
    out.SUPABASE_SERVICE_ROLE_KEY = k.api_key;
    log(`✓ Supabase ${k.name === "service_role" ? "service_role" : "secret"} key loaded`);
  }
}

const q = (v) => "'" + String(v).replace(/'/g, "'\\''") + "'";
for (const [k, v] of Object.entries(out)) console.log(`export ${k}=${q(v)}`);
