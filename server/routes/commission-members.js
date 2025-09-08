const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all commission members
router.get('/', (req, res) => {
  db.all('SELECT * FROM commission_members ORDER BY name', (err, members) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(members || []);
  });
});

// Get member by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM commission_members WHERE id = ?', [id], (err, member) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  });
});

// Create new member
router.post('/', (req, res) => {
  const { name, role, department, email, phone } = req.body;
  
  db.run(
    `INSERT INTO commission_members (name, role, department, email, phone)
     VALUES (?, ?, ?, ?, ?)`,
    [name, role, department, email, phone],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Member added successfully'
      });
    }
  );
});

// Update member
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, department, email, phone } = req.body;
  
  db.run(
    `UPDATE commission_members SET name = ?, role = ?, department = ?, email = ?, phone = ?
     WHERE id = ?`,
    [name, role, department, email, phone, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json({ message: 'Member updated successfully' });
    }
  );
});

// Delete member
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM commission_members WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  });
});

module.exports = router;
