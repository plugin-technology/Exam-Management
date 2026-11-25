import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { startExam, submitExam } from '../../services/api';
import { formatTime } from '../../utils/helpers';

const ExamPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    const initExam = async () => {
      try {
        const res = await startExam(id);
        setExam(res.data);
        setTimeLeft(
          res.data.remainingSeconds != null
            ? res.data.remainingSeconds
            : (res.data.durationMinutes || 30) * 60
        );
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to initialize exam session. You may have already submitted this exam.');
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const answerPayload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId, 10),
        selectedAnswer
      }));
      await submitExam(id, { answers: answerPayload });
      navigate(`/leaderboard/${id}`);
    } catch (err) {
      console.error('Submission error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to record submission. Please check connection and try again.';
      setError(serverMsg);
      setSubmitted(false);
    }
  }, [id, answers, submitted, navigate]);

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Strict Countdown Timer with Auto-Submit (interval created once when exam loads)
  useEffect(() => {
    if (!exam || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, submitted]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (loading) return <div className="loading">Initializing proctored session...</div>;

  if (error) {
    return (
      <div className="glass-panel auth-card" style={{ maxWidth: '540px', margin: '60px auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-rose)', marginBottom: '14px', fontSize: '1.4rem' }}>⚠️ Session Alert</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
          ← Return to Candidate Dashboard
        </button>
      </div>
    );
  }

  const questions = exam?.questions || [];
  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="exam-container">
      {/* Page 3: Sticky Glass Header with Prominent Countdown Timer */}
      <header className="sticky-glass-header">
        <div>
          <h2>{exam?.title}</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Candidate: {user?.name}</span>
        </div>

        <div className={`countdown-timer-box ${timeLeft < 180 ? 'warning' : ''}`}>
          <span>⏱️</span>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Examination Interface Grid */}
      <div className="exam-body">
        {/* Frosted Palette Sidebar */}
        <aside className="glass-panel exam-sidebar">
          <h4>Questions Overview</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
            Answered: {answeredCount} / {questions.length}
          </p>

          <div className="question-palette">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`palette-btn ${idx === currentQuestion ? 'current' : ''} ${answers[q.id] ? 'answered' : ''}`}
                onClick={() => setCurrentQuestion(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            className="btn btn-submit btn-block"
            style={{ marginTop: '20px' }}
            disabled={submitted}
            onClick={() => setShowSubmitModal(true)}
          >
            ✓ Submit Assessment
          </button>
        </aside>

        {/* Central Glass Question Panel */}
        <main className="glass-panel central-question-panel">
          {question && (
            <div>
              <div className="question-meta-row">
                <span className="question-number-tag">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="badge badge-mcq">{question.marks} Points</span>
              </div>

              <h3 className="question-text-heading">{question.text}</h3>

              {/* Frosted Radio Buttons / Options */}
              <div className="options-stack">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  if (question.type === 'TRUE_FALSE' && (opt === 'C' || opt === 'D')) return null;
                  const optionKey = `option${opt}`;
                  const optionText = question[optionKey];
                  if (!optionText || !optionText.trim()) return null;
                  const isSelected = answers[question.id] === opt;

                  return (
                    <label
                      key={opt}
                      className={`frosted-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAnswerChange(question.id, opt)}
                    >
                      <input
                        type="radio"
                        name={`q-${question.id}`}
                        checked={isSelected}
                        onChange={() => {}}
                      />
                      <span className="option-badge">{opt}</span>
                      <span className="option-text">{optionText}</span>
                    </label>
                  );
                })}
              </div>

              {/* Pagination (Previous / Next) & Submit */}
              <div className="exam-nav-controls">
                <button
                  className="btn btn-secondary"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  ← Previous
                </button>

                {currentQuestion < questions.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    className="btn btn-submit"
                    disabled={submitted}
                    onClick={() => setShowSubmitModal(true)}
                  >
                    ✓ Submit Final Assessment
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Session Expired Modal (preserves unsaved answers) */}
      {sessionExpired && (
        <div className="glass-modal-backdrop">
          <div className="glass-modal-dialog" style={{ maxWidth: '520px' }}>
            <div className="glass-modal-header">
              <div>
                <h2 style={{ color: 'var(--accent-rose)' }}>Session Expired</h2>
                <p>Your authentication token expired before submission</p>
              </div>
            </div>
            <div className="exam-creation-form" style={{ gap: '16px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Your selected answers ({answeredCount} / {questions.length}) are preserved below so you can copy them before signing back in:
              </p>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                padding: '12px',
                maxHeight: '160px',
                overflowY: 'auto',
                fontSize: '0.8rem',
                color: '#fff'
              }}>
                {JSON.stringify(answers, null, 2)}
              </pre>
              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                >
                  Sign In Again →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="glass-modal-backdrop" onClick={() => !submitted && setShowSubmitModal(false)}>
          <div className="glass-modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <div>
                <h2>Confirm Final Submission</h2>
                <p>Verify your progress before locking your assessment</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitted}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="exam-creation-form" style={{ gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {questions.length}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Total</div>
                </div>

                <div style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {answeredCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Answered</div>
                </div>

                <div style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  background: questions.length - answeredCount > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  border: questions.length - answeredCount > 0 ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(255, 255, 255, 0.12)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: questions.length - answeredCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)'
                  }}>
                    {questions.length - answeredCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Unanswered</div>
                </div>
              </div>

              {questions.length - answeredCount > 0 && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fbbf24',
                  fontSize: '0.88rem',
                  lineHeight: 1.45
                }}>
                  ⚠️ You still have <strong>{questions.length - answeredCount}</strong> unanswered question{questions.length - answeredCount > 1 ? 's' : ''}. Unanswered questions will receive 0 marks.
                </div>
              )}

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
                Once submitted, your answers will be locked, graded immediately, and you will be redirected to the live leaderboard. Time remaining: <strong style={{ color: '#fff' }}>{formatTime(timeLeft)}</strong>.
              </p>

              <div className="modal-actions-bar" style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitted}
                >
                  ← Review Answers
                </button>
                <button
                  type="button"
                  className="btn btn-submit"
                  disabled={submitted}
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmit();
                  }}
                >
                  {submitted ? 'Submitting...' : '✓ Yes, Submit Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
