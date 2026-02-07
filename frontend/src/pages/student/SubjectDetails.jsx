import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiBookOpen } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SubjectDetails = () => {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectDetails();
  }, [subjectId]);

  const fetchSubjectDetails = async () => {
    try {
      const response = await studentAPI.getSubjectDetails(subjectId);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load subject details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Subject not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/student/dashboard">
              <Button variant="ghost" icon={<HiArrowLeft />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.subject.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Teacher: {data.subject.teacher_name}
              </p>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Chapters ({data.chapters?.length || 0})
          </h2>

          {data.chapters && data.chapters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.chapters.map((chapter) => (
                <Card key={chapter.id} hover className="bg-white dark:bg-gray-800 shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <HiBookOpen className="w-8 h-8 text-blue-600" />
                    {chapter.is_completed && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {chapter.name}
                  </h3>
                  
                  {chapter.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                      {chapter.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {chapter.tests_count || 0} Tests
                    </span>
                    <Link to={`/student/chapter/${chapter.id}/tests`}>
                      <Button size="sm">View Tests</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-gray-800 p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No chapters available yet
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubjectDetails;














// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function SubjectDetails() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subject Details - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }