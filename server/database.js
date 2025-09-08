const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'hu_database.db');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  // Create tables
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Candidates table
    db.run(`CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      department TEXT,
      thesis_title TEXT,
      thesis_date DATE,
      thesis_supervisor TEXT,
      status TEXT DEFAULT 'En attente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Applications table
    db.run(`CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      submission_date DATE,
      status TEXT DEFAULT 'En attente',
      current_stage TEXT DEFAULT 'Vérification Documents',
      progress INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates (id)
    )`);

    // Documents table
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER,
      candidate_id INTEGER,
      name TEXT NOT NULL,
      type TEXT,
      path TEXT NOT NULL,
      size INTEGER,
      category TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications (id),
      FOREIGN KEY (candidate_id) REFERENCES candidates (id)
    )`);

    // Commission members table
    db.run(`CREATE TABLE IF NOT EXISTS commission_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      department TEXT,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Meetings table
    db.run(`CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE,
      time TIME,
      type TEXT,
      status TEXT DEFAULT 'Planifiée',
      attendees TEXT,
      decisions TEXT,
      minutes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Evaluations table
    db.run(`CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      evaluator_id INTEGER,
      evaluator_name TEXT,
      score INTEGER,
      comments TEXT,
      evaluation_date DATE,
      status TEXT DEFAULT 'En cours',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications (id)
    )`);

    // Rapporteurs table
    db.run(`CREATE TABLE IF NOT EXISTS rapporteurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      institution TEXT,
      email TEXT,
      phone TEXT,
      specialization TEXT,
      evaluations_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Reports table
    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      rapporteur_id INTEGER,
      submission_date DATE,
      content TEXT,
      recommendation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications (id),
      FOREIGN KEY (rapporteur_id) REFERENCES rapporteurs (id)
    )`);

    // Defenses table
    db.run(`CREATE TABLE IF NOT EXISTS defenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      candidate_id INTEGER NOT NULL,
      date DATE,
      time TIME,
      location TEXT,
      jury TEXT,
      outcome TEXT,
      status TEXT DEFAULT 'Programmée',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications (id),
      FOREIGN KEY (candidate_id) REFERENCES candidates (id)
    )`);

    // Insert default admin user
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (name, email, password, role) 
            VALUES (?, ?, ?, ?)`,
            ['Administrateur', 'admin@fpo.ma', defaultPassword, 'Administrateur'],
            (err) => {
              if (err) {
                console.error('Error creating default admin:', err);
              } else {
                console.log('Default admin user created/verified');
              }
            });

    // Insert sample data
    insertSampleData();
  });
};

const insertSampleData = () => {
  // Sample candidates
  const candidates = [
    {
      first_name: 'Mohammed',
      last_name: 'Alami',
      email: 'alami@university.ma',
      phone: '0661234567',
      department: 'Informatique',
      thesis_title: 'Intelligence Artificielle et Big Data',
      thesis_date: '2018-06-15',
      thesis_supervisor: 'Pr. Hassan Benali',
      status: 'En cours'
    },
    {
      first_name: 'Fatima Zahra',
      last_name: 'Benali',
      email: 'benali@university.ma',
      phone: '0662345678',
      department: 'Mathématiques',
      thesis_title: 'Analyse Numérique Avancée',
      thesis_date: '2019-09-20',
      thesis_supervisor: 'Pr. Ahmed Mansouri',
      status: 'En attente'
    }
  ];

  candidates.forEach(candidate => {
    db.run(`INSERT OR IGNORE INTO candidates 
            (first_name, last_name, email, phone, department, thesis_title, thesis_date, thesis_supervisor, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            Object.values(candidate));
  });

  // Sample rapporteurs
  const rapporteurs = [
    {
      name: 'Pr. Rachid Alami',
      institution: 'Université Mohammed V - Rabat',
      email: 'r.alami@um5.ac.ma',
      phone: '0661234567',
      specialization: 'Intelligence Artificielle'
    },
    {
      name: 'Pr. Leila Benali',
      institution: 'Université Hassan II - Casablanca',
      email: 'l.benali@univh2c.ma',
      phone: '0662345678',
      specialization: 'Mathématiques Appliquées'
    },
    {
      name: 'Pr. Omar Fassi',
      institution: 'Université Cadi Ayyad - Marrakech',
      email: 'o.fassi@uca.ma',
      phone: '0663456789',
      specialization: 'Physique Théorique'
    }
  ];

  rapporteurs.forEach(rapporteur => {
    db.run(`INSERT OR IGNORE INTO rapporteurs 
            (name, institution, email, phone, specialization, evaluations_count)
            VALUES (?, ?, ?, ?, ?, 0)`,
            Object.values(rapporteur));
  });

  // Sample commission members
  const commissionMembers = [
    {
      name: 'Pr. Hassan Benali',
      role: 'Président',
      department: 'Informatique',
      email: 'h.benali@fpo.ma',
      phone: '0661234567'
    },
    {
      name: 'Pr. Ahmed Mansouri',
      role: 'Vice-Président',
      department: 'Mathématiques',
      email: 'a.mansouri@fpo.ma',
      phone: '0662345678'
    },
    {
      name: 'Pr. Fatima Zahra El Idrissi',
      role: 'Secrétaire',
      department: 'Physique',
      email: 'f.elidrissi@fpo.ma',
      phone: '0663456789'
    },
    {
      name: 'Pr. Khalid Benjelloun',
      role: 'Membre',
      department: 'Chimie',
      email: 'k.benjelloun@fpo.ma',
      phone: '0664567890'
    }
  ];

  commissionMembers.forEach(member => {
    db.run(`INSERT OR IGNORE INTO commission_members 
            (name, role, department, email, phone)
            VALUES (?, ?, ?, ?, ?)`,
            Object.values(member));
  });

  // Sample meetings
  const meetings = [
    {
      date: '2025-01-15',
      time: '10:00',
      type: 'Commission Scientifique',
      status: 'Terminée',
      attendees: 'Pr. Hassan Benali, Pr. Ahmed Mansouri, Pr. Fatima Zahra',
      decisions: 'Approbation de 3 candidatures',
      minutes: 'PV disponible'
    },
    {
      date: '2025-02-20',
      time: '14:00',
      type: 'Commission HU',
      status: 'Planifiée',
      attendees: 'Membres de la commission',
      decisions: '',
      minutes: ''
    }
  ];

  meetings.forEach(meeting => {
    db.run(`INSERT OR IGNORE INTO meetings 
            (date, time, type, status, attendees, decisions, minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            Object.values(meeting));
  });

  console.log('Sample data inserted');
};

module.exports = {
  db,
  initialize
};
