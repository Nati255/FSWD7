// routes/cart.js
import express from 'express';
import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../models/cartModel.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeSelfOrAdmin } from '../middleware/authorizeSelfOrAdmin.js';

const router = express.Router();

router.get('/:userId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const cart = await getCartByUserId(req.params.userId);
    res.json(cart); // { items, total }
  } catch (err) {
    next(err);
  }
});

router.post('/',authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;           // ← מתוך ה-JWT
    const { productId, amount } = req.body;
    const cart = await addToCart(userId, productId, amount);
    res.status(201).json(cart);
  } catch (err) { next(err); }
});

router.put('/', authenticate,  async (req, res, next) => {
 try {
    const userId = req.user.id;
    const { productId, amount } = req.body;
    const cart = await updateCartItem(userId, productId, amount);
    res.json(cart);
  } catch (err) { next(err); }
});

router.delete('/:userId/:productId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const userId = req.user.id; // ← מתעלם מה-:userId בנתיב
    const { productId } = req.params;
    const cart = await removeCartItem(userId, productId);
    res.json(cart);
  } catch (err) { next(err); }
});

// מנקה סל
router.delete('/:userId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const userId = req.user.id; // ← מתעלם מה-:userId בנתיב
    const cart = await clearCart(userId);
    res.json(cart);
  } catch (err) { next(err); }
});

export default router;
