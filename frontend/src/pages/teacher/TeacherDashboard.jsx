import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { teacherAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

import {
  HiClipboardCheck,
  HiCalendar,
  HiAcademicCap,
  HiBookOpen,
  HiDocumentText,
  HiUsers,
  HiPencilAlt,
  HiClipboardList,
  HiQuestionMarkCircle,
  HiSearch,
  HiMoon,
  HiSun,
  HiCheckCircle,
} from 'react-icons/hi';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    assigned_classes: 0,
    total_subjects: 0,
    total_tests: 0,
    recent_tests: [],
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherName, setTeacherName] = useState('');

  // ✅ Updated Quick Actions to follow the new 3-step Route logic + Mark Attendance
  const quickActions = [
    { 
      id: 1, 
      label: 'My Classes', 
      icon: HiUsers, 
      color: 'text-indigo-600', 
      path: '/teacher/classes' 
    },
    { 
      id: 2, 
      label: 'All Tests', 
      icon: HiClipboardList, 
      color: 'text-blue-600', 
      path: '/teacher/tests' 
    },
    { 
      id: 3, 
      label: 'Create Test', 
      icon: HiPencilAlt, 
      color: 'text-purple-600', 
      path: '/teacher/test/create', // ✅ Points to Step 1: Selection Page
    },
    { 
      id: 4, 
      label: 'Mark Attendance', 
      icon: HiCheckCircle, 
      color: 'text-orange-600', 
      path: '/teacher/attendance/mark' 
    },
    { 
      id: 5, 
      label: 'Assignments', 
      icon: HiBookOpen, 
      color: 'text-pink-600', 
      path: '/teacher/assignments' 
    },
    { 
      id: 6, 
      label: 'Student Doubts', 
      icon: HiQuestionMarkCircle, 
      color: 'text-red-600', 
      path: '/teacher/doubts' 
    },
    { 
      id: 7, 
      label: 'Attendance History', 
      icon: HiCalendar, 
      color: 'text-teal-600', 
      path: '/teacher/attendance/history' 
    },
  ];

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // fetchDashboardData
  //
  // ROOT CAUSE OF PREVIOUS CRASH:
  //   teacherAPI.getSubjects?.() returns `undefined` when the method doesn't
  //   exist on teacherAPI.  Promise.allSettled wraps that as:
  //     { status: 'fulfilled', value: undefined }
  //   So `responses[1].status === 'fulfilled'` is TRUE, and then
  //   `responses[1].value.data` throws "Cannot read properties of undefined".
  //
  // FIX:
  //   1. Call getDashboard() directly with await — cleaner, no allSettled needed.
  //   2. Extract subjects from the dashboard response (backend already sends
  //      teacher.subjects[]), so a separate getSubjects call is unnecessary.
  //   3. If getSubjects *does* exist on teacherAPI, call it safely afterward
  //      with its own try/catch so any failure never crashes the dashboard.
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ── Step 1: Dashboard (required) ──────────────────────────────────────
      const dashResponse = await teacherAPI.getDashboard();
      const data = dashResponse.data;

      console.log('Dashboard data received:', data);

      // ── Step 2: Populate stats cards ──────────────────────────────────────
      setDashboardData({
        assigned_classes: data.assigned_classes || 0,
        total_subjects:   data.total_subjects   || 0,
        total_tests:      data.total_tests       || 0,
        recent_tests:     data.recent_tests      || [],
      });

      // ── Step 3: Teacher name ──────────────────────────────────────────────
      if (data.teacher?.name) {
        setTeacherName(data.teacher.name);
      }

      // ── Step 4: Subjects — use what's already in the dashboard response ───
      //    Backend returns teacher.subjects[] so we never need a 2nd request.
      if (Array.isArray(data.teacher?.subjects)) {
        setSubjects(data.teacher.subjects);
      } else {
        setSubjects([]);
      }

      // ── Step 5: Optional separate getSubjects call (safe, isolated) ───────
      //    Only runs if the method actually exists on teacherAPI.
      //    Its own try/catch ensures a failure here NEVER affects the dashboard.
      if (typeof teacherAPI.getSubjects === 'function') {
        try {
          const subjectsRes = await teacherAPI.getSubjects();
          if (Array.isArray(subjectsRes?.data)) {
            setSubjects(subjectsRes.data);
          }
        } catch {
          // getSubjects failed — subjects already populated from dashboard ✓
        }
      }

    } catch (error) {
      console.error('Teacher dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">

        {/* ── Top Toolbar: Search & Theme Toggle ─────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search features (e.g. 'Attendance', 'Tests')..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-inner"
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark'
              ? <HiSun className="w-6 h-6" />
              : <HiMoon className="w-6 h-6 text-indigo-700" />
            }
            <span className="ml-2 text-sm font-medium md:hidden">Toggle Theme</span>
          </button>
        </div>

        {/* ── Welcome Card ────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome, {teacherName || user?.first_name || 'Teacher'} 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-lg opacity-90">
              Manage your classes, tests, attendance &amp; students efficiently.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</p>
                <p className="text-3xl font-bold dark:text-white">
                  {dashboardData.total_subjects}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <HiBookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Classes</p>
                <p className="text-3xl font-bold dark:text-white">
                  {dashboardData.assigned_classes}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <HiAcademicCap className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Created</p>
                <p className="text-3xl font-bold dark:text-white">
                  {dashboardData.total_tests}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <HiClipboardCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Quick Actions Grid ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold dark:text-white">Quick Actions</h2>
            {searchQuery && (
              <span className="text-sm text-indigo-600 font-medium">
                Found {filteredActions.length} results
              </span>
            )}
          </div>

          {filteredActions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredActions.map((action) => (
                <Card
                  key={action.id}
                  hover
                  className="text-center p-6 cursor-pointer group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className={`w-12 h-12 mx-auto mb-3 ${action.color} group-hover:scale-110 transition-transform`} />
                  <p className="font-semibold dark:text-gray-200">{action.label}</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <HiQuestionMarkCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No features found matching &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-indigo-600 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
























































































// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import { teacherAPI } from '../../services/api';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';

// import {
//   HiClipboardCheck,
//   HiCalendar,
//   HiAcademicCap,
//   HiBookOpen,
//   HiDocumentText,
//   HiUsers,
//   HiPencilAlt,
//   HiClipboardList,
//   HiQuestionMarkCircle,
//   HiSearch,
//   HiMoon,
//   HiSun,
//   HiCheckCircle,
// } from 'react-icons/hi';

// const TeacherDashboard = () => {
//   const { user } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const navigate = useNavigate();

//   const [dashboardData, setDashboardData] = useState({
//     assigned_classes: 0,
//     total_subjects: 0,
//     total_tests: 0,
//     recent_tests: [],
//   });

//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [teacherName, setTeacherName] = useState('');

//   // ✅ Updated Quick Actions to follow the new 3-step Route logic + Mark Attendance
//   const quickActions = [
//     { 
//       id: 1, 
//       label: 'My Classes', 
//       icon: HiUsers, 
//       color: 'text-indigo-600', 
//       path: '/teacher/classes' 
//     },
//     { 
//       id: 2, 
//       label: 'All Tests', 
//       icon: HiClipboardList, 
//       color: 'text-blue-600', 
//       path: '/teacher/tests' 
//     },
//     { 
//       id: 3, 
//       label: 'Create Test', 
//       icon: HiPencilAlt, 
//       color: 'text-purple-600', 
//       path: '/teacher/test/create' // ✅ Points to Step 1: Selection Page
//     },
//     { 
//       id: 4, 
//       label: 'Mark Attendance', 
//       icon: HiCheckCircle, 
//       color: 'text-orange-600', 
//       path: '/teacher/attendance/mark' 
//     },
//     { 
//       id: 5, 
//       label: 'Assignments', 
//       icon: HiBookOpen, 
//       color: 'text-pink-600', 
//       path: '/teacher/assignments' 
//     },
//     { 
//       id: 6, 
//       label: 'Student Doubts', 
//       icon: HiQuestionMarkCircle, 
//       color: 'text-red-600', 
//       path: '/teacher/doubts' 
//     },
//     { 
//       id: 7, 
//       label: 'Attendance History', 
//       icon: HiCalendar, 
//       color: 'text-teal-600', 
//       path: '/teacher/attendance/history' 
//     },
//   ];

//   const filteredActions = quickActions.filter(action =>
//     action.label.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const responses = await Promise.allSettled([
//         teacherAPI.getDashboard?.(),
//         teacherAPI.getSubjects?.(),
//       ]);

//       if (responses[0].status === 'fulfilled') {
//         const data = responses[0].value.data;
//         console.log('Dashboard data received:', data);
        
//         // ✅ Set dashboard statistics
//         setDashboardData({
//           assigned_classes: data.assigned_classes || 0,
//           total_subjects: data.total_subjects || 0,
//           total_tests: data.total_tests || 0,
//           recent_tests: data.recent_tests || [],
//         });
        
//         // ✅ Set teacher name from response
//         if (data.teacher && data.teacher.name) {
//           setTeacherName(data.teacher.name);
//         }
//       }

//       if (responses[1].status === 'fulfilled') {
//         setSubjects(responses[1].value.data);
//       } else {
//         setSubjects([]);
//       }
//     } catch (error) {
//       console.error('Teacher dashboard error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <Loading />
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-8 animate-fadeIn">
        
//         {/* Top Toolbar: Search & Theme Toggle */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
//           <div className="relative flex-1 max-w-md">
//             <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <HiSearch className="h-5 w-5 text-gray-400" />
//             </span>
//             <input
//               type="text"
//               placeholder="Search features (e.g. 'Attendance', 'Tests')..."
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
          
//           <button
//             onClick={toggleTheme}
//             className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-inner"
//             title="Toggle Light/Dark Mode"
//           >
//             {theme === 'dark' ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6 text-indigo-700" />}
//             <span className="ml-2 text-sm font-medium md:hidden">Toggle Theme</span>
//           </button>
//         </div>

//         {/* Welcome Card */}
//         <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
//           <div className="relative z-10">
//             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
//               Welcome, {teacherName || user?.first_name || 'Teacher'} 👋
//             </h1>
//             <p className="mt-2 text-indigo-100 text-lg opacity-90">
//               Manage your classes, tests, attendance & students efficiently.
//             </p>
//           </div>
//           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</p>
//                 <p className="text-3xl font-bold dark:text-white">
//                   {dashboardData.total_subjects}
//                 </p>
//               </div>
//               <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
//                 <HiBookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
//               </div>
//             </div>
//           </Card>

//           <Card className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Classes</p>
//                 <p className="text-3xl font-bold dark:text-white">
//                   {dashboardData.assigned_classes}
//                 </p>
//               </div>
//               <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
//                 <HiAcademicCap className="h-8 w-8 text-green-600 dark:text-green-400" />
//               </div>
//             </div>
//           </Card>

//           <Card className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Created</p>
//                 <p className="text-3xl font-bold dark:text-white">
//                   {dashboardData.total_tests}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
//                 <HiClipboardCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
//               </div>
//             </div>
//           </Card>
//         </div>

//         {/* Quick Actions Grid */}
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-bold dark:text-white">Quick Actions</h2>
//             {searchQuery && (
//               <span className="text-sm text-indigo-600 font-medium">
//                 Found {filteredActions.length} results
//               </span>
//             )}
//           </div>

//           {filteredActions.length > 0 ? (
//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
//               {filteredActions.map((action) => (
//                 <Card 
//                   key={action.id}
//                   hover 
//                   className="text-center p-6 cursor-pointer group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
//                   onClick={() => navigate(action.path)}
//                 >
//                   <action.icon className={`w-12 h-12 mx-auto mb-3 ${action.color} group-hover:scale-110 transition-transform`} />
//                   <p className="font-semibold dark:text-gray-200">{action.label}</p>
//                 </Card>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
//               <HiQuestionMarkCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
//               <p className="text-gray-500 dark:text-gray-400">No features found matching "{searchQuery}"</p>
//               <button 
//                 onClick={() => setSearchQuery('')}
//                 className="mt-2 text-indigo-600 font-semibold hover:underline"
//               >
//                 Clear search
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TeacherDashboard;



















// // import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { useAuth } from '../../context/AuthContext';
// // import { useTheme } from '../../context/ThemeContext';
// // import { teacherAPI } from '../../services/api';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Loading from '../../components/common/Loading';

// // import {
// //   HiClipboardCheck,
// //   HiCalendar,
// //   HiAcademicCap,
// //   HiBookOpen,
// //   HiDocumentText,
// //   HiUsers,
// //   HiPencilAlt,
// //   HiClipboardList,
// //   HiQuestionMarkCircle,
// //   HiSearch,
// //   HiMoon,
// //   HiSun,
// //   HiCheckCircle,
// // } from 'react-icons/hi';

// // const TeacherDashboard = () => {
// //   const { user } = useAuth();
// //   const { theme, toggleTheme } = useTheme();
// //   const navigate = useNavigate();

// //   const [dashboardData, setDashboardData] = useState({
// //     assigned_classes: 0,
// //     total_subjects: 0,
// //     total_tests: 0,
// //     recent_tests: [],
// //   });

// //   const [subjects, setSubjects] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState('');

// //   // ✅ Updated Quick Actions to follow the new 3-step Route logic + Mark Attendance
// //   const quickActions = [
// //     { 
// //       id: 1, 
// //       label: 'My Classes', 
// //       icon: HiUsers, 
// //       color: 'text-indigo-600', 
// //       path: '/teacher/classes' 
// //     },
// //     { 
// //       id: 2, 
// //       label: 'All Tests', 
// //       icon: HiClipboardList, 
// //       color: 'text-blue-600', 
// //       path: '/teacher/tests' 
// //     },
// //     { 
// //       id: 3, 
// //       label: 'Create Test', 
// //       icon: HiPencilAlt, 
// //       color: 'text-purple-600', 
// //       path: '/teacher/test/create' // ✅ Points to Step 1: Selection Page
// //     },
// //     { 
// //       id: 4, 
// //       label: 'Mark Attendance', 
// //       icon: HiCheckCircle, 
// //       color: 'text-orange-600', 
// //       path: '/teacher/attendance/mark' 
// //     },
// //     { 
// //       id: 5, 
// //       label: 'Assignments', 
// //       icon: HiBookOpen, 
// //       color: 'text-pink-600', 
// //       path: '/teacher/assignments' 
// //     },
// //     { 
// //       id: 6, 
// //       label: 'Student Doubts', 
// //       icon: HiQuestionMarkCircle, 
// //       color: 'text-red-600', 
// //       path: '/teacher/doubts' 
// //     },
// //     { 
// //       id: 7, 
// //       label: 'Attendance History', 
// //       icon: HiCalendar, 
// //       color: 'text-teal-600', 
// //       path: '/teacher/attendance/history' 
// //     },
// //   ];

// //   const filteredActions = quickActions.filter(action =>
// //     action.label.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   useEffect(() => {
// //     fetchDashboardData();
// //   }, []);

// //   const fetchDashboardData = async () => {
// //     try {
// //       setLoading(true);
// //       const responses = await Promise.allSettled([
// //         teacherAPI.getDashboard?.(),
// //         teacherAPI.getSubjects?.(),
// //       ]);

// //       if (responses[0].status === 'fulfilled') {
// //         setDashboardData(responses[0].value.data);
// //       }

// //       if (responses[1].status === 'fulfilled') {
// //         setSubjects(responses[1].value.data);
// //       } else {
// //         setSubjects([]);
// //       }
// //     } catch (error) {
// //       console.error('Teacher dashboard error:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <DashboardLayout>
// //         <Loading />
// //       </DashboardLayout>
// //     );
// //   }

// //   return (
// //     <DashboardLayout>
// //       <div className="space-y-8 animate-fadeIn">
        
// //         {/* Top Toolbar: Search & Theme Toggle */}
// //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
// //           <div className="relative flex-1 max-w-md">
// //             <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //               <HiSearch className="h-5 w-5 text-gray-400" />
// //             </span>
// //             <input
// //               type="text"
// //               placeholder="Search features (e.g. 'Attendance', 'Tests')..."
// //               className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm"
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //             />
// //           </div>
          
// //           <button
// //             onClick={toggleTheme}
// //             className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-inner"
// //             title="Toggle Light/Dark Mode"
// //           >
// //             {theme === 'dark' ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6 text-indigo-700" />}
// //             <span className="ml-2 text-sm font-medium md:hidden">Toggle Theme</span>
// //           </button>
// //         </div>

// //         {/* Welcome Card */}
// //         <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
// //           <div className="relative z-10">
// //             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
// //               Welcome, {user?.first_name || 'Teacher'} 👋
// //             </h1>
// //             <p className="mt-2 text-indigo-100 text-lg opacity-90">
// //               Manage your classes, tests, attendance & students efficiently.
// //             </p>
// //           </div>
// //           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
// //         </div>

// //         {/* Stats Grid */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //           <Card className="hover:shadow-md transition-shadow">
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</p>
// //                 <p className="text-3xl font-bold dark:text-white">
// //                   {dashboardData.total_subjects || subjects.length}
// //                 </p>
// //               </div>
// //               <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
// //                 <HiBookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
// //               </div>
// //             </div>
// //           </Card>

// //           <Card className="hover:shadow-md transition-shadow">
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Classes</p>
// //                 <p className="text-3xl font-bold dark:text-white">
// //                   {dashboardData.assigned_classes || 0}
// //                 </p>
// //               </div>
// //               <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
// //                 <HiAcademicCap className="h-8 w-8 text-green-600 dark:text-green-400" />
// //               </div>
// //             </div>
// //           </Card>

// //           <Card className="hover:shadow-md transition-shadow">
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Created</p>
// //                 <p className="text-3xl font-bold dark:text-white">
// //                   {dashboardData.total_tests || 0}
// //                 </p>
// //               </div>
// //               <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
// //                 <HiClipboardCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
// //               </div>
// //             </div>
// //           </Card>
// //         </div>

// //         {/* Quick Actions Grid */}
// //         <div>
// //           <div className="flex items-center justify-between mb-4">
// //             <h2 className="text-2xl font-bold dark:text-white">Quick Actions</h2>
// //             {searchQuery && (
// //               <span className="text-sm text-indigo-600 font-medium">
// //                 Found {filteredActions.length} results
// //               </span>
// //             )}
// //           </div>

// //           {filteredActions.length > 0 ? (
// //             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
// //               {filteredActions.map((action) => (
// //                 <Card 
// //                   key={action.id}
// //                   hover 
// //                   className="text-center p-6 cursor-pointer group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
// //                   onClick={() => navigate(action.path)}
// //                 >
// //                   <action.icon className={`w-12 h-12 mx-auto mb-3 ${action.color} group-hover:scale-110 transition-transform`} />
// //                   <p className="font-semibold dark:text-gray-200">{action.label}</p>
// //                 </Card>
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
// //               <HiQuestionMarkCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
// //               <p className="text-gray-500 dark:text-gray-400">No features found matching "{searchQuery}"</p>
// //               <button 
// //                 onClick={() => setSearchQuery('')}
// //                 className="mt-2 text-indigo-600 font-semibold hover:underline"
// //               >
// //                 Clear search
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default TeacherDashboard;



































// // // import { useState, useEffect } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { useAuth } from '../../context/AuthContext';
// // // import { useTheme } from '../../context/ThemeContext';
// // // import { teacherAPI } from '../../services/api';
// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // import Card from '../../components/common/Card';
// // // import Loading from '../../components/common/Loading';

// // // import {
// // //   HiClipboardCheck,
// // //   HiCalendar,
// // //   HiAcademicCap,
// // //   HiBookOpen,
// // //   HiDocumentText,
// // //   HiUsers,
// // //   HiPencilAlt,
// // //   HiClipboardList,
// // //   HiQuestionMarkCircle,
// // //   HiSearch,
// // //   HiMoon,
// // //   HiSun,
// // // } from 'react-icons/hi';

// // // const TeacherDashboard = () => {
// // //   const { user } = useAuth();
// // //   const { theme, toggleTheme } = useTheme();
// // //   const navigate = useNavigate();

// // //   const [dashboardData, setDashboardData] = useState({
// // //     assigned_classes: 0,
// // //     total_subjects: 0,
// // //     total_tests: 0,
// // //     recent_tests: [],
// // //   });

// // //   const [subjects, setSubjects] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [searchQuery, setSearchQuery] = useState('');

// // //   // ✅ Updated Quick Actions to follow the new 3-step Route logic
// // //   const quickActions = [
// // //     { 
// // //       id: 1, 
// // //       label: 'My Classes', 
// // //       icon: HiUsers, 
// // //       color: 'text-indigo-600', 
// // //       path: '/teacher/classes' 
// // //     },
// // //     { 
// // //       id: 2, 
// // //       label: 'All Tests', 
// // //       icon: HiClipboardList, 
// // //       color: 'text-blue-600', 
// // //       path: '/teacher/tests' 
// // //     },
// // //     { 
// // //       id: 3, 
// // //       label: 'Create Test', 
// // //       icon: HiPencilAlt, 
// // //       color: 'text-purple-600', 
// // //       path: '/teacher/test/create' // ✅ Points to Step 1: Selection Page
// // //     },
// // //     { 
// // //       id: 4, 
// // //       label: 'Assignments', 
// // //       icon: HiBookOpen, 
// // //       color: 'text-pink-600', 
// // //       path: '/teacher/assignments' 
// // //     },
// // //     { 
// // //       id: 5, 
// // //       label: 'Student Doubts', 
// // //       icon: HiQuestionMarkCircle, 
// // //       color: 'text-red-600', 
// // //       path: '/teacher/doubts' 
// // //     },
// // //     { 
// // //       id: 6, 
// // //       label: 'Attendance History', 
// // //       icon: HiCalendar, 
// // //       color: 'text-teal-600', 
// // //       path: '/teacher/attendance/history' 
// // //     },
// // //   ];

// // //   const filteredActions = quickActions.filter(action =>
// // //     action.label.toLowerCase().includes(searchQuery.toLowerCase())
// // //   );

// // //   useEffect(() => {
// // //     fetchDashboardData();
// // //   }, []);

// // //   const fetchDashboardData = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const responses = await Promise.allSettled([
// // //         teacherAPI.getDashboard?.(),
// // //         teacherAPI.getSubjects?.(),
// // //       ]);

// // //       if (responses[0].status === 'fulfilled') {
// // //         setDashboardData(responses[0].value.data);
// // //       }

// // //       if (responses[1].status === 'fulfilled') {
// // //         setSubjects(responses[1].value.data);
// // //       } else {
// // //         setSubjects([]);
// // //       }
// // //     } catch (error) {
// // //       console.error('Teacher dashboard error:', error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <DashboardLayout>
// // //         <Loading />
// // //       </DashboardLayout>
// // //     );
// // //   }

// // //   return (
// // //     <DashboardLayout>
// // //       <div className="space-y-8 animate-fadeIn">
        
// // //         {/* Top Toolbar: Search & Theme Toggle */}
// // //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
// // //           <div className="relative flex-1 max-w-md">
// // //             <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// // //               <HiSearch className="h-5 w-5 text-gray-400" />
// // //             </span>
// // //             <input
// // //               type="text"
// // //               placeholder="Search features (e.g. 'Attendance', 'Tests')..."
// // //               className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm"
// // //               value={searchQuery}
// // //               onChange={(e) => setSearchQuery(e.target.value)}
// // //             />
// // //           </div>
          
// // //           <button
// // //             onClick={toggleTheme}
// // //             className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-inner"
// // //             title="Toggle Light/Dark Mode"
// // //           >
// // //             {theme === 'dark' ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6 text-indigo-700" />}
// // //             <span className="ml-2 text-sm font-medium md:hidden">Toggle Theme</span>
// // //           </button>
// // //         </div>

// // //         {/* Welcome Card */}
// // //         <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
// // //           <div className="relative z-10">
// // //             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
// // //               Welcome, {user?.first_name || 'Teacher'} 👋
// // //             </h1>
// // //             <p className="mt-2 text-indigo-100 text-lg opacity-90">
// // //               Manage your classes, tests, attendance & students efficiently.
// // //             </p>
// // //           </div>
// // //           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
// // //         </div>

// // //         {/* Stats Grid */}
// // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // //           <Card className="hover:shadow-md transition-shadow">
// // //             <div className="flex justify-between items-center">
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</p>
// // //                 <p className="text-3xl font-bold dark:text-white">
// // //                   {dashboardData.total_subjects || subjects.length}
// // //                 </p>
// // //               </div>
// // //               <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
// // //                 <HiBookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
// // //               </div>
// // //             </div>
// // //           </Card>

// // //           <Card className="hover:shadow-md transition-shadow">
// // //             <div className="flex justify-between items-center">
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Classes</p>
// // //                 <p className="text-3xl font-bold dark:text-white">
// // //                   {dashboardData.assigned_classes || 0}
// // //                 </p>
// // //               </div>
// // //               <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
// // //                 <HiAcademicCap className="h-8 w-8 text-green-600 dark:text-green-400" />
// // //               </div>
// // //             </div>
// // //           </Card>

// // //           <Card className="hover:shadow-md transition-shadow">
// // //             <div className="flex justify-between items-center">
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Created</p>
// // //                 <p className="text-3xl font-bold dark:text-white">
// // //                   {dashboardData.total_tests || 0}
// // //                 </p>
// // //               </div>
// // //               <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
// // //                 <HiClipboardCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
// // //               </div>
// // //             </div>
// // //           </Card>
// // //         </div>

// // //         {/* Quick Actions Grid */}
// // //         <div>
// // //           <div className="flex items-center justify-between mb-4">
// // //             <h2 className="text-2xl font-bold dark:text-white">Quick Actions</h2>
// // //             {searchQuery && (
// // //               <span className="text-sm text-indigo-600 font-medium">
// // //                 Found {filteredActions.length} results
// // //               </span>
// // //             )}
// // //           </div>

// // //           {filteredActions.length > 0 ? (
// // //             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
// // //               {filteredActions.map((action) => (
// // //                 <Card 
// // //                   key={action.id}
// // //                   hover 
// // //                   className="text-center p-6 cursor-pointer group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
// // //                   onClick={() => navigate(action.path)}
// // //                 >
// // //                   <action.icon className={`w-12 h-12 mx-auto mb-3 ${action.color} group-hover:scale-110 transition-transform`} />
// // //                   <p className="font-semibold dark:text-gray-200">{action.label}</p>
// // //                 </Card>
// // //               ))}
// // //             </div>
// // //           ) : (
// // //             <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
// // //               <HiQuestionMarkCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
// // //               <p className="text-gray-500 dark:text-gray-400">No features found matching "{searchQuery}"</p>
// // //               <button 
// // //                 onClick={() => setSearchQuery('')}
// // //                 className="mt-2 text-indigo-600 font-semibold hover:underline"
// // //               >
// // //                 Clear search
// // //               </button>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // };

// // // export default TeacherDashboard;

















