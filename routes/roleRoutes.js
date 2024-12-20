```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const { checkRole, csrfMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../utils/database');

const router = express.Router();

// Role management
router.get('/', checkRole(['admin']), (req, res) => {
  db.all('SELECT * FROM roles', (err, rows) => {
    if (err) {
      logger.error('Error fetching roles:', err.message);
      return res.status(500).send(err.message);
    }
    res.send(rows);
  });
});

router.post('/', [
  body('name').isLength({ min: 3 }).withMessage('Role name must be at least 3 characters long')
], csrfMiddleware, checkRole(['admin']), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during role creation:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;
  db.run('INSERT INTO roles (name) VALUES (?)', [name], function(err) {
    if (err) {
      logger.error('Error creating role:', err.message);
      return res.status(400).send(err.message);
    }
    res.status(201).send({ message: 'Role added successfully', roleId: this.lastID });
  });
});

module.exports = router;
```
