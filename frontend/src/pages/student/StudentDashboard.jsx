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


























