import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Applications from './pages/Applications';
import Documents from './pages/Documents';
import Commission from './pages/Commission';
import Evaluation from './pages/Evaluation';
import Rapporteurs from './pages/Rapporteurs';
import Defense from './pages/Defense';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ApplicationForm from './pages/ApplicationForm';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<ApplicationForm />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/commission" element={<Commission />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/rapporteurs" element={<Rapporteurs />} />
          <Route path="/defense" element={<Defense />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
