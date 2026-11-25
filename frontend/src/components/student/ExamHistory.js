import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHistory, downloadPdf } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const ExamHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory(user.userId);
        setHistory(res.data || []);
      } catch (err) {
        console.error('Error fetching exam history:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.userId) fetchHistory();
  }, [user]);

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
      alert('Error downloading PDF certificate');
    }
  };

  if (loading) return <div className="loading">Retrieving candidate records...</div>;

  return (
    <div className="management-page">
      <div className="bento-dashboard-header">
        <div>
          <h1>Verified Assessment Certificates</h1>
          <p style={{ color: 'var(--text-muted)' }}>Historical logs, performance metrics, and downloadable scorecards.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/student/dashboard')}>
          ← Return to Dashboard
        </button>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel empty-state">
          <h3>No completed assessments yet</h3>
          <p>Once you submit your assessments, your verified scorecards and ranking will appear here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
            Browse Available Exams
          </button>
        </div>
      ) : (
        <div className="glass-panel bento-panel-wide" style={{ padding: '20px' }}>
          <div className="glass-table-container">
            <table>
              <thead>
                <tr>
                  <th>Assessment Title</th>
                  <th>Score</th>
                  <th>Max Points</th>
                  <th>Performance</th>
                  <th>Completion Timestamp</th>
                  <th>Certification & Rank</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.attemptId}>
                    <td style={{ fontWeight: 600 }}>{item.examTitle}</td>
                    <td style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {item.score}
                    </td>
                    <td>{item.totalMarks}</td>
                    <td>
                      <span className={`badge ${item.percentage >= 40 ? 'badge-pass' : 'badge-fail'}`}>
                        {item.percentage?.toFixed(1)}% {item.percentage >= 40 ? 'Pass' : 'Needs Review'}
                      </span>
                    </td>
                    <td>{formatDate(item.submittedAt)}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-primary" onClick={() => handleDownloadPdf(item.attemptId)}>
                          📥 PDF Scorecard
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/leaderboard/${item.examId}`)}>
                          🏆 Leaderboard
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
