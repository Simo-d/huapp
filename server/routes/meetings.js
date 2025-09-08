const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all meetings
router.get('/', (req, res) => {
  db.all('SELECT * FROM meetings ORDER BY date DESC', (err, meetings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(meetings);
  });
});

// Get meeting by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM meetings WHERE id = ?', [id], (err, meeting) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  });
});

// Create new meeting
router.post('/', (req, res) => {
  const { date, time, type, status, attendees, decisions, minutes } = req.body;
  
  db.run(
    `INSERT INTO meetings (date, time, type, status, attendees, decisions, minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, time, type, status || 'Planifiée', attendees, decisions, minutes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Meeting created successfully'
      });
    }
  );
});

// Update meeting
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { date, time, type, status, attendees, decisions, minutes } = req.body;
  
  db.run(
    `UPDATE meetings SET date = ?, time = ?, type = ?, status = ?, 
     attendees = ?, decisions = ?, minutes = ?
     WHERE id = ?`,
    [date, time, type, status, attendees, decisions, minutes, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Meeting not found' });
      }
      res.json({ message: 'Meeting updated successfully' });
    }
  );
});

// Delete meeting
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM meetings WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json({ message: 'Meeting deleted successfully' });
  });
});

// Get upcoming meetings
router.get('/status/upcoming', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all(
    `SELECT * FROM meetings WHERE date >= ? AND status = 'Planifiée' ORDER BY date ASC`,
    [today],
    (err, meetings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(meetings);
    }
  );
});

module.exports = router;
