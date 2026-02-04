import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000', // Your Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ═══════════════════════════════════════════════════
//  API HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/api/users/login/', { email, password }),
  register: (data) => api.post('/api/users/register/', data),
  verifyOTP: (email, otp) => api.post('/api/users/verify-registration-otp/', { email, otp }),
  resendOTP: (email) => api.post('/api/users/resend-otp/', { email }),
  forgotPassword: (email) => api.post('/api/users/forgot-password/', { email }),
  resetPassword: (email, otp, newPassword) => 
    api.post('/api/users/verify-otp-reset-password/', { email, otp, new_password: newPassword }),
  logout: () => api.post('/api/users/logout/'),
  getProfile: () => api.get('/api/users/profile/'),
};

// Student APIs
export const studentAPI = {
  getDashboard: () => api.get('/api/students/home/'),
  getSubjectDetails: (subjectId) => api.get(`/api/students/subjects/${subjectId}/`),
  getChapterTests: (chapterId) => api.get(`/api/students/chapters/${chapterId}/tests/`),
  startTest: (testId) => api.post(`/api/students/tests/${testId}/start/`),
  submitTest: (attemptId, answers) => 
    api.post(`/api/students/test-attempts/${attemptId}/submit/`, { answers }),
  getTestResult: (attemptId) => api.get(`/api/students/test-attempts/${attemptId}/result/`),
  getMyTests: () => api.get('/api/students/my-test-attempts/'),
  getAttendance: () => api.get('/api/students/my-attendance/'),
  getFees: () => api.get('/api/students/my-fee-payments/'),
  getAssignments: () => api.get('/api/students/my-assignments/'),
  createDoubt: (data) => api.post('/api/students/doubts/create/', data),
  getNotifications: () => api.get('/api/students/my-notifications/'),
};

// Teacher APIs
export const teacherAPI = {
  getDashboard: () => api.get('/api/teachers/home/'),
  getSubjectClasses: (subjectId) => api.get(`/api/teachers/subject/${subjectId}/classes/`),
  getChapters: (classId, subjectId) => 
    api.get(`/api/teachers/class/${classId}/subject/${subjectId}/chapters/`),
  markChapterComplete: (chapterId) => 
    api.post(`/api/teachers/chapters/${chapterId}/mark-complete/`),
  getTests: (chapterId) => api.get(`/api/teachers/chapter/${chapterId}/tests/`),
  createTest: (chapterId, data) => 
    api.post(`/api/teachers/chapter/${chapterId}/tests/create/`, data),
  getTestDetails: (testId) => api.get(`/api/teachers/tests/${testId}/`),
  createQuestion: (testId, data) => 
    api.post(`/api/teachers/tests/${testId}/questions/create/`, data),
  updateQuestion: (questionId, data) => 
    api.put(`/api/teachers/questions/${questionId}/update/`, data),
  deleteQuestion: (questionId) => api.delete(`/api/teachers/questions/${questionId}/delete/`),
  markAttendance: (classId, subjectId, data) => 
    api.post(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/mark/`, data),
  getAttendanceList: (classId, subjectId) => 
    api.get(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/`),
  createAssignment: (classId, subjectId, data) => 
    api.post(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/create/`, data),
  getAssignments: (classId, subjectId) => 
    api.get(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/`),
  getDoubts: (classId, subjectId) => 
    api.get(`/api/teachers/class/${classId}/subject/${subjectId}/doubts/`),
  replyDoubt: (doubtId, data) => 
    api.post(`/api/teachers/doubts/${doubtId}/reply/`, data),
  getClassStudents: (classId) => api.get(`/api/teachers/class/${classId}/students/`),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/api/admin/users/'),
  approveUser: (userId) => api.post(`/api/admin/users/${userId}/approve/`),
  createClass: (data) => api.post('/api/admin/classes/create/', data),
  getAllClasses: () => api.get('/api/admin/classes/'),
  createSubject: (data) => api.post('/api/admin/subjects/create/', data),
  getAllSubjects: () => api.get('/api/admin/subjects/'),
  createChapter: (data) => api.post('/api/admin/chapters/create/', data),
  getAllChapters: () => api.get('/api/admin/chapters/'),
};

// Utility APIs
export const utilityAPI = {
  getClasses: () => api.get('/api/users/classes/'),
  getSubjects: () => api.get('/api/users/subjects/'),
};



















// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
//           refresh: refreshToken,
//         });

//         const { access } = response.data;
//         localStorage.setItem('access_token', access);
//         originalRequest.headers.Authorization = `Bearer ${access}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.clear();
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// // Authentication API
// export const authAPI = {
//   register: (userData) => api.post('/users/register/', userData),
//   verifyOTP: (email, otp) => api.post('/users/verify-registration-otp/', { email, otp }),
//   resendOTP: (email) => api.post('/users/resend-otp/', { email }),
//   login: (identifier, password) => api.post('/users/login/', { identifier, password }),
//   logout: (refreshToken) => api.post('/users/logout/', { refresh_token: refreshToken }),
//   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
//   resetPassword: (email, otp, newPassword) => 
//     api.post('/users/reset-password/', { email, otp, new_password: newPassword }),
//   getProfile: () => api.get('/users/me/'),
//   updateProfile: (userData) => api.put('/users/profile/', userData),
//   changePassword: (oldPassword, newPassword, newPasswordConfirm) => 
//     api.post('/users/change-password/', {
//       old_password: oldPassword,
//       new_password: newPassword,
//       new_password_confirm: newPasswordConfirm,
//     }),
// };

// // Student API
// export const studentAPI = {
//   getDashboard: () => api.get('/students/dashboard/'),
//   getAvailableTests: (params) => api.get('/students/available-tests/', { params }),
//   startTest: (testId) => api.get(`/students/start-test/${testId}/`),
//   submitTest: (testId, answers) => api.post(`/students/submit-test/${testId}/`, { answers }),
//   getTestAttempts: () => api.get('/students/test-attempts/'),
//   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/`),
//   getStatistics: () => api.get('/students/test-attempts/statistics/'),
//   getAttendance: (params) => api.get('/students/attendance/', { params }),
//   getAssignments: (params) => api.get('/students/assignments/', { params }),
//   getDoubts: () => api.get('/students/doubts/'),
//   postDoubt: (doubtData) => api.post('/students/doubts/', doubtData),
//   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
// };

// // Teacher API
// export const teacherAPI = {
//   getDashboard: () => api.get('/teachers/dashboard/'),
//   getAssignments: () => api.get('/teachers/assignments/my-assignments/'),
//   getTests: (params) => api.get('/teachers/tests/my-tests/', { params }),
//   createTest: (testData) => api.post('/teachers/tests/', testData),
//   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
//   addQuestion: (testId, questionData) => api.post(`/teachers/tests/${testId}/add-question/`, questionData),
//   getTestStatistics: (testId) => api.get(`/teachers/tests/${testId}/statistics/`),
//   markAttendance: (attendanceData) => api.post('/teachers/attendance/mark-bulk/', attendanceData),
//   getAttendanceByDate: (params) => api.get('/teachers/attendance/by-date/', { params }),
//   getStudentReport: (studentId, params) => api.get(`/teachers/attendance/student-report/${studentId}/`, { params }),
//   getClassReport: (classId, params) => api.get(`/teachers/attendance/class-report/${classId}/`, { params }),
//   createAssignment: (assignmentData) => api.post('/teachers/assignments/', assignmentData),
//   getDoubts: (params) => api.get('/teachers/doubts/my-subject-doubts/', { params }),
//   replyToDoubt: (doubtId, replyData) => api.post(`/teachers/doubts/${doubtId}/reply/`, replyData),
// };

// // Admin API
// export const adminAPI = {
//   getDashboard: () => api.get('/admin/dashboard/'),
//   getPendingUsers: () => api.get('/users/pending/'),
//   approveUser: (userId) => api.post(`/users/${userId}/approve/`),
//   rejectUser: (userId) => api.post(`/users/${userId}/reject/`),
//   getClasses: () => api.get('/admin/classes/'),
//   createClass: (classData) => api.post('/admin/classes/', classData),
//   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
//   getSubjects: () => api.get('/admin/subjects/'),
//   createSubject: (subjectData) => api.post('/admin/subjects/', subjectData),
//   getChapters: (params) => api.get('/admin/chapters/', { params }),
//   createChapter: (chapterData) => api.post('/admin/chapters/', chapterData),
//   markChapterComplete: (chapterId, isCompleted) => 
//     api.post(`/admin/chapters/${chapterId}/mark-completed/`, { is_completed: isCompleted }),
//   getFeePayments: (params) => api.get('/admin/fee-payments/', { params }),
//   createFeePayment: (paymentData) => api.post('/admin/fee-payments/', paymentData),
//   getNotifications: () => api.get('/admin/notifications/'),
//   createNotification: (notificationData) => api.post('/admin/notifications/', notificationData),
//   broadcastNotification: (message, role) => 
//     api.post('/admin/notifications/broadcast/', { message, role }),
// };

// export default api;