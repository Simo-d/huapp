const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all defenses
router.get('/', (req, res) => {
  db.all(
    `SELECT d.*, c.first_name, c.last_name, c.department, c.email 
     FROM defenses d 
     LEFT JOIN candidates c ON d.candidate_id = c.id 
     ORDER BY d.date DESC, d.time DESC`,
    (err, defenses) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(defenses || []);
    }
  );
});

// Get defense by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT d.*, c.first_name, c.last_name, c.department, c.email 
     FROM defenses d 
     LEFT JOIN candidates c ON d.candidate_id = c.id 
     WHERE d.id = ?`,
    [id],
    (err, defense) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!defense) {
        return res.status(404).json({ error: 'Defense not found' });
      }
      res.json(defense);
    }
  );
});

// Create new defense
router.post('/', (req, res) => {
  const { candidate_id, application_id, date, time, location, jury, status } = req.body;
  
  // Check if defense already exists for this candidate
  db.get(
    'SELECT * FROM defenses WHERE candidate_id = ? AND status != ?',
    [candidate_id, 'Annulée'],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (existing) {
        return res.status(400).json({ 
          error: 'Une soutenance est déjà programmée pour ce candidat' 
        });
      }

      // Insert new defense
      db.run(
        `INSERT INTO defenses (candidate_id, application_id, date, time, location, jury, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [candidate_id, application_id || null, date, time, location, jury, status || 'Programmée'],
        function(err) {
          if (err) {
            console.error('Error creating defense:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Update application status if application_id provided
          if (application_id) {
            db.run(
              'UPDATE applications SET current_stage = ?, progress = ? WHERE id = ?',
              ['Soutenance', 80, application_id],
              (updateErr) => {
                if (updateErr) {
                  console.error('Error updating application:', updateErr);
                }
              }
            );
          }

          res.status(201).json({
            id: this.lastID,
            message: 'Soutenance programmée avec succès'
          });
        }
      );
    }
  );
});

// Update defense
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { candidate_id, application_id, date, time, location, jury, outcome, status } = req.body;
  
  db.run(
    `UPDATE defenses 
     SET candidate_id = ?, application_id = ?, date = ?, time = ?, 
         location = ?, jury = ?, outcome = ?, status = ?
     WHERE id = ?`,
    [candidate_id, application_id || null, date, time, location, jury, outcome, status, id],
    function(err) {
      if (err) {
        console.error('Error updating defense:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Defense not found' });
      }
      
      // If defense is completed, update application
      if (status === 'Terminée' && application_id) {
        db.run(
          'UPDATE applications SET current_stage = ?, progress = ?, status = ? WHERE id = ?',
          ['Diplôme', 100, 'Terminé', application_id],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating application:', updateErr);
            }
          }
        );
      }

      res.json({ message: 'Soutenance mise à jour avec succès' });
    }
  );
});

// Update defense status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run(
    'UPDATE defenses SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Defense not found' });
      }
      
      // Get defense details to update application if needed
      db.get('SELECT application_id FROM defenses WHERE id = ?', [id], (getErr, defense) => {
        if (!getErr && defense && defense.application_id && status === 'Terminée') {
          db.run(
            'UPDATE applications SET current_stage = ?, progress = ?, status = ? WHERE id = ?',
            ['Diplôme', 100, 'Approuvé', defense.application_id]
          );
        }
      });

      res.json({ message: 'Statut mis à jour avec succès' });
    }
  );
});

// Delete defense
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM defenses WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Defense not found' });
    }
    res.json({ message: 'Soutenance supprimée avec succès' });
  });
});

// Get upcoming defenses
router.get('/status/upcoming', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all(
    `SELECT d.*, c.first_name, c.last_name, c.department 
     FROM defenses d 
     LEFT JOIN candidates c ON d.candidate_id = c.id 
     WHERE d.date >= ? AND d.status = 'Programmée' 
     ORDER BY d.date ASC, d.time ASC 
     LIMIT 10`,
    [today],
    (err, defenses) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(defenses || []);
    }
  );
});

// Get defenses by candidate
router.get('/candidate/:candidateId', (req, res) => {
  const { candidateId } = req.params;
  
  db.all(
    'SELECT * FROM defenses WHERE candidate_id = ? ORDER BY date DESC',
    [candidateId],
    (err, defenses) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(defenses || []);
    }
  );
});

module.exports = router;
