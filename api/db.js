import { kv } from '@vercel/kv'

const COLLECTIONS = [
  'users', 'classes', 'activities', 'attempts', 'characters', 'groups',
  'notices', 'attendances', 'conversations', 'reports', 'farms', 'events',
]

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (res, code, obj) => {
  res.writeHead(code, { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(obj))
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'method not allowed' })
  }

  try {
    let db = null
    try {
      db = await kv.get('iara:db')
    } catch (e) {
      db = null
    }
    if (!db || typeof db !== 'object') {
      // seed vazio mas estruturado
      db = { __v: 1 }
      COLLECTIONS.forEach((c) => { if (db[c] === undefined) db[c] = [] })
    }
    return json(res, 200, db)
  } catch (e) {
    return json(res, 500, { error: 'falha ao ler banco' })
  }
}