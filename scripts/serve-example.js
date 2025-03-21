#!/usr/bin/env node

/**
 * Simple HTTP server to serve the example client
 * Run with: node scripts/serve-example.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Default to serving the authentication example
  let filePath = path.join(__dirname, '../examples/client-auth-example.html');
  
  // Check if a specific file was requested
  if (req.url !== '/') {
    const requestedPath = path.join(__dirname, '../examples', req.url);
    if (fs.existsSync(requestedPath)) {
      filePath = requestedPath;
    }
  }
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found or error occurred');
      return;
    }
    
    // Determine content type
    let contentType = 'text/html';
    const ext = path.extname(filePath);
    
    switch (ext) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
    }
    
    // Send the response
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Example client server running at http://localhost:${PORT}`);
  console.log(`Open your browser to view the authentication example`);
  console.log(`Make sure the NestJS backend is also running`);
});
