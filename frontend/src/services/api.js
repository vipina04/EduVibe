import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/users/register/', userData),
  verifyOTP: (email, otp) => api.post('/users/verify-registration-otp/', { email, otp }),
  resendOTP: (email) => api.post('/users/resend-otp/', { email }),
  login: (identifier, password) => api.post('/users/login/', { identifier, password }),
  logout: (refreshToken) => api.post('/users/logout/', { refresh_token: refreshToken }),
  forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  resetPassword: (email, otp, newPassword) => 
    api.post('/users/reset-password/', { email, otp, new_password: newPassword }),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (userData) => api.put('/users/profile/', userData),
  changePassword: (oldPassword, newPassword, newPasswordConfirm) => 
    api.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard/'),
  getAvailableTests: (params) => api.get('/students/available-tests/', { params }),
  startTest: (testId) => api.get(`/students/start-test/${testId}/`),
  submitTest: (testId, answers) => api.post(`/students/submit-test/${testId}/`, { answers }),
  getTestAttempts: () => api.get('/students/test-attempts/'),
  getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/`),
  getStatistics: () => api.get('/students/test-attempts/statistics/'),
  getAttendance: (params) => api.get('/students/attendance/', { params }),
  getAssignments: (params) => api.get('/students/assignments/', { params }),
  getDoubts: () => api.get('/students/doubts/'),
  postDoubt: (doubtData) => api.post('/students/doubts/', doubtData),
  getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
};

// Teacher API
export const teacherAPI = {
  getDashboard: () => api.get('/teachers/dashboard/'),
  getAssignments: () => api.get('/teachers/assignments/my-assignments/'),
  getTests: (params) => api.get('/teachers/tests/my-tests/', { params }),
  createTest: (testData) => api.post('/teachers/tests/', testData),
  getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
  addQuestion: (testId, questionData) => api.post(`/teachers/tests/${testId}/add-question/`, questionData),
  getTestStatistics: (testId) => api.get(`/teachers/tests/${testId}/statistics/`),
  markAttendance: (attendanceData) => api.post('/teachers/attendance/mark-bulk/', attendanceData),
  getAttendanceByDate: (params) => api.get('/teachers/attendance/by-date/', { params }),
  getStudentReport: (studentId, params) => api.get(`/teachers/attendance/student-report/${studentId}/`, { params }),
  getClassReport: (classId, params) => api.get(`/teachers/attendance/class-report/${classId}/`, { params }),
  createAssignment: (assignmentData) => api.post('/teachers/assignments/', assignmentData),
  getDoubts: (params) => api.get('/teachers/doubts/my-subject-doubts/', { params }),
  replyToDoubt: (doubtId, replyData) => api.post(`/teachers/doubts/${doubtId}/reply/`, replyData),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard/'),
  getPendingUsers: () => api.get('/users/pending/'),
  approveUser: (userId) => api.post(`/users/${userId}/approve/`),
  rejectUser: (userId) => api.post(`/users/${userId}/reject/`),
  getClasses: () => api.get('/admin/classes/'),
  createClass: (classData) => api.post('/admin/classes/', classData),
  getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
  getSubjects: () => api.get('/admin/subjects/'),
  createSubject: (subjectData) => api.post('/admin/subjects/', subjectData),
  getChapters: (params) => api.get('/admin/chapters/', { params }),
  createChapter: (chapterData) => api.post('/admin/chapters/', chapterData),
  markChapterComplete: (chapterId, isCompleted) => 
    api.post(`/admin/chapters/${chapterId}/mark-completed/`, { is_completed: isCompleted }),
  getFeePayments: (params) => api.get('/admin/fee-payments/', { params }),
  createFeePayment: (paymentData) => api.post('/admin/fee-payments/', paymentData),
  getNotifications: () => api.get('/admin/notifications/'),
  createNotification: (notificationData) => api.post('/admin/notifications/', notificationData),
  broadcastNotification: (message, role) => 
    api.post('/admin/notifications/broadcast/', { message, role }),
};

export default api;