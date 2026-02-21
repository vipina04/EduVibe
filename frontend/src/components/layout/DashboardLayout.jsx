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
          {/* <span className="bg-gradient-to-r from-purple-900 via-indigo-600 to-teal-500 bg-clip-text text-transparent"> */}
          <span className="bg-gradient-to-r from-purple-900 via-indigo-600 to-teal-500 bg-clip-text text-transparent text-3xl font-bold tracking-tighter">
            {/* 📚 EduVibe */}
            EduVibe
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













