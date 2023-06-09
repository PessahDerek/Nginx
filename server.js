const net = require('net');
const fs = require('fs');
const path = require('path');
const JsonDatabase = require('./Database/FileDatabase')

const db = new JsonDatabase('./Database/Data.json');

const server = net.createServer(socket => {
  socket.setEncoding('utf-8');

  socket.on('data', data => {
    const request = parseRequest(data);
    const response = handleRequest(request);
    socket.write(response);
    socket.end();
  });

  socket.on('error', err => {
    console.error('Socket error:', err);
  });
});

function parseRequest(data) {
  const lines = data.trim().split('\r\n');
  const [method, url] = lines[0].split(' ');
  const headers = parseHeaders(lines.slice(1));
  const body = lines[lines.length - 1];
  return { method, url, headers, body };
}

function parseHeaders(headerLines) {
  const headers = {};
  for (const line of headerLines) {
    const [key, value] = line.split(':');
    headers[key.trim()] = value.trim();
  }
  return headers;
}

function handleRequest(request) {
  const { method, url, headers, body } = request;

  if (method === 'GET' && url === '/hello') {
    return createResponse(200, 'text/plain', 'Hello World!');
  } else if (method === 'GET' && url === '/hi') {
    return createResponse(301, 'text/plain', '', { 'Location': '/hello' });
  } else if (method === 'GET' && (url === '/' || url.includes('index.html'))) {
    const filePath = path.join(__dirname, 'index.html');
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return createResponse(200, 'text/html; charset=utf-8', content);
    } catch (err) {
      console.error('Error loading index.html:', err);
      return createResponse(500, 'text/plain', 'Error loading index.html');
    }
  } else if (url.endsWith('.css') || url.endsWith('.js')) {
    const filePath = path.join(__dirname, url);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const contentType = url.endsWith('.css') ? 'text/css' : 'application/javascript';
      return createResponse(200, `${contentType}; charset=utf-8`, content);
    } catch (err) {
      console.error('File not found:', err);
      return createResponse(404, 'text/plain', `${url.endsWith('.css') ? 'CSS' : 'JavaScript'} file not found`);
    }
  } else if (method === 'GET' && url.startsWith('/image/')) {
    const imageName = url.split('/image/')[1];
    const imagePath = path.join(__dirname, 'image', imageName);
    try {
      const content = fs.readFileSync(imagePath);
      return createResponse(200, 'image/jpeg', content);
    } catch (err) {
      console.error('Image not found:', err);
      return createResponse(404, 'text/plain', 'Image not found');
    }
  } else if (method === 'POST' && url === '/users') {
    const user = JSON.parse(body);
    const createdUser = db.create(user);
    return createResponse(201, 'application/json', JSON.stringify(createdUser));
  } else if (method === 'GET' && url === '/users') {
    const users = db.getAll();
    return createResponse(200, 'application/json', JSON.stringify(users));
  } else if (method === 'GET' && url.startsWith('/users/')) {
    const userId = parseInt(url.split('/users/')[1]);
    const user = db.getById(userId);
    if (user) {
      return createResponse(200, 'application/json', JSON.stringify(user));
    } else {
      return createResponse(404, 'text/plain', 'User not found');
    }
  } else if (method === 'PUT' && url.startsWith('/users/')) {
    const userId = parseInt(url.split('/users/')[1]);
    const updatedUser = JSON.parse(body);
    const result = db.update(userId, updatedUser);
    if (result) {
      return createResponse(200, 'application/json', JSON.stringify(updatedUser));
    } else {
      return createResponse(404, 'text/plain', 'User not found');
    }
  } else if (method === 'DELETE' && url.startsWith('/users/')) {
    const userId = parseInt(url.split('/users/')[1]);
    const result = db.delete(userId);
    if (result) {
      return createResponse(204, '', '', { 'Content-Length': 0 });
    } else {
      return createResponse(404, 'text/plain', 'User not found');
    }
  } else {
    return createResponse(404, 'text/plain', 'Content not found');
  }
}

function createResponse(statusCode, contentType, body, headers = {}) {
  const responseHeaders = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    ...headers
  };
  const headersString = Object.entries(responseHeaders).map(([key, value]) => `${key}: ${value}`).join('\r\n');
  return `HTTP/1.1 ${statusCode}\r\n${headersString}\r\n\r\n${body}`;
}

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
