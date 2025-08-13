// server/routes/admin.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { getAdminStats } from '../models/adminModel.js';

const router = express.Router();

router.get('/stats', authenticate, isAdmin, async (req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
