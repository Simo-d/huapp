import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  AlertCircle,
  Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { candidatesAPI, applicationsAPI } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    pendingApplications: 0,
    inProgress: 0,
    completed: 0,
    upcomingDefenses: 0,
    waitingReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Load candidate stats
      const candidateStats = await candidatesAPI.getStats();
      // Load application stats
      const applicationStats = await applicationsAPI.getStats();
      
      setStats({
        totalCandidates: candidateStats.data.total || 0,
        pendingApplications: candidateStats.data.pending || 0,
        inProgress: candidateStats.data.in_progress || 0,
        completed: candidateStats.data.completed || 0,
        upcomingDefenses: 0, // This would come from defenses API
        waitingReports: 0 // This would come from reports API
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = [
    { month: 'Jan', applications: 4, completed: 2 },
    { month: 'Fév', applications: 6, completed: 3 },
    { month: 'Mar', applications: 8, completed: 5 },
    { month: 'Avr', applications: 7, completed: 4 },
    { month: 'Mai', applications: 10, completed: 6 },
    { month: 'Jun', applications: 9, completed: 7 }
  ];

  const statusData = [
    { name: 'En attente', value: stats.pendingApplications, color: '#fbbf24' },
    { name: 'En cours', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Terminé', value: stats.completed, color: '#10b981' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'application',
      message: 'Nouvelle candidature reçue',
      candidate: 'Nouveau candidat',
      time: 'Récemment',
      icon: FileText,
      color: 'blue'
    }
  ];

  const upcomingDefenses = [];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner">Chargement du tableau de bord...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Vue d'ensemble du système HU</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Candidats</p>
            <p className="stat-value">{stats.totalCandidates}</p>
            <p className="stat-change">Base de données</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">En attente</p>
            <p className="stat-value">{stats.pendingApplications}</p>
            <p className="stat-change">À traiter</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">En cours</p>
            <p className="stat-value">{stats.inProgress}</p>
            <p className="stat-change">En évaluation</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Terminés</p>
            <p className="stat-value">{stats.completed}</p>
            <p className="stat-change">Complétés</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Évolution Mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="applications" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Candidatures"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Terminées"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        {/* Recent Activities */}
        <div className="activity-card">
          <h3 className="section-title">Activités Récentes</h3>
          <div className="activity-list">
            {recentActivities.length === 0 ? (
              <p className="no-activity">Aucune activité récente</p>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <p className="activity-candidate">{activity.candidate}</p>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Defenses */}
        <div className="defenses-card">
          <h3 className="section-title">Soutenances à Venir</h3>
          <div className="defense-list">
            {upcomingDefenses.length === 0 ? (
              <p className="no-defense">Aucune soutenance programmée</p>
            ) : (
              upcomingDefenses.map((defense) => (
                <div key={defense.id} className="defense-item">
                  <div className="defense-date">
                    <Calendar size={16} />
                    <span>{defense.date}</span>
                  </div>
                  <div className="defense-info">
                    <p className="defense-candidate">{defense.candidate}</p>
                    <div className="defense-details">
                      <span>{defense.time}</span>
                      <span>•</span>
                      <span>{defense.room}</span>
                      <span>•</span>
                      <span>{defense.jury} jurés</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
