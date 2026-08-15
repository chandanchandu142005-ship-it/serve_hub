/* ------------------------------------------------------------------
   Database connection — MongoDB via Mongoose (models in src/models/).
   - Tries MONGODB_URI (default: local mongodb://127.0.0.1:27017)
   - If unreachable → JSON file store fallback (backend/data/store.json)
     so the demo runs anywhere, even without MongoDB installed.
   ------------------------------------------------------------------ */
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const getMongoUri = () => (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim() || 'mongodb://localhost:27017';
const DB_NAME = (process.env.MONGODB_DB || '').trim() || 'servehub';

let client = null;
let mode = 'pending'; // 'pending' | 'mongo' | 'file'

const currentMode = () => mode;

async function tryConnect(uri) {
  const opts = { serverSelectionTimeoutMS: 4000 };
  try {
    const c = new MongoClient(uri, opts);
    await c.connect();
    const db = c.db(DB_NAME);
    await db.command({ ping: 1 });
    return c;
  } catch (err) {
    if (uri.startsWith('mongodb+srv://') || uri.includes('ssl=true') || uri.includes('tls=true')) {
      const altOpts = { serverSelectionTimeoutMS: 4000, tlsAllowInvalidCertificates: true };
      const cAlt = new MongoClient(uri, altOpts);
      await cAlt.connect();
      const dbAlt = cAlt.db(DB_NAME);
      await dbAlt.command({ ping: 1 });
      return cAlt;
    }
    throw err;
  }
}

async function initDb() {
  const MONGODB_URI = getMongoUri();
  const isVercel = Boolean(process.env.VERCEL);
  const isLocalHostUri = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');

  if (isVercel && (!process.env.MONGODB_URI || isLocalHostUri)) {
    mode = 'file';
    console.log('[db] Running on Vercel without remote MONGODB_URI — using fast file store fallback.');
    return;
  }

  if (MONGODB_URI.includes('<db_password>') || MONGODB_URI.includes('<password>') || MONGODB_URI.includes('your_password')) {
    mode = 'file';
    console.warn('\n======================================================');
    console.warn('⚠️  MONGODB ATLAS SETUP NEEDED:');
    console.warn('   Please open backend/.env and replace <db_password>');
    console.warn('   with your actual MongoDB Atlas database password!');
    console.warn('   Example: mongodb+srv://CHANDAN:MyPassword123@cluster0...');
    console.warn('======================================================\n');
    console.warn('[db] Using JSON file store (backend/data/store.json) until password is updated in backend/.env.\n');
    return;
  }

  const urisToTry = [MONGODB_URI];
  if (MONGODB_URI.includes('localhost')) urisToTry.push(MONGODB_URI.replace('localhost', '127.0.0.1'));
  else if (MONGODB_URI.includes('127.0.0.1')) urisToTry.push(MONGODB_URI.replace('127.0.0.1', 'localhost'));

  let activeUri = MONGODB_URI;
  let connected = false;

  for (const uri of urisToTry) {
    try {
      client = await tryConnect(uri);
      activeUri = uri;
      connected = true;
      break;
    } catch (err) {
      console.warn(`[db] Connection attempt failed (${uri}):`, err.message);
      if (client) { client.close().catch(() => {}); client = null; }
    }
  }

  if (connected) {
    try {
      await mongoose.connect(activeUri, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 5000,
        autoIndex: true,
      });
      mode = 'mongo';
      console.log(`[db] Connected to MongoDB via Mongoose ✓ (${activeUri} / database: ${DB_NAME})`);
      return;
    } catch (e) {
      console.warn('[db] Mongoose connection error:', e.message);
    }
  }

  mode = 'file';
  if (client) { client.close().catch(() => {}); client = null; }
  console.warn(`[db] MongoDB unreachable (${MONGODB_URI}) — using JSON file store (backend/data/store.json).`);
  console.warn('[db] To connect live MongoDB, start mongod on port 27017 or set valid MONGODB_URI in backend/.env');
}

module.exports = { initDb, mode: currentMode, get MONGODB_URI() { return getMongoUri(); }, DB_NAME };
