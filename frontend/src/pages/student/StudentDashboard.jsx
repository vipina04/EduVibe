import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiAcademicCap, HiClipboardList, HiCalendar } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await studentAPI.getDashboard();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Welcome, {data?.student?.full_name}!
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card glass>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Total Subjects</p>
                <p className="text-3xl font-bold text-blue-600">{data?.subjects?.length || 0}</p>
              </div>
              <HiAcademicCap className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card glass>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Tests Taken</p>
                <p className="text-3xl font-bold text-green-600">{data?.tests_taken || 0}</p>
              </div>
              <HiClipboardList className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card glass>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Attendance</p>
                <p className="text-3xl font-bold text-purple-600">{data?.attendance_percentage || 0}%</p>
              </div>
              <HiCalendar className="w-12 h-12 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Subjects */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.subjects?.map((subject) => (
              <Link key={subject.id} to={`/student/subject/${subject.id}`}>
                <Card glass hover>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {subject.chapters_count} Chapters
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Teacher: {subject.teacher_name}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;