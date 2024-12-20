```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const { checkRole, csrfMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../utils/database');

const router = express.Router();

// Shift management
router.post('/', [
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 datetime'),
  body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 datetime')
], csrfMiddleware, checkRole(['admin', 'manager']), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during shift creation:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, startTime, endTime } = req.body;
  db.run('INSERT INTO shifts (user_id, start_time, end_time) VALUES (?, ?, ?)', [userId, startTime, endTime], function(err) {
    if (err) {
      logger.error('Error creating shift:', err.message);
      return res.status(400).send(err.message);
    }
    res.status(201).send({ message: 'Shift added successfully', shiftId: this.lastID });
  });
});

// Shift management - View, Edit, and Delete
router.get('/', checkRole(['admin', 'manager']), (req, res) => {
  db.all('SELECT * FROM shifts', (err, rows) => {
    if (err) {
      logger.error('Error fetching shifts:', err.message);
      return res.status(500).send(err.message);
    }
    res.send(rows);
  });
});

router.put('/:id', [
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 datetime'),
  body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 datetime')
], csrfMiddleware, checkRole(['admin', 'manager']), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors during shift update:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { userId, startTime, endTime } = req.body;
  db.run('UPDATE shifts SET user_id = ?, start_time = ?, end_time = ? WHERE id = ?', [userId, startTime, endTime, id], function(err) {
    if (err) {
      logger.error('Error updating shift:', err.message);
      return res.status(400).send(err.message);
    }
    res.send({ message: 'Shift updated successfully' });
  });
});

router.delete('/:id', csrfMiddleware, checkRole(['admin', 'manager']), (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM shifts WHERE id = ?', [id], function(err) {
    if (err) {
      logger.error('Error deleting shift:', err.message);
      return res.status(400).send(err.message);
    }
    res.send({ message: 'Shift deleted successfully' });
  });
});

module.exports = router;
```
