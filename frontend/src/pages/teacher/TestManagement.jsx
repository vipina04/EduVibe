import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlus, HiTrash, HiPencil } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TestManagement = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await teacherAPI.getTestDetail(testId);
      setTest(response.data);
    } catch (error) {
      console.error('Failed to load test:', error);
      toast.error('Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await teacherAPI.deleteQuestion(questionId);
      toast.success('Question deleted successfully');
      fetchTest();
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {test?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage test questions and settings
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate(`/teacher/TeacherAllTests/${testId}/results`)}>
            View Results
          </Button>
        </div>

        <Card className="bg-white dark:bg-gray-800 mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Info</h2>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{test?.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Marks</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{test?.marks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{test?.duration_minutes} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attempts</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{test?.attempts_count || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Questions ({test?.questions?.length || 0})
          </h2>
        </div>

        {test?.questions?.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No questions added yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {test?.questions?.map((question, index) => (
              <Card key={question.id} className="bg-white dark:bg-gray-800">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h3>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <HiTrash className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{question.question_text}</p>
                  {question.question_image && (
                    <img src={question.question_image} alt="Question" className="max-w-sm rounded-lg mb-3" />
                  )}
                  {test.type === 'mcq' && (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(num => question[`option${num}`] && (
                        <div
                          key={num}
                          className={`p-3 rounded-lg border-2 ${
                            question.correct_option === num
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {question[`option${num}`]}
                          {question.correct_option === num && (
                            <span className="ml-2 text-green-600 font-semibold">(Correct)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Explanation:</p>
                      <p className="text-blue-800 dark:text-blue-200">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestManagement;



















// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function TestManagement() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Management - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }