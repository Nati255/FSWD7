import db from '../db/db.js';

export async function getOrdersByUserId(userId) {
  const [orders] = await db.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return orders;
}

export async function getOrderDetails(orderId) {
  const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (order.length === 0) return null;

  const [items] = await db.query(`
    SELECT oi.amount, oi.price_at_order, p.title, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `, [orderId]);

  return { ...order[0], items };
}

export async function createOrderFromCart(userId) {
  if (!userId) throw new Error('Missing user ID');

  // שליפת העגלה
  const [cartItems] = await db.query(`
    SELECT c.product_id, c.amount, p.price, p.stock
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId]);

  if (cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  // בדיקת מלאי
  for (const item of cartItems) {
    if (item.amount > item.stock) {
      throw new Error(`Insufficient stock for product ID ${item.product_id}`);
    }
  }

  // חישוב סכום כולל
  const total = cartItems.reduce((sum, item) => sum + item.amount * item.price, 0);

  // יצירת רשומת הזמנה
  const [orderResult] = await db.query(
    'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
    [userId, total]
  );
  const orderId = orderResult.insertId;

  // הכנסת פריטי הזמנה
  for (const item of cartItems) {
    await db.query(`
      INSERT INTO order_items (order_id, product_id, amount, price_at_order)
      VALUES (?, ?, ?, ?)
    `, [orderId, item.product_id, item.amount, item.price]);

    // עדכון מלאי
    await db.query(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [item.amount, item.product_id]
    );
  }

  // ניקוי עגלה
  await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  return getOrderDetails(orderId);
}
export async function getAllOrders() {
  const [rows] = await db.query(`
    SELECT o.*, u.full_name, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `);
  return rows;
}