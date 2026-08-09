/* ------------------------------------------------------------------
   Servehub API — Express + PostgreSQL (JSON file fallback in demo).
   Run: npm install && npm start   (copy .env.example → .env first)
   ------------------------------------------------------------------ */
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { initDb, mode } = require('./src/config/db');
const repo = require('./src/repo');
const routes = require('./src/routes');

const app = express();

app.use(cors());                       // allow the SPA (any origin) to call the API
app.use(express.json());

// GET /api/health — liveness + which storage backend is live
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'servehub-api', db: mode(), time: new Date().toISOString() });
});

app.use('/api/auth', routes.auth);
app.use('/api/services', routes.services);
app.use('/api/professionals', routes.professionals);
app.use('/api/bookings', routes.bookings);
app.use('/api/payments', routes.payments);
app.use('/api', routes.customer); // /api/reviews, /api/addresses, /api/tickets, /api/notifications
app.use('/api/admin', routes.admin);

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Convenience: serve the built single-file frontend at / when it exists
const feBuild = path.join(__dirname, '..', 'frontend', 'servehub.html');
app.get(['/', '/index.html', '/servehub.html'], (req, res) => {
  if (require('fs').existsSync(feBuild)) return res.sendFile(feBuild);
  res.status(404).json({ error: 'Frontend build not found — run: node scripts/bundle.js' });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[api]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

async function bootstrapAdmin() {
  // Demo super-admin so the admin panel is reachable out of the box.
  const email = 'admin@servehub.com';
  if (!(await repo.findUserByEmail(email))) {
    await repo.createUser({
      name: 'Servehub Admin', email, phone: '+91 90000 00001',
      passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin',
    });
    console.log('[db] demo admin created → admin@servehub.com / admin123');
  }
}

initDb()
  .then(async () => {
    await repo.seed();
    await bootstrapAdmin();
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('  Servehub API  →  http://localhost:' + PORT);
      console.log('  Health check  →  http://localhost:' + PORT + '/api/health');
      console.log('  Database      →  ' + mode().toUpperCase());
      console.log('');
    });

    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[error] Port ${PORT} is already in use by another process.`);
        console.error(`[error] Please stop the existing process listening on port ${PORT} or set a custom PORT in .env (e.g. PORT=4001).\n`);
        process.exit(1);
      } else {
        console.error('[error] Server error:', err);
      }
    });
  })
  .catch(err => {
    console.error('Fatal: failed to initialise database', err);
    process.exit(1);
  });
