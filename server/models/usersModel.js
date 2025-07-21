import db from '../db/db.js';

export async function getAllUsers() {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
}

export async function getUserById(id) {
  if (!id) throw new Error('Missing user ID');
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

export async function createUser(user) {
  const { full_name, username, email, password, role } = user;
  if (!full_name || !username || !email || !password) {
    throw new Error('Missing required fields');
  }

  const [existing] = await db.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email]
  );
  if (existing.length > 0) {
    throw new Error('User with that username or email already exists');
  }

  await db.query(
    'INSERT INTO users (full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [full_name, username, email, password, role || 'customer']
  );

  const [newUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  return newUser[0];
}

export async function updateUser(id, user) {
  const { full_name, username, email } = user;
  if (!id || !full_name || !username || !email) {
    throw new Error('Missing required fields for update');
  }

  await db.query(
    'UPDATE users SET full_name = ?, username = ?, email = ? WHERE id = ?',
    [full_name, username, email, id]
  );

  return getUserById(id);
}

export async function deleteUser(id) {
  if (!id) throw new Error('Missing user ID');
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  return { message: `User ${id} deleted.` };
}
