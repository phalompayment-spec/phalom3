// Tourist demo front end. Pages are static; /api/* and /shared/* are served by
// the main Phalom Worker (shared backend and design files) via a service binding.
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/shared/")) return env.API.fetch(req);
    return env.ASSETS.fetch(req);
  },
};
