const express = require('express');
const router = express.Router();
const { db } = require('../database');
const PDFGenerator = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

// Generate candidate report
router.get('/candidate/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get candidate data
    const candidate = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM candidates WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Get applications for this candidate
    const applications = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM applications WHERE candidate_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Generate PDF
    const pdf = new PDFGenerator();
    pdf.generateCandidateReport(candidate, applications);
    
    const buffer = await pdf.getBuffer();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="candidat_${candidate.last_name}_${candidate.first_name}.pdf"`,
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating candidate report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Generate applications list report
router.get('/applications', async (req, res) => {
  try {
    const applications = await new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, c.first_name, c.last_name, c.email, c.department
        FROM applications a
        JOIN candidates c ON a.candidate_id = c.id
        ORDER BY a.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const pdf = new PDFGenerator();
    pdf.generateApplicationsReport(applications);
    
    const buffer = await pdf.getBuffer();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rapport_candidatures_${Date.now()}.pdf"`,
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating applications report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Generate statistics report
router.get('/statistics', async (req, res) => {
  try {
    // Get statistics
    const candidateStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as totalCandidates,
          SUM(CASE WHEN status = 'En attente' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'En cours' THEN 1 ELSE 0 END) as inProgress,
          SUM(CASE WHEN status = 'Terminé' THEN 1 ELSE 0 END) as completed
        FROM candidates
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get department distribution
    const deptStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT department, COUNT(*) as count
        FROM candidates
        WHERE department IS NOT NULL
        GROUP BY department
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const byDepartment = {};
    deptStats.forEach(row => {
      byDepartment[row.department] = row.count;
    });

    const stats = {
      ...candidateStats,
      byDepartment,
      monthly: [
        { month: 'Janvier', applications: 4, completed: 2 },
        { month: 'Février', applications: 6, completed: 3 },
        { month: 'Mars', applications: 8, completed: 5 }
      ]
    };

    const pdf = new PDFGenerator();
    pdf.generateStatisticsReport(stats);
    
    const buffer = await pdf.getBuffer();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rapport_statistiques_${Date.now()}.pdf"`,
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating statistics report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Generate defense convocation
router.post('/defense-convocation', async (req, res) => {
  try {
    const { candidate_name, date, time, location, jury } = req.body;

    const defense = {
      candidate_name,
      date,
      time,
      location
    };

    const pdf = new PDFGenerator();
    pdf.generateDefenseReport(defense, jury || []);
    
    const buffer = await pdf.getBuffer();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="convocation_soutenance_${Date.now()}.pdf"`,
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating defense convocation:', error);
    res.status(500).json({ error: 'Error generating convocation' });
  }
});

// Generate commission meeting report
router.post('/commission-report', async (req, res) => {
  try {
    const { meeting, members, decisions } = req.body;

    const pdf = new PDFGenerator();
    pdf.generateCommissionReport(meeting, members || [], decisions || []);
    
    const buffer = await pdf.getBuffer();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="pv_commission_${Date.now()}.pdf"`,
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating commission report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Export to Excel
router.get('/export/excel/candidates', async (req, res) => {
  try {
    const XLSX = require('xlsx');
    
    const candidates = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM candidates', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(candidates);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Candidats');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="candidats_${Date.now()}.xlsx"`,
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Error exporting data' });
  }
});

module.exports = router;
