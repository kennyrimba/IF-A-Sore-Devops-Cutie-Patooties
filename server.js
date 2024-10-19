const express = require('express');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  server.use(express.json()); // To parse JSON request bodies

  // Example route: you can add more custom routes here
  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
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
