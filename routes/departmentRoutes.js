```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const { checkRole, csrfMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../utils/database');

const router = express.Router();

// Department management
router.get('/', checkRole(['admin', 'manager']), (req, res) => {
  db.all('SELECT * FROM departments', (err, rows) => {
    if (err) {
      logger.error('Error fetching departments:', err.message);
      return res.status(500).send(err.message);
    }
    res.send(rows);
  });
});

router.post('/', [
  body('name').isLength({ min: 3 }).withMessage('Department name must be at least 3 characters long')
], csrfMiddleware, checkRole(['admin']), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during department creation:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;
  db.run('INSERT INTO departments (name) VALUES (?)', [name], function(err) {
    if (err) {
      logger.error('Error creating department:', err.message);
      return res.status(400).send(err.message);
    }
    res.status(201).send({ message: 'Department added successfully', departmentId: this.lastID });
  });
});

module.exports = router;
```
