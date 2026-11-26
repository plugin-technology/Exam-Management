import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith('/student/exam/')) {
        window.dispatchEvent(new CustomEvent('session-expired'));
      } else if (path !== '/login' && path !== '/register') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

export const getQuestions = (page = 0, size = 10, subject = '') => {
  let url = `/admin/questions?page=${page}&size=${size}`;
  if (subject) url += `&subject=${subject}`;
  return API.get(url);
};
export const createQuestion = (data) => API.post('/admin/questions', data);
export const updateQuestion = (id, data) => API.put(`/admin/questions/${id}`, data);
export const deleteQuestion = (id) => API.delete(`/admin/questions/${id}`);

export const createExam = (data) => API.post('/exams', data);
export const getExams = () => API.get('/exams');
export const getActiveExams = () => API.get('/exams/active');
export const getExamById = (id) => API.get(`/exams/${id}`);
export const startExam = (id) => API.post(`/exams/${id}/start`);
export const submitExam = (id, data) => API.post(`/exams/${id}/submit`, data);
export const getLeaderboard = (examId) => API.get(`/exams/${examId}/leaderboard`);

export const getResult = (studentId, examId) => API.get(`/results/${studentId}/exam/${examId}`);
export const downloadPdf = (attemptId) => API.get(`/results/${attemptId}/download`, { responseType: 'blob' });

export const getHistory = (studentId) => API.get(`/students/${studentId}/history`);
export const getUserStats = () => API.get('/admin/stats/users');

export default API;
