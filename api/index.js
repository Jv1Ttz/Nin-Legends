export default async function handler(req, res) {
  const mod = await import('./_server.mjs');
  const app = mod.default || mod;
  return app(req, res);
}

