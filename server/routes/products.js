import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../models/productsModel.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;
    const prev = await getProductById(id);
    if (!prev) return res.status(404).json({ error: 'Product not found' });
    const updated = await updateProduct(id, req.body);
    if (req.body.image_url && req.body.image_url !== prev.image_url) {
      if (prev.image_url && prev.image_url.startsWith('/uploads/')) {
        const rel = prev.image_url.replace(/^\//, ''); 
        const abs = path.join(process.cwd(), rel); 
        fs.unlink(abs, () => {});
      }
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;
    const prev = await getProductById(id);
    if (!prev) return res.status(404).json({ error: 'Product not found' });

    const result = await deleteProduct(id);

    if (prev.image_url && prev.image_url.startsWith('/uploads/')) {
      const rel = prev.image_url.replace(/^\//, '');
      const abs = path.join(process.cwd(), rel);
      fs.unlink(abs, () => {});
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
