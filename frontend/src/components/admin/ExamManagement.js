import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getQuestions, createExam, getExams } from '../../services/api';
import { formatDate, getExamStatus } from '../../utils/helpers';

const ExamManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [exams, setExams] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Auto-open modal/popup if URL has ?create=true or action=create
  const shouldAutoOpen = searchParams.get('create') === 'true' || searchParams.get('action') === 'create';
  const [showModal, setShowModal] = useState(shouldAutoOpen);

  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const defStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const endD = new Date(now.getTime() + 30 * 60000);
    const defEnd = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}T${pad(endD.getHours())}:${pad(endD.getMinutes())}`;
    return {
      title: '',
      description: '',
      durationMinutes: 30,
      startTime: shouldAutoOpen ? defStart : '',
      endTime: shouldAutoOpen ? defEnd : '',
      isActive: true,
      questionIds: []
    };
  });
  const [submitting, setSubmitting] = useState(false);

  // Helper to calculate End Time automatically: startTime + durationMinutes
  const calculateEndTime = (startStr, durationMin) => {
    if (!startStr) return '';
    try {
      const startDate = new Date(startStr);
      if (isNaN(startDate.getTime())) return '';
      const endDate = new Date(startDate.getTime() + (parseInt(durationMin, 10) || 0) * 60000);
      
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      const hours = String(endDate.getHours()).padStart(2, '0');
      const minutes = String(endDate.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  };

  // Helper to get formatted default local datetime (now rounded to next minute)
  const getDefaultStartTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadData = useCallback(async () => {
    try {
      const [examsRes, firstQuestionsRes] = await Promise.all([
        getExams(),
        getQuestions(0, 100)
      ]);
      setExams(examsRes.data || []);
      let questionsList = firstQuestionsRes.data?.content || [];
      const totalPages = firstQuestionsRes.data?.totalPages || 1;
      if (totalPages > 1) {
        const remaining = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => getQuestions(i + 1, 100))
        );
        remaining.forEach((res) => {
          questionsList = questionsList.concat(res.data?.content || []);
        });
      }
      setAllQuestions(questionsList);
    } catch (err) {
      console.error('Error fetching exam configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModal = () => {
    const defStart = getDefaultStartTime();
    const defEnd = calculateEndTime(defStart, 30);
    setFormData({
      title: '',
      description: '',
      durationMinutes: 30,
      startTime: defStart,
      endTime: defEnd,
      isActive: true,
      questionIds: []
    });
    setShowModal(true);
    setSearchParams({ create: 'true' });
    loadData(); // ensure freshest question list on modal open
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchParams({});
  };

  // Handlers for automatic calculation
  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value, 10) || 0;
    setFormData(prev => ({
      ...prev,
      durationMinutes: newDuration,
      endTime: calculateEndTime(prev.startTime, newDuration)
    }));
  };

  const handleStartTimeChange = (e) => {
    const newStart = e.target.value;
    setFormData(prev => ({
      ...prev,
      startTime: newStart,
      endTime: calculateEndTime(newStart, prev.durationMinutes)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleQuestionToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      questionIds: prev.questionIds.includes(id)
        ? prev.questionIds.filter(qId => qId !== id)
        : [...prev.questionIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.questionIds.length === 0) {
      alert('Please assign at least one question to the exam.');
      return;
    }
    setSubmitting(true);
    try {
      await createExam(formData);
      closeModal();
      await loadData();
    } catch (err) {
      alert('Error creating exam schedule. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (exam) => {
    const status = getExamStatus(exam);
    if (status === 'UPCOMING') return <span className="badge badge-upcoming">⏳ Upcoming</span>;
    if (status === 'LIVE') return <span className="badge badge-live">● Live Active</span>;
    if (status === 'CONCLUDED') return <span className="badge badge-concluded">○ Concluded</span>;
    return <span className="badge badge-inactive">Inactive</span>;
  };

  if (loading) return <div className="loading">Syncing exam parameters...</div>;

  return (
    <div className="management-page">
      <div className="bento-dashboard-header">
        <div>
          <h1>Exam Scheduling & Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure assessment windows, timers, and question mapping.</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + Create Exam Schedule
        </button>
      </div>

      {/* Glassmorphic Modal Dialog for Exam Creation */}
      {showModal && (
        <div className="glass-modal-backdrop" onClick={closeModal}>
          <div className="glass-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <div>
                <h2>Configure Assessment Window</h2>
                <p>Define scheduling boundaries, countdown duration, and mapped questions</p>
              </div>
              <button className="modal-close-btn" onClick={closeModal} title="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="exam-creation-form">
              <div className="form-group">
                <label>Exam Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Advanced Operating Systems Midterm 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label>Assessment Guidelines / Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Instructions displayed to candidates before taking the test..."
                  rows="2"
                />
              </div>

              {/* 3-Column Grid with Auto-Calculated End Time */}
              <div className="form-row form-grid-3">
                <div className="form-group">
                  <label>Duration (Minutes) *</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleDurationChange}
                    min="1"
                    placeholder="30"
                    required
                  />
                  <small style={{ color: 'var(--accent-cyan)', fontSize: '0.74rem' }}>
                    Auto-calculates Window End Time
                  </small>
                </div>

                <div className="form-group">
                  <label>Window Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleStartTimeChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Window End Date & Time (Auto-calculated) *</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    style={{ borderColor: 'rgba(6, 182, 212, 0.45)', background: 'rgba(6, 182, 212, 0.08)' }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                    Computed based on duration
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-toggle-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Activate immediately upon publication (Students can see and take it)</span>
                </label>
              </div>

              {/* Question Selection Area */}
              <div className="form-group">
                <div className="question-selector-header">
                  <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                    Select & Map Questions to Exam *
                  </label>
                  <span className="selected-count-badge">
                    {formData.questionIds.length} of {allQuestions.length} selected
                  </span>
                </div>

                {allQuestions.length === 0 ? (
                  <div className="empty-questions-notice">
                    <p style={{ fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '6px' }}>
                      ⚠️ No questions available in question bank yet.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      You must add at least one question in the Question Bank before publishing an exam.
                    </p>
                    <a
                      href="/admin/questions"
                      className="btn btn-sm btn-secondary"
                      style={{ display: 'inline-flex' }}
                    >
                      📚 Go to Question Bank Repository →
                    </a>
                  </div>
                ) : (
                  <div className="question-selector-scroll">
                    {allQuestions.map(q => {
                      const isSelected = formData.questionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`question-item-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleQuestionToggle(q.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <div className="question-item-content">
                            <p className="question-item-text">{q.text}</p>
                            <div className="question-item-tags">
                              <span className="badge badge-mcq">{q.subject}</span>
                              <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                              <span className="marks-pill">{q.marks ?? 0} pts</span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                                Correct: <strong>{q.correctAnswer}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || formData.questionIds.length === 0}
                >
                  {submitting ? 'Publishing Schedule...' : '✓ Publish Assessment Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Examination Registry Table */}
      <div className="glass-panel bento-panel-wide" style={{ padding: '20px' }}>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Duration</th>
                <th>Assigned Items</th>
                <th>Status</th>
                <th>Window Start</th>
                <th>Window End</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No assessments registered yet. Click "+ Create Exam Schedule" above to create one.
                  </td>
                </tr>
              ) : (
                exams.map(exam => (
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

export default ExamManagement;
