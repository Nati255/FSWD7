import express from 'express';
import {
  getOrdersByUserId,
  getOrderDetails,
  createOrderFromCart,
  updateOrderStatus,
  getAllOrdersWithAgg
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

router.patch('/:orderId/status', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // 'pending' | 'paid' | 'shipped' | 'cancelled'
    const ok = await updateOrderStatus(orderId, status);
    if (!ok) return res.status(404).json({ error: 'Order not found' });
    const fresh = await getOrderDetails(orderId);
    res.json(fresh);
  } catch (err) {
    next(err);
  }
});

// 📄 כל ההזמנות עם פילטרים (admin) ?status=paid&q=gmail
router.get('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const orders = await getAllOrdersWithAgg({ status, q });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

export default router;
