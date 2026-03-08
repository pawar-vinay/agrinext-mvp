// Simple static file server for AgriNext web app
const express = require('express');
const path = require('path');
const app = express();
const PORT = 5173;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AgriNext web app running on http://0.0.0.0:${PORT}`);
});
