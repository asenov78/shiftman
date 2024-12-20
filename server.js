const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-body');
const jwt = require('koa-jwt');
const helmet = require('koa-helmet');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const pino = require('pino');
const otplib = require('otplib');
const argon2 = require('argon2');

const app = new Koa();
const router = new Router();
const db = new Database(':memory:');

// Logging
const logger = pino();

// Middleware
app.use(helmet());
app.use(bodyParser());
app.use(jwt({ secret: 'secret_key' }).unless({ path: [/^\/auth/] }));

// Database setup
db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT, department TEXT, email TEXT, phone TEXT, address TEXT, secret TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)').run();
db.prepare('CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)').run();
db.prepare('CREATE TABLE IF NOT EXISTS shifts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, start_time DATETIME, end_time DATETIME)').run();
db.prepare('CREATE TABLE IF NOT EXISTS refresh_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, token TEXT UNIQUE)').run();
db.prepare('CREATE TABLE IF NOT EXISTS permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, permission TEXT)').run();

// Routes
router.post('/auth/register', async (ctx) => {
  const { username, password, role, department, email, phone, address } = ctx.request.body;
  const hashedPassword = await argon2.hash(password);
  const secret = otplib.authenticator.generateSecret();
  const stmt = db.prepare('INSERT INTO users (username, password, role, department, email, phone, address, secret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const result = stmt.run(username, hashedPassword, role, department, email, phone, address, secret);
  ctx.status = 201;
  ctx.body = { message: 'User registered successfully', userId: result.lastInsertRowid, secret };
});

router.post('/auth/login', async (ctx) => {
  const { username, password, token } = ctx.request.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    logger.error('Login attempt failed for user:', username);
    ctx.status = 400;
    ctx.body = 'Invalid username or password';
    return;
  }
  const validPassword = await argon2.verify(user.password, password);
  if (!validPassword) {
    logger.error('Login attempt failed for user:', username);
    ctx.status = 400;
    ctx.body = 'Invalid username or password';
    return;
  }
  if (token) {
    const verified = otplib.authenticator.verify({ token, secret: user.secret });
    if (!verified) {
      logger.error('2FA token verification failed for user:', username);
      ctx.status = 400;
      ctx.body = 'Invalid 2FA token';
      return;
    }
  }
  const accessToken = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
  const refreshToken = uuidv4();
  db.prepare('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)').run(user.id, refreshToken);
  ctx.body = { token: accessToken, refreshToken };
});

// Start server
const PORT = process.env.PORT || 5174;
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
