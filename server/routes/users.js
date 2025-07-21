import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../models/usersModel.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { authorizeSelfOrAdmin } from '../middleware/authorizeSelfOrAdmin.js';

const router = express.Router();

router.get('/',authenticate, isAdmin, async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get('/:id',authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/:id',authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id',authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
