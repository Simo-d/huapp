import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import api from '../utils/api';
import './pages.css';

const Defense = () => {
  const [defenses, setDefenses] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [rapporteurs, setRapporteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [formData, setFormData] = useState({
    candidate_id: '',
    application_id: '',
    date: '',
    time: '',
    location: 'Salle de conférences, FPO',
    jury: [],
    status: 'Programmée'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [defensesRes, candidatesRes, rapporteursRes] = await Promise.all([
        api.get('/defenses'),
        api.get('/candidates'),
        api.get('/rapporteurs')
      ]);
      setDefenses(defensesRes.data || []);
      setCandidates(candidatesRes.data || []);
      setRapporteurs(rapporteursRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const juryString = formData.jury.join(', ');
      await api.post('/defenses', {
        ...formData,
        jury: juryString
      });
      alert('Soutenance programmée avec succès');
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error adding defense:', error);
      alert('Erreur lors de la programmation de la soutenance');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const juryString = formData.jury.join(', ');
      await api.put(`/defenses/${selectedDefense.id}`, {
        ...formData,
        jury: juryString
      });
      alert('Soutenance modifiée avec succès');
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating defense:', error);
      alert('Erreur lors de la modification de la soutenance');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette soutenance?')) {
      try {
        await api.delete(`/defenses/${id}`);
        alert('Soutenance supprimée avec succès');
        loadData();
      } catch (error) {
        console.error('Error deleting defense:', error);
        alert('Erreur lors de la suppression de la soutenance');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/defenses/${id}/status`, { status: newStatus });
      alert('Statut mis à jour avec succès');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const toggleJuryMember = (rapporteurName) => {
    setFormData(prev => ({
      ...prev,
      jury: prev.jury.includes(rapporteurName)
        ? prev.jury.filter(j => j !== rapporteurName)
        : [...prev.jury, rapporteurName]
    }));
  };

  const openEditModal = (defense) => {
    setSelectedDefense(defense);
    const juryArray = defense.jury ? defense.jury.split(', ') : [];
    setFormData({
      candidate_id: defense.candidate_id,
      application_id: defense.application_id || '',
      date: defense.date,
      time: defense.time,
      location: defense.location,
      jury: juryArray,
      status: defense.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      candidate_id: '',
      application_id: '',
      date: '',
      time: '',
      location: 'Salle de conférences, FPO',
      jury: [],
      status: 'Programmée'
    });
    setSelectedDefense(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Programmée': return 'badge-info';
      case 'En cours': return 'badge-warning';
      case 'Terminée': return 'badge-success';
      case 'Reportée': return 'badge-secondary';
      case 'Annulée': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const filteredDefenses = defenses.filter(defense => {
    if (activeTab === 'scheduled') return defense.status === 'Programmée';
    if (activeTab === 'completed') return defense.status === 'Terminée';
    if (activeTab === 'all') return true;
    return false;
  });

  const upcomingDefenses = defenses
    .filter(d => d.status === 'Programmée' && new Date(d.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Chargement des soutenances...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Soutenances</h1>
          <p className="page-subtitle">Programmer et gérer les soutenances HU</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Programmer Soutenance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{defenses.filter(d => d.status === 'Programmée').length}</div>
            <div className="stat-label">Soutenances Programmées</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{defenses.filter(d => d.status === 'Terminée').length}</div>
            <div className="stat-label">Soutenances Terminées</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{upcomingDefenses.length}</div>
            <div className="stat-label">Prochaines Soutenances</div>
          </div>
        </div>
      </div>

      {/* Upcoming Defenses */}
      {upcomingDefenses.length > 0 && (
        <div className="upcoming-section">
          <h3 className="section-title">Prochaines Soutenances</h3>
          <div className="upcoming-list">
            {upcomingDefenses.map(defense => {
              const candidate = candidates.find(c => c.id === defense.candidate_id);
              return (
                <div key={defense.id} className="upcoming-item">
                  <div className="upcoming-date">
                    <Calendar size={16} />
                    {new Date(defense.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="upcoming-info">
                    <strong>{candidate?.first_name} {candidate?.last_name}</strong>
                    <span className="text-muted">
                      <Clock size={14} /> {defense.time} - <MapPin size={14} /> {defense.location}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Programmées ({defenses.filter(d => d.status === 'Programmée').length})
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Terminées ({defenses.filter(d => d.status === 'Terminée').length})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Toutes ({defenses.length})
        </button>
      </div>

      {/* Defenses Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Candidat</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Lieu</th>
              <th>Jury</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDefenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Aucune soutenance trouvée
                </td>
              </tr>
            ) : (
              filteredDefenses.map(defense => {
                const candidate = candidates.find(c => c.id === defense.candidate_id);
                return (
                  <tr key={defense.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {candidate ? candidate.first_name[0] + candidate.last_name[0] : 'NA'}
                        </div>
                        <div>
                          <div className="font-medium">
                            {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'N/A'}
                          </div>
                          <div className="text-small text-muted">
                            {candidate?.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-display">
                        <Calendar size={16} />
                        {new Date(defense.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td>
                      <div className="time-display">
                        <Clock size={16} />
                        {defense.time}
                      </div>
                    </td>
                    <td>
                      <div className="location-display">
                        <MapPin size={16} />
                        {defense.location}
                      </div>
                    </td>
                    <td>
                      <div className="jury-list">
                        {defense.jury ? (
                          defense.jury.split(', ').slice(0, 2).map((member, idx) => (
                            <span key={idx} className="jury-member">
                              {member}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">Non défini</span>
                        )}
                        {defense.jury && defense.jury.split(', ').length > 2 && (
                          <span className="jury-more">+{defense.jury.split(', ').length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(defense.status)}`}>
                        {defense.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(defense)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        {defense.status === 'Programmée' && (
                          <button
                            className="btn-icon success"
                            onClick={() => handleStatusChange(defense.id, 'Terminée')}
                            title="Marquer comme terminée"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(defense.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Programmer une Soutenance</h2>
              <button className="modal-close" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Candidat *</label>
                    <select
                      className="form-input"
                      value={formData.candidate_id}
                      onChange={(e) => setFormData({...formData, candidate_id: e.target.value})}
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Heure *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lieu *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Membres du Jury</label>
                  <div className="jury-selection">
                    {rapporteurs.map(rapporteur => (
                      <label key={rapporteur.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.jury.includes(rapporteur.name)}
                          onChange={() => toggleJuryMember(rapporteur.name)}
                        />
                        <span>{rapporteur.name} ({rapporteur.institution})</span>
                      </label>
                    ))}
                  </div>
                  <small className="form-hint">
                    <Info size={14} /> Sélectionnez les membres du jury pour cette soutenance
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Programmée">Programmée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Reportée">Reportée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
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
                  Programmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar to Add Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier la Soutenance</h2>
              <button className="modal-close" onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Candidat *</label>
                    <select
                      className="form-input"
                      value={formData.candidate_id}
                      onChange={(e) => setFormData({...formData, candidate_id: e.target.value})}
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Heure *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lieu *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Membres du Jury</label>
                  <div className="jury-selection">
                    {rapporteurs.map(rapporteur => (
                      <label key={rapporteur.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.jury.includes(rapporteur.name)}
                          onChange={() => toggleJuryMember(rapporteur.name)}
                        />
                        <span>{rapporteur.name} ({rapporteur.institution})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Programmée">Programmée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Reportée">Reportée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
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

export default Defense;
