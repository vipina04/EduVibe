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

  // ✅ Updated Quick Actions to follow the new 3-step Route logic
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
      path: '/teacher/test/create' // ✅ Points to Step 1: Selection Page
    },
    { 
      id: 4, 
      label: 'Assignments', 
      icon: HiBookOpen, 
      color: 'text-pink-600', 
      path: '/teacher/assignments' 
    },
    { 
      id: 5, 
      label: 'Student Doubts', 
      icon: HiQuestionMarkCircle, 
      color: 'text-red-600', 
      path: '/teacher/doubts' 
    },
    { 
      id: 6, 
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const responses = await Promise.allSettled([
        teacherAPI.getDashboard?.(),
        teacherAPI.getSubjects?.(),
      ]);

      if (responses[0].status === 'fulfilled') {
        setDashboardData(responses[0].value.data);
      }

      if (responses[1].status === 'fulfilled') {
        setSubjects(responses[1].value.data);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Teacher dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        
        {/* Top Toolbar: Search & Theme Toggle */}
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
            {theme === 'dark' ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6 text-indigo-700" />}
            <span className="ml-2 text-sm font-medium md:hidden">Toggle Theme</span>
          </button>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome, {user?.first_name || 'Teacher'} 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-lg opacity-90">
              Manage your classes, tests, attendance & students efficiently.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</p>
                <p className="text-3xl font-bold dark:text-white">
                  {dashboardData.total_subjects || subjects.length}
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
                  {dashboardData.assigned_classes || 0}
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
                  {dashboardData.total_tests || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <HiClipboardCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Grid */}
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
              <p className="text-gray-500 dark:text-gray-400">No features found matching "{searchQuery}"</p>
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
// import { useTheme } from '../../context/ThemeContext'; // Assuming you have this context
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
// } from 'react-icons/hi';

// const TeacherDashboard = () => {
//   const { user } = useAuth();
//   const { theme, toggleTheme } = useTheme(); // Hook for theme management
//   const navigate = useNavigate();

//   const [dashboardData, setDashboardData] = useState({
//     assigned_classes: 0,
//     total_subjects: 0,
//     total_tests: 0,
//     recent_tests: [],
//   });

//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState(''); // State for search

//   // Define actions for searchability
//   const quickActions = [
//     // { id: 1, label: 'My Classes', icon: HiUsers, color: 'text-indigo-600', path: '/teacher/classes' },
//     // { id: 2, label: 'Chapters', icon: HiDocumentText, color: 'text-green-600', path: '/teacher/chapters' },
//     // { id: 3, label: 'All Tests', icon: HiClipboardList, color: 'text-blue-600', path: '/teacher/TeacherAllTests' },
   
//   //  { id: 3, label: 'All Tests', icon: HiClipboardList, color: 'text-blue-600', path: '/teacher/tests' },  
//     // { id: 4, label: 'Create Test', icon: HiPencilAlt, color: 'text-purple-600', path: '/teacher/tests/create' },  
//    { id: 4, label: 'Create Test', icon: HiPencilAlt, color: 'text-purple-600', path: '/teacher/test/create' },
   
//   { id: 1, label: 'My Classes', icon: HiUsers, color: 'text-indigo-600', path: '/teacher/classes' },
//   { id: 2, label: 'All Tests', icon: HiClipboardList, color: 'text-blue-600', path: '/teacher/tests' },
//   { id: 3, label: 'Assignments', icon: HiBookOpen, color: 'text-pink-600', path: '/teacher/assignments' },
//   { id: 4, label: 'Student Doubts', icon: HiQuestionMarkCircle, color: 'text-red-600', path: '/teacher/doubts' },









//     // { id: 4, label: 'Create Test', icon: HiPencilAlt, color: 'text-purple-600', path: '/teacher/TeacherAllTests/create' },
//     // { id: 5, label: 'Attendance', icon: HiCalendar, color: 'text-orange-600', path: '/teacher/attendance' },
//     { id: 6, label: 'Attendance History', icon: HiCalendar, color: 'text-teal-600', path: '/teacher/attendance/history' },
//     // { id: 7, label: 'Assignments', icon: HiBookOpen, color: 'text-pink-600', path: '/teacher/assignments' },
//     // { id: 8, label: 'Student Doubts', icon: HiQuestionMarkCircle, color: 'text-red-600', path: '/teacher/doubts' },
//   ];

//   // Filter actions based on search
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
//         setDashboardData(responses[0].value.data);
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
//             className="flex items-center justify-center p-2 rounded-lg bg-gray-00 dark:bg--700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-inner"
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
//               Welcome, {user?.first_name || 'Teacher'} 👋
//             </h1>
//             <p className="mt-2 text-indigo-100 text-lg opacity-90">
//               Manage your classes, tests, attendance & students efficiently.
//             </p>
//           </div>
//           {/* Decorative background shape */}
//           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</p>
//                 <p className="text-3xl font-bold dark:text-white">
//                   {dashboardData.total_subjects || subjects.length}
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
//                   {dashboardData.assigned_classes || 0}
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
//                   {dashboardData.total_tests || 0}
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
// // } from 'react-icons/hi';

// // const TeacherDashboard = () => {
// //   const { user } = useAuth();
// //   const navigate = useNavigate();

// //   const [dashboardData, setDashboardData] = useState({
// //     assigned_classes: 0,
// //     total_subjects: 0,
// //     total_tests: 0,
// //     recent_tests: [],
// //   });

// //   const [subjects, setSubjects] = useState([]);
// //   const [loading, setLoading] = useState(true);

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
// //       <div className="space-y-8">

// //         {/* Welcome */}
// //         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
// //           <h1 className="text-3xl font-bold">
// //             Welcome, {user?.first_name || 'Teacher'} 👋
// //           </h1>
// //           <p className="mt-2 text-indigo-100">
// //             Manage your classes, tests, attendance & students
// //           </p>
// //         </div>

// //         {/* Stats */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //           <Card>
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <p className="text-sm">Subjects</p>
// //                 <p className="text-3xl font-bold">
// //                   {dashboardData.total_subjects || subjects.length}
// //                 </p>
// //               </div>
// //               <HiBookOpen className="h-12 w-12" />
// //             </div>
// //           </Card>

// //           <Card>
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <p className="text-sm">Classes</p>
// //                 <p className="text-3xl font-bold">
// //                   {dashboardData.assigned_classes || 0}
// //                 </p>
// //               </div>
// //               <HiAcademicCap className="h-12 w-12" />
// //             </div>
// //           </Card>

// //           <Card>
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <p className="text-sm">Tests Created</p>
// //                 <p className="text-3xl font-bold">
// //                   {dashboardData.total_tests || 0}
// //                 </p>
// //               </div>
// //               <HiClipboardCheck className="h-12 w-12" />
// //             </div>
// //           </Card>
// //         </div>

// //         {/* Quick Actions */}
// //         <div>
// //           <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

// //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/classes')}>
// //               <HiUsers className="w-10 h-10 mx-auto mb-2 text-indigo-600" />
// //               <p className="font-semibold">My Classes</p>
// //             </Card>

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/chapters')}>
// //               <HiDocumentText className="w-10 h-10 mx-auto mb-2 text-green-600" />
// //               <p className="font-semibold">Chapters</p>
// //             </Card>

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/tests')}>
// //               <HiClipboardList className="w-10 h-10 mx-auto mb-2 text-blue-600" />
// //               <p className="font-semibold">All Tests</p>
// //             </Card>

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/tests/create')}>
// //               <HiPencilAlt className="w-10 h-10 mx-auto mb-2 text-purple-600" />
// //               <p className="font-semibold">Create Test</p>
// //             </Card>

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/attendance')}>
// //               <HiCalendar className="w-10 h-10 mx-auto mb-2 text-orange-600" />
// //               <p className="font-semibold">Attendance</p>
// //             </Card>

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/attendance/history')}>
// //               <HiCalendar className="w-10 h-10 mx-auto mb-2 text-teal-600" />
// //               <p className="font-semibold">Attendance History</p>
// //             </Card>

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/assignments')}>
// //               <HiBookOpen className="w-10 h-10 mx-auto mb-2 text-pink-600" />
// //               <p className="font-semibold">Assignments</p>
// //             </Card>

// //             <Card hover className="text-center p-6 cursor-pointer"
// //               onClick={() => navigate('/teacher/doubts')}>
// //               <HiQuestionMarkCircle className="w-10 h-10 mx-auto mb-2 text-red-600" />
// //               <p className="font-semibold">Student Doubts</p>
// //             </Card>

// //           </div>
// //         </div>

// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default TeacherDashboard;

























// // // import { useState, useEffect } from 'react';
// // // import { Link, useNavigate } from 'react-router-dom';
// // // import { useAuth } from '../../context/AuthContext';
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
// // // } from 'react-icons/hi';

// // // const TeacherDashboard = () => {
// // //   const { user } = useAuth();
// // //   const navigate = useNavigate();

// // //   const [dashboardData, setDashboardData] = useState({
// // //     assigned_classes: 0,
// // //     total_subjects: 0,
// // //     total_tests: 0,
// // //     recent_tests: [],
// // //   });

// // //   const [subjects, setSubjects] = useState([]);
// // //   const [loading, setLoading] = useState(true);

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
// // //       <div className="space-y-8">

// // //         {/* Welcome */}
// // //         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
// // //           <h1 className="text-3xl font-bold">
// // //             Welcome, {user?.first_name || 'Teacher'} 👋
// // //           </h1>
// // //           <p className="mt-2 text-indigo-100">
// // //             Manage your classes, tests, attendance & students
// // //           </p>
// // //         </div>

// // //         {/* Stats */}
// // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // //           <Card>
// // //             <div className="flex justify-between items-center">
// // //               <div>
// // //                 <p className="text-sm">Subjects</p>
// // //                 <p className="text-3xl font-bold">
// // //                   {dashboardData.total_subjects || subjects.length}
// // //                 </p>
// // //               </div>
// // //               <HiBookOpen className="h-12 w-12" />
// // //             </div>
// // //           </Card>

// // //           <Card>
// // //             <div className="flex justify-between items-center">
// // //               <div>
// // //                 <p className="text-sm">Classes</p>
// // //                 <p className="text-3xl font-bold">
// // //                   {dashboardData.assigned_classes || 0}
// // //                 </p>
// // //               </div>
// // //               <HiAcademicCap className="h-12 w-12" />
// // //             </div>
// // //           </Card>

// // //           <Card>
// // //             <div className="flex justify-between items-center">
// // //               <div>
// // //                 <p className="text-sm">Tests Created</p>
// // //                 <p className="text-3xl font-bold">
// // //                   {dashboardData.total_tests || 0}
// // //                 </p>
// // //               </div>
// // //               <HiClipboardCheck className="h-12 w-12" />
// // //             </div>
// // //           </Card>
// // //         </div>

// // //         {/* ✅ QUICK ACTIONS (THIS IS THE KEY PART) */}
// // //         <div>
// // //           <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

// // //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">

// // //             <Link to="/teacher/classes">
// // //               <Card hover className="text-center p-6">
// // //                 <HiUsers className="w-10 h-10 mx-auto mb-2 text-indigo-600" />
// // //                 <p className="font-semibold">My Classes</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/teacher/chapters">
// // //               <Card hover className="text-center p-6">
// // //                 <HiDocumentText className="w-10 h-10 mx-auto mb-2 text-green-600" />
// // //                 <p className="font-semibold">Chapters</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/teacher/tests">
// // //               <Card hover className="text-center p-6">
// // //                 <HiClipboardList className="w-10 h-10 mx-auto mb-2 text-blue-600" />
// // //                 <p className="font-semibold">All Tests</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/teacher/tests/create">
// // //               <Card hover className="text-center p-6">
// // //                 <HiPencilAlt className="w-10 h-10 mx-auto mb-2 text-purple-600" />
// // //                 <p className="font-semibold">Create Test</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/teacher/attendance">
// // //               <Card hover className="text-center p-6">
// // //                 <HiCalendar className="w-10 h-10 mx-auto mb-2 text-orange-600" />
// // //                 <p className="font-semibold">Attendance</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/teacher/attendance/history">
// // //               <Card hover className="text-center p-6">
// // //                 <HiCalendar className="w-10 h-10 mx-auto mb-2 text-teal-600" />
// // //                 <p className="font-semibold">Attendance History</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/teacher/assignments">
// // //               <Card hover className="text-center p-6">
// // //                 <HiBookOpen className="w-10 h-10 mx-auto mb-2 text-pink-600" />
// // //                 <p className="font-semibold">Assignments</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/teacher/doubts">
// // //               <Card hover className="text-center p-6">
// // //                 <HiQuestionMarkCircle className="w-10 h-10 mx-auto mb-2 text-red-600" />
// // //                 <p className="font-semibold">Student Doubts</p>
// // //               </Card>
// // //             </Link>

// // //           </div>
// // //         </div>

// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // };

// // // export default TeacherDashboard;




























// // // // import { useState, useEffect } from 'react';
// // // // import { useNavigate } from 'react-router-dom';
// // // // import { useAuth } from '../../context/AuthContext';
// // // // import { teacherAPI } from '../../services/api';
// // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // import Card from '../../components/common/Card';
// // // // import Loading from '../../components/common/Loading';

// // // // import {
// // // //   HiClipboardCheck,
// // // //   HiCalendar,
// // // //   HiAcademicCap,
// // // // } from 'react-icons/hi';

// // // // // Icons
// // // // import { HiBookOpen } from 'react-icons/hi2';

// // // // const TeacherDashboard = () => {
// // // //   const { user } = useAuth();
// // // //   const navigate = useNavigate();

// // // //   const [dashboardData, setDashboardData] = useState({
// // // //     assigned_classes: 0,
// // // //     total_subjects: 0,
// // // //     total_tests: 0,
// // // //     recent_tests: []
// // // //   });

// // // //   const [subjects, setSubjects] = useState([]);
// // // //   const [loading, setLoading] = useState(true);

// // // //   useEffect(() => {
// // // //     fetchDashboardData();
// // // //   }, []);

// // // //   const fetchDashboardData = async () => {
// // // //     try {
// // // //       setLoading(true);

// // // //       const responses = await Promise.allSettled([
// // // //         teacherAPI.getDashboard?.(),
// // // //         teacherAPI.getSubjects?.(),
// // // //       ]);

// // // //       if (responses[0].status === 'fulfilled') {
// // // //         setDashboardData(responses[0].value.data);
// // // //       }

// // // //       if (responses[1].status === 'fulfilled') {
// // // //         setSubjects(responses[1].value.data);
// // // //       } else {
// // // //         setSubjects([]);
// // // //       }

// // // //     } catch (error) {
// // // //       console.error('Teacher dashboard error:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <DashboardLayout>
// // // //         <Loading />
// // // //       </DashboardLayout>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <DashboardLayout>
// // // //       <div className="space-y-8">

// // // //         {/* Welcome */}
// // // //         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
// // // //           <h1 className="text-3xl font-bold">
// // // //             Welcome, {user?.first_name || 'Teacher'}!
// // // //           </h1>
// // // //           <p className="mt-2 text-indigo-100">
// // // //             Manage your classes, tests, attendance and assignments
// // // //           </p>
// // // //         </div>

// // // //         {/* Stats */}
// // // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // // //           <Card>
// // // //             <div className="flex justify-between items-center">
// // // //               <div>
// // // //                 <p className="text-sm">Subjects</p>
// // // //                 <p className="text-3xl font-bold">
// // // //                   {dashboardData.total_subjects || subjects.length}
// // // //                 </p>
// // // //               </div>
// // // //               <HiBookOpen className="h-12 w-12" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card>
// // // //             <div className="flex justify-between items-center">
// // // //               <div>
// // // //                 <p className="text-sm">Classes</p>
// // // //                 <p className="text-3xl font-bold">
// // // //                   {dashboardData.assigned_classes || 0}
// // // //                 </p>
// // // //               </div>
// // // //               <HiAcademicCap className="h-12 w-12" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card>
// // // //             <div className="flex justify-between items-center">
// // // //               <div>
// // // //                 <p className="text-sm">Tests Created</p>
// // // //                 <p className="text-3xl font-bold">
// // // //                   {dashboardData.total_tests || 0}
// // // //                 </p>
// // // //               </div>
// // // //               <HiClipboardCheck className="h-12 w-12" />
// // // //             </div>
// // // //           </Card>
// // // //         </div>

// // // //         {/* 🔹 QUICK ACTIONS SECTION (NEW) */}
// // // //         <div>
// // // //           <h2 className="text-2xl font-bold mb-4">Teacher Tools</h2>

// // // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// // // //             <Card onClick={() => navigate('/teacher/classes')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">My Classes</h3>
// // // //               <p className="text-sm text-gray-500">View assigned classes</p>
// // // //             </Card>

// // // //             <Card onClick={() => navigate('/teacher/chapters')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">Chapters</h3>
// // // //               <p className="text-sm text-gray-500">Manage chapters</p>
// // // //             </Card>

// // // //             <Card onClick={() => navigate('/teacher/tests')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">All Tests</h3>
// // // //               <p className="text-sm text-gray-500">View & manage tests</p>
// // // //             </Card>

// // // //             <Card onClick={() => navigate('/teacher/tests/create')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">Create Test</h3>
// // // //               <p className="text-sm text-gray-500">Create new test</p>
// // // //             </Card>

// // // //             <Card onClick={() => navigate('/teacher/attendance')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">Mark Attendance</h3>
// // // //               <p className="text-sm text-gray-500">Daily attendance</p>
// // // //             </Card>

// // // //             <Card onClick={() => navigate('/teacher/attendance/history')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">Attendance History</h3>
// // // //               <p className="text-sm text-gray-500">View past records</p>
// // // //             </Card>

// // // //             <Card onClick={() => navigate('/teacher/assignments')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">Assignments</h3>
// // // //               <p className="text-sm text-gray-500">Manage assignments</p>
// // // //             </Card>

// // // //             <Card onClick={() => navigate('/teacher/doubts')} className="cursor-pointer hover:shadow-lg">
// // // //               <h3 className="font-semibold text-lg">Student Doubts</h3>
// // // //               <p className="text-sm text-gray-500">Reply to doubts</p>
// // // //             </Card>

// // // //           </div>
// // // //         </div>

// // // //         {/* Subjects */}
// // // //         <div>
// // // //           <h2 className="text-2xl font-bold mb-4">My Subjects</h2>

// // // //           {subjects.length === 0 ? (
// // // //             <Card>
// // // //               <p className="text-center text-gray-500 py-6">
// // // //                 No subjects assigned yet.
// // // //               </p>
// // // //             </Card>
// // // //           ) : (
// // // //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // //               {subjects.map(subject => (
// // // //                 <Card
// // // //                   key={subject.id}
// // // //                   className="cursor-pointer hover:shadow-lg"
// // // //                   onClick={() =>
// // // //                     navigate(`/teacher/subject/${subject.id}`)
// // // //                   }
// // // //                 >
// // // //                   <h3 className="text-lg font-semibold">
// // // //                     {subject.name}
// // // //                   </h3>
// // // //                   <p className="text-sm text-gray-500">
// // // //                     Class {subject.class_name}
// // // //                   </p>
// // // //                 </Card>
// // // //               ))}
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //       </div>
// // // //     </DashboardLayout>
// // // //   );
// // // // };

// // // // export default TeacherDashboard;















// // // // // import { useState, useEffect } from 'react';
// // // // // import { useNavigate } from 'react-router-dom';
// // // // // import { useAuth } from '../../context/AuthContext';
// // // // // import { teacherAPI } from '../../services/api';
// // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // import Card from '../../components/common/Card';
// // // // // import Loading from '../../components/common/Loading';

// // // // // import {
// // // // //   HiClipboardCheck,
// // // // //   HiCalendar,
// // // // //   HiAcademicCap,
// // // // // } from 'react-icons/hi';

// // // // // // ✅ FIX: HiBook does NOT exist
// // // // // import { HiBookOpen } from 'react-icons/hi2';

// // // // // const TeacherDashboard = () => {
// // // // //   const { user } = useAuth();
// // // // //   const navigate = useNavigate();

// // // // //   const [dashboardData, setDashboardData] = useState({
// // // // //     assigned_classes: 0,
// // // // //     total_subjects: 0,
// // // // //     total_tests: 0,
// // // // //     recent_tests: []
// // // // //   });

// // // // //   const [subjects, setSubjects] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);

// // // // //   useEffect(() => {
// // // // //     fetchDashboardData();
// // // // //   }, []);

// // // // //   const fetchDashboardData = async () => {
// // // // //     try {
// // // // //       setLoading(true);

// // // // //       const responses = await Promise.allSettled([
// // // // //         teacherAPI.getDashboard?.(),
// // // // //         teacherAPI.getSubjects?.(),
// // // // //       ]);

// // // // //       // Dashboard response
// // // // //       if (responses[0].status === 'fulfilled') {
// // // // //         setDashboardData(responses[0].value.data);
// // // // //       }

// // // // //       // Subjects response (404 safe)
// // // // //       if (responses[1].status === 'fulfilled') {
// // // // //         setSubjects(responses[1].value.data);
// // // // //       } else {
// // // // //         setSubjects([]); // 👈 prevent crash
// // // // //       }

// // // // //     } catch (error) {
// // // // //       console.error('Teacher dashboard error:', error);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <DashboardLayout>
// // // // //         <Loading />
// // // // //       </DashboardLayout>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <DashboardLayout>
// // // // //       <div className="space-y-6">

// // // // //         {/* Welcome */}
// // // // //         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
// // // // //           <h1 className="text-3xl font-bold">
// // // // //             Welcome, {user?.first_name || 'Teacher'}!
// // // // //           </h1>
// // // // //           <p className="mt-2 text-indigo-100">
// // // // //             Manage your classes and tests
// // // // //           </p>
// // // // //         </div>

// // // // //         {/* Stats */}
// // // // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// // // // //           <Card>
// // // // //             <div className="flex justify-between items-center">
// // // // //               <div>
// // // // //                 <p className="text-sm">Subjects</p>
// // // // //                 <p className="text-3xl font-bold">
// // // // //                   {dashboardData.total_subjects || subjects.length}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <HiBookOpen className="h-12 w-12" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card>
// // // // //             <div className="flex justify-between items-center">
// // // // //               <div>
// // // // //                 <p className="text-sm">Classes</p>
// // // // //                 <p className="text-3xl font-bold">
// // // // //                   {dashboardData.assigned_classes || 0}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <HiAcademicCap className="h-12 w-12" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card>
// // // // //             <div className="flex justify-between items-center">
// // // // //               <div>
// // // // //                 <p className="text-sm">Tests Created</p>
// // // // //                 <p className="text-3xl font-bold">
// // // // //                   {dashboardData.total_tests || 0}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <HiClipboardCheck className="h-12 w-12" />
// // // // //             </div>
// // // // //           </Card>

// // // // //         </div>

// // // // //         {/* Subjects */}
// // // // //         <div>
// // // // //           <h2 className="text-2xl font-bold mb-4">My Subjects</h2>

// // // // //           {subjects.length === 0 ? (
// // // // //             <Card>
// // // // //               <p className="text-center text-gray-500 py-6">
// // // // //                 No subjects assigned yet.
// // // // //               </p>
// // // // //             </Card>
// // // // //           ) : (
// // // // //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // //               {subjects.map(subject => (
// // // // //                 <Card
// // // // //                   key={subject.id}
// // // // //                   className="cursor-pointer hover:shadow-lg"
// // // // //                   onClick={() =>
// // // // //                     navigate(`/teacher/subject/${subject.id}`)
// // // // //                   }
// // // // //                 >
// // // // //                   <h3 className="text-lg font-semibold">
// // // // //                     {subject.name}
// // // // //                   </h3>
// // // // //                   <p className="text-sm text-gray-500">
// // // // //                     Class {subject.class_name}
// // // // //                   </p>
// // // // //                 </Card>
// // // // //               ))}
// // // // //             </div>
// // // // //           )}
// // // // //         </div>

// // // // //       </div>
// // // // //     </DashboardLayout>
// // // // //   );
// // // // // };

// // // // // export default TeacherDashboard;



























// // // // // // import { useState, useEffect } from 'react';
// // // // // // import { useNavigate } from 'react-router-dom';
// // // // // // import { useAuth } from '../../context/AuthContext';
// // // // // // import { teacherAPI } from '../../services/api';
// // // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // // import Card from '../../components/common/Card';
// // // // // // import Loading from '../../components/common/Loading';
// // // // // // import { HiBookOpen, HiUserGroup, HiClipboardList, HiAcademicCap } from 'react-icons/hi';

// // // // // // const TeacherDashboard = () => {
// // // // // //   const { user } = useAuth();
// // // // // //   const navigate = useNavigate();
// // // // // //   const [dashboardData, setDashboardData] = useState({
// // // // // //     total_subjects: 0,
// // // // // //     total_classes: 0,
// // // // // //     total_students: 0,
// // // // // //     pending_grading: 0,
// // // // // //   });
// // // // // //   const [subjects, setSubjects] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);

// // // // // //   useEffect(() => {
// // // // // //     fetchDashboardData();
// // // // // //   }, []);

// // // // // //   const fetchDashboardData = async () => {
// // // // // //     try {
// // // // // //       setLoading(true);
      
// // // // // //       const [dashResponse, subjectsResponse] = await Promise.all([
// // // // // //         teacherAPI.getDashboard(),
// // // // // //         teacherAPI.getSubjects(),
// // // // // //       ]);

// // // // // //       setDashboardData(dashResponse.data);
// // // // // //       setSubjects(subjectsResponse.data);
// // // // // //     } catch (error) {
// // // // // //       console.error('Error fetching dashboard data:', error);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <DashboardLayout>
// // // // // //         <Loading />
// // // // // //       </DashboardLayout>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <DashboardLayout>
// // // // // //       <div className="space-y-6">
// // // // // //         {/* Welcome Section */}
// // // // // //         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
// // // // // //           <h1 className="text-3xl font-bold">Welcome, {user?.first_name}!</h1>
// // // // // //           <p className="mt-2 text-blue-100">
// // // // // //             Manage your classes and track student progress
// // // // // //           </p>
// // // // // //         </div>

// // // // // //         {/* Stats Grid */}
// // // // // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// // // // // //           <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-blue-600 dark:text-blue-400">Total Subjects</p>
// // // // // //                 <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
// // // // // //                   {dashboardData.total_subjects}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiBook className="h-12 w-12 text-blue-500" />
// // // // // //             </div>
// // // // // //           </Card>

// // // // // //           <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-green-600 dark:text-green-400">Total Classes</p>
// // // // // //                 <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
// // // // // //                   {dashboardData.total_classes}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiAcademicCap className="h-12 w-12 text-green-500" />
// // // // // //             </div>
// // // // // //           </Card>

// // // // // //           <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-purple-600 dark:text-purple-400">Total Students</p>
// // // // // //                 <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
// // // // // //                   {dashboardData.total_students}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiUserGroup className="h-12 w-12 text-purple-500" />
// // // // // //             </div>
// // // // // //           </Card>

// // // // // //           <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-orange-600 dark:text-orange-400">Pending Grading</p>
// // // // // //                 <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
// // // // // //                   {dashboardData.pending_grading}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiClipboardList className="h-12 w-12 text-orange-500" />
// // // // // //             </div>
// // // // // //           </Card>
// // // // // //         </div>

// // // // // //         {/* Subjects Section */}
// // // // // //         <div>
// // // // // //           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// // // // // //             My Subjects
// // // // // //           </h2>
          
// // // // // //           {subjects.length === 0 ? (
// // // // // //             <Card>
// // // // // //               <p className="text-center text-gray-500 py-8">
// // // // // //                 No subjects assigned yet.
// // // // // //               </p>
// // // // // //             </Card>
// // // // // //           ) : (
// // // // // //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // // //               {subjects.map((subject) => (
// // // // // //                 <Card
// // // // // //                   key={subject.id}
// // // // // //                   className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800"
// // // // // //                   onClick={() => navigate(`/teacher/subject/${subject.id}/classes`)}
// // // // // //                 >
// // // // // //                   <div className="flex items-start justify-between mb-4">
// // // // // //                     <div className="flex-1">
// // // // // //                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// // // // // //                         {subject.name}
// // // // // //                       </h3>
// // // // // //                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// // // // // //                         {subject.description || 'No description'}
// // // // // //                       </p>
// // // // // //                     </div>
// // // // // //                     <HiBook className="h-8 w-8 text-blue-500" />
// // // // // //                   </div>

// // // // // //                   <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
// // // // // //                     <div className="flex justify-between">
// // // // // //                       <span>Classes:</span>
// // // // // //                       <span className="font-medium text-gray-900 dark:text-white">
// // // // // //                         {subject.total_classes || 0}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                     <div className="flex justify-between">
// // // // // //                       <span>Students:</span>
// // // // // //                       <span className="font-medium text-gray-900 dark:text-white">
// // // // // //                         {subject.total_students || 0}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                     <div className="flex justify-between">
// // // // // //                       <span>Chapters:</span>
// // // // // //                       <span className="font-medium text-gray-900 dark:text-white">
// // // // // //                         {subject.total_chapters || 0}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   </div>

// // // // // //                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
// // // // // //                     <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
// // // // // //                       Manage Classes
// // // // // //                     </button>
// // // // // //                   </div>
// // // // // //                 </Card>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </div>

// // // // // //         {/* Quick Actions */}
// // // // // //         <div>
// // // // // //           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// // // // // //             Quick Actions
// // // // // //           </h2>
// // // // // //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // // // // //             <button
// // // // // //               onClick={() => navigate('/teacher/attendance')}
// // // // // //               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
// // // // // //             >
// // // // // //               <HiClipboardList className="h-8 w-8 text-green-500 mb-3" />
// // // // // //               <h3 className="font-semibold text-gray-900 dark:text-white">Mark Attendance</h3>
// // // // // //               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// // // // // //                 Take attendance for your classes
// // // // // //               </p>
// // // // // //             </button>

// // // // // //             <button
// // // // // //               onClick={() => navigate('/teacher/tests')}
// // // // // //               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
// // // // // //             >
// // // // // //               <HiAcademicCap className="h-8 w-8 text-blue-500 mb-3" />
// // // // // //               <h3 className="font-semibold text-gray-900 dark:text-white">Create Test</h3>
// // // // // //               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// // // // // //                 Create and manage tests
// // // // // //               </p>
// // // // // //             </button>

// // // // // //             <button
// // // // // //               onClick={() => navigate('/teacher/doubts')}
// // // // // //               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
// // // // // //             >
// // // // // //               <HiUserGroup className="h-8 w-8 text-purple-500 mb-3" />
// // // // // //               <h3 className="font-semibold text-gray-900 dark:text-white">Student Doubts</h3>
// // // // // //               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// // // // // //                 Answer student questions
// // // // // //               </p>
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </DashboardLayout>
// // // // // //   );
// // // // // // };

// // // // // // export default TeacherDashboard;














// // // // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // // // export default function TeacherDashboard() {
// // // // // // //   return (
// // // // // // //     <DashboardLayout>
// // // // // // //       <div className="p-6">
// // // // // // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard - Coming Soon</h1>
// // // // // // //       </div>
// // // // // // //     </DashboardLayout>
// // // // // // //   );
// // // // // // // }