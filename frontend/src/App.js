import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import AdminDashboard from './components/admin/AdminDashboard';
import QuestionManagement from './components/admin/QuestionManagement';
import ExamManagement from './components/admin/ExamManagement';
import StudentDashboard from './components/student/StudentDashboard';
import ExamPage from './components/exam/ExamPage';
import ExamHistory from './components/student/ExamHistory';
import Leaderboard from './components/common/Leaderboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Root Route: Rich 6-Section Glassmorphism Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin / Instructor Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute role="ADMIN"><QuestionManagement /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute role="ADMIN"><ExamManagement /></ProtectedRoute>} />

            {/* Student Candidate Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/exam/:id" element={<ProtectedRoute role="STUDENT"><ExamPage /></ProtectedRoute>} />
            <Route path="/student/results" element={<ProtectedRoute role="STUDENT"><ExamHistory /></ProtectedRoute>} />

            {/* Common Routes */}
            <Route path="/leaderboard/:examId" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

            {/* 404 Catch-All Route */}
            <Route path="*" element={
              <div className="glass-panel auth-card" style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '12px' }}>404 — Page Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  The page you are looking for does not exist or has been moved.
                </p>
                <Link to="/" className="btn btn-primary">← Return Home</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
