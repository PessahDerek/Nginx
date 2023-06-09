const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'GET' && url === '/hello') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    res.end('Hello World!');
  } else if (method === 'GET' && url === '/hi') {
    res.writeHead(301, { 'Location': '/hello', 'Content-Length': 0, 'X-Content-Type-Options': 'nosniff' });
    res.end();
  } else if (method === 'GET' && (url === '/' || url.includes('index.html'))) {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(content), 'X-Content-Type-Options': 'nosniff' });
        res.end(content);
      }
    });
  } else if (url.endsWith('.css') || url.endsWith('.js')) {
    const filePath = path.join(__dirname, url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
        res.end(`${url.endsWith('.css') ? 'CSS' : 'JavaScript'} file not found`);
      } else {
        res.writeHead(200, { 'Content-Type': `${url.endsWith('.css') ? 'text/css' : 'application/javascript'}; charset=utf-8`, 'Content-Length': Buffer.byteLength(content), 'X-Content-Type-Options': 'nosniff' });
        res.end(content);
      }
    });
  } else if (method === 'GET' && url.startsWith('/image/')) {
    const imageName = url.split('/image/')[1];
    const imagePath = path.join(__dirname, 'image', imageName);
    fs.readFile(imagePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
        res.end('Image not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': content.length, 'X-Content-Type-Options': 'nosniff' });
        res.end(content);
      }
    });
  } 
//   REST APIs
  else if(method === 'GET'){
    if(/users/g.test(url)){
        console.log('users...', url.split('/users/'))
    }
  }
  
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    res.end('Content not found');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
