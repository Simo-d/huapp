import React from 'react';
import { ClipboardCheck, User, Calendar, FileText } from 'lucide-react';

const Evaluation = () => {
  const evaluations = [
    { 
      id: 1, 
      candidate: 'Mohammed Alami', 
      evaluator: 'Dr. Ahmed Benali',
      date: '2024-11-15',
      score: 85,
      status: 'Complété'
    },
    { 
      id: 2, 
      candidate: 'Fatima Zahra Benali', 
      evaluator: 'Pr. Khadija Elmari',
      date: '2024-11-20',
      score: null,
      status: 'En cours'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Processus d'Évaluation</h1>
          <p className="page-subtitle">Suivi des évaluations des candidatures</p>
        </div>
      </div>

      <div className="card">
        <div className="evaluation-timeline">
          <div className="timeline-item completed">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Candidature Reçue</h4>
              <p>Vérification des documents</p>
            </div>
          </div>
          <div className="timeline-item completed">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Revue Commission</h4>
              <p>Évaluation préliminaire</p>
            </div>
          </div>
          <div className="timeline-item active">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Rapporteurs Assignés</h4>
              <p>En attente des rapports</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Décision Finale</h4>
              <p>Autorisation de soutenance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Évaluations en Cours</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Candidat</th>
              <th>Évaluateur</th>
              <th>Date</th>
              <th>Score</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map(evaluation => (
              <tr key={evaluation.id}>
                <td>{evaluation.candidate}</td>
                <td>{evaluation.evaluator}</td>
                <td>{evaluation.date}</td>
                <td>{evaluation.score ? `${evaluation.score}/100` : '-'}</td>
                <td>
                  <span className={`badge ${evaluation.status === 'Complété' ? 'badge-success' : 'badge-warning'}`}>
                    {evaluation.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Evaluation;
