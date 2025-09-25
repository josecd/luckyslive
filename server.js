const express = require('express');
const path = require('path');

const app = express();
const port = 4200;

// Servir archivos estáticos desde apps/frontend/src
app.use(express.static(path.join(__dirname, 'apps/frontend/src')));

// Ruta principal - ruleta
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps/frontend/src/index.html'));
});

// Ruta de admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps/frontend/src/admin.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`);
  console.log(`Admin panel available at http://localhost:${port}/admin`);
});