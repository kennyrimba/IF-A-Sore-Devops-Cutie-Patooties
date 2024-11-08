const express = require('express')
const multer = require('multer')
const next = require('next')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcrypt')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = process.env.PORT || 3000

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

// Initialize SQLite database
const dbPath = path.join(__dirname, 'src', 'db', 'database.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message)
  } else {
    console.log('Connected to the SQLite database.')

    const sqlPath = path.join(__dirname, 'src', 'db', 'statements.sql')
    try {
      const sqlScript = fs.readFileSync(sqlPath, 'utf-8')
      db.exec(sqlScript, (err) => {
        if (err) {
          console.error('Error executing SQL script', err.message)
        } else {
          console.log('Database setup complete.')
        }
      })
    } catch (err) {
      console.error('Error reading SQL file:', err.message)
    }
  }
})

app.prepare().then(() => {
  const server = express()
  server.use(express.json()) // To parse JSON request bodies

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
      db.run(sql, [username, email, hashedPassword], function (err) {
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
    db.get(sql, [email], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Internal server error' })
      if (!user) return res.status(400).json({ error: 'User not found' })
      const isPasswordValid = await bcrypt.compare(password, user.pword)
      if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' })
      res.status(200).json({ message: 'Login successful', email: user.email, user_id: user.id })
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

      const filePath = path.join(__dirname, 'src', 'data', 'product.json')
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read products file.' })
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
    db.all(sql, [], (err, rows) => {
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
    db.all(sql, [], (err, rows) => {
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
      db.run(insertOrder, [
        userId, shippingDetails.first_name, shippingDetails.last_name, shippingDetails.email, shippingDetails.phone_number,
        shippingDetails.country, shippingDetails.city, shippingDetails.street_address, shippingDetails.state,
        shippingDetails.postal_code, shippingDetails.note, paymentProcessed, 'pending', item.id
      ], function (err) {
        if (err) reject(err)
        resolve(this.lastID)
      })
    }))
    Promise.all(insertPromises)
      .then(orderIds => res.status(200).json({ message: 'Checkout successful', orderIds }))
      .catch(error => res.status(500).json({ error: 'An error occurred while saving orders' }))
  })

  // Track order endpoint
  server.post('/api/track-order', (req, res) => {
    const { orderId, userId } = req.body
    db.get('SELECT * FROM order_status WHERE order_id = ? AND user_id = ?', [orderId, userId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Internal server error' })
      if (!row) return res.status(403).json({ error: 'Unauthorized access' })
      res.json(row)
    })
  })

  // Get orders for a user
  server.get('/api/get-orders', (req, res) => {
    const { user_id } = req.query
    if (!user_id) return res.status(401).json({ error: 'User not logged in or invalid user_id' })
    db.all('SELECT * FROM order_status WHERE user_id = ?', [user_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Internal server error' })
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'No orders found' })
      res.json(rows)
    })
  })

  // Default handler for Next.js
  server.all('*', (req, res) => handle(req, res))

  // Error handling middleware
  server.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
