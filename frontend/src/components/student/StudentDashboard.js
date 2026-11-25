import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getActiveExams, getHistory, downloadPdf } from '../../services/api';
import { formatDate, getExamStatus } from '../../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, historyRes] = await Promise.all([
          getActiveExams(),
          user?.userId ? getHistory(user.userId) : Promise.resolve({ data: [] })
        ]);
        setExams(activeRes.data || []);
        setHistory(historyRes.data || []);
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Compute Recent Average Score
  const averagePercentage = history.length > 0
    ? (history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / history.length).toFixed(1)
    : 0;

  const completedExamIds = new Set(history.map((h) => h.examId));

  // Main Dashboard only shows exams the student has NOT attended yet
  const unattendedExams = exams.filter((exam) => !completedExamIds.has(exam.id));

  const filteredExams = unattendedExams.filter((exam) => {
    if (statusFilter === 'ALL') return true;
    return getExamStatus(exam) === statusFilter;
  });

  const handleDownloadPdf = async (attemptId) => {
    try {
      const res = await downloadPdf(attemptId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${attemptId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF certificate:', err);
    }
  };

  // Circular progress calculation
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averagePercentage / 100) * circumference;

  // Render Status Badge
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

  if (loading) return <div className="loading">Refracting glass workspace...</div>;

  return (
    <div className="student-portal-layout">
      {/* Page 2: Frosted Sidebar Navigation */}
      <aside className="glass-sidebar">
        <div className="sidebar-profile">
          <div className="profile-avatar">🎓</div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-role">Verified Candidate</div>
        </div>

        <nav className="sidebar-menu">
          <button
            type="button"
            className={`sidebar-item ${activeTab === 'DASHBOARD' ? 'active' : ''}`}
            onClick={() => setActiveTab('DASHBOARD')}
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            className={`sidebar-item ${activeTab === 'MY_EXAMS' ? 'active' : ''}`}
            onClick={() => setActiveTab('MY_EXAMS')}
          >
            <span className="icon">📝</span>
            <span>My Exams ({history.length})</span>
          </button>
          <Link to="/student/results" className="sidebar-item">
            <span className="icon">🏆</span>
            <span>Results & PDF</span>
          </Link>
        </nav>
      </aside>

      {/* Main Student Workspace Area */}
      <main className="student-workspace">
        <div className="workspace-header">
          <h1>Candidate Workspace</h1>
          <p>Review active assessments, monitor performance, and verify certifications.</p>
        </div>

        {/* Top 3 Glass Cards: Upcoming, Scores, Notifications */}
        <div className="student-metrics-grid">
          {/* Card 1: Upcoming / Active Exams */}
          <div className="glass-card metric-glass-card">
            <div className="notification-bell" style={{ background: 'rgba(6, 182, 212, 0.2)', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
              ⏱️
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{unattendedExams.length}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Available Evaluations</p>
            </div>
          </div>

          {/* Card 2: Recent Scores with Circular Progress Graphics */}
          <div className="glass-card metric-glass-card">
            <div className="progress-circle-wrap">
              <svg className="progress-circle" viewBox="0 0 74 74">
                <circle className="circle-bg" cx="37" cy="37" r={radius} />
                <circle
                  className="circle-fill"
                  cx="37"
                  cy="37"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span className="progress-text">{averagePercentage}%</span>
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Average</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {history.length} assessment{history.length !== 1 ? 's' : ''} evaluated
              </p>
            </div>
          </div>

          {/* Card 3: Active Notifications */}
          <div className="glass-card metric-glass-card">
            <div className="notification-bell">
              🔔
            </div>
            <div className="notification-details">
              <h4>System Active</h4>
              <p>Strict countdown timer & schedule enforcement active</p>
            </div>
          </div>
        </div>

        {activeTab === 'DASHBOARD' ? (
          /* Section: Available Unattended Assessments */
          <section id="active-exams">
            <div className="section-header-row">
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                <span>⚡ Scheduled Assessments</span>
              </h2>

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
            </div>

            <div className="exam-grid">
              {filteredExams.length === 0 ? (
                <div className="glass-panel empty-state" style={{ gridColumn: '1 / -1' }}>
                  <h3>{unattendedExams.length === 0 ? 'No pending assessments right now' : 'No assessments match this filter'}</h3>
                  <p>
                    {unattendedExams.length === 0
                      ? 'All your scheduled evaluations are completed or none are assigned. Check "My Exams" to review attended tests.'
                      : 'Try selecting another exam status filter above.'}
                  </p>
                </div>
              ) : (
                filteredExams.map((exam) => {
                  const status = getExamStatus(exam);
                  const isLive = status === 'LIVE';
                  const isUpcoming = status === 'UPCOMING';
                  const isConcluded = status === 'CONCLUDED';

                  return (
                    <div key={exam.id} className="glass-card exam-card">
                      <div>
                        <div className="exam-card-header">
                          <h3>{exam.title}</h3>
                          {renderStatusBadge(exam)}
                        </div>
                        <p className="exam-description">
                          {exam.description || 'Comprehensive evaluation covering scheduled syllabus questions.'}
                        </p>
                      </div>

                      <div>
                        <div className="exam-meta" style={{ flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>⏱️ Duration: <strong>{exam.durationMinutes} mins</strong></span>
                            <span>📋 Questions: <strong>{exam.questions?.length || 0}</strong></span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Window: {formatDate(exam.startTime)} — {formatDate(exam.endTime)}
                          </div>
                        </div>

                        {isLive && (
                          <button
                            className="btn btn-primary btn-block"
                            onClick={() => navigate(`/student/exam/${exam.id}`)}
                          >
                            Start Assessment Now →
                          </button>
                        )}

                        {isUpcoming && (
                          <button
                            className="btn btn-secondary btn-block"
                            disabled
                            style={{ cursor: 'not-allowed', opacity: 0.7 }}
                            title={`Starts on ${formatDate(exam.startTime)}`}
                          >
                            ⏳ Starts at {formatDate(exam.startTime)}
                          </button>
                        )}

                        {isConcluded && (
                          <button
                            className="btn btn-secondary btn-block"
                            disabled
                            style={{ cursor: 'not-allowed', opacity: 0.5 }}
                          >
                            ○ Assessment Concluded
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        ) : (
          /* Section: Attended Exams ("My Exams") */
          <section id="my-exams">
            <div className="section-header-row">
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                <span>📝 My Attended Exams</span>
              </h2>
            </div>

            <div className="exam-grid">
              {history.length === 0 ? (
                <div className="glass-panel empty-state" style={{ gridColumn: '1 / -1' }}>
                  <h3>No exams attended yet</h3>
                  <p>Once you complete an assessment, it will move here with your score and leaderboard access.</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('DASHBOARD')}>
                    Browse Available Exams
                  </button>
                </div>
              ) : (
                history.map((item) => {
                  const matchedExam = exams.find((e) => e.id === item.examId);
                  return (
                    <div key={item.attemptId} className="glass-card exam-card">
                      <div>
                        <div className="exam-card-header">
                          <h3>{item.examTitle}</h3>
                          <span className={`badge ${item.percentage >= 40 ? 'badge-pass' : 'badge-fail'}`}>
                            ✓ {item.percentage?.toFixed(1)}%
                          </span>
                        </div>
                        <p className="exam-description">
                          {matchedExam?.description || 'Completed assessment record.'}
                        </p>
                      </div>

                      <div>
                        <div className="exam-meta" style={{ flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🎯 Score: <strong style={{ color: 'var(--accent-cyan)' }}>{item.score} / {item.totalMarks}</strong></span>
                            <span>📊 Result: <strong>{item.percentage >= 40 ? 'Pass' : 'Needs Review'}</strong></span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Submitted: {formatDate(item.submittedAt)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={() => navigate(`/leaderboard/${item.examId}`)}
                          >
                            🏆 Leaderboard
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => handleDownloadPdf(item.attemptId)}
                          >
                            📥 PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
