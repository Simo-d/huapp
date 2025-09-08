const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'HU Management System Report',
        Author: 'FPO - Faculté Polydisciplinaire d\'Ouarzazate',
        Subject: 'Habilitation Universitaire',
        Creator: 'HU Management System'
      }
    });
  }

  // Add header with logo and title
  addHeader(title) {
    this.doc
      .fontSize(20)
      .text('Faculté Polydisciplinaire d\'Ouarzazate', { align: 'center' })
      .fontSize(16)
      .text('Système de Gestion HU', { align: 'center' })
      .moveDown()
      .fontSize(18)
      .text(title, { align: 'center' })
      .moveDown()
      .fontSize(10)
      .text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' })
      .moveDown(2);
    
    // Add a line separator
    this.doc
      .moveTo(50, this.doc.y)
      .lineTo(550, this.doc.y)
      .stroke()
      .moveDown();
    
    return this;
  }

  // Add footer with page numbers
  addFooter() {
    const pages = this.doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);
      this.doc
        .fontSize(10)
        .text(
          `Page ${i + 1} sur ${pages.count}`,
          50,
          this.doc.page.height - 50,
          { align: 'center' }
        );
    }
    return this;
  }

  // Generate candidate report
  generateCandidateReport(candidate, applications = []) {
    this.addHeader('Fiche Candidat');

    // Personal Information Section
    this.doc
      .fontSize(14)
      .text('Informations Personnelles', { underline: true })
      .moveDown(0.5)
      .fontSize(11);

    const personalInfo = [
      ['Nom complet', `${candidate.first_name} ${candidate.last_name}`],
      ['Email', candidate.email],
      ['Téléphone', candidate.phone || 'Non spécifié'],
      ['Adresse', candidate.address || 'Non spécifiée'],
      ['Département', candidate.department || 'Non spécifié']
    ];

    personalInfo.forEach(([label, value]) => {
      this.doc
        .font('Helvetica-Bold')
        .text(`${label}: `, { continued: true })
        .font('Helvetica')
        .text(value);
    });

    // Academic Information Section
    this.doc
      .moveDown()
      .fontSize(14)
      .text('Informations Académiques', { underline: true })
      .moveDown(0.5)
      .fontSize(11);

    const academicInfo = [
      ['Titre de thèse', candidate.thesis_title || 'Non spécifié'],
      ['Date de thèse', candidate.thesis_date ? new Date(candidate.thesis_date).toLocaleDateString('fr-FR') : 'Non spécifiée'],
      ['Directeur de thèse', candidate.thesis_supervisor || 'Non spécifié'],
      ['Statut', candidate.status || 'En attente']
    ];

    academicInfo.forEach(([label, value]) => {
      this.doc
        .font('Helvetica-Bold')
        .text(`${label}: `, { continued: true })
        .font('Helvetica')
        .text(value);
    });

    // Applications Section
    if (applications.length > 0) {
      this.doc
        .moveDown()
        .fontSize(14)
        .text('Candidatures', { underline: true })
        .moveDown(0.5)
        .fontSize(11);

      applications.forEach((app, index) => {
        this.doc
          .text(`Candidature #${app.id}`)
          .text(`Date de soumission: ${new Date(app.submission_date || app.created_at).toLocaleDateString('fr-FR')}`)
          .text(`Statut: ${app.status}`)
          .text(`Progression: ${app.progress || 0}%`)
          .moveDown(0.5);
      });
    }

    return this;
  }

  // Generate applications list report
  generateApplicationsReport(applications) {
    this.addHeader('Rapport des Candidatures');

    this.doc
      .fontSize(12)
      .text(`Nombre total de candidatures: ${applications.length}`)
      .moveDown();

    // Statistics
    const stats = {
      'En attente': applications.filter(a => a.status === 'En attente').length,
      'En cours': applications.filter(a => a.status === 'En cours').length,
      'Approuvé': applications.filter(a => a.status === 'Approuvé').length,
      'Rejeté': applications.filter(a => a.status === 'Rejeté').length
    };

    this.doc
      .fontSize(14)
      .text('Statistiques', { underline: true })
      .moveDown(0.5)
      .fontSize(11);

    Object.entries(stats).forEach(([status, count]) => {
      this.doc.text(`${status}: ${count} candidature(s)`);
    });

    // Applications List
    this.doc
      .moveDown()
      .fontSize(14)
      .text('Liste des Candidatures', { underline: true })
      .moveDown(0.5);

    applications.forEach((app, index) => {
      if (index > 0 && index % 5 === 0) {
        this.doc.addPage();
      }

      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Candidature #${app.id}`, { underline: true })
        .font('Helvetica')
        .fontSize(10)
        .text(`Candidat: ${app.first_name} ${app.last_name}`)
        .text(`Email: ${app.email}`)
        .text(`Département: ${app.department || 'Non spécifié'}`)
        .text(`Date de soumission: ${new Date(app.submission_date || app.created_at).toLocaleDateString('fr-FR')}`)
        .text(`Statut: ${app.status}`)
        .text(`Étape actuelle: ${app.current_stage || 'Vérification Documents'}`)
        .text(`Progression: ${app.progress || 0}%`)
        .moveDown();
    });

    return this;
  }

  // Generate commission meeting report
  generateCommissionReport(meeting, members = [], decisions = []) {
    this.addHeader('Procès-Verbal de Réunion');

    this.doc
      .fontSize(14)
      .text('Informations de la Réunion', { underline: true })
      .moveDown(0.5)
      .fontSize(11)
      .text(`Date: ${new Date(meeting.date).toLocaleDateString('fr-FR')}`)
      .text(`Heure: ${meeting.time}`)
      .text(`Type: ${meeting.type || 'Commission Scientifique'}`)
      .text(`Statut: ${meeting.status}`)
      .moveDown();

    // Members present
    if (members.length > 0) {
      this.doc
        .fontSize(14)
        .text('Membres Présents', { underline: true })
        .moveDown(0.5)
        .fontSize(11);

      members.forEach(member => {
        this.doc.text(`• ${member.name} - ${member.role} (${member.department})`);
      });
      this.doc.moveDown();
    }

    // Decisions
    if (decisions.length > 0) {
      this.doc
        .fontSize(14)
        .text('Décisions Prises', { underline: true })
        .moveDown(0.5)
        .fontSize(11);

      decisions.forEach((decision, index) => {
        this.doc
          .text(`${index + 1}. ${decision.candidate}`)
          .text(`   Décision: ${decision.decision}`)
          .text(`   Remarques: ${decision.remarks || 'Aucune'}`)
          .moveDown(0.5);
      });
    }

    // Signature section
    this.doc
      .moveDown(2)
      .fontSize(11)
      .text('Signatures:', { underline: true })
      .moveDown(2)
      .text('Président: _______________________', 100, this.doc.y)
      .text('Secrétaire: _______________________', 300, this.doc.y);

    return this;
  }

  // Generate defense schedule report
  generateDefenseReport(defense, jury = []) {
    this.addHeader('Convocation de Soutenance');

    this.doc
      .fontSize(12)
      .text('Nous avons l\'honneur de vous informer que la soutenance d\'habilitation universitaire de:')
      .moveDown()
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`${defense.candidate_name}`, { align: 'center' })
      .font('Helvetica')
      .moveDown()
      .fontSize(12)
      .text('aura lieu:')
      .moveDown()
      .text(`Date: ${new Date(defense.date).toLocaleDateString('fr-FR')}`)
      .text(`Heure: ${defense.time}`)
      .text(`Lieu: ${defense.location}`)
      .moveDown();

    // Jury members
    if (jury.length > 0) {
      this.doc
        .fontSize(14)
        .text('Composition du Jury', { underline: true })
        .moveDown(0.5)
        .fontSize(11);

      jury.forEach(member => {
        this.doc.text(`• ${member.name} - ${member.role} (${member.institution})`);
      });
    }

    this.doc
      .moveDown(2)
      .fontSize(11)
      .text('Le Doyen')
      .moveDown(3)
      .text('_______________________');

    return this;
  }

  // Generate statistics report
  generateStatisticsReport(stats) {
    this.addHeader('Rapport Statistique');

    this.doc
      .fontSize(14)
      .text('Vue d\'ensemble', { underline: true })
      .moveDown(0.5)
      .fontSize(11);

    const overview = [
      ['Total des candidats', stats.totalCandidates || 0],
      ['Candidatures en attente', stats.pending || 0],
      ['Candidatures en cours', stats.inProgress || 0],
      ['Candidatures terminées', stats.completed || 0],
      ['Soutenances programmées', stats.defenses || 0]
    ];

    overview.forEach(([label, value]) => {
      this.doc
        .font('Helvetica-Bold')
        .text(`${label}: `, { continued: true })
        .font('Helvetica')
        .text(value.toString());
    });

    // Monthly statistics
    if (stats.monthly) {
      this.doc
        .moveDown()
        .fontSize(14)
        .text('Statistiques Mensuelles', { underline: true })
        .moveDown(0.5)
        .fontSize(11);

      stats.monthly.forEach(month => {
        this.doc.text(`${month.month}: ${month.applications} candidature(s), ${month.completed} terminée(s)`);
      });
    }

    // Department distribution
    if (stats.byDepartment) {
      this.doc
        .moveDown()
        .fontSize(14)
        .text('Répartition par Département', { underline: true })
        .moveDown(0.5)
        .fontSize(11);

      Object.entries(stats.byDepartment).forEach(([dept, count]) => {
        this.doc.text(`${dept}: ${count} candidat(s)`);
      });
    }

    return this;
  }

  // Save the PDF
  async save(filename) {
    const dir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, filename);
    
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filepath);
      this.doc.pipe(stream);
      this.doc.end();
      
      stream.on('finish', () => {
        resolve(filepath);
      });
      
      stream.on('error', reject);
    });
  }

  // Get PDF as buffer
  async getBuffer() {
    return new Promise((resolve, reject) => {
      const chunks = [];
      
      this.doc.on('data', chunk => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);
      
      this.doc.end();
    });
  }
}

module.exports = PDFGenerator;
