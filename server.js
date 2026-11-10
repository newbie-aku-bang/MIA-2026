const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = __dirname;
const STATIC_ROOT = path.join(ROOT, 'react');
const MAP_ROOT = path.join(ROOT, 'map aksiwarga');
const ACCOUNTS_FILE = path.join(ROOT, 'data', 'accounts.json');
const PORT = Number(process.env.PORT) || 3000;
const SESSION_COOKIE = 'aksiwarga_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const sessions = new Map();
const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};

function sendJson(response, status, body, headers = {}) {
    response.writeHead(status, { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', ...headers });
    response.end(JSON.stringify(body));
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        let bodyTooLarge = false;
        request.on('data', (chunk) => {
            if (bodyTooLarge) return;
            body += chunk;
            if (Buffer.byteLength(body) > 16 * 1024) {
                bodyTooLarge = true;
                reject(Object.assign(new Error('Permintaan terlalu besar.'), { status: 413 }));
            }
        });
        request.on('end', () => {
            if (bodyTooLarge) return;
            try {
                resolve(JSON.parse(body || '{}'));
            } catch {
                reject(Object.assign(new Error('Format data tidak valid.'), { status: 400 }));
            }
        });
        request.on('error', reject);
    });
}

function readAccounts() {
    const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
    if (!data || !Array.isArray(data.users)) throw new Error('Berkas akun memiliki format yang tidak valid.');
    return data.users;
}

function writeAccounts(users) {
    const tempFile = `${ACCOUNTS_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, `${JSON.stringify({ users }, null, 2)}\n`, { mode: 0o600 });
    fs.renameSync(tempFile, ACCOUNTS_FILE);
}

function publicUser(account) {
    return { name: account.name, email: account.email };
}

function setSession(response, account, remember = true) {
    const token = crypto.randomBytes(32).toString('hex');
    const maxAge = remember ? SESSION_TTL_MS : 24 * 60 * 60 * 1000;
    sessions.set(token, { email: account.email, expiresAt: Date.now() + maxAge });
    response.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(maxAge / 1000)}`);
}

function sessionUser(request) {
    const cookie = (request.headers.cookie || '').split(';').map((part) => part.trim())
        .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
    if (!cookie) return null;

    const token = cookie.slice(SESSION_COOKIE.length + 1);
    const session = sessions.get(token);
    if (!session) return null;
    if (session.expiresAt <= Date.now()) {
        sessions.delete(token);
        return null;
    }

    const account = readAccounts().find((item) => item.email === session.email);
    return account ? { token, account } : null;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleApi(request, response, url) {
    if (request.method === 'GET' && url.pathname === '/api/auth/me') {
        const session = sessionUser(request);
        return sendJson(response, 200, { user: session ? publicUser(session.account) : null });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
        const body = await readJsonBody(request);
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';

        if (name.length < 3) return sendJson(response, 400, { error: 'Nama lengkap minimal 3 karakter.' });
        if (!isValidEmail(email)) return sendJson(response, 400, { error: 'Masukkan alamat email yang valid.' });
        if (password.length < 8) return sendJson(response, 400, { error: 'Kata sandi minimal 8 karakter.' });

        const users = readAccounts();
        if (users.some((account) => account.email === email)) {
            return sendJson(response, 409, { error: 'Email tersebut sudah terdaftar. Silakan masuk.' });
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
        const account = { name, email, passwordSalt: salt, passwordHash };
        writeAccounts([...users, account]);
        setSession(response, account);
        return sendJson(response, 201, { ok: true, user: publicUser(account) });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
        const body = await readJsonBody(request);
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const account = readAccounts().find((item) => item.email === email);
        const candidateHash = account
            ? crypto.pbkdf2Sync(password, account.passwordSalt, 120000, 32, 'sha256')
            : Buffer.alloc(32);
        const storedHash = account ? Buffer.from(account.passwordHash, 'hex') : Buffer.alloc(32);
        const passwordMatches = crypto.timingSafeEqual(candidateHash, storedHash);

        if (!account || !passwordMatches) {
            return sendJson(response, 401, { error: 'Email atau kata sandi salah. Periksa kembali lalu coba lagi.' });
        }

        setSession(response, account, body.remember !== false);
        return sendJson(response, 200, { ok: true, user: publicUser(account) });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
        const session = sessionUser(request);
        if (session) sessions.delete(session.token);
        response.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
        return sendJson(response, 200, { ok: true });
    }

    return sendJson(response, 404, { error: 'Endpoint tidak ditemukan.' });
}

function serveStatic(request, response, url) {
    let pathname;
    try {
        pathname = decodeURIComponent(url.pathname);
    } catch {
        response.writeHead(400);
        response.end('URL tidak valid.');
        return;
    }

    const mapPrefix = '/map aksiwarga';
    const isAsset = pathname.startsWith('/asset/');
    const isMap = pathname === mapPrefix || pathname.startsWith(`${mapPrefix}/`);
    const basePath = isAsset ? path.join(ROOT, 'asset') : isMap ? MAP_ROOT : STATIC_ROOT;
    const requestedPath = isAsset
        ? pathname.slice('/asset/'.length)
        : isMap
            ? pathname.slice(mapPrefix.length).replace(/^[/\\]+/, '') || 'index.html'
            : pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
    let filePath = path.resolve(basePath, requestedPath);
    if (filePath !== basePath && !filePath.startsWith(`${basePath}${path.sep}`)) {
        response.writeHead(403);
        response.end('Akses ditolak.');
        return;
    }

    if (!path.extname(filePath) && !fs.existsSync(filePath)) filePath = path.join(STATIC_ROOT, 'index.html');
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404);
        response.end('Halaman tidak ditemukan.');
        return;
    }

    response.writeHead(200, {
        'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
        try {
            await handleApi(request, response, url);
        } catch (error) {
            if (response.headersSent || response.destroyed) return;
            const status = Number.isInteger(error.status) ? error.status : 500;
            if (status >= 500) console.error('Kesalahan API:', error);
            sendJson(response, status, { error: status === 500 ? 'Terjadi kesalahan server.' : error.message });
        }
        return;
    }
    serveStatic(request, response, url);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`AksiWarga berjalan di http://127.0.0.1:${PORT}`);
});
