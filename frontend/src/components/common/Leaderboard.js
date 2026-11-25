import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboard } from '../../services/api';

const Leaderboard = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard(examId);
        setEntries(res.data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [examId]);

  if (loading) return <div className="loading">Calibrating global percentiles...</div>;

  const topThree = entries.slice(0, 3);

  return (
    <div className="leaderboard-page">
      <div className="bento-dashboard-header">
        <div>
          <h1>🏆 Competitive Assessment Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Automated percentile ranking sorted by score and submission efficiency.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {topThree.length > 0 && (
        <div className="podium">
          {topThree.map((entry, idx) => (
            <div
              key={entry.studentId}
              className={`podium-item podium-${idx + 1} ${entry.studentId === user?.userId ? 'current-user' : ''}`}
            >
              <div className="podium-medal">{['🥇', '🥈', '🥉'][idx]}</div>
              <div className="podium-name">{entry.studentName}</div>
              <div className="podium-score">{entry.score} / {entry.totalMarks}</div>
              <div className="podium-percentage">{entry.percentage?.toFixed(1)}% Score</div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel bento-panel-wide" style={{ padding: '20px' }}>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate Name</th>
                <th>Score</th>
                <th>Total Marks</th>
                <th>Efficiency Ratio</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.studentId} className={entry.studentId === user?.userId ? 'highlight-row' : ''}>
                  <td style={{ fontWeight: 800 }}>#{entry.rank}</td>
                  <td style={{ fontWeight: 600 }}>
                    {entry.studentName} {entry.studentId === user?.userId && ' (You)'}
                  </td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{entry.score}</td>
                  <td>{entry.totalMarks}</td>
                  <td>
                    <span className={`badge ${entry.percentage >= 40 ? 'badge-pass' : 'badge-fail'}`}>
                      {entry.percentage?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
