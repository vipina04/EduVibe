import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiHome, HiUser, HiAcademicCap, HiClipboardList, 
  HiCalendar, HiQuestionMarkCircle, HiChartBar,
  HiUserGroup, HiCog, HiLogout, HiMenu, HiX,
  HiBookOpen, HiDocumentText, HiCash, HiBell
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavigationItems = () => {
    if (user?.role === 'student') {
      return [
        { name: 'Dashboard', path: '/student/dashboard', icon: HiHome },
        { name: 'Tests', path: '/student/tests', icon: HiAcademicCap },
        { name: 'Results', path: '/student/results', icon: HiChartBar },
        { name: 'Doubts', path: '/student/doubts', icon: HiQuestionMarkCircle },
        { name: 'Attendance', path: '/student/attendance', icon: HiCalendar },
        { name: 'Assignments', path: '/student/assignments', icon: HiClipboardList },
        { name: 'Profile', path: '/student/profile', icon: HiUser },
      ];
    } else if (user?.role === 'teacher') {
      return [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: HiHome },
        { name: 'Tests', path: '/teacher/tests', icon: HiAcademicCap },
        { name: 'Create Test', path: '/teacher/create-test', icon: HiDocumentText },
        { name: 'Attendance', path: '/teacher/attendance', icon: HiCalendar },
        { name: 'Assignments', path: '/teacher/assignments', icon: HiClipboardList },
        { name: 'Doubts', path: '/teacher/doubts', icon: HiQuestionMarkCircle },
        { name: 'Students', path: '/teacher/students', icon: HiUserGroup },
        { name: 'Profile', path: '/teacher/profile', icon: HiUser },
      ];
    } else if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
        { name: 'Approvals', path: '/admin/approvals', icon: HiUserGroup },
        { name: 'Classes', path: '/admin/classes', icon: HiBookOpen },
        { name: 'Subjects', path: '/admin/subjects', icon: HiAcademicCap },
        { name: 'Chapters', path: '/admin/chapters', icon: HiDocumentText },
        { name: 'Fee Payments', path: '/admin/fees', icon: HiCash },
        { name: 'Notifications', path: '/admin/notifications', icon: HiBell },
        { name: 'Settings', path: '/admin/settings', icon: HiCog },
      ];
    }
    return [];
  };

  const navItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
        </button>
        <Link to="/" className="flex items-center space-x-2">
          <img src="/images/logo.png" alt="EduVibe" className="h-8 w-8" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            EduVibe
          </span>
        </Link>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="lg:translate-x-0 fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 lg:z-30 pt-16 lg:pt-0"
      >
        <div className="h-full flex flex-col">
          {/* Logo (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3 p-6 border-b border-gray-200 dark:border-gray-700">
            <img src="/images/logo.png" alt="EduVibe" className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              EduVibe
            </span>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-lg">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <HiLogout className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;