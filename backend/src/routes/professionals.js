const express = require('express');
const repo = require('../repo');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/async');

const router = express.Router();

// POST /api/professionals/apply — a professional account submits their application
// (services, city, experience, bio). Status starts at 'pending' until an admin approves.
router.post('/apply', auth, wrap(async (req, res) => {
  const { services, city, experience, bio } = req.body || {};
  const user = await repo.findUserById(req.user.id);
  if (!user || user.role !== 'pro') {
    return res.status(403).json({ error: 'Only professional accounts can apply' });
  }
  if (await repo.findProByUserId(user.id)) {
    return res.status(409).json({ error: 'Application already submitted' });
  }
  const professional = await repo.createPro({
    userId: user.id, name: user.name, email: user.email, phone: user.phone,
    services: services || [], city, experience, bio,
  });
  res.status(201).json({ professional, message: 'Application submitted — awaiting admin approval' });
}));

// GET /api/professionals?serviceId=s1&city=Mumbai
router.get('/', wrap(async (req, res) => {
  const { serviceId, city } = req.query;
  const professionals = await repo.listPros({ serviceId, city, status: 'active' });
  res.json({ professionals });
}));

// GET /api/professionals/:id
router.get('/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Professional not found' });
  const professional = await repo.findProById(id);
  if (!professional) return res.status(404).json({ error: 'Professional not found' });
  res.json({ professional });
}));

module.exports = router;
