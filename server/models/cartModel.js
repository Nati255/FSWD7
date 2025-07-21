import db from '../db/db.js';

export async function getCartByUserId(userId) {
  if (!userId) throw new Error('Missing user ID');

  const [rows] = await db.query(`
    SELECT c.id, c.amount, p.*
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId]);

  return rows;
}

export async function addToCart(userId, productId, amount = 1) {
  if (!userId || !productId) throw new Error('Missing user or product ID');

  // Check if item already exists in cart
  const [existing] = await db.query(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (existing.length > 0) {
    await db.query(
      'UPDATE cart_items SET amount = amount + ? WHERE user_id = ? AND product_id = ?',
      [amount, userId, productId]
    );
  } else {
    await db.query(
      'INSERT INTO cart_items (user_id, product_id, amount) VALUES (?, ?, ?)',
      [userId, productId, amount]
    );
  }

  return getCartByUserId(userId);
}

export async function updateCartItem(userId, productId, amount) {
  if (!userId || !productId || amount == null) throw new Error('Missing parameters');
  await db.query(
    'UPDATE cart_items SET amount = ? WHERE user_id = ? AND product_id = ?',
    [amount, userId, productId]
  );
  return getCartByUserId(userId);
}

export async function removeCartItem(userId, productId) {
  if (!userId || !productId) throw new Error('Missing parameters');
  await db.query(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  return { message: `Product ${productId} removed from cart.` };
}

export async function clearCart(userId) {
  if (!userId) throw new Error('Missing user ID');
  await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  return { message: 'Cart cleared.' };
}
