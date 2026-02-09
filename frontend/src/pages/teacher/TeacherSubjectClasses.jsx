import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiAcademicCap } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherSubjectClasses = () => {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectClasses();
  }, [subjectId]);

  const fetchSubjectClasses = async () => {
    try {
      const response = await teacherAPI.getSubjectClasses(subjectId);
      setData(response.data);
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/teacher/dashboard">
            <Button variant="secondary" size="sm">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.subject?.name || 'Subject'} - Classes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Select a class to view chapters and create tests
            </p>
          </div>
        </div>

        {/* Classes Grid */}
        {data?.classes && data.classes.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Classes Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to teach this subject in any class yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.classes?.map((classItem) => (
              <Link 
                key={classItem.id}
                to={`/teacher/class/${classItem.id}/subject/${subjectId}/chapters`}
              >
                <Card className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <HiAcademicCap className="w-12 h-12 text-blue-600" />
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm font-semibold">
                        {classItem.students_count || 0} Students
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {classItem.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Chapters</p>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {classItem.chapters_count || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Tests</p>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {classItem.tests_count || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherSubjectClasses;



















// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function TeacherSubjectClasses() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subject Classes - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }