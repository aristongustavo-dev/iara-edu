const CLOUD_KEY = 'iara_cloud_configured';

function apiBase() {
  if (typeof window === 'undefined') return '';
  try {
    const host = window.location.hostname;
    // Já hospedado no Vercel (ou qualquer host): usa mesmo domínio /api
    if (host && host !== 'localhost' && host !== '127.0.0.1') return '';
    // Dev local: usa o servidor Vercel de produção
    return 'https://iara-edu.vercel.app';
  } catch (e) {
    return '';
  }
}

const stamp = (r) => {
  if (r && r.updated_at != null) return new Date(r.updated_at).getTime() || 0;
  if (r && r.created_at) return new Date(r.created_at).getTime() || 0;
  return 0;
};

const mergeRow = (local, remote, keyFn, preferLocal) => {
  const map = new Map();
  (local || []).forEach((r) => { if (r) map.set(keyFn(r), r); });
  (remote || []).forEach((r) => {
    if (!r) return;
    const k = keyFn(r);
    const cur = map.get(k);
    if (!cur) map.set(k, r);
    else if (stamp(r) > stamp(cur)) map.set(k, r);
    else if (!preferLocal && stamp(r) === stamp(cur) && !map.get(k)) map.set(k, r);
  });
  return Array.from(map.values());
};

export async function pullFromCloud(db, fallback) {
  try {
    const base = apiBase();
    const r = await fetch(`${base}/api/db`, { method: 'GET' });
    if (!r.ok) return db;
    const cloud = await r.json();
    if (!cloud || typeof cloud !== 'object') return db;

    const out = { ...db };
    Object.keys(cloud).forEach((col) => {
      if (!Array.isArray(cloud[col])) return;
      const local = Array.isArray(db[col]) ? db[col] : [];
      const remote = cloud[col];
      if (col === 'users') {
        out[col] = mergeRow(local, remote, (u) => u.email, true);
      } else {
        out[col] = mergeRow(local, remote, (r) => r.id || JSON.stringify(r), false);
      }
    });
    return out;
  } catch (e) {
    return db;
  }
}

let pushTimer = null;
export function scheduleCloudSync(db) {
  if (typeof fetch === 'undefined') return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushToCloud(db);
  }, 800);
}

export async function pushToCloud(db) {
  try {
    const base = apiBase();
    await fetch(`${base}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ db }),
    });
  } catch (e) {
    // sem internet / nuvem indisponível - mantém no localStorage
  }
}

export function isCloudConfigured() {
  try {
    return window.localStorage.getItem(CLOUD_KEY) === 'true';
  } catch (e) {
    return false;
  }
}