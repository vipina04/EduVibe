import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { HiUserGroup, HiAcademicCap, HiUsers } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const TeacherStudents = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // Fetch classes assigned to this teacher
      const response = await teacherAPI.getAssignedClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View students in your assigned classes
          </p>
        </div>

        {/* Classes List */}
        {classes.length === 0 ? (
          <Card className="p-12 text-center">
            <HiUserGroup className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Classes Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to teach any classes yet. Contact admin to get class assignments.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/teacher/classes/${classItem.id}/students`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <HiAcademicCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {classItem.class_name}
                </h3>

                <div className="space-y-3">
                  {/* Subject Info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Subject:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {classItem.subjects?.map((subject) => (
                        <span
                          key={subject.id}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Student Count */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <HiUsers className="w-5 h-5" />
                      <span className="text-sm">Total Students</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {classItem.student_count || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/classes/${classItem.id}/students`);
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Students
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {classes.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Total Overview</h3>
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-purple-100 text-sm">Classes</p>
                    <p className="text-3xl font-bold">{classes.length}</p>
                  </div>
                  <div>
                    <p className="text-purple-100 text-sm">Total Students</p>
                    <p className="text-3xl font-bold">
                      {classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
              <HiUserGroup className="w-16 h-16 opacity-50" />
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherStudents;