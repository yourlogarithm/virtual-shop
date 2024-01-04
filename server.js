const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

const dbConfig = {
    connectionLimit: 10, host: 'localhost', user: 'newuser', password: 'password', database: 'vshop'
};
const pool = mysql.createPool(dbConfig);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/view/:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    try {
        const [rows] = await pool.query('SELECT * FROM ??', [tableName]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/sell', async (req, res) => {
    const { cardNo, pid, qty, ts } = req.body;
    console.log(req.body);

    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Got connection from the pool');
        
        await connection.beginTransaction();
        console.log('Transaction started');
        
        const [stocks] = await connection.query('SELECT stock FROM products WHERE pid = ?', [pid]);
        if (stocks.length === 0) throw new Error('Product not found');
        const currentStock = stocks[0].stock;
        if (qty > currentStock) throw new Error('Insufficient stock');
        
        await connection.query('CALL SellProducts(?, ?, ?, ?)', [cardNo, pid, qty, ts]);
        await connection.query('UPDATE products SET stock = stock - ? WHERE pid = ?', [qty, pid]);
        
        await connection.commit();
        console.log('Transaction committed');
        res.send('Sale recorded successfully!');
    } catch (error) {
        console.log('Transaction rolled back: ' + error.message);
        
        if (connection) await connection.rollback();
        res.status(500).send(error.message);
    } finally {
        
        if (connection) connection.release();
    }
});

app.get('/purchases/:cardNo', async (req, res) => {
    const { cardNo } = req.params;
    const query = `
        SELECT
            c.card_no, 
            c.lname AS last_name, 
            c.fname AS first_name, 
            p.pname AS product, 
            s.qty AS qty, 
            (s.qty * p.uprice) AS total
        FROM sales s
        JOIN clients c ON s.card_no = c.card_no
        JOIN products p ON s.pid = p.pid
        WHERE s.card_no = ?
    `;
    try {
        const [results] = await pool.query(query, [cardNo]);
        console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching purchases');
    }
});

app.get('/products-under-warranty', async (req, res) => {
    const query = `
        SELECT products.pid, pname, DATE_ADD(ts, INTERVAL warranty YEAR) AS exp_date 
        FROM sales 
        JOIN products ON sales.pid = products.pid 
        WHERE DATE_ADD(ts, INTERVAL warranty YEAR) > NOW()
    `;

    try {
        const [results] = await pool.query(query);
        console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching products under warranty: ' + error.message);
    }
});

app.get('/most-sold-product', async (req, res) => {
    const query = `
        SELECT products.pid, pname, SUM(qty) as total_sold 
        FROM sales 
        JOIN products ON sales.pid = products.pid
        GROUP BY pid ORDER BY total_sold DESC LIMIT 1
    `;
    
    try {
        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error finding the most sold product');
    }
});

app.get('/date-most-sales', async (req, res) => {
    const query = `SELECT ts AS sale_date, COUNT(*) as number_of_sales 
    FROM sales GROUP BY sale_date ORDER BY number_of_sales DESC LIMIT 1`;
    
    try { 
        const [results] = await pool.query(query);
        res.status(200).json(results[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error finding the date with the most sales');
    }
});

app.get('/top-client', async (req, res) => {
    const query = `
        SELECT 
            c.lname AS last_name, 
            c.fname AS first_name, 
            SUM(s.qty) AS total_products, 
            SUM(s.qty * p.uprice) AS total_value 
        FROM sales s
        JOIN clients c ON s.card_no = c.card_no
        JOIN products p ON s.pid = p.pid
        GROUP BY s.card_no, c.lname, c.fname
        ORDER BY total_products DESC 
        LIMIT 1
    `;
    
    try {
        const [results] = await pool.query(query);
        res.status(200).json(results[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error finding the top client');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
