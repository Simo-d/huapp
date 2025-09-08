const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class DocumentTemplates {
  constructor() {
    this.fontBold = 'Helvetica-Bold';
    this.fontRegular = 'Helvetica';
    this.primaryColor = '#1e40af';
    this.secondaryColor = '#64748b';
  }

  // Create a new PDF document with standard settings
  createDocument() {
    return new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Document HU',
        Author: 'FPO - Faculté Polydisciplinaire d\'Ouarzazate',
        Subject: 'Habilitation Universitaire',
        Creator: 'HU Management System'
      }
    });
  }

  // Add official header with logo and institution details
  addOfficialHeader(doc) {
    // Header background
    doc.rect(0, 0, doc.page.width, 120)
       .fill('#f8fafc');

    // Institution name
    doc.fillColor('#1e40af')
       .fontSize(22)
       .font(this.fontBold)
       .text('ROYAUME DU MAROC', 50, 30, { align: 'center' })
       .fontSize(18)
       .text('Université Ibn Zohr', 50, 55, { align: 'center' })
       .fontSize(16)
       .text('Faculté Polydisciplinaire d\'Ouarzazate', 50, 75, { align: 'center' });

    // Reset color
    doc.fillColor('black');
    
    // Line separator
    doc.moveTo(50, 110)
       .lineTo(doc.page.width - 50, 110)
       .stroke('#e2e8f0');

    doc.moveDown(3);
    return doc;
  }

  // Generate inscription authorization
  async generateInscriptionAuthorization(candidate, filename) {
    const doc = this.createDocument();
    this.addOfficialHeader(doc);

    // Title
    doc.fontSize(20)
       .font(this.fontBold)
       .text('AUTORISATION D\'INSCRIPTION', { align: 'center' })
       .moveDown()
       .fontSize(14)
       .text('Habilitation Universitaire', { align: 'center' })
       .moveDown(2);

    // Content
    doc.fontSize(12)
       .font(this.fontRegular)
       .text('Le Doyen de la Faculté Polydisciplinaire d\'Ouarzazate,', { align: 'left' })
       .moveDown()
       .text('Vu la demande d\'inscription à l\'Habilitation Universitaire présentée par:', { align: 'left' })
       .moveDown();

    // Candidate information box
    doc.rect(doc.x - 10, doc.y - 5, doc.page.width - 100, 100)
       .stroke('#e2e8f0');

    doc.font(this.fontBold)
       .text(`Nom et Prénom: `, doc.x, doc.y, { continued: true })
       .font(this.fontRegular)
       .text(`${candidate.first_name} ${candidate.last_name}`)
       .moveDown(0.5);

    doc.font(this.fontBold)
       .text(`Département: `, { continued: true })
       .font(this.fontRegular)
       .text(candidate.department || 'Non spécifié')
       .moveDown(0.5);

    doc.font(this.fontBold)
       .text(`Titre de la thèse: `, { continued: true })
       .font(this.fontRegular)
       .text(candidate.thesis_title || 'Non spécifié')
       .moveDown(0.5);

    doc.font(this.fontBold)
       .text(`Date de soutenance de thèse: `, { continued: true })
       .font(this.fontRegular)
       .text(candidate.thesis_date ? new Date(candidate.thesis_date).toLocaleDateString('fr-FR') : 'Non spécifiée');

    doc.moveDown(3);

    // Authorization text
    doc.fontSize(12)
       .font(this.fontRegular)
       .text('Après examen du dossier et avis favorable de la commission scientifique,')
       .moveDown()
       .font(this.fontBold)
       .text('AUTORISE', { align: 'center' })
       .moveDown()
       .font(this.fontRegular)
       .text('l\'inscription du candidat susmentionné à l\'Habilitation Universitaire pour l\'année universitaire 2024-2025.')
       .moveDown(2);

    // Date and signature
    doc.text(`Fait à Ouarzazate, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' })
       .moveDown(3)
       .text('Le Doyen', { align: 'right' })
       .moveDown(3)
       .text('_____________________', { align: 'right' });

    // Footer
    this.addFooter(doc);

    return this.saveDocument(doc, filename);
  }

  // Generate defense authorization
  async generateDefenseAuthorization(candidate, filename) {
    const doc = this.createDocument();
    this.addOfficialHeader(doc);

    doc.fontSize(20)
       .font(this.fontBold)
       .text('AUTORISATION DE SOUTENANCE', { align: 'center' })
       .moveDown()
       .fontSize(14)
       .text('Habilitation Universitaire', { align: 'center' })
       .moveDown(2);

    doc.fontSize(12)
       .font(this.fontRegular)
       .text('Suite à l\'avis favorable des rapporteurs et de la commission scientifique,')
       .moveDown()
       .text('Le candidat:', { align: 'left' })
       .moveDown();

    // Candidate info
    doc.font(this.fontBold)
       .fontSize(14)
       .text(`${candidate.first_name} ${candidate.last_name}`, { align: 'center' })
       .moveDown()
       .font(this.fontRegular)
       .fontSize(12)
       .text(`Département: ${candidate.department || 'Non spécifié'}`, { align: 'center' })
       .moveDown(2);

    doc.text('Est autorisé(e) à soutenir son Habilitation Universitaire intitulée:')
       .moveDown()
       .font('Helvetica-Oblique')
       .text(`"${candidate.thesis_title || 'Non spécifié'}"`, { align: 'center' })
       .moveDown(2);

    doc.font(this.fontRegular)
       .text('Cette autorisation est valable pour une durée de six mois à compter de la date de signature.')
       .moveDown(3);

    doc.text(`Fait à Ouarzazate, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' })
       .moveDown(3)
       .text('Le Président de l\'Université', 50, doc.y)
       .text('Le Doyen de la Faculté', 350, doc.y)
       .moveDown(3)
       .text('_____________________', 50, doc.y)
       .text('_____________________', 350, doc.y);

    this.addFooter(doc);
    return this.saveDocument(doc, filename);
  }

  // Generate invitation letter for rapporteur
  async generateInvitationLetter(rapporteur, candidate, defenseInfo, filename) {
    const doc = this.createDocument();
    this.addOfficialHeader(doc);

    doc.fontSize(16)
       .font(this.fontBold)
       .text('LETTRE D\'INVITATION', { align: 'center' })
       .moveDown(2);

    doc.fontSize(12)
       .font(this.fontRegular)
       .text(`${rapporteur.name}`)
       .text(`${rapporteur.institution}`)
       .text(`${rapporteur.email}`)
       .moveDown(2);

    doc.text('Objet: Invitation à participer au jury de soutenance d\'Habilitation Universitaire')
       .moveDown(2);

    doc.text(`${rapporteur.gender === 'F' ? 'Madame' : 'Monsieur'} le Professeur,`)
       .moveDown()
       .text('J\'ai l\'honneur de vous inviter à participer en tant que rapporteur au jury de soutenance d\'Habilitation Universitaire de:')
       .moveDown();

    doc.font(this.fontBold)
       .text(`${candidate.first_name} ${candidate.last_name}`, { align: 'center' })
       .moveDown()
       .font(this.fontRegular)
       .text('Sur le sujet:', { align: 'center' })
       .font('Helvetica-Oblique')
       .text(`"${candidate.thesis_title}"`, { align: 'center' })
       .moveDown(2);

    doc.font(this.fontRegular)
       .text('La soutenance aura lieu:')
       .moveDown()
       .text(`Date: ${defenseInfo.date ? new Date(defenseInfo.date).toLocaleDateString('fr-FR') : 'À déterminer'}`)
       .text(`Heure: ${defenseInfo.time || 'À déterminer'}`)
       .text(`Lieu: Salle de conférences, FPO`)
       .moveDown(2);

    doc.text('Nous serions très honorés de votre présence et de votre contribution à l\'évaluation de ce travail.')
       .moveDown()
       .text('Dans l\'attente de votre réponse, veuillez agréer, Monsieur le Professeur, l\'expression de mes salutations distinguées.')
       .moveDown(3);

    doc.text(`Ouarzazate, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' })
       .moveDown(2)
       .text('Le Doyen', { align: 'right' })
       .moveDown(3)
       .text('_____________________', { align: 'right' });

    this.addFooter(doc);
    return this.saveDocument(doc, filename);
  }

  // Generate commission PV (Procès-Verbal)
  async generateCommissionPV(meeting, members, decisions, filename) {
    const doc = this.createDocument();
    this.addOfficialHeader(doc);

    doc.fontSize(18)
       .font(this.fontBold)
       .text('PROCÈS-VERBAL', { align: 'center' })
       .fontSize(14)
       .text('Commission Scientifique', { align: 'center' })
       .moveDown(2);

    // Meeting info
    doc.fontSize(12)
       .font(this.fontRegular)
       .text(`Date: ${new Date(meeting.date).toLocaleDateString('fr-FR')}`)
       .text(`Heure: ${meeting.time}`)
       .text(`Type: ${meeting.type || 'Réunion ordinaire'}`)
       .moveDown(2);

    // Members present
    doc.font(this.fontBold)
       .text('Membres présents:')
       .font(this.fontRegular);

    members.forEach(member => {
      doc.text(`• ${member.name} - ${member.role} (${member.department})`);
    });
    doc.moveDown(2);

    // Agenda
    doc.font(this.fontBold)
       .text('Ordre du jour:')
       .font(this.fontRegular)
       .text('1. Examen des dossiers de candidature')
       .text('2. Désignation des rapporteurs')
       .text('3. Autorisation de soutenance')
       .text('4. Questions diverses')
       .moveDown(2);

    // Decisions
    doc.font(this.fontBold)
       .text('Décisions prises:')
       .font(this.fontRegular);

    if (decisions && decisions.length > 0) {
      decisions.forEach((decision, index) => {
        doc.moveDown()
           .font(this.fontBold)
           .text(`Dossier ${index + 1}: ${decision.candidate}`)
           .font(this.fontRegular)
           .text(`Décision: ${decision.decision}`)
           .text(`Observations: ${decision.remarks || 'Aucune'}`);
      });
    } else {
      doc.text('Aucune décision enregistrée');
    }

    doc.moveDown(3);

    // Signatures
    doc.text('Signatures des membres:', { underline: true })
       .moveDown(2);

    const signaturesPerRow = 2;
    const signatureWidth = (doc.page.width - 100) / signaturesPerRow;
    
    members.slice(0, 6).forEach((member, index) => {
      const row = Math.floor(index / signaturesPerRow);
      const col = index % signaturesPerRow;
      const x = 50 + (col * signatureWidth);
      const y = doc.y + (row * 60);
      
      doc.text(member.name, x, y)
         .text('_____________________', x, y + 20);
    });

    this.addFooter(doc);
    return this.saveDocument(doc, filename);
  }

  // Generate diploma
  async generateDiploma(candidate, defenseInfo, filename) {
    const doc = this.createDocument();
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#fef3c7');

    // Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(3)
       .stroke('#d97706');

    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .lineWidth(1)
       .stroke('#f59e0b');

    // Header
    doc.fillColor('#7c2d12')
       .fontSize(24)
       .font(this.fontBold)
       .text('ROYAUME DU MAROC', 0, 80, { align: 'center' })
       .fontSize(20)
       .text('Université Ibn Zohr', 0, 110, { align: 'center' })
       .fontSize(18)
       .text('Faculté Polydisciplinaire d\'Ouarzazate', 0, 135, { align: 'center' });

    // Title
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#991b1b')
       .text('DIPLÔME', 0, 220, { align: 'center' })
       .fontSize(24)
       .text('D\'HABILITATION UNIVERSITAIRE', 0, 265, { align: 'center' });

    // Content
    doc.fillColor('black')
       .fontSize(14)
       .font(this.fontRegular)
       .text('Nous, Doyen de la Faculté Polydisciplinaire d\'Ouarzazate,', 0, 340, { align: 'center' })
       .text('certifions que', 0, 365, { align: 'center' })
       .moveDown();

    doc.fontSize(22)
       .font(this.fontBold)
       .text(`${candidate.first_name} ${candidate.last_name}`, 0, 410, { align: 'center' });

    doc.fontSize(14)
       .font(this.fontRegular)
       .text('a soutenu avec succès son Habilitation Universitaire', 0, 460, { align: 'center' })
       .text(`le ${defenseInfo.defenseDate ? new Date(defenseInfo.defenseDate).toLocaleDateString('fr-FR') : 'Date non spécifiée'}`, 0, 485, { align: 'center' })
       .text(`avec la mention: ${defenseInfo.grade || 'Très Honorable'}`, 0, 510, { align: 'center' });

    doc.text('En foi de quoi, nous lui délivrons le présent diplôme', 0, 560, { align: 'center' })
       .text('pour servir et valoir ce que de droit.', 0, 585, { align: 'center' });

    // Date and signatures
    doc.text(`Fait à Ouarzazate, le ${new Date().toLocaleDateString('fr-FR')}`, 0, 640, { align: 'center' });

    doc.fontSize(12)
       .text('Le Président de l\'Université', 100, 700)
       .text('Le Doyen de la Faculté', 350, 700);

    return this.saveDocument(doc, filename);
  }

  // Generate candidate complete summary
  async generateCandidateSummary(candidate, applications, documents, filename) {
    const doc = this.createDocument();
    this.addOfficialHeader(doc);

    doc.fontSize(18)
       .font(this.fontBold)
       .text('DOSSIER COMPLET DU CANDIDAT', { align: 'center' })
       .moveDown(2);

    // Personal Information
    doc.fontSize(14)
       .font(this.fontBold)
       .text('1. INFORMATIONS PERSONNELLES', { underline: true })
       .moveDown(0.5)
       .fontSize(11)
       .font(this.fontRegular);

    const personalInfo = [
      ['Nom complet', `${candidate.first_name} ${candidate.last_name}`],
      ['Email', candidate.email],
      ['Téléphone', candidate.phone || 'Non spécifié'],
      ['Adresse', candidate.address || 'Non spécifiée'],
      ['Département', candidate.department || 'Non spécifié']
    ];

    personalInfo.forEach(([label, value]) => {
      doc.font(this.fontBold)
         .text(`${label}: `, { continued: true })
         .font(this.fontRegular)
         .text(value);
    });

    doc.moveDown();

    // Academic Information
    doc.fontSize(14)
       .font(this.fontBold)
       .text('2. INFORMATIONS ACADÉMIQUES', { underline: true })
       .moveDown(0.5)
       .fontSize(11)
       .font(this.fontRegular);

    const academicInfo = [
      ['Titre de thèse', candidate.thesis_title || 'Non spécifié'],
      ['Date de soutenance', candidate.thesis_date ? new Date(candidate.thesis_date).toLocaleDateString('fr-FR') : 'Non spécifiée'],
      ['Directeur de thèse', candidate.thesis_supervisor || 'Non spécifié']
    ];

    academicInfo.forEach(([label, value]) => {
      doc.font(this.fontBold)
         .text(`${label}: `, { continued: true })
         .font(this.fontRegular)
         .text(value);
    });

    doc.moveDown();

    // Applications History
    if (applications && applications.length > 0) {
      doc.fontSize(14)
         .font(this.fontBold)
         .text('3. HISTORIQUE DES CANDIDATURES', { underline: true })
         .moveDown(0.5)
         .fontSize(11)
         .font(this.fontRegular);

      applications.forEach((app, index) => {
        doc.font(this.fontBold)
           .text(`Candidature #${app.id}:`)
           .font(this.fontRegular)
           .text(`• Date: ${new Date(app.submission_date || app.created_at).toLocaleDateString('fr-FR')}`)
           .text(`• Statut: ${app.status}`)
           .text(`• Étape actuelle: ${app.current_stage || 'N/A'}`)
           .text(`• Progression: ${app.progress || 0}%`)
           .moveDown(0.5);
      });
    }

    // Documents List
    if (documents && documents.length > 0) {
      doc.addPage();
      doc.fontSize(14)
         .font(this.fontBold)
         .text('4. DOCUMENTS SOUMIS', { underline: true })
         .moveDown(0.5)
         .fontSize(11)
         .font(this.fontRegular);

      const docsByCategory = {};
      documents.forEach(doc => {
        if (!docsByCategory[doc.category]) {
          docsByCategory[doc.category] = [];
        }
        docsByCategory[doc.category].push(doc);
      });

      Object.entries(docsByCategory).forEach(([category, docs]) => {
        doc.font(this.fontBold)
           .text(`${category}:`)
           .font(this.fontRegular);
        
        docs.forEach(d => {
          doc.text(`• ${d.name} (${new Date(d.uploaded_at).toLocaleDateString('fr-FR')})`);
        });
        doc.moveDown(0.5);
      });
    }

    // Summary
    doc.moveDown()
       .fontSize(14)
       .font(this.fontBold)
       .text('5. RÉSUMÉ', { underline: true })
       .moveDown(0.5)
       .fontSize(11)
       .font(this.fontRegular)
       .text(`Statut actuel: ${candidate.status || 'En attente'}`)
       .text(`Date d\'inscription: ${new Date(candidate.created_at).toLocaleDateString('fr-FR')}`)
       .text(`Nombre de candidatures: ${applications ? applications.length : 0}`)
       .text(`Nombre de documents: ${documents ? documents.length : 0}`);

    this.addFooter(doc);
    return this.saveDocument(doc, filename);
  }

  // Generate convocation
  async generateConvocation(data, filename) {
    const doc = this.createDocument();
    this.addOfficialHeader(doc);

    doc.fontSize(18)
       .font(this.fontBold)
       .text('CONVOCATION', { align: 'center' })
       .moveDown()
       .fontSize(14)
       .text('Soutenance d\'Habilitation Universitaire', { align: 'center' })
       .moveDown(2);

    doc.fontSize(12)
       .font(this.fontRegular)
       .text(`${data.first_name} ${data.last_name}`)
       .text(`${data.email}`)
       .moveDown(2);

    doc.text('Vous êtes convoqué(e) pour la soutenance de votre Habilitation Universitaire qui aura lieu:')
       .moveDown();

    doc.font(this.fontBold)
       .text(`Date: ${data.date ? new Date(data.date).toLocaleDateString('fr-FR') : 'À confirmer'}`)
       .text(`Heure: ${data.time || 'À confirmer'}`)
       .text(`Lieu: ${data.location || 'Salle de conférences, FPO'}`)
       .moveDown(2);

    doc.font(this.fontRegular)
       .text('Vous devez vous présenter 30 minutes avant l\'heure prévue avec:')
       .text('• Une copie de votre thèse d\'habilitation')
       .text('• Votre présentation (support numérique)')
       .text('• Une pièce d\'identité')
       .moveDown(2);

    doc.text('Nous vous souhaitons plein succès dans cette étape importante.')
       .moveDown(3);

    doc.text(`Ouarzazate, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' })
       .moveDown(2)
       .text('Le Doyen', { align: 'right' })
       .moveDown(3)
       .text('_____________________', { align: 'right' });

    this.addFooter(doc);
    return this.saveDocument(doc, filename);
  }

  // Add footer to document
  addFooter(doc) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 50;

    doc.fontSize(8)
       .fillColor('#94a3b8')
       .text('Faculté Polydisciplinaire d\'Ouarzazate - BP 638, Ouarzazate 45000, Maroc', 50, footerY, { align: 'center' })
       .text('Tél: +212 5 24 88 32 25 - Email: decanat.fpo@uiz.ac.ma', 50, footerY + 10, { align: 'center' });
  }

  // Save document to file
  async saveDocument(doc, filename) {
    const dir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, filename);
    
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      doc.end();
      
      stream.on('finish', () => {
        resolve(filepath);
      });
      
      stream.on('error', reject);
    });
  }
}

module.exports = DocumentTemplates;
