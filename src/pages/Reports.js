import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  FileText,
  FilePlus,
  FileSpreadsheet,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { candidatesAPI, applicationsAPI } from '../utils/api';
import './Reports.css';

const Reports = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const candidateStats = await candidatesAPI.getStats();
      setStats(candidateStats.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyStats = [
    { month: 'Jan', candidatures: 4, soutenances: 2 },
    { month: 'Fév', candidatures: 6, soutenances: 3 },
    { month: 'Mar', candidatures: 8, soutenances: 5 },
    { month: 'Avr', candidatures: 7, soutenances: 4 },
    { month: 'Mai', candidatures: 10, soutenances: 6 },
    { month: 'Jun', candidatures: 9, soutenances: 7 }
  ];

  const generatePDFReport = async (type) => {
    setGeneratingReport(true);
    try {
      let url = '';
      let filename = '';
      
      switch(type) {
        case 'statistics':
          url = 'http://localhost:5000/api/reports/statistics';
          filename = 'rapport_statistiques.pdf';
          break;
        case 'applications':
          url = 'http://localhost:5000/api/reports/applications';
          filename = 'rapport_candidatures.pdf';
          break;
        case 'commission':
          // This would need additional form data
          alert('Veuillez utiliser la page Commission pour générer ce rapport');
          setGeneratingReport(false);
          return;
        case 'defense':
          // This would need additional form data
          alert('Veuillez utiliser la page Soutenances pour générer ce rapport');
          setGeneratingReport(false);
          return;
        default:
          break;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur lors de la génération du rapport');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      alert('Rapport généré avec succès!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportToExcel = async () => {
    setGeneratingReport(true);
    try {
      const response = await fetch('http://localhost:5000/api/reports/export/excel/candidates');
      if (!response.ok) throw new Error('Erreur lors de l\'export');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'candidats_export.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      alert('Export Excel réussi!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Erreur lors de l\'export Excel');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">Chargement des rapports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rapports et Analyses</h1>
          <p className="page-subtitle">Statistiques et génération de rapports</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={exportToExcel}
          disabled={generatingReport}
        >
          <FileSpreadsheet size={20} />
          {generatingReport ? 'Génération...' : 'Export Excel'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Candidatures 2024</p>
            <p className="stat-value">{stats.total || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">En Attente</p>
            <p className="stat-value">{stats.pending || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">En Cours</p>
            <p className="stat-value">{stats.in_progress || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <ClipboardCheck size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Terminés</p>
            <p className="stat-value">{stats.completed || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="card">
        <h3>Évolution Mensuelle</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="candidatures" fill="#3b82f6" name="Candidatures" />
            <Bar dataKey="soutenances" fill="#10b981" name="Soutenances" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Report Generation Section */}
      <div className="reports-section">
        <h3>Génération de Rapports PDF</h3>
        <div className="reports-grid">
          <div className="report-card">
            <div className="report-icon">
              <BarChart3 size={32} />
            </div>
            <h4>Rapport Statistique</h4>
            <p>Vue d'ensemble des candidatures et statistiques générales</p>
            <button 
              className="btn btn-primary"
              onClick={() => generatePDFReport('statistics')}
              disabled={generatingReport}
            >
              <Download size={16} />
              Générer PDF
            </button>
          </div>

          <div className="report-card">
            <div className="report-icon">
              <FileText size={32} />
            </div>
            <h4>Liste des Candidatures</h4>
            <p>Rapport détaillé de toutes les candidatures</p>
            <button 
              className="btn btn-primary"
              onClick={() => generatePDFReport('applications')}
              disabled={generatingReport}
            >
              <Download size={16} />
              Générer PDF
            </button>
          </div>

          <div className="report-card">
            <div className="report-icon">
              <Users size={32} />
            </div>
            <h4>PV Commission</h4>
            <p>Procès-verbal de réunion de commission</p>
            <button 
              className="btn btn-secondary"
              onClick={() => generatePDFReport('commission')}
              disabled={generatingReport}
            >
              <FilePlus size={16} />
              Configurer
            </button>
          </div>

          <div className="report-card">
            <div className="report-icon">
              <Calendar size={32} />
            </div>
            <h4>Convocation Soutenance</h4>
            <p>Générer les convocations de soutenance</p>
            <button 
              className="btn btn-secondary"
              onClick={() => generatePDFReport('defense')}
              disabled={generatingReport}
            >
              <FilePlus size={16} />
              Configurer
            </button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <h3>Options d'Export</h3>
        <div className="export-options">
          <button className="export-btn" onClick={exportToExcel}>
            <FileSpreadsheet size={20} />
            <span>Export Excel - Candidats</span>
          </button>
          <button className="export-btn" onClick={() => generatePDFReport('applications')}>
            <FileText size={20} />
            <span>Export PDF - Candidatures</span>
          </button>
          <button className="export-btn" onClick={() => generatePDFReport('statistics')}>
            <BarChart3 size={20} />
            <span>Export PDF - Statistiques</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
