import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard') : '/'}>
          <h2>📝 ExamPortal</h2>
        </Link>
      </div>

      <div className="navbar-links">
        {!isAuthenticated ? (
          <>
            <Link to="/">Home</Link>
            <a href="/#features">Features</a>
            <a href="/#workflow">How It Works</a>
            <a href="/#personas">Portals</a>
          </>
        ) : (
          user?.role === 'ADMIN' ? (
            <>
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/questions">Questions</Link>
              <Link to="/admin/exams">Exams</Link>
            </>
          ) : (
            <>
              <Link to="/student/dashboard">Dashboard</Link>
              <Link to="/student/results">My Results</Link>
            </>
          )
        )}
      </div>

      <div className="navbar-user">
        {!isAuthenticated ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              Sign In 🔑
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              Register
            </Link>
          </div>
        ) : (
          <>
            <span className="user-name">👤 {user?.name}</span>
            <span className="user-role">{user?.role}</span>
            <button onClick={handleLogout} className="btn btn-logout">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
