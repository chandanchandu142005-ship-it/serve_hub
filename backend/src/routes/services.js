const express = require('express');
const repo = require('../repo');
const wrap = require('../middleware/async');

const router = express.Router();

// GET /api/services/categories
router.get('/categories', wrap(async (req, res) => {
  res.json({ categories: await repo.listCategories() });
}));

// GET /api/services?category=Cleaning
router.get('/', wrap(async (req, res) => {
  const { category } = req.query;
  res.json({ services: await repo.listServices(category) });
}));

// GET /api/services/:id — detail + related services + matching professionals
router.get('/:id', wrap(async (req, res) => {
  const service = await repo.findServiceById(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  const related = (await repo.listServices(service.category)).filter(s => s.id !== service.id).slice(0, 4);
  const professionals = await repo.listPros({ serviceId: service.id, status: 'active' });
  res.json({ service, related, professionals });
}));

module.exports = router;
