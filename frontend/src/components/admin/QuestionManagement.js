import React, { useState, useEffect, useCallback } from 'react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../services/api';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const [formData, setFormData] = useState({
    text: '',
    type: 'MCQ',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 5,
    subject: '',
    difficulty: 'EASY',
    tags: ''
  });

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQuestions(currentPage, 10, subjectFilter);
      setQuestions(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, subjectFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      text: '',
      type: 'MCQ',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 5,
      subject: '',
      difficulty: 'EASY',
      tags: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleCreateOpen = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (q) => {
    setFormData({
      text: q.text || '',
      type: q.type || 'MCQ',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || 'A',
      marks: q.marks || 5,
      subject: q.subject || '',
      difficulty: q.difficulty || 'EASY',
      tags: q.tags || ''
    });
    setEditingId(q.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateQuestion(editingId, formData);
      } else {
        await createQuestion(formData);
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      alert('Error saving question record. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (q) => {
    setDeleteError('');
    setDeleteTarget(q);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteQuestion(deleteTarget.id);
      setDeleteTarget(null);
      fetchQuestions();
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Error deleting question');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="management-page">
      <div className="bento-dashboard-header">
        <div>
          <h1>Question Bank Repository</h1>
          <p style={{ color: 'var(--text-muted)' }}>Curate, categorize, and calibrate assessment prompts with difficulty tiers.</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateOpen}>
          + Add New Question
        </button>
      </div>

      {/* Glassmorphic Modal Dialog for Question Creation / Edit */}
      {showModal && (
        <div className="glass-modal-backdrop" onClick={resetForm}>
          <div className="glass-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <div>
                <h2>{editingId ? 'Edit Question Record' : 'Craft New Assessment Prompt'}</h2>
                <p>Define question statement, options, correct answer key, and scoring weight</p>
              </div>
              <button className="modal-close-btn" onClick={resetForm} title="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="exam-creation-form">
              <div className="form-group">
                <label>Question Statement / Prompt *</label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Enter the full question text or problem statement..."
                  required
                  rows="3"
                />
              </div>

              <div className="form-row form-grid-3">
                <div className="form-group">
                  <label>Question Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANK">Fill in the Blank</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject / Topic *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Operating Systems, Mathematics"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty Tier *</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options Section */}
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Option A *</label>
                  <input
                    type="text"
                    name="optionA"
                    value={formData.optionA}
                    onChange={handleChange}
                    placeholder="Option text for A"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Option B *</label>
                  <input
                    type="text"
                    name="optionB"
                    value={formData.optionB}
                    onChange={handleChange}
                    placeholder="Option text for B"
                    required
                  />
                </div>
              </div>

              {formData.type === 'MCQ' && (
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Option C</label>
                    <input
                      type="text"
                      name="optionC"
                      value={formData.optionC}
                      onChange={handleChange}
                      placeholder="Option text for C"
                    />
                  </div>
                  <div className="form-group">
                    <label>Option D</label>
                    <input
                      type="text"
                      name="optionD"
                      value={formData.optionD}
                      onChange={handleChange}
                      placeholder="Option text for D"
                    />
                  </div>
                </div>
              )}

              {/* Correct Answer Key & Scoring Weight */}
              <div className="form-row form-grid-3">
                <div className="form-group">
                  <label>Correct Answer Key *</label>
                  {formData.type === 'MCQ' ? (
                    <select name="correctAnswer" value={formData.correctAnswer} onChange={handleChange} required>
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  ) : formData.type === 'TRUE_FALSE' ? (
                    <select name="correctAnswer" value={formData.correctAnswer} onChange={handleChange} required>
                      <option value="A">Option A (True)</option>
                      <option value="B">Option B (False)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="correctAnswer"
                      value={formData.correctAnswer}
                      onChange={handleChange}
                      placeholder="Exact expected answer string"
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Score Weight (Points) *</label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    min="1"
                    placeholder="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Metadata Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. memory, paging, kernel"
                  />
                </div>
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Committing...' : (editingId ? '✓ Update Question' : '✓ Commit Question to Bank')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel search-toolbar">
        <div className="glass-search-box">
          <span className="glass-search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="glass-search-input"
            placeholder="Filter questions by subject..."
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setCurrentPage(0); }}
          />
          {subjectFilter && (
            <button
              type="button"
              className="glass-search-clear"
              onClick={() => { setSubjectFilter(''); setCurrentPage(0); }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? <div className="loading">Retrieving question bank items...</div> : (
        <div className="glass-panel bento-panel-wide" style={{ padding: '20px' }}>
          <div className="glass-table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Question Prompt</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>Marks</th>
                  <th>Key</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No questions found in this category. Click "+ Add New Question" above to craft one.
                    </td>
                  </tr>
                ) : (
                  questions.map(q => (
                    <tr key={q.id}>
                      <td>#{q.id}</td>
                      <td style={{ maxWidth: '320px', fontWeight: 500 }}>
                        {q.text ? (q.text.substring(0, 80) + (q.text.length > 80 ? '...' : '')) : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge badge-${(q.type || 'mcq').toLowerCase()}`}>
                          {q.type || 'MCQ'}
                        </span>
                      </td>
                      <td>{q.subject || 'General'}</td>
                      <td>
                        <span className={`badge badge-${(q.difficulty || 'easy').toLowerCase()}`}>
                          {q.difficulty || 'EASY'}
                        </span>
                      </td>
                      <td>{q.marks || 0} pts</td>
                      <td style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{q.correctAnswer || '-'}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-sm btn-edit" onClick={() => handleEdit(q)}>Edit</button>
                          <button className="btn btn-sm btn-delete" onClick={() => handleDeleteClick(q)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>← Previous</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Page {currentPage + 1} of {totalPages}</span>
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}
      {/* Glassmorphic Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="glass-modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="glass-modal-dialog" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <div>
                <h2 style={{ color: 'var(--accent-rose)' }}>Confirm Question Deletion</h2>
                <p>This action cannot be undone</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="exam-creation-form" style={{ gap: '16px' }}>
              <div style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                lineHeight: 1.5
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Question #{deleteTarget.id} • {deleteTarget.subject || 'General'}
                </div>
                {deleteTarget.text}
              </div>

              {deleteError && (
                <div className="alert alert-error" style={{ marginBottom: 0 }}>
                  {deleteError}
                </div>
              )}

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Are you sure you want to permanently remove this question from the repository?
              </p>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{ fontWeight: 700 }}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
