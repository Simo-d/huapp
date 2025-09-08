import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authAPI } from '../utils/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // Login
        const response = await authAPI.login({ email, password });
        onLogin({
          ...response.data.user,
          token: response.data.token
        });
      } else {
        // Register
        if (!name) {
          setError('Le nom est requis');
          setIsLoading(false);
          return;
        }
        const response = await authAPI.register({ 
          name, 
          email, 
          password,
          role: 'Candidat'
        });
        onLogin({
          ...response.data.user,
          token: response.data.token
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message === 'Network Error') {
        setError('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
      } else {
        setError(isLoginMode ? 'Email ou mot de passe incorrect' : 'Erreur lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <User size={40} />
          </div>
          <h1 className="login-title">HU Management System</h1>
          <p className="login-subtitle">Faculté Polydisciplinaire d'Ouarzazate</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Nom complet
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                required={!isLoginMode}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@fpo.ma"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Mot de passe
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : (isLoginMode ? 'Se connecter' : 'S\'inscrire')}
          </button>
        </form>

        <div className="login-switch">
          <p>
            {isLoginMode ? "Vous n'avez pas de compte?" : "Vous avez déjà un compte?"}
            <button 
              type="button" 
              className="switch-btn"
              onClick={switchMode}
            >
              {isLoginMode ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

        <div className="login-demo">
          <p className="demo-title">Compte de démonstration:</p>
          <div className="demo-credentials">
            <div className="demo-account">
              <strong>Administrateur:</strong>
              <span>admin@fpo.ma / admin123</span>
            </div>
          </div>
          <p className="demo-note">
            ⚠️ Assurez-vous que le serveur backend est démarré sur le port 5000
          </p>
        </div>
      </div>

      <div className="login-footer">
        <p>&copy; 2024 FPO - Tous droits réservés</p>
      </div>
    </div>
  );
};

export default Login;
