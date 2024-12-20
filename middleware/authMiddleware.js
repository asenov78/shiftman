```javascript
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

// CSRF Protection
const csrfTokens = {};

// Middleware for CSRF protection
const csrfMiddleware = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'];
  if (!csrfToken || !csrfTokens[csrfToken]) {
    logger.error('CSRF token missing or invalid');
    return res.status(403).send('CSRF token missing or invalid');
  }
  next();
};

// Middleware for role-based access control
const checkRole = (roles) => {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('No token provided');
    jwt.verify(token.split(' ')[1], 'secret_key', (err, decoded) => {
      if (err) return res.status(401).send('Invalid token');
      if (!roles.includes(decoded.role)) {
        logger.error(`User ${decoded.id} attempted to access restricted route with role ${decoded.role}`);
        return res.status(403).send('Access denied');
      }
      next();
    });
  };
};

module.exports = { csrfMiddleware, checkRole };
```
