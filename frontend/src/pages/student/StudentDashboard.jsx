import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiAcademicCap, 
  HiClipboardList, 
  HiCalendar, 
  HiCash,
  HiBookOpen,
  HiQuestionMarkCircle,
  HiBell,
  HiChartBar,
  HiTrendingUp,
  HiMoon,
  HiSun,
  HiSearch
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';


const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      console.log('🔄 Fetching student dashboard...');
      const response = await studentAPI.getDashboard();
      console.log('✅ Dashboard data:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('❌ Failed to load dashboard:', error);
      toast.error(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  const stats = data?.stats || {};
  const subjects = data?.subjects || [];
  const recentTests = data?.recent_tests || [];

  // ✅ Quick Actions Array with search keywords
  const quickActions = [
    { 
      id: 1,
      label: 'My Tests', 
      path: '/student/my-tests', 
      icon: HiClipboardList,
      color: 'text-blue-600',
      count: stats.tests_taken || 0,
      countLabel: 'completed'
    },
    { 
      id: 2,
      label: 'Assignments', 
      path: '/student/assignments', 
      icon: HiBookOpen,
      color: 'text-green-600',
      count: stats.pending_assignments || 0,
      countLabel: 'pending'
    },
    { 
      id: 3,
      label: 'Attendance', 
      path: '/student/attendance', 
      icon: HiCalendar,
      color: 'text-purple-600',
      count: stats.attendance_percentage || 0,
      countLabel: '%'
    },
    { 
      id: 4,
      label: 'Fee Payment', 
      path: '/student/fees', 
      icon: HiCash,
      color: 'text-orange-600',
      count: null,
      countLabel: ''
    },
    { 
      id: 5,
      label: 'My Subjects', 
      path: '/student/subjects', 
      icon: HiAcademicCap,
      color: 'text-indigo-600',
      count: subjects.length || 0,
      countLabel: 'subjects'
    },
    { 
      id: 6,
      label: 'Ask Doubt', 
      path: '/student/doubts', 
      icon: HiQuestionMarkCircle,
      color: 'text-red-600',
      count: null,
      countLabel: ''
    }
  ];

  // ✅ Filter quick actions based on search query
  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout setSearchQuery={setSearchQuery} searchQuery={searchQuery}>
      {/* Style element for smooth transitions */}
      <style>{`
        .theme-transition {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }
      `}</style>

      <div className="space-y-8 animate-fadeIn">

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name || user?.first_name || 'Student'}! 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-lg opacity-90">
              Track your progress, complete assignments & ace your tests.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card key="tests" className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Completed</p>
                <p className="text-3xl font-bold dark:text-white">{stats.tests_taken || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <HiClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card key="attendance" className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance</p>
                <p className="text-3xl font-bold dark:text-white">{stats.attendance_percentage || 0}%</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <HiCalendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card key="assignments" className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Assignments</p>
                <p className="text-3xl font-bold dark:text-white">{stats.pending_assignments || 0}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <HiBookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card key="score" className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
                <p className="text-3xl font-bold dark:text-white">{stats.average_score || 0}%</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <HiChartBar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* ✅ Quick Actions Grid with Search Filter */}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {filteredActions.map((action) => (
                <Link key={action.id} to={action.path}>
                  <Card 
                    hover 
                    className="text-center p-6 cursor-pointer group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <action.icon className={`w-12 h-12 mx-auto mb-3 ${action.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{action.label}</h3>
                    {action.count !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {action.count} {action.countLabel}
                      </p>
                    )}
                  </Card>
                </Link>
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

        {/* Recent Activity */}
        {recentTests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Tests</h2>
            <div className="grid gap-4">
              {recentTests.slice(0, 3).map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{test.test_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                         {test.subject} • {test.chapter}
                        </p>
                    </div>
                    <div className="text-right">
                      {/* <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {test.score || 0}/{test.marks}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round((test.score / test.marks) * 100)}%
                      </p> */}
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                       {test.score || 0}/{test.total_marks}
                      </p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                        {test.percentage || 0}%
                       </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;






























// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   HiAcademicCap, 
//   HiClipboardList, 
//   HiCalendar, 
//   HiCash,
//   HiBookOpen,
//   HiQuestionMarkCircle,
//   HiBell,
//   HiChartBar,
//   HiTrendingUp,
//   HiMoon,
//   HiSun,
//   HiSearch  // ✅ Added HiSearch icon
// } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Button from '../../components/common/Button';
// import Loading from '../../components/common/Loading';
// import { useAuth } from '../../context/AuthContext';
// import { studentAPI } from '../../services/api';
// import toast from 'react-hot-toast';


// const StudentDashboard = () => {
//   const { user } = useAuth();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState(''); // ✅ Added search state
  
//   // --- Theme Toggle Logic ---
//   const [darkMode, setDarkMode] = useState(
//     document.documentElement.classList.contains('dark')
//   );

//   const toggleTheme = () => {
//     if (darkMode) {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//       setDarkMode(false);
//     } else {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//       setDarkMode(true);
//     }
//   };
//   // ---------------------------

//   useEffect(() => {
//     fetchDashboard();
//   }, []);

//   const fetchDashboard = async () => {
//     try {
//       console.log('🔄 Fetching student dashboard...');
//       const response = await studentAPI.getDashboard();
//       console.log('✅ Dashboard data:', response.data);
//       setData(response.data);
//     } catch (error) {
//       console.error('❌ Failed to load dashboard:', error);
//       toast.error(error.response?.data?.error || 'Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   const stats = data?.stats || {};
//   const subjects = data?.subjects || [];
//   const recentTests = data?.recent_tests || [];

//   // ✅ Quick Actions Array with search keywords
//   const quickActions = [
//     { 
//       id: 1,
//       label: 'My Tests', 
//       path: '/student/my-tests', 
//       icon: HiClipboardList,
//       color: 'text-blue-600',
//       count: stats.tests_taken || 0,
//       countLabel: 'completed'
//     },
//     { 
//       id: 2,
//       label: 'Assignments', 
//       path: '/student/assignments', 
//       icon: HiBookOpen,
//       color: 'text-green-600',
//       count: stats.pending_assignments || 0,
//       countLabel: 'pending'
//     },
//     { 
//       id: 3,
//       label: 'Attendance', 
//       path: '/student/attendance', 
//       icon: HiCalendar,
//       color: 'text-purple-600',
//       count: stats.attendance_percentage || 0,
//       countLabel: '%'
//     },
//     { 
//       id: 4,
//       label: 'Fee Payment', 
//       path: '/student/fees', 
//       icon: HiCash,
//       color: 'text-orange-600',
//       count: null,
//       countLabel: ''
//     },
//     { 
//       id: 5,
//       label: 'My Subjects', 
//       path: '/student/subjects', 
//       icon: HiAcademicCap,
//       color: 'text-indigo-600',
//       count: subjects.length || 0,
//       countLabel: 'subjects'
//     },
//     { 
//       id: 6,
//       label: 'Ask Doubt', 
//       path: '/student/doubts', 
//       icon: HiQuestionMarkCircle,
//       color: 'text-red-600',
//       count: null,
//       countLabel: ''
//     }
//   ];

//   // ✅ Filter quick actions based on search query
//   const filteredActions = quickActions.filter(action =>
//     action.label.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <DashboardLayout setSearchQuery={setSearchQuery} searchQuery={searchQuery}>
//       {/* Style element for smooth transitions */}
//       <style>{`
//         .theme-transition {
//           transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
//         }
//       `}</style>

//       <div className="space-y-8 animate-fadeIn">
        
//         {/* ✅ Top Toolbar: Search & Theme Toggle */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
//           <div className="relative flex-1 max-w-md">
//             <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <HiSearch className="h-5 w-5 text-gray-400" />
//             </span>
//             <input
//               type="text"
//               placeholder="Search features (e.g. 'Tests', 'Fees')..."
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
//             {darkMode ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6 text-indigo-700" />}
//             <span className="ml-2 text-sm font-medium md:hidden">Toggle Theme</span>
//           </button>
//         </div>

//         {/* Welcome Header */}
//         <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
//           <div className="relative z-10">
//             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
//               Welcome back, {user?.full_name || user?.first_name || 'Student'}! 👋
//             </h1>
//             <p className="mt-2 text-indigo-100 text-lg opacity-90">
//               Track your progress, complete assignments & ace your tests.
//             </p>
//           </div>
//           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {/* <Card className="hover:shadow-md transition-shadow"> */}
//           <Card key="tests" className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Completed</p>
//                 <p className="text-3xl font-bold dark:text-white">{stats.tests_taken || 0}</p>
//               </div>
//               <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//                 <HiClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
//               </div>
//             </div>
//           </Card>

//           {/* <Card className="hover:shadow-md transition-shadow"> */}
//             <Card key="attendance" className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance</p>
//                 <p className="text-3xl font-bold dark:text-white">{stats.attendance_percentage || 0}%</p>
//               </div>
//               <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
//                 <HiCalendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
//               </div>
//             </div>
//           </Card>

//           {/* <Card className="hover:shadow-md transition-shadow"> */}
//             <Card key="assignments" className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Assignments</p>
//                 <p className="text-3xl font-bold dark:text-white">{stats.pending_assignments || 0}</p>
//               </div>
//               <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
//                 <HiBookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
//               </div>
//             </div>
//           </Card>

//           {/* <Card className="hover:shadow-md transition-shadow"> */}
//             <Card key="score" className="hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
//                 <p className="text-3xl font-bold dark:text-white">{stats.average_score || 0}%</p>
//               </div>
//               <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
//                 <HiChartBar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
//               </div>
//             </div>
//           </Card>
//         </div>

//         {/* ✅ Quick Actions Grid with Search Filter */}
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
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//               {filteredActions.map((action) => (
//                 <Link key={action.id} to={action.path}>
//                   <Card 
//                     hover 
//                     className="text-center p-6 cursor-pointer group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
//                   >
//                     <action.icon className={`w-12 h-12 mx-auto mb-3 ${action.color} group-hover:scale-110 transition-transform`} />
//                     <h3 className="font-semibold text-gray-900 dark:text-white">{action.label}</h3>
//                     {action.count !== null && (
//                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                         {action.count} {action.countLabel}
//                       </p>
//                     )}
//                   </Card>
//                 </Link>
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

//         {/* Recent Activity */}
//         {recentTests.length > 0 && (
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Tests</h2>
//             <div className="grid gap-4">
//               {recentTests.slice(0, 3).map((test) => (
//                 <Card key={test.id} className="hover:shadow-md transition-shadow">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <h3 className="font-semibold text-gray-900 dark:text-white">{test.test_name}</h3>
//                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                          {test.subject} • {test.chapter}
//                         </p>
//                     </div>
//                     <div className="text-right">
//                       {/* <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//                         {test.score || 0}/{test.marks}
//                       </p>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         {Math.round((test.score / test.marks) * 100)}%
//                       </p> */}
//                       <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//                        {test.score || 0}/{test.total_marks}
//                       </p>
//                        <p className="text-sm text-gray-500 dark:text-gray-400">
//                         {test.percentage || 0}%
//                        </p>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default StudentDashboard;





















// // import { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import { 
// //   HiAcademicCap, 
// //   HiClipboardList, 
// //   HiCalendar, 
// //   HiCash,
// //   HiBookOpen,
// //   HiQuestionMarkCircle,
// //   HiBell,
// //   HiChartBar,
// //   HiTrendingUp,
// //   HiMoon, // Added for theme toggle
// //   HiSun   // Added for theme toggle
// // } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Button from '../../components/common/Button';
// // import Loading from '../../components/common/Loading';
// // import { useAuth } from '../../context/AuthContext';
// // import { studentAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const StudentDashboard = () => {
// //   const { user } = useAuth();
// //   const [data, setData] = useState(null);
// //   const [loading, setLoading] = useState(true);
  
// //   // --- Theme Toggle Logic ---
// //   const [darkMode, setDarkMode] = useState(
// //     document.documentElement.classList.contains('dark')
// //   );

// //   const toggleTheme = () => {
// //     if (darkMode) {
// //       document.documentElement.classList.remove('dark');
// //       localStorage.setItem('theme', 'light');
// //       setDarkMode(false);
// //     } else {
// //       document.documentElement.classList.add('dark');
// //       localStorage.setItem('theme', 'dark');
// //       setDarkMode(true);
// //     }
// //   };
// //   // ---------------------------

// //   useEffect(() => {
// //     fetchDashboard();
// //   }, []);

// //   const fetchDashboard = async () => {
// //     try {
// //       console.log('🔄 Fetching student dashboard...');
// //       const response = await studentAPI.getDashboard();
// //       console.log('✅ Dashboard data:', response.data);
// //       setData(response.data);
// //     } catch (error) {
// //       console.error('❌ Failed to load dashboard:', error);
// //       toast.error(error.response?.data?.error || 'Failed to load dashboard data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) return <Loading fullScreen />;

// //   const stats = data?.stats || {};
// //   const subjects = data?.subjects || [];
// //   const recentTests = data?.recent_tests || [];

// //   return (
// //     <DashboardLayout>
// //       {/* Style element for smooth transitions */}
// //       <style>{`
// //         .theme-transition transition {
// //           transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
// //         }
// //       `}</style>

// //       <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-950 theme-transition">
// //         {/* Welcome Header with Theme Toggle */}
// //         <div className="mb-8 flex justify-between items-start">
// //           <div>
// //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// //               Welcome back, {user?.full_name || 'Student'}! 👋
// //             </h1>
// //             <p className="text-gray-600 dark:text-gray-400 mt-2">
// //               Here's what's happening with your studies today
// //             </p>
// //           </div>
          
// //           {/* Theme Toggle Button */}
// //           <button 
// //             onClick={toggleTheme}
// //             className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-yellow-400 hover:scale-110 transition-all"
// //           >
// //             {darkMode ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6" />}
// //           </button>
// //         </div>

// //         {/* Stats Cards - Row 1 */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
// //           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-blue-100 mb-1">Total Subjects</p>
// //                 <p className="text-3xl font-bold">{stats.total_subjects || 0}</p>
// //               </div>
// //               <HiAcademicCap className="w-12 h-12 opacity-80" />
// //             </div>
// //           </Card>

// //           <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-green-100 mb-1">Tests Taken</p>
// //                 <p className="text-3xl font-bold">{stats.tests_taken || 0}</p>
// //                 <p className="text-xs text-green-100 mt-1">Avg: {stats.average_score || 0}%</p>
// //               </div>
// //               <HiClipboardList className="w-12 h-12 opacity-80" />
// //             </div>
// //           </Card>

// //           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-purple-100 mb-1">Attendance</p>
// //                 <p className="text-3xl font-bold">{stats.attendance_percentage || 0}%</p>
// //               </div>
// //               <HiCalendar className="w-12 h-12 opacity-80" />
// //             </div>
// //           </Card>

// //           <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-orange-100 mb-1">Pending Tasks</p>
// //                 <p className="text-3xl font-bold">{stats.pending_assignments || 0}</p>
// //               </div>
// //               <HiBookOpen className="w-12 h-12 opacity-80" />
// //             </div>
// //           </Card>
// //         </div>

// //         {/* Stats Cards - Row 2 (Additional Info) */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
// //           <Card className="bg-white dark:bg-gray-800 shadow-lg p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Pending Doubts</p>
// //                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_doubts || 0}</p>
// //               </div>
// //               <HiQuestionMarkCircle className="w-10 h-10 text-red-600" />
// //             </div>
// //           </Card>

// //           <Card className="bg-white dark:bg-gray-800 shadow-lg p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Fee Status</p>
// //                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
// //                   ₹{stats.paid_fees || 0} / ₹{stats.total_fees || 0}
// //                 </p>
// //                 {stats.pending_fees > 0 && (
// //                   <p className="text-xs text-red-600 mt-1">{stats.pending_fees} pending</p>
// //                 )}
// //               </div>
// //               <HiCash className="w-10 h-10 text-green-600" />
// //             </div>
// //           </Card>

// //           <Card className="bg-white dark:bg-gray-800 shadow-lg p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Notifications</p>
// //                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unread_notifications || 0}</p>
// //                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unread</p>
// //               </div>
// //               <HiBell className="w-10 h-10 text-indigo-600" />
// //             </div>
// //           </Card>
// //         </div>

// //         {/* Quick Actions */}
// //         <div className="mb-8">
// //           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// //             Quick Actions
// //           </h2>
// //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
// //             <Link to="/student/my-tests">
// //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center h-full">
// //                 <HiClipboardList className="w-10 h-10 text-blue-600 mx-auto mb-3" />
// //                 <h3 className="font-semibold text-gray-900 dark:text-white">My Tests</h3>
// //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.tests_taken || 0} completed</p>
// //               </Card>
// //             </Link>

// //             <Link to="/student/assignments">
// //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center h-full">
// //                 <HiBookOpen className="w-10 h-10 text-green-600 mx-auto mb-3" />
// //                 <h3 className="font-semibold text-gray-900 dark:text-white">Assignments</h3>
// //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// //                   {stats.pending_assignments || 0} pending
// //                 </p>
// //               </Card>
// //             </Link>

// //             <Link to="/student/attendance">
// //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center h-full">
// //                 <HiCalendar className="w-10 h-10 text-purple-600 mx-auto mb-3" />
// //                 <h3 className="font-semibold text-gray-900 dark:text-white">Attendance</h3>
// //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.attendance_percentage || 0}%</p>
// //               </Card>
// //             </Link>

// //             <Link to="/student/fees">
// //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center h-full">
// //                 <HiCash className="w-10 h-10 text-orange-600 mx-auto mb-3" />
// //                 <h3 className="font-semibold text-gray-900 dark:text-white">Fees</h3>
// //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View status</p>
// //               </Card>
// //             </Link>

// //             <Link to="/student/doubts">
// //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center h-full">
// //                 <HiQuestionMarkCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
// //                 <h3 className="font-semibold text-gray-900 dark:text-white">Ask Doubts</h3>
// //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// //                   {stats.pending_doubts || 0} pending
// //                 </p>
// //               </Card>
// //             </Link>

// //             <Link to="/student/notifications">
// //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center relative h-full">
// //                 <HiBell className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
// //                 {stats.unread_notifications > 0 && (
// //                   <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
// //                     {stats.unread_notifications}
// //                   </span>
// //                 )}
// //                 <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
// //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// //                   {stats.unread_notifications || 0} new
// //                 </p>
// //               </Card>
// //             </Link>
// //           </div>
// //         </div>

// //         {/* Two Column Layout: Subjects + Recent Tests */}
// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //           {/* My Subjects */}
// //           <div className="lg:col-span-2">
// //             <div className="flex items-center justify-between mb-6">
// //               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
// //                 My Subjects
// //               </h2>
// //               <HiChartBar className="w-6 h-6 text-gray-400" />
// //             </div>

// //             {subjects.length > 0 ? (
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {subjects.map((subject) => (
// //                   <Link key={subject.id} to={`/student/subject/${subject.id}`}>
// //                     <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 h-full">
// //                       <div className="flex items-start justify-between mb-4">
// //                         <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
// //                           <HiAcademicCap className="w-6 h-6 text-blue-600" />
// //                         </div>
// //                         <span className="text-xs text-gray-500 dark:text-gray-400">
// //                           {subject.chapters_count} chapters
// //                         </span>
// //                       </div>

// //                       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
// //                         {subject.name}
// //                       </h3>

// //                       <div className="space-y-2">
// //                         <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
// //                           <span className="mr-2">👨‍🏫</span>
// //                           <span>{subject.teacher_name}</span>
// //                         </div>
// //                         {subject.next_class && (
// //                           <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
// //                             <span className="mr-2">📅</span>
// //                             <span>Next: {subject.next_class}</span>
// //                           </div>
// //                         )}
// //                       </div>

// //                       <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
// //                         <Button variant="ghost" size="sm" className="w-full">
// //                           View Details →
// //                         </Button>
// //                       </div>
// //                     </Card>
// //                   </Link>
// //                 ))}
// //               </div>
// //             ) : (
// //               <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// //                 <p className="text-gray-600 dark:text-gray-400">
// //                   No subjects enrolled yet
// //                 </p>
// //               </Card>
// //             )}
// //           </div>

// //           {/* Recent Test Results */}
// //           <div>
// //             <div className="flex items-center justify-between mb-6">
// //               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
// //                 Recent Tests
// //               </h2>
// //               <HiTrendingUp className="w-6 h-6 text-gray-400" />
// //             </div>

// //             {recentTests.length > 0 ? (
// //               <div className="space-y-4">
// //                 {recentTests.map((test) => (
// //                   <Card key={test.id} className="bg-white dark:bg-gray-800 shadow-lg p-4">
// //                     <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
// //                       {test.test_name}
// //                     </h3>
// //                     <div className="flex items-center justify-between text-sm">
// //                       <span className="text-gray-600 dark:text-gray-400">{test.date}</span>
// //                       <span className={`font-semibold ${
// //                         test.percentage >= 75 ? 'text-green-600' :
// //                         test.percentage >= 50 ? 'text-yellow-600' :
// //                         'text-red-600'
// //                       }`}>
// //                         {test.percentage}%
// //                       </span>
// //                     </div>
// //                     <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
// //                       Score: {test.score} / {test.total_marks}
// //                     </div>
// //                   </Card>
// //                 ))}
// //                 <Link to="/student/my-tests">
// //                   <Button variant="outline" className="w-full" size="sm">
// //                     View All Tests
// //                   </Button>
// //                 </Link>
// //               </div>
// //             ) : (
// //               <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// //                 <p className="text-gray-600 dark:text-gray-400">
// //                   No tests taken yet
// //                 </p>
// //               </Card>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default StudentDashboard;




























// // // import { useState, useEffect } from 'react';
// // // import { Link } from 'react-router-dom';
// // // import { 
// // //   HiAcademicCap, 
// // //   HiClipboardList, 
// // //   HiCalendar, 
// // //   HiCash,
// // //   HiBookOpen,
// // //   HiQuestionMarkCircle,
// // //   HiBell,
// // //   HiChartBar,
// // //   HiTrendingUp
// // // } from 'react-icons/hi';
// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // import Card from '../../components/common/Card';
// // // import Button from '../../components/common/Button';
// // // import Loading from '../../components/common/Loading';
// // // import { useAuth } from '../../context/AuthContext';
// // // import { studentAPI } from '../../services/api';
// // // import toast from 'react-hot-toast';

// // // const StudentDashboard = () => {
// // //   const { user } = useAuth();
// // //   const [data, setData] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     fetchDashboard();
// // //   }, []);

// // //   const fetchDashboard = async () => {
// // //   try {
// // //     console.log('🔄 Fetching student dashboard...');
// // //     const response = await studentAPI.getDashboard();
// // //     console.log('✅ Dashboard data:', response.data);
// // //     setData(response.data);
// // //   } catch (error) {
// // //     console.error('❌ Failed to load dashboard:', error);
// // //     console.error('Error details:', error.response?.data);
// // //     toast.error(error.response?.data?.error || 'Failed to load dashboard data');
// // //   } finally {
// // //     setLoading(false);
// // //   }
// // // };

// // //   if (loading) return <Loading fullScreen />;

// // //   const stats = data?.stats || {};
// // //   const subjects = data?.subjects || [];
// // //   const recentTests = data?.recent_tests || [];

// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6">
// // //         {/* Welcome Header */}
// // //         <div className="mb-8">
// // //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // //             Welcome back, {user?.full_name || 'Student'}! 👋
// // //           </h1>
// // //           <p className="text-gray-600 dark:text-gray-400 mt-2">
// // //             Here's what's happening with your studies today
// // //           </p>
// // //         </div>

// // //         {/* Stats Cards - Row 1 */}
// // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
// // //           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg p-6">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-blue-100 mb-1">Total Subjects</p>
// // //                 <p className="text-3xl font-bold">{stats.total_subjects || 0}</p>
// // //               </div>
// // //               <HiAcademicCap className="w-12 h-12 opacity-80" />
// // //             </div>
// // //           </Card>

// // //           <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg p-6">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-green-100 mb-1">Tests Taken</p>
// // //                 <p className="text-3xl font-bold">{stats.tests_taken || 0}</p>
// // //                 <p className="text-xs text-green-100 mt-1">Avg: {stats.average_score || 0}%</p>
// // //               </div>
// // //               <HiClipboardList className="w-12 h-12 opacity-80" />
// // //             </div>
// // //           </Card>

// // //           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg p-6">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-purple-100 mb-1">Attendance</p>
// // //                 <p className="text-3xl font-bold">{stats.attendance_percentage || 0}%</p>
// // //               </div>
// // //               <HiCalendar className="w-12 h-12 opacity-80" />
// // //             </div>
// // //           </Card>

// // //           <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg p-6">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-orange-100 mb-1">Pending Tasks</p>
// // //                 <p className="text-3xl font-bold">{stats.pending_assignments || 0}</p>
// // //               </div>
// // //               <HiBookOpen className="w-12 h-12 opacity-80" />
// // //             </div>
// // //           </Card>
// // //         </div>

// // //         {/* Stats Cards - Row 2 (Additional Info) */}
// // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
// // //           <Card className="bg-white dark:bg-gray-800 shadow-lg p-6">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Pending Doubts</p>
// // //                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_doubts || 0}</p>
// // //               </div>
// // //               <HiQuestionMarkCircle className="w-10 h-10 text-red-600" />
// // //             </div>
// // //           </Card>

// // //           <Card className="bg-white dark:bg-gray-800 shadow-lg p-6">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Fee Status</p>
// // //                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
// // //                   ₹{stats.paid_fees || 0} / ₹{stats.total_fees || 0}
// // //                 </p>
// // //                 {stats.pending_fees > 0 && (
// // //                   <p className="text-xs text-red-600 mt-1">{stats.pending_fees} pending</p>
// // //                 )}
// // //               </div>
// // //               <HiCash className="w-10 h-10 text-green-600" />
// // //             </div>
// // //           </Card>

// // //           <Card className="bg-white dark:bg-gray-800 shadow-lg p-6">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Notifications</p>
// // //                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unread_notifications || 0}</p>
// // //                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unread</p>
// // //               </div>
// // //               <HiBell className="w-10 h-10 text-indigo-600" />
// // //             </div>
// // //           </Card>
// // //         </div>

// // //         {/* Quick Actions */}
// // //         <div className="mb-8">
// // //           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// // //             Quick Actions
// // //           </h2>
// // //           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// // //             <Link to="/student/my-tests">
// // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // //                 <HiClipboardList className="w-10 h-10 text-blue-600 mx-auto mb-3" />
// // //                 <h3 className="font-semibold text-gray-900 dark:text-white">My Tests</h3>
// // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.tests_taken || 0} completed</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/student/assignments">
// // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // //                 <HiBookOpen className="w-10 h-10 text-green-600 mx-auto mb-3" />
// // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Assignments</h3>
// // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// // //                   {stats.pending_assignments || 0} pending
// // //                 </p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/student/attendance">
// // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // //                 <HiCalendar className="w-10 h-10 text-purple-600 mx-auto mb-3" />
// // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Attendance</h3>
// // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.attendance_percentage || 0}%</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/student/fees">
// // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // //                 <HiCash className="w-10 h-10 text-orange-600 mx-auto mb-3" />
// // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Fees</h3>
// // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View status</p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/student/doubts">
// // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // //                 <HiQuestionMarkCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
// // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Ask Doubts</h3>
// // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// // //                   {stats.pending_doubts || 0} pending
// // //                 </p>
// // //               </Card>
// // //             </Link>

// // //             <Link to="/student/notifications">
// // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center relative">
// // //                 <HiBell className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
// // //                 {stats.unread_notifications > 0 && (
// // //                   <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
// // //                     {stats.unread_notifications}
// // //                   </span>
// // //                 )}
// // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
// // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// // //                   {stats.unread_notifications || 0} new
// // //                 </p>
// // //               </Card>
// // //             </Link>
// // //           </div>
// // //         </div>

// // //         {/* Two Column Layout: Subjects + Recent Tests */}
// // //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// // //           {/* My Subjects */}
// // //           <div className="lg:col-span-2">
// // //             <div className="flex items-center justify-between mb-6">
// // //               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
// // //                 My Subjects
// // //               </h2>
// // //               <HiChartBar className="w-6 h-6 text-gray-400" />
// // //             </div>

// // //             {subjects.length > 0 ? (
// // //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // //                 {subjects.map((subject) => (
// // //                   <Link key={subject.id} to={`/student/subject/${subject.id}`}>
// // //                     <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 h-full">
// // //                       <div className="flex items-start justify-between mb-4">
// // //                         <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
// // //                           <HiAcademicCap className="w-6 h-6 text-blue-600" />
// // //                         </div>
// // //                         <span className="text-xs text-gray-500 dark:text-gray-400">
// // //                           {subject.chapters_count} chapters
// // //                         </span>
// // //                       </div>

// // //                       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
// // //                         {subject.name}
// // //                       </h3>

// // //                       <div className="space-y-2">
// // //                         <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
// // //                           <span className="mr-2">👨‍🏫</span>
// // //                           <span>{subject.teacher_name}</span>
// // //                         </div>
// // //                         {subject.next_class && (
// // //                           <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
// // //                             <span className="mr-2">📅</span>
// // //                             <span>Next: {subject.next_class}</span>
// // //                           </div>
// // //                         )}
// // //                       </div>

// // //                       <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
// // //                         <Button variant="ghost" size="sm" className="w-full">
// // //                           View Details →
// // //                         </Button>
// // //                       </div>
// // //                     </Card>
// // //                   </Link>
// // //                 ))}
// // //               </div>
// // //             ) : (
// // //               <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// // //                 <p className="text-gray-600 dark:text-gray-400">
// // //                   No subjects enrolled yet
// // //                 </p>
// // //               </Card>
// // //             )}
// // //           </div>

// // //           {/* Recent Test Results */}
// // //           <div>
// // //             <div className="flex items-center justify-between mb-6">
// // //               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
// // //                 Recent Tests
// // //               </h2>
// // //               <HiTrendingUp className="w-6 h-6 text-gray-400" />
// // //             </div>

// // //             {recentTests.length > 0 ? (
// // //               <div className="space-y-4">
// // //                 {recentTests.map((test) => (
// // //                   <Card key={test.id} className="bg-white dark:bg-gray-800 shadow-lg p-4">
// // //                     <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
// // //                       {test.test_name}
// // //                     </h3>
// // //                     <div className="flex items-center justify-between text-sm">
// // //                       <span className="text-gray-600 dark:text-gray-400">{test.date}</span>
// // //                       <span className={`font-semibold ${
// // //                         test.percentage >= 75 ? 'text-green-600' :
// // //                         test.percentage >= 50 ? 'text-yellow-600' :
// // //                         'text-red-600'
// // //                       }`}>
// // //                         {test.percentage}%
// // //                       </span>
// // //                     </div>
// // //                     <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
// // //                       Score: {test.score} / {test.total_marks}
// // //                     </div>
// // //                   </Card>
// // //                 ))}
// // //                 <Link to="/student/my-tests">
// // //                   <Button variant="outline" className="w-full" size="sm">
// // //                     View All Tests
// // //                   </Button>
// // //                 </Link>
// // //               </div>
// // //             ) : (
// // //               <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// // //                 <p className="text-gray-600 dark:text-gray-400">
// // //                   No tests taken yet
// // //                 </p>
// // //               </Card>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // };

// // // export default StudentDashboard;


























// // // // import { useState, useEffect } from 'react';
// // // // import { Link } from 'react-router-dom';
// // // // import { 
// // // //   HiAcademicCap, 
// // // //   HiClipboardList, 
// // // //   HiCalendar, 
// // // //   HiCash,
// // // //   HiBookOpen,
// // // //   HiQuestionMarkCircle,
// // // //   HiBell,
// // // //   HiChartBar
// // // // } from 'react-icons/hi';
// // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // import Card from '../../components/common/Card';
// // // // import Button from '../../components/common/Button';
// // // // import Loading from '../../components/common/Loading';
// // // // import { useAuth } from '../../context/AuthContext';
// // // // import { studentAPI } from '../../services/api';
// // // // import toast from 'react-hot-toast';

// // // // const StudentDashboard = () => {
// // // //   const { user } = useAuth();
// // // //   const [data, setData] = useState(null);
// // // //   const [loading, setLoading] = useState(true);

// // // //   useEffect(() => {
// // // //     fetchDashboard();
// // // //   }, []);

// // // //   const fetchDashboard = async () => {
// // // //     try {
// // // //       const response = await studentAPI.getDashboard();
// // // //       setData(response.data);
// // // //     } catch (error) {
// // // //       console.error('Failed to load dashboard:', error);
// // // //       // Use mock data if API fails
// // // //       setData({
// // // //         subjects: [
// // // //           { id: 1, name: 'Mathematics', chapters_count: 12, teacher_name: 'Mr. Kumar' },
// // // //           { id: 2, name: 'Physics', chapters_count: 10, teacher_name: 'Dr. Sharma' },
// // // //           { id: 3, name: 'Chemistry', chapters_count: 11, teacher_name: 'Mrs. Patel' },
// // // //         ],
// // // //         tests_taken: 15,
// // // //         attendance_percentage: 92,
// // // //         pending_assignments: 3,
// // // //         unread_notifications: 5,
// // // //       });
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   if (loading) return <Loading fullScreen />;

// // // //   return (
// // // //     <DashboardLayout>
// // // //       <div className="p-6">
// // // //         {/* Welcome Header */}
// // // //         <div className="mb-8">
// // // //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // // //             Welcome back, {user?.full_name || 'Student'}! 👋
// // // //           </h1>
// // // //           <p className="text-gray-600 dark:text-gray-400 mt-2">
// // // //             Here's what's happening with your studies today
// // // //           </p>
// // // //         </div>

// // // //         {/* Stats Cards */}
// // // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
// // // //           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg p-6">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-blue-100 mb-1">Total Subjects</p>
// // // //                 <p className="text-3xl font-bold">{data?.subjects?.length || 0}</p>
// // // //               </div>
// // // //               <HiAcademicCap className="w-12 h-12 opacity-80" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg p-6">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-green-100 mb-1">Tests Taken</p>
// // // //                 <p className="text-3xl font-bold">{data?.tests_taken || 0}</p>
// // // //               </div>
// // // //               <HiClipboardList className="w-12 h-12 opacity-80" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg p-6">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-purple-100 mb-1">Attendance</p>
// // // //                 <p className="text-3xl font-bold">{data?.attendance_percentage || 0}%</p>
// // // //               </div>
// // // //               <HiCalendar className="w-12 h-12 opacity-80" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg p-6">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-orange-100 mb-1">Pending Tasks</p>
// // // //                 <p className="text-3xl font-bold">{data?.pending_assignments || 0}</p>
// // // //               </div>
// // // //               <HiBookOpen className="w-12 h-12 opacity-80" />
// // // //             </div>
// // // //           </Card>
// // // //         </div>

// // // //         {/* Quick Actions */}
// // // //         <div className="mb-8">
// // // //           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// // // //             Quick Actions
// // // //           </h2>
// // // //           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// // // //             <Link to="/student/my-tests">
// // // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // // //                 <HiClipboardList className="w-10 h-10 text-blue-600 mx-auto mb-3" />
// // // //                 <h3 className="font-semibold text-gray-900 dark:text-white">My Tests</h3>
// // // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View all tests</p>
// // // //               </Card>
// // // //             </Link>

// // // //             <Link to="/student/assignments">
// // // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // // //                 <HiBookOpen className="w-10 h-10 text-green-600 mx-auto mb-3" />
// // // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Assignments</h3>
// // // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// // // //                   {data?.pending_assignments || 0} pending
// // // //                 </p>
// // // //               </Card>
// // // //             </Link>

// // // //             <Link to="/student/attendance">
// // // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // // //                 <HiCalendar className="w-10 h-10 text-purple-600 mx-auto mb-3" />
// // // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Attendance</h3>
// // // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track record</p>
// // // //               </Card>
// // // //             </Link>

// // // //             <Link to="/student/fees">
// // // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // // //                 <HiCash className="w-10 h-10 text-orange-600 mx-auto mb-3" />
// // // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Fee Payments</h3>
// // // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View history</p>
// // // //               </Card>
// // // //             </Link>

// // // //             <Link to="/student/doubts">
// // // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
// // // //                 <HiQuestionMarkCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
// // // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Ask Doubts</h3>
// // // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get help</p>
// // // //               </Card>
// // // //             </Link>

// // // //             <Link to="/student/notifications">
// // // //               <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 text-center relative">
// // // //                 <HiBell className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
// // // //                 {data?.unread_notifications > 0 && (
// // // //                   <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
// // // //                     {data.unread_notifications}
// // // //                   </span>
// // // //                 )}
// // // //                 <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
// // // //                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// // // //                   {data?.unread_notifications || 0} new
// // // //                 </p>
// // // //               </Card>
// // // //             </Link>
// // // //           </div>
// // // //         </div>

// // // //         {/* My Subjects */}
// // // //         <div>
// // // //           <div className="flex items-center justify-between mb-6">
// // // //             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
// // // //               My Subjects
// // // //             </h2>
// // // //             <HiChartBar className="w-6 h-6 text-gray-400" />
// // // //           </div>

// // // //           {data?.subjects && data.subjects.length > 0 ? (
// // // //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // //               {data.subjects.map((subject) => (
// // // //                 <Link key={subject.id} to={`/student/subject/${subject.id}`}>
// // // //                   <Card hover className="bg-white dark:bg-gray-800 shadow-lg p-6 h-full">
// // // //                     <div className="flex items-start justify-between mb-4">
// // // //                       <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
// // // //                         <HiAcademicCap className="w-6 h-6 text-blue-600" />
// // // //                       </div>
// // // //                       <span className="text-xs text-gray-500 dark:text-gray-400">
// // // //                         {subject.chapters_count} chapters
// // // //                       </span>
// // // //                     </div>

// // // //                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
// // // //                       {subject.name}
// // // //                     </h3>

// // // //                     <div className="space-y-2">
// // // //                       <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
// // // //                         <span className="mr-2">👨‍🏫</span>
// // // //                         <span>{subject.teacher_name}</span>
// // // //                       </div>
// // // //                       {subject.next_class && (
// // // //                         <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
// // // //                           <span className="mr-2">📅</span>
// // // //                           <span>Next class: {subject.next_class}</span>
// // // //                         </div>
// // // //                       )}
// // // //                     </div>

// // // //                     <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
// // // //                       <Button variant="ghost" size="sm" className="w-full">
// // // //                         View Details →
// // // //                       </Button>
// // // //                     </div>
// // // //                   </Card>
// // // //                 </Link>
// // // //               ))}
// // // //             </div>
// // // //           ) : (
// // // //             <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// // // //               <p className="text-gray-600 dark:text-gray-400">
// // // //                 No subjects enrolled yet
// // // //               </p>
// // // //             </Card>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </DashboardLayout>
// // // //   );
// // // // };

// // // // export default StudentDashboard;
























// // // // // import { useState, useEffect } from 'react';
// // // // // import { useNavigate } from 'react-router-dom';
// // // // // import { useAuth } from '../../context/AuthContext';
// // // // // import { studentAPI } from '../../services/api';
// // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // import Card from '../../components/common/Card';
// // // // // import Loading from '../../components/common/Loading';

// // // // // import {
// // // // //   HiClipboardCheck,
// // // // //   HiCalendar,
// // // // //   HiCurrencyRupee,
// // // // //   HiAcademicCap,
// // // // // } from 'react-icons/hi';

// // // // // // ✅ FIX: HiBook DOES NOT EXIST — use HiBookOpen
// // // // // import { HiBookOpen } from 'react-icons/hi2';

// // // // // const StudentDashboard = () => {
// // // // //   const { user } = useAuth();
// // // // //   const navigate = useNavigate();

// // // // //   const [dashboardData, setDashboardData] = useState({
// // // // //     enrolled_subjects: 0,
// // // // //     completed_tests: 0,
// // // // //     attendance_percentage: 0,
// // // // //     pending_fees: 0,
// // // // //     upcoming_tests: []
// // // // //   });

// // // // //   const [subjects, setSubjects] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);

// // // // //   useEffect(() => {
// // // // //     fetchDashboardData();
// // // // //   }, []);

// // // // //   const fetchDashboardData = async () => {
// // // // //     try {
// // // // //       setLoading(true);

// // // // //       const [dashResponse, subjectsResponse] = await Promise.all([
// // // // //         studentAPI.getDashboard(),
// // // // //         studentAPI.getSubjects(),
// // // // //       ]);

// // // // //       setDashboardData(dashResponse.data);
// // // // //       setSubjects(subjectsResponse.data);
// // // // //     } catch (error) {
// // // // //       console.error('Error fetching dashboard data:', error);
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

// // // // //         <div className="bg-gradient-to-r from-teal-600 to-blue-800 rounded-xl p-6 text-white">
// // // // //           <h1 className="text-3xl font-bold">
// // // // //             Welcome back, {user?.first_name || 'Student'}!
// // // // //           </h1>
// // // // //           <p className="mt-2 text-teal-100">
// // // // //             Ready to continue your learning journey?
// // // // //           </p>
// // // // //         </div>

// // // // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// // // // //           <Card>
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-sm">Enrolled Subjects</p>
// // // // //                 <p className="text-3xl font-bold">
// // // // //                   {dashboardData.enrolled_subjects}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <HiBookOpen className="h-12 w-12" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card>
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-sm">Tests Completed</p>
// // // // //                 <p className="text-3xl font-bold">
// // // // //                   {dashboardData.completed_tests}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <HiClipboardCheck className="h-12 w-12" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card>
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-sm">Attendance</p>
// // // // //                 <p className="text-3xl font-bold">
// // // // //                   {dashboardData.attendance_percentage}%
// // // // //                 </p>
// // // // //               </div>
// // // // //               <HiCalendar className="h-12 w-12" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card>
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-sm">Pending Fees</p>
// // // // //                 <p className="text-3xl font-bold">
// // // // //                   ₹{dashboardData.pending_fees}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <HiCurrencyRupee className="h-12 w-12" />
// // // // //             </div>
// // // // //           </Card>

// // // // //         </div>
// // // // //       </div>
// // // // //     </DashboardLayout>
// // // // //   );
// // // // // };

// // // // // export default StudentDashboard;







































// // // // // // import { HiBook } from 'react-icons/hi';
// // // // // // import { useState, useEffect } from 'react';
// // // // // // import { useNavigate } from 'react-router-dom';
// // // // // // import { useAuth } from '../../context/AuthContext';
// // // // // // import { studentAPI } from '../../services/api';
// // // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // // import Card from '../../components/common/Card';
// // // // // // import Loading from '../../components/common/Loading';
// // // // // // import { HiClipboardCheck, HiCalendar, HiCurrencyRupee, HiAcademicCap } from 'react-icons/hi';

// // // // // // const StudentDashboard = () => {
// // // // // //   const { user } = useAuth();
// // // // // //   const navigate = useNavigate();
// // // // // //   const [dashboardData, setDashboardData] = useState({
// // // // // //     enrolled_subjects: 0,
// // // // // //     completed_tests: 0,
// // // // // //     attendance_percentage: 0,
// // // // // //     pending_fees: 0,
// // // // // //     upcoming_tests: []
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
// // // // // //         studentAPI.getDashboard(),
// // // // // //         studentAPI.getSubjects(),
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
// // // // // //         <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl p-6 text-white">
// // // // // //           <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}!</h1>
// // // // // //           <p className="mt-2 text-teal-100">
// // // // // //             Ready to continue your learning journey?
// // // // // //           </p>
// // // // // //         </div>

// // // // // //         {/* Stats Grid */}
// // // // // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// // // // // //           <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-blue-600 dark:text-blue-400">Enrolled Subjects</p>
// // // // // //                 <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
// // // // // //                   {dashboardData.enrolled_subjects}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiBook className="h-12 w-12 text-blue-500" />
// // // // // //             </div>
// // // // // //           </Card>

// // // // // //           <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-green-600 dark:text-green-400">Tests Completed</p>
// // // // // //                 <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
// // // // // //                   {dashboardData.completed_tests}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiClipboardCheck className="h-12 w-12 text-green-500" />
// // // // // //             </div>
// // // // // //           </Card>

// // // // // //           <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-purple-600 dark:text-purple-400">Attendance</p>
// // // // // //                 <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
// // // // // //                   {dashboardData.attendance_percentage}%
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiCalendar className="h-12 w-12 text-purple-500" />
// // // // // //             </div>
// // // // // //           </Card>

// // // // // //           <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
// // // // // //             <div className="flex items-center justify-between">
// // // // // //               <div>
// // // // // //                 <p className="text-sm text-orange-600 dark:text-orange-400">Pending Fees</p>
// // // // // //                 <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
// // // // // //                   ₹{dashboardData.pending_fees}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //               <HiCurrencyRupee className="h-12 w-12 text-orange-500" />
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
// // // // // //                 No subjects enrolled yet.
// // // // // //               </p>
// // // // // //             </Card>
// // // // // //           ) : (
// // // // // //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // // //               {subjects.map((subject) => (
// // // // // //                 <Card
// // // // // //                   key={subject.id}
// // // // // //                   className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800"
// // // // // //                   onClick={() => navigate(`/student/subject/${subject.id}`)}
// // // // // //                 >
// // // // // //                   <div className="flex items-start justify-between mb-4">
// // // // // //                     <div className="flex-1">
// // // // // //                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// // // // // //                         {subject.name}
// // // // // //                       </h3>
// // // // // //                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// // // // // //                         Class {subject.class_name}
// // // // // //                       </p>
// // // // // //                     </div>
// // // // // //                     <HiAcademicCap className="h-8 w-8 text-teal-500" />
// // // // // //                   </div>

// // // // // //                   <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
// // // // // //                     <div className="flex justify-between">
// // // // // //                       <span>Teacher:</span>
// // // // // //                       <span className="font-medium text-gray-900 dark:text-white">
// // // // // //                         {subject.teacher_name || 'Not Assigned'}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                     <div className="flex justify-between">
// // // // // //                       <span>Chapters:</span>
// // // // // //                       <span className="font-medium text-gray-900 dark:text-white">
// // // // // //                         {subject.total_chapters || 0}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                     <div className="flex justify-between">
// // // // // //                       <span>Progress:</span>
// // // // // //                       <span className="font-medium text-gray-900 dark:text-white">
// // // // // //                         {subject.progress || 0}%
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   </div>

// // // // // //                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
// // // // // //                     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
// // // // // //                       <div
// // // // // //                         className="bg-teal-600 h-2 rounded-full transition-all"
// // // // // //                         style={{ width: `${subject.progress || 0}%` }}
// // // // // //                       ></div>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </Card>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </div>

// // // // // //         {/* Upcoming Tests */}
// // // // // //         {dashboardData.upcoming_tests && dashboardData.upcoming_tests.length > 0 && (
// // // // // //           <div>
// // // // // //             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// // // // // //               Upcoming Tests
// // // // // //             </h2>
// // // // // //             <Card className="bg-white dark:bg-slate-800">
// // // // // //               <div className="space-y-4">
// // // // // //                 {dashboardData.upcoming_tests.map((test) => (
// // // // // //                   <div
// // // // // //                     key={test.id}
// // // // // //                     className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
// // // // // //                   >
// // // // // //                     <div className="flex-1">
// // // // // //                       <h4 className="font-medium text-gray-900 dark:text-white">
// // // // // //                         {test.title}
// // // // // //                       </h4>
// // // // // //                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// // // // // //                         {test.subject} - {test.chapter}
// // // // // //                       </p>
// // // // // //                     </div>
// // // // // //                     <div className="text-right">
// // // // // //                       <p className="text-sm font-medium text-gray-900 dark:text-white">
// // // // // //                         {new Date(test.scheduled_date).toLocaleDateString()}
// // // // // //                       </p>
// // // // // //                       <p className="text-xs text-gray-500 dark:text-gray-400">
// // // // // //                         {test.duration} minutes
// // // // // //                       </p>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 ))}
// // // // // //               </div>
// // // // // //             </Card>
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </DashboardLayout>
// // // // // //   );
// // // // // // };

// // // // // // export default StudentDashboard;
















// // // // // // // import { useState, useEffect } from 'react';
// // // // // // // import { Link } from 'react-router-dom';
// // // // // // // import { HiAcademicCap, HiClipboardList, HiCalendar } from 'react-icons/hi';
// // // // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // // // import Card from '../../components/common/Card';
// // // // // // // import Loading from '../../components/common/Loading';
// // // // // // // import { studentAPI } from '../../services/api';
// // // // // // // import toast from 'react-hot-toast';

// // // // // // // const StudentDashboard = () => {
// // // // // // //   const [data, setData] = useState(null);
// // // // // // //   const [loading, setLoading] = useState(true);

// // // // // // //   useEffect(() => {
// // // // // // //     fetchDashboard();
// // // // // // //   }, []);

// // // // // // //   const fetchDashboard = async () => {
// // // // // // //     try {
// // // // // // //       const response = await studentAPI.getDashboard();
// // // // // // //       setData(response.data);
// // // // // // //     } catch (error) {
// // // // // // //       toast.error('Failed to load dashboard');
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   if (loading) return <Loading fullScreen />;

// // // // // // //   return (
// // // // // // //     <DashboardLayout>
// // // // // // //       <div className="p-6">
// // // // // // //         <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
// // // // // // //           Welcome, {data?.student?.full_name}!
// // // // // // //         </h1>

// // // // // // //         {/* Stats Cards */}
// // // // // // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
// // // // // // //           <Card glass>
// // // // // // //             <div className="flex items-center justify-between">
// // // // // // //               <div>
// // // // // // //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Total Subjects</p>
// // // // // // //                 <p className="text-3xl font-bold text-blue-600">{data?.subjects?.length || 0}</p>
// // // // // // //               </div>
// // // // // // //               <HiAcademicCap className="w-12 h-12 text-blue-600 opacity-50" />
// // // // // // //             </div>
// // // // // // //           </Card>

// // // // // // //           <Card glass>
// // // // // // //             <div className="flex items-center justify-between">
// // // // // // //               <div>
// // // // // // //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Tests Taken</p>
// // // // // // //                 <p className="text-3xl font-bold text-green-600">{data?.tests_taken || 0}</p>
// // // // // // //               </div>
// // // // // // //               <HiClipboardList className="w-12 h-12 text-green-600 opacity-50" />
// // // // // // //             </div>
// // // // // // //           </Card>

// // // // // // //           <Card glass>
// // // // // // //             <div className="flex items-center justify-between">
// // // // // // //               <div>
// // // // // // //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Attendance</p>
// // // // // // //                 <p className="text-3xl font-bold text-purple-600">{data?.attendance_percentage || 0}%</p>
// // // // // // //               </div>
// // // // // // //               <HiCalendar className="w-12 h-12 text-purple-600 opacity-50" />
// // // // // // //             </div>
// // // // // // //           </Card>
// // // // // // //         </div>

// // // // // // //         {/* Subjects */}
// // // // // // //         <div>
// // // // // // //           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Subjects</h2>
// // // // // // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // // // //             {data?.subjects?.map((subject) => (
// // // // // // //               <Link key={subject.id} to={`/student/subject/${subject.id}`}>
// // // // // // //                 <Card glass hover>
// // // // // // //                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
// // // // // // //                     {subject.name}
// // // // // // //                   </h3>
// // // // // // //                   <p className="text-gray-600 dark:text-gray-400 mb-4">
// // // // // // //                     {subject.chapters_count} Chapters
// // // // // // //                   </p>
// // // // // // //                   <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
// // // // // // //                     <span>Teacher: {subject.teacher_name}</span>
// // // // // // //                   </div>
// // // // // // //                 </Card>
// // // // // // //               </Link>
// // // // // // //             ))}
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //     </DashboardLayout>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default StudentDashboard;