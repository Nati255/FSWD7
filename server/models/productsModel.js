import db from '../db/db.js';

export async function getAllProducts() {
  const [rows] = await db.query('SELECT * FROM products');
  return rows;
}

export async function getProductById(id) {
  if (!id) throw new Error('Missing product ID');
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
}

export async function createProduct(product) {
  const { title, description, price, stock, image_url, category } = product;
  if (!title || !price || stock == null) {
    throw new Error('Missing required product fields');
  }

  const [result] = await db.query(
    'INSERT INTO products (title, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, price, stock, image_url, category]
  );

  return getProductById(result.insertId);
}

export async function updateProduct(id, product) {
  const { title, description, price, stock, image_url, category } = product;
  if (!title || !price || stock == null) {
    throw new Error('Missing required fields for update');
  }

  await db.query(
    'UPDATE products SET title = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ? WHERE id = ?',
    [title, description, price, stock, image_url, category, id]
  );

  return getProductById(id);
}

export async function deleteProduct(id) {
  if (!id) throw new Error('Missing product ID');
  await db.query('DELETE FROM products WHERE id = ?', [id]);
  return { message: `Product ${id} deleted.` };
}
