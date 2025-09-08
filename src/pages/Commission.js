import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import api from '../utils/api';
import './pages.css';

const Commission = () => {
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('meetings');
  const [meetingForm, setMeetingForm] = useState({
    date: '',
    time: '',
    type: 'Commission Scientifique',
    status: 'Planifiée',
    attendees: '',
    decisions: '',
    minutes: ''
  });
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, membersRes] = await Promise.all([
        api.get('/meetings'),
        api.get('/commission-members')
      ]);
      setMeetings(meetingsRes.data || []);
      setMembers(membersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meetings', meetingForm);
      alert('Réunion planifiée avec succès');
      setShowAddMeetingModal(false);
      resetMeetingForm();
      loadData();
    } catch (error) {
      console.error('Error adding meeting:', error);
      alert('Erreur lors de la planification de la réunion');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post('/commission-members', memberForm);
      alert('Membre ajouté avec succès');
      setShowAddMemberModal(false);
      resetMemberForm();
      loadData();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Erreur lors de l\'ajout du membre');
    }
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/meetings/${selectedItem.id}`, meetingForm);
      alert('Réunion modifiée avec succès');
      setShowEditModal(false);
      resetMeetingForm();
      loadData();
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('Erreur lors de la modification de la réunion');
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réunion?')) {
      try {
        await api.delete(`/meetings/${id}`);
        alert('Réunion supprimée avec succès');
        loadData();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Erreur lors de la suppression de la réunion');
      }
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) {
      try {
        await api.delete(`/commission-members/${id}`);
        alert('Membre supprimé avec succès');
        loadData();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Erreur lors de la suppression du membre');
      }
    }
  };

  const handleGeneratePV = async (meetingId) => {
    try {
      const response = await api.post(`/generation/pv/${meetingId}`, {
        decisions: meetings.find(m => m.id === meetingId)?.decisions?.split('\n') || []
      });
      if (response.data.success) {
        alert('PV généré avec succès');
        window.open(`http://localhost:5000${response.data.path}`, '_blank');
      }
    } catch (error) {
      console.error('Error generating PV:', error);
      alert('Erreur lors de la génération du PV');
    }
  };

  const openEditMeetingModal = (meeting) => {
    setSelectedItem(meeting);
    setMeetingForm({
      date: meeting.date,
      time: meeting.time,
      type: meeting.type,
      status: meeting.status,
      attendees: meeting.attendees || '',
      decisions: meeting.decisions || '',
      minutes: meeting.minutes || ''
    });
    setShowEditModal(true);
  };

  const resetMeetingForm = () => {
    setMeetingForm({
      date: '',
      time: '',
      type: 'Commission Scientifique',
      status: 'Planifiée',
      attendees: '',
      decisions: '',
      minutes: ''
    });
    setSelectedItem(null);
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      role: '',
      department: '',
      email: '',
      phone: ''
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Planifiée': return 'badge-info';
      case 'En cours': return 'badge-warning';
      case 'Terminée': return 'badge-success';
      case 'Annulée': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const upcomingMeetings = meetings
    .filter(m => m.status === 'Planifiée' && new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Commission Scientifique</h1>
          <p className="page-subtitle">Gérer les réunions et les membres de la commission</p>
        </div>
        <div className="header-actions">
          {activeTab === 'meetings' ? (
            <button className="btn btn-primary" onClick={() => setShowAddMeetingModal(true)}>
              <Plus size={20} />
              Planifier Réunion
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAddMemberModal(true)}>
              <Plus size={20} />
              Ajouter Membre
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{meetings.filter(m => m.status === 'Planifiée').length}</div>
            <div className="stat-label">Réunions Planifiées</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{members.length}</div>
            <div className="stat-label">Membres Commission</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{meetings.filter(m => m.status === 'Terminée').length}</div>
            <div className="stat-label">PV Disponibles</div>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="upcoming-section">
          <h3 className="section-title">Prochaines Réunions</h3>
          <div className="upcoming-grid">
            {upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="upcoming-card">
                <div className="upcoming-header">
                  <span className="upcoming-type">{meeting.type}</span>
                  <span className={`badge ${getStatusBadgeClass(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>
                <div className="upcoming-body">
                  <div className="upcoming-date">
                    <Calendar size={16} />
                    {new Date(meeting.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="upcoming-time">
                    <Clock size={16} />
                    {meeting.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'meetings' ? 'active' : ''}`}
          onClick={() => setActiveTab('meetings')}
        >
          <Calendar size={18} />
          Réunions ({meetings.length})
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={18} />
          Membres ({members.length})
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'meetings' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Type</th>
                <th>Participants</th>
                <th>Statut</th>
                <th>PV</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Aucune réunion trouvée
                  </td>
                </tr>
              ) : (
                meetings.map(meeting => (
                  <tr key={meeting.id}>
                    <td>
                      <div className="date-display">
                        <Calendar size={16} />
                        {new Date(meeting.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td>
                      <div className="time-display">
                        <Clock size={16} />
                        {meeting.time}
                      </div>
                    </td>
                    <td>{meeting.type}</td>
                    <td>
                      <div className="attendees-list">
                        {meeting.attendees ? (
                          meeting.attendees.split(',').slice(0, 2).map((att, idx) => (
                            <span key={idx} className="attendee-chip">
                              {att.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">Non défini</span>
                        )}
                        {meeting.attendees && meeting.attendees.split(',').length > 2 && (
                          <span className="attendee-more">
                            +{meeting.attendees.split(',').length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td>
                      {meeting.status === 'Terminée' ? (
                        <button
                          className="btn-icon success"
                          onClick={() => handleGeneratePV(meeting.id)}
                          title="Générer PV"
                        >
                          <FileText size={18} />
                        </button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => openEditMeetingModal(meeting)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteMeeting(meeting.id)}
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
      ) : (
        <div className="members-grid">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-avatar">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button
                  className="btn-icon danger small"
                  onClick={() => handleDeleteMember(member.id)}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="member-body">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <div className="member-info">
                  <div className="info-item">
                    <Briefcase size={14} />
                    {member.department}
                  </div>
                  <div className="info-item">
                    <Mail size={14} />
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </div>
                  {member.phone && (
                    <div className="info-item">
                      <Phone size={14} />
                      {member.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Meeting Modal */}
      {showAddMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowAddMeetingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Planifier une Réunion</h2>
              <button className="modal-close" onClick={() => {
                setShowAddMeetingModal(false);
                resetMeetingForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddMeeting}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={meetingForm.date}
                      onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Heure *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={meetingForm.time}
                      onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Type de réunion *</label>
                  <select
                    className="form-input"
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({...meetingForm, type: e.target.value})}
                    required
                  >
                    <option value="Commission Scientifique">Commission Scientifique</option>
                    <option value="Commission HU">Commission HU</option>
                    <option value="Réunion Extraordinaire">Réunion Extraordinaire</option>
                    <option value="Assemblée Générale">Assemblée Générale</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Participants</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Liste des participants (séparés par des virgules)"
                    value={meetingForm.attendees}
                    onChange={(e) => setMeetingForm({...meetingForm, attendees: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ordre du jour / Décisions</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Points à discuter ou décisions prises"
                    value={meetingForm.decisions}
                    onChange={(e) => setMeetingForm({...meetingForm, decisions: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-input"
                    value={meetingForm.status}
                    onChange={(e) => setMeetingForm({...meetingForm, status: e.target.value})}
                  >
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowAddMeetingModal(false);
                  resetMeetingForm();
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un Membre</h2>
              <button className="modal-close" onClick={() => {
                setShowAddMemberModal(false);
                resetMemberForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom complet *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rôle *</label>
                  <select
                    className="form-input"
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({...memberForm, role: e.target.value})}
                    required
                  >
                    <option value="">-- Sélectionner un rôle --</option>
                    <option value="Président">Président</option>
                    <option value="Vice-Président">Vice-Président</option>
                    <option value="Secrétaire">Secrétaire</option>
                    <option value="Membre">Membre</option>
                    <option value="Rapporteur">Rapporteur</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Département *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={memberForm.department}
                    onChange={(e) => setMemberForm({...memberForm, department: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowAddMemberModal(false);
                  resetMemberForm();
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

      {/* Edit Meeting Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier la Réunion</h2>
              <button className="modal-close" onClick={() => {
                setShowEditModal(false);
                resetMeetingForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditMeeting}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={meetingForm.date}
                      onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Heure *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={meetingForm.time}
                      onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Type de réunion *</label>
                  <select
                    className="form-input"
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({...meetingForm, type: e.target.value})}
                    required
                  >
                    <option value="Commission Scientifique">Commission Scientifique</option>
                    <option value="Commission HU">Commission HU</option>
                    <option value="Réunion Extraordinaire">Réunion Extraordinaire</option>
                    <option value="Assemblée Générale">Assemblée Générale</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Participants</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Liste des participants (séparés par des virgules)"
                    value={meetingForm.attendees}
                    onChange={(e) => setMeetingForm({...meetingForm, attendees: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Décisions prises</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Décisions prises lors de la réunion"
                    value={meetingForm.decisions}
                    onChange={(e) => setMeetingForm({...meetingForm, decisions: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / PV</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Notes ou procès-verbal"
                    value={meetingForm.minutes}
                    onChange={(e) => setMeetingForm({...meetingForm, minutes: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-input"
                    value={meetingForm.status}
                    onChange={(e) => setMeetingForm({...meetingForm, status: e.target.value})}
                  >
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEditModal(false);
                  resetMeetingForm();
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

export default Commission;
