const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { db } = require('../database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all documents
router.get('/', (req, res) => {
  db.all('SELECT * FROM documents ORDER BY uploaded_at DESC', (err, documents) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(documents);
  });
});

// Get documents by application ID
router.get('/application/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  db.all(
    'SELECT * FROM documents WHERE application_id = ? ORDER BY uploaded_at DESC',
    [applicationId],
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(documents);
    }
  );
});

// Get documents by candidate ID
router.get('/candidate/:candidateId', (req, res) => {
  const { candidateId } = req.params;
  db.all(
    'SELECT * FROM documents WHERE candidate_id = ? ORDER BY uploaded_at DESC',
    [candidateId],
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(documents);
    }
  );
});

// Upload document
router.post('/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { application_id, candidate_id, category } = req.body;
  const { originalname, filename, size } = req.file;
  const type = path.extname(originalname).substring(1).toUpperCase();

  db.run(
    `INSERT INTO documents (application_id, candidate_id, name, type, path, size, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [application_id, candidate_id, originalname, type, filename, size, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Document uploaded successfully',
        file: {
          name: originalname,
          path: filename,
          size: size
        }
      });
    }
  );
});

// Delete document
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // First get the document to delete the file
  db.get('SELECT path FROM documents WHERE id = ?', [id], (err, document) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from database
    db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Delete file from filesystem
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', 'uploads', document.path);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });

      res.json({ message: 'Document deleted successfully' });
    });
  });
});

module.exports = router;
