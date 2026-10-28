const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'coffee_roastery.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Menu items table
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      origin TEXT,
      notes TEXT
    )
  `);

  // Single origin beans table
  db.run(`
    CREATE TABLE IF NOT EXISTS beans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      origin TEXT NOT NULL,
      altitude TEXT,
      process TEXT,
      roast_level TEXT,
      tasting_notes TEXT,
      price INTEGER NOT NULL,
      weight TEXT DEFAULT '250g'
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      items TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reservations table
  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      reservation_type TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Subscribers table
  db.run(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contact messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Menu Items if empty
  db.get(`SELECT COUNT(*) as count FROM menu_items`, (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO menu_items (name, category, description, price, origin, notes) VALUES (?, ?, ?, ?, ?, ?)`);
      const sampleMenu = [
        ['Yirgacheffe Chelbessa V60', 'manual-brew', 'Bergamot tea-like, jasmine floral aroma with peach nectar finish.', 850, 'Gedeo Zone, Ethiopia', 'Washed Process • 2,100m'],
        ['Geisha Anaerobic Natural', 'manual-brew', 'Wild raspberry, candied papaya, lemon verbena acidity.', 1250, 'Huila, Colombia', 'Anaerobic 96hr • 1,950m'],
        ['Cortado (Dual Shot)', 'espresso', 'Equal parts calibrated double espresso & silky micro-textured whole milk.', 650, 'House Blend', 'Medium Dark Roast'],
        ['Bahawalpur Date Oat Flat White', 'espresso', 'Organic local dates infusion paired with Swedish oat milk espresso.', 780, 'Custom Signature', 'Local Special'],
        ['Kyoto Style Cold Drip (12hr)', 'cold-brew', 'Slow 12-hour Dutch drip extraction with dark chocolate & plum notes.', 750, 'Sumatra Gayo', 'Washed Triple Picked']
      ];
      sampleMenu.forEach(item => stmt.run(item));
      stmt.finalize();
    }
  });

  // Seed Beans if empty
  db.get(`SELECT COUNT(*) as count FROM beans`, (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO beans (name, origin, altitude, process, roast_level, tasting_notes, price, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      const sampleBeans = [
        ['Ethiopia Yirgacheffe Worka Sakaro', 'Yirgacheffe, Ethiopia', '2,000 - 2,200m', 'Washed', 'Light Roast', 'Jasmine, Bergamot, Nectarine', 2450, '250g'],
        ['Colombia Pink Bourbon Huila', 'Huila, Colombia', '1,800 - 2,000m', 'Anaerobic Natural', 'Medium-Light Roast', 'Pink Guava, Passionfruit, Honey', 2850, '250g'],
        ['Guatemala Huehuetenango Finca La Bolsa', 'Huehuetenango, Guatemala', '1,600 - 1,800m', 'Washed', 'Medium Roast', 'Dark Chocolate, Almond, Red Apple', 2250, '250g'],
        ['Kenya Nyeri Peaberry AA', 'Nyeri, Kenya', '1,750 - 1,900m', 'Washed', 'Light-Medium Roast', 'Blackcurrant, Grapefruit, Caramel', 2650, '250g']
      ];
      sampleBeans.forEach(bean => stmt.run(bean));
      stmt.finalize();
    }
  });
});

module.exports = db;
