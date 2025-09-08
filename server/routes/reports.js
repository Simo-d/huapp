const express = require('express');
const router = express.Router();
const path = require('path');
const { db } = require('../database');
const PDFGenerator = require('../utils/pdfGenerator');

// Get all reports
router.get('/', (req, res) => {
  db.all(
    `SELECT r.*, a.candidate_id, c.first_name, c.last_name, rap.name as rapporteur_name
     FROM reports r
     LEFT JOIN applications a ON r.application_id = a.id
     LEFT JOIN candidates c ON a.candidate_id = c.id
     LEFT JOIN rapporteurs rap ON r.rapporteur_id = rap.id
     ORDER BY r.submission_date DESC`,
    (err, reports) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(reports || []);
    }
  );
});

// Get report by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT r.*, a.candidate_id, c.first_name, c.last_name, rap.name as rapporteur_name
     FROM reports r
     LEFT JOIN applications a ON r.application_id = a.id
     LEFT JOIN candidates c ON a.candidate_id = c.id
     LEFT JOIN rapporteurs rap ON r.rapporteur_id = rap.id
     WHERE r.id = ?`,
    [id],
    (err, report) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(report);
    }
  );
});

// Create new report
router.post('/', (req, res) => {
  const { application_id, rapporteur_id, submission_date, content, recommendation } = req.body;
  
  db.run(
    `INSERT INTO reports (application_id, rapporteur_id, submission_date, content, recommendation)
     VALUES (?, ?, ?, ?, ?)`,
    [application_id, rapporteur_id, submission_date || new Date().toISOString().split('T')[0], content, recommendation],
    function(err) {
      if (err) {
        console.error('Error creating report:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Update evaluation status if exists
      db.run(
        `UPDATE evaluations 
         SET status = 'Rapport soumis' 
         WHERE application_id = ? AND evaluator_id = ?`,
        [application_id, rapporteur_id]
      );
      
      // Check if all reports are submitted for this application
      db.get(
        `SELECT COUNT(DISTINCT e.evaluator_id) as expected, COUNT(DISTINCT r.rapporteur_id) as received
         FROM evaluations e
         LEFT JOIN reports r ON e.application_id = r.application_id AND e.evaluator_id = r.rapporteur_id
         WHERE e.application_id = ?`,
        [application_id],
        (err, counts) => {
          if (!err && counts && counts.expected === counts.received && counts.expected > 0) {
            // All reports received, update application
            db.run(
              'UPDATE applications SET current_stage = ?, progress = ? WHERE id = ?',
              ['Autorisation Soutenance', 70, application_id]
            );
          }
        }
      );
      
      res.status(201).json({
        id: this.lastID,
        message: 'Report created successfully'
      });
    }
  );
});

// Update report
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { application_id, rapporteur_id, submission_date, content, recommendation } = req.body;
  
  db.run(
    `UPDATE reports 
     SET application_id = ?, rapporteur_id = ?, submission_date = ?, content = ?, recommendation = ?
     WHERE id = ?`,
    [application_id, rapporteur_id, submission_date, content, recommendation, id],
    function(err) {
      if (err) {
        console.error('Error updating report:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({ message: 'Report updated successfully' });
    }
  );
});

// Delete report
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM reports WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  });
});

// Get reports by application
router.get('/application/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  
  db.all(
    `SELECT r.*, rap.name as rapporteur_name, rap.institution
     FROM reports r
     LEFT JOIN rapporteurs rap ON r.rapporteur_id = rap.id
     WHERE r.application_id = ?
     ORDER BY r.submission_date DESC`,
    [applicationId],
    (err, reports) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(reports || []);
    }
  );
});

// Get reports by rapporteur
router.get('/rapporteur/:rapporteurId', (req, res) => {
  const { rapporteurId } = req.params;
  
  db.all(
    `SELECT r.*, a.candidate_id, c.first_name, c.last_name
     FROM reports r
     LEFT JOIN applications a ON r.application_id = a.id
     LEFT JOIN candidates c ON a.candidate_id = c.id
     WHERE r.rapporteur_id = ?
     ORDER BY r.submission_date DESC`,
    [rapporteurId],
    (err, reports) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(reports || []);
    }
  );
});

// Generate PDF report for an application
router.post('/generate/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  
  try {
    // Get application details
    db.get(
      `SELECT a.*, c.* 
       FROM applications a
       LEFT JOIN candidates c ON a.candidate_id = c.id
       WHERE a.id = ?`,
      [applicationId],
      (err, application) => {
        if (err || !application) {
          return res.status(404).json({ error: 'Application not found' });
        }
        
        // Get all reports for this application
        db.all(
          `SELECT r.*, rap.name as rapporteur_name, rap.institution
           FROM reports r
           LEFT JOIN rapporteurs rap ON r.rapporteur_id = rap.id
           WHERE r.application_id = ?`,
          [applicationId],
          async (err, reports) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            try {
              const pdfGenerator = new PDFGenerator();
              const filename = `rapport_evaluation_${applicationId}_${Date.now()}.pdf`;
              
              // Generate comprehensive evaluation report
              pdfGenerator.addHeader('Rapport d\'Évaluation HU');
              
              // Candidate information
              pdfGenerator.doc
                .fontSize(14)
                .text('Candidat', { underline: true })
                .fontSize(11)
                .text(`Nom: ${application.first_name} ${application.last_name}`)
                .text(`Département: ${application.department}`)
                .text(`Titre de thèse: ${application.thesis_title}`)
                .moveDown();
              
              // Reports summary
              pdfGenerator.doc
                .fontSize(14)
                .text('Évaluations des Rapporteurs', { underline: true })
                .moveDown(0.5);
              
              reports.forEach((report, index) => {
                pdfGenerator.doc
                  .fontSize(12)
                  .font('Helvetica-Bold')
                  .text(`Rapporteur ${index + 1}: ${report.rapporteur_name}`)
                  .font('Helvetica')
                  .fontSize(11)
                  .text(`Institution: ${report.institution}`)
                  .text(`Date: ${new Date(report.submission_date).toLocaleDateString('fr-FR')}`)
                  .text(`Recommandation: ${report.recommendation}`)
                  .moveDown(0.5);
                
                if (report.content) {
                  pdfGenerator.doc
                    .text('Rapport:', { underline: true })
                    .text(report.content)
                    .moveDown();
                }
              });
              
              // Save the PDF
              const filepath = await pdfGenerator.save(filename);
              
              res.json({
                success: true,
                message: 'Rapport généré avec succès',
                filename: filename,
                path: `/reports/${filename}`
              });
            } catch (error) {
              console.error('Error generating PDF:', error);
              res.status(500).json({ error: 'Error generating PDF' });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get report statistics
router.get('/stats/overview', (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total_reports,
      COUNT(CASE WHEN recommendation = 'Favorable' THEN 1 END) as favorable,
      COUNT(CASE WHEN recommendation = 'Défavorable' THEN 1 END) as defavorable,
      COUNT(CASE WHEN recommendation = 'Favorable avec réserves' THEN 1 END) as with_reserves
     FROM reports`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(stats);
    }
  );
});

module.exports = router;
