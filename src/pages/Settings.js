import React from 'react';
import { Settings as SettingsIcon, User, Lock, Mail, Database, FileText } from 'lucide-react';

const Settings = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Configuration du système</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="setting-section">
            <div className="setting-header">
              <User size={20} />
              <h3>Gestion des Utilisateurs</h3>
            </div>
            <p>Gérer les comptes utilisateurs et les permissions</p>
            <button className="btn btn-primary">Gérer les Utilisateurs</button>
          </div>
        </div>

        <div className="card">
          <div className="setting-section">
            <div className="setting-header">
              <Lock size={20} />
              <h3>Sécurité</h3>
            </div>
            <p>Configurer les paramètres de sécurité</p>
            <button className="btn btn-primary">Paramètres de Sécurité</button>
          </div>
        </div>

        <div className="card">
          <div className="setting-section">
            <div className="setting-header">
              <Mail size={20} />
              <h3>Notifications</h3>
            </div>
            <p>Gérer les modèles d'emails et notifications</p>
            <button className="btn btn-primary">Configurer Notifications</button>
          </div>
        </div>

        <div className="card">
          <div className="setting-section">
            <div className="setting-header">
              <FileText size={20} />
              <h3>Modèles de Documents</h3>
            </div>
            <p>Gérer les modèles de documents</p>
            <button className="btn btn-primary">Gérer les Modèles</button>
          </div>
        </div>

        <div className="card">
          <div className="setting-section">
            <div className="setting-header">
              <Database size={20} />
              <h3>Sauvegarde</h3>
            </div>
            <p>Sauvegarder et restaurer les données</p>
            <button className="btn btn-primary">Gérer les Sauvegardes</button>
          </div>
        </div>

        <div className="card">
          <div className="setting-section">
            <div className="setting-header">
              <SettingsIcon size={20} />
              <h3>Paramètres Généraux</h3>
            </div>
            <p>Configuration générale du système</p>
            <button className="btn btn-primary">Paramètres Généraux</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
