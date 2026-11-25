import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuestions, getExams, getUserStats } from '../../services/api';
import { formatDate, getExamStatus } from '../../utils/helpers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalQuestions: 0, totalExams: 0, activeExams: 0, activeStudents: 0 });
  const [exams, setExams] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [questionsRes, examsRes, usersRes] = await Promise.all([
          getQuestions(0, 1),
          getExams(),
          getUserStats().catch(() => ({ data: { activeStudents: 0, totalUsers: 1 } }))
        ]);
        const examList = examsRes.data || [];
        setExams(examList);
        
        // Count exams that are currently strictly LIVE (window start <= now <= window end)
        const liveExamsCount = examList.filter(e => getExamStatus(e) === 'LIVE').length;

        setStats({
          totalQuestions: questionsRes.data.totalElements || 0,
          totalExams: examList.length,
          activeExams: liveExamsCount,
          activeStudents: usersRes.data?.activeStudents ?? 0,
        });
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderStatusBadge = (exam) => {
    const status = getExamStatus(exam);
    if (status === 'UPCOMING') {
      return <span className="badge badge-upcoming">⏳ Upcoming</span>;
    }
    if (status === 'LIVE') {
      return <span className="badge badge-live">● Live Active</span>;
    }
    if (status === 'CONCLUDED') {
      return <span className="badge badge-concluded">○ Concluded</span>;
    }
    return <span className="badge badge-inactive">Inactive</span>;
  };

  const filteredExams = exams.filter((exam) => {
    if (statusFilter === 'ALL') return true;
    return getExamStatus(exam) === statusFilter;
  });

  if (loading) return <div className="loading">Rendering glass telemetry...</div>;

  return (
    <div className="management-page">
      {/* Page 4: Admin Bento-Box Dashboard Header */}
      <div className="bento-dashboard-header">
        <div>
          <h1>Instructor & Admin Bento Suite</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time telemetry, assessment scheduling, and systemic performance oversight.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/exams?create=true" className="btn btn-primary">
            + Create New Exam
          </Link>
          <Link to="/admin/questions" className="btn btn-secondary">
            📚 Question Bank
          </Link>
        </div>
      </div>

      {/* Top-Level Metric Cards (Bento-Box Grid) */}
      <div className="bento-metrics-grid">
        {/* Metric 1: Real-time Live Active Students */}
        <div className="glass-card bento-metric-card">
          <div className="bento-icon-glow bento-icon-students">
            👥
          </div>
          <div className="bento-metric-info">
            <h3>{stats.activeStudents}</h3>
            <p>Registered Student Candidates</p>
          </div>
        </div>

        {/* Metric 2: Live Ongoing Exams */}
        <div className="glass-card bento-metric-card">
          <div className="bento-icon-glow bento-icon-exams">
            ⚡
          </div>
          <div className="bento-metric-info">
            <h3>{stats.activeExams}</h3>
            <p>Currently Live Exams</p>
          </div>
        </div>

        {/* Metric 3: Total Question Repository */}
        <div className="glass-card bento-metric-card">
          <div className="bento-icon-glow bento-icon-scores">
            📊
          </div>
          <div className="bento-metric-info">
            <h3>{stats.totalQuestions}</h3>
            <p>Question Bank Items</p>
          </div>
        </div>
      </div>

      {/* Wide Frosted Table Component Listing All Exams & Statuses */}
      <div className="glass-panel bento-panel-wide">
        <div className="bento-panel-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <h2>Master Examination Registry</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="status-filter-group" role="group" aria-label="Filter exams by status">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'LIVE', label: '● Active' },
                { key: 'UPCOMING', label: '⏳ Upcoming' },
                { key: 'CONCLUDED', label: '○ Concluded' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`status-filter-btn ${statusFilter === opt.key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Link to="/admin/exams" className="btn btn-sm btn-secondary">
              Configure Schedules →
            </Link>
          </div>
        </div>

        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Exam Title</th>
                <th>Duration</th>
                <th>Assigned Items</th>
                <th>Status</th>
                <th>Window Start</th>
                <th>Window End</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    {exams.length === 0
                      ? 'No assessments registered. Click "+ Create New Exam" above.'
                      : 'No assessments match the selected status filter.'}
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id}>
                    <td>#{exam.id}</td>
                    <td style={{ fontWeight: 600 }}>{exam.title}</td>
                    <td>{exam.durationMinutes ?? 0} mins</td>
                    <td>{exam.questions?.length || 0} questions</td>
                    <td>
                      {renderStatusBadge(exam)}
                    </td>
                    <td>{formatDate(exam.startTime)}</td>
                    <td>{formatDate(exam.endTime)}</td>
                    <td>
                      <Link to={`/leaderboard/${exam.id}`} className="btn btn-sm btn-secondary">
                        🏆 Leaderboard
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
