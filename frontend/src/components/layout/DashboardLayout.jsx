import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HiHome, HiAcademicCap, HiClipboardList, HiUserGroup, 
  HiCalendar, HiCash, HiQuestionMarkCircle, HiBell,
  HiMenu, HiX, HiLogout, HiSun, HiMoon, HiCog
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../common/NotificationBell';

// const DashboardLayout = ({ children }) => {
const DashboardLayout = ({ children, setSearchQuery, searchQuery, searchResults, showResults, setShowResults, onResultClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getNavLinks = () => {
    if (user?.role === 'student') {
      return [
        { name: 'Dashboard',   icon: HiHome,               path: '/student/dashboard' },
        { name: 'My Tests',    icon: HiClipboardList,      path: '/student/my-tests' },
        { name: 'Attendance',  icon: HiCalendar,           path: '/student/attendance' },
        { name: 'Fees',        icon: HiCash,               path: '/student/fees' },
        { name: 'Assignments', icon: HiAcademicCap,        path: '/student/assignments' },
        { name: 'Doubts',      icon: HiQuestionMarkCircle, path: '/student/doubts' },
      ];
    }
    if (user?.role === 'teacher') {
      return [
        { name: 'Dashboard',   icon: HiHome,               path: '/teacher/dashboard' },
        { name: 'My Subjects', icon: HiAcademicCap,        path: '/teacher/subjects' },
        { name: 'Students',    icon: HiUserGroup,          path: '/teacher/students' },
        { name: 'Assignments', icon: HiClipboardList,      path: '/teacher/assignments' },
        { name: 'Doubts',      icon: HiQuestionMarkCircle, path: '/teacher/doubts' },
      ];
    }
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard',           icon: HiHome,          path: '/admin/dashboard' },
        { name: 'Users',               icon: HiUserGroup,     path: '/admin/users' },
        { name: 'Classes',             icon: HiAcademicCap,   path: '/admin/classes' },
        { name: 'Subjects',            icon: HiClipboardList, path: '/admin/subjects' },
        { name: 'Chapters',            icon: HiCog,           path: '/admin/chapters' },
        { name: 'Teacher Assignments', icon: HiUserGroup,     path: '/admin/teacher-assignments' },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">

      {/* ── Mobile overlay ───────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64
        bg-white dark:bg-black
        border-r border-gray-200 dark:border-gray-800
        z-40 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            📚 EduVibe
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl
                  font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
          >
            <HiLogout className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main area (sidebar offset) ───────────────────────────────── */}
      <div className="lg:ml-64 flex flex-col min-h-screen">

        {/* ── Top Navbar ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6
          bg-white/80 dark:bg-black/80 backdrop-blur-md
          border-b border-gray-200 dark:border-gray-800">

          {/* Left — hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {sidebarOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>

            {/* Current page name */}
            {/* <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">
              {navLinks.find(l => l.path === location.pathname)?.name || 'Dashboard'}
            </span> */}
            {setSearchQuery && (
  <div className="relative hidden sm:block w-72">
    <input
      type="text"
      placeholder="Search features..."
      value={searchQuery || ''}
      onChange={(e) => setSearchQuery(e.target.value)}
      onBlur={() => setShowResults && setTimeout(() => setShowResults(false), 150)}
      onFocus={() => searchQuery && setShowResults && setShowResults(true)}
      className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg
                 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                 border border-gray-200 dark:border-gray-700
                 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
    {/* Admin dropdown results */}
    {showResults && searchResults?.length > 0 && (
      <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border
                     border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
        {searchResults.map((item, idx) => (
          <li key={idx}>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                         hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
              onMouseDown={() => onResultClick(item.path)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    )}
    {showResults && searchResults?.length === 0 && searchQuery?.trim() !== '' && (
      <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border
                      border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-4 py-2
                      text-sm text-gray-500 dark:text-gray-400">
        No results for "{searchQuery}"
      </div>
    )}
  </div>
)}
            {/* <input
             type="text"
             placeholder="Search features (e.g. 'Tests', 'Fees')..."
             className="hidden sm:block w-72 px-4 py-1.5 text-sm rounded-lg
             bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
             border border-gray-200 dark:border-gray-700
             focus:outline-none focus:ring-2 focus:ring-indigo-400"
                /> */}
          </div>

          {/* Right — Dark mode toggle + Notification bell */}
          <div className="flex items-center gap-2">

            {/* Dark / Light toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light'
                ? <HiMoon className="w-5 h-5" />
                : <HiSun className="w-5 h-5" />
              }
            </button>

            {/* Notification Bell — only for students and teachers */}
            {/* {!isAdmin && <NotificationBell />} */}
            <NotificationBell />

          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────────── */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;

















// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   HiHome, HiAcademicCap, HiClipboardList, HiUserGroup, 
//   HiCalendar, HiCash, HiQuestionMarkCircle, HiBell,
//   HiMenu, HiX, HiLogout, HiSun, HiMoon, HiCog
// } from 'react-icons/hi';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import NotificationBell from '../common/NotificationBell';

// const DashboardLayout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const { user, logout } = useAuth();
//   const { theme, toggleTheme } = useTheme();

//   // Navigation links based on user role
//   const getNavLinks = () => {
//     if (user?.role === 'student') {
//       return [
//         { name: 'Dashboard', icon: HiHome, path: '/student/dashboard' },
//         { name: 'My Tests', icon: HiClipboardList, path: '/student/my-tests' },
//         { name: 'Attendance', icon: HiCalendar, path: '/student/attendance' },
//         { name: 'Fees', icon: HiCash, path: '/student/fees' },
//         { name: 'Assignments', icon: HiAcademicCap, path: '/student/assignments' },
//         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/student/doubts' },
//         { name: 'Notifications', icon: HiBell, path: '/student/notifications' },
        
//       ];
//     }

//     if (user?.role === 'teacher') {
//       return [
//         { name: 'Dashboard', icon: HiHome, path: '/teacher/dashboard' },
//         { name: 'My Subjects', icon: HiAcademicCap, path: '/teacher/subjects' },
//         { name: 'Students', icon: HiUserGroup, path: '/teacher/students' },
//         { name: 'Assignments', icon: HiClipboardList, path: '/teacher/assignments' },
//         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/teacher/doubts' },
//       ];
//     }

//     if (user?.role === 'admin') {
//       return [
//         { name: 'Dashboard', icon: HiHome, path: '/admin/dashboard' },
//         { name: 'Users', icon: HiUserGroup, path: '/admin/users' },
//         { name: 'Classes', icon: HiAcademicCap, path: '/admin/classes' },
//         { name: 'Subjects', icon: HiClipboardList, path: '/admin/subjects' },
//         { name: 'Chapters', icon: HiCog, path: '/admin/chapters' },
//       ];
//     }

//     return [];
//   };

//   const navLinks = getNavLinks();

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">

//       {/* Sidebar */}
//       <aside className={`fixed top-0 left-0 h-full w-64 border-r border-gray-200 dark:border-gray-800 dark:bg-black z-40 ${
//         sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//       } lg:translate-x-0`}>

//         <div className="h-16 flex items-center px-6 border-b dark:border-gray-800">
//           <span className="text-xl font-bold dark:text-white">EduVibe</span>
//         </div>

//         <nav className="p-4 space-y-2">
//           {navLinks.map(link => (
//             <Link
//               key={link.name}
//               to={link.path}
//               className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 dark:text-gray-300 transition-colors"
//             >
//               <link.icon className="w-5 h-5" />
//               <span>{link.name}</span>
//             </Link>
//           ))}
//         </nav>

//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-800">
//           <button
//             onClick={logout}
//             className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
//           >
//             <HiLogout className="w-5 h-5" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       <main className="lg:ml-64 min-h-screen p-6">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;

















// // import { useState, useEffect } from 'react';
// // import { Link, useNavigate, useLocation } from 'react-router-dom';
// // import { 
// //   HiHome, HiAcademicCap, HiClipboardList, HiUserGroup, 
// //   HiCalendar, HiCash, HiQuestionMarkCircle, HiBell,
// //   HiMenu, HiX, HiLogout, HiSun, HiMoon, HiCog
// // } from 'react-icons/hi';
// // import { useAuth } from '../../context/AuthContext';
// // import { useTheme } from '../../context/ThemeContext';

// // const DashboardLayout = ({ children }) => {
// //   const [sidebarOpen, setSidebarOpen] = useState(true);
// //   const { user, logout } = useAuth();
// //   const { theme, toggleTheme } = useTheme();
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   // Handle hash navigation for teacher dashboard
// //   useEffect(() => {
// //     if (user?.role === 'teacher' && location.hash) {
// //       const elementId = location.hash.substring(1); // Remove the '#'
// //       const element = document.getElementById(elementId);
      
// //       if (element) {
// //         // Smooth scroll to the element
// //         element.scrollIntoView({ behavior: 'smooth', block: 'start' });
// //       }
// //     }
// //   }, [location, user]);

// //   // Handle click on navigation links with hash
// //   const handleNavClick = (e, path) => {
// //     if (path.includes('#')) {
// //       e.preventDefault();
// //       const [basePath, hash] = path.split('#');
      
// //       // If already on the page, just scroll
// //       if (location.pathname === basePath) {
// //         const element = document.getElementById(hash);
// //         if (element) {
// //           element.scrollIntoView({ behavior: 'smooth', block: 'start' });
// //         }
// //         // Update URL hash
// //         window.history.pushState(null, '', `${basePath}#${hash}`);
// //       } else {
// //         // Navigate to the page with hash
// //         navigate(path);
// //       }
// //     }
// //   };

// //   // Navigation links based on user role
// //   const getNavLinks = () => {
// //     if (user?.role === 'student') {
// //       return [
// //         { name: 'Dashboard', icon: HiHome, path: '/student/dashboard' },
// //         { name: 'My Tests', icon: HiClipboardList, path: '/student/my-tests' },
// //         { name: 'Attendance', icon: HiCalendar, path: '/student/attendance' },
// //         { name: 'Fees', icon: HiCash, path: '/student/fees' },
// //         { name: 'Assignments', icon: HiAcademicCap, path: '/student/assignments' },
// //         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/student/doubts' },
// //         { name: 'Notifications', icon: HiBell, path: '/student/notifications' },
// //       ];
// //     }


// //   // inside getNavLinks()

// // if (user?.role === 'teacher') {
// //   return [
// //     { name: 'Dashboard', icon: HiHome, path: '/teacher/dashboard#dashboard-top' },
// //     { name: 'My Subjects', icon: HiAcademicCap, path: '/teacher/dashboard#teacher-subjects' },
// //     { name: 'Students', icon: HiUserGroup, path: '/teacher/dashboard#teacher-actions' },
// //     { name: 'Assignments', icon: HiClipboardList, path: '/teacher/dashboard#teacher-actions' },
// //     { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/teacher/dashboard#teacher-actions' },
// //   ];
// // }






// //     // ✅ FIXED TEACHER LINKS (THIS IS THE BUG FIX)
// //     // if (user?.role === 'teacher') {
// //     //   return [
// //     //     { name: 'Dashboard', icon: HiHome, path: '/teacher/dashboard' },
// //     //     { name: 'My Subjects', icon: HiAcademicCap, path: '/teacher/dashboard' },
// //     //     { name: 'Students', icon: HiUserGroup, path: '/teacher/dashboard' },
// //     //     { name: 'Assignments', icon: HiClipboardList, path: '/teacher/dashboard' },
// //     //     { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/teacher/dashboard' },
// //     //   ];
// //     // }

// //     if (user?.role === 'admin') {
// //       return [
// //         { name: 'Dashboard', icon: HiHome, path: '/admin/dashboard' },
// //         { name: 'Users', icon: HiUserGroup, path: '/admin/users' },
// //         { name: 'Classes', icon: HiAcademicCap, path: '/admin/classes' },
// //         { name: 'Subjects', icon: HiClipboardList, path: '/admin/subjects' },
// //         { name: 'Chapters', icon: HiCog, path: '/admin/chapters' },
// //       ];
// //     }

// //     return [];
// //   };

// //   const navLinks = getNavLinks();

// //   return (
// //     <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">

// //       {/* Sidebar */}
// //       <aside className={`fixed top-0 left-0 h-full w-64 border-r border-gray-200 dark:border-gray-800 dark:bg-black z-40 ${
// //         sidebarOpen ? 'translate-x-0' : '-translate-x-full'
// //       } lg:translate-x-0`}>

// //         <div className="h-16 flex items-center px-6 border-b dark:border-gray-800">
// //           <span className="text-xl font-bold dark:text-white">EduVibe</span>
// //         </div>

// //         <nav className="p-4 space-y-2">
// //           {navLinks.map(link => (
// //             <Link
// //               key={link.name}
// //               to={link.path}
// //               onClick={(e) => handleNavClick(e, link.path)}
// //               className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 dark:text-gray-300"
// //             >
// //               <link.icon className="w-5 h-5" />
// //               <span>{link.name}</span>
// //             </Link>
// //           ))}
// //         </nav>

// //         <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-800">
// //           <button
// //             onClick={logout}
// //             className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600"
// //           >
// //             <HiLogout className="w-5 h-5" />
// //             <span>Logout</span>
// //           </button>
// //         </div>
// //       </aside>

// //       <main className="lg:ml-64 min-h-screen p-6">
// //         {children}
// //       </main>
// //     </div>
// //   );
// // };

// // export default DashboardLayout;


























// // // import { useState } from 'react';
// // // import { Link } from 'react-router-dom';
// // // import { 
// // //   HiHome, HiAcademicCap, HiClipboardList, HiUserGroup, 
// // //   HiCalendar, HiCash, HiQuestionMarkCircle, HiBell,
// // //   HiMenu, HiX, HiLogout, HiSun, HiMoon, HiCog
// // // } from 'react-icons/hi';
// // // import { useAuth } from '../../context/AuthContext';
// // // import { useTheme } from '../../context/ThemeContext';

// // // const DashboardLayout = ({ children }) => {
// // //   const [sidebarOpen, setSidebarOpen] = useState(true);
// // //   const { user, logout } = useAuth();
// // //   const { theme, toggleTheme } = useTheme();

// // //   // Navigation links based on user role
// // //   const getNavLinks = () => {
// // //     if (user?.role === 'student') {
// // //       return [
// // //         { name: 'Dashboard', icon: HiHome, path: '/student/dashboard' },
// // //         { name: 'My Tests', icon: HiClipboardList, path: '/student/my-tests' },
// // //         { name: 'Attendance', icon: HiCalendar, path: '/student/attendance' },
// // //         { name: 'Fees', icon: HiCash, path: '/student/fees' },
// // //         { name: 'Assignments', icon: HiAcademicCap, path: '/student/assignments' },
// // //         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/student/doubts' },
// // //         { name: 'Notifications', icon: HiBell, path: '/student/notifications' },
// // //       ];
// // //     }


// // //   // inside getNavLinks()

// // // if (user?.role === 'teacher') {
// // //   return [
// // //     { name: 'Dashboard', icon: HiHome, path: '/teacher/dashboard#dashboard-top' },
// // //     { name: 'My Subjects', icon: HiAcademicCap, path: '/teacher/dashboard#teacher-subjects' },
// // //     { name: 'Students', icon: HiUserGroup, path: '/teacher/dashboard#teacher-actions' },
// // //     { name: 'Assignments', icon: HiClipboardList, path: '/teacher/dashboard#teacher-actions' },
// // //     { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/teacher/dashboard#teacher-actions' },
// // //   ];
// // // }






// // //     // ✅ FIXED TEACHER LINKS (THIS IS THE BUG FIX)
// // //     // if (user?.role === 'teacher') {
// // //     //   return [
// // //     //     { name: 'Dashboard', icon: HiHome, path: '/teacher/dashboard' },
// // //     //     { name: 'My Subjects', icon: HiAcademicCap, path: '/teacher/dashboard' },
// // //     //     { name: 'Students', icon: HiUserGroup, path: '/teacher/dashboard' },
// // //     //     { name: 'Assignments', icon: HiClipboardList, path: '/teacher/dashboard' },
// // //     //     { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/teacher/dashboard' },
// // //     //   ];
// // //     // }

// // //     if (user?.role === 'admin') {
// // //       return [
// // //         { name: 'Dashboard', icon: HiHome, path: '/admin/dashboard' },
// // //         { name: 'Users', icon: HiUserGroup, path: '/admin/users' },
// // //         { name: 'Classes', icon: HiAcademicCap, path: '/admin/classes' },
// // //         { name: 'Subjects', icon: HiClipboardList, path: '/admin/subjects' },
// // //         { name: 'Chapters', icon: HiCog, path: '/admin/chapters' },
// // //       ];
// // //     }

// // //     return [];
// // //   };

// // //   const navLinks = getNavLinks();

// // //   return (
// // //     <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">

// // //       {/* Sidebar */}
// // //       <aside className={`fixed top-0 left-0 h-full w-64 border-r border-gray-200 dark:border-gray-800 dark:bg-black z-40 ${
// // //         sidebarOpen ? 'translate-x-0' : '-translate-x-full'
// // //       } lg:translate-x-0`}>

// // //         <div className="h-16 flex items-center px-6 border-b dark:border-gray-800">
// // //           <span className="text-xl font-bold dark:text-white">EduVibe</span>
// // //         </div>

// // //         <nav className="p-4 space-y-2">
// // //           {navLinks.map(link => (
// // //             <Link
// // //               key={link.name}
// // //               to={link.path}
// // //               className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900"
// // //             >
// // //               <link.icon className="w-5 h-5" />
// // //               <span>{link.name}</span>
// // //             </Link>
// // //           ))}
// // //         </nav>

// // //         <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-800">
// // //           <button
// // //             onClick={logout}
// // //             className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600"
// // //           >
// // //             <HiLogout className="w-5 h-5" />
// // //             <span>Logout</span>
// // //           </button>
// // //         </div>
// // //       </aside>

// // //       <main className="lg:ml-64 min-h-screen p-6">
// // //         {children}
// // //       </main>
// // //     </div>
// // //   );
// // // };

// // // export default DashboardLayout;
























// // // // import { useState } from 'react';
// // // // import { Link, useNavigate } from 'react-router-dom';
// // // // import { motion } from 'framer-motion';
// // // // import { 
// // // //   HiHome, HiAcademicCap, HiClipboardList, HiUserGroup, 
// // // //   HiCalendar, HiCash, HiQuestionMarkCircle, HiBell,
// // // //   HiMenu, HiX, HiLogout, HiSun, HiMoon, HiCog
// // // // } from 'react-icons/hi';
// // // // import { useAuth } from '../../context/AuthContext';
// // // // import { useTheme } from '../../context/ThemeContext';

// // // // const DashboardLayout = ({ children }) => {
// // // //   const [sidebarOpen, setSidebarOpen] = useState(true);
// // // //   const { user, logout } = useAuth();
// // // //   const { theme, toggleTheme } = useTheme();
// // // //   const navigate = useNavigate();

// // // //   // Navigation links based on user role
// // // //   const getNavLinks = () => {
// // // //     if (user?.role === 'student') {
// // // //       return [
// // // //         { name: 'Dashboard', icon: HiHome, path: '/student/dashboard' },
// // // //         { name: 'My Tests', icon: HiClipboardList, path: '/student/my-tests' },
// // // //         { name: 'Attendance', icon: HiCalendar, path: '/student/attendance' },
// // // //         { name: 'Fees', icon: HiCash, path: '/student/fees' },
// // // //         { name: 'Assignments', icon: HiAcademicCap, path: '/student/assignments' },
// // // //         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/student/doubts' },
// // // //         { name: 'Notifications', icon: HiBell, path: '/student/notifications' },
// // // //       ];
// // // //     } else if (user?.role === 'teacher') {
// // // //       return [
// // // //         { name: 'Dashboard', icon: HiHome, path: '/teacher/dashboard' },
// // // //         { name: 'My Subjects', icon: HiAcademicCap, path: '/teacher/dashboard' },
// // // //         { name: 'Students', icon: HiUserGroup, path: '/teacher/dashboard' },
// // // //         { name: 'Assignments', icon: HiClipboardList, path: '/teacher/dashboard' },
// // // //         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/teacher/dashboard' },
// // // //       ];
// // // //     } else if (user?.role === 'admin') {
// // // //       return [
// // // //         { name: 'Dashboard', icon: HiHome, path: '/admin/dashboard' },
// // // //         { name: 'Users', icon: HiUserGroup, path: '/admin/users' },
// // // //         { name: 'Classes', icon: HiAcademicCap, path: '/admin/classes' },
// // // //         { name: 'Subjects', icon: HiClipboardList, path: '/admin/subjects' },
// // // //         { name: 'Chapters', icon: HiCog, path: '/admin/chapters' },
// // // //       ];
// // // //     }
// // // //     return [];
// // // //   };

// // // //   const navLinks = getNavLinks();

// // // //   return (
// // // //     /* CHANGED: dark:bg-gray-900 to dark:bg-black */
// // // //     <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      
// // // //       {/* Mobile Header */}
// // // //       <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-light dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-30">
// // // //         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="dark:text-white">
// // // //           {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
// // // //         </button>
// // // //         <img src="/images/logo.png" alt="EduVibe" className="h-8" />
// // // //         <button onClick={toggleTheme} className="dark:text-yellow-400">
// // // //           {theme === 'light' ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
// // // //         </button>
// // // //       </div>

// // // //       {/* Sidebar */}
// // // //       <aside
// // // //         /* CHANGED: glass-dark to dark:bg-black and border color to gray-800 */
// // // //         className={`fixed top-0 left-0 h-full w-64 glass-light dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 z-40 ${
// // // //           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
// // // //         } lg:translate-x-0`}
// // // //       >
// // // //         {/* Logo Section */}
// // // //         <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
// // // //           <img src="/images/logo.png" alt="EduVibe" className="h-8 w-auto mr-3" />
// // // //           <span className="text-xl font-bold text-gray-900 dark:text-white">EduVibe</span>
// // // //         </div>

// // // //         {/* Navigation */}
// // // //         <nav className="p-4 space-y-2">
// // // //           {navLinks.map((link) => (
// // // //             <Link
// // // //               key={link.path}
// // // //               to={link.path}
// // // //               /* CHANGED: dark:hover:bg-blue-900/20 to dark:hover:bg-gray-900 */
// // // //               className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-900 hover:text-blue-600 dark:hover:text-white transition-all"
// // // //             >
// // // //               <link.icon className="w-5 h-5" />
// // // //               <span className="font-medium">{link.name}</span>
// // // //             </Link>
// // // //           ))}
// // // //         </nav>

// // // //         {/* User Profile & Logout */}
// // // //         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">          {/* CHANGED: dark:bg-gray-800 to dark:bg-[#0a0a0a] */}
// // // //           <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#0a0a0a] mb-2 border dark:border-gray-800">
// // // //             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
// // // //               {user?.full_name?.charAt(0).toUpperCase()}
// // // //             </div>
// // // //             <div className="flex-1 min-w-0">
// // // //               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
// // // //                 {user?.full_name}
// // // //               </p>
// // // //               <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
// // // //                 {user?.role}
// // // //               </p>
// // // //             </div>
// // // //           </div>
// // // //           <button
// // // //             onClick={logout}
// // // //             className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
// // // //           >
// // // //             <HiLogout className="w-5 h-5" />
// // // //             <span className="font-medium">Logout</span>
// // // //           </button>
// // // //         </div>
// // // //       </aside>

// // // //       {/* Main Content Area */}
// // // //       {/* CHANGED: Added dark:bg-black here as well */}
// // // //       <main className={`lg:ml-64 min-h-screen pt-16 lg:pt-0 dark:bg-black transition-colors duration-300`}>
// // // //         <div className="p-4 md:p-8">
// // // //           {children}
// // // //         </div>
// // // //       </main>

// // // //       {/* Mobile Sidebar Overlay */}
// // // //       {sidebarOpen && (
// // // //         <div
// // // //           className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
// // // //           onClick={() => setSidebarOpen(false)}
// // // //         />
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default DashboardLayout;









































// // // // // import { useState } from 'react';
// // // // // import { Link, useNavigate } from 'react-router-dom';
// // // // // import { motion } from 'framer-motion';
// // // // // import { 
// // // // //   HiHome, HiAcademicCap, HiClipboardList, HiUserGroup, 
// // // // //   HiCalendar, HiCash, HiQuestionMarkCircle, HiBell,
// // // // //   HiMenu, HiX, HiLogout, HiSun, HiMoon, HiCog
// // // // // } from 'react-icons/hi';
// // // // // import { useAuth } from '../../context/AuthContext';
// // // // // import { useTheme } from '../../context/ThemeContext';

// // // // // const DashboardLayout = ({ children }) => {
// // // // //   const [sidebarOpen, setSidebarOpen] = useState(true);
// // // // //   const { user, logout } = useAuth();
// // // // //   const { theme, toggleTheme } = useTheme();
// // // // //   const navigate = useNavigate();

// // // // //   // Navigation links based on user role
// // // // //   const getNavLinks = () => {
// // // // //     if (user?.role === 'student') {
// // // // //       return [
// // // // //         { name: 'Dashboard', icon: HiHome, path: '/student/dashboard' },
// // // // //         { name: 'My Tests', icon: HiClipboardList, path: '/student/my-tests' },
// // // // //         { name: 'Attendance', icon: HiCalendar, path: '/student/attendance' },
// // // // //         { name: 'Fees', icon: HiCash, path: '/student/fees' },
// // // // //         { name: 'Assignments', icon: HiAcademicCap, path: '/student/assignments' },
// // // // //         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/student/doubts' },
// // // // //         { name: 'Notifications', icon: HiBell, path: '/student/notifications' },
// // // // //       ];
// // // // //     } else if (user?.role === 'teacher') {
// // // // //       return [
// // // // //         { name: 'Dashboard', icon: HiHome, path: '/teacher/dashboard' },
// // // // //         { name: 'My Subjects', icon: HiAcademicCap, path: '/teacher/dashboard' },
// // // // //         { name: 'Students', icon: HiUserGroup, path: '/teacher/dashboard' },
// // // // //         { name: 'Assignments', icon: HiClipboardList, path: '/teacher/dashboard' },
// // // // //         { name: 'Doubts', icon: HiQuestionMarkCircle, path: '/teacher/dashboard' },
// // // // //       ];
// // // // //     } else if (user?.role === 'admin') {
// // // // //       return [
// // // // //         { name: 'Dashboard', icon: HiHome, path: '/admin/dashboard' },
// // // // //         { name: 'Users', icon: HiUserGroup, path: '/admin/users' },
// // // // //         { name: 'Classes', icon: HiAcademicCap, path: '/admin/classes' },
// // // // //         { name: 'Subjects', icon: HiClipboardList, path: '/admin/subjects' },
// // // // //         { name: 'Chapters', icon: HiCog, path: '/admin/chapters' },
// // // // //       ];
// // // // //     }
// // // // //     return [];
// // // // //   };

// // // // //   const navLinks = getNavLinks();

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
// // // // //       {/* Mobile Header */}
// // // // //       <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-light dark:glass-dark border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-30">
// // // // //         <button onClick={() => setSidebarOpen(!sidebarOpen)}>
// // // // //           {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
// // // // //         </button>
// // // // //         <img src="/images/logo.png" alt="EduVibe" className="h-8" />
// // // // //         <button onClick={toggleTheme}>
// // // // //           {theme === 'light' ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
// // // // //         </button>
// // // // //       </div>

// // // // //       {/* Sidebar */}
// // // // //       <aside
// // // // //         className={`fixed top-0 left-0 h-full w-64 glass-light dark:glass-dark border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-40 ${
// // // // //           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
// // // // //         } lg:translate-x-0`}
// // // // //       >
// // // // //         {/* Logo */}
// // // // //         <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
// // // // //           <img src="/images/logo.png" alt="EduVibe" className="h-8 w-auto mr-3" />
// // // // //           <span className="text-xl font-bold text-gray-900 dark:text-white">EduVibe</span>
// // // // //         </div>

// // // // //         {/* Navigation */}
// // // // //         <nav className="p-4 space-y-2">
// // // // //           {navLinks.map((link) => (
// // // // //             <Link
// // // // //               key={link.path}
// // // // //               to={link.path}
// // // // //               className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
// // // // //             >
// // // // //               <link.icon className="w-5 h-5" />
// // // // //               <span className="font-medium">{link.name}</span>
// // // // //             </Link>
// // // // //           ))}
// // // // //         </nav>

// // // // //         {/* User Profile & Logout */}
// // // // //         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border--200 dark:border-gray-700">
// // // // //           <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 mb-2">
// // // // //             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
// // // // //               {user?.full_name?.charAt(0).toUpperCase()}
// // // // //             </div>
// // // // //             <div className="flex-1 min-w-0">
// // // // //               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
// // // // //                 {user?.full_name}
// // // // //               </p>
// // // // //               <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
// // // // //                 {user?.role}
// // // // //               </p>
// // // // //             </div>
// // // // //           </div>
// // // // //           <button
// // // // //             onClick={logout}
// // // // //             className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
// // // // //           >
// // // // //             <HiLogout className="w-5 h-5" />
// // // // //             <span className="font-medium">Logout</span>
// // // // //           </button>
// // // // //         </div>
// // // // //       </aside>

// // // // //       {/* Main Content */}
// // // // //       <main className={`lg:ml-64 min-h-screen pt-16 lg:pt-0`}>
// // // // //         {children}
// // // // //       </main>

// // // // //       {/* Mobile Sidebar Overlay */}
// // // // //       {sidebarOpen && (
// // // // //         <div
// // // // //           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
// // // // //           onClick={() => setSidebarOpen(false)}
// // // // //         />
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default DashboardLayout;

























// // // // // // import { useState } from 'react';
// // // // // // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // // // // // import { motion } from 'framer-motion';
// // // // // // import { 
// // // // // //   HiHome, HiUser, HiAcademicCap, HiClipboardList, 
// // // // // //   HiCalendar, HiQuestionMarkCircle, HiChartBar,
// // // // // //   HiUserGroup, HiCog, HiLogout, HiMenu, HiX,
// // // // // //   HiBookOpen, HiDocumentText, HiCash, HiBell
// // // // // // } from 'react-icons/hi';
// // // // // // import { useAuth } from '../../context/AuthContext';
// // // // // // import { useTheme } from '../../context/ThemeContext';

// // // // // // const DashboardLayout = ({ children }) => {
// // // // // //   const [sidebarOpen, setSidebarOpen] = useState(false);
// // // // // //   const { user, logout } = useAuth();
// // // // // //   const { theme, toggleTheme } = useTheme();
// // // // // //   const location = useLocation();
// // // // // //   const navigate = useNavigate();

// // // // // //   const getNavigationItems = () => {
// // // // // //     if (user?.role === 'student') {
// // // // // //       return [
// // // // // //         { name: 'Dashboard', path: '/student/dashboard', icon: HiHome },
// // // // // //         { name: 'Tests', path: '/student/tests', icon: HiAcademicCap },
// // // // // //         { name: 'Results', path: '/student/results', icon: HiChartBar },
// // // // // //         { name: 'Doubts', path: '/student/doubts', icon: HiQuestionMarkCircle },
// // // // // //         { name: 'Attendance', path: '/student/attendance', icon: HiCalendar },
// // // // // //         { name: 'Assignments', path: '/student/assignments', icon: HiClipboardList },
// // // // // //         { name: 'Profile', path: '/student/profile', icon: HiUser },
// // // // // //       ];
// // // // // //     } else if (user?.role === 'teacher') {
// // // // // //       return [
// // // // // //         { name: 'Dashboard', path: '/teacher/dashboard', icon: HiHome },
// // // // // //         { name: 'Tests', path: '/teacher/tests', icon: HiAcademicCap },
// // // // // //         { name: 'Create Test', path: '/teacher/create-test', icon: HiDocumentText },
// // // // // //         { name: 'Attendance', path: '/teacher/attendance', icon: HiCalendar },
// // // // // //         { name: 'Assignments', path: '/teacher/assignments', icon: HiClipboardList },
// // // // // //         { name: 'Doubts', path: '/teacher/doubts', icon: HiQuestionMarkCircle },
// // // // // //         { name: 'Students', path: '/teacher/students', icon: HiUserGroup },
// // // // // //         { name: 'Profile', path: '/teacher/profile', icon: HiUser },
// // // // // //       ];
// // // // // //     } else if (user?.role === 'admin') {
// // // // // //       return [
// // // // // //         { name: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
// // // // // //         { name: 'Approvals', path: '/admin/approvals', icon: HiUserGroup },
// // // // // //         { name: 'Classes', path: '/admin/classes', icon: HiBookOpen },
// // // // // //         { name: 'Subjects', path: '/admin/subjects', icon: HiAcademicCap },
// // // // // //         { name: 'Chapters', path: '/admin/chapters', icon: HiDocumentText },
// // // // // //         { name: 'Fee Payments', path: '/admin/fees', icon: HiCash },
// // // // // //         { name: 'Notifications', path: '/admin/notifications', icon: HiBell },
// // // // // //         { name: 'Settings', path: '/admin/settings', icon: HiCog },
// // // // // //       ];
// // // // // //     }
// // // // // //     return [];
// // // // // //   };

// // // // // //   const navItems = getNavigationItems();

// // // // // //   const handleLogout = () => {
// // // // // //     logout();
// // // // // //     navigate('/login');
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
// // // // // //       {/* Mobile Header */}
// // // // // //       <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg z-40 flex items-center justify-between px-4">
// // // // // //         <button
// // // // // //           onClick={() => setSidebarOpen(!sidebarOpen)}
// // // // // //           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
// // // // // //         >
// // // // // //           {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
// // // // // //         </button>
// // // // // //         <Link to="/" className="flex items-center space-x-2">
// // // // // //           <img src="/images/logo.png" alt="EduVibe" className="h-8 w-8" />
// // // // // //           <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
// // // // // //             EduVibe
// // // // // //           </span>
// // // // // //         </Link>
// // // // // //         <div className="w-10" />
// // // // // //       </div>

// // // // // //       {/* Sidebar */}
// // // // // //       <motion.aside
// // // // // //         initial={false}
// // // // // //         animate={{ x: sidebarOpen ? 0 : '-100%' }}
// // // // // //         className="lg:translate-x-0 fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 lg:z-30 pt-16 lg:pt-0"
// // // // // //       >
// // // // // //         <div className="h-full flex flex-col">
// // // // // //           {/* Logo (Desktop) */}
// // // // // //           <div className="hidden lg:flex items-center space-x-3 p-6 border-b border-gray-200 dark:border-gray-700">
// // // // // //             <img src="/images/logo.png" alt="EduVibe" className="h-10 w-10" />
// // // // // //             <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
// // // // // //               EduVibe
// // // // // //             </span>
// // // // // //           </div>

// // // // // //           {/* User Info */}
// // // // // //           <div className="p-6 border-b border-gray-200 dark:border-gray-700">
// // // // // //             <div className="flex items-center space-x-3">
// // // // // //               <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-lg">
// // // // // //                 {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
// // // // // //               </div>
// // // // // //               <div>
// // // // // //                 <p className="font-semibold text-gray-900 dark:text-white">
// // // // // //                   {user?.first_name} {user?.last_name}
// // // // // //                 </p>
// // // // // //                 <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
// // // // // //                   {user?.role}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           {/* Navigation */}
// // // // // //           <nav className="flex-1 p-4 overflow-y-auto">
// // // // // //             <ul className="space-y-1">
// // // // // //               {navItems.map((item) => {
// // // // // //                 const isActive = location.pathname === item.path;
// // // // // //                 return (
// // // // // //                   <li key={item.path}>
// // // // // //                     <Link
// // // // // //                       to={item.path}
// // // // // //                       onClick={() => setSidebarOpen(false)}
// // // // // //                       className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
// // // // // //                         isActive
// // // // // //                           ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
// // // // // //                           : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
// // // // // //                       }`}
// // // // // //                     >
// // // // // //                       <item.icon className="w-5 h-5" />
// // // // // //                       <span className="font-medium">{item.name}</span>
// // // // // //                     </Link>
// // // // // //                   </li>
// // // // // //                 );
// // // // // //               })}
// // // // // //             </ul>
// // // // // //           </nav>

// // // // // //           {/* Logout Button */}
// // // // // //           <div className="p-4 border-t border-gray-200 dark:border-gray-700">
// // // // // //             <button
// // // // // //               onClick={handleLogout}
// // // // // //               className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
// // // // // //             >
// // // // // //               <HiLogout className="w-5 h-5" />
// // // // // //               <span className="font-medium">Logout</span>
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </motion.aside>

// // // // // //       {/* Overlay (Mobile) */}
// // // // // //       {sidebarOpen && (
// // // // // //         <div
// // // // // //           onClick={() => setSidebarOpen(false)}
// // // // // //           className="lg:hidden fixed inset-0 bg-black/50 z-40"
// // // // // //         />
// // // // // //       )}

// // // // // //       {/* Main Content */}
// // // // // //       <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
// // // // // //         <div className="p-4 md:p-6 lg:p-8">
// // // // // //           {children}
// // // // // //         </div>
// // // // // //       </main>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default DashboardLayout;