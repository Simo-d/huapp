const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const database = require('./database');
const authRoutes = require('./routes/auth');
const candidatesRoutes = require('./routes/candidates');
const applicationsRoutes = require('./routes/applications');
const documentsRoutes = require('./routes/documents');
const reportsRoutes = require('./routes/reports');
const generationRoutes = require('./routes/generation');
const rapporteursRoutes = require('./routes/rapporteurs');
const meetingsRoutes = require('./routes/meetings');
const defensesRoutes = require('./routes/defenses');
const commissionMembersRoutes = require('./routes/commission-members');
const evaluationsRoutes = require('./routes/evaluations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow React app
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create necessary directories
const dirs = ['uploads', 'reports'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Initialize database
console.log('Initializing database...');
database.initialize();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/rapporteurs', rapporteursRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/defenses', defensesRoutes);
app.use('/api/commission-members', commissionMembersRoutes);
app.use('/api/evaluations', evaluationsRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'HU Management System API is running!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔧 Test the API at http://localhost:${PORT}/api/test`);
  console.log(`📄 PDF Reports available`);
  console.log(`📁 File uploads enabled`);
  console.log(`👤 Default admin: admin@fpo.ma / admin123`);
  console.log(`========================================\n`);
});

module.exports = app;
