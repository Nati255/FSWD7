import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'natan123',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
  
  const sql = `DROP DATABASE IF EXISTS ecommerce;`;

  connection.query(sql, (err) => {
    if (err) throw err;
    console.log('Database ecommerce deleted!');
    connection.end();
  });
});
