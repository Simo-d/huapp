import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  FolderOpen,
  UserCheck,
  ClipboardCheck,
  UserPlus,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Tableau de bord', icon: Home },
    { path: '/candidates', label: 'Candidats', icon: Users },
    { path: '/applications', label: 'Candidatures', icon: FileText },
    { path: '/documents', label: 'Documents', icon: FolderOpen },
    { path: '/commission', label: 'Commission', icon: UserCheck },
    { path: '/evaluation', label: 'Évaluation', icon: ClipboardCheck },
    { path: '/rapporteurs', label: 'Rapporteurs', icon: UserPlus },
    { path: '/defense', label: 'Soutenances', icon: Calendar },
    { path: '/reports', label: 'Rapports', icon: BarChart3 },
    { path: '/settings', label: 'Paramètres', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">HU System</h2>
          <button 
            className="sidebar-toggle desktop-hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header">
          <button 
            className="sidebar-toggle mobile-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="header-title">
            <h1>Système de Gestion HU - FPO</h1>
          </div>

          <div className="header-actions">
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user?.name || 'Utilisateur'}</span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-email">{user?.email}</p>
                    <p className="dropdown-role">{user?.role}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={onLogout}>
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
