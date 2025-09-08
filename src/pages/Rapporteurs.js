import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  Mail,
  Phone,
  Building,
  Award,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Filter
} from 'lucide-react';
import api from '../utils/api';
import './pages.css';

const Rapporteurs = () => {
  const [rapporteurs, setRapporteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRapporteur, setSelectedRapporteur] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    email: '',
    phone: '',
    specialization: ''
  });

  useEffect(() => {
    loadRapporteurs();
  }, []);

  const loadRapporteurs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rapporteurs');
      setRapporteurs(response.data || []);
    } catch (error) {
      console.error('Error loading rapporteurs:', error);
      alert('Erreur lors du chargement des rapporteurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rapporteurs', formData);
      alert('Rapporteur ajouté avec succès');
      setShowAddModal(false);
      resetForm();
      loadRapporteurs();
    } catch (error) {
      console.error('Error adding rapporteur:', error);
      alert('Erreur lors de l\'ajout du rapporteur');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/rapporteurs/${selectedRapporteur.id}`, formData);
      alert('Rapporteur modifié avec succès');
      setShowEditModal(false);
      resetForm();
      loadRapporteurs();
    } catch (error) {
      console.error('Error updating rapporteur:', error);
      alert('Erreur lors de la modification du rapporteur');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapporteur?')) {
      try {
        await api.delete(`/rapporteurs/${id}`);
        alert('Rapporteur supprimé avec succès');
        loadRapporteurs();
      } catch (error) {
        console.error('Error deleting rapporteur:', error);
        alert('Erreur lors de la suppression du rapporteur');
      }
    }
  };

  const openEditModal = (rapporteur) => {
    setSelectedRapporteur(rapporteur);
    setFormData({
      name: rapporteur.name,
      institution: rapporteur.institution,
      email: rapporteur.email,
      phone: rapporteur.phone,
      specialization: rapporteur.specialization
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      institution: '',
      email: '',
      phone: '',
      specialization: ''
    });
    setSelectedRapporteur(null);
  };

  const filteredRapporteurs = rapporteurs.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Chargement des rapporteurs...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Rapporteurs</h1>
          <p className="page-subtitle">Gérer les rapporteurs externes pour les jurys HU</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={20} />
          Ajouter Rapporteur
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom, institution ou spécialisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{rapporteurs.length}</div>
            <div className="stat-label">Total Rapporteurs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {rapporteurs.filter(r => r.evaluations_count > 0).length}
            </div>
            <div className="stat-label">Rapporteurs Actifs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple">
            <Building size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {[...new Set(rapporteurs.map(r => r.institution))].length}
            </div>
            <div className="stat-label">Institutions</div>
          </div>
        </div>
      </div>

      {/* Rapporteurs Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Institution</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Spécialisation</th>
              <th>Évaluations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRapporteurs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Aucun rapporteur trouvé
                </td>
              </tr>
            ) : (
              filteredRapporteurs.map(rapporteur => (
                <tr key={rapporteur.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {rapporteur.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{rapporteur.name}</span>
                    </div>
                  </td>
                  <td>{rapporteur.institution}</td>
                  <td>
                    <a href={`mailto:${rapporteur.email}`} className="text-link">
                      {rapporteur.email}
                    </a>
                  </td>
                  <td>{rapporteur.phone}</td>
                  <td>
                    <span className="badge badge-info">
                      {rapporteur.specialization}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-secondary">
                      {rapporteur.evaluations_count || 0}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(rapporteur)}
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDelete(rapporteur.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un Rapporteur</h2>
              <button className="modal-close" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom complet *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Institution *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Spécialisation *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="Ex: Intelligence Artificielle, Mathématiques..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier le Rapporteur</h2>
              <button className="modal-close" onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom complet *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Institution *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Spécialisation *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rapporteurs;
