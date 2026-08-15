/* ------------------------------------------------------------------
   Servehub API — Express + PostgreSQL (JSON file fallback in demo).
   Run: npm install && npm start   (copy .env.example → .env first)
   ------------------------------------------------------------------ */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { initDb, mode } = require('./src/config/db');
const repo = require('./src/repo');
const routes = require('./src/routes');

const app = express();

app.use(cors());                       // allow the SPA (any origin) to call the API
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let dbInitialized = false;
let dbInitPromise = null;

async function bootstrapAdmin() {
  const email = 'admin@servehub.com';
  if (!(await repo.findUserByEmail(email))) {
    await repo.createUser({
      name: 'Servehub Admin', email, phone: '+91 90000 00001',
      passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin',
    });
    console.log('[db] demo admin created → admin@servehub.com / admin123');
  }
}

async function ensureDbInit() {
  if (dbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await initDb();
      await repo.seed();
      await bootstrapAdmin();
      dbInitialized = true;
    })();
  }
  return dbInitPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureDbInit();
    next();
  } catch (err) {
    next(err);
  }
});

// GET /api/health — liveness + which storage backend is live
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'servehub-api', db: mode(), time: new Date().toISOString() });
});

app.use('/api/auth', routes.auth);
app.use('/api/services', routes.services);
app.use('/api/professionals', routes.professionals);
app.use('/api/bookings', routes.bookings);
app.use('/api/payments', routes.payments);
app.use('/api/ai', routes.ai);
app.use('/api', routes.customer); // /api/reviews, /api/addresses, /api/tickets, /api/notifications
app.use('/api/admin', routes.admin);

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Serve static assets from frontend directory
const feDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(feDir));

// Convenience: serve built single-file frontend at /, /servehub, /servehub.html, etc.
const feBuild = path.join(feDir, 'servehub.html');
const feIndex = path.join(feDir, 'index.html');
app.get(['/', '/index.html', '/servehub', '/servehub/', '/servehub.html', '/servehub/*'], (req, res) => {
  if (require('fs').existsSync(feBuild)) return res.sendFile(feBuild);
  if (require('fs').existsSync(feIndex)) return res.sendFile(feIndex);
  res.status(404).json({ error: 'Frontend build not found — run: node scripts/bundle.js' });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[api]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  ensureDbInit()
    .then(() => {
      let attempt = 0;
      const maxAttempts = 10;
      const initialPort = Number(PORT) || 4000;

      function startServer(p) {
        const server = app.listen(p, () => {
          console.log('');
          console.log('  Servehub API  →  http://localhost:' + p);
          console.log('  Health check  →  http://localhost:' + p + '/api/health');
          console.log('  Database      →  ' + mode().toUpperCase());
          console.log('');
        });

        server.on('error', err => {
          if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
            attempt++;
            const nextPort = initialPort + attempt;
            console.log(`[info] Port ${p} is currently in use. Trying port ${nextPort}...`);
            startServer(nextPort);
          } else {
            console.error('[error] Failed to start server:', err);
            process.exit(1);
          }
        });
      }

      startServer(initialPort);
    })
    .catch(err => {
      console.error('Fatal: failed to initialise database', err);
      process.exit(1);
    });
}

module.exports = app;

