/**
 * Authentication and cryptographic helpers for the Phalom Cloudflare Worker.
 *
 * Uses only Web Crypto APIs (PBKDF2-SHA256 for 6-digit shop PINs, SHA-256 /
 * HMAC-SHA256 for session tokens and partner webhooks) so there are zero
 * external dependencies and zero paid auth services required.
 */

export const SESSION_COOKIE = "phalom_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days for shop owners
export const DEMO_SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours for demo sessions
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

// Cloudflare Workers Web Crypto caps PBKDF2 at 100,000 iterations.
const PBKDF2_ITERATIONS = 100_000;
const DERIVED_BITS = 256;
const SALT_BYTES = 16;

const enc = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

function fromHex(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Normalizes a Lao or international phone number to canonical digits for unique lookup.
 * Examples:
 *   "020 5628 0572"   -> "8562056280572"
 *   "+856 20 56280572" -> "8562056280572"
 *   "2056280572"      -> "8562056280572"
 *   "030 512 3456"    -> "856305123456"
 */
export function normalizePhone(raw: unknown): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return null;

  let norm = digits;
  if (norm.startsWith("00856")) norm = norm.slice(2);
  else if (norm.startsWith("8560")) norm = "856" + norm.slice(4);
  else if (norm.startsWith("020") || norm.startsWith("030") || norm.startsWith("021")) norm = "856" + norm.slice(1);
  else if ((norm.startsWith("20") && norm.length === 10) || (norm.startsWith("30") && norm.length === 9)) norm = "856" + norm;

  if (norm.length < 8 || norm.length > 15) return null;
  return norm;
}

export function isValidPin(raw: unknown): raw is string {
  return typeof raw === "string" && /^\d{6}$/.test(raw);
}

export async function hashPin(pin: string, existingSaltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = existingSaltHex ? fromHex(existingSaltHex) : crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  if (!salt || salt.length < 8) throw new Error("invalid_salt");

  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    DERIVED_BITS,
  );
  return { hash: toHex(new Uint8Array(bits)), salt: toHex(salt) };
}

export async function verifyPin(pin: string, storedHashHex: string, storedSaltHex: string): Promise<boolean> {
  if (!isValidPin(pin)) return false;
  const expected = fromHex(storedHashHex);
  if (!expected) return false;
  try {
    const derived = await hashPin(pin, storedSaltHex);
    const actual = fromHex(derived.hash);
    return !!actual && constantTimeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashSessionToken(token: string, pepper?: string): Promise<string> {
  if (pepper) {
    const key = await crypto.subtle.importKey("raw", enc.encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(token));
    return toHex(new Uint8Array(sig));
  }
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(token));
  return toHex(new Uint8Array(digest));
}

export function parseSessionToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) {
    const t = auth.replace(/^Bearer\s+/i, "").trim();
    if (t.length >= 20 && t.length <= 256) return t;
  }
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    if (k === SESSION_COOKIE) {
      const v = part.slice(idx + 1).trim();
      if (v.length >= 20 && v.length <= 256) return v;
    }
  }
  return null;
}

export function buildSessionCookie(token: string, maxAgeSeconds: number, isHttps: boolean): string {
  const attrs = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ];
  if (isHttps) attrs.push("Secure");
  return attrs.join("; ");
}

export function clearSessionCookie(isHttps: boolean): string {
  const attrs = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isHttps) attrs.push("Secure");
  return attrs.join("; ");
}

export async function verifyWebhookSignature(secret: string, raw: string, sigHex: string | null): Promise<boolean> {
  if (!sigHex || !/^[0-9a-f]{64}$/i.test(sigHex.trim())) return false;
  const sig = fromHex(sigHex.trim());
  if (!sig) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, sig as BufferSource, enc.encode(raw));
}
