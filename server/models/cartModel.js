import db from '../db/db.js';

export async function reconcileCart(userId) {
  if (!userId) throw new Error('Missing user ID');

  // להסיר פריטים שמחוברים למוצרים שלא קיימים עוד
  await db.query(`
    DELETE c FROM cart_items c
    LEFT JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ? AND p.id IS NULL
  `, [userId]);

  // להתאים את הכמות למלאי הנוכחי
  await db.query(`
    UPDATE cart_items c
    JOIN products p ON p.id = c.product_id
    SET c.amount = LEAST(c.amount, p.stock)
    WHERE c.user_id = ?
  `, [userId]);
}

export async function getCartByUserId(userId) {
  if (!userId) throw new Error('Missing user ID');

  await reconcileCart(userId);

  const [items] = await db.query(`
    SELECT 
      c.product_id AS id,
      c.amount,
      p.title,
      p.price,         
      p.image_url,
      p.stock
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `, [userId]);

  const [sumRows] = await db.query(`
    SELECT COALESCE(SUM(c.amount * p.price), 0) AS total
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `, [userId]);

  const total = Number(sumRows?.[0]?.total ?? 0);
  console.log(total);
  return { items: items ?? [], total };
  
}


export async function addToCart(userId, productId, amount = 1) {
  if (!userId || !productId) throw new Error('Missing user or product ID');

  const [rows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
  const product = rows[0];
  if (!product) throw new Error('Product not found');
  if (product.stock <= 0) return getCartByUserId(userId); 

  await db.query(
    `INSERT INTO cart_items (user_id, product_id, amount)
     VALUES (?, ?, LEAST(?, ?))
     ON DUPLICATE KEY UPDATE amount = LEAST(amount + VALUES(amount), ?)`,
    [userId, productId, amount, product.stock, product.stock]
  );

  return getCartByUserId(userId);
}

export async function updateCartItem(userId, productId, amount) {
  if (!userId || !productId || amount == null) throw new Error('Missing parameters');

  const [rows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
  const product = rows[0];
  if (!product) throw new Error('Product not found');

  if (amount <= 0) {
    await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
  } else {
    await db.query(
      'UPDATE cart_items SET amount = LEAST(?, ?) WHERE user_id = ? AND product_id = ?',
      [amount, product.stock, userId, productId]
    );
  }
  return getCartByUserId(userId);
}


export async function removeCartItem(userId, productId) {
  if (!userId || !productId) throw new Error('Missing parameters');
  await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
  return getCartByUserId(userId);
}

export async function clearCart(userId) {
  if (!userId) throw new Error('Missing user ID');
  await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  return getCartByUserId(userId);
}
