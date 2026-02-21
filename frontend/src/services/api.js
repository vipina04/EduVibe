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
    
    // If sending FormData, delete Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
  
  // Google OAuth Login - NEW!
  googleAuth: (credential, role = 'student') => 
    api.post('/users/auth/google/', { credential, role }),
  
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
  // Dashboard
  getDashboard: () => api.get('/students/home/'),
  getHome: () => api.get('/students/home/'), // Alias
  
  // Subjects
  getSubjects: () => api.get('/students/subjects/'),
  getSubjectDetail: (subjectId) => api.get(`/students/subjects/${subjectId}/`),
  getSubjectDetails: (subjectId) => api.get(`/students/subjects/${subjectId}/`), // Alias
  getEnrolledSubjects: () => api.get('/students/subjects/'),  // Fixed to match backend route
  getSubjectChapters: (subjectId) => api.get(`/students/subject/${subjectId}/`),
  
  // Chapters
  getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
  
  // Tests
  getChapters: (subjectId) => api.get(`/students/subjects/${subjectId}/chapters/`),
  getChapterTests: (chapterId) => api.get(`/students/chapters/${chapterId}/tests/`),
  startTest: (testId) => api.get(`/students/tests/${testId}/start/`),
  // submitTest: (attemptId, answers) => api.post(`/students/test-attempts/${attemptId}/submit/`, { answers }),
  submitTest: (testId, answers) => api.post(`/students/test-attempts/${testId}/submit/`, { answers }),
  getTestResult: (attemptId) => api.get(`/students/test-attempts/${attemptId}/result/`),
  getMyAttempts: () => api.get('/students/my-test-attempts/'),
  
  // Notes
  getNotes: (chapterId) => api.get(`/students/chapters/${chapterId}/notes/`),
  
  // Doubts
  getDoubts: () => api.get('/students/doubts/'),
  getMyDoubts: () => api.get('/students/doubts/'),  // Alias for consistency
  postDoubt: (data) => api.post('/students/doubts/', data),
  createDoubt: (data) => api.post('/students/doubts/create/', data),
  replyToDoubt: (doubtId, data) => api.post(`/students/doubts/${doubtId}/reply/`, data),
  
  // Assignments
  getAssignments: () => api.get('/students/assignments/'),
  submitAssignment: (assignmentId, data) => 
    api.post(`/students/assignments/${assignmentId}/submit/`, data),
  
  // Profile & Settings
  getProfile: () => api.get('/students/profile/'),
  updateProfile: (data) => api.put('/students/profile/', data),
  
  // Performance
  getPerformance: () => api.get('/students/performance/'),
  
  // Notifications
  getNotifications: () => api.get('/students/notifications/'),
  markNotificationRead: (notificationId) => 
    api.post(`/students/notifications/${notificationId}/mark-read/`),

  markAllNotificationsRead: () => api.post('/students/notifications/mark-all-read/'),

  // Attendance
  getMyAttendance: (params) => api.get('/students/my-attendance/', { params }),
  getAttendance: (params) => api.get('/students/my-attendance/', { params }), 
};

// ============ TEACHER APIs ============
// export const teacherAPI = {
//   // Dashboard
//   getDashboard: () => api.get('/teachers/home/'),

//   // Classes & Subjects — RESTORED from original working version
//   getMyClasses: () => api.get('/teachers/my-classes/'),
//   getMySubjects: () => api.get('/teachers/my-subjects/'),
//   getClassSubject: (classId, subjectId) => 
//     api.get(`/teachers/class/${classId}/subject/${subjectId}/`),

//   // ✅ NEW — correct endpoints used by TeacherDoubts, TeacherClasses etc.
//   getClasses: () => api.get('/teachers/classes/'),
//   getSubjects: (params) => api.get('/teachers/subjects/', { params }),
//   getClassSubjects: (classId) => api.get(`/teachers/class/${classId}/subjects/`),
  
//   // Students
//   getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
//   getStudentProfile: (studentId) => api.get(`/teachers/students/${studentId}/profile/`),
  
//   // Tests
//   getMyTests: () => api.get('/teachers/tests/'),
//   createTest: (data) => api.post('/teachers/tests/create/', data),
//   getTestDetails: (testId) => api.get(`/teachers/tests/${testId}/`),
//   updateTest: (testId, data) => api.put(`/teachers/tests/${testId}/`, data),
//   deleteTest: (testId) => api.delete(`/teachers/tests/${testId}/`),
//   getTestResults: (testId) => api.get(`/teachers/tests/${testId}/results/`),
  
//   // Questions
//   addQuestion: (testId, data) => api.post(`/teachers/tests/${testId}/add-question/`, data),
//   updateQuestion: (questionId, data) => api.put(`/teachers/questions/${questionId}/`, data),
//   deleteQuestion: (questionId) => api.delete(`/teachers/questions/${questionId}/`),
  
//   // Notes
//   createNote: (data) => api.post('/teachers/notes/create/', data),
//   getMyNotes: () => api.get('/teachers/notes/'),
//   updateNote: (noteId, data) => api.put(`/teachers/notes/${noteId}/`, data),
//   deleteNote: (noteId) => api.delete(`/teachers/notes/${noteId}/`),
  
//   // Assignments
//   createAssignment: (data) => api.post('/teachers/assignments/create/', data),
//   getAssignments: () => api.get('/teachers/assignments/'),    // ✅ ADDED — was missing
//   getMyAssignments: () => api.get('/teachers/assignments/'),  // alias
//   getAssignmentSubmissions: (assignmentId) => 
//     api.get(`/teachers/assignments/${assignmentId}/submissions/`),
//   gradeSubmission: (submissionId, data) => 
//     api.post(`/teachers/submissions/${submissionId}/grade/`, data),
  
//   // Doubts — RESTORED original async pattern that returned response.data
//   // (kept for any code that relied on the old pattern)
//   getDoubts: async (params) => {
//     const response = await api.get('/teachers/doubts/', { params });
//     return response;   // returns full response so .data works on callers
//   },
//   replyToDoubt: async (doubtId, formData) => {
//     const response = await api.post(`/teachers/doubts/${doubtId}/reply/`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response;
//   },

//   // Old doubts endpoints (keeping for compatibility)
//   replyDoubt: (doubtId, data) => api.post(`/teachers/doubts/${doubtId}/reply/`, data),
  
//   // Attendance
//   markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
//   getAttendance: (classId, date) => 
//     api.get(`/teachers/class/${classId}/attendance/`, { params: { date } }),
  
//   // Performance
//   getClassPerformance: (classId) => api.get(`/teachers/class/${classId}/performance/`),
//   getStudentPerformance: (studentId) => 
//     api.get(`/teachers/students/${studentId}/performance/`),
  
//   // Profile
//   getProfile: () => api.get('/teachers/profile/'),
//   updateProfile: (data) => api.put('/teachers/profile/', data),
  
//   // Notifications
//   getNotifications: () => api.get('/teachers/notifications/'),
//   markNotificationRead: (notificationId) => 
//     api.post(`/teachers/notifications/${notificationId}/mark-read/`),
// };
export const teacherAPI = {
  // Dashboard
  getDashboard: () => api.get('/teachers/home/'),

  // Classes & Subjects
  getMyClasses: () => api.get('/teachers/my-classes/'),
  getMySubjects: () => api.get('/teachers/my-subjects/'),
  getClassSubject: (classId, subjectId) =>
    api.get(`/teachers/class/${classId}/subject/${subjectId}/`),

  // ✅ FIXED — uses correct endpoints matching our backend logic
  // getClasses: async () => {
  //   const response = await api.get('/teachers/teacher-assigned-classes/');
  //   // Backend returns { success: true, classes: [...] }
  //   const data = response.data?.classes || [];
  //   return { data: Array.isArray(data) ? data : [] };
  // },
  getClasses: () => api.get('/teachers/classes/'),
  getSubjects: (params) => api.get('/teachers/subjects/', { params }),
  getClassSubjects: (classId) => api.get(`/teachers/class/${classId}/subjects/`),

  // Students
  getClassStudents: (classId) => api.get(`/teachers/class/${classId}/students/`),
  getStudentProfile: (studentId) => api.get(`/teachers/students/${studentId}/profile/`),

  // Chapters
getChapters: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/chapters/`),
markChapterComplete: (chapterId) => api.post(`/teachers/chapters/${chapterId}/complete/`),

  // Tests
  getMyTests:     ()              => api.get('/teachers/tests/'),
  createTest:     (data)          => api.post('/teachers/tests/create/', data),
  getTestDetails: (testId)        => api.get(`/teachers/tests/${testId}/`),
  updateTest:     (testId, data)  => api.put(`/teachers/tests/${testId}/`, data),
  deleteTest:     (testId)        => api.delete(`/teachers/tests/${testId}/`),
  getTestResults: (testId)        => api.get(`/teachers/tests/${testId}/results/`),
  getSubjectClasses: (subjectId) => api.get('/teachers/subject-classes/', { params: { subject_id: subjectId } }),
  getClassChapters: (classId, subjectId) => api.get(`/teachers/class/${classId}/subject/${subjectId}/chapters/`),  
  // ADD these two lines inside the teacherAPI object:
  getAllTests: () => api.get('/teachers/tests/all/'),
  getAttendanceHistory: (params) => api.get('/teachers/attendance/history/', { params }), 

  // Questions
  addQuestion:    (testId, data)      => api.post(`/teachers/tests/${testId}/add-question/`, data),
  updateQuestion: (questionId, data)  => api.put(`/teachers/questions/${questionId}/`, data),
  deleteQuestion: (questionId)        => api.delete(`/teachers/questions/${questionId}/`),

  // Notes
  createNote: (data)          => api.post('/teachers/notes/create/', data),
  getMyNotes: ()              => api.get('/teachers/notes/'),
  updateNote: (noteId, data)  => api.put(`/teachers/notes/${noteId}/`, data),
  deleteNote: (noteId)        => api.delete(`/teachers/notes/${noteId}/`),

  // Assignments
  createAssignment:       (data)          => api.post('/teachers/assignments/create/', data),
  getAssignments:         ()              => api.get('/teachers/assignments/'),
  getMyAssignments:       ()              => api.get('/teachers/assignments/'),
  getAssignmentSubmissions: (assignmentId) =>
    api.get(`/teachers/assignments/${assignmentId}/submissions/`),
  gradeSubmission: (submissionId, data)   =>
    api.post(`/teachers/submissions/${submissionId}/grade/`, data),

  // ✅ FIXED Doubts — correct endpoints + normalized response
  getDoubts: async (params) => {
    const response = await api.get('/teachers/teacher-doubts/', { params });
    // Backend returns { success: true, doubts: [...] }
    const data = response.data?.doubts || [];
    return { data: Array.isArray(data) ? data : [] };
  },
  replyToDoubt: async (doubtId, formData) => {
    const response = await api.post(
      `/teachers/teacher-doubts/${doubtId}/reply/`,
      formData
    );
    return response;
  },
  replyDoubt: (doubtId, data) =>
    api.post(`/teachers/teacher-doubts/${doubtId}/reply/`, data),

  // Attendance
  markAttendance: (data) => api.post('/teachers/attendance/mark/', data),
  getAttendance:  (classId, date) =>
    api.get(`/teachers/class/${classId}/attendance/`, { params: { date } }),

  // Performance
  getClassPerformance:   (classId)   => api.get(`/teachers/class/${classId}/performance/`),
  getStudentPerformance: (studentId) => api.get(`/teachers/students/${studentId}/performance/`),

  // Profile
  getProfile:    ()     => api.get('/teachers/profile/'),
  updateProfile: (data) => api.put('/teachers/profile/', data),

  // Notifications
  getNotifications:     ()                => api.get('/teachers/notifications/'),
  markNotificationRead: (notificationId)  =>
    api.post(`/teachers/notifications/${notificationId}/mark-read/`),
  markAllNotificationsRead: () => api.post('/teachers/notifications/mark-all-read/'),
};
// ============ ADMIN APIs ============


export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard/'),
  getDashboardStats: () => api.get('/admin/dashboard/stats/'),
  
  // User Management
//   getPendingUsers: () => api.get('/admin/pending-users/'),
//   approveUser: (userId) => api.post(`/admin/users/${userId}/approve/`),
//   rejectUser: (userId) => api.post(`/admin/users/${userId}/reject/`),
//   getAllUsers: () => api.get('/admin/users/'),
//   getUserDetails: (userId) => api.get(`/admin/users/${userId}/`),


  getPendingUsers:  ()               => api.get('/admin/users/pending/'),
  getAllUsers:       (role)           => api.get(`/admin/users/all/${role ? `?role=${role}` : ''}`),
  approveUser:      (userId)         => api.post('/admin/users/approve/', { user_id: userId }),
  rejectUser:       (userId)         => api.post('/admin/users/reject/',  { user_id: userId }),
  deleteUser:       (userId)         => api.delete(`/admin/users/${userId}/delete/`),
  updateUser:       (userId, data)   => api.patch(`/admin/users/${userId}/update/`, data),








  
  // Class Management

//  getClasses:    ()               => api.get('/admin/classes/'),
//  getAllClasses: ()               => api.get('/admin/classes/'),
//   createClass:   (data)           => api.post('/admin/classes/', data),
//   updateClass:   (id, data)       => api.patch(`/admin/classes/${id}/`, data),
//   deleteClass:   (id)             => api.delete(`/admin/classes/${id}/`),
  getClasses:             ()               => api.get('/admin/classes/'),
  getAllClasses:           ()               => api.get('/admin/classes/'),
  getClassDetail:         (id)             => api.get(`/admin/classes/${id}/`),
  createClass:            (data)           => api.post('/admin/classes/', data),
  updateClass:            (id, data)       => api.patch(`/admin/classes/${id}/`, data),
  deleteClass:            (id)             => api.delete(`/admin/classes/${id}/`),

  // Academic Subject management (subjects inside a class)
  addSubjectToClass:      (data)           => api.post('/admin/academic-subjects/', data),
  updateAcademicSubject:  (id, data)       => api.patch(`/admin/academic-subjects/${id}/`, data),
  deleteAcademicSubject:  (id)             => api.delete(`/admin/academic-subjects/${id}/`),




//   createClass: (data) => api.post('/admin/classes/create/', data),
  
//   getClassDetails: (classId) => api.get(`/admin/classes/${classId}/`),
//   updateClass: (classId, data) => api.put(`/admin/classes/${classId}/`, data),
//   deleteClass: (classId) => api.delete(`/admin/classes/${classId}/`),
  
  // Subject Management
  getSubjects:   ()               => api.get('/admin/subjects/'),
  createSubject: (data)           => api.post('/admin/subjects/create/', data),
  updateSubject: (id, data)       => api.patch(`/admin/subjects/${id}/`, data),
  deleteSubject: (id)             => api.delete(`/admin/subjects/${id}/`),
//   createSubject: (data) => api.post('/admin/subjects/create/', data),
   getAllSubjects: () => api.get('/admin/subjects/'),
//   getSubjectDetails: (subjectId) => api.get(`/admin/subjects/${subjectId}/`),
//   updateSubject: (subjectId, data) => api.put(`/admin/subjects/${subjectId}/`, data),
//   deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}/`),
  
  // Chapter Management

  getChapters:   ()               => api.get('/admin/chapters/'),
  createChapter: (data)           => api.post('/admin/chapters/create/', data),
  updateChapter: (id, data)       => api.patch(`/admin/chapters/${id}/`, data),
  deleteChapter: (id)             => api.delete(`/admin/chapters/${id}/`),




//   createChapter: (data) => api.post('/admin/chapters/create/', data),
   getAllChapters: () => api.get('/admin/chapters/'),
//   getChapterDetails: (chapterId) => api.get(`/admin/chapters/${chapterId}/`),
//   updateChapter: (chapterId, data) => api.put(`/admin/chapters/${chapterId}/`, data),
//   deleteChapter: (chapterId) => api.delete(`/admin/chapters/${chapterId}/`),
  
  // Fee Management
  recordFeePayment: (data) => api.post('/admin/fees/record-payment/', data),
  getFeePayments: () => api.get('/admin/fees/payments/'),
  getStudentFees: (studentId) => api.get(`/admin/fees/student/${studentId}/`),
  
  // Reports
  getSystemReports: () => api.get('/admin/reports/system/'),
  getPerformanceReports: () => api.get('/admin/reports/performance/'),
  
  // Notifications
  sendNotification: (data) => api.post('/admin/notifications/send/', data),
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast/', data),
  
  // Settings
  getSettings: () => api.get('/admin/settings/'),
  updateSettings: (data) => api.put('/admin/settings/', data),
};



