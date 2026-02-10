// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`; // Token not Bearer
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ============ AUTH APIs ============
export const authAPI = {
  // Get registration data (classes & subjects)
  getRegistrationData: () => api.get('/users/registration-data/'),
  
  // Register
  register: (data) => api.post('/users/register/', data),
  
  // Verify registration OTP
  verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
  // Resend OTP
  resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
  // Login
  login: (data) => api.post('/users/login/', data),
  
  // Logout
  logout: () => api.post('/users/logout/'),
  
  // Forgot password
  forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
  // Reset password
  resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
  // Get profile
  getProfile: () => api.get('/users/profile/'),
};

// ============ STUDENT APIs ============
export const studentAPI = {
  // Dashboard - NEW! This is what was missing
  getDashboard: () => api.get('/students/home/'),
  
  // Home/Dashboard (alias for compatibility)
  getHome: () => api.get('/students/home/'),
  
  // Subjects
  getSubjects: () => api.get('/students/subjects/'),
  getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
  getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`), // Alias
  
  // Chapters
  getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
  
  // Tests
  getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
  startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
  submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
  getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
  getMyAttempts: () => api.get('/students/my-test-attempts/'),
  getMyTests: () => api.get('/students/my-test-attempts/'), // Alias
  
  // Attendance
  getAttendance: () => api.get('/students/my-attendance/'),
  getMyAttendance: () => api.get('/students/my-attendance/'), // Alias
  
  // Fee Payments
  getFeePayments: () => api.get('/students/my-fee-payments/'),
  getMyFees: () => api.get('/students/my-fee-payments/'), // Alias
  
  // Assignments
  getAssignments: () => api.get('/students/my-assignments/'),
  getMyAssignments: () => api.get('/students/my-assignments/'), // Alias
  submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Doubts
  getEnrolledSubjects: () => api.get('/students/subjects/'),
  createDoubt: (data) => api.post('/students/doubts/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDoubts: () => api.get('/students/doubts/'),
  getMyDoubts: () => api.get('/students/doubts/'), // Alias
  getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
  replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Notifications
  getNotifications: () => api.get('/students/my-notifications/'),
  getMyNotifications: () => api.get('/students/my-notifications/'), // Alias
  markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
  
  // Search
  search: (query) => api.get(`/students/search/?q=${query}`),
};

// ============ TEACHER APIs ============
export const teacherAPI = {
  // Dashboard - NEW! This is what was missing for teachers
  getDashboard: () => api.get('/teachers/home/'),
  
  // Home/Dashboard (alias for compatibility)
  getHome: () => api.get('/teachers/home/'),
  getClasses: () => api.get('/teachers/classes/'), 
  
  // Classes & Subjects
  getSubjects: (params) => api.get('/teachers/subjects/', { params }),
  getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
  getClassChapters: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/chapters/`),
  getChapters: (params) => api.get('/teachers/chapters/', { params }),
  createChapter: (data) => api.post('/teachers/chapters/create/', data),
  markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
  // Tests
  getTests: (params) => api.get('/teachers/tests/', { params }),
  getChapterTests: (chapterId) => api.get(`/teachers/chapter/${chapterId}/tests/`),
  createTest: (data) => api.post('/teachers/tests/create/', data),
  getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
  getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
  updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/update/`, data),
  deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/delete/`),
  
  // Questions
  createQuestion: (data) => api.post('/teachers/questions/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
  // Attendance
  markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
  getAttendance: (params) => api.get('/teachers/attendance/', { params }),
  getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/attendance/history/`, { params: { classId, subjectId } }),
  getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
  // Assignments
  createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAssignments: (params) => api.get('/teachers/assignments/', { params }),
  getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
  gradeAssignment: (submissionId, data) => api.patch(`/teachers/assignment-submission/${submissionId}/grade/`, data),
  
  // Doubts
  getDoubts: (params) => api.get('/teachers/doubts/', { params }),
  getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
  replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Students
  getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
  // Search
  search: (query) => api.get(`/teachers/search/?q=${query}`),
};



// ============ ADMIN APIs ============
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard/stats/'),
  getStats: () => api.get('/admin/dashboard/stats/'),
  
  // User Management
  getPendingUsers: () => api.get('/admin/users/pending/'),
  approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
  rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
  getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
  getUsers: () => api.get('/admin/users/all/'), // Alias
  deleteUser: (userId) => api.delete(`/admin/users/${userId}/delete/`),
  
  // Classes
  getClasses: () => api.get('/admin/classes/'),
  createClass: (data) => api.post('/admin/classes/create/', data),
  getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
  updateClass: (classId, data) => api.put(`/admin/classes/${classId}/update/`, data),
  deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
  // Subjects
  getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
  createSubject: (data) => api.post('/admin/subjects/create/', data),
  getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
  updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/update/`, data),
  deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/delete/`),
  
  // Chapters
  getChapters: (subjectId, classId) => 
    api.get(`/admin/chapters/?subject_id=${subjectId || ''}&class_id=${classId || ''}`),
  createChapter: (data) => api.post('/admin/chapters/create/', data),
  updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/update/`, data),
  deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/delete/`),
  
  // Teacher Assignments
  getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
  createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
  deleteTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/delete/`),
  
  // Notifications
  createNotification: (data) => api.post('/admin/notifications/create/', data),
  getNotifications: () => api.get('/admin/notifications/'),
  
  // Fee Payments
  createFeePayment: (data) => api.post('/admin/fees/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFeePayments: () => api.get('/admin/fees/'),
  getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
};

// ============ UTILITY APIs ============
export const utilityAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export { api };







































// // src/services/api.js
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 15000,
// });

// // Add token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Token ${token}`; // ← CHANGED: Token not Bearer
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// // ============ AUTH APIs ============
// export const authAPI = {
//   // Get registration data (classes & subjects)
//   getRegistrationData: () => api.get('/users/registration-data/'),
  
//   // Register
//   register: (data) => api.post('/users/register/', data),
  
//   // Verify registration OTP
//   verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
//   // Resend OTP
//   resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
//   // Login
//   login: (data) => api.post('/users/login/', data),
  
//   // Logout
//   logout: () => api.post('/users/logout/'),
  
//   // Forgot password
//   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
//   // Reset password
//   resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
//   // Get profile
//   getProfile: () => api.get('/users/profile/'),
// };

// // ============ STUDENT APIs ============
// export const studentAPI = {
//   // Home/Dashboard
//   getHome: () => api.get('/students/home/'),
  
//   // Subjects
//   getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
  
//   // Tests
//   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
//   startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
//   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
//   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
//   getMyAttempts: () => api.get('/students/my-test-attempts/'),
  
//   // Attendance
//   getAttendance: () => api.get('/students/my-attendance/'),
  
//   // Fee Payments
//   getFeePayments: () => api.get('/students/my-fee-payments/'),
  
//   // Assignments
//   getAssignments: () => api.get('/students/my-assignments/'),
  
//   // Doubts
//   createDoubt: (data) => api.post('/students/doubts/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getDoubts: () => api.get('/students/doubts/'),
//   replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Notifications
//   getNotifications: () => api.get('/students/my-notifications/'),
  
//   // Search
//   search: (query) => api.get(`/students/search/?q=${query}`),
// };

// // ============ TEACHER APIs ============
// export const teacherAPI = {
//   // Home/Dashboard
//   getHome: () => api.get('/teachers/home/'),
  
//   // Classes & Subjects
//   getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
//   getChapters: (params) => api.get('/teachers/chapters/', { params }),
//   markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
//   // Tests
//   getTests: (params) => api.get('/teachers/tests/', { params }),
//   createTest: (data) => api.post('/teachers/tests/create/', data),
//   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
//   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
  
//   // Questions
//   createQuestion: (data) => api.post('/teachers/questions/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
//   // Attendance
//   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
//   getAttendance: (params) => api.get('/teachers/attendance/', { params }),
//   getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
//   // Assignments
//   createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getAssignments: (params) => api.get('/teachers/assignments/', { params }),
//   getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
  
//   // Doubts
//   getDoubts: (params) => api.get('/teachers/doubts/', { params }),
//   getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
//   replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Students
//   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
//   // Search
//   search: (query) => api.get(`/teachers/search/?q=${query}`),
// };

// // ============ ADMIN APIs ============
// export const adminAPI = {
//   // Dashboard
//   getStats: () => api.get('/admin/dashboard/stats/'),
  
//   // User Management
//   getPendingUsers: () => api.get('/admin/users/pending/'),
//   approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
//   rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
//   getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
  
//   // Classes
//   getClasses: () => api.get('/admin/classes/'),
//   createClass: (data) => api.post('/admin/classes/create/', data),
//   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
//   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
//   // Subjects
//   getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
//   createSubject: (data) => api.post('/admin/subjects/create/', data),
//   getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
  
//   // Chapters
//   getChapters: (subjectId, classId) => 
//     api.get(`/admin/chapters/?subject_id=${subjectId}&class_id=${classId}`),
//   createChapter: (data) => api.post('/admin/chapters/create/', data),
  
//   // Teacher Assignments
//   getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
//   createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
  
//   // Notifications
//   createNotification: (data) => api.post('/admin/notifications/create/', data),
//   getNotifications: () => api.get('/admin/notifications/'),
  
//   // Fee Payments
//   createFeePayment: (data) => api.post('/admin/fees/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getFeePayments: () => api.get('/admin/fees/'),
//   getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
// };

// export { api };



































// // import axios from 'axios';
// // import toast from 'react-hot-toast';

// // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // const api = axios.create({
// //   baseURL: API_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// //   timeout: 15000,
// // });

// // // Request interceptor
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('access_token');
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // // Response interceptor
// // api.interceptors.response.use(
// //   (response) => response,
// //   async (error) => {
// //     const originalRequest = error.config;

// //     if (error.response?.status === 401 && !originalRequest._retry) {
// //       originalRequest._retry = true;

// //       try {
// //         const refreshToken = localStorage.getItem('refresh_token');
// //         const response = await axios.post(`${API_URL}/users/token/refresh/`, {
// //           refresh: refreshToken,
// //         });

// //         const { access } = response.data;
// //         localStorage.setItem('access_token', access);
// //         originalRequest.headers.Authorization = `Bearer ${access}`;
// //         return api(originalRequest);
// //       } catch (refreshError) {
// //         localStorage.clear();
// //         window.location.href = '/login';
// //         return Promise.reject(refreshError);
// //       }
// //     }

// //     return Promise.reject(error);
// //   }
// // );

// // // AUTH ENDPOINTS
// // export const authAPI = {
// //   register: (data) => api.post('/users/register/', data),
// //   login: (data) => api.post('/users/login/', data),
// //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// //   verifyOTP: (email, otp) => api.post('/users/verify-otp/', { email, otp }),
// //   resetPassword: (data) => api.post('/users/reset-password/', data),
// //   getProfile: () => api.get('/users/profile/'),
// //   updateProfile: (data) => api.patch('/users/profile/', data),
// //   logout: () => {
// //     localStorage.clear();
// //     return Promise.resolve();
// //   },
// // };

// // // STUDENT ENDPOINTS
// // export const studentAPI = {
// //   getDashboard: () => api.get('/students/dashboard/'),
// //   getSubjects: () => api.get('/students/subjects/'),
// //   getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
// //   getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
// //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// //   getTestDetails: (testId) => api.get(`/students/tests/${testId}/`),
// //   startTest: (testId) => api.post(`/students/tests/${testId}/start/`),
// //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// //   getMyTests: () => api.get('/students/my-tests/'),
// //   getAttendance: () => api.get('/students/attendance/'),
// //   getFees: () => api.get('/students/fees/'),
// //   getAssignments: () => api.get('/students/assignments/'),
// //   submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data),
// //   getDoubts: () => api.get('/students/doubts/'),
// //   postDoubt: (data) => api.post('/students/doubts/', data),
// //   getNotifications: () => api.get('/students/notifications/'),
// //   markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
// // };

// // // TEACHER ENDPOINTS
// // export const teacherAPI = {
// //   getDashboard: () => api.get('/teachers/dashboard/'),
// //   getSubjects: () => api.get('/teachers/subjects/'),
// //   getSubjectClasses: (subjectId) => api.get(`/teachers/subjects/${subjectId}/classes/`),
// //   getChapters: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/chapters/`),
// //   getChapterTests: (chapterId) => api.get(`/teachers/chapters/${chapterId}/tests/`),
// //   createTest: (chapterId, data) => api.post(`/teachers/chapters/${chapterId}/tests/`, data),
// //   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/`, data),
// //   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/`),
// //   getTestSubmissions: (testId) => api.get(`/teachers/tests/${testId}/submissions/`),
// //   gradeTest: (attemptId, data) => api.post(`/teachers/test-attempts/${attemptId}/grade/`, data),
// //   markAttendance: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`, data),
// //   getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`),
// //   getAssignments: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`),
// //   createAssignment: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`, data),
// //   getAssignmentSubmissions: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/submissions/`),
// //   gradeAssignment: (submissionId, data) => api.post(`/teachers/submissions/${submissionId}/grade/`, data),
// //   getDoubts: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/doubts/`),
// //   answerDoubt: (doubtId, answer) => api.post(`/teachers/doubts/${doubtId}/answer/`, { answer }),
// // };

// // // ADMIN ENDPOINTS
// // export const adminAPI = {
// //   getDashboard: () => api.get('/admin/dashboard/'),
// //   getUsers: () => api.get('/admin/users/'),
// //   createUser: (data) => api.post('/admin/users/', data),
// //   updateUser: (userId, data) => api.put(`/admin/users/${userId}/`, data),
// //   deleteUser: (userId) => api.delete(`/admin/users/${userId}/`),
// //   getClasses: () => api.get('/admin/classes/'),
// //   createClass: (data) => api.post('/admin/classes/', data),
// //   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/`, data),
// //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/`),
// //   getSubjects: () => api.get('/admin/subjects/'),
// //   createSubject: (data) => api.post('/admin/subjects/', data),
// //   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/`, data),
// //   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/`),
// //   getChapters: (subjectId) => api.get(`/admin/subjects/${subjectId}/chapters/`),
// //   createChapter: (subjectId, data) => api.post(`/admin/subjects/${subjectId}/chapters/`, data),
// //   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/`, data),
// //   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/`),
// //   enrollStudent: (data) => api.post('/admin/enrollments/', data),
// //   removeEnrollment: (enrollmentId) => api.delete(`/admin/enrollments/${enrollmentId}/`),
// //   assignTeacher: (data) => api.post('/admin/teacher-assignments/', data),
// //   removeTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/`),
// // };

// // export default api;

























// // // import axios from 'axios';

// // // // Create axios instance
// // // const api = axios.create({
// // //   baseURL: 'http://localhost:8000', // Your Django backend URL
// // //   headers: {
// // //     'Content-Type': 'application/json',
// // //   },
// // //   timeout: 10000,
// // // });

// // // // Request interceptor
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     const token = localStorage.getItem('token');
// // //     if (token) {
// // //       config.headers.Authorization = `Token ${token}`;
// // //     }
// // //     return config;
// // //   },
// // //   (error) => {
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // // Response interceptor
// // // api.interceptors.response.use(
// // //   (response) => response,
// // //   (error) => {
// // //     if (error.response?.status === 401) {
// // //       // Unauthorized - clear auth and redirect to login
// // //       localStorage.removeItem('token');
// // //       localStorage.removeItem('user');
// // //       window.location.href = '/login';
// // //     }
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // export default api;

// // // // ═══════════════════════════════════════════════════
// // // //  API HELPER FUNCTIONS
// // // // ═══════════════════════════════════════════════════

// // // // Auth APIs
// // // export const authAPI = {
// // //   login: (email, password) => api.post('/api/users/login/', { email, password }),
// // //   register: (data) => api.post('/api/users/register/', data),
// // //   verifyOTP: (email, otp) => api.post('/api/users/verify-registration-otp/', { email, otp }),
// // //   resendOTP: (email) => api.post('/api/users/resend-otp/', { email }),
// // //   forgotPassword: (email) => api.post('/api/users/forgot-password/', { email }),
// // //   resetPassword: (email, otp, newPassword) => 
// // //     api.post('/api/users/verify-otp-reset-password/', { email, otp, new_password: newPassword }),
// // //   logout: () => api.post('/api/users/logout/'),
// // //   getProfile: () => api.get('/api/users/profile/'),
// // // };

// // // // Student APIs
// // // export const studentAPI = {
// // //   getDashboard: () => api.get('/api/students/home/'),
// // //   getSubjectDetails: (subjectId) => api.get(`/api/students/subjects/${subjectId}/`),
// // //   getChapterTests: (chapterId) => api.get(`/api/students/chapters/${chapterId}/tests/`),
// // //   startTest: (testId) => api.post(`/api/students/tests/${testId}/start/`),
// // //   submitTest: (attemptId, answers) => 
// // //     api.post(`/api/students/test-attempts/${attemptId}/submit/`, { answers }),
// // //   getTestResult: (attemptId) => api.get(`/api/students/test-attempts/${attemptId}/result/`),
// // //   getMyTests: () => api.get('/api/students/my-test-attempts/'),
// // //   getAttendance: () => api.get('/api/students/my-attendance/'),
// // //   getFees: () => api.get('/api/students/my-fee-payments/'),
// // //   getAssignments: () => api.get('/api/students/my-assignments/'),
// // //   createDoubt: (data) => api.post('/api/students/doubts/create/', data),
// // //   getNotifications: () => api.get('/api/students/my-notifications/'),
// // // };

// // // // Teacher APIs
// // // export const teacherAPI = {
// // //   getDashboard: () => api.get('/api/teachers/home/'),
// // //   getSubjectClasses: (subjectId) => api.get(`/api/teachers/subject/${subjectId}/classes/`),
// // //   getChapters: (classId, subjectId) => 
// // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/chapters/`),
// // //   markChapterComplete: (chapterId) => 
// // //     api.post(`/api/teachers/chapters/${chapterId}/mark-complete/`),
// // //   getTests: (chapterId) => api.get(`/api/teachers/chapter/${chapterId}/tests/`),
// // //   createTest: (chapterId, data) => 
// // //     api.post(`/api/teachers/chapter/${chapterId}/tests/create/`, data),
// // //   getTestDetails: (testId) => api.get(`/api/teachers/tests/${testId}/`),
// // //   createQuestion: (testId, data) => 
// // //     api.post(`/api/teachers/tests/${testId}/questions/create/`, data),
// // //   updateQuestion: (questionId, data) => 
// // //     api.put(`/api/teachers/questions/${questionId}/update/`, data),
// // //   deleteQuestion: (questionId) => api.delete(`/api/teachers/questions/${questionId}/delete/`),
// // //   markAttendance: (classId, subjectId, data) => 
// // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/mark/`, data),
// // //   getAttendanceList: (classId, subjectId) => 
// // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/`),
// // //   createAssignment: (classId, subjectId, data) => 
// // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/create/`, data),
// // //   getAssignments: (classId, subjectId) => 
// // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/`),
// // //   getDoubts: (classId, subjectId) => 
// // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/doubts/`),
// // //   replyDoubt: (doubtId, data) => 
// // //     api.post(`/api/teachers/doubts/${doubtId}/reply/`, data),
// // //   getClassStudents: (classId) => api.get(`/api/teachers/class/${classId}/students/`),
// // // };

// // // // Admin APIs
// // // export const adminAPI = {
// // //   getAllUsers: () => api.get('/api/admin/users/'),
// // //   approveUser: (userId) => api.post(`/api/admin/users/${userId}/approve/`),
// // //   createClass: (data) => api.post('/api/admin/classes/create/', data),
// // //   getAllClasses: () => api.get('/api/admin/classes/'),
// // //   createSubject: (data) => api.post('/api/admin/subjects/create/', data),
// // //   getAllSubjects: () => api.get('/api/admin/subjects/'),
// // //   createChapter: (data) => api.post('/api/admin/chapters/create/', data),
// // //   getAllChapters: () => api.get('/api/admin/chapters/'),
// // // };

// // // // Utility APIs
// // // export const utilityAPI = {
// // //   getClasses: () => api.get('/api/users/classes/'),
// // //   getSubjects: () => api.get('/api/users/subjects/'),
// // // };



















// // // // import axios from 'axios';

// // // // const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // // const api = axios.create({
// // // //   baseURL: API_BASE_URL,
// // // //   headers: {
// // // //     'Content-Type': 'application/json',
// // // //   },
// // // // });

// // // // // Request interceptor
// // // // api.interceptors.request.use(
// // // //   (config) => {
// // // //     const token = localStorage.getItem('access_token');
// // // //     if (token) {
// // // //       config.headers.Authorization = `Bearer ${token}`;
// // // //     }
// // // //     return config;
// // // //   },
// // // //   (error) => Promise.reject(error)
// // // // );

// // // // // Response interceptor
// // // // api.interceptors.response.use(
// // // //   (response) => response,
// // // //   async (error) => {
// // // //     const originalRequest = error.config;

// // // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // // //       originalRequest._retry = true;

// // // //       try {
// // // //         const refreshToken = localStorage.getItem('refresh_token');
// // // //         const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
// // // //           refresh: refreshToken,
// // // //         });

// // // //         const { access } = response.data;
// // // //         localStorage.setItem('access_token', access);
// // // //         originalRequest.headers.Authorization = `Bearer ${access}`;
// // // //         return api(originalRequest);
// // // //       } catch (refreshError) {
// // // //         localStorage.clear();
// // // //         window.location.href = '/login';
// // // //         return Promise.reject(refreshError);
// // // //       }
// // // //     }

// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // // Authentication API
// // // // export const authAPI = {
// // // //   register: (userData) => api.post('/users/register/', userData),
// // // //   verifyOTP: (email, otp) => api.post('/users/verify-registration-otp/', { email, otp }),
// // // //   resendOTP: (email) => api.post('/users/resend-otp/', { email }),
// // // //   login: (identifier, password) => api.post('/users/login/', { identifier, password }),
// // // //   logout: (refreshToken) => api.post('/users/logout/', { refresh_token: refreshToken }),
// // // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// // // //   resetPassword: (email, otp, newPassword) => 
// // // //     api.post('/users/reset-password/', { email, otp, new_password: newPassword }),
// // // //   getProfile: () => api.get('/users/me/'),
// // // //   updateProfile: (userData) => api.put('/users/profile/', userData),
// // // //   changePassword: (oldPassword, newPassword, newPasswordConfirm) => 
// // // //     api.post('/users/change-password/', {
// // // //       old_password: oldPassword,
// // // //       new_password: newPassword,
// // // //       new_password_confirm: newPasswordConfirm,
// // // //     }),
// // // // };

// // // // // Student API
// // // // export const studentAPI = {
// // // //   getDashboard: () => api.get('/students/dashboard/'),
// // // //   getAvailableTests: (params) => api.get('/students/available-tests/', { params }),
// // // //   startTest: (testId) => api.get(`/students/start-test/${testId}/`),
// // // //   submitTest: (testId, answers) => api.post(`/students/submit-test/${testId}/`, { answers }),
// // // //   getTestAttempts: () => api.get('/students/test-attempts/'),
// // // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/`),
// // // //   getStatistics: () => api.get('/students/test-attempts/statistics/'),
// // // //   getAttendance: (params) => api.get('/students/attendance/', { params }),
// // // //   getAssignments: (params) => api.get('/students/assignments/', { params }),
// // // //   getDoubts: () => api.get('/students/doubts/'),
// // // //   postDoubt: (doubtData) => api.post('/students/doubts/', doubtData),
// // // //   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
// // // // };

// // // // // Teacher API
// // // // export const teacherAPI = {
// // // //   getDashboard: () => api.get('/teachers/dashboard/'),
// // // //   getAssignments: () => api.get('/teachers/assignments/my-assignments/'),
// // // //   getTests: (params) => api.get('/teachers/tests/my-tests/', { params }),
// // // //   createTest: (testData) => api.post('/teachers/tests/', testData),
// // // //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// // // //   addQuestion: (testId, questionData) => api.post(`/teachers/tests/${testId}/add-question/`, questionData),
// // // //   getTestStatistics: (testId) => api.get(`/teachers/tests/${testId}/statistics/`),
// // // //   markAttendance: (attendanceData) => api.post('/teachers/attendance/mark-bulk/', attendanceData),
// // // //   getAttendanceByDate: (params) => api.get('/teachers/attendance/by-date/', { params }),
// // // //   getStudentReport: (studentId, params) => api.get(`/teachers/attendance/student-report/${studentId}/`, { params }),
// // // //   getClassReport: (classId, params) => api.get(`/teachers/attendance/class-report/${classId}/`, { params }),
// // // //   createAssignment: (assignmentData) => api.post('/teachers/assignments/', assignmentData),
// // // //   getDoubts: (params) => api.get('/teachers/doubts/my-subject-doubts/', { params }),
// // // //   replyToDoubt: (doubtId, replyData) => api.post(`/teachers/doubts/${doubtId}/reply/`, replyData),
// // // // };

// // // // // Admin API
// // // // export const adminAPI = {
// // // //   getDashboard: () => api.get('/admin/dashboard/'),
// // // //   getPendingUsers: () => api.get('/users/pending/'),
// // // //   approveUser: (userId) => api.post(`/users/${userId}/approve/`),
// // // //   rejectUser: (userId) => api.post(`/users/${userId}/reject/`),
// // // //   getClasses: () => api.get('/admin/classes/'),
// // // //   createClass: (classData) => api.post('/admin/classes/', classData),
// // // //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// // // //   getSubjects: () => api.get('/admin/subjects/'),
// // // //   createSubject: (subjectData) => api.post('/admin/subjects/', subjectData),
// // // //   getChapters: (params) => api.get('/admin/chapters/', { params }),
// // // //   createChapter: (chapterData) => api.post('/admin/chapters/', chapterData),
// // // //   markChapterComplete: (chapterId, isCompleted) => 
// // // //     api.post(`/admin/chapters/${chapterId}/mark-completed/`, { is_completed: isCompleted }),
// // // //   getFeePayments: (params) => api.get('/admin/fee-payments/', { params }),
// // // //   createFeePayment: (paymentData) => api.post('/admin/fee-payments/', paymentData),
// // // //   getNotifications: () => api.get('/admin/notifications/'),
// // // //   createNotification: (notificationData) => api.post('/admin/notifications/', notificationData),
// // // //   broadcastNotification: (message, role) => 
// // // //     api.post('/admin/notifications/broadcast/', { message, role }),
// // // // };

// // // // export default api;



























// // src/services/api.js
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 15000,
// });

// // Add token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Token ${token}`; // Token not Bearer
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// // ============ AUTH APIs ============
// export const authAPI = {
//   // Get registration data (classes & subjects)
//   getRegistrationData: () => api.get('/users/registration-data/'),
  
//   // Register
//   register: (data) => api.post('/users/register/', data),
  
//   // Verify registration OTP
//   verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
//   // Resend OTP
//   resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
//   // Login
//   login: (data) => api.post('/users/login/', data),
  
//   // Logout
//   logout: () => api.post('/users/logout/'),
  
//   // Forgot password
//   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
//   // Reset password
//   resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
//   // Get profile
//   getProfile: () => api.get('/users/profile/'),
// };

// // ============ STUDENT APIs ============
// export const studentAPI = {
//   // Dashboard - NEW! This is what was missing
//   getDashboard: () => api.get('/students/home/'),
  
//   // Home/Dashboard (alias for compatibility)
//   getHome: () => api.get('/students/home/'),
  
//   // Subjects
//   getSubjects: () => api.get('/students/subjects/'),
//   getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
//   getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`), // Alias
  
//   // Chapters
//   getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
  
//   // Tests
//   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
//   startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
//   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
//   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
//   getMyAttempts: () => api.get('/students/my-test-attempts/'),
//   getMyTests: () => api.get('/students/my-test-attempts/'), // Alias
  
//   // Attendance
//   getAttendance: () => api.get('/students/my-attendance/'),
//   getMyAttendance: () => api.get('/students/my-attendance/'), // Alias
  
//   // Fee Payments
//   getFeePayments: () => api.get('/students/my-fee-payments/'),
//   getMyFees: () => api.get('/students/my-fee-payments/'), // Alias
  
//   // Assignments
//   getAssignments: () => api.get('/students/my-assignments/'),
//   getMyAssignments: () => api.get('/students/my-assignments/'), // Alias
//   submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Doubts
//   createDoubt: (data) => api.post('/students/doubts/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getDoubts: () => api.get('/students/doubts/'),
//   getMyDoubts: () => api.get('/students/doubts/'), // Alias
//   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
//   replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Notifications
//   getNotifications: () => api.get('/students/my-notifications/'),
//   getMyNotifications: () => api.get('/students/my-notifications/'), // Alias
//   markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
  
//   // Search
//   search: (query) => api.get(`/students/search/?q=${query}`),
// };

// // ============ TEACHER APIs ============
// export const teacherAPI = {
//   // Dashboard - NEW! This is what was missing for teachers
//   getDashboard: () => api.get('/teachers/home/'),
  
//   // Home/Dashboard (alias for compatibility)
//   getHome: () => api.get('/teachers/home/'),
  
//   // Classes & Subjects
//   getSubjects: () => api.get('/teachers/subjects/'),
//   getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
//   getClassChapters: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/chapters/`),
//   getChapters: (params) => api.get('/teachers/chapters/', { params }),
//   createChapter: (data) => api.post('/teachers/chapters/create/', data),
//   markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
//   // Tests
//   getTests: (params) => api.get('/teachers/tests/', { params }),
//   getChapterTests: (chapterId) => api.get(`/teachers/chapter/${chapterId}/tests/`),
//   createTest: (data) => api.post('/teachers/tests/create/', data),
//   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
//   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
//   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/update/`, data),
//   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/delete/`),
  
//   // Questions
//   createQuestion: (data) => api.post('/teachers/questions/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
//   // Attendance
//   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
//   getAttendance: (params) => api.get('/teachers/attendance/', { params }),
//   getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/attendance/history/`, { params: { classId, subjectId } }),
//   getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
//   // Assignments
//   createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getAssignments: (params) => api.get('/teachers/assignments/', { params }),
//   getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
//   gradeAssignment: (submissionId, data) => api.patch(`/teachers/assignment-submission/${submissionId}/grade/`, data),
  
//   // Doubts
//   getDoubts: (params) => api.get('/teachers/doubts/', { params }),
//   getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
//   replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Students
//   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
//   // Search
//   search: (query) => api.get(`/teachers/search/?q=${query}`),
// };

// // ============ ADMIN APIs ============
// export const adminAPI = {
//   // Dashboard
//   getDashboard: () => api.get('/admin/dashboard/stats/'),
//   getStats: () => api.get('/admin/dashboard/stats/'),
  
//   // User Management
//   getPendingUsers: () => api.get('/admin/users/pending/'),
//   approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
//   rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
//   getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
//   getUsers: () => api.get('/admin/users/all/'), // Alias
//   deleteUser: (userId) => api.delete(`/admin/users/${userId}/delete/`),
  
//   // Classes
//   getClasses: () => api.get('/admin/classes/'),
//   createClass: (data) => api.post('/admin/classes/create/', data),
//   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
//   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/update/`, data),
//   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
//   // Subjects
//   getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
//   createSubject: (data) => api.post('/admin/subjects/create/', data),
//   getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
//   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/update/`, data),
//   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/delete/`),
  
//   // Chapters
//   getChapters: (subjectId, classId) => 
//     api.get(`/admin/chapters/?subject_id=${subjectId || ''}&class_id=${classId || ''}`),
//   createChapter: (data) => api.post('/admin/chapters/create/', data),
//   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/update/`, data),
//   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/delete/`),
  
//   // Teacher Assignments
//   getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
//   createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
//   deleteTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/delete/`),
  
//   // Notifications
//   createNotification: (data) => api.post('/admin/notifications/create/', data),
//   getNotifications: () => api.get('/admin/notifications/'),
  
//   // Fee Payments
//   createFeePayment: (data) => api.post('/admin/fees/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getFeePayments: () => api.get('/admin/fees/'),
//   getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
// };

// // ============ UTILITY APIs ============
// export const utilityAPI = {
//   uploadFile: (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     return api.post('/upload/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   },
// };

// export { api };







































// // // src/services/api.js
// // import axios from 'axios';

// // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // Create axios instance
// // const api = axios.create({
// //   baseURL: API_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// //   timeout: 15000,
// // });

// // // Add token to requests
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       config.headers.Authorization = `Token ${token}`; // ← CHANGED: Token not Bearer
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Handle response errors
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       localStorage.removeItem('token');
// //       localStorage.removeItem('user');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default api;

// // // ============ AUTH APIs ============
// // export const authAPI = {
// //   // Get registration data (classes & subjects)
// //   getRegistrationData: () => api.get('/users/registration-data/'),
  
// //   // Register
// //   register: (data) => api.post('/users/register/', data),
  
// //   // Verify registration OTP
// //   verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
// //   // Resend OTP
// //   resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
// //   // Login
// //   login: (data) => api.post('/users/login/', data),
  
// //   // Logout
// //   logout: () => api.post('/users/logout/'),
  
// //   // Forgot password
// //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
// //   // Reset password
// //   resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
// //   // Get profile
// //   getProfile: () => api.get('/users/profile/'),
// // };

// // // ============ STUDENT APIs ============
// // export const studentAPI = {
// //   // Home/Dashboard
// //   getHome: () => api.get('/students/home/'),
  
// //   // Subjects
// //   getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
  
// //   // Tests
// //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// //   startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
// //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// //   getMyAttempts: () => api.get('/students/my-test-attempts/'),
  
// //   // Attendance
// //   getAttendance: () => api.get('/students/my-attendance/'),
  
// //   // Fee Payments
// //   getFeePayments: () => api.get('/students/my-fee-payments/'),
  
// //   // Assignments
// //   getAssignments: () => api.get('/students/my-assignments/'),
  
// //   // Doubts
// //   createDoubt: (data) => api.post('/students/doubts/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getDoubts: () => api.get('/students/doubts/'),
// //   replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
  
// //   // Notifications
// //   getNotifications: () => api.get('/students/my-notifications/'),
  
// //   // Search
// //   search: (query) => api.get(`/students/search/?q=${query}`),
// // };

// // // ============ TEACHER APIs ============
// // export const teacherAPI = {
// //   // Home/Dashboard
// //   getHome: () => api.get('/teachers/home/'),
  
// //   // Classes & Subjects
// //   getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
// //   getChapters: (params) => api.get('/teachers/chapters/', { params }),
// //   markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
// //   // Tests
// //   getTests: (params) => api.get('/teachers/tests/', { params }),
// //   createTest: (data) => api.post('/teachers/tests/create/', data),
// //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// //   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
  
// //   // Questions
// //   createQuestion: (data) => api.post('/teachers/questions/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
// //   // Attendance
// //   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
// //   getAttendance: (params) => api.get('/teachers/attendance/', { params }),
// //   getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
// //   // Assignments
// //   createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getAssignments: (params) => api.get('/teachers/assignments/', { params }),
// //   getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
  
// //   // Doubts
// //   getDoubts: (params) => api.get('/teachers/doubts/', { params }),
// //   getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
// //   replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
  
// //   // Students
// //   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
// //   // Search
// //   search: (query) => api.get(`/teachers/search/?q=${query}`),
// // };

// // // ============ ADMIN APIs ============
// // export const adminAPI = {
// //   // Dashboard
// //   getStats: () => api.get('/admin/dashboard/stats/'),
  
// //   // User Management
// //   getPendingUsers: () => api.get('/admin/users/pending/'),
// //   approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
// //   rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
// //   getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
  
// //   // Classes
// //   getClasses: () => api.get('/admin/classes/'),
// //   createClass: (data) => api.post('/admin/classes/create/', data),
// //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
// //   // Subjects
// //   getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
// //   createSubject: (data) => api.post('/admin/subjects/create/', data),
// //   getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
  
// //   // Chapters
// //   getChapters: (subjectId, classId) => 
// //     api.get(`/admin/chapters/?subject_id=${subjectId}&class_id=${classId}`),
// //   createChapter: (data) => api.post('/admin/chapters/create/', data),
  
// //   // Teacher Assignments
// //   getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
// //   createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
  
// //   // Notifications
// //   createNotification: (data) => api.post('/admin/notifications/create/', data),
// //   getNotifications: () => api.get('/admin/notifications/'),
  
// //   // Fee Payments
// //   createFeePayment: (data) => api.post('/admin/fees/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getFeePayments: () => api.get('/admin/fees/'),
// //   getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
// // };

// // export { api };



































// // // import axios from 'axios';
// // // import toast from 'react-hot-toast';

// // // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // const api = axios.create({
// // //   baseURL: API_URL,
// // //   headers: {
// // //     'Content-Type': 'application/json',
// // //   },
// // //   timeout: 15000,
// // // });

// // // // Request interceptor
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     const token = localStorage.getItem('access_token');
// // //     if (token) {
// // //       config.headers.Authorization = `Bearer ${token}`;
// // //     }
// // //     return config;
// // //   },
// // //   (error) => Promise.reject(error)
// // // );

// // // // Response interceptor
// // // api.interceptors.response.use(
// // //   (response) => response,
// // //   async (error) => {
// // //     const originalRequest = error.config;

// // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // //       originalRequest._retry = true;

// // //       try {
// // //         const refreshToken = localStorage.getItem('refresh_token');
// // //         const response = await axios.post(`${API_URL}/users/token/refresh/`, {
// // //           refresh: refreshToken,
// // //         });

// // //         const { access } = response.data;
// // //         localStorage.setItem('access_token', access);
// // //         originalRequest.headers.Authorization = `Bearer ${access}`;
// // //         return api(originalRequest);
// // //       } catch (refreshError) {
// // //         localStorage.clear();
// // //         window.location.href = '/login';
// // //         return Promise.reject(refreshError);
// // //       }
// // //     }

// // //     return Promise.reject(error);
// // //   }
// // // );

// // // // AUTH ENDPOINTS
// // // export const authAPI = {
// // //   register: (data) => api.post('/users/register/', data),
// // //   login: (data) => api.post('/users/login/', data),
// // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// // //   verifyOTP: (email, otp) => api.post('/users/verify-otp/', { email, otp }),
// // //   resetPassword: (data) => api.post('/users/reset-password/', data),
// // //   getProfile: () => api.get('/users/profile/'),
// // //   updateProfile: (data) => api.patch('/users/profile/', data),
// // //   logout: () => {
// // //     localStorage.clear();
// // //     return Promise.resolve();
// // //   },
// // // };

// // // // STUDENT ENDPOINTS
// // // export const studentAPI = {
// // //   getDashboard: () => api.get('/students/dashboard/'),
// // //   getSubjects: () => api.get('/students/subjects/'),
// // //   getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
// // //   getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
// // //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// // //   getTestDetails: (testId) => api.get(`/students/tests/${testId}/`),
// // //   startTest: (testId) => api.post(`/students/tests/${testId}/start/`),
// // //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// // //   getMyTests: () => api.get('/students/my-tests/'),
// // //   getAttendance: () => api.get('/students/attendance/'),
// // //   getFees: () => api.get('/students/fees/'),
// // //   getAssignments: () => api.get('/students/assignments/'),
// // //   submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data),
// // //   getDoubts: () => api.get('/students/doubts/'),
// // //   postDoubt: (data) => api.post('/students/doubts/', data),
// // //   getNotifications: () => api.get('/students/notifications/'),
// // //   markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
// // // };

// // // // TEACHER ENDPOINTS
// // // export const teacherAPI = {
// // //   getDashboard: () => api.get('/teachers/dashboard/'),
// // //   getSubjects: () => api.get('/teachers/subjects/'),
// // //   getSubjectClasses: (subjectId) => api.get(`/teachers/subjects/${subjectId}/classes/`),
// // //   getChapters: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/chapters/`),
// // //   getChapterTests: (chapterId) => api.get(`/teachers/chapters/${chapterId}/tests/`),
// // //   createTest: (chapterId, data) => api.post(`/teachers/chapters/${chapterId}/tests/`, data),
// // //   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/`, data),
// // //   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/`),
// // //   getTestSubmissions: (testId) => api.get(`/teachers/tests/${testId}/submissions/`),
// // //   gradeTest: (attemptId, data) => api.post(`/teachers/test-attempts/${attemptId}/grade/`, data),
// // //   markAttendance: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`, data),
// // //   getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`),
// // //   getAssignments: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`),
// // //   createAssignment: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`, data),
// // //   getAssignmentSubmissions: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/submissions/`),
// // //   gradeAssignment: (submissionId, data) => api.post(`/teachers/submissions/${submissionId}/grade/`, data),
// // //   getDoubts: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/doubts/`),
// // //   answerDoubt: (doubtId, answer) => api.post(`/teachers/doubts/${doubtId}/answer/`, { answer }),
// // // };

// // // // ADMIN ENDPOINTS
// // // export const adminAPI = {
// // //   getDashboard: () => api.get('/admin/dashboard/'),
// // //   getUsers: () => api.get('/admin/users/'),
// // //   createUser: (data) => api.post('/admin/users/', data),
// // //   updateUser: (userId, data) => api.put(`/admin/users/${userId}/`, data),
// // //   deleteUser: (userId) => api.delete(`/admin/users/${userId}/`),
// // //   getClasses: () => api.get('/admin/classes/'),
// // //   createClass: (data) => api.post('/admin/classes/', data),
// // //   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/`, data),
// // //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/`),
// // //   getSubjects: () => api.get('/admin/subjects/'),
// // //   createSubject: (data) => api.post('/admin/subjects/', data),
// // //   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/`, data),
// // //   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/`),
// // //   getChapters: (subjectId) => api.get(`/admin/subjects/${subjectId}/chapters/`),
// // //   createChapter: (subjectId, data) => api.post(`/admin/subjects/${subjectId}/chapters/`, data),
// // //   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/`, data),
// // //   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/`),
// // //   enrollStudent: (data) => api.post('/admin/enrollments/', data),
// // //   removeEnrollment: (enrollmentId) => api.delete(`/admin/enrollments/${enrollmentId}/`),
// // //   assignTeacher: (data) => api.post('/admin/teacher-assignments/', data),
// // //   removeTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/`),
// // // };

// // // export default api;

























// // // // import axios from 'axios';

// // // // // Create axios instance
// // // // const api = axios.create({
// // // //   baseURL: 'http://localhost:8000', // Your Django backend URL
// // // //   headers: {
// // // //     'Content-Type': 'application/json',
// // // //   },
// // // //   timeout: 10000,
// // // // });

// // // // // Request interceptor
// // // // api.interceptors.request.use(
// // // //   (config) => {
// // // //     const token = localStorage.getItem('token');
// // // //     if (token) {
// // // //       config.headers.Authorization = `Token ${token}`;
// // // //     }
// // // //     return config;
// // // //   },
// // // //   (error) => {
// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // // Response interceptor
// // // // api.interceptors.response.use(
// // // //   (response) => response,
// // // //   (error) => {
// // // //     if (error.response?.status === 401) {
// // // //       // Unauthorized - clear auth and redirect to login
// // // //       localStorage.removeItem('token');
// // // //       localStorage.removeItem('user');
// // // //       window.location.href = '/login';
// // // //     }
// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // export default api;

// // // // // ═══════════════════════════════════════════════════
// // // // //  API HELPER FUNCTIONS
// // // // // ═══════════════════════════════════════════════════

// // // // // Auth APIs
// // // // export const authAPI = {
// // // //   login: (email, password) => api.post('/api/users/login/', { email, password }),
// // // //   register: (data) => api.post('/api/users/register/', data),
// // // //   verifyOTP: (email, otp) => api.post('/api/users/verify-registration-otp/', { email, otp }),
// // // //   resendOTP: (email) => api.post('/api/users/resend-otp/', { email }),
// // // //   forgotPassword: (email) => api.post('/api/users/forgot-password/', { email }),
// // // //   resetPassword: (email, otp, newPassword) => 
// // // //     api.post('/api/users/verify-otp-reset-password/', { email, otp, new_password: newPassword }),
// // // //   logout: () => api.post('/api/users/logout/'),
// // // //   getProfile: () => api.get('/api/users/profile/'),
// // // // };

// // // // // Student APIs
// // // // export const studentAPI = {
// // // //   getDashboard: () => api.get('/api/students/home/'),
// // // //   getSubjectDetails: (subjectId) => api.get(`/api/students/subjects/${subjectId}/`),
// // // //   getChapterTests: (chapterId) => api.get(`/api/students/chapters/${chapterId}/tests/`),
// // // //   startTest: (testId) => api.post(`/api/students/tests/${testId}/start/`),
// // // //   submitTest: (attemptId, answers) => 
// // // //     api.post(`/api/students/test-attempts/${attemptId}/submit/`, { answers }),
// // // //   getTestResult: (attemptId) => api.get(`/api/students/test-attempts/${attemptId}/result/`),
// // // //   getMyTests: () => api.get('/api/students/my-test-attempts/'),
// // // //   getAttendance: () => api.get('/api/students/my-attendance/'),
// // // //   getFees: () => api.get('/api/students/my-fee-payments/'),
// // // //   getAssignments: () => api.get('/api/students/my-assignments/'),
// // // //   createDoubt: (data) => api.post('/api/students/doubts/create/', data),
// // // //   getNotifications: () => api.get('/api/students/my-notifications/'),
// // // // };

// // // // // Teacher APIs
// // // // export const teacherAPI = {
// // // //   getDashboard: () => api.get('/api/teachers/home/'),
// // // //   getSubjectClasses: (subjectId) => api.get(`/api/teachers/subject/${subjectId}/classes/`),
// // // //   getChapters: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/chapters/`),
// // // //   markChapterComplete: (chapterId) => 
// // // //     api.post(`/api/teachers/chapters/${chapterId}/mark-complete/`),
// // // //   getTests: (chapterId) => api.get(`/api/teachers/chapter/${chapterId}/tests/`),
// // // //   createTest: (chapterId, data) => 
// // // //     api.post(`/api/teachers/chapter/${chapterId}/tests/create/`, data),
// // // //   getTestDetails: (testId) => api.get(`/api/teachers/tests/${testId}/`),
// // // //   createQuestion: (testId, data) => 
// // // //     api.post(`/api/teachers/tests/${testId}/questions/create/`, data),
// // // //   updateQuestion: (questionId, data) => 
// // // //     api.put(`/api/teachers/questions/${questionId}/update/`, data),
// // // //   deleteQuestion: (questionId) => api.delete(`/api/teachers/questions/${questionId}/delete/`),
// // // //   markAttendance: (classId, subjectId, data) => 
// // // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/mark/`, data),
// // // //   getAttendanceList: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/`),
// // // //   createAssignment: (classId, subjectId, data) => 
// // // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/create/`, data),
// // // //   getAssignments: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/`),
// // // //   getDoubts: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/doubts/`),
// // // //   replyDoubt: (doubtId, data) => 
// // // //     api.post(`/api/teachers/doubts/${doubtId}/reply/`, data),
// // // //   getClassStudents: (classId) => api.get(`/api/teachers/class/${classId}/students/`),
// // // // };

// // // // // Admin APIs
// // // // export const adminAPI = {
// // // //   getAllUsers: () => api.get('/api/admin/users/'),
// // // //   approveUser: (userId) => api.post(`/api/admin/users/${userId}/approve/`),
// // // //   createClass: (data) => api.post('/api/admin/classes/create/', data),
// // // //   getAllClasses: () => api.get('/api/admin/classes/'),
// // // //   createSubject: (data) => api.post('/api/admin/subjects/create/', data),
// // // //   getAllSubjects: () => api.get('/api/admin/subjects/'),
// // // //   createChapter: (data) => api.post('/api/admin/chapters/create/', data),
// // // //   getAllChapters: () => api.get('/api/admin/chapters/'),
// // // // };

// // // // // Utility APIs
// // // // export const utilityAPI = {
// // // //   getClasses: () => api.get('/api/users/classes/'),
// // // //   getSubjects: () => api.get('/api/users/subjects/'),
// // // // };



















// // // // // import axios from 'axios';

// // // // // const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // // // const api = axios.create({
// // // // //   baseURL: API_BASE_URL,
// // // // //   headers: {
// // // // //     'Content-Type': 'application/json',
// // // // //   },
// // // // // });

// // // // // // Request interceptor
// // // // // api.interceptors.request.use(
// // // // //   (config) => {
// // // // //     const token = localStorage.getItem('access_token');
// // // // //     if (token) {
// // // // //       config.headers.Authorization = `Bearer ${token}`;
// // // // //     }
// // // // //     return config;
// // // // //   },
// // // // //   (error) => Promise.reject(error)
// // // // // );

// // // // // // Response interceptor
// // // // // api.interceptors.response.use(
// // // // //   (response) => response,
// // // // //   async (error) => {
// // // // //     const originalRequest = error.config;

// // // // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // // // //       originalRequest._retry = true;

// // // // //       try {
// // // // //         const refreshToken = localStorage.getItem('refresh_token');
// // // // //         const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
// // // // //           refresh: refreshToken,
// // // // //         });

// // // // //         const { access } = response.data;
// // // // //         localStorage.setItem('access_token', access);
// // // // //         originalRequest.headers.Authorization = `Bearer ${access}`;
// // // // //         return api(originalRequest);
// // // // //       } catch (refreshError) {
// // // // //         localStorage.clear();
// // // // //         window.location.href = '/login';
// // // // //         return Promise.reject(refreshError);
// // // // //       }
// // // // //     }

// // // // //     return Promise.reject(error);
// // // // //   }
// // // // // );

// // // // // // Authentication API
// // // // // export const authAPI = {
// // // // //   register: (userData) => api.post('/users/register/', userData),
// // // // //   verifyOTP: (email, otp) => api.post('/users/verify-registration-otp/', { email, otp }),
// // // // //   resendOTP: (email) => api.post('/users/resend-otp/', { email }),
// // // // //   login: (identifier, password) => api.post('/users/login/', { identifier, password }),
// // // // //   logout: (refreshToken) => api.post('/users/logout/', { refresh_token: refreshToken }),
// // // // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// // // // //   resetPassword: (email, otp, newPassword) => 
// // // // //     api.post('/users/reset-password/', { email, otp, new_password: newPassword }),
// // // // //   getProfile: () => api.get('/users/me/'),
// // // // //   updateProfile: (userData) => api.put('/users/profile/', userData),
// // // // //   changePassword: (oldPassword, newPassword, newPasswordConfirm) => 
// // // // //     api.post('/users/change-password/', {
// // // // //       old_password: oldPassword,
// // // // //       new_password: newPassword,
// // // // //       new_password_confirm: newPasswordConfirm,
// // // // //     }),
// // // // // };

// // // // // // Student API
// // // // // export const studentAPI = {
// // // // //   getDashboard: () => api.get('/students/dashboard/'),
// // // // //   getAvailableTests: (params) => api.get('/students/available-tests/', { params }),
// // // // //   startTest: (testId) => api.get(`/students/start-test/${testId}/`),
// // // // //   submitTest: (testId, answers) => api.post(`/students/submit-test/${testId}/`, { answers }),
// // // // //   getTestAttempts: () => api.get('/students/test-attempts/'),
// // // // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/`),
// // // // //   getStatistics: () => api.get('/students/test-attempts/statistics/'),
// // // // //   getAttendance: (params) => api.get('/students/attendance/', { params }),
// // // // //   getAssignments: (params) => api.get('/students/assignments/', { params }),
// // // // //   getDoubts: () => api.get('/students/doubts/'),
// // // // //   postDoubt: (doubtData) => api.post('/students/doubts/', doubtData),
// // // // //   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
// // // // // };

// // // // // // Teacher API
// // // // // export const teacherAPI = {
// // // // //   getDashboard: () => api.get('/teachers/dashboard/'),
// // // // //   getAssignments: () => api.get('/teachers/assignments/my-assignments/'),
// // // // //   getTests: (params) => api.get('/teachers/tests/my-tests/', { params }),
// // // // //   createTest: (testData) => api.post('/teachers/tests/', testData),
// // // // //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// // // // //   addQuestion: (testId, questionData) => api.post(`/teachers/tests/${testId}/add-question/`, questionData),
// // // // //   getTestStatistics: (testId) => api.get(`/teachers/tests/${testId}/statistics/`),
// // // // //   markAttendance: (attendanceData) => api.post('/teachers/attendance/mark-bulk/', attendanceData),
// // // // //   getAttendanceByDate: (params) => api.get('/teachers/attendance/by-date/', { params }),
// // // // //   getStudentReport: (studentId, params) => api.get(`/teachers/attendance/student-report/${studentId}/`, { params }),
// // // // //   getClassReport: (classId, params) => api.get(`/teachers/attendance/class-report/${classId}/`, { params }),
// // // // //   createAssignment: (assignmentData) => api.post('/teachers/assignments/', assignmentData),
// // // // //   getDoubts: (params) => api.get('/teachers/doubts/my-subject-doubts/', { params }),
// // // // //   replyToDoubt: (doubtId, replyData) => api.post(`/teachers/doubts/${doubtId}/reply/`, replyData),
// // // // // };

// // // // // // Admin API
// // // // // export const adminAPI = {
// // // // //   getDashboard: () => api.get('/admin/dashboard/'),
// // // // //   getPendingUsers: () => api.get('/users/pending/'),
// // // // //   approveUser: (userId) => api.post(`/users/${userId}/approve/`),
// // // // //   rejectUser: (userId) => api.post(`/users/${userId}/reject/`),
// // // // //   getClasses: () => api.get('/admin/classes/'),
// // // // //   createClass: (classData) => api.post('/admin/classes/', classData),
// // // // //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// // // // //   getSubjects: () => api.get('/admin/subjects/'),
// // // // //   createSubject: (subjectData) => api.post('/admin/subjects/', subjectData),
// // // // //   getChapters: (params) => api.get('/admin/chapters/', { params }),
// // // // //   createChapter: (chapterData) => api.post('/admin/chapters/', chapterData),
// // // // //   markChapterComplete: (chapterId, isCompleted) => 
// // // // //     api.post(`/admin/chapters/${chapterId}/mark-completed/`, { is_completed: isCompleted }),
// // // // //   getFeePayments: (params) => api.get('/admin/fee-payments/', { params }),
// // // // //   createFeePayment: (paymentData) => api.post('/admin/fee-payments/', paymentData),
// // // // //   getNotifications: () => api.get('/admin/notifications/'),
// // // // //   createNotification: (notificationData) => api.post('/admin/notifications/', notificationData),
// // // // //   broadcastNotification: (message, role) => 
// // // // //     api.post('/admin/notifications/broadcast/', { message, role }),
// // // // // };

// // // // // export default api;
































// // src/services/api.js
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 15000,
// });

// // Add token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Token ${token}`; // Token not Bearer
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// // ============ AUTH APIs ============
// export const authAPI = {
//   // Get registration data (classes & subjects)
//   getRegistrationData: () => api.get('/users/registration-data/'),
  
//   // Register
//   register: (data) => api.post('/users/register/', data),
  
//   // Verify registration OTP
//   verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
//   // Resend OTP
//   resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
//   // Login
//   login: (data) => api.post('/users/login/', data),
  
//   // Logout
//   logout: () => api.post('/users/logout/'),
  
//   // Forgot password
//   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
//   // Reset password
//   resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
//   // Get profile
//   getProfile: () => api.get('/users/profile/'),
// };

// // ============ STUDENT APIs ============
// export const studentAPI = {
//   // Dashboard - NEW! This is what was missing
//   getDashboard: () => api.get('/students/home/'),
  
//   // Home/Dashboard (alias for compatibility)
//   getHome: () => api.get('/students/home/'),
  
//   // Subjects
//   getSubjects: () => api.get('/students/subjects/'),
//   getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
//   getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`), // Alias
  
//   // Chapters
//   getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
  
//   // Tests
//   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
//   startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
//   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
//   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
//   getMyAttempts: () => api.get('/students/my-test-attempts/'),
//   getMyTests: () => api.get('/students/my-test-attempts/'), // Alias
  
//   // Attendance
//   getAttendance: () => api.get('/students/my-attendance/'),
//   getMyAttendance: () => api.get('/students/my-attendance/'), // Alias
  
//   // Fee Payments
//   getFeePayments: () => api.get('/students/my-fee-payments/'),
//   getMyFees: () => api.get('/students/my-fee-payments/'), // Alias
  
//   // Assignments
//   getAssignments: () => api.get('/students/my-assignments/'),
//   getMyAssignments: () => api.get('/students/my-assignments/'), // Alias
//   submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Doubts
//   getEnrolledSubjects: () => api.get('/students/subjects/'),
//   createDoubt: (data) => api.post('/students/doubts/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getDoubts: () => api.get('/students/doubts/'),
//   getMyDoubts: () => api.get('/students/doubts/'), // Alias
//   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
//   replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Notifications
//   getNotifications: () => api.get('/students/my-notifications/'),
//   getMyNotifications: () => api.get('/students/my-notifications/'), // Alias
//   markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
  
//   // Search
//   search: (query) => api.get(`/students/search/?q=${query}`),
// };

// // ============ TEACHER APIs ============
// export const teacherAPI = {
//   // Dashboard - NEW! This is what was missing for teachers
//   getDashboard: () => api.get('/teachers/home/'),
  
//   // Home/Dashboard (alias for compatibility)
//   getHome: () => api.get('/teachers/home/'),
//   getClasses: () => api.get('/teachers/classes/'), 
  
//   // Classes & Subjects
//   getSubjects: () => api.get('/teachers/subjects/'),
//   getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
//   getClassChapters: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/chapters/`),
//   getChapters: (params) => api.get('/teachers/chapters/', { params }),
//   createChapter: (data) => api.post('/teachers/chapters/create/', data),
//   markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
//   // Tests
//   getTests: (params) => api.get('/teachers/tests/', { params }),
//   getChapterTests: (chapterId) => api.get(`/teachers/chapter/${chapterId}/tests/`),
//   createTest: (data) => api.post('/teachers/tests/create/', data),
//   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
//   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
//   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/update/`, data),
//   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/delete/`),
  
//   // Questions
//   createQuestion: (data) => api.post('/teachers/questions/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
//   // Attendance
//   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
//   getAttendance: (params) => api.get('/teachers/attendance/', { params }),
//   getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/attendance/history/`, { params: { classId, subjectId } }),
//   getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
//   // Assignments
//   createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getAssignments: (params) => api.get('/teachers/assignments/', { params }),
//   getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
//   gradeAssignment: (submissionId, data) => api.patch(`/teachers/assignment-submission/${submissionId}/grade/`, data),
  
//   // Doubts
//   getDoubts: (params) => api.get('/teachers/doubts/', { params }),
//   getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
//   replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
  
//   // Students
//   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
//   // Search
//   search: (query) => api.get(`/teachers/search/?q=${query}`),
// };



// // ============ ADMIN APIs ============
// export const adminAPI = {
//   // Dashboard
//   getDashboard: () => api.get('/admin/dashboard/stats/'),
//   getStats: () => api.get('/admin/dashboard/stats/'),
  
//   // User Management
//   getPendingUsers: () => api.get('/admin/users/pending/'),
//   approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
//   rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
//   getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
//   getUsers: () => api.get('/admin/users/all/'), // Alias
//   deleteUser: (userId) => api.delete(`/admin/users/${userId}/delete/`),
  
//   // Classes
//   getClasses: () => api.get('/admin/classes/'),
//   createClass: (data) => api.post('/admin/classes/create/', data),
//   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
//   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/update/`, data),
//   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
//   // Subjects
//   getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
//   createSubject: (data) => api.post('/admin/subjects/create/', data),
//   getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
//   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/update/`, data),
//   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/delete/`),
  
//   // Chapters
//   getChapters: (subjectId, classId) => 
//     api.get(`/admin/chapters/?subject_id=${subjectId || ''}&class_id=${classId || ''}`),
//   createChapter: (data) => api.post('/admin/chapters/create/', data),
//   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/update/`, data),
//   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/delete/`),
  
//   // Teacher Assignments
//   getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
//   createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
//   deleteTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/delete/`),
  
//   // Notifications
//   createNotification: (data) => api.post('/admin/notifications/create/', data),
//   getNotifications: () => api.get('/admin/notifications/'),
  
//   // Fee Payments
//   createFeePayment: (data) => api.post('/admin/fees/create/', data, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getFeePayments: () => api.get('/admin/fees/'),
//   getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
// };

// // ============ UTILITY APIs ============
// export const utilityAPI = {
//   uploadFile: (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     return api.post('/upload/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   },
// };

// export { api };







































// // // src/services/api.js
// // import axios from 'axios';

// // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // Create axios instance
// // const api = axios.create({
// //   baseURL: API_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// //   timeout: 15000,
// // });

// // // Add token to requests
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       config.headers.Authorization = `Token ${token}`; // ← CHANGED: Token not Bearer
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Handle response errors
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       localStorage.removeItem('token');
// //       localStorage.removeItem('user');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default api;

// // // ============ AUTH APIs ============
// // export const authAPI = {
// //   // Get registration data (classes & subjects)
// //   getRegistrationData: () => api.get('/users/registration-data/'),
  
// //   // Register
// //   register: (data) => api.post('/users/register/', data),
  
// //   // Verify registration OTP
// //   verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
// //   // Resend OTP
// //   resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
// //   // Login
// //   login: (data) => api.post('/users/login/', data),
  
// //   // Logout
// //   logout: () => api.post('/users/logout/'),
  
// //   // Forgot password
// //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
// //   // Reset password
// //   resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
// //   // Get profile
// //   getProfile: () => api.get('/users/profile/'),
// // };

// // // ============ STUDENT APIs ============
// // export const studentAPI = {
// //   // Home/Dashboard
// //   getHome: () => api.get('/students/home/'),
  
// //   // Subjects
// //   getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
  
// //   // Tests
// //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// //   startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
// //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// //   getMyAttempts: () => api.get('/students/my-test-attempts/'),
  
// //   // Attendance
// //   getAttendance: () => api.get('/students/my-attendance/'),
  
// //   // Fee Payments
// //   getFeePayments: () => api.get('/students/my-fee-payments/'),
  
// //   // Assignments
// //   getAssignments: () => api.get('/students/my-assignments/'),
  
// //   // Doubts
// //   createDoubt: (data) => api.post('/students/doubts/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getDoubts: () => api.get('/students/doubts/'),
// //   replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
  
// //   // Notifications
// //   getNotifications: () => api.get('/students/my-notifications/'),
  
// //   // Search
// //   search: (query) => api.get(`/students/search/?q=${query}`),
// // };

// // // ============ TEACHER APIs ============
// // export const teacherAPI = {
// //   // Home/Dashboard
// //   getHome: () => api.get('/teachers/home/'),
  
// //   // Classes & Subjects
// //   getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
// //   getChapters: (params) => api.get('/teachers/chapters/', { params }),
// //   markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
// //   // Tests
// //   getTests: (params) => api.get('/teachers/tests/', { params }),
// //   createTest: (data) => api.post('/teachers/tests/create/', data),
// //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// //   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
  
// //   // Questions
// //   createQuestion: (data) => api.post('/teachers/questions/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
// //   // Attendance
// //   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
// //   getAttendance: (params) => api.get('/teachers/attendance/', { params }),
// //   getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
// //   // Assignments
// //   createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getAssignments: (params) => api.get('/teachers/assignments/', { params }),
// //   getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
  
// //   // Doubts
// //   getDoubts: (params) => api.get('/teachers/doubts/', { params }),
// //   getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
// //   replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
  
// //   // Students
// //   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
// //   // Search
// //   search: (query) => api.get(`/teachers/search/?q=${query}`),
// // };

// // // ============ ADMIN APIs ============
// // export const adminAPI = {
// //   // Dashboard
// //   getStats: () => api.get('/admin/dashboard/stats/'),
  
// //   // User Management
// //   getPendingUsers: () => api.get('/admin/users/pending/'),
// //   approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
// //   rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
// //   getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
  
// //   // Classes
// //   getClasses: () => api.get('/admin/classes/'),
// //   createClass: (data) => api.post('/admin/classes/create/', data),
// //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
// //   // Subjects
// //   getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
// //   createSubject: (data) => api.post('/admin/subjects/create/', data),
// //   getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
  
// //   // Chapters
// //   getChapters: (subjectId, classId) => 
// //     api.get(`/admin/chapters/?subject_id=${subjectId}&class_id=${classId}`),
// //   createChapter: (data) => api.post('/admin/chapters/create/', data),
  
// //   // Teacher Assignments
// //   getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
// //   createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
  
// //   // Notifications
// //   createNotification: (data) => api.post('/admin/notifications/create/', data),
// //   getNotifications: () => api.get('/admin/notifications/'),
  
// //   // Fee Payments
// //   createFeePayment: (data) => api.post('/admin/fees/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getFeePayments: () => api.get('/admin/fees/'),
// //   getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
// // };

// // export { api };



































// // // import axios from 'axios';
// // // import toast from 'react-hot-toast';

// // // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // const api = axios.create({
// // //   baseURL: API_URL,
// // //   headers: {
// // //     'Content-Type': 'application/json',
// // //   },
// // //   timeout: 15000,
// // // });

// // // // Request interceptor
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     const token = localStorage.getItem('access_token');
// // //     if (token) {
// // //       config.headers.Authorization = `Bearer ${token}`;
// // //     }
// // //     return config;
// // //   },
// // //   (error) => Promise.reject(error)
// // // );

// // // // Response interceptor
// // // api.interceptors.response.use(
// // //   (response) => response,
// // //   async (error) => {
// // //     const originalRequest = error.config;

// // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // //       originalRequest._retry = true;

// // //       try {
// // //         const refreshToken = localStorage.getItem('refresh_token');
// // //         const response = await axios.post(`${API_URL}/users/token/refresh/`, {
// // //           refresh: refreshToken,
// // //         });

// // //         const { access } = response.data;
// // //         localStorage.setItem('access_token', access);
// // //         originalRequest.headers.Authorization = `Bearer ${access}`;
// // //         return api(originalRequest);
// // //       } catch (refreshError) {
// // //         localStorage.clear();
// // //         window.location.href = '/login';
// // //         return Promise.reject(refreshError);
// // //       }
// // //     }

// // //     return Promise.reject(error);
// // //   }
// // // );

// // // // AUTH ENDPOINTS
// // // export const authAPI = {
// // //   register: (data) => api.post('/users/register/', data),
// // //   login: (data) => api.post('/users/login/', data),
// // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// // //   verifyOTP: (email, otp) => api.post('/users/verify-otp/', { email, otp }),
// // //   resetPassword: (data) => api.post('/users/reset-password/', data),
// // //   getProfile: () => api.get('/users/profile/'),
// // //   updateProfile: (data) => api.patch('/users/profile/', data),
// // //   logout: () => {
// // //     localStorage.clear();
// // //     return Promise.resolve();
// // //   },
// // // };

// // // // STUDENT ENDPOINTS
// // // export const studentAPI = {
// // //   getDashboard: () => api.get('/students/dashboard/'),
// // //   getSubjects: () => api.get('/students/subjects/'),
// // //   getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
// // //   getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
// // //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// // //   getTestDetails: (testId) => api.get(`/students/tests/${testId}/`),
// // //   startTest: (testId) => api.post(`/students/tests/${testId}/start/`),
// // //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// // //   getMyTests: () => api.get('/students/my-tests/'),
// // //   getAttendance: () => api.get('/students/attendance/'),
// // //   getFees: () => api.get('/students/fees/'),
// // //   getAssignments: () => api.get('/students/assignments/'),
// // //   submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data),
// // //   getDoubts: () => api.get('/students/doubts/'),
// // //   postDoubt: (data) => api.post('/students/doubts/', data),
// // //   getNotifications: () => api.get('/students/notifications/'),
// // //   markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
// // // };

// // // // TEACHER ENDPOINTS
// // // export const teacherAPI = {
// // //   getDashboard: () => api.get('/teachers/dashboard/'),
// // //   getSubjects: () => api.get('/teachers/subjects/'),
// // //   getSubjectClasses: (subjectId) => api.get(`/teachers/subjects/${subjectId}/classes/`),
// // //   getChapters: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/chapters/`),
// // //   getChapterTests: (chapterId) => api.get(`/teachers/chapters/${chapterId}/tests/`),
// // //   createTest: (chapterId, data) => api.post(`/teachers/chapters/${chapterId}/tests/`, data),
// // //   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/`, data),
// // //   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/`),
// // //   getTestSubmissions: (testId) => api.get(`/teachers/tests/${testId}/submissions/`),
// // //   gradeTest: (attemptId, data) => api.post(`/teachers/test-attempts/${attemptId}/grade/`, data),
// // //   markAttendance: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`, data),
// // //   getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`),
// // //   getAssignments: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`),
// // //   createAssignment: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`, data),
// // //   getAssignmentSubmissions: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/submissions/`),
// // //   gradeAssignment: (submissionId, data) => api.post(`/teachers/submissions/${submissionId}/grade/`, data),
// // //   getDoubts: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/doubts/`),
// // //   answerDoubt: (doubtId, answer) => api.post(`/teachers/doubts/${doubtId}/answer/`, { answer }),
// // // };

// // // // ADMIN ENDPOINTS
// // // export const adminAPI = {
// // //   getDashboard: () => api.get('/admin/dashboard/'),
// // //   getUsers: () => api.get('/admin/users/'),
// // //   createUser: (data) => api.post('/admin/users/', data),
// // //   updateUser: (userId, data) => api.put(`/admin/users/${userId}/`, data),
// // //   deleteUser: (userId) => api.delete(`/admin/users/${userId}/`),
// // //   getClasses: () => api.get('/admin/classes/'),
// // //   createClass: (data) => api.post('/admin/classes/', data),
// // //   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/`, data),
// // //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/`),
// // //   getSubjects: () => api.get('/admin/subjects/'),
// // //   createSubject: (data) => api.post('/admin/subjects/', data),
// // //   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/`, data),
// // //   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/`),
// // //   getChapters: (subjectId) => api.get(`/admin/subjects/${subjectId}/chapters/`),
// // //   createChapter: (subjectId, data) => api.post(`/admin/subjects/${subjectId}/chapters/`, data),
// // //   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/`, data),
// // //   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/`),
// // //   enrollStudent: (data) => api.post('/admin/enrollments/', data),
// // //   removeEnrollment: (enrollmentId) => api.delete(`/admin/enrollments/${enrollmentId}/`),
// // //   assignTeacher: (data) => api.post('/admin/teacher-assignments/', data),
// // //   removeTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/`),
// // // };

// // // export default api;

























// // // // import axios from 'axios';

// // // // // Create axios instance
// // // // const api = axios.create({
// // // //   baseURL: 'http://localhost:8000', // Your Django backend URL
// // // //   headers: {
// // // //     'Content-Type': 'application/json',
// // // //   },
// // // //   timeout: 10000,
// // // // });

// // // // // Request interceptor
// // // // api.interceptors.request.use(
// // // //   (config) => {
// // // //     const token = localStorage.getItem('token');
// // // //     if (token) {
// // // //       config.headers.Authorization = `Token ${token}`;
// // // //     }
// // // //     return config;
// // // //   },
// // // //   (error) => {
// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // // Response interceptor
// // // // api.interceptors.response.use(
// // // //   (response) => response,
// // // //   (error) => {
// // // //     if (error.response?.status === 401) {
// // // //       // Unauthorized - clear auth and redirect to login
// // // //       localStorage.removeItem('token');
// // // //       localStorage.removeItem('user');
// // // //       window.location.href = '/login';
// // // //     }
// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // export default api;

// // // // // ═══════════════════════════════════════════════════
// // // // //  API HELPER FUNCTIONS
// // // // // ═══════════════════════════════════════════════════

// // // // // Auth APIs
// // // // export const authAPI = {
// // // //   login: (email, password) => api.post('/api/users/login/', { email, password }),
// // // //   register: (data) => api.post('/api/users/register/', data),
// // // //   verifyOTP: (email, otp) => api.post('/api/users/verify-registration-otp/', { email, otp }),
// // // //   resendOTP: (email) => api.post('/api/users/resend-otp/', { email }),
// // // //   forgotPassword: (email) => api.post('/api/users/forgot-password/', { email }),
// // // //   resetPassword: (email, otp, newPassword) => 
// // // //     api.post('/api/users/verify-otp-reset-password/', { email, otp, new_password: newPassword }),
// // // //   logout: () => api.post('/api/users/logout/'),
// // // //   getProfile: () => api.get('/api/users/profile/'),
// // // // };

// // // // // Student APIs
// // // // export const studentAPI = {
// // // //   getDashboard: () => api.get('/api/students/home/'),
// // // //   getSubjectDetails: (subjectId) => api.get(`/api/students/subjects/${subjectId}/`),
// // // //   getChapterTests: (chapterId) => api.get(`/api/students/chapters/${chapterId}/tests/`),
// // // //   startTest: (testId) => api.post(`/api/students/tests/${testId}/start/`),
// // // //   submitTest: (attemptId, answers) => 
// // // //     api.post(`/api/students/test-attempts/${attemptId}/submit/`, { answers }),
// // // //   getTestResult: (attemptId) => api.get(`/api/students/test-attempts/${attemptId}/result/`),
// // // //   getMyTests: () => api.get('/api/students/my-test-attempts/'),
// // // //   getAttendance: () => api.get('/api/students/my-attendance/'),
// // // //   getFees: () => api.get('/api/students/my-fee-payments/'),
// // // //   getAssignments: () => api.get('/api/students/my-assignments/'),
// // // //   createDoubt: (data) => api.post('/api/students/doubts/create/', data),
// // // //   getNotifications: () => api.get('/api/students/my-notifications/'),
// // // // };

// // // // // Teacher APIs
// // // // export const teacherAPI = {
// // // //   getDashboard: () => api.get('/api/teachers/home/'),
// // // //   getSubjectClasses: (subjectId) => api.get(`/api/teachers/subject/${subjectId}/classes/`),
// // // //   getChapters: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/chapters/`),
// // // //   markChapterComplete: (chapterId) => 
// // // //     api.post(`/api/teachers/chapters/${chapterId}/mark-complete/`),
// // // //   getTests: (chapterId) => api.get(`/api/teachers/chapter/${chapterId}/tests/`),
// // // //   createTest: (chapterId, data) => 
// // // //     api.post(`/api/teachers/chapter/${chapterId}/tests/create/`, data),
// // // //   getTestDetails: (testId) => api.get(`/api/teachers/tests/${testId}/`),
// // // //   createQuestion: (testId, data) => 
// // // //     api.post(`/api/teachers/tests/${testId}/questions/create/`, data),
// // // //   updateQuestion: (questionId, data) => 
// // // //     api.put(`/api/teachers/questions/${questionId}/update/`, data),
// // // //   deleteQuestion: (questionId) => api.delete(`/api/teachers/questions/${questionId}/delete/`),
// // // //   markAttendance: (classId, subjectId, data) => 
// // // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/mark/`, data),
// // // //   getAttendanceList: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/`),
// // // //   createAssignment: (classId, subjectId, data) => 
// // // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/create/`, data),
// // // //   getAssignments: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/`),
// // // //   getDoubts: (classId, subjectId) => 
// // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/doubts/`),
// // // //   replyDoubt: (doubtId, data) => 
// // // //     api.post(`/api/teachers/doubts/${doubtId}/reply/`, data),
// // // //   getClassStudents: (classId) => api.get(`/api/teachers/class/${classId}/students/`),
// // // // };

// // // // // Admin APIs
// // // // export const adminAPI = {
// // // //   getAllUsers: () => api.get('/api/admin/users/'),
// // // //   approveUser: (userId) => api.post(`/api/admin/users/${userId}/approve/`),
// // // //   createClass: (data) => api.post('/api/admin/classes/create/', data),
// // // //   getAllClasses: () => api.get('/api/admin/classes/'),
// // // //   createSubject: (data) => api.post('/api/admin/subjects/create/', data),
// // // //   getAllSubjects: () => api.get('/api/admin/subjects/'),
// // // //   createChapter: (data) => api.post('/api/admin/chapters/create/', data),
// // // //   getAllChapters: () => api.get('/api/admin/chapters/'),
// // // // };

// // // // // Utility APIs
// // // // export const utilityAPI = {
// // // //   getClasses: () => api.get('/api/users/classes/'),
// // // //   getSubjects: () => api.get('/api/users/subjects/'),
// // // // };



















// // // // // import axios from 'axios';

// // // // // const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // // // const api = axios.create({
// // // // //   baseURL: API_BASE_URL,
// // // // //   headers: {
// // // // //     'Content-Type': 'application/json',
// // // // //   },
// // // // // });

// // // // // // Request interceptor
// // // // // api.interceptors.request.use(
// // // // //   (config) => {
// // // // //     const token = localStorage.getItem('access_token');
// // // // //     if (token) {
// // // // //       config.headers.Authorization = `Bearer ${token}`;
// // // // //     }
// // // // //     return config;
// // // // //   },
// // // // //   (error) => Promise.reject(error)
// // // // // );

// // // // // // Response interceptor
// // // // // api.interceptors.response.use(
// // // // //   (response) => response,
// // // // //   async (error) => {
// // // // //     const originalRequest = error.config;

// // // // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // // // //       originalRequest._retry = true;

// // // // //       try {
// // // // //         const refreshToken = localStorage.getItem('refresh_token');
// // // // //         const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
// // // // //           refresh: refreshToken,
// // // // //         });

// // // // //         const { access } = response.data;
// // // // //         localStorage.setItem('access_token', access);
// // // // //         originalRequest.headers.Authorization = `Bearer ${access}`;
// // // // //         return api(originalRequest);
// // // // //       } catch (refreshError) {
// // // // //         localStorage.clear();
// // // // //         window.location.href = '/login';
// // // // //         return Promise.reject(refreshError);
// // // // //       }
// // // // //     }

// // // // //     return Promise.reject(error);
// // // // //   }
// // // // // );

// // // // // // Authentication API
// // // // // export const authAPI = {
// // // // //   register: (userData) => api.post('/users/register/', userData),
// // // // //   verifyOTP: (email, otp) => api.post('/users/verify-registration-otp/', { email, otp }),
// // // // //   resendOTP: (email) => api.post('/users/resend-otp/', { email }),
// // // // //   login: (identifier, password) => api.post('/users/login/', { identifier, password }),
// // // // //   logout: (refreshToken) => api.post('/users/logout/', { refresh_token: refreshToken }),
// // // // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// // // // //   resetPassword: (email, otp, newPassword) => 
// // // // //     api.post('/users/reset-password/', { email, otp, new_password: newPassword }),
// // // // //   getProfile: () => api.get('/users/me/'),
// // // // //   updateProfile: (userData) => api.put('/users/profile/', userData),
// // // // //   changePassword: (oldPassword, newPassword, newPasswordConfirm) => 
// // // // //     api.post('/users/change-password/', {
// // // // //       old_password: oldPassword,
// // // // //       new_password: newPassword,
// // // // //       new_password_confirm: newPasswordConfirm,
// // // // //     }),
// // // // // };

// // // // // // Student API
// // // // // export const studentAPI = {
// // // // //   getDashboard: () => api.get('/students/dashboard/'),
// // // // //   getAvailableTests: (params) => api.get('/students/available-tests/', { params }),
// // // // //   startTest: (testId) => api.get(`/students/start-test/${testId}/`),
// // // // //   submitTest: (testId, answers) => api.post(`/students/submit-test/${testId}/`, { answers }),
// // // // //   getTestAttempts: () => api.get('/students/test-attempts/'),
// // // // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/`),
// // // // //   getStatistics: () => api.get('/students/test-attempts/statistics/'),
// // // // //   getAttendance: (params) => api.get('/students/attendance/', { params }),
// // // // //   getAssignments: (params) => api.get('/students/assignments/', { params }),
// // // // //   getDoubts: () => api.get('/students/doubts/'),
// // // // //   postDoubt: (doubtData) => api.post('/students/doubts/', doubtData),
// // // // //   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
// // // // // };

// // // // // // Teacher API
// // // // // export const teacherAPI = {
// // // // //   getDashboard: () => api.get('/teachers/dashboard/'),
// // // // //   getAssignments: () => api.get('/teachers/assignments/my-assignments/'),
// // // // //   getTests: (params) => api.get('/teachers/tests/my-tests/', { params }),
// // // // //   createTest: (testData) => api.post('/teachers/tests/', testData),
// // // // //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// // // // //   addQuestion: (testId, questionData) => api.post(`/teachers/tests/${testId}/add-question/`, questionData),
// // // // //   getTestStatistics: (testId) => api.get(`/teachers/tests/${testId}/statistics/`),
// // // // //   markAttendance: (attendanceData) => api.post('/teachers/attendance/mark-bulk/', attendanceData),
// // // // //   getAttendanceByDate: (params) => api.get('/teachers/attendance/by-date/', { params }),
// // // // //   getStudentReport: (studentId, params) => api.get(`/teachers/attendance/student-report/${studentId}/`, { params }),
// // // // //   getClassReport: (classId, params) => api.get(`/teachers/attendance/class-report/${classId}/`, { params }),
// // // // //   createAssignment: (assignmentData) => api.post('/teachers/assignments/', assignmentData),
// // // // //   getDoubts: (params) => api.get('/teachers/doubts/my-subject-doubts/', { params }),
// // // // //   replyToDoubt: (doubtId, replyData) => api.post(`/teachers/doubts/${doubtId}/reply/`, replyData),
// // // // // };

// // // // // // Admin API
// // // // // export const adminAPI = {
// // // // //   getDashboard: () => api.get('/admin/dashboard/'),
// // // // //   getPendingUsers: () => api.get('/users/pending/'),
// // // // //   approveUser: (userId) => api.post(`/users/${userId}/approve/`),
// // // // //   rejectUser: (userId) => api.post(`/users/${userId}/reject/`),
// // // // //   getClasses: () => api.get('/admin/classes/'),
// // // // //   createClass: (classData) => api.post('/admin/classes/', classData),
// // // // //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// // // // //   getSubjects: () => api.get('/admin/subjects/'),
// // // // //   createSubject: (subjectData) => api.post('/admin/subjects/', subjectData),
// // // // //   getChapters: (params) => api.get('/admin/chapters/', { params }),
// // // // //   createChapter: (chapterData) => api.post('/admin/chapters/', chapterData),
// // // // //   markChapterComplete: (chapterId, isCompleted) => 
// // // // //     api.post(`/admin/chapters/${chapterId}/mark-completed/`, { is_completed: isCompleted }),
// // // // //   getFeePayments: (params) => api.get('/admin/fee-payments/', { params }),
// // // // //   createFeePayment: (paymentData) => api.post('/admin/fee-payments/', paymentData),
// // // // //   getNotifications: () => api.get('/admin/notifications/'),
// // // // //   createNotification: (notificationData) => api.post('/admin/notifications/', notificationData),
// // // // //   broadcastNotification: (message, role) => 
// // // // //     api.post('/admin/notifications/broadcast/', { message, role }),
// // // // // };

// // // // // export default api;



























// // // src/services/api.js
// // import axios from 'axios';

// // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // Create axios instance
// // const api = axios.create({
// //   baseURL: API_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// //   timeout: 15000,
// // });

// // // Add token to requests
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       config.headers.Authorization = `Token ${token}`; // Token not Bearer
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Handle response errors
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       localStorage.removeItem('token');
// //       localStorage.removeItem('user');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default api;

// // // ============ AUTH APIs ============
// // export const authAPI = {
// //   // Get registration data (classes & subjects)
// //   getRegistrationData: () => api.get('/users/registration-data/'),
  
// //   // Register
// //   register: (data) => api.post('/users/register/', data),
  
// //   // Verify registration OTP
// //   verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
// //   // Resend OTP
// //   resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
// //   // Login
// //   login: (data) => api.post('/users/login/', data),
  
// //   // Logout
// //   logout: () => api.post('/users/logout/'),
  
// //   // Forgot password
// //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
// //   // Reset password
// //   resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
// //   // Get profile
// //   getProfile: () => api.get('/users/profile/'),
// // };

// // // ============ STUDENT APIs ============
// // export const studentAPI = {
// //   // Dashboard - NEW! This is what was missing
// //   getDashboard: () => api.get('/students/home/'),
  
// //   // Home/Dashboard (alias for compatibility)
// //   getHome: () => api.get('/students/home/'),
  
// //   // Subjects
// //   getSubjects: () => api.get('/students/subjects/'),
// //   getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
// //   getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`), // Alias
  
// //   // Chapters
// //   getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
  
// //   // Tests
// //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// //   startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
// //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// //   getMyAttempts: () => api.get('/students/my-test-attempts/'),
// //   getMyTests: () => api.get('/students/my-test-attempts/'), // Alias
  
// //   // Attendance
// //   getAttendance: () => api.get('/students/my-attendance/'),
// //   getMyAttendance: () => api.get('/students/my-attendance/'), // Alias
  
// //   // Fee Payments
// //   getFeePayments: () => api.get('/students/my-fee-payments/'),
// //   getMyFees: () => api.get('/students/my-fee-payments/'), // Alias
  
// //   // Assignments
// //   getAssignments: () => api.get('/students/my-assignments/'),
// //   getMyAssignments: () => api.get('/students/my-assignments/'), // Alias
// //   submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
  
// //   // Doubts
// //   createDoubt: (data) => api.post('/students/doubts/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getDoubts: () => api.get('/students/doubts/'),
// //   getMyDoubts: () => api.get('/students/doubts/'), // Alias
// //   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
// //   replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
  
// //   // Notifications
// //   getNotifications: () => api.get('/students/my-notifications/'),
// //   getMyNotifications: () => api.get('/students/my-notifications/'), // Alias
// //   markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
  
// //   // Search
// //   search: (query) => api.get(`/students/search/?q=${query}`),
// // };

// // // ============ TEACHER APIs ============
// // export const teacherAPI = {
// //   // Dashboard - NEW! This is what was missing for teachers
// //   getDashboard: () => api.get('/teachers/home/'),
  
// //   // Home/Dashboard (alias for compatibility)
// //   getHome: () => api.get('/teachers/home/'),
  
// //   // Classes & Subjects
// //   getSubjects: () => api.get('/teachers/subjects/'),
// //   getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
// //   getClassChapters: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/chapters/`),
// //   getChapters: (params) => api.get('/teachers/chapters/', { params }),
// //   createChapter: (data) => api.post('/teachers/chapters/create/', data),
// //   markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
// //   // Tests
// //   getTests: (params) => api.get('/teachers/tests/', { params }),
// //   getChapterTests: (chapterId) => api.get(`/teachers/chapter/${chapterId}/tests/`),
// //   createTest: (data) => api.post('/teachers/tests/create/', data),
// //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// //   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
// //   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/update/`, data),
// //   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/delete/`),
  
// //   // Questions
// //   createQuestion: (data) => api.post('/teachers/questions/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
// //   // Attendance
// //   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
// //   getAttendance: (params) => api.get('/teachers/attendance/', { params }),
// //   getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/attendance/history/`, { params: { classId, subjectId } }),
// //   getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
// //   // Assignments
// //   createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getAssignments: (params) => api.get('/teachers/assignments/', { params }),
// //   getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
// //   gradeAssignment: (submissionId, data) => api.patch(`/teachers/assignment-submission/${submissionId}/grade/`, data),
  
// //   // Doubts
// //   getDoubts: (params) => api.get('/teachers/doubts/', { params }),
// //   getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
// //   replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
  
// //   // Students
// //   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
// //   // Search
// //   search: (query) => api.get(`/teachers/search/?q=${query}`),
// // };

// // // ============ ADMIN APIs ============
// // export const adminAPI = {
// //   // Dashboard
// //   getDashboard: () => api.get('/admin/dashboard/stats/'),
// //   getStats: () => api.get('/admin/dashboard/stats/'),
  
// //   // User Management
// //   getPendingUsers: () => api.get('/admin/users/pending/'),
// //   approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
// //   rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
// //   getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
// //   getUsers: () => api.get('/admin/users/all/'), // Alias
// //   deleteUser: (userId) => api.delete(`/admin/users/${userId}/delete/`),
  
// //   // Classes
// //   getClasses: () => api.get('/admin/classes/'),
// //   createClass: (data) => api.post('/admin/classes/create/', data),
// //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// //   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/update/`, data),
// //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
// //   // Subjects
// //   getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
// //   createSubject: (data) => api.post('/admin/subjects/create/', data),
// //   getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
// //   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/update/`, data),
// //   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/delete/`),
  
// //   // Chapters
// //   getChapters: (subjectId, classId) => 
// //     api.get(`/admin/chapters/?subject_id=${subjectId || ''}&class_id=${classId || ''}`),
// //   createChapter: (data) => api.post('/admin/chapters/create/', data),
// //   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/update/`, data),
// //   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/delete/`),
  
// //   // Teacher Assignments
// //   getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
// //   createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
// //   deleteTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/delete/`),
  
// //   // Notifications
// //   createNotification: (data) => api.post('/admin/notifications/create/', data),
// //   getNotifications: () => api.get('/admin/notifications/'),
  
// //   // Fee Payments
// //   createFeePayment: (data) => api.post('/admin/fees/create/', data, {
// //     headers: { 'Content-Type': 'multipart/form-data' }
// //   }),
// //   getFeePayments: () => api.get('/admin/fees/'),
// //   getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
// // };

// // // ============ UTILITY APIs ============
// // export const utilityAPI = {
// //   uploadFile: (file) => {
// //     const formData = new FormData();
// //     formData.append('file', file);
// //     return api.post('/upload/', formData, {
// //       headers: {
// //         'Content-Type': 'multipart/form-data',
// //       },
// //     });
// //   },
// // };

// // export { api };







































// // // // src/services/api.js
// // // import axios from 'axios';

// // // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // // Create axios instance
// // // const api = axios.create({
// // //   baseURL: API_URL,
// // //   headers: {
// // //     'Content-Type': 'application/json',
// // //   },
// // //   timeout: 15000,
// // // });

// // // // Add token to requests
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     const token = localStorage.getItem('token');
// // //     if (token) {
// // //       config.headers.Authorization = `Token ${token}`; // ← CHANGED: Token not Bearer
// // //     }
// // //     return config;
// // //   },
// // //   (error) => {
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // // Handle response errors
// // // api.interceptors.response.use(
// // //   (response) => response,
// // //   (error) => {
// // //     if (error.response?.status === 401) {
// // //       localStorage.removeItem('token');
// // //       localStorage.removeItem('user');
// // //       window.location.href = '/login';
// // //     }
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // export default api;

// // // // ============ AUTH APIs ============
// // // export const authAPI = {
// // //   // Get registration data (classes & subjects)
// // //   getRegistrationData: () => api.get('/users/registration-data/'),
  
// // //   // Register
// // //   register: (data) => api.post('/users/register/', data),
  
// // //   // Verify registration OTP
// // //   verifyRegistrationOTP: (data) => api.post('/users/verify-registration-otp/', data),
  
// // //   // Resend OTP
// // //   resendOTP: (email) => api.post('/users/resend-registration-otp/', { email }),
  
// // //   // Login
// // //   login: (data) => api.post('/users/login/', data),
  
// // //   // Logout
// // //   logout: () => api.post('/users/logout/'),
  
// // //   // Forgot password
// // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  
// // //   // Reset password
// // //   resetPassword: (data) => api.post('/users/verify-otp-reset-password/', data),
  
// // //   // Get profile
// // //   getProfile: () => api.get('/users/profile/'),
// // // };

// // // // ============ STUDENT APIs ============
// // // export const studentAPI = {
// // //   // Home/Dashboard
// // //   getHome: () => api.get('/students/home/'),
  
// // //   // Subjects
// // //   getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
  
// // //   // Tests
// // //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// // //   startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
// // //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// // //   getMyAttempts: () => api.get('/students/my-test-attempts/'),
  
// // //   // Attendance
// // //   getAttendance: () => api.get('/students/my-attendance/'),
  
// // //   // Fee Payments
// // //   getFeePayments: () => api.get('/students/my-fee-payments/'),
  
// // //   // Assignments
// // //   getAssignments: () => api.get('/students/my-assignments/'),
  
// // //   // Doubts
// // //   createDoubt: (data) => api.post('/students/doubts/create/', data, {
// // //     headers: { 'Content-Type': 'multipart/form-data' }
// // //   }),
// // //   getDoubts: () => api.get('/students/doubts/'),
// // //   replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data, {
// // //     headers: { 'Content-Type': 'multipart/form-data' }
// // //   }),
  
// // //   // Notifications
// // //   getNotifications: () => api.get('/students/my-notifications/'),
  
// // //   // Search
// // //   search: (query) => api.get(`/students/search/?q=${query}`),
// // // };

// // // // ============ TEACHER APIs ============
// // // export const teacherAPI = {
// // //   // Home/Dashboard
// // //   getHome: () => api.get('/teachers/home/'),
  
// // //   // Classes & Subjects
// // //   getSubjectClasses: (subjectId) => api.get(`/teachers/subject/${subjectId}/classes/`),
// // //   getChapters: (params) => api.get('/teachers/chapters/', { params }),
// // //   markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/mark-complete/`),
  
// // //   // Tests
// // //   getTests: (params) => api.get('/teachers/tests/', { params }),
// // //   createTest: (data) => api.post('/teachers/tests/create/', data),
// // //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// // //   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
  
// // //   // Questions
// // //   createQuestion: (data) => api.post('/teachers/questions/create/', data, {
// // //     headers: { 'Content-Type': 'multipart/form-data' }
// // //   }),
// // //   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/update/`, data, {
// // //     headers: { 'Content-Type': 'multipart/form-data' }
// // //   }),
// // //   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/delete/`),
  
// // //   // Attendance
// // //   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
// // //   getAttendance: (params) => api.get('/teachers/attendance/', { params }),
// // //   getStudentAttendance: (studentId, params) => api.get(`/teachers/students/${studentId}/attendance/`, { params }),
  
// // //   // Assignments
// // //   createAssignment: (data) => api.post('/teachers/assignments/create/', data, {
// // //     headers: { 'Content-Type': 'multipart/form-data' }
// // //   }),
// // //   getAssignments: (params) => api.get('/teachers/assignments/', { params }),
// // //   getAssignmentDetail: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/`),
  
// // //   // Doubts
// // //   getDoubts: (params) => api.get('/teachers/doubts/', { params }),
// // //   getDoubtDetail: (doubtId) => api.get(`/teachers/doubts/${doubtId}/`),
// // //   replyToDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data, {
// // //     headers: { 'Content-Type': 'multipart/form-data' }
// // //   }),
  
// // //   // Students
// // //   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  
// // //   // Search
// // //   search: (query) => api.get(`/teachers/search/?q=${query}`),
// // // };

// // // // ============ ADMIN APIs ============
// // // export const adminAPI = {
// // //   // Dashboard
// // //   getStats: () => api.get('/admin/dashboard/stats/'),
  
// // //   // User Management
// // //   getPendingUsers: () => api.get('/admin/users/pending/'),
// // //   approveUser: (userId) => api.post('/admin/users/approve/', { user_id: userId }),
// // //   rejectUser: (userId) => api.post('/admin/users/reject/', { user_id: userId }),
// // //   getAllUsers: (role) => api.get(`/admin/users/all/?role=${role || ''}`),
  
// // //   // Classes
// // //   getClasses: () => api.get('/admin/classes/'),
// // //   createClass: (data) => api.post('/admin/classes/create/', data),
// // //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// // //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/delete/`),
  
// // //   // Subjects
// // //   getSubjects: (classId) => api.get(`/admin/subjects/?class_id=${classId || ''}`),
// // //   createSubject: (data) => api.post('/admin/subjects/create/', data),
// // //   getSubjectDetail: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
  
// // //   // Chapters
// // //   getChapters: (subjectId, classId) => 
// // //     api.get(`/admin/chapters/?subject_id=${subjectId}&class_id=${classId}`),
// // //   createChapter: (data) => api.post('/admin/chapters/create/', data),
  
// // //   // Teacher Assignments
// // //   getTeacherAssignments: () => api.get('/admin/teacher-assignments/'),
// // //   createTeacherAssignment: (data) => api.post('/admin/teacher-assignments/create/', data),
  
// // //   // Notifications
// // //   createNotification: (data) => api.post('/admin/notifications/create/', data),
// // //   getNotifications: () => api.get('/admin/notifications/'),
  
// // //   // Fee Payments
// // //   createFeePayment: (data) => api.post('/admin/fees/create/', data, {
// // //     headers: { 'Content-Type': 'multipart/form-data' }
// // //   }),
// // //   getFeePayments: () => api.get('/admin/fees/'),
// // //   getFeePaymentDetail: (paymentId) => api.get(`/admin/fees/${paymentId}/`),
// // // };

// // // export { api };



































// // // // import axios from 'axios';
// // // // import toast from 'react-hot-toast';

// // // // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // // const api = axios.create({
// // // //   baseURL: API_URL,
// // // //   headers: {
// // // //     'Content-Type': 'application/json',
// // // //   },
// // // //   timeout: 15000,
// // // // });

// // // // // Request interceptor
// // // // api.interceptors.request.use(
// // // //   (config) => {
// // // //     const token = localStorage.getItem('access_token');
// // // //     if (token) {
// // // //       config.headers.Authorization = `Bearer ${token}`;
// // // //     }
// // // //     return config;
// // // //   },
// // // //   (error) => Promise.reject(error)
// // // // );

// // // // // Response interceptor
// // // // api.interceptors.response.use(
// // // //   (response) => response,
// // // //   async (error) => {
// // // //     const originalRequest = error.config;

// // // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // // //       originalRequest._retry = true;

// // // //       try {
// // // //         const refreshToken = localStorage.getItem('refresh_token');
// // // //         const response = await axios.post(`${API_URL}/users/token/refresh/`, {
// // // //           refresh: refreshToken,
// // // //         });

// // // //         const { access } = response.data;
// // // //         localStorage.setItem('access_token', access);
// // // //         originalRequest.headers.Authorization = `Bearer ${access}`;
// // // //         return api(originalRequest);
// // // //       } catch (refreshError) {
// // // //         localStorage.clear();
// // // //         window.location.href = '/login';
// // // //         return Promise.reject(refreshError);
// // // //       }
// // // //     }

// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // // AUTH ENDPOINTS
// // // // export const authAPI = {
// // // //   register: (data) => api.post('/users/register/', data),
// // // //   login: (data) => api.post('/users/login/', data),
// // // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// // // //   verifyOTP: (email, otp) => api.post('/users/verify-otp/', { email, otp }),
// // // //   resetPassword: (data) => api.post('/users/reset-password/', data),
// // // //   getProfile: () => api.get('/users/profile/'),
// // // //   updateProfile: (data) => api.patch('/users/profile/', data),
// // // //   logout: () => {
// // // //     localStorage.clear();
// // // //     return Promise.resolve();
// // // //   },
// // // // };

// // // // // STUDENT ENDPOINTS
// // // // export const studentAPI = {
// // // //   getDashboard: () => api.get('/students/dashboard/'),
// // // //   getSubjects: () => api.get('/students/subjects/'),
// // // //   getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
// // // //   getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
// // // //   getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
// // // //   getTestDetails: (testId) => api.get(`/students/tests/${testId}/`),
// // // //   startTest: (testId) => api.post(`/students/tests/${testId}/start/`),
// // // //   submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
// // // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
// // // //   getMyTests: () => api.get('/students/my-tests/'),
// // // //   getAttendance: () => api.get('/students/attendance/'),
// // // //   getFees: () => api.get('/students/fees/'),
// // // //   getAssignments: () => api.get('/students/assignments/'),
// // // //   submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit/`, data),
// // // //   getDoubts: () => api.get('/students/doubts/'),
// // // //   postDoubt: (data) => api.post('/students/doubts/', data),
// // // //   getNotifications: () => api.get('/students/notifications/'),
// // // //   markNotificationRead: (notificationId) => api.patch(`/students/notifications/${notificationId}/read/`),
// // // // };

// // // // // TEACHER ENDPOINTS
// // // // export const teacherAPI = {
// // // //   getDashboard: () => api.get('/teachers/dashboard/'),
// // // //   getSubjects: () => api.get('/teachers/subjects/'),
// // // //   getSubjectClasses: (subjectId) => api.get(`/teachers/subjects/${subjectId}/classes/`),
// // // //   getChapters: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/chapters/`),
// // // //   getChapterTests: (chapterId) => api.get(`/teachers/chapters/${chapterId}/tests/`),
// // // //   createTest: (chapterId, data) => api.post(`/teachers/chapters/${chapterId}/tests/`, data),
// // // //   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/`, data),
// // // //   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/`),
// // // //   getTestSubmissions: (testId) => api.get(`/teachers/tests/${testId}/submissions/`),
// // // //   gradeTest: (attemptId, data) => api.post(`/teachers/test-attempts/${attemptId}/grade/`, data),
// // // //   markAttendance: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`, data),
// // // //   getAttendanceHistory: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/attendance/`),
// // // //   getAssignments: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`),
// // // //   createAssignment: (classId, subjectId, data) => api.post(`/teachers/classes/${classId}/subjects/${subjectId}/assignments/`, data),
// // // //   getAssignmentSubmissions: (assignmentId) => api.get(`/teachers/assignments/${assignmentId}/submissions/`),
// // // //   gradeAssignment: (submissionId, data) => api.post(`/teachers/submissions/${submissionId}/grade/`, data),
// // // //   getDoubts: (classId, subjectId) => api.get(`/teachers/classes/${classId}/subjects/${subjectId}/doubts/`),
// // // //   answerDoubt: (doubtId, answer) => api.post(`/teachers/doubts/${doubtId}/answer/`, { answer }),
// // // // };

// // // // // ADMIN ENDPOINTS
// // // // export const adminAPI = {
// // // //   getDashboard: () => api.get('/admin/dashboard/'),
// // // //   getUsers: () => api.get('/admin/users/'),
// // // //   createUser: (data) => api.post('/admin/users/', data),
// // // //   updateUser: (userId, data) => api.put(`/admin/users/${userId}/`, data),
// // // //   deleteUser: (userId) => api.delete(`/admin/users/${userId}/`),
// // // //   getClasses: () => api.get('/admin/classes/'),
// // // //   createClass: (data) => api.post('/admin/classes/', data),
// // // //   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/`, data),
// // // //   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/`),
// // // //   getSubjects: () => api.get('/admin/subjects/'),
// // // //   createSubject: (data) => api.post('/admin/subjects/', data),
// // // //   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/`, data),
// // // //   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/`),
// // // //   getChapters: (subjectId) => api.get(`/admin/subjects/${subjectId}/chapters/`),
// // // //   createChapter: (subjectId, data) => api.post(`/admin/subjects/${subjectId}/chapters/`, data),
// // // //   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/`, data),
// // // //   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/`),
// // // //   enrollStudent: (data) => api.post('/admin/enrollments/', data),
// // // //   removeEnrollment: (enrollmentId) => api.delete(`/admin/enrollments/${enrollmentId}/`),
// // // //   assignTeacher: (data) => api.post('/admin/teacher-assignments/', data),
// // // //   removeTeacherAssignment: (assignmentId) => api.delete(`/admin/teacher-assignments/${assignmentId}/`),
// // // // };

// // // // export default api;

























// // // // // import axios from 'axios';

// // // // // // Create axios instance
// // // // // const api = axios.create({
// // // // //   baseURL: 'http://localhost:8000', // Your Django backend URL
// // // // //   headers: {
// // // // //     'Content-Type': 'application/json',
// // // // //   },
// // // // //   timeout: 10000,
// // // // // });

// // // // // // Request interceptor
// // // // // api.interceptors.request.use(
// // // // //   (config) => {
// // // // //     const token = localStorage.getItem('token');
// // // // //     if (token) {
// // // // //       config.headers.Authorization = `Token ${token}`;
// // // // //     }
// // // // //     return config;
// // // // //   },
// // // // //   (error) => {
// // // // //     return Promise.reject(error);
// // // // //   }
// // // // // );

// // // // // // Response interceptor
// // // // // api.interceptors.response.use(
// // // // //   (response) => response,
// // // // //   (error) => {
// // // // //     if (error.response?.status === 401) {
// // // // //       // Unauthorized - clear auth and redirect to login
// // // // //       localStorage.removeItem('token');
// // // // //       localStorage.removeItem('user');
// // // // //       window.location.href = '/login';
// // // // //     }
// // // // //     return Promise.reject(error);
// // // // //   }
// // // // // );

// // // // // export default api;

// // // // // // ═══════════════════════════════════════════════════
// // // // // //  API HELPER FUNCTIONS
// // // // // // ═══════════════════════════════════════════════════

// // // // // // Auth APIs
// // // // // export const authAPI = {
// // // // //   login: (email, password) => api.post('/api/users/login/', { email, password }),
// // // // //   register: (data) => api.post('/api/users/register/', data),
// // // // //   verifyOTP: (email, otp) => api.post('/api/users/verify-registration-otp/', { email, otp }),
// // // // //   resendOTP: (email) => api.post('/api/users/resend-otp/', { email }),
// // // // //   forgotPassword: (email) => api.post('/api/users/forgot-password/', { email }),
// // // // //   resetPassword: (email, otp, newPassword) => 
// // // // //     api.post('/api/users/verify-otp-reset-password/', { email, otp, new_password: newPassword }),
// // // // //   logout: () => api.post('/api/users/logout/'),
// // // // //   getProfile: () => api.get('/api/users/profile/'),
// // // // // };

// // // // // // Student APIs
// // // // // export const studentAPI = {
// // // // //   getDashboard: () => api.get('/api/students/home/'),
// // // // //   getSubjectDetails: (subjectId) => api.get(`/api/students/subjects/${subjectId}/`),
// // // // //   getChapterTests: (chapterId) => api.get(`/api/students/chapters/${chapterId}/tests/`),
// // // // //   startTest: (testId) => api.post(`/api/students/tests/${testId}/start/`),
// // // // //   submitTest: (attemptId, answers) => 
// // // // //     api.post(`/api/students/test-attempts/${attemptId}/submit/`, { answers }),
// // // // //   getTestResult: (attemptId) => api.get(`/api/students/test-attempts/${attemptId}/result/`),
// // // // //   getMyTests: () => api.get('/api/students/my-test-attempts/'),
// // // // //   getAttendance: () => api.get('/api/students/my-attendance/'),
// // // // //   getFees: () => api.get('/api/students/my-fee-payments/'),
// // // // //   getAssignments: () => api.get('/api/students/my-assignments/'),
// // // // //   createDoubt: (data) => api.post('/api/students/doubts/create/', data),
// // // // //   getNotifications: () => api.get('/api/students/my-notifications/'),
// // // // // };

// // // // // // Teacher APIs
// // // // // export const teacherAPI = {
// // // // //   getDashboard: () => api.get('/api/teachers/home/'),
// // // // //   getSubjectClasses: (subjectId) => api.get(`/api/teachers/subject/${subjectId}/classes/`),
// // // // //   getChapters: (classId, subjectId) => 
// // // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/chapters/`),
// // // // //   markChapterComplete: (chapterId) => 
// // // // //     api.post(`/api/teachers/chapters/${chapterId}/mark-complete/`),
// // // // //   getTests: (chapterId) => api.get(`/api/teachers/chapter/${chapterId}/tests/`),
// // // // //   createTest: (chapterId, data) => 
// // // // //     api.post(`/api/teachers/chapter/${chapterId}/tests/create/`, data),
// // // // //   getTestDetails: (testId) => api.get(`/api/teachers/tests/${testId}/`),
// // // // //   createQuestion: (testId, data) => 
// // // // //     api.post(`/api/teachers/tests/${testId}/questions/create/`, data),
// // // // //   updateQuestion: (questionId, data) => 
// // // // //     api.put(`/api/teachers/questions/${questionId}/update/`, data),
// // // // //   deleteQuestion: (questionId) => api.delete(`/api/teachers/questions/${questionId}/delete/`),
// // // // //   markAttendance: (classId, subjectId, data) => 
// // // // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/mark/`, data),
// // // // //   getAttendanceList: (classId, subjectId) => 
// // // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/attendance/`),
// // // // //   createAssignment: (classId, subjectId, data) => 
// // // // //     api.post(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/create/`, data),
// // // // //   getAssignments: (classId, subjectId) => 
// // // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/assignments/`),
// // // // //   getDoubts: (classId, subjectId) => 
// // // // //     api.get(`/api/teachers/class/${classId}/subject/${subjectId}/doubts/`),
// // // // //   replyDoubt: (doubtId, data) => 
// // // // //     api.post(`/api/teachers/doubts/${doubtId}/reply/`, data),
// // // // //   getClassStudents: (classId) => api.get(`/api/teachers/class/${classId}/students/`),
// // // // // };

// // // // // // Admin APIs
// // // // // export const adminAPI = {
// // // // //   getAllUsers: () => api.get('/api/admin/users/'),
// // // // //   approveUser: (userId) => api.post(`/api/admin/users/${userId}/approve/`),
// // // // //   createClass: (data) => api.post('/api/admin/classes/create/', data),
// // // // //   getAllClasses: () => api.get('/api/admin/classes/'),
// // // // //   createSubject: (data) => api.post('/api/admin/subjects/create/', data),
// // // // //   getAllSubjects: () => api.get('/api/admin/subjects/'),
// // // // //   createChapter: (data) => api.post('/api/admin/chapters/create/', data),
// // // // //   getAllChapters: () => api.get('/api/admin/chapters/'),
// // // // // };

// // // // // // Utility APIs
// // // // // export const utilityAPI = {
// // // // //   getClasses: () => api.get('/api/users/classes/'),
// // // // //   getSubjects: () => api.get('/api/users/subjects/'),
// // // // // };



















// // // // // // import axios from 'axios';

// // // // // // const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // // // // // const api = axios.create({
// // // // // //   baseURL: API_BASE_URL,
// // // // // //   headers: {
// // // // // //     'Content-Type': 'application/json',
// // // // // //   },
// // // // // // });

// // // // // // // Request interceptor
// // // // // // api.interceptors.request.use(
// // // // // //   (config) => {
// // // // // //     const token = localStorage.getItem('access_token');
// // // // // //     if (token) {
// // // // // //       config.headers.Authorization = `Bearer ${token}`;
// // // // // //     }
// // // // // //     return config;
// // // // // //   },
// // // // // //   (error) => Promise.reject(error)
// // // // // // );

// // // // // // // Response interceptor
// // // // // // api.interceptors.response.use(
// // // // // //   (response) => response,
// // // // // //   async (error) => {
// // // // // //     const originalRequest = error.config;

// // // // // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // // // // //       originalRequest._retry = true;

// // // // // //       try {
// // // // // //         const refreshToken = localStorage.getItem('refresh_token');
// // // // // //         const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
// // // // // //           refresh: refreshToken,
// // // // // //         });

// // // // // //         const { access } = response.data;
// // // // // //         localStorage.setItem('access_token', access);
// // // // // //         originalRequest.headers.Authorization = `Bearer ${access}`;
// // // // // //         return api(originalRequest);
// // // // // //       } catch (refreshError) {
// // // // // //         localStorage.clear();
// // // // // //         window.location.href = '/login';
// // // // // //         return Promise.reject(refreshError);
// // // // // //       }
// // // // // //     }

// // // // // //     return Promise.reject(error);
// // // // // //   }
// // // // // // );

// // // // // // // Authentication API
// // // // // // export const authAPI = {
// // // // // //   register: (userData) => api.post('/users/register/', userData),
// // // // // //   verifyOTP: (email, otp) => api.post('/users/verify-registration-otp/', { email, otp }),
// // // // // //   resendOTP: (email) => api.post('/users/resend-otp/', { email }),
// // // // // //   login: (identifier, password) => api.post('/users/login/', { identifier, password }),
// // // // // //   logout: (refreshToken) => api.post('/users/logout/', { refresh_token: refreshToken }),
// // // // // //   forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
// // // // // //   resetPassword: (email, otp, newPassword) => 
// // // // // //     api.post('/users/reset-password/', { email, otp, new_password: newPassword }),
// // // // // //   getProfile: () => api.get('/users/me/'),
// // // // // //   updateProfile: (userData) => api.put('/users/profile/', userData),
// // // // // //   changePassword: (oldPassword, newPassword, newPasswordConfirm) => 
// // // // // //     api.post('/users/change-password/', {
// // // // // //       old_password: oldPassword,
// // // // // //       new_password: newPassword,
// // // // // //       new_password_confirm: newPasswordConfirm,
// // // // // //     }),
// // // // // // };

// // // // // // // Student API
// // // // // // export const studentAPI = {
// // // // // //   getDashboard: () => api.get('/students/dashboard/'),
// // // // // //   getAvailableTests: (params) => api.get('/students/available-tests/', { params }),
// // // // // //   startTest: (testId) => api.get(`/students/start-test/${testId}/`),
// // // // // //   submitTest: (testId, answers) => api.post(`/students/submit-test/${testId}/`, { answers }),
// // // // // //   getTestAttempts: () => api.get('/students/test-attempts/'),
// // // // // //   getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/`),
// // // // // //   getStatistics: () => api.get('/students/test-attempts/statistics/'),
// // // // // //   getAttendance: (params) => api.get('/students/attendance/', { params }),
// // // // // //   getAssignments: (params) => api.get('/students/assignments/', { params }),
// // // // // //   getDoubts: () => api.get('/students/doubts/'),
// // // // // //   postDoubt: (doubtData) => api.post('/students/doubts/', doubtData),
// // // // // //   getDoubtDetail: (doubtId) => api.get(`/students/doubts/${doubtId}/`),
// // // // // // };

// // // // // // // Teacher API
// // // // // // export const teacherAPI = {
// // // // // //   getDashboard: () => api.get('/teachers/dashboard/'),
// // // // // //   getAssignments: () => api.get('/teachers/assignments/my-assignments/'),
// // // // // //   getTests: (params) => api.get('/teachers/tests/my-tests/', { params }),
// // // // // //   createTest: (testData) => api.post('/teachers/tests/', testData),
// // // // // //   getTestDetail: (testId) => api.get(`/teachers/tests/${testId}/`),
// // // // // //   addQuestion: (testId, questionData) => api.post(`/teachers/tests/${testId}/add-question/`, questionData),
// // // // // //   getTestStatistics: (testId) => api.get(`/teachers/tests/${testId}/statistics/`),
// // // // // //   markAttendance: (attendanceData) => api.post('/teachers/attendance/mark-bulk/', attendanceData),
// // // // // //   getAttendanceByDate: (params) => api.get('/teachers/attendance/by-date/', { params }),
// // // // // //   getStudentReport: (studentId, params) => api.get(`/teachers/attendance/student-report/${studentId}/`, { params }),
// // // // // //   getClassReport: (classId, params) => api.get(`/teachers/attendance/class-report/${classId}/`, { params }),
// // // // // //   createAssignment: (assignmentData) => api.post('/teachers/assignments/', assignmentData),
// // // // // //   getDoubts: (params) => api.get('/teachers/doubts/my-subject-doubts/', { params }),
// // // // // //   replyToDoubt: (doubtId, replyData) => api.post(`/teachers/doubts/${doubtId}/reply/`, replyData),
// // // // // // };

// // // // // // // Admin API
// // // // // // export const adminAPI = {
// // // // // //   getDashboard: () => api.get('/admin/dashboard/'),
// // // // // //   getPendingUsers: () => api.get('/users/pending/'),
// // // // // //   approveUser: (userId) => api.post(`/users/${userId}/approve/`),
// // // // // //   rejectUser: (userId) => api.post(`/users/${userId}/reject/`),
// // // // // //   getClasses: () => api.get('/admin/classes/'),
// // // // // //   createClass: (classData) => api.post('/admin/classes/', classData),
// // // // // //   getClassDetail: (classId) => api.get(`/admin/classes/${classId}/`),
// // // // // //   getSubjects: () => api.get('/admin/subjects/'),
// // // // // //   createSubject: (subjectData) => api.post('/admin/subjects/', subjectData),
// // // // // //   getChapters: (params) => api.get('/admin/chapters/', { params }),
// // // // // //   createChapter: (chapterData) => api.post('/admin/chapters/', chapterData),
// // // // // //   markChapterComplete: (chapterId, isCompleted) => 
// // // // // //     api.post(`/admin/chapters/${chapterId}/mark-completed/`, { is_completed: isCompleted }),
// // // // // //   getFeePayments: (params) => api.get('/admin/fee-payments/', { params }),
// // // // // //   createFeePayment: (paymentData) => api.post('/admin/fee-payments/', paymentData),
// // // // // //   getNotifications: () => api.get('/admin/notifications/'),
// // // // // //   createNotification: (notificationData) => api.post('/admin/notifications/', notificationData),
// // // // // //   broadcastNotification: (message, role) => 
// // // // // //     api.post('/admin/notifications/broadcast/', { message, role }),
// // // // // // };

// // // // // // export default api;