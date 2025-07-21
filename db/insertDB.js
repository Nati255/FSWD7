import mysql from 'mysql2';
import bcrypt from 'bcrypt';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'natan123',
  database: 'ecommerce',
  multipleStatements: true
});

connection.connect(async (err) => {
  if (err) throw err;
  console.log('Connected to ecommerce DB');

  try {
    await insertProducts();
    await insertUsers();
    console.log('Products and users inserted successfully!');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    connection.end();
  }
});

function insertProducts() {
  const products = [
    ['Queen Panel Bed', 'Elegant and comfortable queen-size panel bed.', 499.99, 10, 'https://example.com/images/product1.jpg', 'furniture'],
    ['King Panel Bed', 'Spacious and luxurious king-size panel bed.', 599.99, 8, 'https://example.com/images/product2.jpg', 'furniture'],
    ['Single Panel Bed', 'Simple and compact single panel bed.', 299.99, 15, 'https://example.com/images/product3.jpg', 'furniture'],
    ['Twin Panel Bed', 'Comfortable twin-size panel bed.', 349.99, 12, 'https://example.com/images/product4.jpg', 'furniture'],
    ['Fridge', 'Large capacity fridge with freezer.', 799.99, 5, 'https://example.com/images/product5.jpg', 'appliances'],
    ['Dresser', 'Wooden dresser with multiple drawers.', 259.99, 9, 'https://example.com/images/product6.jpg', 'furniture'],
    ['Couch', 'Modern and comfy 3-seater couch.', 699.99, 4, 'https://example.com/images/product7.jpg', 'furniture'],
    ['Dining Table', 'Spacious dining table for 6.', 399.99, 6, 'https://example.com/images/product8.jpg', 'furniture'],
    ['Microwave', 'High-efficiency microwave oven.', 149.99, 20, 'https://example.com/images/product9.jpg', 'appliances'],
    ['Bookshelf', '5-tier wooden bookshelf.', 199.99, 10, 'https://example.com/images/product10.jpg', 'furniture']
  ];

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO products (title, description, price, stock, image_url, category) VALUES ?';
    connection.query(sql, [products], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function insertUsers() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const users = [
    ['Admin User', 'adminuser', 'admin@example.com', adminPassword, 'admin'],
    ['Regular User', 'regularuser', 'user@example.com', userPassword, 'customer']
  ];

  return Promise.all(users.map(user => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)';
      connection.query(sql, user, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }));
}
