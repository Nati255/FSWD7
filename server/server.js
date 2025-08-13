import express from 'express';
import cors from 'cors';

import usersRouter from './routes/users.js';
import productsRouter from './routes/ptroducts.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});

// טיפול בנתיבים לא קיימים (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
