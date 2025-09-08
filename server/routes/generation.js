const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { db } = require('../database');

// Middleware to check if PDFKit is installed
router.use((req, res, next) => {
  try {
    require('pdfkit');
    next();
  } catch (error) {
    console.error('PDFKit not installed. Please run: npm install pdfkit');
    return res.status(500).json({ 
      error: 'PDF generation library not installed',
      details: 'Please ensure pdfkit is installed in the server directory'
    });
  }
});

// Lazy load to avoid errors if not installed
const getPDFGenerator = () => require('../utils/pdfGenerator');
const getDocumentTemplates = () => require('../utils/documentTemplates');

// Generate authorization document
router.post('/authorization/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { type = 'inscription' } = req.body;

    console.log(`Generating ${type} authorization for candidate ${candidateId}`);

    // Get candidate information
    db.get(
      'SELECT * FROM candidates WHERE id = ?',
      [candidateId],
      async (err, candidate) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (!candidate) {
          return res.status(404).json({ error: 'Candidate not found' });
        }

        try {
          const DocumentTemplates = getDocumentTemplates();
          const templates = new DocumentTemplates();
          const filename = `autorisation_${type}_${candidateId}_${Date.now()}.pdf`;
          
          let filepath;
          if (type === 'inscription') {
            filepath = await templates.generateInscriptionAuthorization(candidate, filename);
          } else if (type === 'soutenance') {
            filepath = await templates.generateDefenseAuthorization(candidate, filename);
          } else {
            return res.status(400).json({ error: 'Invalid authorization type' });
          }

          console.log(`Document generated successfully: ${filepath}`);

          // Save document reference in database
          db.run(
            `INSERT INTO documents (candidate_id, name, type, path, category)
             VALUES (?, ?, ?, ?, ?)`,
            [candidateId, `Autorisation ${type}`, 'PDF', filename, 'Autorisation'],
            function(err) {
              if (err) {
                console.error('Error saving document reference:', err);
              }
            }
          );

          res.json({
            success: true,
            message: 'Authorization document generated successfully',
            filename: filename,
            path: `/reports/${filename}`
          });
        } catch (error) {
          console.error('Error generating document:', error);
          res.status(500).json({ 
            error: 'Error generating document',
            details: error.message 
          });
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Generate invitation letter
router.post('/invitation/:rapporteurId', async (req, res) => {
  try {
    const { rapporteurId } = req.params;
    const { candidateId, defenseDate, defenseTime } = req.body;

    console.log(`Generating invitation for rapporteur ${rapporteurId}, candidate ${candidateId}`);

    // Get rapporteur and candidate information
    db.get(
      'SELECT * FROM rapporteurs WHERE id = ?',
      [rapporteurId],
      (err, rapporteur) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (!rapporteur) {
          return res.status(404).json({ error: 'Rapporteur not found' });
        }

        db.get(
          'SELECT * FROM candidates WHERE id = ?',
          [candidateId],
          async (err, candidate) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error', details: err.message });
            }
            if (!candidate) {
              return res.status(404).json({ error: 'Candidate not found' });
            }

            try {
              const DocumentTemplates = getDocumentTemplates();
              const templates = new DocumentTemplates();
              const filename = `invitation_${rapporteurId}_${candidateId}_${Date.now()}.pdf`;
              const filepath = await templates.generateInvitationLetter(
                rapporteur,
                candidate,
                { date: defenseDate, time: defenseTime },
                filename
              );

              console.log(`Invitation generated successfully: ${filepath}`);

              // Save document reference
              db.run(
                `INSERT INTO documents (candidate_id, name, type, path, category)
                 VALUES (?, ?, ?, ?, ?)`,
                [candidateId, `Invitation - ${rapporteur.name}`, 'PDF', filename, 'Invitation'],
                function(err) {
                  if (err) {
                    console.error('Error saving document reference:', err);
                  }
                }
              );

              res.json({
                success: true,
                message: 'Invitation letter generated successfully',
                filename: filename,
                path: `/reports/${filename}`
              });
            } catch (error) {
              console.error('Error generating invitation:', error);
              res.status(500).json({ 
                error: 'Error generating invitation',
                details: error.message 
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Generate commission PV (Procès-Verbal)
router.post('/pv/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;

    console.log(`Generating PV for meeting ${meetingId}`);

    db.get(
      'SELECT * FROM meetings WHERE id = ?',
      [meetingId],
      (err, meeting) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (!meeting) {
          return res.status(404).json({ error: 'Meeting not found' });
        }

        // Get commission members
        db.all(
          'SELECT * FROM commission_members',
          async (err, members) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error', details: err.message });
            }

            try {
              const DocumentTemplates = getDocumentTemplates();
              const templates = new DocumentTemplates();
              const filename = `pv_commission_${meetingId}_${Date.now()}.pdf`;
              const filepath = await templates.generateCommissionPV(
                meeting,
                members,
                req.body.decisions || [],
                filename
              );

              console.log(`PV generated successfully: ${filepath}`);

              // Save document reference
              db.run(
                `INSERT INTO documents (name, type, path, category)
                 VALUES (?, ?, ?, ?)`,
                [`PV Commission - ${new Date(meeting.date).toLocaleDateString('fr-FR')}`, 'PDF', filename, 'PV'],
                function(err) {
                  if (err) {
                    console.error('Error saving document reference:', err);
                  }
                }
              );

              res.json({
                success: true,
                message: 'Commission PV generated successfully',
                filename: filename,
                path: `/reports/${filename}`
              });
            } catch (error) {
              console.error('Error generating PV:', error);
              res.status(500).json({ 
                error: 'Error generating PV',
                details: error.message 
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Generate convocation
router.post('/convocation/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { date, time, location } = req.body;

    console.log(`Generating convocation for candidate ${candidateId}`);

    db.get(
      'SELECT * FROM candidates WHERE id = ?',
      [candidateId],
      async (err, candidate) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (!candidate) {
          return res.status(404).json({ error: 'Candidate not found' });
        }

        try {
          const DocumentTemplates = getDocumentTemplates();
          const templates = new DocumentTemplates();
          const candidateData = {
            ...candidate,
            date,
            time,
            location: location || 'Salle de conférences, FPO'
          };
          const filename = `convocation_${candidateId}_${Date.now()}.pdf`;
          const filepath = await templates.generateConvocation(candidateData, filename);

          console.log(`Convocation generated successfully: ${filepath}`);

          // Save document reference
          db.run(
            `INSERT INTO documents (candidate_id, name, type, path, category)
             VALUES (?, ?, ?, ?, ?)`,
            [candidateId, 'Convocation de soutenance', 'PDF', filename, 'Convocation'],
            function(err) {
              if (err) {
                console.error('Error saving document reference:', err);
              }
            }
          );

          res.json({
            success: true,
            message: 'Convocation generated successfully',
            filename: filename,
            path: `/reports/${filename}`
          });
        } catch (error) {
          console.error('Error generating convocation:', error);
          res.status(500).json({ 
            error: 'Error generating convocation',
            details: error.message 
          });
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Generate diploma
router.post('/diploma/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { defenseDate, grade } = req.body;

    console.log(`Generating diploma for candidate ${candidateId}`);

    db.get(
      'SELECT * FROM candidates WHERE id = ?',
      [candidateId],
      async (err, candidate) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (!candidate) {
          return res.status(404).json({ error: 'Candidate not found' });
        }

        try {
          const DocumentTemplates = getDocumentTemplates();
          const templates = new DocumentTemplates();
          const filename = `diplome_hu_${candidateId}_${Date.now()}.pdf`;
          const filepath = await templates.generateDiploma(
            candidate,
            { defenseDate, grade },
            filename
          );

          console.log(`Diploma generated successfully: ${filepath}`);

          // Save document reference
          db.run(
            `INSERT INTO documents (candidate_id, name, type, path, category)
             VALUES (?, ?, ?, ?, ?)`,
            [candidateId, 'Diplôme HU', 'PDF', filename, 'Diplôme'],
            function(err) {
              if (err) {
                console.error('Error saving document reference:', err);
              }
            }
          );

          res.json({
            success: true,
            message: 'Diploma generated successfully',
            filename: filename,
            path: `/reports/${filename}`
          });
        } catch (error) {
          console.error('Error generating diploma:', error);
          res.status(500).json({ 
            error: 'Error generating diploma',
            details: error.message 
          });
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Generate candidate file summary
router.post('/summary/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    console.log(`Generating summary for candidate ${candidateId}`);

    // Get candidate information
    db.get(
      'SELECT * FROM candidates WHERE id = ?',
      [candidateId],
      (err, candidate) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (!candidate) {
          return res.status(404).json({ error: 'Candidate not found' });
        }

        // Get applications
        db.all(
          'SELECT * FROM applications WHERE candidate_id = ?',
          [candidateId],
          (err, applications) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error', details: err.message });
            }

            // Get documents
            db.all(
              'SELECT * FROM documents WHERE candidate_id = ?',
              [candidateId],
              async (err, documents) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Database error', details: err.message });
                }

                try {
                  const DocumentTemplates = getDocumentTemplates();
                  const templates = new DocumentTemplates();
                  const filename = `dossier_complet_${candidateId}_${Date.now()}.pdf`;
                  const filepath = await templates.generateCandidateSummary(
                    candidate,
                    applications,
                    documents,
                    filename
                  );

                  console.log(`Summary generated successfully: ${filepath}`);

                  res.json({
                    success: true,
                    message: 'Candidate summary generated successfully',
                    filename: filename,
                    path: `/reports/${filename}`
                  });
                } catch (error) {
                  console.error('Error generating summary:', error);
                  res.status(500).json({ 
                    error: 'Error generating summary',
                    details: error.message 
                  });
                }
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Test route to check if generation is working
router.get('/test', (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');
    
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    res.json({
      success: true,
      message: 'Document generation system is ready',
      pdfkit_installed: true,
      reports_directory: fs.existsSync(reportsDir)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Document generation system not ready',
      error: error.message
    });
  }
});

module.exports = router;
