const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// 1. GET /api/menu - Retrieve menu items
app.get('/api/menu', (req, res) => {
  db.all(`SELECT * FROM menu_items`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// 2. GET /api/beans - Retrieve single origin beans
app.get('/api/beans', (req, res) => {
  db.all(`SELECT * FROM beans`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// 3. POST /api/orders - Submit a new order
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, customer_email, items, total_price } = req.body;
  if (!items || !total_price) {
    return res.status(400).json({ error: 'Order items and total price are required.' });
  }

  const itemsJson = typeof items === 'object' ? JSON.stringify(items) : items;

  const stmt = db.prepare(`
    INSERT INTO orders (customer_name, customer_phone, customer_email, items, total_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run([customer_name || 'Guest', customer_phone || '', customer_email || '', itemsJson, total_price], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: this.lastID
    });
  });
  stmt.finalize();
});

// 4. POST /api/reservations - Submit table or study hub reservation
app.post('/api/reservations', (req, res) => {
  const { name, email, phone, reservation_type, date, time, guests, special_requests } = req.body;
  if (!name || !email || !phone || !date || !time) {
    return res.status(400).json({ error: 'Name, email, phone, date, and time are required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO reservations (name, email, phone, reservation_type, date, time, guests, special_requests)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([name, email, phone, reservation_type || 'Study Pod', date, time, guests || 1, special_requests || ''], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully!',
      reservationId: this.lastID
    });
  });
  stmt.finalize();
});

// 5. POST /api/subscribe - Newsletter subscription
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  const stmt = db.prepare(`INSERT INTO subscribers (email) VALUES (?)`);
  stmt.run([email], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'This email is already subscribed!' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'Subscribed to Roaster’s Gazette successfully!'
    });
  });
  stmt.finalize();
});

// 6. POST /api/contact - Submit contact message
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO contact_messages (name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run([name, email, phone || '', subject || 'General Inquiry', message], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'Your message has been received! We will respond shortly.'
    });
  });
  stmt.finalize();
});

// Fallback to index.html for undefined routes
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Coffee & Beans Roastery server running on http://localhost:${PORT}`);
});
