import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import '../styles/design-system.css';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === 'admin@fpo.ma' && password === 'admin123') {
        onLogin({
          name: 'Administrateur',
          email: email,
          role: 'Administrateur',
          token: 'sample-jwt-token'
        });
      } else {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-pattern"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-container">
              <img 
                src="/fpo-logo.png" 
                alt="FPO Logo" 
                className="login-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="login-titles">
                <h1 className="login-title">Système HU</h1>
                <p className="login-subtitle">Faculté Polydisciplinaire d'Ouarzazate</p>
              </div>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse Email</label>
              <div className="input-group">
                <span className="input-icon">
                  <Mail size={20} />
                </span>
                <input
                  type="email"
                  className="form-input with-icon"
                  placeholder="email@fpo.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de Passe</label>
              <div className="input-group">
                <span className="input-icon">
                  <Lock size={20} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon"
                  placeholder="Entrer votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner small"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Se Connecter
                </>
              )}
            </button>

            <div className="login-footer">
              <p className="login-info">
                <strong>Compte Demo:</strong><br />
                Email: admin@fpo.ma<br />
                Mot de passe: admin123
              </p>
            </div>
          </form>
        </div>

        <div className="login-bottom">
          <p>© 2024 Université Ibn Zohr - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
