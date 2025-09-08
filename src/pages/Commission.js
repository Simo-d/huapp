import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Award,
  Briefcase,
  Calendar,
  X,
  Save,
  UserCheck,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical
} from 'lucide-react';
import api from '../utils/api';
import '../styles/design-system.css';
import './Commission.css';

const Commission = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showActions, setShowActions] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    institution: '',
    department: '',
    specialization: ''
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/commission-members');
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMember) {
        await api.put(`/commission-members/${selectedMember.id}`, formData);
      } else {
        await api.post('/commission-members', formData);
      }
      await loadMembers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) {
      try {
        await api.delete(`/commission-members/${id}`);
        await loadMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      institution: member.institution || '',
      department: member.department || '',
      specialization: member.specialization || ''
    });
    setShowModal(true);
    setShowActions(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      institution: '',
      department: '',
      specialization: ''
    });
    setSelectedMember(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectMember = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) 
        ? prev.filter(memberId => memberId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedMembers.length === 0) {
      alert('Veuillez sélectionner au moins un membre');
      return;
    }

    switch(action) {
      case 'delete':
        if (window.confirm(`Supprimer ${selectedMembers.length} membre(s)?`)) {
          // Bulk delete logic here
          setSelectedMembers([]);
        }
        break;
      case 'export':
        // Export logic here
        console.log('Exporting members:', selectedMembers);
        break;
      default:
        break;
    }
  };

  // Filter and sort members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.institution?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Président': return 'badge-president';
      case 'Vice-Président': return 'badge-vice-president';
      case 'Rapporteur': return 'badge-rapporteur';
      case 'Membre': return 'badge-member';
      default: return 'badge-default';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Président': return <Shield size={14} />;
      case 'Vice-Président': return <Star size={14} />;
      case 'Rapporteur': return <Award size={14} />;
      default: return <UserCheck size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des membres...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-enhanced">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Commission HU</h1>
            <p className="page-subtitle">Gestion des membres de la commission d'habilitation</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Nouveau Membre
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{members.length}</div>
            <div className="stat-label">Total Membres</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {members.filter(m => m.role === 'Président').length}
            </div>
            <div className="stat-label">Présidents</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {members.filter(m => m.role === 'Rapporteur').length}
            </div>
            <div className="stat-label">Rapporteurs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {[...new Set(members.map(m => m.institution))].length}
            </div>
            <div className="stat-label">Institutions</div>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls">
        <div className="controls-left">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-dropdown">
            <Filter size={20} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les rôles</option>
              <option value="Président">Président</option>
              <option value="Vice-Président">Vice-Président</option>
              <option value="Rapporteur">Rapporteur</option>
              <option value="Membre">Membre</option>
            </select>
          </div>
        </div>
        
        <div className="controls-right">
          {selectedMembers.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selectedMembers.length} sélectionné(s)</span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleBulkAction('export')}
              >
                <Download size={16} />
                Exporter
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="table-wrapper">
        <table className="commission-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                  onChange={handleSelectAll}
                  className="table-checkbox"
                />
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                <div className="th-content">
                  Nom
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? 
                      <ChevronUp size={16} /> : 
                      <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                <div className="th-content">
                  Rôle
                  {sortConfig.key === 'role' && (
                    sortConfig.direction === 'asc' ? 
                      <ChevronUp size={16} /> : 
                      <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('institution')} className="sortable">
                <div className="th-content">
                  Institution
                  {sortConfig.key === 'institution' && (
                    sortConfig.direction === 'asc' ? 
                      <ChevronUp size={16} /> : 
                      <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th>Contact</th>
              <th>Spécialisation</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-message">
                    <Users size={48} />
                    <p>Aucun membre trouvé</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedMembers.map((member) => (
                <React.Fragment key={member.id}>
                  <tr className={`table-row ${selectedMembers.includes(member.id) ? 'selected' : ''}`}>
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                        className="table-checkbox"
                      />
                    </td>
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <div className="member-name">{member.name}</div>
                          <div className="member-department">{member.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <div className="institution-cell">
                        <Briefcase size={14} />
                        {member.institution || 'Non spécifié'}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Mail size={14} />
                          <a href={`mailto:${member.email}`}>{member.email}</a>
                        </div>
                        {member.phone && (
                          <div className="contact-item">
                            <Phone size={14} />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="specialization-cell">
                        {member.specialization || 'Non spécifiée'}
                      </div>
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button
                          className="btn-action"
                          onClick={() => setExpandedRow(expandedRow === member.id ? null : member.id)}
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="btn-action"
                          onClick={() => handleEdit(member)}
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-action danger"
                          onClick={() => handleDelete(member.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="more-actions">
                          <button
                            className="btn-action"
                            onClick={() => setShowActions(showActions === member.id ? null : member.id)}
                          >
                            <MoreVertical size={18} />
                          </button>
                          {showActions === member.id && (
                            <div className="dropdown-actions">
                              <button onClick={() => console.log('Email', member.id)}>
                                <Mail size={16} />
                                Envoyer Email
                              </button>
                              <button onClick={() => console.log('Export', member.id)}>
                                <Download size={16} />
                                Exporter
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === member.id && (
                    <tr className="expanded-row">
                      <td colSpan="7">
                        <div className="expanded-content">
                          <div className="expanded-section">
                            <h4>Informations détaillées</h4>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <span className="detail-label">Date d'ajout:</span>
                                <span className="detail-value">
                                  {new Date(member.created_at || Date.now()).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Département:</span>
                                <span className="detail-value">{member.department || 'Non spécifié'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Spécialisation:</span>
                                <span className="detail-value">{member.specialization || 'Non spécifiée'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Statut:</span>
                                <span className="detail-value">
                                  <span className="status-badge active">Actif</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedMember ? 'Modifier le Membre' : 'Nouveau Membre'}</h2>
              <button className="modal-close" onClick={() => {
                setShowModal(false);
                resetForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
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
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rôle *</label>
                    <select
                      className="form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      required
                    >
                      <option value="">Sélectionner un rôle</option>
                      <option value="Président">Président</option>
                      <option value="Vice-Président">Vice-Président</option>
                      <option value="Rapporteur">Rapporteur</option>
                      <option value="Membre">Membre</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Département</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Spécialisation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="Ex: Intelligence Artificielle, Réseaux..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  {selectedMember ? 'Modifier' : 'Ajouter'}
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
