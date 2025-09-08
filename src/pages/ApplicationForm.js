import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  FileText,
  BookOpen,
  Award,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    
    // Academic Information
    department: '',
    thesisTitle: '',
    thesisDate: '',
    thesisSupervisor: '',
    
    // Research Work
    publications: [],
    conferences: [],
    projects: [],
    
    // Teaching Experience
    courses: [],
    supervision: [],
    
    // Documents
    documents: []
  });

  const steps = [
    { id: 1, title: 'Informations Personnelles', icon: User },
    { id: 2, title: 'Parcours Académique', icon: BookOpen },
    { id: 3, title: 'Travaux de Recherche', icon: FileText },
    { id: 4, title: 'Expérience Pédagogique', icon: Award },
    { id: 5, title: 'Documents', icon: FileText }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
    navigate('/applications');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nouvelle Candidature HU</h1>
          <p className="page-subtitle">Remplissez le formulaire de candidature</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/applications')}>
          <ArrowLeft size={20} />
          Retour
        </button>
      </div>

      {/* Progress Steps */}
      <div className="steps-container">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="step-circle">
              <step.icon size={20} />
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="form-section">
              <h3>Informations Personnelles</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Adresse</label>
                  <textarea
                    name="address"
                    className="form-input"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academic Information */}
          {currentStep === 2 && (
            <div className="form-section">
              <h3>Parcours Académique</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Département</label>
                  <select
                    name="department"
                    className="form-input"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique</option>
                    <option value="Chimie">Chimie</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date de Thèse</label>
                  <input
                    type="date"
                    name="thesisDate"
                    className="form-input"
                    value={formData.thesisDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Titre de Thèse</label>
                  <input
                    type="text"
                    name="thesisTitle"
                    className="form-input"
                    value={formData.thesisTitle}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Directeur de Thèse</label>
                  <input
                    type="text"
                    name="thesisSupervisor"
                    className="form-input"
                    value={formData.thesisSupervisor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Research Work */}
          {currentStep === 3 && (
            <div className="form-section">
              <h3>Travaux de Recherche</h3>
              <p>Cette section sera développée pour permettre l'ajout dynamique de publications, conférences et projets.</p>
            </div>
          )}

          {/* Step 4: Teaching Experience */}
          {currentStep === 4 && (
            <div className="form-section">
              <h3>Expérience Pédagogique</h3>
              <p>Cette section sera développée pour permettre l'ajout de cours enseignés et d'encadrements.</p>
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="form-section">
              <h3>Documents à Joindre</h3>
              <p>Cette section permettra le téléchargement des documents requis.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={20} />
              Précédent
            </button>
            
            {currentStep < steps.length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Suivant
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
              >
                <Save size={20} />
                Soumettre la Candidature
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
