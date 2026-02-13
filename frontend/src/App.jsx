import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CompleteProfilePage from './pages/CompleteProfilePage';

// Student Pages

import SubjectTests from './pages/student/SubjectTests';
import StudentDashboard from './pages/student/StudentDashboard';
import SubjectDetails from './pages/student/SubjectDetails';
import ChapterTests from './pages/student/ChapterTests';
import TakeTest from './pages/student/TakeTest';
import TestResult from './pages/student/TestResult';
import MyTests from './pages/student/MyTests';
import MyAttendance from './pages/student/MyAttendance';
import MyFees from './pages/student/MyFees';
import MyAssignments from './pages/student/MyAssignments';
import StudentDoubts from './pages/student/StudentDoubts';
import StudentNotifications from './pages/student/StudentNotifications';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherMyClasses from './pages/teacher/TeacherMyClasses';
import TeacherClassSubjects from './pages/teacher/TeacherClassSubjects';
import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
import TeacherChapters from './pages/teacher/TeacherChapters';
import TeacherChapterTests from './pages/teacher/TeacherChapterTests';
import TeacherAllTests from './pages/teacher/TeacherAllTests';
import CreateTest from './pages/teacher/CreateTest';
import TestManagement from './pages/teacher/TestManagement';
import AttendanceSheet from './pages/teacher/AttendanceSheet';
import MarkAttendance from './pages/teacher/MarkAttendance';
import AttendanceHistory from './pages/teacher/AttendanceHistory';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherDoubts from './pages/teacher/TeacherDoubts';
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherTestSelection from './pages/teacher/TeacherTestSelection';
import TeacherChapterSelection from './pages/teacher/TeacherChapterSelection';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageClasses from './pages/admin/ManageClasses';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageChapters from './pages/admin/ManageChapters';

// ── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, authReady } = useAuth();
  if (!authReady || loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/"                element={<LandingPage />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />

      {/* ── Student ── */}
      <Route path="/student/dashboard"                        element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/subject/:subjectId"               element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
      <Route path="/student/chapter/:chapterId/tests"         element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
      <Route path="/student/test/:testId/take"                element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
      <Route path="/student/test-attempt/:attemptId/result"   element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
      {/* <Route path="/student/my-tests"                         element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} /> */}
      <Route path="/student/attendance"                       element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
      <Route path="/student/fees"                             element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
      <Route path="/student/assignments"                      element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
      <Route path="/student/doubts"                           element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
      <Route path="/student/notifications"                    element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />
      {/* Student Routes */}
      <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
      <Route path="/student/subject/:subjectId/tests" element={<ProtectedRoute allowedRoles={['student']}><SubjectTests /></ProtectedRoute>} />
      <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
      <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />

      {/* ── Teacher ── */}
      <Route path="/teacher/dashboard"    element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/subjects"     element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjects /></ProtectedRoute>} />
      <Route path="/teacher/students"     element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudents /></ProtectedRoute>} />
      <Route path="/teacher/assignments"  element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
      <Route path="/teacher/doubts"       element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />
      <Route path="/teacher/tests"        element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAllTests /></ProtectedRoute>} />

      {/* Teacher — Classes flow */}
      <Route path="/teacher/classes"                                      element={<ProtectedRoute allowedRoles={['teacher']}><TeacherMyClasses /></ProtectedRoute>} />
      <Route path="/teacher/class/:classId/subjects"                      element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClassSubjects /></ProtectedRoute>} />
      <Route path="/teacher/class/:classId/subject/:subjectId/chapters"   element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />

      {/* Teacher — Attendance */}
      <Route path="/teacher/attendance"                                              element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
      <Route path="/teacher/attendance/mark"                                         element={<MarkAttendance />} />
      <Route path="/teacher/attendance/mark/:classId/:subjectId"                     element={<AttendanceSheet />} />
      <Route path="/teacher/attendance/history"                                      element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
      <Route path="/teacher/class/:classId/subject/:subjectId/attendance"            element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
      <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history"   element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />

      {/* Teacher — Create test flow */}
      <Route path="/teacher/test/create"           element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTestSelection /></ProtectedRoute>} />
      <Route path="/teacher/test/select-chapter"   element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapterSelection /></ProtectedRoute>} />
      <Route path="/teacher/test/create/:chapterId" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
      <Route path="/teacher/test/:testId/manage"   element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />

      {/* Teacher — Legacy / specific routes */}
      <Route path="/teacher/chapters"                                              element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
      <Route path="/teacher/subject/:subjectId/classes"                            element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
      <Route path="/teacher/chapter/:chapterId/tests"                              element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapterTests /></ProtectedRoute>} />
      <Route path="/teacher/chapter/:chapterId/test/create"                        element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
      <Route path="/teacher/class/:classId/subject/:subjectId/assignments"        element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
      <Route path="/teacher/class/:classId/subject/:subjectId/doubts"             element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

      {/* ── Admin ── */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"     element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/classes"   element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
      <Route path="/admin/subjects"  element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
      <Route path="/admin/chapters"  element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
























// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';

// // Pages
// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // Student Pages
// import StudentDashboard from './pages/student/StudentDashboard';
// import SubjectDetails from './pages/student/SubjectDetails';
// import ChapterTests from './pages/student/ChapterTests';
// import TakeTest from './pages/student/TakeTest';
// import TestResult from './pages/student/TestResult';
// import MyTests from './pages/student/MyTests';
// import MyAttendance from './pages/student/MyAttendance';
// import MyFees from './pages/student/MyFees';
// import MyAssignments from './pages/student/MyAssignments';
// import StudentDoubts from './pages/student/StudentDoubts';
// import StudentNotifications from './pages/student/StudentNotifications';

// // Teacher Pages


// import TeacherDashboard from './pages/teacher/TeacherDashboard';
// import TeacherMyClasses from './pages/teacher/TeacherMyClasses';
// import TeacherClassSubjects from './pages/teacher/TeacherClassSubjects';
// import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// import TeacherChapters from './pages/teacher/TeacherChapters';
// import TeacherChapterTests from './pages/teacher/TeacherChapterTests';
// import TeacherAllTests from './pages/teacher/TeacherAllTests'; 
// import CreateTest from './pages/teacher/CreateTest';
// import TestManagement from './pages/teacher/TestManagement';
// import AttendanceSheet from './pages/teacher/AttendanceSheet';
// import MarkAttendance from './pages/teacher/MarkAttendance';

// import AttendanceHistory from './pages/teacher/AttendanceHistory';
// import TeacherAssignments from './pages/teacher/TeacherAssignments';
// import TeacherDoubts from './pages/teacher/TeacherDoubts';



// import TeacherSubjects from './pages/teacher/TeacherSubjects';
// import TeacherStudents from './pages/teacher/TeacherStudents';
// import CompleteProfilePage from './pages/CompleteProfilePage';

//  import { GoogleOAuthProvider } from '@react-oauth/google';

// // NEW - Test Creation Flow Components
// import TeacherTestSelection from './pages/teacher/TeacherTestSelection';
// import TeacherChapterSelection from './pages/teacher/TeacherChapterSelection';

// // Admin Pages
// import AdminDashboard from './pages/admin/AdminDashboard';
// import ManageUsers from './pages/admin/ManageUsers';
// import ManageClasses from './pages/admin/ManageClasses';
// import ManageSubjects from './pages/admin/ManageSubjects';
// import ManageChapters from './pages/admin/ManageChapters';

// // Protected Route Component
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user, loading, authReady } = useAuth();

//   if (!authReady || loading) return null;
//   if (!user) return <Navigate to="/login" replace />;
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// function App() {
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/" element={<LandingPage />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />
//       <Route path="/forgot-password" element={<ForgotPasswordPage />} />

//       {/* Student Routes */}
//       <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
//       <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
//       <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
//       <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
//       <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
//       <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
//       <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
//       <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
//       <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
//       <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
//       <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

//       {/* Teacher Routes */}

//       {/* Teacher Routes */}
// // Teacher routes
// <Route path="/teacher/attendance/mark" element={<MarkAttendance />} />
// <Route path="/teacher/attendance/mark/:classId/:subjectId" element={<AttendanceSheet />} />      
// <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// <Route path="/teacher/subjects" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjects /></ProtectedRoute>} /> 
// <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudents /></ProtectedRoute>} />
// <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// <Route path="/teacher/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// {/* ✅ 3-STEP FLOW FOR MY CLASSES (Class -> Subject -> Chapters) */}
// <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherMyClasses /></ProtectedRoute>} />
// <Route path="/teacher/class/:classId/subjects" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClassSubjects /></ProtectedRoute>} />
// <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />

// {/* ✅ NEW CREATE TEST FLOW (Selection -> Chapter -> Form) */}
// <Route path="/teacher/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTestSelection /></ProtectedRoute>} />
// <Route path="/teacher/test/select-chapter" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapterSelection /></ProtectedRoute>} />
// <Route path="/teacher/test/create/:chapterId" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />

// {/* Other Teacher Actions */}
// <Route path="/teacher/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// <Route path="/teacher/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAllTests /></ProtectedRoute>} />
// <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// <Route path="/teacher/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />

// {/* Legacy/Specific Routes (Maintained for full functionality) */}
// <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapterTests /></ProtectedRoute>} />
// <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// <Route path="/complete-profile" element={<CompleteProfilePage />} />



//       {/* Admin Routes */}
//       <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
//       <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
//       <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
//       <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
//       <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />


// import { GoogleOAuthProvider } from '@react-oauth/google';

// // ✅ CORRECT - GoogleOAuthProvider wraps everything from outside
// <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//   <BrowserRouter>
//     <ThemeProvider>
//       <AuthProvider>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/complete-profile" element={<CompleteProfilePage />} />
//           {/* ...all your other existing routes... */}
//         </Routes>
//       </AuthProvider>
//     </ThemeProvider>
//   </BrowserRouter>
// </GoogleOAuthProvider>






//       {/* Fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;































// // import { Routes, Route, Navigate } from 'react-router-dom';
// // import { useAuth } from './context/AuthContext';

// // // Pages
// // import LandingPage from './pages/LandingPage';
// // import LoginPage from './pages/LoginPage';
// // import RegisterPage from './pages/RegisterPage';
// // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // Student Pages
// // import StudentDashboard from './pages/student/StudentDashboard';
// // import SubjectDetails from './pages/student/SubjectDetails';
// // import TeacherAllTests from './pages/teacher/TeacherAllTests'; 
// // import ChapterTests from './pages/student/ChapterTests';
// // import TakeTest from './pages/student/TakeTest';
// // import TestResult from './pages/student/TestResult';
// // import MyTests from './pages/student/MyTests';
// // import MyAttendance from './pages/student/MyAttendance';
// // import MyFees from './pages/student/MyFees';
// // import MyAssignments from './pages/student/MyAssignments';
// // import StudentDoubts from './pages/student/StudentDoubts';
// // import StudentNotifications from './pages/student/StudentNotifications';

// // // Teacher Pages

// // import TeacherTestSelection from './pages/teacher/TeacherTestSelection';
// // import TeacherChapterSelection from './pages/teacher/TeacherChapterSelection';
// // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // import TeacherMyClasses from './pages/teacher/TeacherMyClasses';  // NEW - Step 1: All classes
// // import TeacherClassSubjects from './pages/teacher/TeacherClassSubjects';  // NEW - Step 2: Subjects for a class
// // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // import TeacherChapters from './pages/teacher/TeacherChapters';
// // import TeacherChapterTests from './pages/teacher/TeacherChapterTests';
// // // import TeacherChapterTests from './pages/teacher/TeacherChapterTests';
// // import CreateTest from './pages/teacher/CreateTest';
// // import TestManagement from './pages/teacher/TestManagement';
// // import MarkAttendance from './pages/teacher/MarkAttendance';
// // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // Admin Pages
// // import AdminDashboard from './pages/admin/AdminDashboard';
// // import ManageUsers from './pages/admin/ManageUsers';
// // import ManageClasses from './pages/admin/ManageClasses';
// // import ManageSubjects from './pages/admin/ManageSubjects';
// // import ManageChapters from './pages/admin/ManageChapters';

// // // Protected Route
// // const ProtectedRoute = ({ children, allowedRoles }) => {
// //   const { user, loading, authReady } = useAuth();

// //   if (!authReady || loading) return null;

// //   if (!user) return <Navigate to="/login" replace />;

// //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// //     return <Navigate to="/" replace />;
// //   }

// //   return children;
// // };

// // function App() {
// //   return (
// //     <Routes>

// //       {/* Public */}
// //       <Route path="/" element={<LandingPage />} />
// //       <Route path="/login" element={<LoginPage />} />
// //       <Route path="/register" element={<RegisterPage />} />
// //       <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// //       {/* Student */}
// //       <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// //       <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// //       <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// //       <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// //       <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// //       <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// //       <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// //       <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// //       <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// //       <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// //       <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// //       {/* Teacher */}



      
// //       <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />

// //       {/* ✅ NEW 3-STEP FLOW FOR MY CLASSES */}
// //       <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherMyClasses /></ProtectedRoute>} />  {/* Step 1: All classes */}
// //       <Route path="/teacher/class/:classId/subjects" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClassSubjects /></ProtectedRoute>} />  {/* Step 2: Subjects for class */}
// //       <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />  {/* Step 3: Chapters */}
      
// //       {/* Other Quick Action Routes */}
// //       <Route path="/teacher/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// //       {/* <Route path="/teacher/TeacherAllTests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapterTests /></ProtectedRoute>} /> */}
// //       {/* <Route path="/teacher/TeacherAllTests/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} /> */}
// //       <Route path="/teacher/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAllTests /></ProtectedRoute>} />
// //       <Route path="/teacher/tests/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
      
// //       <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// //       <Route path="/teacher/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// //       <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// //       <Route path="/teacher/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// //       {/* Legacy/Alternative Routes (for backward compatibility) */}
// //       <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// //       <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapterTests /></ProtectedRoute>} />
// //       <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// //       <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// //       <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// //       <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// //       {/* Admin */}
// //       <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// //       <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// //       <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// //       <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// //       <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// //       {/* Fallback */}
// //       <Route path="*" element={<Navigate to="/" replace />} />
// //     </Routes>
// //   );
// // }

// // export default App;




























// // // import { Routes, Route, Navigate } from 'react-router-dom';
// // // import { useAuth } from './context/AuthContext';

// // // // Pages
// // // import LandingPage from './pages/LandingPage';
// // // import LoginPage from './pages/LoginPage';
// // // import RegisterPage from './pages/RegisterPage';
// // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // Student Pages
// // // import StudentDashboard from './pages/student/StudentDashboard';
// // // import SubjectDetails from './pages/student/SubjectDetails';
// // // import ChapterTests from './pages/student/ChapterTests';
// // // import TakeTest from './pages/student/TakeTest';
// // // import TestResult from './pages/student/TestResult';
// // // import MyTests from './pages/student/MyTests';
// // // import MyAttendance from './pages/student/MyAttendance';
// // // import MyFees from './pages/student/MyFees';
// // // import MyAssignments from './pages/student/MyAssignments';
// // // import StudentDoubts from './pages/student/StudentDoubts';
// // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // Teacher Pages
// // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // import TeacherTests from './pages/teacher/TeacherTests';
// // // import CreateTest from './pages/teacher/CreateTest';
// // // import TestManagement from './pages/teacher/TestManagement';
// // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // Admin Pages
// // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // import ManageUsers from './pages/admin/ManageUsers';
// // // import ManageClasses from './pages/admin/ManageClasses';
// // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // import ManageChapters from './pages/admin/ManageChapters';

// // // // Protected Route Component
// // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // //   const { user, loading } = useAuth();

// // //   if (loading) {
// // //     return (
// // //       <div className="min-h-screen flex items-center justify-center bg-slate-950">
// // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
// // //       </div>
// // //     );
// // //   }

// // //   if (!user) {
// // //     return <Navigate to="/login" replace />;
// // //   }

// // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // //     return <Navigate to="/" replace />;
// // //   }

// // //   return children;
// // // };

// // // function App() {
// // //   return (
// // //     <Routes>
// // //       {/* Public Routes */}
// // //       <Route path="/" element={<LandingPage />} />
// // //       <Route path="/login" element={<LoginPage />} />
// // //       <Route path="/register" element={<RegisterPage />} />
// // //       <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // //       {/* Student Routes */}
// // //       <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // //       <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // //       <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // //       <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // //       <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // //       <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // //       <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // //       <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // //       <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // //       <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // //       <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // //       {/* Teacher Routes */}
// // //       <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // //       <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // //       <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // //       <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // //       <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // //       {/* Admin Routes */}
// // //       <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // //       <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // //       <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // //       <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // //       <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // //       {/* Fallback */}
// // //       <Route path="*" element={<Navigate to="/" replace />} />
// // //     </Routes>
// // //   );
// // // }

// // // export default App;


























// // // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // // import { ThemeProvider } from './context/ThemeContext';
// // // // import { AuthProvider, useAuth } from './context/AuthContext';

// // // // // Pages
// // // // import LandingPage from './pages/LandingPage';
// // // // import LoginPage from './pages/LoginPage';
// // // // import RegisterPage from './pages/RegisterPage';
// // // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // // Student Pages
// // // // import StudentDashboard from './pages/student/StudentDashboard';
// // // // import SubjectDetails from './pages/student/SubjectDetails';
// // // // import ChapterTests from './pages/student/ChapterTests';
// // // // import TakeTest from './pages/student/TakeTest';
// // // // import TestResult from './pages/student/TestResult';
// // // // import MyTests from './pages/student/MyTests';
// // // // import MyAttendance from './pages/student/MyAttendance';
// // // // import MyFees from './pages/student/MyFees';
// // // // import MyAssignments from './pages/student/MyAssignments';
// // // // import StudentDoubts from './pages/student/StudentDoubts';
// // // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // // Teacher Pages
// // // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // // import TeacherTests from './pages/teacher/TeacherTests';
// // // // import CreateTest from './pages/teacher/CreateTest';
// // // // import TestManagement from './pages/teacher/TestManagement';
// // // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // // Admin Pages
// // // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // // import ManageUsers from './pages/admin/ManageUsers';
// // // // import ManageClasses from './pages/admin/ManageClasses';
// // // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // // import ManageChapters from './pages/admin/ManageChapters';

// // // // // Protected Route Component
// // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // //   const { user, loading } = useAuth();

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="min-h-screen flex items-center justify-center">
// // // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (!user) {
// // // //     return <Navigate to="/login" replace />;
// // // //   }

// // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // //     return <Navigate to="/" replace />;
// // // //   }

// // // //   return children;
// // // // };

// // // // function App() {
// // // //   return (
// // // //     <Router>
// // // //       <ThemeProvider>
// // // //         <AuthProvider>
// // // //           <Routes>
// // // //             {/* Public Routes */}
// // // //             <Route path="/" element={<LandingPage />} />
// // // //             <Route path="/login" element={<LoginPage />} />
// // // //             <Route path="/register" element={<RegisterPage />} />
// // // //             <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // //             {/* Student Routes */}
// // // //             <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // // //             <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // // //             <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // // //             <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // // //             <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // // //             <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // // //             <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // // //             <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // // //             <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // // //             <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // // //             <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // // //             {/* Teacher Routes */}
// // // //             <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // // //             <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // // //             <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // // //             <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // // //             <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // // //             <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // // //             <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // // //             <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // // //             {/* Admin Routes */}
// // // //             <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // // //             <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // // //             <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // // //             <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // // //             <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // // //             {/* Fallback */}
// // // //             <Route path="*" element={<Navigate to="/" replace />} />
// // // //           </Routes>
// // // //         </AuthProvider>
// // // //       </ThemeProvider>
// // // //     </Router>
// // // //   );
// // // // }

// // // // export default App;


















// // // // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // // // import { ThemeProvider } from './context/ThemeContext';
// // // // // import { AuthProvider, useAuth } from './context/AuthContext';

// // // // // // Pages
// // // // // import LandingPage from './pages/LandingPage';
// // // // // import LoginPage from './pages/LoginPage';
// // // // // import RegisterPage from './pages/RegisterPage';
// // // // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // // // Student Pages
// // // // // import StudentDashboard from './pages/student/StudentDashboard';
// // // // // import SubjectDetails from './pages/student/SubjectDetails';
// // // // // import ChapterTests from './pages/student/ChapterTests';
// // // // // import TakeTest from './pages/student/TakeTest';
// // // // // import TestResult from './pages/student/TestResult';
// // // // // import MyTests from './pages/student/MyTests';
// // // // // import MyAttendance from './pages/student/MyAttendance';
// // // // // import MyFees from './pages/student/MyFees';
// // // // // import MyAssignments from './pages/student/MyAssignments';
// // // // // import StudentDoubts from './pages/student/StudentDoubts';
// // // // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // // // Teacher Pages
// // // // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // // // import TeacherTests from './pages/teacher/TeacherTests';
// // // // // import CreateTest from './pages/teacher/CreateTest';
// // // // // import TestManagement from './pages/teacher/TestManagement';
// // // // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // // // Admin Pages
// // // // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // // // import ManageUsers from './pages/admin/ManageUsers';
// // // // // import ManageClasses from './pages/admin/ManageClasses';
// // // // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // // // import ManageChapters from './pages/admin/ManageChapters';

// // // // // // Protected Route Component
// // // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // // //   const { user, loading } = useAuth();

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="min-h-screen flex items-center justify-center">
// // // // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (!user) {
// // // // //     return <Navigate to="/login" replace />;
// // // // //   }

// // // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // // //     return <Navigate to="/" replace />;
// // // // //   }

// // // // //   return children;
// // // // // };

// // // // // function App() {
// // // // //   return (
// // // // //     <ThemeProvider>
// // // // //       <AuthProvider>
// // // // //         <Router>
// // // // //           <Routes>
// // // // //             {/* Public Routes */}
// // // // //             <Route path="/" element={<LandingPage />} />
// // // // //             <Route path="/login" element={<LoginPage />} />
// // // // //             <Route path="/register" element={<RegisterPage />} />
// // // // //             <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // // //             {/* Student Routes */}
// // // // //             <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // // // //             <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // // // //             <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // // // //             <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // // // //             <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // // // //             <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // // // //             <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // // // //             <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // // // //             <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // // // //             <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // // // //             <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // // // //             {/* Teacher Routes */}
// // // // //             <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // // // //             {/* Admin Routes */}
// // // // //             <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // // // //             <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // // // //             <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // // // //             <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // // // //             <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // // // //             {/* Fallback */}
// // // // //             <Route path="*" element={<Navigate to="/" replace />} />
// // // // //           </Routes>
// // // // //         </Router>
// // // // //       </AuthProvider>
// // // // //     </ThemeProvider>
// // // // //   );
// // // // // }

// // // // // export default App;
















// // // // // // function App() {
// // // // // //   return (
// // // // // //     <div style={{ padding: '100px', background: '#f0f0f0' }}>
// // // // // //       <h1 style={{ color: 'blue', fontSize: '60px' }}>
// // // // // //         ✨ App.jsx is Working!
// // // // // //       </h1>
// // // // // //       <p style={{ fontSize: '24px' }}>
// // // // // //         React Router and App.jsx are functioning.
// // // // // //       </p>
// // // // // //     </div>
// // // // // //   );
// // // // // // }

// // // // // // export default App;




















// // // // // // // import { Routes, Route, Navigate } from "react-router-dom";
// // // // // // // import { useAuth } from "./context/AuthContext";

// // // // // // // // Pages
// // // // // // // import LandingPage from "./pages/LandingPage";
// // // // // // // import LoginPage from "./pages/LoginPage";
// // // // // // // import RegisterPage from "./pages/RegisterPage";
// // // // // // // import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// // // // // // // // Student
// // // // // // // import StudentDashboard from "./pages/student/StudentDashboard";

// // // // // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // // // // //   const { user, loading } = useAuth();

// // // // // // //   if (loading) return <div>Loading...</div>;

// // // // // // //   if (!user) return <Navigate to="/login" replace />;

// // // // // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // // // // //     return <Navigate to="/" replace />;
// // // // // // //   }

// // // // // // //   return children;
// // // // // // // };

// // // // // // // function App() {
// // // // // // //   return (
// // // // // // //     <Routes>
// // // // // // //       {/* Public */}
// // // // // // //       <Route path="/" element={<LandingPage />} />
// // // // // // //       <Route path="/login" element={<LoginPage />} />
// // // // // // //       <Route path="/register" element={<RegisterPage />} />
// // // // // // //       <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // // // // //       {/* Student */}
// // // // // // //       <Route
// // // // // // //         path="/student/dashboard"
// // // // // // //         element={
// // // // // // //           <ProtectedRoute allowedRoles={["student"]}>
// // // // // // //             <StudentDashboard />
// // // // // // //           </ProtectedRoute>
// // // // // // //         }
// // // // // // //       />

// // // // // // //       {/* Fallback */}
// // // // // // //       <Route path="*" element={<Navigate to="/" replace />} />
// // // // // // //     </Routes>
// // // // // // //   );
// // // // // // // }

// // // // // // // export default App;























// // // // // // // // function App() {
// // // // // // // //   return (
// // // // // // // //     <div style={{ padding: '100px', background: '#f0f0f0' }}>
// // // // // // // //       <h1 style={{ color: 'blue', fontSize: '60px' }}>
// // // // // // // //         ✨ App.jsx is Working!
// // // // // // // //       </h1>
// // // // // // // //       <p style={{ fontSize: '24px' }}>
// // // // // // // //         React Router and App.jsx are functioning.
// // // // // // // //       </p>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // export default App;



















// // // // // // // // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // // // // // // // import { ThemeProvider } from './context/ThemeContext';
// // // // // // // // // import { AuthProvider, useAuth } from './context/AuthContext';

// // // // // // // // // // Pages
// // // // // // // // // import LandingPage from './pages/LandingPage';
// // // // // // // // // import LoginPage from './pages/LoginPage';
// // // // // // // // // import RegisterPage from './pages/RegisterPage';
// // // // // // // // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // // // // // // // Student Pages
// // // // // // // // // import StudentDashboard from './pages/student/StudentDashboard';
// // // // // // // // // import SubjectDetails from './pages/student/SubjectDetails';
// // // // // // // // // import ChapterTests from './pages/student/ChapterTests';
// // // // // // // // // import TakeTest from './pages/student/TakeTest';
// // // // // // // // // import TestResult from './pages/student/TestResult';
// // // // // // // // // import MyTests from './pages/student/MyTests';
// // // // // // // // // import MyAttendance from './pages/student/MyAttendance';
// // // // // // // // // import MyFees from './pages/student/MyFees';
// // // // // // // // // import MyAssignments from './pages/student/MyAssignments';
// // // // // // // // // import StudentDoubts from './pages/student/StudentDoubts';
// // // // // // // // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // // // // // // // Teacher Pages
// // // // // // // // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // // // // // // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // // // // // // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // // // // // // // import TeacherTests from './pages/teacher/TeacherTests';
// // // // // // // // // import CreateTest from './pages/teacher/CreateTest';
// // // // // // // // // import TestManagement from './pages/teacher/TestManagement';
// // // // // // // // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // // // // // // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // // // // // // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // // // // // // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // // // // // // // Admin Pages
// // // // // // // // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // // // // // // // import ManageUsers from './pages/admin/ManageUsers';
// // // // // // // // // import ManageClasses from './pages/admin/ManageClasses';
// // // // // // // // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // // // // // // // import ManageChapters from './pages/admin/ManageChapters';

// // // // // // // // // // Protected Route Component
// // // // // // // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // // // // // // //   const { user, loading } = useAuth();

// // // // // // // // //   if (loading) {
// // // // // // // // //     return (
// // // // // // // // //       <div className="min-h-screen flex items-center justify-center">
// // // // // // // // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// // // // // // // // //       </div>
// // // // // // // // //     );
// // // // // // // // //   }

// // // // // // // // //   if (!user) {
// // // // // // // // //     return <Navigate to="/login" replace />;
// // // // // // // // //   }

// // // // // // // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // // // // // // //     return <Navigate to="/" replace />;
// // // // // // // // //   }

// // // // // // // // //   return children;
// // // // // // // // // };

// // // // // // // // // function App() {
// // // // // // // // //   return (
// // // // // // // // //     <ThemeProvider>
// // // // // // // // //       <AuthProvider>
// // // // // // // // //         <Router>
// // // // // // // // //           <Routes>
// // // // // // // // //             {/* Public Routes */}
// // // // // // // // //             <Route path="/" element={<LandingPage />} />
// // // // // // // // //             <Route path="/login" element={<LoginPage />} />
// // // // // // // // //             <Route path="/register" element={<RegisterPage />} />
// // // // // // // // //             <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // // // // // // //             {/* Student Routes */}
// // // // // // // // //             <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // // // // // // // //             {/* Teacher Routes */}
// // // // // // // // //             <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // // // // // // // //             {/* Admin Routes */}
// // // // // // // // //             <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // // // // // // // //             <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // // // // // // // //             {/* Fallback */}
// // // // // // // // //             <Route path="*" element={<Navigate to="/" replace />} />
// // // // // // // // //           </Routes>
// // // // // // // // //         </Router>
// // // // // // // // //       </AuthProvider>
// // // // // // // // //     </ThemeProvider>
// // // // // // // // //   );
// // // // // // // // // }

// // // // // // // // // export default App;













// // // // // // // // // // import { useState } from 'react'
// // // // // // // // // // import reactLogo from './assets/react.svg'
// // // // // // // // // // import viteLogo from '/vite.svg'
// // // // // // // // // // import './App.css'

// // // // // // // // // // function App() {
// // // // // // // // // //   const [count, setCount] = useState(0)

// // // // // // // // // //   return (
// // // // // // // // // //     <>
// // // // // // // // // //       <div>
// // // // // // // // // //         <a href="https://vite.dev" target="_blank">
// // // // // // // // // //           <img src={viteLogo} className="logo" alt="Vite logo" />
// // // // // // // // // //         </a>
// // // // // // // // // //         <a href="https://react.dev" target="_blank">
// // // // // // // // // //           <img src={reactLogo} className="logo react" alt="React logo" />
// // // // // // // // // //         </a>
// // // // // // // // // //       </div>
// // // // // // // // // //       <h1>Vite + React</h1>
// // // // // // // // // //       <div className="card">
// // // // // // // // // //         <button onClick={() => setCount((count) => count + 1)}>
// // // // // // // // // //           count is {count}
// // // // // // // // // //         </button>
// // // // // // // // // //         <p>
// // // // // // // // // //           Edit <code>src/App.jsx</code> and save to test HMR
// // // // // // // // // //         </p>
// // // // // // // // // //       </div>
// // // // // // // // // //       <p className="read-the-docs">
// // // // // // // // // //         Click on the Vite and React logos to learn more
// // // // // // // // // //       </p>
// // // // // // // // // //     </>
// // // // // // // // // //   )
// // // // // // // // // // }

// // // // // // // // // // export default App

































// // // import { Routes, Route, Navigate } from 'react-router-dom';
// // // import { useAuth } from './context/AuthContext';

// // // // Pages
// // // import LandingPage from './pages/LandingPage';
// // // import LoginPage from './pages/LoginPage';
// // // import RegisterPage from './pages/RegisterPage';
// // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // Student Pages
// // // import StudentDashboard from './pages/student/StudentDashboard';
// // // import SubjectDetails from './pages/student/SubjectDetails';
// // // import ChapterTests from './pages/student/ChapterTests';
// // // import TakeTest from './pages/student/TakeTest';
// // // import TestResult from './pages/student/TestResult';
// // // import MyTests from './pages/student/MyTests';
// // // import MyAttendance from './pages/student/MyAttendance';
// // // import MyFees from './pages/student/MyFees';
// // // import MyAssignments from './pages/student/MyAssignments';
// // // import StudentDoubts from './pages/student/StudentDoubts';
// // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // Teacher Pages
// // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // import TeacherTests from './pages/teacher/TeacherTests';
// // // import CreateTest from './pages/teacher/CreateTest';
// // // import TestManagement from './pages/teacher/TestManagement';
// // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // Admin Pages
// // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // import ManageUsers from './pages/admin/ManageUsers';
// // // import ManageClasses from './pages/admin/ManageClasses';
// // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // import ManageChapters from './pages/admin/ManageChapters';

// // // // Protected Route
// // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // //   const { user, loading, authReady } = useAuth();

// // //   if (!authReady || loading) return null;

// // //   if (!user) return <Navigate to="/login" replace />;

// // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // //     return <Navigate to="/" replace />;
// // //   }

// // //   return children;
// // // };

// // // function App() {
// // //   return (
// // //     <Routes>

// // //       {/* Public */}
// // //       <Route path="/" element={<LandingPage />} />
// // //       <Route path="/login" element={<LoginPage />} />
// // //       <Route path="/register" element={<RegisterPage />} />
// // //       <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // //       {/* Student */}
// // //       <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // //       <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // //       <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // //       <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // //       <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // //       <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // //       <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // //       <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // //       <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // //       <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // //       <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // //       {/* Teacher */}
// // //       <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />

// // //       {/* ✅ ADDED ROUTES TO MATCH DASHBOARD LINKS */}
// // //       <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // //       <Route path="/teacher/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // //       <Route path="/teacher/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // //       <Route path="/teacher/tests/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // //       <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // //       <Route path="/teacher/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // //       <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // //       <Route path="/teacher/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // //       {/* Existing Teacher Deep Routes (UNCHANGED) */}
// // //       <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // //       <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // //       <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // //       <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // //       <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // //       {/* Admin */}
// // //       <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // //       <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // //       <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // //       <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // //       <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // //       {/* Fallback */}
// // //       <Route path="*" element={<Navigate to="/" replace />} />
// // //     </Routes>
// // //   );
// // // }

// // // export default App;




























// // // // import { Routes, Route, Navigate } from 'react-router-dom';
// // // // import { useAuth } from './context/AuthContext';

// // // // // Pages
// // // // import LandingPage from './pages/LandingPage';
// // // // import LoginPage from './pages/LoginPage';
// // // // import RegisterPage from './pages/RegisterPage';
// // // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // // Student Pages
// // // // import StudentDashboard from './pages/student/StudentDashboard';
// // // // import SubjectDetails from './pages/student/SubjectDetails';
// // // // import ChapterTests from './pages/student/ChapterTests';
// // // // import TakeTest from './pages/student/TakeTest';
// // // // import TestResult from './pages/student/TestResult';
// // // // import MyTests from './pages/student/MyTests';
// // // // import MyAttendance from './pages/student/MyAttendance';
// // // // import MyFees from './pages/student/MyFees';
// // // // import MyAssignments from './pages/student/MyAssignments';
// // // // import StudentDoubts from './pages/student/StudentDoubts';
// // // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // // Teacher Pages
// // // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // // import TeacherTests from './pages/teacher/TeacherTests';
// // // // import CreateTest from './pages/teacher/CreateTest';
// // // // import TestManagement from './pages/teacher/TestManagement';
// // // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // // Admin Pages
// // // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // // import ManageUsers from './pages/admin/ManageUsers';
// // // // import ManageClasses from './pages/admin/ManageClasses';
// // // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // // import ManageChapters from './pages/admin/ManageChapters';

// // // // // Protected Route Component
// // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // //   const { user, loading } = useAuth();

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="min-h-screen flex items-center justify-center bg-slate-950">
// // // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (!user) {
// // // //     return <Navigate to="/login" replace />;
// // // //   }

// // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // //     return <Navigate to="/" replace />;
// // // //   }

// // // //   return children;
// // // // };

// // // // function App() {
// // // //   return (
// // // //     <Routes>
// // // //       {/* Public Routes */}
// // // //       <Route path="/" element={<LandingPage />} />
// // // //       <Route path="/login" element={<LoginPage />} />
// // // //       <Route path="/register" element={<RegisterPage />} />
// // // //       <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // //       {/* Student Routes */}
// // // //       <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // // //       <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // // //       <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // // //       <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // // //       <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // // //       <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // // //       <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // // //       <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // // //       <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // // //       <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // // //       <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // // //       {/* Teacher Routes */}
// // // //       <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // // //       <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // // //       <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // // //       <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // // //       <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // // //       <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // // //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // // //       <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // // //       <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // // //       <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // // //       {/* Admin Routes */}
// // // //       <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // // //       <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // // //       <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // // //       <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // // //       <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // // //       {/* Fallback */}
// // // //       <Route path="*" element={<Navigate to="/" replace />} />
// // // //     </Routes>
// // // //   );
// // // // }

// // // // export default App;


























// // // // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // // // import { ThemeProvider } from './context/ThemeContext';
// // // // // import { AuthProvider, useAuth } from './context/AuthContext';

// // // // // // Pages
// // // // // import LandingPage from './pages/LandingPage';
// // // // // import LoginPage from './pages/LoginPage';
// // // // // import RegisterPage from './pages/RegisterPage';
// // // // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // // // Student Pages
// // // // // import StudentDashboard from './pages/student/StudentDashboard';
// // // // // import SubjectDetails from './pages/student/SubjectDetails';
// // // // // import ChapterTests from './pages/student/ChapterTests';
// // // // // import TakeTest from './pages/student/TakeTest';
// // // // // import TestResult from './pages/student/TestResult';
// // // // // import MyTests from './pages/student/MyTests';
// // // // // import MyAttendance from './pages/student/MyAttendance';
// // // // // import MyFees from './pages/student/MyFees';
// // // // // import MyAssignments from './pages/student/MyAssignments';
// // // // // import StudentDoubts from './pages/student/StudentDoubts';
// // // // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // // // Teacher Pages
// // // // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // // // import TeacherTests from './pages/teacher/TeacherTests';
// // // // // import CreateTest from './pages/teacher/CreateTest';
// // // // // import TestManagement from './pages/teacher/TestManagement';
// // // // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // // // Admin Pages
// // // // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // // // import ManageUsers from './pages/admin/ManageUsers';
// // // // // import ManageClasses from './pages/admin/ManageClasses';
// // // // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // // // import ManageChapters from './pages/admin/ManageChapters';

// // // // // // Protected Route Component
// // // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // // //   const { user, loading } = useAuth();

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="min-h-screen flex items-center justify-center">
// // // // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (!user) {
// // // // //     return <Navigate to="/login" replace />;
// // // // //   }

// // // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // // //     return <Navigate to="/" replace />;
// // // // //   }

// // // // //   return children;
// // // // // };

// // // // // function App() {
// // // // //   return (
// // // // //     <Router>
// // // // //       <ThemeProvider>
// // // // //         <AuthProvider>
// // // // //           <Routes>
// // // // //             {/* Public Routes */}
// // // // //             <Route path="/" element={<LandingPage />} />
// // // // //             <Route path="/login" element={<LoginPage />} />
// // // // //             <Route path="/register" element={<RegisterPage />} />
// // // // //             <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // // //             {/* Student Routes */}
// // // // //             <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // // // //             <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // // // //             <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // // // //             <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // // // //             <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // // // //             <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // // // //             <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // // // //             <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // // // //             <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // // // //             <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // // // //             <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // // // //             {/* Teacher Routes */}
// // // // //             <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // // // //             {/* Admin Routes */}
// // // // //             <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // // // //             <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // // // //             <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // // // //             <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // // // //             <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // // // //             {/* Fallback */}
// // // // //             <Route path="*" element={<Navigate to="/" replace />} />
// // // // //           </Routes>
// // // // //         </AuthProvider>
// // // // //       </ThemeProvider>
// // // // //     </Router>
// // // // //   );
// // // // // }

// // // // // export default App;


















// // // // // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // // // // import { ThemeProvider } from './context/ThemeContext';
// // // // // // import { AuthProvider, useAuth } from './context/AuthContext';

// // // // // // // Pages
// // // // // // import LandingPage from './pages/LandingPage';
// // // // // // import LoginPage from './pages/LoginPage';
// // // // // // import RegisterPage from './pages/RegisterPage';
// // // // // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // // // // Student Pages
// // // // // // import StudentDashboard from './pages/student/StudentDashboard';
// // // // // // import SubjectDetails from './pages/student/SubjectDetails';
// // // // // // import ChapterTests from './pages/student/ChapterTests';
// // // // // // import TakeTest from './pages/student/TakeTest';
// // // // // // import TestResult from './pages/student/TestResult';
// // // // // // import MyTests from './pages/student/MyTests';
// // // // // // import MyAttendance from './pages/student/MyAttendance';
// // // // // // import MyFees from './pages/student/MyFees';
// // // // // // import MyAssignments from './pages/student/MyAssignments';
// // // // // // import StudentDoubts from './pages/student/StudentDoubts';
// // // // // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // // // // Teacher Pages
// // // // // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // // // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // // // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // // // // import TeacherTests from './pages/teacher/TeacherTests';
// // // // // // import CreateTest from './pages/teacher/CreateTest';
// // // // // // import TestManagement from './pages/teacher/TestManagement';
// // // // // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // // // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // // // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // // // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // // // // Admin Pages
// // // // // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // // // // import ManageUsers from './pages/admin/ManageUsers';
// // // // // // import ManageClasses from './pages/admin/ManageClasses';
// // // // // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // // // // import ManageChapters from './pages/admin/ManageChapters';

// // // // // // // Protected Route Component
// // // // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // // // //   const { user, loading } = useAuth();

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="min-h-screen flex items-center justify-center">
// // // // // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   if (!user) {
// // // // // //     return <Navigate to="/login" replace />;
// // // // // //   }

// // // // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // // // //     return <Navigate to="/" replace />;
// // // // // //   }

// // // // // //   return children;
// // // // // // };

// // // // // // function App() {
// // // // // //   return (
// // // // // //     <ThemeProvider>
// // // // // //       <AuthProvider>
// // // // // //         <Router>
// // // // // //           <Routes>
// // // // // //             {/* Public Routes */}
// // // // // //             <Route path="/" element={<LandingPage />} />
// // // // // //             <Route path="/login" element={<LoginPage />} />
// // // // // //             <Route path="/register" element={<RegisterPage />} />
// // // // // //             <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // // // //             {/* Student Routes */}
// // // // // //             <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // // // // //             <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // // // // //             <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // // // // //             <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // // // // //             <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // // // // //             <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // // // // //             <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // // // // //             <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // // // // //             <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // // // // //             <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // // // // //             <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // // // // //             {/* Teacher Routes */}
// // // // // //             <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // // // // //             {/* Admin Routes */}
// // // // // //             <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // // // // //             <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // // // // //             <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // // // // //             <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // // // // //             <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // // // // //             {/* Fallback */}
// // // // // //             <Route path="*" element={<Navigate to="/" replace />} />
// // // // // //           </Routes>
// // // // // //         </Router>
// // // // // //       </AuthProvider>
// // // // // //     </ThemeProvider>
// // // // // //   );
// // // // // // }

// // // // // // export default App;
















// // // // // // // function App() {
// // // // // // //   return (
// // // // // // //     <div style={{ padding: '100px', background: '#f0f0f0' }}>
// // // // // // //       <h1 style={{ color: 'blue', fontSize: '60px' }}>
// // // // // // //         ✨ App.jsx is Working!
// // // // // // //       </h1>
// // // // // // //       <p style={{ fontSize: '24px' }}>
// // // // // // //         React Router and App.jsx are functioning.
// // // // // // //       </p>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }

// // // // // // // export default App;




















// // // // // // // // import { Routes, Route, Navigate } from "react-router-dom";
// // // // // // // // import { useAuth } from "./context/AuthContext";

// // // // // // // // // Pages
// // // // // // // // import LandingPage from "./pages/LandingPage";
// // // // // // // // import LoginPage from "./pages/LoginPage";
// // // // // // // // import RegisterPage from "./pages/RegisterPage";
// // // // // // // // import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// // // // // // // // // Student
// // // // // // // // import StudentDashboard from "./pages/student/StudentDashboard";

// // // // // // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // // // // // //   const { user, loading } = useAuth();

// // // // // // // //   if (loading) return <div>Loading...</div>;

// // // // // // // //   if (!user) return <Navigate to="/login" replace />;

// // // // // // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // // // // // //     return <Navigate to="/" replace />;
// // // // // // // //   }

// // // // // // // //   return children;
// // // // // // // // };

// // // // // // // // function App() {
// // // // // // // //   return (
// // // // // // // //     <Routes>
// // // // // // // //       {/* Public */}
// // // // // // // //       <Route path="/" element={<LandingPage />} />
// // // // // // // //       <Route path="/login" element={<LoginPage />} />
// // // // // // // //       <Route path="/register" element={<RegisterPage />} />
// // // // // // // //       <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // // // // // //       {/* Student */}
// // // // // // // //       <Route
// // // // // // // //         path="/student/dashboard"
// // // // // // // //         element={
// // // // // // // //           <ProtectedRoute allowedRoles={["student"]}>
// // // // // // // //             <StudentDashboard />
// // // // // // // //           </ProtectedRoute>
// // // // // // // //         }
// // // // // // // //       />

// // // // // // // //       {/* Fallback */}
// // // // // // // //       <Route path="*" element={<Navigate to="/" replace />} />
// // // // // // // //     </Routes>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // export default App;























// // // // // // // // // function App() {
// // // // // // // // //   return (
// // // // // // // // //     <div style={{ padding: '100px', background: '#f0f0f0' }}>
// // // // // // // // //       <h1 style={{ color: 'blue', fontSize: '60px' }}>
// // // // // // // // //         ✨ App.jsx is Working!
// // // // // // // // //       </h1>
// // // // // // // // //       <p style={{ fontSize: '24px' }}>
// // // // // // // // //         React Router and App.jsx are functioning.
// // // // // // // // //       </p>
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // }

// // // // // // // // // export default App;



















// // // // // // // // // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // // // // // // // // import { ThemeProvider } from './context/ThemeContext';
// // // // // // // // // // import { AuthProvider, useAuth } from './context/AuthContext';

// // // // // // // // // // // Pages
// // // // // // // // // // import LandingPage from './pages/LandingPage';
// // // // // // // // // // import LoginPage from './pages/LoginPage';
// // // // // // // // // // import RegisterPage from './pages/RegisterPage';
// // // // // // // // // // import ForgotPasswordPage from './pages/ForgotPasswordPage';

// // // // // // // // // // // Student Pages
// // // // // // // // // // import StudentDashboard from './pages/student/StudentDashboard';
// // // // // // // // // // import SubjectDetails from './pages/student/SubjectDetails';
// // // // // // // // // // import ChapterTests from './pages/student/ChapterTests';
// // // // // // // // // // import TakeTest from './pages/student/TakeTest';
// // // // // // // // // // import TestResult from './pages/student/TestResult';
// // // // // // // // // // import MyTests from './pages/student/MyTests';
// // // // // // // // // // import MyAttendance from './pages/student/MyAttendance';
// // // // // // // // // // import MyFees from './pages/student/MyFees';
// // // // // // // // // // import MyAssignments from './pages/student/MyAssignments';
// // // // // // // // // // import StudentDoubts from './pages/student/StudentDoubts';
// // // // // // // // // // import StudentNotifications from './pages/student/StudentNotifications';

// // // // // // // // // // // Teacher Pages
// // // // // // // // // // import TeacherDashboard from './pages/teacher/TeacherDashboard';
// // // // // // // // // // import TeacherSubjectClasses from './pages/teacher/TeacherSubjectClasses';
// // // // // // // // // // import TeacherChapters from './pages/teacher/TeacherChapters';
// // // // // // // // // // import TeacherTests from './pages/teacher/TeacherTests';
// // // // // // // // // // import CreateTest from './pages/teacher/CreateTest';
// // // // // // // // // // import TestManagement from './pages/teacher/TestManagement';
// // // // // // // // // // import MarkAttendance from './pages/teacher/MarkAttendance';
// // // // // // // // // // import AttendanceHistory from './pages/teacher/AttendanceHistory';
// // // // // // // // // // import TeacherAssignments from './pages/teacher/TeacherAssignments';
// // // // // // // // // // import TeacherDoubts from './pages/teacher/TeacherDoubts';

// // // // // // // // // // // Admin Pages
// // // // // // // // // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // // // // // // // // import ManageUsers from './pages/admin/ManageUsers';
// // // // // // // // // // import ManageClasses from './pages/admin/ManageClasses';
// // // // // // // // // // import ManageSubjects from './pages/admin/ManageSubjects';
// // // // // // // // // // import ManageChapters from './pages/admin/ManageChapters';

// // // // // // // // // // // Protected Route Component
// // // // // // // // // // const ProtectedRoute = ({ children, allowedRoles }) => {
// // // // // // // // // //   const { user, loading } = useAuth();

// // // // // // // // // //   if (loading) {
// // // // // // // // // //     return (
// // // // // // // // // //       <div className="min-h-screen flex items-center justify-center">
// // // // // // // // // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// // // // // // // // // //       </div>
// // // // // // // // // //     );
// // // // // // // // // //   }

// // // // // // // // // //   if (!user) {
// // // // // // // // // //     return <Navigate to="/login" replace />;
// // // // // // // // // //   }

// // // // // // // // // //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// // // // // // // // // //     return <Navigate to="/" replace />;
// // // // // // // // // //   }

// // // // // // // // // //   return children;
// // // // // // // // // // };

// // // // // // // // // // function App() {
// // // // // // // // // //   return (
// // // // // // // // // //     <ThemeProvider>
// // // // // // // // // //       <AuthProvider>
// // // // // // // // // //         <Router>
// // // // // // // // // //           <Routes>
// // // // // // // // // //             {/* Public Routes */}
// // // // // // // // // //             <Route path="/" element={<LandingPage />} />
// // // // // // // // // //             <Route path="/login" element={<LoginPage />} />
// // // // // // // // // //             <Route path="/register" element={<RegisterPage />} />
// // // // // // // // // //             <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// // // // // // // // // //             {/* Student Routes */}
// // // // // // // // // //             <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/subject/:subjectId" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetails /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['student']}><ChapterTests /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/test/:testId/take" element={<ProtectedRoute allowedRoles={['student']}><TakeTest /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/test-attempt/:attemptId/result" element={<ProtectedRoute allowedRoles={['student']}><TestResult /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/my-tests" element={<ProtectedRoute allowedRoles={['student']}><MyTests /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDoubts /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />

// // // // // // // // // //             {/* Teacher Routes */}
// // // // // // // // // //             <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/subject/:subjectId/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSubjectClasses /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/chapters" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherChapters /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/chapter/:chapterId/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherTests /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/chapter/:chapterId/test/create" element={<ProtectedRoute allowedRoles={['teacher']}><CreateTest /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/test/:testId/manage" element={<ProtectedRoute allowedRoles={['teacher']}><TestManagement /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/attendance/history" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceHistory /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/teacher/class/:classId/subject/:subjectId/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDoubts /></ProtectedRoute>} />

// // // // // // // // // //             {/* Admin Routes */}
// // // // // // // // // //             <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
// // // // // // // // // //             <Route path="/admin/chapters" element={<ProtectedRoute allowedRoles={['admin']}><ManageChapters /></ProtectedRoute>} />

// // // // // // // // // //             {/* Fallback */}
// // // // // // // // // //             <Route path="*" element={<Navigate to="/" replace />} />
// // // // // // // // // //           </Routes>
// // // // // // // // // //         </Router>
// // // // // // // // // //       </AuthProvider>
// // // // // // // // // //     </ThemeProvider>
// // // // // // // // // //   );
// // // // // // // // // // }

// // // // // // // // // // export default App;













// // // // // // // // // // // import { useState } from 'react'
// // // // // // // // // // // import reactLogo from './assets/react.svg'
// // // // // // // // // // // import viteLogo from '/vite.svg'
// // // // // // // // // // // import './App.css'

// // // // // // // // // // // function App() {
// // // // // // // // // // //   const [count, setCount] = useState(0)

// // // // // // // // // // //   return (
// // // // // // // // // // //     <>
// // // // // // // // // // //       <div>
// // // // // // // // // // //         <a href="https://vite.dev" target="_blank">
// // // // // // // // // // //           <img src={viteLogo} className="logo" alt="Vite logo" />
// // // // // // // // // // //         </a>
// // // // // // // // // // //         <a href="https://react.dev" target="_blank">
// // // // // // // // // // //           <img src={reactLogo} className="logo react" alt="React logo" />
// // // // // // // // // // //         </a>
// // // // // // // // // // //       </div>
// // // // // // // // // // //       <h1>Vite + React</h1>
// // // // // // // // // // //       <div className="card">
// // // // // // // // // // //         <button onClick={() => setCount((count) => count + 1)}>
// // // // // // // // // // //           count is {count}
// // // // // // // // // // //         </button>
// // // // // // // // // // //         <p>
// // // // // // // // // // //           Edit <code>src/App.jsx</code> and save to test HMR
// // // // // // // // // // //         </p>
// // // // // // // // // // //       </div>
// // // // // // // // // // //       <p className="read-the-docs">
// // // // // // // // // // //         Click on the Vite and React logos to learn more
// // // // // // // // // // //       </p>
// // // // // // // // // // //     </>
// // // // // // // // // // //   )
// // // // // // // // // // // }

// // // // // // // // // // // export default App
