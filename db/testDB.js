import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'natan123',
  database: 'ecommerce'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to ecommerce DB');

  const queries = [
    { table: 'users', sql: 'SELECT * FROM users LIMIT 5' },
    { table: 'products', sql: 'SELECT * FROM products' },
    { table: 'orders', sql: 'SELECT * FROM orders' },
    { table: 'order_items', sql: 'SELECT * FROM order_items' },
    { table: 'cart_items', sql: 'SELECT * FROM cart_items' },
  ];

  let completed = 0;

  queries.forEach(({ table, sql }) => {
    connection.query(sql, (err, results) => {
      if (err) {
        console.error(` Error reading from ${table}:`, err.message);
      } else {
        console.log(`\n Data from '${table}':`);
        console.table(results);
      }

      completed++;
      if (completed === queries.length) {
        connection.end();
      }
    });
  });
});
