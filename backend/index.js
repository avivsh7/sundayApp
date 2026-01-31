require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.POSTGRES_PASSWORD, 
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const initDb = async () => {
  try {
    console.log(`Attempting to connect to DB at ${process.env.DB_HOST || 'localhost'}...`);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(50),
        product_name VARCHAR(100),
        amount INTEGER
      );
    `);
    console.log("Database table 'products' initialized.");
  } catch (err) {
    console.error("DB Init Error Details:", err);
  }
};
initDb();

// Database Health Check for Frontend Animation
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'connected' });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ status: 'disconnected' });
  }
});

app.get('/getAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete('/delete/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE product_name = $1 RETURNING *', 
      [name]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No products found with the name: ${name}` 
      });
    }

    res.json({ 
      success: true, 
      message: `All products named "${name}" were deleted`, 
      deletedCount: result.rowCount,
      deletedItems: result.rows 
    });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/write', async (req, res) => {
  const { userName, product_name, amount } = req.body; // שים לב שהשתמשתי ב-userName מה-body
  try {
    const result = await pool.query(
      'INSERT INTO products (user_name, product_name, amount) VALUES ($1, $2, $3) RETURNING *',
      [userName, product_name, amount]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/get_product_amount/:name', async (req, res) => {
  try {
    const result = await pool.query('SELECT SUM(amount) FROM products WHERE product_name = $1', [req.params.name]);
    res.json({ amount: result.rows[0].sum || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});