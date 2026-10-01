const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const PORT = 3000;
const FILES_DIR = path.join(__dirname, 'files');

// Create files/ folder at startup if it does not exist
try {
  fs.mkdirSync(FILES_DIR, { recursive: true });
  console.log(`Files directory ready: ${FILES_DIR}`);
} catch (err) {
  console.error('Failed to create files directory:', err.message);
  process.exit(1);
}

function sendText(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain' });
  res.end(message);
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      // 1MB safety limit
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sanitizeFilename(name) {
  if (typeof name !== 'string') return null;
  name = name.trim();
  if (!name) return null;
  // Prevent path traversal: take basename only
  name = path.basename(name);
  if (name === '.' || name === '..' || !name) return null;
  // Allow only safe characters
  if (!/^[\w.\- ]+$/.test(name)) return null;
  // Disallow hidden traversal leftovers
  if (name.includes('..')) return null;
  return name;
}

function resolveFilePath(name) {
  const safe = sanitizeFilename(name);
  if (!safe) return null;
  const full = path.join(FILES_DIR, safe);
  // Ensure resolved path stays inside FILES_DIR
  if (!full.startsWith(FILES_DIR)) return null;
  return { safe, full };
}

function extractFilename(urlObj, pathname, rawBody) {
  // 1. From query string: ?filename=, ?file=, ?name=
  let name =
    urlObj.searchParams.get('filename') ||
    urlObj.searchParams.get('file') ||
    urlObj.searchParams.get('name') ||
    null;

  // 2. From REST-style path: /files/<name>, /read/<name>, /update/<name>, /delete/<name>, /create/<name>
  const parts = pathname.split('/').filter(Boolean); // remove empty
  if (!name && parts.length === 2) {
    const [resource] = parts;
    if (['files', 'read', 'update', 'delete', 'create'].includes(resource)) {
      name = decodeURIComponent(parts[1]);
    }
  }

  // 3. From JSON body: { filename | file | name }
  let content = null;
  if (rawBody) {
    const trimmed = rawBody.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawBody);
        if (!name && (parsed.filename || parsed.file || parsed.name)) {
          name = parsed.filename || parsed.file || parsed.name;
        }
        if (
          parsed.content !== undefined ||
          parsed.data !== undefined ||
          parsed.text !== undefined
        ) {
          const c = parsed.content ?? parsed.data ?? parsed.text;
          content = typeof c === 'string' ? c : String(c ?? '');
        } else if (!name) {
          content = rawBody;
        }
      } catch {
        // not JSON, treat whole body as content
        if (content === null) content = rawBody;
      }
    } else {
      content = rawBody;
    }
  }

  return { name, content };
}

const server = http.createServer(async (req, res) => {
  // Basic CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let urlObj;
  try {
    urlObj = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  } catch {
    return sendText(res, 400, 'Bad Request: invalid URL');
  }

  const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  try {
    // ---- Home / help ----
    if (pathname === '/' && method === 'GET') {
      return sendText(
        res,
        200,
        [
          'File CRUD Server running.',
          '',
          'Endpoints:',
          'POST   /create?filename=<name>            (body = file content, or JSON {filename, content})',
          'GET    /read?file=<name>  | /files/<name> | /read/<name>',
          'PUT    /update?filename=<name> | /files/<name>  (body = new content)',
          'DELETE /delete?file=<name> | /files/<name> | /delete/<name>',
          'GET    /list | /files  (list all files)',
          '',
          'Files are stored in ./files/',
        ].join('\n')
      );
    }

    // ---- LIST: GET /list, GET /files ----
    if (
      (pathname === '/list' || pathname === '/files') &&
      method === 'GET'
    ) {
      const entries = await fsp.readdir(FILES_DIR);
      // Return JSON for easy parsing; plain-text clients can still read it
      const accept = req.headers.accept || '';
      if (accept.includes('text/plain')) {
        return sendText(res, 200, entries.join('\n'));
      }
      return sendJSON(res, 200, { files: entries });
    }

    // ---- CREATE: POST /create, POST /files, POST /files/:name ----
    if (
      (pathname === '/create' ||
        pathname === '/files' ||
        pathname.startsWith('/files/') ||
        pathname.startsWith('/create/')) &&
      method === 'POST'
    ) {
      const rawBody = await getRequestBody(req);
      const { name, content } = extractFilename(urlObj, pathname, rawBody);
      if (!name) return sendText(res, 400, 'Missing filename. Provide ?filename=<name> or JSON {filename, content}.');
      const resolved = resolveFilePath(name);
      if (!resolved) return sendText(res, 400, 'Invalid filename. Use only letters, numbers, dot, underscore, hyphen.');
      const bodyContent = content ?? '';
      try {
        await fsp.access(resolved.full);
        return sendText(res, 409, `File already exists: ${resolved.safe}`);
      } catch {
        // does not exist -> good, continue
      }
      await fsp.writeFile(resolved.full, bodyContent, 'utf8');
      res.writeHead(201, { 'Content-Type': 'text/plain' });
      return res.end(`File created: ${resolved.safe}`);
    }

    // ---- READ: GET /read, GET /read/:name, GET /files/:name ----
    if (
      (pathname === '/read' ||
        pathname.startsWith('/read/') ||
        pathname.startsWith('/files/')) &&
      method === 'GET'
    ) {
      const { name } = extractFilename(urlObj, pathname, null);
      if (!name) return sendText(res, 400, 'Missing filename. Use /read?file=<name> or /files/<name>.');
      const resolved = resolveFilePath(name);
      if (!resolved) return sendText(res, 400, 'Invalid filename.');
      try {
        const data = await fsp.readFile(resolved.full, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end(data);
      } catch {
        return sendText(res, 404, `File not found: ${name}`);
      }
    }

    // ---- UPDATE: PUT/PATCH /update, /update/:name, /files/:name ----
    if (
      (pathname === '/update' ||
        pathname.startsWith('/update/') ||
        pathname.startsWith('/files/')) &&
      (method === 'PUT' || method === 'PATCH')
    ) {
      const rawBody = await getRequestBody(req);
      const { name, content } = extractFilename(urlObj, pathname, rawBody);
      if (!name) return sendText(res, 400, 'Missing filename. Provide ?filename=<name> or JSON {filename, content}.');
      const resolved = resolveFilePath(name);
      if (!resolved) return sendText(res, 400, 'Invalid filename. Use only letters, numbers, dot, underscore, hyphen.');
      try {
        await fsp.access(resolved.full);
      } catch {
        return sendText(res, 404, `File not found: ${resolved.safe}`);
      }
      await fsp.writeFile(resolved.full, content ?? '', 'utf8');
      return sendText(res, 200, `File updated: ${resolved.safe}`);
    }

    // ---- DELETE: DELETE /delete, /delete/:name, /files/:name ----
    if (
      (pathname === '/delete' ||
        pathname.startsWith('/delete/') ||
        pathname.startsWith('/files/')) &&
      method === 'DELETE'
    ) {
      const { name } = extractFilename(urlObj, pathname, null);
      if (!name) return sendText(res, 400, 'Missing filename. Use /delete?file=<name> or /files/<name>.');
      const resolved = resolveFilePath(name);
      if (!resolved) return sendText(res, 400, 'Invalid filename.');
      try {
        await fsp.unlink(resolved.full);
        return sendText(res, 200, `File deleted: ${resolved.safe}`);
      } catch {
        return sendText(res, 404, `File not found: ${name}`);
      }
    }

    // ---- Fallback for wrong method on known paths ----
    const knownPaths = ['/create', '/read', '/update', '/delete', '/list', '/files'];
    const isKnown =
      knownPaths.includes(pathname) ||
      ['/files/', '/read/', '/update/', '/delete/', '/create/'].some((p) =>
        pathname.startsWith(p)
      );
    if (isKnown) {
      return sendText(res, 405, `Method ${method} not allowed for ${pathname}`);
    }

    return sendText(res, 404, 'Not Found');
  } catch (err) {
    console.error(err);
    return sendText(res, 500, 'Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = server;