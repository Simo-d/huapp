import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Download, 
  FileText, 
  File, 
  Image, 
  Trash2,
  Eye,
  X,
  Save,
  Filter,
  FileSignature,
  FilePlus,
  FileCheck,
  Award,
  Mail,
  Users,
  RefreshCw
} from 'lucide-react';
import { documentsAPI, candidatesAPI, applicationsAPI } from '../utils/api';
import DocumentGenerator from '../components/DocumentGenerator';
import './Documents.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    candidate_id: '',
    application_id: '',
    category: 'Autre'
  });
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  const categories = [
    'Autorisation',
    'Rapport',
    'PV',
    'Diplôme',
    'CV',
    'Publication',
    'Invitation',
    'Convocation',
    'Autre'
  ];

  const documentTemplates = [
    {
      id: 'authorization_inscription',
      name: 'Autorisation d\'inscription',
      icon: <FileSignature size={24} />,
      category: 'Autorisation',
      description: 'Générer une autorisation d\'inscription HU',
      color: 'blue'
    },
    {
      id: 'authorization_defense',
      name: 'Autorisation de soutenance',
      icon: <FileCheck size={24} />,
      category: 'Autorisation',
      description: 'Générer une autorisation de soutenance',
      color: 'green'
    },
    {
      id: 'invitation',
      name: 'Lettre d\'invitation',
      icon: <Mail size={24} />,
      category: 'Invitation',
      description: 'Inviter un rapporteur au jury',
      color: 'purple'
    },
    {
      id: 'convocation',
      name: 'Convocation',
      icon: <Users size={24} />,
      category: 'Convocation',
      description: 'Convoquer un candidat à la soutenance',
      color: 'orange'
    },
    {
      id: 'pv_commission',
      name: 'PV de Commission',
      icon: <FileText size={24} />,
      category: 'PV',
      description: 'Procès-verbal de réunion',
      color: 'indigo'
    },
    {
      id: 'diploma',
      name: 'Diplôme HU',
      icon: <Award size={24} />,
      category: 'Diplôme',
      description: 'Générer le diplôme d\'habilitation',
      color: 'yellow'
    },
    {
      id: 'summary',
      name: 'Dossier complet',
      icon: <FilePlus size={24} />,
      category: 'Rapport',
      description: 'Résumé complet du dossier candidat',
      color: 'teal'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, candidatesRes, appsRes] = await Promise.all([
        documentsAPI.getAll(),
        candidatesAPI.getAll(),
        applicationsAPI.getAll()
      ]);
      setDocuments(docsRes.data);
      setCandidates(candidatesRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale: 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('candidate_id', uploadData.candidate_id);
    formData.append('application_id', uploadData.application_id);
    formData.append('category', uploadData.category);

    try {
      await documentsAPI.upload(formData);
      alert('Document téléchargé avec succès');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadData({
        candidate_id: '',
        application_id: '',
        category: 'Autre'
      });
      loadData();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document?')) {
      try {
        await documentsAPI.delete(id);
        alert('Document supprimé avec succès');
        loadData();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Erreur lors de la suppression du document');
      }
    }
  };

  const handleDownload = (document) => {
    const url = `http://localhost:5000/uploads/${document.path}`;
    window.open(url, '_blank');
  };

  const getFileIcon = (type) => {
    const fileType = type?.toLowerCase();
    if (fileType === 'pdf') return <FileText size={20} color="#dc2626" />;
    if (['jpg', 'jpeg', 'png'].includes(fileType)) return <Image size={20} color="#3b82f6" />;
    return <File size={20} color="#6b7280" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Chargement des documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Documents</h1>
          <p className="page-subtitle">Centralisation et génération des documents HU</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={20} />
            Actualiser
          </button>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <Upload size={20} />
            Télécharger
          </button>
          <button className="btn btn-success" onClick={() => setShowGenerateModal(true)}>
            <FilePlus size={20} />
            Générer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FolderOpen size={18} />
          Documents ({documents.length})
        </button>
        <button 
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FileSignature size={18} />
          Modèles
        </button>
      </div>

      {activeTab === 'documents' ? (
        <>
          {/* Filters */}
          <div className="filters-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <Filter size={20} />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="documents-grid">
            {filteredDocuments.length === 0 ? (
              <div className="no-data">
                <FolderOpen size={48} />
                <p>Aucun document trouvé</p>
                <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                  Télécharger le premier document
                </button>
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <div key={doc.id} className="document-card">
                  <div className="document-icon">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="document-info">
                    <h3 className="document-name">{doc.name}</h3>
                    <div className="document-meta">
                      <span className="document-size">{formatFileSize(doc.size)}</span>
                      <span className="document-date">
                        {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <span className={`badge badge-${doc.category === 'Autorisation' ? 'success' : 
                                             doc.category === 'Rapport' ? 'info' : 
                                             doc.category === 'PV' ? 'warning' : 
                                             doc.category === 'Diplôme' ? 'gold' :
                                             doc.category === 'Invitation' ? 'purple' : 'secondary'}`}>
                      {doc.category}
                    </span>
                  </div>
                  <div className="document-actions">
                    <button 
                      className="action-btn"
                      onClick={() => handleDownload(doc)}
                      title="Télécharger"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => handleDownload(doc)}
                      title="Voir"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => handleDelete(doc.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Templates Tab */
        <div className="templates-grid">
          {documentTemplates.map(template => (
            <div key={template.id} className={`template-card template-${template.color}`}>
              <div className="template-icon">
                {template.icon}
              </div>
              <h3 className="template-name">{template.name}</h3>
              <p className="template-description">{template.description}</p>
              <span className={`badge badge-${template.color}`}>
                {template.category}
              </span>
              <button 
                className="btn btn-primary btn-small"
                onClick={() => {
                  setShowGenerateModal(true);
                  // Pre-select template type
                }}
              >
                <FilePlus size={16} />
                Générer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Télécharger un Document</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Fichier *</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required
                    />
                    {selectedFile && (
                      <div className="selected-file">
                        <File size={16} />
                        <span>{selectedFile.name}</span>
                        <span className="file-size">({formatFileSize(selectedFile.size)})</span>
                      </div>
                    )}
                  </div>
                  <small>Formats acceptés: PDF, Word, Images (Max: 10MB)</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Catégorie *</label>
                  <select
                    className="form-input"
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Candidat</label>
                  <select
                    className="form-input"
                    value={uploadData.candidate_id}
                    onChange={(e) => setUploadData({...uploadData, candidate_id: e.target.value})}
                  >
                    <option value="">-- Sélectionner un candidat --</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.first_name} {candidate.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Candidature</label>
                  <select
                    className="form-input"
                    value={uploadData.application_id}
                    onChange={(e) => setUploadData({...uploadData, application_id: e.target.value})}
                  >
                    <option value="">-- Sélectionner une candidature --</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        #{app.id} - {app.first_name} {app.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Upload size={20} />
                  Télécharger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Generator Modal */}
      {showGenerateModal && (
        <DocumentGenerator
          candidates={candidates}
          applications={applications}
          onClose={() => setShowGenerateModal(false)}
          onGenerated={() => {
            loadData();
            setShowGenerateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Documents;
