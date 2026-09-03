import { db } from './db';
import { pushUsers } from '@/lib/sync';

const delay = () => new Promise((resolve) => setTimeout(resolve, 120));

const clone = (v) => JSON.parse(JSON.stringify(v));

const syncUsersIfChanged = (collection, row) => {
  if (collection === 'users' && row) {
    // dispara a sincronização das contas com o servidor (não bloqueia)
    pushUsers();
  }
};

export const base44Client = {
  get: async (collection, filters) => {
    await delay();
    return clone(db.get(collection, filters));
  },
  getAll: async (collection, sortBy, dir) => {
    await delay();
    return clone(db.findAll(collection, sortBy, dir));
  },
  getById: async (collection, id) => {
    await delay();
    return clone(db.findById(collection, id));
  },
  post: async (collection, data) => {
    await delay();
    const row = clone(db.insert(collection, data));
    syncUsersIfChanged(collection, row);
    return row;
  },
  put: async (collection, id, patch) => {
    await delay();
    const row = clone(db.update(collection, id, patch));
    syncUsersIfChanged(collection, row);
    return row;
  },
  delete: async (collection, id) => {
    await delay();
    const row = db.remove(collection, id);
    syncUsersIfChanged(collection, { id });
    return clone(row);
  },
  reset: async () => {
    await delay();
    return clone(db.reset());
  },
};