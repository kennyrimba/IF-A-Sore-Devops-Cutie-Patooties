const express = require('express');
const next = require('next');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

// Initialize SQLite database
const dbPath = path.join(__dirname, 'src', 'db', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    const sqlPath = path.join(__dirname, 'src', 'db', 'statements.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf-8');

    db.exec(sqlScript, (err) => {
      if (err) {
        console.error('Error executing SQL script', err.message);
      } else {
        console.log('Database setup complete.');
      }
    });
  }
});

app.prepare().then(() => {
  const server = express();
  server.use(express.json()); // To parse JSON request bodies

  // Example route: you can add more custom routes here
  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
  });

  // // Rute API: Ambil semua produk dari SQLite
  // server.get('/api/user', (req, res) => {
  //   const sql = 'SELECT * FROM user';
  //   db.all(sql, [], (err, rows) => {
  //     if (err) {
  //       return res.status(500).json({ error: err.message });
  //     }
  //     res.status(200).json({ data: rows });
  //   });
  // });

  // Register endpoint
  server.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const sql = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
    db.run(sql, [username, email, hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating user' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
  });

  // Route untuk login
  server.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    // Cek apakah pengguna ada di database
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.get(sql, [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(400).json({ error: 'Pengguna tidak ditemukan' });
      }

      // Cek apakah password cocok
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Password salah' });
      }

      // Jika berhasil login, kirimkan data pengguna (bisa juga token JWT)
      res.status(200).json({ message: 'Login berhasil', username: user.username });
    });
  });

  // Route to add a new product
  server.post('/api/add-product', (req, res) => {
    const newProduct = req.body;

    // Adjust the file path to match the location of product.json
    const filePath = path.join(__dirname, 'src', 'data', 'product.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read products' });
      }

      const products = JSON.parse(data);
      // Add a unique ID (you might want to implement a better ID generation method)
      newProduct.id = (products.length + 1).toString();
      products.push(newProduct);

      // Write updated products back to file
      fs.writeFile(filePath, JSON.stringify(products, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to save product' });
        }
        res.status(201).json(newProduct);
      });
    });
  });

  // Checkout endpoint
  server.post('/api/checkout', (req, res) => {
    const { cartItems, shippingInfo, paymentInfo, discount, shippingFee, userId } = req.body;

    // Validate required fields
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    if (!userId || !shippingInfo || !paymentInfo) {
      return res.status(400).json({ error: 'Missing required checkout information' });
    }

    // Process payment (example only, integrate real payment processing logic)
    const paymentProcessed = true; // simulate payment success

    if (!paymentProcessed) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Calculate the total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) - (discount || 0) + (shippingFee || 0);

    // Prepare shipping details
    const shippingDetails = {
      firstName: shippingInfo.first_name,
      lastName: shippingInfo.last_name,
      email: shippingInfo.email,
      phoneNumber: shippingInfo.phone_number,
      country: shippingInfo.country,
      city: shippingInfo.city,
      streetAddress: shippingInfo.street_address,
      state: shippingInfo.state,
      postalCode: shippingInfo.postal_code,
      note: shippingInfo.note || ""
    };

    // Insert order into pending_orders
    const insertOrder = `INSERT INTO pending_orders (
    user_id, first_name, last_name, email, phone_number, country, city, street_address, state, postal_code, note, 
    is_paid, order_status, product_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Create an array of promises for inserting orders
    const insertPromises = cartItems.map(item => {
      return new Promise((resolve, reject) => {
        db.run(insertOrder, [
          userId,
          shippingDetails.firstName,
          shippingDetails.lastName,
          shippingDetails.email,
          shippingDetails.phoneNumber,
          shippingDetails.country,
          shippingDetails.city,
          shippingDetails.streetAddress,
          shippingDetails.state,
          shippingDetails.postalCode,
          shippingDetails.note,
          paymentProcessed, // Assume this is a boolean for is_paid
          'pending', // Example order status
          item.id // Assuming each item has a product_id
        ], function (err) {
          if (err) {
            return reject(err);
          }
          resolve(this.lastID); // Resolve with the ID of the last inserted order
        });
      });
    });

    // Use Promise.all to handle all insert promises
    Promise.all(insertPromises)
      .then((responses) => {
        res.status(200).json({ message: 'Checkout successful', orderIds: responses });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while saving orders' });
      });
  });

  server.post('/api/track-order', (req, res) => {
    const { orderId } = req.body;

    // Query to find the order by ID
    db.get('SELECT order_status FROM pending_orders WHERE order_id = ?', [orderId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // If order is found, return its status
      res.json({ order_status: row.order_status });
    });
  });


  // Default request handler for Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Error handling middleware
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
