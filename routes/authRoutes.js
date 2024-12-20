```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const { checkRole, csrfMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const speakeasy = require('speakeasy');

const router = express.Router();

// User login with CSRF protection and 2FA
router.post('/login', csrfMiddleware, async (req, res) => {
  const { username, password, token } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      logger.error('Login attempt failed for user:', username);
      return res.status(400).send('Invalid username or password');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.error('Login attempt failed for user:', username);
      return res.status(400).send('Invalid username or password');
    }
    if (token) {
      const verified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token: token
      });
      if (!verified) {
        logger.error('2FA token verification failed for user:', username);
        return res.status(400).send('Invalid 2FA token');
      }
    }
    const accessToken = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
    const refreshToken = uuidv4();
    db.run('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [user.id, refreshToken], function(err) {
      if (err) {
        logger.error('Error generating refresh token:', err.message);
        return res.status(500).send('Error generating refresh token');
      }
      res.send({ token: accessToken, refreshToken });
    });
  });
});

// Refresh token endpoint
router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;
  db.get('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken], (err, token) => {
    if (err || !token) {
      logger.error('Invalid refresh token:', refreshToken);
      return res.status(401).send('Invalid refresh token');
    }
    db.get('SELECT * FROM users WHERE id = ?', [token.user_id], async (err, user) => {
      if (err || !user) {
        logger.error('User not found for refresh token:', refreshToken);
        return res.status(401).send('User not found');
      }
      const newToken = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
      res.send({ token: newToken });
    });
  });
});

module.exports = router;
```
