import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('STUDENT'); // Student or Instructor/Admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setRoleMode(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login({ email, password });
      loginUser(response.data);
      if (response.data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials. Please verify your email & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="ambient-glow"></div>
      <div className="auth-card">
        <div className="auth-header">
          <h1>ExamPortal</h1>
          <p>Next-Gen Glassmorphic Assessment Suite</p>
        </div>

        {/* Role Toggle: Student vs Instructor/Admin */}
        <div className="role-toggle-wrapper">
          <label className="role-toggle-label">Select Workspace Role</label>
          <div className="role-toggle">
            <button
              type="button"
              className={`role-toggle-btn ${roleMode === 'STUDENT' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('STUDENT')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className={`role-toggle-btn ${roleMode === 'ADMIN' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('ADMIN')}
            >
              ⚡ Instructor / Admin
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@university.edu"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your security key"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Workspace →'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Need an account? <Link to="/register">Create student ID</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
