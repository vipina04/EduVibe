import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { HiUsers, HiAcademicCap, HiBookOpen, HiClipboardList, HiSearch, HiSun, HiMoon } from 'react-icons/hi';

// All searchable nav items in the dashboard
const NAV_ITEMS = [
  { label: 'Manage Users',     path: '/admin/users' },
  { label: 'Manage Classes',   path: '/admin/classes' },
  { label: 'Manage Subjects',  path: '/admin/subjects' },
  { label: 'Manage Chapters',  path: '/admin/chapters' },
  { label: 'Total Users',      path: '/admin/users' },
  { label: 'Students',         path: '/admin/users' },
  { label: 'Teachers',         path: '/admin/users' },
  { label: 'Teacher Assignments', path: '/admin/teacher-assignments' }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    total_subjects: 0,
    total_chapters: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // ── fetch stats ─────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboardStats();
        const data = res.data;
        setDashboardData({
          total_users:    data.users?.total        || 0,
          total_students: data.users?.students     || 0,
          total_teachers: data.users?.teachers     || 0,
          total_classes:  data.academics?.classes  || 0,
          total_subjects: data.academics?.subjects || 0,
          total_chapters: data.academics?.chapters || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // ── search logic ─────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = NAV_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
    setShowResults(true);
  }, [searchQuery]);

  const handleResultClick = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowResults(false);
  };

  // ── loading screen ───────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  // ── render ───────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── TOP NAV BAR ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4
                        bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm
                        border border-gray-100 dark:border-gray-700">

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search (e.g. 'Users', 'Classes', 'Subjects')..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500
                         transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setTimeout(() => setShowResults(false), 150)}
              onFocus={() => searchQuery && setShowResults(true)}
            />

            {/* Dropdown results */}
            {showResults && searchResults.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border
                             border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
                {searchResults.map((item, idx) => (
                  <li key={idx}>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                                 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                      onMouseDown={() => handleResultClick(item.path)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* No results */}
            {showResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border
                              border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-4 py-2
                              text-sm text-gray-500 dark:text-gray-400">
                No results for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Right side: nav links + dark mode toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm font-medium text-gray-600 dark:text-gray-300
                         hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Users
            </button>
            <button
              onClick={() => navigate('/admin/classes')}
              className="text-sm font-medium text-gray-600 dark:text-gray-300
                         hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Classes
            </button>
            <button
              onClick={() => navigate('/admin/subjects')}
              className="text-sm font-medium text-gray-600 dark:text-gray-300
                         hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Subjects
            </button>
            <button
              onClick={() => navigate('/admin/chapters')}
              className="text-sm font-medium text-gray-600 dark:text-gray-300
                         hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Chapters
            </button>

            {/* Dark / Light toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-lg
                         bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-inner"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark'
                ? <HiSun  className="h-5 w-5" />
                : <HiMoon className="h-5 w-5" />
              }
            </button>
          </div>
        </div>
        {/* ── END TOP NAV BAR ─────────────────────────────── */}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-purple-100">
            Manage your entire educational institution
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {dashboardData.total_users}
                </p>
              </div>
              <HiUsers className="h-12 w-12 text-blue-500" />
            </div>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Students</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                  {dashboardData.total_students}
                </p>
              </div>
              <HiAcademicCap className="h-12 w-12 text-green-500" />
            </div>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Teachers</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                  {dashboardData.total_teachers}
                </p>
              </div>
              <HiUsers className="h-12 w-12 text-purple-500" />
            </div>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Classes</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                  {dashboardData.total_classes}
                </p>
              </div>
              <HiClipboardList className="h-12 w-12 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Subjects</p>
                <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mt-2">
                  {dashboardData.total_subjects}
                </p>
              </div>
              <HiBookOpen className="h-12 w-12 text-indigo-500" />
            </div>
          </Card>

          <Card className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 dark:text-pink-400">Total Chapters</p>
                <p className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2">
                  {dashboardData.total_chapters}
                </p>
              </div>
              <HiClipboardList className="h-12 w-12 text-pink-500" />
            </div>
          </Card>
        </div>

        {/* Management Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
            >
              <HiUsers className="h-10 w-10 text-blue-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Users</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add, edit, or remove users
              </p>
            </button>

            <button
              onClick={() => navigate('/admin/classes')}
              className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
            >
              <HiAcademicCap className="h-10 w-10 text-green-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Classes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create and organize classes
              </p>
            </button>

            <button
              onClick={() => navigate('/admin/subjects')}
              className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
            >
              <HiBookOpen className="h-10 w-10 text-purple-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Subjects</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add and manage subjects
              </p>
            </button>

            <button
              onClick={() => navigate('/admin/chapters')}
              className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
            >
              <HiClipboardList className="h-10 w-10 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Chapters</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Organize subject chapters
              </p>
            </button>
          </div>
        </div>

        {/* System Overview */}
        <Card className="bg-white dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.total_users}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Users</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dashboardData.total_classes}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Classes</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {dashboardData.total_subjects}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Subjects</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {dashboardData.total_chapters}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chapters</p>
            </div>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
























// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { adminAPI } from '../../services/api';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import { HiUsers, HiAcademicCap, HiBookOpen, HiClipboardList } from 'react-icons/hi';

// const AdminDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [dashboardData, setDashboardData] = useState({
//     total_users: 0,
//     total_students: 0,
//     total_teachers: 0,
//     total_classes: 0,
//     total_subjects: 0,
//     total_chapters: 0,
//   });

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDashboardStats = async () => {
//       try {
//         setLoading(true);
//         const res = await adminAPI.getDashboardStats();
//         const data = res.data;

//         setDashboardData({
//           total_users: data.users?.total || 0,
//           total_students: data.users?.students || 0,
//           total_teachers: data.users?.teachers || 0,
//           total_classes: data.academics?.classes || 0,
//           total_subjects: data.academics?.subjects || 0,
//           total_chapters: data.academics?.chapters || 0,
//         });
//       } catch (error) {
//         console.error('Error fetching dashboard stats:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardStats();
//   }, []);

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <Loading />
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Welcome Section */}
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
//           <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//           <p className="mt-2 text-purple-100">
//             Manage your entire educational institution
//           </p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
//                 <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
//                   {dashboardData.total_users}
//                 </p>
//               </div>
//               <HiUsers className="h-12 w-12 text-blue-500" />
//             </div>
//           </Card>

//           <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-600 dark:text-green-400">Students</p>
//                 <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
//                   {dashboardData.total_students}
//                 </p>
//               </div>
//               <HiAcademicCap className="h-12 w-12 text-green-500" />
//             </div>
//           </Card>

//           <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-purple-600 dark:text-purple-400">Teachers</p>
//                 <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
//                   {dashboardData.total_teachers}
//                 </p>
//               </div>
//               <HiUsers className="h-12 w-12 text-purple-500" />
//             </div>
//           </Card>

//           <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-orange-600 dark:text-orange-400">Classes</p>
//                 <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
//                   {dashboardData.total_classes}
//                 </p>
//               </div>
//               <HiClipboardList className="h-12 w-12 text-orange-500" />
//             </div>
//           </Card>
//         </div>

//         {/* Secondary Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Subjects</p>
//                 <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mt-2">
//                   {dashboardData.total_subjects}
//                 </p>
//               </div>
//               <HiBookOpen className="h-12 w-12 text-indigo-500" />
//             </div>
//           </Card>

//           <Card className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-pink-600 dark:text-pink-400">Total Chapters</p>
//                 <p className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2">
//                   {dashboardData.total_chapters}
//                 </p>
//               </div>
//               <HiClipboardList className="h-12 w-12 text-pink-500" />
//             </div>
//           </Card>
//         </div>

//         {/* Management Cards */}
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//             Quick Management
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <button
//               onClick={() => navigate('/admin/users')}
//               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
//             >
//               <HiUsers className="h-10 w-10 text-blue-500 mb-3" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Users</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Add, edit, or remove users
//               </p>
//             </button>

//             <button
//               onClick={() => navigate('/admin/classes')}
//               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
//             >
//               <HiAcademicCap className="h-10 w-10 text-green-500 mb-3" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Classes</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Create and organize classes
//               </p>
//             </button>

//             <button
//               onClick={() => navigate('/admin/subjects')}
//               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
//             >
//               <HiBookOpen className="h-10 w-10 text-purple-500 mb-3" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Subjects</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Add and manage subjects
//               </p>
//             </button>

//             <button
//               onClick={() => navigate('/admin/chapters')}
//               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
//             >
//               <HiClipboardList className="h-10 w-10 text-orange-500 mb-3" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Chapters</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Organize subject chapters
//               </p>
//             </button>
//           </div>
//         </div>

//         {/* System Overview */}
//         <Card className="bg-white dark:bg-slate-800">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             System Overview
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
//               <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 {dashboardData.total_users}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Users</p>
//             </div>
//             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
//               <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//                 {dashboardData.total_classes}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Classes</p>
//             </div>
//             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
//               <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                 {dashboardData.total_subjects}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Subjects</p>
//             </div>
//             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
//               <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
//                 {dashboardData.total_chapters}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chapters</p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default AdminDashboard;


































// // import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { useAuth } from '../../context/AuthContext';
// // import { adminAPI } from '../../services/api';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Loading from '../../components/common/Loading';
// // import { adminAPI } from '../../services/api';
// // import { HiUsers, HiAcademicCap, HiBookOpen, HiClipboardList } from 'react-icons/hi';

// // const AdminDashboard = () => {
// //   const { user } = useAuth();
// //   const navigate = useNavigate();
// //   const [dashboardData, setDashboardData] = useState({
// //       useEffect(() => {
// //   const fetchDashboardStats = async () => {
// //     try {
// //       const res = await adminAPI.getDashboardStats();
// //       const data = res.data;

// //       setDashboardData({
// //         total_users: data.users?.total || 0,
// //         total_students: data.users?.students || 0,
// //         total_teachers: data.users?.teachers || 0,
// //         total_classes: data.academics?.classes || 0,
// //         total_subjects: data.academics?.subjects || 0,
// //         total_chapters: data.academics?.chapters || 0,
// //       });
// //     } catch (err) {
// //       console.error('Failed to fetch dashboard stats:', err);
// //     }
// //   };

// //   fetchDashboardStats();
// // }, []);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetchDashboardData();
// //   }, []);

// //   const fetchDashboardData = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await adminAPI.getDashboard();
// //       setDashboardData(response.data);
// //     } catch (error) {
// //       console.error('Error fetching dashboard data:', error);
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
// //       <div className="space-y-6">
// //         {/* Welcome Section */}
// //         <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
// //           <h1 className="text-3xl font-bold">Admin Dashboard</h1>
// //           <p className="mt-2 text-purple-100">
// //             Manage your entire educational institution
// //           </p>
// //         </div>

// //         {/* Stats Grid */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //           <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
// //                 <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
// //                   {dashboardData.total_users}
// //                 </p>
// //               </div>
// //               <HiUsers className="h-12 w-12 text-blue-500" />
// //             </div>
// //           </Card>

// //           <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-green-600 dark:text-green-400">Students</p>
// //                 <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
// //                   {dashboardData.total_students}
// //                 </p>
// //               </div>
// //               <HiAcademicCap className="h-12 w-12 text-green-500" />
// //             </div>
// //           </Card>

// //           <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-purple-600 dark:text-purple-400">Teachers</p>
// //                 <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
// //                   {dashboardData.total_teachers}
// //                 </p>
// //               </div>
// //               <HiUsers className="h-12 w-12 text-purple-500" />
// //             </div>
// //           </Card>

// //           <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-orange-600 dark:text-orange-400">Classes</p>
// //                 <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
// //                   {dashboardData.total_classes}
// //                 </p>
// //               </div>
// //               <HiClipboardList className="h-12 w-12 text-orange-500" />
// //             </div>
// //           </Card>
// //         </div>

// //         {/* Secondary Stats */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //           <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Subjects</p>
// //                 <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mt-2">
// //                   {dashboardData.total_subjects}
// //                 </p>
// //               </div>
// //               <HiBookOpen className="h-12 w-12 text-indigo-500" />
// //             </div>
// //           </Card>

// //           <Card className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-pink-600 dark:text-pink-400">Total Chapters</p>
// //                 <p className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2">
// //                   {dashboardData.total_chapters}
// //                 </p>
// //               </div>
// //               <HiClipboardList className="h-12 w-12 text-pink-500" />
// //             </div>
// //           </Card>
// //         </div>

// //         {/* Management Cards */}
// //         <div>
// //           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// //             Quick Management
// //           </h2>
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //             <button
// //               onClick={() => navigate('/admin/users')}
// //               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
// //             >
// //               <HiUsers className="h-10 w-10 text-blue-500 mb-3" />
// //               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Users</h3>
// //               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// //                 Add, edit, or remove users
// //               </p>
// //             </button>

// //             <button
// //               onClick={() => navigate('/admin/classes')}
// //               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
// //             >
// //               <HiAcademicCap className="h-10 w-10 text-green-500 mb-3" />
// //               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Classes</h3>
// //               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// //                 Create and organize classes
// //               </p>
// //             </button>

// //             <button
// //               onClick={() => navigate('/admin/subjects')}
// //               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
// //             >
// //               <HiBookOpen className="h-10 w-10 text-purple-500 mb-3" />
// //               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Subjects</h3>
// //               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// //                 Add and manage subjects
// //               </p>
// //             </button>

// //             <button
// //               onClick={() => navigate('/admin/chapters')}
// //               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
// //             >
// //               <HiClipboardList className="h-10 w-10 text-orange-500 mb-3" />
// //               <h3 className="font-semibold text-gray-900 dark:text-white">Manage Chapters</h3>
// //               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
// //                 Organize subject chapters
// //               </p>
// //             </button>
// //           </div>
// //         </div>

// //         {/* Recent Activity */}
// //         <Card className="bg-white dark:bg-slate-800">
// //           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
// //             System Overview
// //           </h3>
// //           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
// //             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
// //               <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
// //                 {dashboardData.total_users}
// //               </p>
// //               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Users</p>
// //             </div>
// //             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
// //               <p className="text-2xl font-bold text-green-600 dark:text-green-400">
// //                 {dashboardData.total_classes}
// //               </p>
// //               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Classes</p>
// //             </div>
// //             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
// //               <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
// //                 {dashboardData.total_subjects}
// //               </p>
// //               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Subjects</p>
// //             </div>
// //             <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
// //               <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
// //                 {dashboardData.total_chapters}
// //               </p>
// //               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chapters</p>
// //             </div>
// //           </div>
// //         </Card>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default AdminDashboard;











// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // export default function AdminDashboard() {
// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6">
// // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard - Coming Soon</h1>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // }