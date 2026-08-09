/* ------------------------------------------------------------------
   Database connection — MongoDB via Mongoose (models in src/models/).
   - Tries MONGODB_URI (default: local mongodb://127.0.0.1:27017)
   - If unreachable → JSON file store fallback (backend/data/store.json)
     so the demo runs anywhere, even without MongoDB installed.
   ------------------------------------------------------------------ */
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const MONGODB_URI = (process.env.MONGODB_URI || '').trim() || 'mongodb://127.0.0.1:27017';
const DB_NAME = (process.env.MONGODB_DB || '').trim() || 'servehub';

let client = null;
let mode = 'pending'; // 'pending' | 'mongo' | 'file'

const currentMode = () => mode;

async function initDb() {
  try {
    // Fast liveness probe with the raw driver (3s timeout).
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
    const db = client.db(DB_NAME);
    await db.command({ ping: 1 });

    // Real data layer — connect Mongoose to the same server/database.
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 3000,
      autoIndex: true,
    });

    mode = 'mongo';
    console.log(`[db] Connected to MongoDB ✓ (${MONGODB_URI} / ${DB_NAME})`);
  } catch (err) {
    mode = 'file';
    if (client) { client.close().catch(() => {}); client = null; } // don't hold an open connection in fallback mode
    console.warn('[db] MongoDB unreachable — falling back to JSON file store (backend/data/store.json).');
    console.warn('[db] ' + err.message);
    console.warn('[db] Start MongoDB locally (mongod) or set MONGODB_URI in backend/.env to use it.');
  }
}

module.exports = { initDb, mode: currentMode, MONGODB_URI, DB_NAME };
