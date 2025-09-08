import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { applicationsAPI, candidatesAPI } from '../utils/api';

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [formData, setFormData] = useState({
    candidate_id: '',
    submission_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsResponse, candidatesResponse] = await Promise.all([
        applicationsAPI.getAll(),
        candidatesAPI.getAll()
      ]);
      setApplications(appsResponse.data);
      setCandidates(candidatesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await applicationsAPI.create(formData);
      alert('Candidature créée avec succès');
      setShowAddModal(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error creating application:', error);
      alert('Erreur lors de la création de la candidature');
    }
  };

  const handleUpdateStatus = async (id, status, stage, progress) => {
    try {
      await applicationsAPI.updateStatus(id, {
        status,
        current_stage: stage,
        progress
      });
      alert('Statut mis à jour avec succès');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature?')) {
      try {
        await applicationsAPI.delete(id);
        alert('Candidature supprimée avec succès');
        loadData();
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      candidate_id: '',
      submission_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'En attente': return <Clock size={16} />;
      case 'En cours': return <FileText size={16} />;
      case 'Approuvé': return <CheckCircle size={16} />;
      case 'Rejeté': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'En attente': return 'badge-warning';
      case 'En cours': return 'badge-info';
      case 'Approuvé': return 'badge-success';
      case 'Rejeté': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Chargement des candidatures...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidatures</h1>
          <p className="page-subtitle">Gérer les dossiers de candidature</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Nouvelle Candidature
        </button>
      </div>

      <div className="card">
        {applications.length === 0 ? (
          <div className="no-data">
            <p>Aucune candidature trouvée</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              Créer la première candidature
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Candidat</th>
                  <th>Date de Soumission</th>
                  <th>Statut</th>
                  <th>Étape Actuelle</th>
                  <th>Progression</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>#{app.id}</td>
                    <td>{app.first_name} {app.last_name}</td>
                    <td>{new Date(app.submission_date || app.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </td>
                    <td>{app.current_stage || 'Vérification Documents'}</td>
                    <td>
                      <div className="progress-container" style={{ maxWidth: '100px' }}>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${app.progress || 0}%`,
                              backgroundColor: app.progress === 100 ? '#10b981' : '#f59e0b'
                            }}
                          />
                        </div>
                        <span className="progress-text">{app.progress || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="action-btn"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => {
                            const newStatus = prompt('Nouveau statut (En attente/En cours/Approuvé/Rejeté):');
                            if (newStatus) {
                              const progress = prompt('Progression (0-100):');
                              handleUpdateStatus(app.id, newStatus, app.current_stage, parseInt(progress) || 0);
                            }
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="action-btn danger"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle Candidature</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Candidat *</label>
                  <select
                    name="candidate_id"
                    className="form-input"
                    value={formData.candidate_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionner un candidat...</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.first_name} {candidate.last_name} - {candidate.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date de Soumission</label>
                  <input
                    type="date"
                    name="submission_date"
                    className="form-input"
                    value={formData.submission_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    className="form-input"
                    rows="4"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  Créer la Candidature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Application Details Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de la Candidature</h2>
              <button className="modal-close" onClick={() => setSelectedApplication(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Informations de la Candidature</h3>
                <div className="detail-grid">
                  <div>
                    <label>ID Candidature</label>
                    <p>#{selectedApplication.id}</p>
                  </div>
                  <div>
                    <label>Candidat</label>
                    <p>{selectedApplication.first_name} {selectedApplication.last_name}</p>
                  </div>
                  <div>
                    <label>Email</label>
                    <p>{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label>Département</label>
                    <p>{selectedApplication.department || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label>Date de Soumission</label>
                    <p>{new Date(selectedApplication.submission_date || selectedApplication.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <label>Statut</label>
                    <p className={`badge ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </p>
                  </div>
                  <div>
                    <label>Étape Actuelle</label>
                    <p>{selectedApplication.current_stage || 'Vérification Documents'}</p>
                  </div>
                  <div>
                    <label>Progression</label>
                    <p>{selectedApplication.progress || 0}%</p>
                  </div>
                </div>
                {selectedApplication.notes && (
                  <div style={{ marginTop: '20px' }}>
                    <label>Notes</label>
                    <p>{selectedApplication.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedApplication(null)}>
                Fermer
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate(`/applications/${selectedApplication.id}/documents`)}
              >
                Voir les Documents
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
