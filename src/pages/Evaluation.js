import React, { useState, useEffect } from 'react';
import {
  Star,
  FileText,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Send,
  Download,
  Eye,
  Calendar,
  User,
  Award,
  TrendingUp,
  Filter,
  Mail
} from 'lucide-react';
import api from '../utils/api';
import './pages.css';
import './Evaluation.css';

const Evaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [rapporteurs, setRapporteurs] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  
  const [assignmentForm, setAssignmentForm] = useState({
    application_id: '',
    rapporteur_ids: [],
    deadline: '',
    notes: ''
  });

  const [evaluationForm, setEvaluationForm] = useState({
    application_id: '',
    evaluator_id: '',
    evaluator_name: '',
    score: '',
    strengths: '',
    weaknesses: '',
    recommendation: '',
    comments: '',
    status: 'En cours'
  });

  const [reportForm, setReportForm] = useState({
    application_id: '',
    rapporteur_id: '',
    content: '',
    recommendation: '',
    submission_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evalRes, appsRes, candidatesRes, rapporteursRes, reportsRes] = await Promise.all([
        api.get('/evaluations'),
        api.get('/applications'),
        api.get('/candidates'),
        api.get('/rapporteurs'),
        api.get('/reports')
      ]);
      
      setEvaluations(evalRes.data || []);
      setApplications(appsRes.data || []);
      setCandidates(candidatesRes.data || []);
      setRapporteurs(rapporteursRes.data || []);
      setReports(reportsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRapporteurs = async (e) => {
    e.preventDefault();
    try {
      // Create evaluation for each selected rapporteur
      for (const rapporteurId of assignmentForm.rapporteur_ids) {
        const rapporteur = rapporteurs.find(r => r.id === parseInt(rapporteurId));
        await api.post('/evaluations', {
          application_id: assignmentForm.application_id,
          evaluator_id: rapporteurId,
          evaluator_name: rapporteur?.name || 'Unknown',
          status: 'En cours',
          evaluation_date: assignmentForm.deadline
        });

        // Send notification (in real app, this would send an email)
        console.log(`Notification sent to ${rapporteur?.email}`);
      }

      // Update application status
      await api.patch(`/applications/${assignmentForm.application_id}/status`, {
        current_stage: 'Évaluation Rapporteurs',
        progress: 50
      });

      alert('Rapporteurs assignés avec succès');
      setShowAssignModal(false);
      resetAssignmentForm();
      loadData();
    } catch (error) {
      console.error('Error assigning rapporteurs:', error);
      alert('Erreur lors de l\'assignation des rapporteurs');
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvaluation) {
        // Update existing evaluation
        await api.put(`/evaluations/${selectedEvaluation.id}`, {
          ...evaluationForm,
          status: 'Terminé'
        });
      } else {
        // Create new evaluation
        await api.post('/evaluations', {
          ...evaluationForm,
          evaluation_date: new Date().toISOString().split('T')[0],
          status: 'Terminé'
        });
      }

      alert('Évaluation enregistrée avec succès');
      setShowEvaluationModal(false);
      resetEvaluationForm();
      loadData();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Erreur lors de l\'enregistrement de l\'évaluation');
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reports', reportForm);
      
      // Update evaluation status if exists
      const evaluation = evaluations.find(
        e => e.application_id === parseInt(reportForm.application_id) && 
             e.evaluator_id === parseInt(reportForm.rapporteur_id)
      );
      
      if (evaluation) {
        await api.put(`/evaluations/${evaluation.id}`, {
          ...evaluation,
          status: 'Rapport soumis'
        });
      }

      alert('Rapport soumis avec succès');
      setShowReportModal(false);
      resetReportForm();
      loadData();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Erreur lors de la soumission du rapport');
    }
  };

  const handleDeleteEvaluation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation?')) {
      try {
        await api.delete(`/evaluations/${id}`);
        alert('Évaluation supprimée avec succès');
        loadData();
      } catch (error) {
        console.error('Error deleting evaluation:', error);
        alert('Erreur lors de la suppression de l\'évaluation');
      }
    }
  };

  const handleGenerateReport = async (evaluationId) => {
    try {
      const evaluation = evaluations.find(e => e.id === evaluationId);
      const application = applications.find(a => a.id === evaluation.application_id);
      const candidate = candidates.find(c => c.id === application?.candidate_id);
      
      // Generate evaluation report PDF
      const response = await api.post('/generation/evaluation-report', {
        evaluationId,
        candidateId: candidate?.id,
        applicationId: evaluation.application_id
      });

      if (response.data.success) {
        alert('Rapport d\'évaluation généré avec succès');
        window.open(`http://localhost:5000${response.data.path}`, '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erreur lors de la génération du rapport');
    }
  };

  const openEvaluationModal = (evaluation = null, application = null) => {
    if (evaluation) {
      setSelectedEvaluation(evaluation);
      setEvaluationForm({
        application_id: evaluation.application_id,
        evaluator_id: evaluation.evaluator_id,
        evaluator_name: evaluation.evaluator_name,
        score: evaluation.score || '',
        strengths: evaluation.strengths || '',
        weaknesses: evaluation.weaknesses || '',
        recommendation: evaluation.recommendation || '',
        comments: evaluation.comments || '',
        status: evaluation.status
      });
    } else if (application) {
      setEvaluationForm({
        ...evaluationForm,
        application_id: application.id
      });
    }
    setShowEvaluationModal(true);
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      application_id: '',
      rapporteur_ids: [],
      deadline: '',
      notes: ''
    });
  };

  const resetEvaluationForm = () => {
    setEvaluationForm({
      application_id: '',
      evaluator_id: '',
      evaluator_name: '',
      score: '',
      strengths: '',
      weaknesses: '',
      recommendation: '',
      comments: '',
      status: 'En cours'
    });
    setSelectedEvaluation(null);
  };

  const resetReportForm = () => {
    setReportForm({
      application_id: '',
      rapporteur_id: '',
      content: '',
      recommendation: '',
      submission_date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'En cours': return 'badge-warning';
      case 'Terminé': return 'badge-success';
      case 'Rapport soumis': return 'badge-info';
      case 'En attente': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    if (score >= 40) return 'badge-danger';
    return 'badge-secondary';
  };

  const pendingApplications = applications.filter(
    app => !evaluations.some(e => e.application_id === app.id)
  );

  const completedEvaluations = evaluations.filter(e => e.status === 'Terminé' || e.status === 'Rapport soumis');
  const pendingEvaluations = evaluations.filter(e => e.status === 'En cours');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Chargement des évaluations...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Évaluations</h1>
          <p className="page-subtitle">Évaluations des rapporteurs et rapports de soutenance</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
            <UserCheck size={20} />
            Assigner Rapporteurs
          </button>
          <button className="btn btn-success" onClick={() => setShowReportModal(true)}>
            <FileText size={20} />
            Nouveau Rapport
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{pendingEvaluations.length}</div>
            <div className="stat-label">Évaluations en cours</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{completedEvaluations.length}</div>
            <div className="stat-label">Évaluations terminées</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{reports.length}</div>
            <div className="stat-label">Rapports soumis</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{pendingApplications.length}</div>
            <div className="stat-label">En attente d'assignation</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <UserCheck size={18} />
          Assignations ({evaluations.length})
        </button>
        <button
          className={`tab ${activeTab === 'evaluations' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluations')}
        >
          <Star size={18} />
          Évaluations ({completedEvaluations.length})
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={18} />
          Rapports ({reports.length})
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'assignments' && (
        <div className="evaluations-section">
          <h3 className="section-title">Candidatures en attente d'assignation</h3>
          {pendingApplications.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>Toutes les candidatures ont des rapporteurs assignés</p>
            </div>
          ) : (
            <div className="applications-grid">
              {pendingApplications.map(app => {
                const candidate = candidates.find(c => c.id === app.candidate_id);
                return (
                  <div key={app.id} className="application-card">
                    <div className="application-header">
                      <div className="user-avatar">
                        {candidate ? candidate.first_name[0] + candidate.last_name[0] : 'NA'}
                      </div>
                      <div className="application-info">
                        <h4>{candidate ? `${candidate.first_name} ${candidate.last_name}` : 'N/A'}</h4>
                        <p className="text-muted">{candidate?.department}</p>
                      </div>
                    </div>
                    <div className="application-meta">
                      <span className="meta-item">
                        <Calendar size={14} />
                        {new Date(app.submission_date || app.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => {
                        setAssignmentForm({ ...assignmentForm, application_id: app.id });
                        setShowAssignModal(true);
                      }}
                    >
                      <UserCheck size={16} />
                      Assigner Rapporteurs
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <h3 className="section-title mt-4">Évaluations en cours</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Rapporteur</th>
                  <th>Date d'assignation</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEvaluations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Aucune évaluation en cours
                    </td>
                  </tr>
                ) : (
                  pendingEvaluations.map(evaluation => {
                    const app = applications.find(a => a.id === evaluation.application_id);
                    const candidate = candidates.find(c => c.id === app?.candidate_id);
                    return (
                      <tr key={evaluation.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar small">
                              {candidate ? candidate.first_name[0] + candidate.last_name[0] : 'NA'}
                            </div>
                            <span>{candidate ? `${candidate.first_name} ${candidate.last_name}` : 'N/A'}</span>
                          </div>
                        </td>
                        <td>{evaluation.evaluator_name}</td>
                        <td>{new Date(evaluation.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>
                          {evaluation.evaluation_date ? 
                            new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR') : 
                            'Non définie'
                          }
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(evaluation.status)}`}>
                            {evaluation.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => openEvaluationModal(evaluation)}
                              title="Compléter l'évaluation"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="btn-icon info"
                              onClick={() => {
                                // Send reminder
                                alert('Rappel envoyé au rapporteur');
                              }}
                              title="Envoyer un rappel"
                            >
                              <Mail size={18} />
                            </button>
                            <button
                              className="btn-icon danger"
                              onClick={() => handleDeleteEvaluation(evaluation.id)}
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
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="evaluations-section">
          <div className="evaluations-grid">
            {completedEvaluations.map(evaluation => {
              const app = applications.find(a => a.id === evaluation.application_id);
              const candidate = candidates.find(c => c.id === app?.candidate_id);
              
              return (
                <div key={evaluation.id} className="evaluation-card">
                  <div className="evaluation-header">
                    <div className="evaluation-candidate">
                      <div className="user-avatar">
                        {candidate ? candidate.first_name[0] + candidate.last_name[0] : 'NA'}
                      </div>
                      <div>
                        <h4>{candidate ? `${candidate.first_name} ${candidate.last_name}` : 'N/A'}</h4>
                        <p className="text-muted">{candidate?.department}</p>
                      </div>
                    </div>
                    {evaluation.score && (
                      <div className={`score-badge ${getScoreBadgeClass(evaluation.score)}`}>
                        {evaluation.score}/100
                      </div>
                    )}
                  </div>
                  
                  <div className="evaluation-body">
                    <div className="evaluation-meta">
                      <span className="meta-item">
                        <User size={14} />
                        {evaluation.evaluator_name}
                      </span>
                      <span className="meta-item">
                        <Calendar size={14} />
                        {evaluation.evaluation_date ? 
                          new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR') : 
                          'Non datée'
                        }
                      </span>
                    </div>
                    
                    {evaluation.comments && (
                      <div className="evaluation-comments">
                        <strong>Commentaires:</strong>
                        <p>{evaluation.comments}</p>
                      </div>
                    )}
                    
                    <div className="evaluation-actions">
                      <button
                        className="btn-icon"
                        onClick={() => openEvaluationModal(evaluation)}
                        title="Voir/Modifier"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="btn-icon success"
                        onClick={() => handleGenerateReport(evaluation.id)}
                        title="Générer rapport PDF"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="reports-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Rapporteur</th>
                  <th>Date de soumission</th>
                  <th>Recommandation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Aucun rapport soumis
                    </td>
                  </tr>
                ) : (
                  reports.map(report => {
                    const app = applications.find(a => a.id === report.application_id);
                    const candidate = candidates.find(c => c.id === app?.candidate_id);
                    const rapporteur = rapporteurs.find(r => r.id === report.rapporteur_id);
                    
                    return (
                      <tr key={report.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar small">
                              {candidate ? candidate.first_name[0] + candidate.last_name[0] : 'NA'}
                            </div>
                            <span>{candidate ? `${candidate.first_name} ${candidate.last_name}` : 'N/A'}</span>
                          </div>
                        </td>
                        <td>{rapporteur?.name || 'N/A'}</td>
                        <td>{new Date(report.submission_date).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span className={`badge ${
                            report.recommendation === 'Favorable' ? 'badge-success' :
                            report.recommendation === 'Défavorable' ? 'badge-danger' :
                            'badge-warning'
                          }`}>
                            {report.recommendation}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              title="Voir le rapport"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              className="btn-icon success"
                              title="Télécharger PDF"
                            >
                              <Download size={18} />
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
        </div>
      )}

      {/* Assign Rapporteurs Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assigner des Rapporteurs</h2>
              <button className="modal-close" onClick={() => {
                setShowAssignModal(false);
                resetAssignmentForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAssignRapporteurs}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Candidature *</label>
                  <select
                    className="form-input"
                    value={assignmentForm.application_id}
                    onChange={(e) => setAssignmentForm({...assignmentForm, application_id: e.target.value})}
                    required
                  >
                    <option value="">-- Sélectionner une candidature --</option>
                    {pendingApplications.map(app => {
                      const candidate = candidates.find(c => c.id === app.candidate_id);
                      return (
                        <option key={app.id} value={app.id}>
                          {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'N/A'} - {candidate?.department}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Rapporteurs * (Sélectionner au moins 2)</label>
                  <div className="checkbox-group">
                    {rapporteurs.map(rapporteur => (
                      <label key={rapporteur.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={rapporteur.id}
                          checked={assignmentForm.rapporteur_ids.includes(String(rapporteur.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignmentForm({
                                ...assignmentForm,
                                rapporteur_ids: [...assignmentForm.rapporteur_ids, e.target.value]
                              });
                            } else {
                              setAssignmentForm({
                                ...assignmentForm,
                                rapporteur_ids: assignmentForm.rapporteur_ids.filter(id => id !== e.target.value)
                              });
                            }
                          }}
                        />
                        <span>
                          {rapporteur.name} - {rapporteur.institution}
                          <small className="text-muted"> ({rapporteur.specialization})</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date limite d'évaluation</label>
                  <input
                    type="date"
                    className="form-input"
                    value={assignmentForm.deadline}
                    onChange={(e) => setAssignmentForm({...assignmentForm, deadline: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Instructions</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Instructions spéciales pour les rapporteurs..."
                    value={assignmentForm.notes}
                    onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowAssignModal(false);
                  resetAssignmentForm();
                }}>
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={assignmentForm.rapporteur_ids.length < 2}
                >
                  <Send size={20} />
                  Assigner et Notifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div className="modal-overlay" onClick={() => setShowEvaluationModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvaluation ? 'Modifier l\'Évaluation' : 'Nouvelle Évaluation'}</h2>
              <button className="modal-close" onClick={() => {
                setShowEvaluationModal(false);
                resetEvaluationForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitEvaluation}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Score (/100) *</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="100"
                      value={evaluationForm.score}
                      onChange={(e) => setEvaluationForm({...evaluationForm, score: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recommandation *</label>
                    <select
                      className="form-input"
                      value={evaluationForm.recommendation}
                      onChange={(e) => setEvaluationForm({...evaluationForm, recommendation: e.target.value})}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Très favorable">Très favorable</option>
                      <option value="Favorable">Favorable</option>
                      <option value="Réservé">Réservé</option>
                      <option value="Défavorable">Défavorable</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Points forts</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Points forts du candidat..."
                    value={evaluationForm.strengths}
                    onChange={(e) => setEvaluationForm({...evaluationForm, strengths: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Points à améliorer</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Points à améliorer..."
                    value={evaluationForm.weaknesses}
                    onChange={(e) => setEvaluationForm({...evaluationForm, weaknesses: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Commentaires généraux *</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Évaluation détaillée..."
                    value={evaluationForm.comments}
                    onChange={(e) => setEvaluationForm({...evaluationForm, comments: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEvaluationModal(false);
                  resetEvaluationForm();
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  Enregistrer l'Évaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouveau Rapport d'Évaluation</h2>
              <button className="modal-close" onClick={() => {
                setShowReportModal(false);
                resetReportForm();
              }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitReport}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Candidature *</label>
                    <select
                      className="form-input"
                      value={reportForm.application_id}
                      onChange={(e) => setReportForm({...reportForm, application_id: e.target.value})}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      {applications.map(app => {
                        const candidate = candidates.find(c => c.id === app.candidate_id);
                        return (
                          <option key={app.id} value={app.id}>
                            {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'N/A'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rapporteur *</label>
                    <select
                      className="form-input"
                      value={reportForm.rapporteur_id}
                      onChange={(e) => setReportForm({...reportForm, rapporteur_id: e.target.value})}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      {rapporteurs.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} - {r.institution}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contenu du rapport *</label>
                  <textarea
                    className="form-input"
                    rows="8"
                    placeholder="Rapport détaillé d'évaluation..."
                    value={reportForm.content}
                    onChange={(e) => setReportForm({...reportForm, content: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Recommandation finale *</label>
                    <select
                      className="form-input"
                      value={reportForm.recommendation}
                      onChange={(e) => setReportForm({...reportForm, recommendation: e.target.value})}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Favorable">Favorable</option>
                      <option value="Favorable avec réserves">Favorable avec réserves</option>
                      <option value="Défavorable">Défavorable</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date de soumission</label>
                    <input
                      type="date"
                      className="form-input"
                      value={reportForm.submission_date}
                      onChange={(e) => setReportForm({...reportForm, submission_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowReportModal(false);
                  resetReportForm();
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <FileText size={20} />
                  Soumettre le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
