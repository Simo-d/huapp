const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all applications
router.get('/', (req, res) => {
  db.all(
    `SELECT a.*, c.first_name, c.last_name, c.email, c.department
     FROM applications a
     JOIN candidates c ON a.candidate_id = c.id
     ORDER BY a.created_at DESC`,
    (err, applications) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(applications);
    }
  );
});

// Get application by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT a.*, c.first_name, c.last_name, c.email, c.department
     FROM applications a
     JOIN candidates c ON a.candidate_id = c.id
     WHERE a.id = ?`,
    [id],
    (err, application) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      res.json(application);
    }
  );
});

// Create new application
router.post('/', (req, res) => {
  const { candidate_id, submission_date, notes } = req.body;

  db.run(
    `INSERT INTO applications (candidate_id, submission_date, notes)
     VALUES (?, ?, ?)`,
    [candidate_id, submission_date || new Date().toISOString().split('T')[0], notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id: this.lastID, message: 'Application created successfully' });
    }
  );
});

// Update application status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, current_stage, progress } = req.body;

  db.run(
    `UPDATE applications 
     SET status = ?, current_stage = ?, progress = ?
     WHERE id = ?`,
    [status, current_stage, progress, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      res.json({ message: 'Application status updated successfully' });
    }
  );
});

// Delete application
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM applications WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  });
});

// Get application statistics
router.get('/stats/overview', (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'En attente' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'En cours' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'Approuvé' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'Rejeté' THEN 1 ELSE 0 END) as rejected
     FROM applications`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(stats);
    }
  );
});

module.exports = router;
