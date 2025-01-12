const express = require('express')
const multer = require('multer')
const next = require('next')
const fs = require('fs')
const mysql = require('mysql2')
const path = require('path')
const bcrypt = require('bcrypt')
const promClient = require('prom-client')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = process.env.PORT || 3000
/* eslint-disable camelcase */
// Configure storage with custom filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images', 'product'))
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, extension)
    const timestamp = Date.now()
    cb(null, `${baseName}-${timestamp}${extension}`)
  }
})

const upload = multer({ storage })

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST, // From ConfigMap
  user: process.env.MYSQL_USER, // From ConfigMap
  password: process.env.MYSQL_PASSWORD, // From Secret
  database: process.env.MYSQL_DB_NAME// From ConfigMap
})

function connectWithRetry(maxAttempts = 5, delay = 5000) {
  let attempts = 0;

  const tryConnect = () => {
    attempts++;
    console.log(`Attempting to connect to MySQL (Attempt ${attempts}/${maxAttempts})...`);

    db.connect((err) => {
      if (err) {
        console.error(`Error connecting to MySQL database (Attempt ${attempts}):`, err.message);
        if (attempts < maxAttempts) {
          console.log(`Retrying in ${delay / 1000} seconds...`);
          setTimeout(tryConnect, delay);
        } else {
          console.error('Max connection attempts reached. Starting server anyway...');
          // Continue with server startup even if database isn't connected
          startServer();
        }
      } else {
        console.log('Successfully connected to MySQL database.');
        startServer();
      }
    });
  };

  tryConnect();
}

connectWithRetry()

function startServer() {
  app.prepare().then(() => {
    const server = express();
    server.use(express.json())// To parse JSON request bodies

    const register = new promClient.Registry()
    promClient.collectDefaultMetrics({ register })

    const httpRequestDurationMicroseconds = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5]
    })

    const activeConnections = new promClient.Gauge({
      name: 'nodejs_active_connections',
      help: 'Number of active connections'
    })

    const orderTotalCounter = new promClient.Counter({
      name: 'ecommerce_orders_total',
      help: 'Total number of orders processed'
    })

    register.registerMetric(httpRequestDurationMicroseconds);
    register.registerMetric(activeConnections);
    register.registerMetric(orderTotalCounter);

    // Add this to your server.js after creating the express app
    server.get('/metrics', async (req, res) => {
      try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
      } catch (err) {
        res.status(500).end(err);
      }
    })

    // Middleware to measure request duration
    server.use((req, res, next) => {
      const start = Date.now()
      res.on('finish', () => {
        const duration = Date.now() - start;
        httpRequestDurationMicroseconds
          .labels(req.method, req.route?.path || req.path, res.statusCode)
          .observe(duration / 1000); // Convert to seconds
      })
      next()
    })

    const errorCounter = new promClient.Counter({
      name: 'application_errors_total',
      help: 'Total number of application errors',
      labelNames: ['type']
    });
    register.registerMetric(errorCounter);

    // Example route: add more custom routes here
    server.get('/api/hello', (req, res) => {
      res.json({ message: 'Hello from Express!' })
    })

    // Register endpoint
    server.post('/api/register', async (req, res) => {
      const { username, email, password } = req.body
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' })
      }
      try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const sql = 'INSERT INTO users (username, email, pword) VALUES (?, ?, ?)'
        db.query(sql, [username, email, hashedPassword], function (err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' })
          }
          res.status(201).json({ message: 'User registered successfully', userId: this.lastID })
        })
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
      }
    })

    // Login route
    server.post('/api/login', async (req, res) => {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }
      const sql = 'SELECT * FROM users WHERE email = ?'
      db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Internal server error' })

        // results is an array - get the first user
        const user = results[0]
        if (!user) return res.status(400).json({ error: 'User not found' })

        try {
          const isPasswordValid = await bcrypt.compare(password, user.pword)
          if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' })

          res.status(200).json({
            message: 'Login successful',
            email: user.email,
            user_id: user.id,
            username: user.username // Also sending username for display
          })
        } catch (error) {
          console.error('Password comparison error:', error)
          res.status(500).json({ error: 'Error validating password' })
        }
      })
    })

    // Add product with image upload
    server.post('/api/add-product', upload.array('images', 10), (req, res) => {
      try {
        if (!req.body.product) {
          return res.status(400).json({ error: 'Product data is missing' })
        }
        const newProduct = JSON.parse(req.body.product)
        const imagePaths = req.files.map(file => `/images/product/${file.filename}`)
        newProduct.variation = [{ color: 'blue', colorCode: '#1F1F1F', colorImage: imagePaths[0], image: imagePaths[0] }]
        newProduct.thumbImage = [imagePaths[0], imagePaths[0]]
        newProduct.images = imagePaths

        const filePath = path.join(__dirname, 'src', 'data', 'Product.json')
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) return res.status(500).json({ error: filePath })
          const products = JSON.parse(data)
          newProduct.id = (products.length + 1).toString()
          products.push(newProduct)
          fs.writeFile(filePath, JSON.stringify(products, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Failed to save product.' })
            res.status(201).json(newProduct)
          })
        })
      } catch (error) {
        console.error('Error parsing product data:', error)
        res.status(500).json({ error: 'Internal server error.' })
      }
    })

    // Fetch products
    server.get('/practice/get-products', (req, res) => {
      const sql = 'SELECT * FROM order_status'
      db.query(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' })
        if (rows.length === 0) return res.status(404).json({ message: 'No orders found' })
        res.json(rows)
      })
    })

    // Fetch users and their orders
    server.get('/practice/get-user-with-products', (req, res) => {
      const sql = `
      SELECT users.id AS user_id, users.username, users.email, order_status.order_id, 
             order_status.order_status, order_status.order_date, order_status.product_id
      FROM users LEFT JOIN order_status ON users.id = order_status.user_id
    `
      db.query(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' })
        if (rows.length === 0) return res.status(404).json({ message: 'No users or orders found' })
        const userOrders = rows.reduce((acc, row) => {
          const { user_id, username, email, order_id, order_status, order_date, product_id } = row
          if (!acc[user_id]) acc[user_id] = { user_id, username, email, orders: [] }
          if (order_id) acc[user_id].orders.push({ order_id, order_status, order_date, product_id })
          return acc
        }, {})
        res.json(Object.values(userOrders))
      })
    })

    // Checkout endpoint
    server.post('/api/checkout', (req, res) => {
      const { cartItems, shippingInfo, paymentInfo, userId } = req.body
      if (!userId || !cartItems || !shippingInfo || !paymentInfo) {
        return res.status(400).json({ error: 'Required fields are missing' })
      }
      const paymentProcessed = true
      const shippingDetails = { ...shippingInfo, userId }
      const insertOrder = `
      INSERT INTO order_status (user_id, first_name, last_name, email, phone_number, country, city, 
                                street_address, province, postal_code, note, is_paid, order_status, product_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      const insertPromises = cartItems.map(item => new Promise((resolve, reject) => {
        db.query(insertOrder, [
          userId, shippingDetails.first_name, shippingDetails.last_name, shippingDetails.email, shippingDetails.phone_number,
          shippingDetails.country, shippingDetails.city, shippingDetails.street_address, shippingDetails.state,
          shippingDetails.postal_code, shippingDetails.note, paymentProcessed, 'pending', item.id
        ], function (err) {
          if (err) reject(err)
          resolve(this.lastID)
        })
      }))
      Promise.all(insertPromises)
        .then(orderIds => {
          orderTotalCounter.inc(); // Increment order counter
          res.status(200).json({ message: 'Checkout successful', orderIds })
        })
        .catch(error => {
          console.log('Error during checkout:', error);
          res.status(500).json({ error: 'An error occurred while saving orders' })
        })
    })

    // Track order endpoint
    server.post('/api/track-order', (req, res) => {
      const { orderId, userId } = req.body
      db.query('SELECT * FROM order_status WHERE order_id = ? AND user_id = ?', [orderId, userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Internal server error' })
        if (!row) return res.status(403).json({ error: 'Unauthorized access' })
        res.json(row)
      })
    })

    // Get orders for a user
    server.get('/api/get-orders', (req, res) => {
      const { user_id } = req.query
      if (!user_id) return res.status(401).json({ error: 'User not logged in or invalid user_id' })
      db.query('SELECT * FROM order_status WHERE user_id = ?', [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' })
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'No orders found' })
        res.json(rows)
      })
    })
    /* eslint-enable camelcase */
    // Default handler for Next.js
    server.all('*', (req, res) => handle(req, res))

    // Error handling middleware
    server.use((err, req, res, next) => {
      console.error(err.stack)
      res.status(500).send('Something broke!')
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://0.0.0.0:${port}`)
    })
  })
}
