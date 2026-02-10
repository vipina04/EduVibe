import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { teacherAPI } from '../../services/api';
import { showToast } from '../../utils/toast';
import { HiAcademicCap, HiBookOpen, HiUsers, HiClipboardList } from 'react-icons/hi';

export default function TeacherMyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getClasses();
      console.log('✅ Classes loaded:', response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('❌ Failed to load classes:', error);
      showToast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classId) => {
    // Navigate to view subjects for this class
    navigate(`/teacher/class/${classId}/subjects`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Click on a class to view subjects you teach
          </p>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Classes Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to any classes yet. Contact your admin for class assignments.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                onClick={() => handleClassClick(classItem.id)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all cursor-pointer group border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <HiAcademicCap className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-white/90 text-sm font-medium">
                      Click to view
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Class Name */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {classItem.name}
                  </h3>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Subjects Count */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <HiBookOpen className="w-4 h-4" />
                        <span className="text-xs font-medium">Subjects</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {classItem.subjects_count || 0}
                      </p>
                    </div>

                    {/* Students Count */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <HiUsers className="w-4 h-4" />
                        <span className="text-xs font-medium">Students</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {classItem.students_count || 0}
                      </p>
                    </div>

                    {/* Tests Count */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 col-span-2">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <HiClipboardList className="w-4 h-4" />
                        <span className="text-xs font-medium">Tests Created</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {classItem.tests_count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Hover Effect */}
                <div className="px-6 pb-6">
                  <div className="w-full py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors">
                    View Subjects →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}