import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  Calendar,
  X,
  Save
} from 'lucide-react';
import { candidatesAPI } from '../utils/api';
import './Candidates.css';

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    thesis_title: '',
    thesis_date: '',
    thesis_supervisor: ''
  });

  // Load candidates from database
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidatesAPI.getAll();
      setCandidates(response.data);
    } catch (error) {
      console.error('Error loading candidates:', error);
      alert('Erreur lors du chargement des candidats');
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
      if (showEditModal) {
        await candidatesAPI.update(selectedCandidate.id, formData);
        alert('Candidat mis à jour avec succès');
      } else {
        await candidatesAPI.create(formData);
        alert('Candidat ajouté avec succès');
      }
      loadCandidates();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Erreur lors de l\'enregistrement du candidat');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat?')) {
      try {
        await candidatesAPI.delete(id);
        alert('Candidat supprimé avec succès');
        loadCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Erreur lors de la suppression du candidat');
      }
    }
  };

  const handleEdit = (candidate) => {
    setFormData({
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.email,
      phone: candidate.phone || '',
      address: candidate.address || '',
      department: candidate.department || '',
      thesis_title: candidate.thesis_title || '',
      thesis_date: candidate.thesis_date || '',
      thesis_supervisor: candidate.thesis_supervisor || ''
    });
    setSelectedCandidate(candidate);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCandidate(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      department: '',
      thesis_title: '',
      thesis_date: '',
      thesis_supervisor: ''
    });
  };

  const filteredCandidates = candidates.filter(candidate => {
    const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          candidate.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'En attente': return 'badge-warning';
      case 'En cours': return 'badge-info';
      case 'Terminé': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="candidates-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Candidats</h1>
          <p className="page-subtitle">Gérer les candidats à l'habilitation universitaire</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Nouveau Candidat
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher un candidat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>

        <button className="btn btn-secondary">
          <Download size={20} />
          Exporter
        </button>
      </div>

      {/* Candidates Grid */}
      <div className="candidates-grid">
        {filteredCandidates.length === 0 ? (
          <div className="no-data">
            <p>Aucun candidat trouvé</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              Ajouter le premier candidat
            </button>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="candidate-card">
              <div className="candidate-header">
                <div className="candidate-avatar">
                  {getInitials(candidate.first_name, candidate.last_name)}
                </div>
                <div className="candidate-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleEdit(candidate)}
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className="action-btn danger"
                    onClick={() => handleDelete(candidate.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="candidate-info">
                <h3 className="candidate-name">{candidate.first_name} {candidate.last_name}</h3>
                <p className="candidate-department">{candidate.department || 'Non spécifié'}</p>
                
                <div className="candidate-details">
                  <div className="detail-item">
                    <Mail size={14} />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="detail-item">
                      <Phone size={14} />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.thesis_date && (
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Thèse: {new Date(candidate.thesis_date).getFullYear()}</span>
                    </div>
                  )}
                </div>

                <div className="candidate-footer">
                  <span className={`badge ${getStatusColor(candidate.status || 'En attente')}`}>
                    {candidate.status || 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showEditModal ? 'Modifier le Candidat' : 'Nouveau Candidat'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input
                      type="text"
                      name="first_name"
                      className="form-input"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text"
                      name="last_name"
                      className="form-input"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
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
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Département</label>
                    <select
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Informatique">Informatique</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Physique">Physique</option>
                      <option value="Chimie">Chimie</option>
                      <option value="Biologie">Biologie</option>
                      <option value="Géologie">Géologie</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date de Thèse</label>
                    <input
                      type="date"
                      name="thesis_date"
                      className="form-input"
                      value={formData.thesis_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Titre de Thèse</label>
                    <input
                      type="text"
                      name="thesis_title"
                      className="form-input"
                      value={formData.thesis_title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Directeur de Thèse</label>
                    <input
                      type="text"
                      name="thesis_supervisor"
                      className="form-input"
                      value={formData.thesis_supervisor}
                      onChange={handleInputChange}
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
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  {showEditModal ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedCandidate && !showEditModal && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails du Candidat</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedCandidate(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Informations Personnelles</h3>
                <div className="detail-grid">
                  <div>
                    <label>Nom Complet</label>
                    <p>{selectedCandidate.first_name} {selectedCandidate.last_name}</p>
                  </div>
                  <div>
                    <label>Email</label>
                    <p>{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <label>Téléphone</label>
                    <p>{selectedCandidate.phone || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label>Département</label>
                    <p>{selectedCandidate.department || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              {(selectedCandidate.thesis_title || selectedCandidate.thesis_date) && (
                <div className="detail-section">
                  <h3>Informations Académiques</h3>
                  <div className="detail-grid">
                    {selectedCandidate.thesis_date && (
                      <div>
                        <label>Date de Thèse</label>
                        <p>{new Date(selectedCandidate.thesis_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                    {selectedCandidate.thesis_supervisor && (
                      <div>
                        <label>Directeur de Thèse</label>
                        <p>{selectedCandidate.thesis_supervisor}</p>
                      </div>
                    )}
                    {selectedCandidate.thesis_title && (
                      <div className="full-width">
                        <label>Titre de Thèse</label>
                        <p>{selectedCandidate.thesis_title}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedCandidate(null)}>
                Fermer
              </button>
              <button className="btn btn-primary" onClick={() => handleEdit(selectedCandidate)}>
                <Edit size={20} />
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
