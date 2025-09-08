import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Folder, 
  Calendar, 
  Award, 
  ClipboardCheck, 
  UserCheck, 
  Shield, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/design-system.css';
import './Layout.css';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de Bord', href: '/', icon: Home },
    { name: 'Candidats', href: '/candidates', icon: Users },
    { name: 'Candidatures', href: '/applications', icon: FileText },
    { name: 'Documents', href: '/documents', icon: Folder },
    { name: 'Commission', href: '/commission', icon: Shield },
    { name: 'Évaluation', href: '/evaluation', icon: ClipboardCheck },
    { name: 'Rapporteurs', href: '/rapporteurs', icon: UserCheck },
    { name: 'Soutenances', href: '/defense', icon: Award },
    { name: 'Rapports', href: '/reports', icon: Calendar },
    { name: 'Paramètres', href: '/settings', icon: Settings }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            {/* Logo placeholder - Add your FPO logo here */}
            <img 
              src="/fpo-logo.png" 
              alt="FPO Logo" 
              className="logo-image"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.target.style.display = 'none';
              }}
            />
            <div className="institution-name">
              <span className="institution-primary">FPO</span>
              <span className="institution-secondary">Système HU</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={onLogout}>
            <LogOut className="nav-icon" size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="header-title">
            <h1>Gestion HU - Faculté Polydisciplinaire d'Ouarzazate</h1>
          </div>

          <div className="header-actions">
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.name || 'Utilisateur'}</span>
                  <span className="user-role">{user?.role || 'Administrateur'}</span>
                </div>
                <ChevronDown size={16} />
              </button>

              {profileDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="user-avatar large">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="user-name">{user?.name || 'Utilisateur'}</div>
                      <div className="user-email">{user?.email || 'email@fpo.ma'}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/settings" className="dropdown-item">
                    <Settings size={16} />
                    Paramètres
                  </Link>
                  <button className="dropdown-item danger" onClick={onLogout}>
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Faculté Polydisciplinaire d'Ouarzazate</h4>
              <p>Système de Gestion des Habilitations Universitaires</p>
            </div>
            <div className="footer-section">
              <p className="footer-text">© 2024 FPO - Tous droits réservés</p>
              <p className="footer-text">Université Ibn Zohr</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
