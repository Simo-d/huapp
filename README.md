# HU Process Management System - FPO

A comprehensive web application for managing the University Habilitation (Habilitation Universitaire - HU) process at the Faculty Polydisciplinaire d'Ouarzazate (FPO).

## 🚀 Features

- **Dashboard**: Real-time overview with statistics and activity tracking
- **Candidate Management**: Complete CRUD operations for HU candidates
- **Application Processing**: Multi-step application form with progress tracking
- **Document Management**: Centralized repository with upload/download capabilities
- **Commission Management**: Meeting scheduling and decision tracking
- **Evaluation Process**: Timeline-based workflow management
- **Rapporteur Management**: External evaluator database and assignment
- **Defense Scheduling**: Calendar interface for defense organization
- **Reports & Analytics**: Statistical dashboards and custom reports
- **Role-based Access Control**: Different interfaces for administrators, candidates, and evaluators

## 🛠️ Technology Stack

- **Frontend**: React.js 18.2
- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Custom CSS with modern design

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository** (or navigate to the project folder):
```bash
cd E:\GeniePot\aiprojects\huapp
```

2. **Install dependencies**:

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd server
npm install
```

3. **Start the application**:

Start the backend server (from the server directory):
```bash
npm run server
# or
node index.js
```

Start the React frontend (from the root directory):
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 👤 Demo Accounts

The system comes with pre-configured demo accounts:

**Administrator:**
- Email: admin@fpo.ma
- Password: admin123

**Candidate:**
- Email: candidate@fpo.ma
- Password: candidate123

## 📁 Project Structure

```
huapp/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components
│   ├── App.js          # Main application component
│   └── index.js        # Application entry point
├── server/
│   ├── routes/         # API routes
│   ├── uploads/        # Uploaded files storage
│   ├── database.js     # SQLite database configuration
│   └── index.js        # Server entry point
└── package.json        # Project dependencies
```

## 🔑 Key Features Explained

### 1. Application Workflow
The system follows an 8-stage workflow:
- Application Submission
- Initial Review
- Commission Evaluation
- Rapporteur Assignment
- Report Collection
- Defense Authorization
- Defense
- Diploma Processing

### 2. Document Management
- Automatic document generation from templates
- Version control for documents
- Categorized storage (Authorizations, Reports, PVs, etc.)

### 3. Real-time Tracking
- Progress indicators for each application
- Status updates at each stage
- Automated notifications

### 4. Multi-language Support
- Interface available in French
- Arabic support planned

## 🔒 Security Features

- JWT-based authentication
- Password encryption with bcrypt
- Role-based access control
- Secure file upload with validation
- Session management

## 📊 Database Schema

The SQLite database includes the following main tables:
- `users`: System users and authentication
- `candidates`: HU candidate information
- `applications`: Application tracking
- `documents`: Document management
- `commission_members`: Commission member details
- `meetings`: Meeting scheduling
- `evaluations`: Evaluation records
- `rapporteurs`: External evaluator database
- `reports`: Evaluation reports
- `defenses`: Defense scheduling

## 🚦 API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/candidates` - List all candidates
- `POST /api/applications` - Create new application
- `POST /api/documents/upload` - Upload document
- And many more...

## 🎯 Future Enhancements

- Email notifications
- PDF generation for official documents
- Advanced search and filtering
- Mobile application
- Integration with university systems
- Automated backup system

## 📝 License

This project is developed for the Faculty Polydisciplinaire d'Ouarzazate (FPO).

## 💡 Support

For support and questions, please contact the IT department at FPO.

---

**Note**: This is a demonstration system. For production use, additional security measures and configurations are recommended.
