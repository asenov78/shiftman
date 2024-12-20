```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const { checkRole, csrfMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../utils/database');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

const router = express.Router();

// User registration with validation
router.post('/', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('address').isLength({ min: 5 }).withMessage('Address must be at least 5 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during registration:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role, department, email, phone, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const secret = speakeasy.generateSecret();
  db.run('INSERT INTO users (username, password, role, department, email, phone, address, secret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [username, hashedPassword, role, department, email, phone, address, secret.base32], function(err) {
    if (err) {
      logger.error('Error during user registration:', err.message);
      return res.status(400).send(err.message);
    }
    res.status(201).send({ message: 'User registered successfully', userId: this.lastID, secret: secret.base32 });
  });
});

// User profile with validation
router.put('/profile/:id', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('address').isLength({ min: 5 }).withMessage('Address must be at least 5 characters long')
], csrfMiddleware, checkRole(['admin', 'manager']), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during profile update:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { username, email, phone, address } = req.body;
  db.run('UPDATE users SET username = ?, email = ?, phone = ?, address = ? WHERE id = ?', [username, email, phone, address, id], function(err) {
    if (err) {
      logger.error('Error updating user profile:', err.message);
      return res.status(400).send(err.message);
    }
    res.send({ message: 'Profile updated successfully' });
  });
});

// User management
router.get('/', checkRole(['admin']), (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      logger.error('Error fetching users:', err.message);
      return res.status(500).send(err.message);
    }
    res.send(rows);
  });
});

router.post('/', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('address').isLength({ min: 5 }).withMessage('Address must be at least 5 characters long')
], checkRole(['admin']), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during user creation:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role, department, email, phone, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const secret = speakeasy.generateSecret();
  db.run('INSERT INTO users (username, password, role, department, email, phone, address, secret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [username, hashedPassword, role, department, email, phone, address, secret.base32], function(err) {
    if (err) {
      logger.error('Error creating user:', err.message);
      return res.status(400).send(err.message);
    }
    res.status(201).send({ message: 'User added successfully', userId: this.lastID, secret: secret.base32 });
  });
});

router.put('/:id', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('address').isLength({ min: 5 }).withMessage('Address must be at least 5 characters long')
], csrfMiddleware, checkRole(['admin']), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during user update:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { username, password, role, department, email, phone, address } = req.body;
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }
  db.run('UPDATE users SET username = ?, password = ?, role = ?, department = ?, email = ?, phone = ?, address = ? WHERE id = ?', [username, hashedPassword, role, department, email, phone, address, id], function(err) {
    if (err) {
      logger.error('Error updating user:', err.message);
      return res.status(400).send(err.message);
    }
    res.send({ message: 'User updated successfully' });
  });
});

router.delete('/:id', csrfMiddleware, checkRole(['admin']), (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      logger.error('Error deleting user:', err.message);
      return res.status(400).send(err.message);
    }
    res.send({ message: 'User deleted successfully' });
  });
});

module.exports = router;
```
