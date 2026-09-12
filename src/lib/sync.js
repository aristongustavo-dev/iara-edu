import { db } from '@/api/db';
import { isDemoEmail } from '@/api/demoAccounts';

const apiBase = (() => {
  try {
    const url = (localStorage.getItem('iara_api_url') || '').trim().replace(/\/+$/, '');
    if (url) return `${url}/`;
  } catch (e) {
    // ignore
  }
  return '/';
})();

const endpoint = (p) => `${apiBase}api/${p}`;

const stamp = (u) => Number(u.updated_at) || 0;

const mergeUsers = (local, remote) => {
  const map = new Map();
  (local || []).forEach((u) => map.set(u.email, u));
  (remote || []).forEach((ru) => {
    const cur = map.get(ru.email);
    if (!cur || stamp(ru) > stamp(cur)) map.set(ru.email, ru);
  });
  return Array.from(map.values());
};

const persistUsers = (users) => {
  try {
    const raw = JSON.parse(localStorage.getItem(db.storageKey) || '{}');
    raw.users = users;
    localStorage.setItem(db.storageKey, JSON.stringify(raw));
  } catch (e) {
    // ignore
  }
};

const normalize = (users) =>
  (users || []).map((u) => (u.updated_at ? u : { ...u, updated_at: Date.now() }));

// contas de demonstração são sempre sem senha, mesmo após merges com a nuvem
const sanitizeDemo = (users) => (users || []).forEach((u) => {
  if (isDemoEmail(u.email)) delete u.password_hash;
});

export const pullUsers = async () => {
  try {
    const res = await fetch(endpoint('db'), { method: 'GET' });
    if (!res.ok) return null;
    const remote = await res.json();
    const merged = normalize(mergeUsers(db.get('users'), remote.users || []));
    sanitizeDemo(merged);
    persistUsers(merged);
    return merged;
  } catch (e) {
    return null; // offline → mantém funcionando localmente
  }
};

export const pushUsers = async () => {
  try {
    const local = normalize(db.get('users'));
    sanitizeDemo(local);
    const res = await fetch(endpoint('sync'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: local }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.users)) {
      persistUsers(data.users);
      return data.users;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const syncUsersAll = async () => {
  await pullUsers();
  await pushUsers();
};