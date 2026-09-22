/*
const http = require('http');

const server = http.createServer((req,res) => {
    res.statusCode=200;
    res.setHeader('content-type','text/plain');
    res.end('Hello world');
});

server.listen(3000,() => {
    console.log('Server running on port 3000');
})
*/

const http = require('http');
const url = require('url');

let PORT = 3000;

const server = http.createServer((req, res) => {
    // 1. Parse the URL to separate path and query parameters
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`Request received: ${req.method} ${path}`);

    // ROUTE 1: Home page
    if (path === '/' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Welcome! Try /greet?name=Harshita or /headers or POST to /data');
    }
    // ROUTE 2: Query parameters
    else if (path === '/greet' && req.method === 'GET') {
        const name = query.name || 'Guest';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Hello, ${name}! Welcome to the server.`);
    }
    // ROUTE 3: Show request headers
    else if (path === '/headers' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(req.headers, null, 2));
    }
    // ROUTE 4: Handle POST data
    else if (path === '/data' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                message: 'Data received successfully',
                yourData: body
            }));
        });
    }
    // ROUTE 5: Custom status code demo
    else if (path === '/error') {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Simulated server error (500)');
    }
    // DEFAULT: Route not found
    else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Page Not Found');
    }
});

// Auto-switch to port 3001 if port 3000 is currently busy
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
        PORT += 1;
        server.listen(PORT);
    } else {
        console.error(err);
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});