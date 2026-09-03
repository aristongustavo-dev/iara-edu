import { db } from './db';

const delay = () => new Promise((resolve) => setTimeout(resolve, 120));

const clone = (v) => JSON.parse(JSON.stringify(v));

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
    return clone(db.insert(collection, data));
  },
  put: async (collection, id, patch) => {
    await delay();
    return clone(db.update(collection, id, patch));
  },
  delete: async (collection, id) => {
    await delay();
    return clone(db.remove(collection, id));
  },
  reset: async () => {
    await delay();
    return clone(db.reset());
  },
};