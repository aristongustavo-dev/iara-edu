let redisCache = null;

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (redisCache) return redisCache;
  import('@upstash/redis').then((mod) => {
    redisCache = new mod.Redis({ url, token });
  }).catch(() => { redisCache = null; });
  return redisCache;
}

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

// Fallback em memoria compartilhado na mesma instancia function
let memStore = { users: [], updatedAt: 0 };

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

    const redis = getRedis();
    let remoteData = { users: [], updatedAt: 0 };
    if (redis) {
      try {
        const r = await redis.get('iara:users');
        remoteData = r || { users: [], updatedAt: 0 };
      } catch (e) {
        remoteData = memStore;
      }
    } else {
      remoteData = memStore;
    }

    const merged = mergeUsers(remoteData.users, payload.users || []);
    const updatedAt = Date.now();

    if (redis) {
      try {
        await redis.set('iara:users', { users: merged, updatedAt });
        memStore = { users: merged, updatedAt };
      } catch (e) {
        memStore = { users: merged, updatedAt };
      }
    } else {
      memStore = { users: merged, updatedAt };
    }

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