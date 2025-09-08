const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all candidates
router.get('/', (req, res) => {
  db.all('SELECT * FROM candidates ORDER BY created_at DESC', (err, candidates) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(candidates);
  });
});

// Get candidate by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM candidates WHERE id = ?', [id], (err, candidate) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  });
});

// Create new candidate
router.post('/', (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    department,
    thesis_title,
    thesis_date,
    thesis_supervisor
  } = req.body;

  db.run(
    `INSERT INTO candidates 
     (first_name, last_name, email, phone, address, department, thesis_title, thesis_date, thesis_supervisor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone, address, department, thesis_title, thesis_date, thesis_supervisor],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id: this.lastID, message: 'Candidate created successfully' });
    }
  );
});

// Update candidate
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  
  db.run(
    `UPDATE candidates SET ${setClause} WHERE id = ?`,
    [...values, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      res.json({ message: 'Candidate updated successfully' });
    }
  );
});

// Delete candidate
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM candidates WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  });
});

// Get candidate statistics
router.get('/stats/overview', (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'En attente' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'En cours' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'Terminé' THEN 1 ELSE 0 END) as completed
     FROM candidates`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(stats);
    }
  );
});

module.exports = router;
