// Persistencia opcional via Upstash Redis. Se nao houver KV_REST_API_URL configurado,
// usa um fallback em memoria para nao quebrar o app (os dados nao persistem entre cold starts).

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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    res.writeHead(405, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'method not allowed' }));
    return;
  }

  const redis = getRedis();
  let remote;
  if (redis) {
    try {
      remote = await redis.get('iara:users');
    } catch (e) {
      remote = null;
    }
  }
  const data = remote || { users: [], updatedAt: 0 };
  res.writeHead(200, {
    ...CORS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}