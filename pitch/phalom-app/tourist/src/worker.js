// Tourist front end. Pages are static; /api/* and /shared/* are served by
// the main Phalom Worker (shared backend and design files) via a service binding.
function withSecurityHeaders(res) {
  const headers = new Headers(res.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("permissions-policy", "camera=(self), geolocation=(self), microphone=()");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/shared/")) {
      return env.API.fetch(req);
    }
    return withSecurityHeaders(await env.ASSETS.fetch(req));
  },
};
