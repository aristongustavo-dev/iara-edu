import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const stamp = (u) => Number(u.updated_at) || 0;

const mergeUsers = (local = [], remote = []) => {
  const map = new Map();
  local.forEach((u) => map.set(u.email, u));
  remote.forEach((ru) => {
    const cur = map.get(ru.email);
    if (!cur || stamp(ru) > stamp(cur)) map.set(ru.email, ru);
  });
  return Array.from(map.values());
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'method not allowed' }));
    return;
  }

  try {
    let body = '';
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body || '{}');
    const remote = await redis.get('iara:users');
    const remoteData = remote || { users: [], updatedAt: 0 };
    const merged = mergeUsers(remoteData.users, payload.users || []);
    const updatedAt = Date.now();
    await redis.set('iara:users', { users: merged, updatedAt });
    res.writeHead(200, {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ users: merged, updatedAt }));
  } catch (e) {
    res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'requisição inválida' }));
  }
}
