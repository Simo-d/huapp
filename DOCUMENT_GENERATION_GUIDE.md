# Document Generation System - HU Management

## Overview
The HU Management System now includes a comprehensive document generation module that allows administrators to create official documents automatically from templates.

## Features

### Document Types Available

1. **Authorization Documents**
   - Inscription Authorization (Autorisation d'inscription)
   - Defense Authorization (Autorisation de soutenance)

2. **Invitation Letters**
   - External Examiner Invitations (Lettres d'invitation aux rapporteurs)

3. **Convocations**
   - Defense Convocations for Candidates

4. **Commission Documents**
   - Meeting Minutes (Procès-verbaux de commission)

5. **Diplomas**
   - HU Diploma Generation

6. **Summary Reports**
   - Complete Candidate File Summary

## How to Use

### From the Documents Page

1. Navigate to the **Documents** section in the sidebar
2. Click the **"Générer"** (Generate) button in the header
3. Follow the 3-step wizard:
   - **Step 1**: Select the document type
   - **Step 2**: Fill in required information
   - **Step 3**: Generate and download the document

### Document Templates Tab

1. In the Documents page, click on the **"Modèles"** tab
2. Browse available document templates
3. Click **"Générer"** on any template card to start generation

## API Endpoints

### Generation Endpoints

```javascript
// Generate authorization document
POST /api/generation/authorization/:candidateId
Body: { type: 'inscription' | 'soutenance' }

// Generate invitation letter
POST /api/generation/invitation/:rapporteurId
Body: { candidateId, defenseDate, defenseTime }

// Generate convocation
POST /api/generation/convocation/:candidateId
Body: { date, time, location }

// Generate commission PV
POST /api/generation/pv/:meetingId
Body: { decisions: [...] }

// Generate diploma
POST /api/generation/diploma/:candidateId
Body: { defenseDate, grade }

// Generate candidate summary
POST /api/generation/summary/:candidateId

// Batch generation
POST /api/generation/batch
Body: { type, candidateIds, template }
```

## Document Storage

Generated documents are:
- Saved as PDFs in the `/server/reports` directory
- Referenced in the database with metadata
- Accessible via the Documents page
- Downloadable through the web interface

## Customization

### Modifying Templates

Document templates are defined in `/server/utils/documentTemplates.js`. Each template method includes:
- Header with official institution branding
- Dynamic content based on candidate/meeting data
- Footer with contact information
- Signature blocks where appropriate

### Adding New Templates

1. Add a new method in `documentTemplates.js`
2. Create corresponding route in `/server/routes/generation.js`
3. Update the frontend `DocumentGenerator` component
4. Add the template to the `documentTypes` array

## Design Features

### PDF Generation
- Uses PDFKit library for professional PDF creation
- A4 format with proper margins
- Official headers and footers
- Signature blocks
- Date stamping

### UI/UX
- Step-by-step wizard interface
- Real-time validation
- Progress indicators
- Success confirmations
- Error handling

## Security

- JWT authentication required for all generation endpoints
- Role-based access control
- Input validation
- Safe file naming conventions

## Testing

### Quick Test
1. Login as admin (admin@fpo.ma / admin123)
2. Go to Documents
3. Click "Générer"
4. Select "Autorisation d'inscription"
5. Choose a candidate
6. Generate the document

## Troubleshooting

### Common Issues

**Document not generating:**
- Check that all required fields are filled
- Ensure the candidate/meeting exists in the database
- Verify the server is running on port 5000

**PDF not downloading:**
- Check browser popup blocker settings
- Verify the `/reports` directory exists
- Check file permissions

**Missing data in generated document:**
- Ensure candidate has all required information
- Check database for complete records
- Review console for error messages

## Future Enhancements

- Email delivery of generated documents
- Digital signature integration
- Multi-language support (Arabic)
- Template versioning
- Audit trail for generated documents
- Bulk operations UI
- Custom template builder

## Support

For issues or questions about the document generation system:
1. Check the error messages in the browser console
2. Review server logs for detailed error information
3. Ensure all dependencies are installed
4. Contact IT support if issues persist
