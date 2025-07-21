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

// Get cart for a user
router.get('/:userId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const cart = await getCartByUserId(req.params.userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// Add product to cart
router.post('/',authenticate, authorizeSelfOrAdmin('userId'), async (req, res, next) => {
  try {
    const { userId, productId, amount } = req.body;
    const cart = await addToCart(userId, productId, amount);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

// Update amount for a product in cart
router.put('/',authenticate, authorizeSelfOrAdmin('userId'), async (req, res, next) => {
  try {
    const { userId, productId, amount } = req.body;
    const cart = await updateCartItem(userId, productId, amount);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// Remove a product from cart
router.delete('/:userId/:productId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const result = await removeCartItem(req.params.userId, req.params.productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Clear entire cart
router.delete('/:userId', authenticate, authorizeSelfOrAdmin(), async (req, res, next) => {
  try {
    const result = await clearCart(req.params.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
