import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiClock, HiQuestionMarkCircle, HiPlay } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChapterTests = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapterTests();
  }, [chapterId]);

  const fetchChapterTests = async () => {
    try {
      const response = await studentAPI.getChapterTests(chapterId);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load tests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      const response = await studentAPI.startTest(testId);
      const attemptId = response.data.test_attempt_id;
      navigate(`/student/test/${testId}/take?attempt=${attemptId}`);
      toast.success('Test started!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start test');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" icon={<HiArrowLeft />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.chapter?.name || 'Chapter Tests'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {data?.tests?.length || 0} tests available
            </p>
          </div>
        </div>

        {/* Tests List */}
        {data?.tests && data.tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tests.map((test) => (
              <Card key={test.id} className="bg-white dark:bg-gray-800 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {test.name}
                </h3>

                {test.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {test.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiQuestionMarkCircle className="w-4 h-4 mr-2" />
                    {test.total_questions} Questions
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiClock className="w-4 h-4 mr-2" />
                    {test.duration} minutes
                  </div>
                  {test.total_marks && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      📊 Total Marks: {test.total_marks}
                    </div>
                  )}
                </div>

                {test.my_attempt ? (
                  <div className="space-y-2">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                      ✓ Already attempted
                    </div>
                    <Link to={`/student/test-attempt/${test.my_attempt.id}/result`}>
                      <Button variant="outline" className="w-full" size="sm">
                        View Result
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    icon={<HiPlay />}
                    onClick={() => handleStartTest(test.id)}
                  >
                    Start Test
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No tests available for this chapter yet
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChapterTests;














// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function ChapterTests() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chapter Tests - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }