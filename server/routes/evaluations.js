const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all evaluations
router.get('/', (req, res) => {
  db.all(
    `SELECT e.*, a.candidate_id, c.first_name, c.last_name, c.department
     FROM evaluations e
     LEFT JOIN applications a ON e.application_id = a.id
     LEFT JOIN candidates c ON a.candidate_id = c.id
     ORDER BY e.created_at DESC`,
    (err, evaluations) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(evaluations || []);
    }
  );
});

// Get evaluation by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT e.*, a.candidate_id, c.first_name, c.last_name
     FROM evaluations e
     LEFT JOIN applications a ON e.application_id = a.id
     LEFT JOIN candidates c ON a.candidate_id = c.id
     WHERE e.id = ?`,
    [id],
    (err, evaluation) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!evaluation) {
        return res.status(404).json({ error: 'Evaluation not found' });
      }
      res.json(evaluation);
    }
  );
});

// Create new evaluation
router.post('/', (req, res) => {
  const { 
    application_id, 
    evaluator_id, 
    evaluator_name, 
    score, 
    comments, 
    evaluation_date, 
    status,
    strengths,
    weaknesses,
    recommendation
  } = req.body;
  
  // Extended fields for detailed evaluation
  const extendedComments = JSON.stringify({
    strengths: strengths || '',
    weaknesses: weaknesses || '',
    recommendation: recommendation || '',
    generalComments: comments || ''
  });
  
  db.run(
    `INSERT INTO evaluations (application_id, evaluator_id, evaluator_name, score, comments, evaluation_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      application_id,
      evaluator_id || null,
      evaluator_name,
      score || null,
      extendedComments,
      evaluation_date || new Date().toISOString().split('T')[0],
      status || 'En cours'
    ],
    function(err) {
      if (err) {
        console.error('Error creating evaluation:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Evaluation created successfully'
      });
    }
  );
});

// Update evaluation
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    application_id,
    evaluator_id,
    evaluator_name,
    score,
    comments,
    evaluation_date,
    status,
    strengths,
    weaknesses,
    recommendation
  } = req.body;
  
  // Extended fields for detailed evaluation
  const extendedComments = JSON.stringify({
    strengths: strengths || '',
    weaknesses: weaknesses || '',
    recommendation: recommendation || '',
    generalComments: comments || ''
  });
  
  db.run(
    `UPDATE evaluations 
     SET application_id = ?, evaluator_id = ?, evaluator_name = ?, 
         score = ?, comments = ?, evaluation_date = ?, status = ?
     WHERE id = ?`,
    [
      application_id,
      evaluator_id || null,
      evaluator_name,
      score || null,
      extendedComments,
      evaluation_date,
      status,
      id
    ],
    function(err) {
      if (err) {
        console.error('Error updating evaluation:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Evaluation not found' });
      }
      
      // If evaluation is completed, check if all evaluations for this application are done
      if (status === 'Terminé' || status === 'Rapport soumis') {
        db.get(
          'SELECT COUNT(*) as total, COUNT(CASE WHEN status IN ("Terminé", "Rapport soumis") THEN 1 END) as completed FROM evaluations WHERE application_id = ?',
          [application_id],
          (err, result) => {
            if (!err && result && result.total === result.completed && result.total > 0) {
              // All evaluations completed, update application status
              db.run(
                'UPDATE applications SET current_stage = ?, progress = ? WHERE id = ?',
                ['Autorisation Soutenance', 70, application_id]
              );
            }
          }
        );
      }
      
      res.json({ message: 'Evaluation updated successfully' });
    }
  );
});

// Delete evaluation
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM evaluations WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    res.json({ message: 'Evaluation deleted successfully' });
  });
});

// Get evaluations by application
router.get('/application/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  
  db.all(
    'SELECT * FROM evaluations WHERE application_id = ? ORDER BY created_at DESC',
    [applicationId],
    (err, evaluations) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(evaluations || []);
    }
  );
});

// Get evaluations by evaluator
router.get('/evaluator/:evaluatorId', (req, res) => {
  const { evaluatorId } = req.params;
  
  db.all(
    `SELECT e.*, a.candidate_id, c.first_name, c.last_name
     FROM evaluations e
     LEFT JOIN applications a ON e.application_id = a.id
     LEFT JOIN candidates c ON a.candidate_id = c.id
     WHERE e.evaluator_id = ?
     ORDER BY e.created_at DESC`,
    [evaluatorId],
    (err, evaluations) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(evaluations || []);
    }
  );
});

// Get evaluation statistics
router.get('/stats/overview', (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'En cours' THEN 1 END) as pending,
      COUNT(CASE WHEN status IN ('Terminé', 'Rapport soumis') THEN 1 END) as completed,
      AVG(CASE WHEN score IS NOT NULL THEN score END) as average_score
     FROM evaluations`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(stats);
    }
  );
});

// Batch assign evaluators to an application
router.post('/batch-assign', (req, res) => {
  const { application_id, evaluator_ids, deadline } = req.body;
  
  if (!application_id || !evaluator_ids || evaluator_ids.length === 0) {
    return res.status(400).json({ error: 'Application ID and evaluator IDs are required' });
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Get evaluator details and create evaluations
  evaluator_ids.forEach((evaluatorId, index) => {
    db.get('SELECT * FROM rapporteurs WHERE id = ?', [evaluatorId], (err, rapporteur) => {
      if (err || !rapporteur) {
        errorCount++;
      } else {
        db.run(
          `INSERT INTO evaluations (application_id, evaluator_id, evaluator_name, evaluation_date, status)
           VALUES (?, ?, ?, ?, ?)`,
          [
            application_id,
            evaluatorId,
            rapporteur.name,
            deadline || null,
            'En cours'
          ],
          function(insertErr) {
            if (insertErr) {
              errorCount++;
            } else {
              successCount++;
            }
            
            // Check if all assignments are processed
            if (successCount + errorCount === evaluator_ids.length) {
              if (successCount > 0) {
                // Update application status
                db.run(
                  'UPDATE applications SET current_stage = ?, progress = ? WHERE id = ?',
                  ['Évaluation Rapporteurs', 50, application_id]
                );
                
                res.json({
                  message: `${successCount} evaluators assigned successfully`,
                  success: successCount,
                  errors: errorCount
                });
              } else {
                res.status(500).json({ error: 'Failed to assign evaluators' });
              }
            }
          }
        );
      }
    });
  });
});

module.exports = router;
