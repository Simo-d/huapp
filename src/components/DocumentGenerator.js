import React, { useState, useEffect } from 'react';
import {
  X,
  FileSignature,
  FileCheck,
  Mail,
  Users,
  FileText,
  Award,
  FilePlus,
  Loader,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import api from '../utils/api';
import './DocumentGenerator.css';

const DocumentGenerator = ({ candidates, applications, onClose, onGenerated }) => {
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [additionalData, setAdditionalData] = useState({});
  const [rapporteurs, setRapporteurs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [error, setError] = useState('');

  const documentTypes = [
    {
      id: 'authorization_inscription',
      name: 'Autorisation d\'inscription',
      icon: <FileSignature size={32} />,
      description: 'Générer une autorisation d\'inscription pour un candidat HU',
      requiredData: ['candidate'],
      color: 'blue'
    },
    {
      id: 'authorization_defense',
      name: 'Autorisation de soutenance',
      icon: <FileCheck size={32} />,
      description: 'Autoriser un candidat à soutenir son habilitation',
      requiredData: ['candidate'],
      color: 'green'
    },
    {
      id: 'invitation',
      name: 'Lettre d\'invitation',
      icon: <Mail size={32} />,
      description: 'Inviter un rapporteur externe au jury',
      requiredData: ['candidate', 'rapporteur', 'defense_date'],
      color: 'purple'
    },
    {
      id: 'convocation',
      name: 'Convocation de soutenance',
      icon: <Users size={32} />,
      description: 'Convoquer un candidat pour sa soutenance',
      requiredData: ['candidate', 'defense_info'],
      color: 'orange'
    },
    {
      id: 'pv_commission',
      name: 'PV de Commission',
      icon: <FileText size={32} />,
      description: 'Procès-verbal de réunion de la commission',
      requiredData: ['meeting', 'decisions'],
      color: 'indigo'
    },
    {
      id: 'diploma',
      name: 'Diplôme HU',
      icon: <Award size={32} />,
      description: 'Générer le diplôme d\'habilitation universitaire',
      requiredData: ['candidate', 'defense_result'],
      color: 'yellow'
    },
    {
      id: 'summary',
      name: 'Dossier complet',
      icon: <FilePlus size={32} />,
      description: 'Générer un résumé complet du dossier candidat',
      requiredData: ['candidate'],
      color: 'teal'
    }
  ];

  useEffect(() => {
    // Load additional data if needed
    loadAdditionalData();
  }, []);

  const loadAdditionalData = async () => {
    try {
      // Load rapporteurs
      const rapporteursRes = await api.get('/rapporteurs');
      setRapporteurs(rapporteursRes.data || []);

      // Load meetings
      const meetingsRes = await api.get('/meetings');
      setMeetings(meetingsRes.data || []);
    } catch (error) {
      console.error('Error loading additional data:', error);
    }
  };

  const handleGenerateDocument = async () => {
    setGenerating(true);
    setError('');

    try {
      let endpoint = '';
      let payload = {};

      switch (documentType) {
        case 'authorization_inscription':
          endpoint = `/generation/authorization/${selectedCandidate}`;
          payload = { type: 'inscription' };
          break;

        case 'authorization_defense':
          endpoint = `/generation/authorization/${selectedCandidate}`;
          payload = { type: 'soutenance' };
          break;

        case 'invitation':
          endpoint = `/generation/invitation/${additionalData.rapporteurId}`;
          payload = {
            candidateId: selectedCandidate,
            defenseDate: additionalData.defenseDate,
            defenseTime: additionalData.defenseTime
          };
          break;

        case 'convocation':
          endpoint = `/generation/convocation/${selectedCandidate}`;
          payload = {
            date: additionalData.defenseDate,
            time: additionalData.defenseTime,
            location: additionalData.location || 'Salle de conférences, FPO'
          };
          break;

        case 'pv_commission':
          endpoint = `/generation/pv/${additionalData.meetingId}`;
          payload = {
            decisions: additionalData.decisions || []
          };
          break;

        case 'diploma':
          endpoint = `/generation/diploma/${selectedCandidate}`;
          payload = {
            defenseDate: additionalData.defenseDate,
            grade: additionalData.grade
          };
          break;

        case 'summary':
          endpoint = `/generation/summary/${selectedCandidate}`;
          break;

        default:
          throw new Error('Type de document non valide');
      }

      const response = await api.post(endpoint, payload);
      setGeneratedDoc(response.data);
      setStep(3); // Success step
    } catch (error) {
      console.error('Error generating document:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Erreur lors de la génération du document';
      setError(errorMessage);
      console.error('Full error details:', error.response?.data);
    } finally {
      setGenerating(false);
    }
  };

  const renderStep1 = () => (
    <div className="generator-step">
      <h3 className="step-title">Sélectionner le type de document</h3>
      <div className="document-types-grid">
        {documentTypes.map(type => (
          <div
            key={type.id}
            className={`document-type-card ${documentType === type.id ? 'selected' : ''} color-${type.color}`}
            onClick={() => {
              setDocumentType(type.id);
              setError('');
            }}
          >
            <div className="type-icon">{type.icon}</div>
            <h4 className="type-name">{type.name}</h4>
            <p className="type-description">{type.description}</p>
          </div>
        ))}
      </div>
      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Annuler
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setStep(2)}
          disabled={!documentType}
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedType = documentTypes.find(t => t.id === documentType);
    
    return (
      <div className="generator-step">
        <h3 className="step-title">Informations requises pour {selectedType.name}</h3>
        
        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="form-container">
          {/* Candidate selection */}
          {selectedType.requiredData.includes('candidate') && (
            <div className="form-group">
              <label className="form-label">Candidat *</label>
              <select
                className="form-input"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                required
              >
                <option value="">-- Sélectionner un candidat --</option>
                {candidates.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.first_name} {candidate.last_name} - {candidate.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rapporteur selection for invitation */}
          {selectedType.requiredData.includes('rapporteur') && (
            <div className="form-group">
              <label className="form-label">Rapporteur *</label>
              <select
                className="form-input"
                value={additionalData.rapporteurId || ''}
                onChange={(e) => setAdditionalData({...additionalData, rapporteurId: e.target.value})}
                required
              >
                <option value="">-- Sélectionner un rapporteur --</option>
                {rapporteurs.map(rapporteur => (
                  <option key={rapporteur.id} value={rapporteur.id}>
                    {rapporteur.name} - {rapporteur.institution}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Meeting selection for PV */}
          {selectedType.requiredData.includes('meeting') && (
            <div className="form-group">
              <label className="form-label">Réunion *</label>
              <select
                className="form-input"
                value={additionalData.meetingId || ''}
                onChange={(e) => setAdditionalData({...additionalData, meetingId: e.target.value})}
                required
              >
                <option value="">-- Sélectionner une réunion --</option>
                {meetings.map(meeting => (
                  <option key={meeting.id} value={meeting.id}>
                    {new Date(meeting.date).toLocaleDateString('fr-FR')} - {meeting.type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Defense date for various documents */}
          {(selectedType.requiredData.includes('defense_date') || 
            selectedType.requiredData.includes('defense_info') ||
            documentType === 'diploma') && (
            <>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Date de soutenance
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={additionalData.defenseDate || ''}
                  onChange={(e) => setAdditionalData({...additionalData, defenseDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Heure
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={additionalData.defenseTime || ''}
                  onChange={(e) => setAdditionalData({...additionalData, defenseTime: e.target.value})}
                />
              </div>
            </>
          )}

          {/* Location for convocation */}
          {selectedType.requiredData.includes('defense_info') && (
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Lieu
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Salle de conférences, FPO"
                value={additionalData.location || ''}
                onChange={(e) => setAdditionalData({...additionalData, location: e.target.value})}
              />
            </div>
          )}

          {/* Grade for diploma */}
          {documentType === 'diploma' && (
            <div className="form-group">
              <label className="form-label">Mention *</label>
              <select
                className="form-input"
                value={additionalData.grade || ''}
                onChange={(e) => setAdditionalData({...additionalData, grade: e.target.value})}
                required
              >
                <option value="">-- Sélectionner une mention --</option>
                <option value="Très Honorable">Très Honorable</option>
                <option value="Honorable">Honorable</option>
                <option value="Passable">Passable</option>
              </select>
            </div>
          )}

          {/* Decisions for PV */}
          {selectedType.requiredData.includes('decisions') && (
            <div className="form-group">
              <label className="form-label">Décisions prises</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Entrez les décisions de la commission (une par ligne)"
                value={additionalData.decisionsText || ''}
                onChange={(e) => {
                  const text = e.target.value;
                  const decisions = text.split('\n').filter(d => d.trim()).map(d => ({
                    candidate: d.split(':')[0]?.trim() || '',
                    decision: d.split(':')[1]?.trim() || d.trim(),
                    remarks: ''
                  }));
                  setAdditionalData({
                    ...additionalData,
                    decisionsText: text,
                    decisions
                  });
                }}
              />
              <small>Format: Nom candidat: Décision prise</small>
            </div>
          )}
        </div>

        <div className="step-actions">
          <button className="btn btn-secondary" onClick={() => setStep(1)}>
            Retour
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerateDocument}
            disabled={generating || (!selectedCandidate && selectedType.requiredData.includes('candidate'))}
          >
            {generating ? (
              <>
                <Loader size={20} className="spinner" />
                Génération...
              </>
            ) : (
              'Générer le document'
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="generator-step success-step">
      <div className="success-icon">
        <CheckCircle size={64} color="#10b981" />
      </div>
      <h3 className="step-title">Document généré avec succès!</h3>
      {generatedDoc && (
        <div className="generated-info">
          <p>Le document a été généré et sauvegardé.</p>
          <p className="file-name">{generatedDoc.filename}</p>
          <div className="success-actions">
            <a
              href={`http://localhost:5000${generatedDoc.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <FileText size={20} />
              Ouvrir le document
            </a>
            <button className="btn btn-success" onClick={() => {
              setStep(1);
              setDocumentType('');
              setSelectedCandidate('');
              setAdditionalData({});
              setGeneratedDoc(null);
            }}>
              Générer un autre document
            </button>
          </div>
        </div>
      )}
      <div className="step-actions">
        <button className="btn btn-secondary" onClick={() => {
          onGenerated();
        }}>
          Fermer
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Générateur de Documents</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Progress indicator */}
          <div className="progress-indicator">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Type</span>
            </div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Informations</span>
            </div>
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Terminé</span>
            </div>
          </div>

          {/* Step content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;
