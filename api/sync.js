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

const stamp = (row) => {
  if (row && row.updated_at != null) return new Date(row.updated_at).getTime() || 0
  if (row && row.created_at) return new Date(row.created_at).getTime() || 0
  return 0
}

const emptyDb = () => {
  const db = { __v: 1 }
  COLLECTIONS.forEach((c) => { db[c] = [] })
  return db
}

// Mescla duas listas preservando a versão mais recente por chave.
// users -> chave email (sem sobreescrever login com seed), demais -> chave id
const mergeRows = (local = [], remote = [], keyFn, preferLocal = false) => {
  const map = new Map()
  local.forEach((r) => { if (r) map.set(keyFn(r), r) })
  remote.forEach((r) => {
    if (!r) return
    const k = keyFn(r)
    const cur = map.get(k)
    if (!cur) map.set(k, r)
    else if (stamp(r) > stamp(cur)) map.set(k, r)
    else if (!preferLocal && stamp(r) === stamp(cur)) map.set(k, r)
  })
  return Array.from(map.values())
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'method not allowed' })
  }

  try {
    let body = ''
    for await (const chunk of req) body += chunk
    const payload = JSON.parse(body || '{}')
    const incoming = payload.db || payload

    // banco atual na nuvem
    let cloud = null
    try {
      cloud = await kv.get('iara:db')
    } catch (e) {
      cloud = null
    }
    if (!cloud || typeof cloud !== 'object') cloud = emptyDb()

    const merged = emptyDb()
    COLLECTIONS.forEach((col) => {
      const local = Array.isArray(incoming[col]) ? incoming[col] : []
      const remote = Array.isArray(cloud[col]) ? cloud[col] : []
      if (col === 'users') {
        // users: chave por email, não sobreescreve local (evita seed voltar)
        merged[col] = mergeRows(local, remote, (u) => u.email, true)
      } else {
        merged[col] = mergeRows(local, remote, (r) => r.id || JSON.stringify(r))
      }
    })

    try {
      await kv.set('iara:db', merged)
    } catch (e) {
      // tenta sem o flag se a versão exigir
      await kv.set('iara:db', merged)
    }

    return json(res, 200, merged)
  } catch (e) {
    return json(res, 400, { error: 'requisição inválida' })
  }
}