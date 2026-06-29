const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

let cache = null;

function load() {
  if (cache) return cache;
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      cache = JSON.parse(raw);
    } else {
      cache = {};
    }
  } catch {
    cache = {};
  }
  return cache;
}

function save() {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    console.error('[DB] Save error:', e);
  }
}

const db = {
  async get(key) {
    const data = load();
    return data[key] ?? null;
  },
  async set(key, value) {
    const data = load();
    data[key] = value;
    save();
    return value;
  },
  async delete(key) {
    const data = load();
    delete data[key];
    save();
    return true;
  },
  async all() {
    const data = load();
    return Object.entries(data);
  },
};

module.exports = db;
