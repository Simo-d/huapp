const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all rapporteurs
router.get('/', (req, res) => {
  db.all('SELECT * FROM rapporteurs ORDER BY name', (err, rapporteurs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rapporteurs);
  });
});

// Get rapporteur by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM rapporteurs WHERE id = ?', [id], (err, rapporteur) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!rapporteur) {
      return res.status(404).json({ error: 'Rapporteur not found' });
    }
    res.json(rapporteur);
  });
});

// Create new rapporteur
router.post('/', (req, res) => {
  const { name, institution, email, phone, specialization } = req.body;
  
  db.run(
    `INSERT INTO rapporteurs (name, institution, email, phone, specialization, evaluations_count)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [name, institution, email, phone, specialization],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Rapporteur created successfully'
      });
    }
  );
});

// Update rapporteur
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, institution, email, phone, specialization } = req.body;
  
  db.run(
    `UPDATE rapporteurs SET name = ?, institution = ?, email = ?, phone = ?, specialization = ?
     WHERE id = ?`,
    [name, institution, email, phone, specialization, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Rapporteur not found' });
      }
      res.json({ message: 'Rapporteur updated successfully' });
    }
  );
});

// Delete rapporteur
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM rapporteurs WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Rapporteur not found' });
    }
    res.json({ message: 'Rapporteur deleted successfully' });
  });
});

// Get rapporteurs with evaluation count
router.get('/stats/overview', (req, res) => {
  db.all(
    `SELECT r.*, COUNT(e.id) as active_evaluations
     FROM rapporteurs r
     LEFT JOIN evaluations e ON r.id = e.evaluator_id AND e.status = 'En cours'
     GROUP BY r.id`,
    (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(data);
    }
  );
});

module.exports = router;
