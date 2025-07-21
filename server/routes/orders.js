import express from 'express';
import {
  getOrdersByUserId,
  getOrderDetails,
  createOrderFromCart
} from '../models/ordersModel.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeSelfOrAdmin } from '../middleware/authorizeSelfOrAdmin.js';

const router = express.Router();

// יצירת הזמנה מתוך העגלה
router.post('/:userId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const order = await createOrderFromCart(req.params.userId);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// שליפת כל ההזמנות של משתמש
router.get('/user/:userId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const orders = await getOrdersByUserId(req.params.userId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// פרטי הזמנה בודדת
router.get('/:orderId', authenticate, async (req, res, next) => {
  try {
    const order = await getOrderDetails(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

export default router;
