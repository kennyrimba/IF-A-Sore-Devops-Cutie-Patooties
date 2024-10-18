const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // Example route: you can add more custom routes here
  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
  });

  // Default request handler for Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });

  //commit error handling
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });  

});
