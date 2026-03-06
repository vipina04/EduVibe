import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiClipboardList, HiEye, HiPencil } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherChapterTests = () => {
  const { chapterId } = useParams();
  console.log("chapterId =", chapterId);

  const [tests, setTests] = useState([]);
  const [chapterInfo, setChapterInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, [chapterId]);

  const fetchTests = async () => {
    try {
      const response = await teacherAPI.getChapterTests(chapterId);
      setTests(response.data.tests || []);
      setChapterInfo(response.data.chapter_info);
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to={`/teacher/class/${chapterInfo?.class_id}/subject/${chapterInfo?.subject_id}/chapters`}>
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tests - {chapterInfo?.chapter_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {chapterInfo?.class_name} • {chapterInfo?.subject_name}
              </p>
            </div>
          </div>
          <Link to={`/teacher/chapter/${chapterId}/test/create`}>
            <Button variant="primary">
              <HiClipboardList className="w-5 h-5 mr-2" />
              Create New Test
            </Button>
          </Link>
        </div>

        {/* Tests List */}
        {tests.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Tests Created Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first test for this chapter
            </p>
            <Link to={`/teacher/chapter/${chapterId}/test/create`}>
              <Button variant="primary">
                Create Test
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <Card 
                key={test.id}
                className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {test.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          test.type === 'mcq'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                        }`}>
                          {test.type}
                        </span>
                      </div>
                      {test.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {test.description}
                        </p>
                      )}
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Marks</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {test.marks}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {test.questions_count || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {test.duration_minutes} min
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Attempts</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {test.attempts_count || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link to={`/teacher/tests/${test.id}/results`}>
                      {/* <Link to={`/teacher/TeacherAllTests/${test.id}/results`}> */}
                        <Button variant="secondary" size="sm">
                          <HiEye className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      </Link>
                      <Link to={`/teacher/test/${test.id}/manage`}>
                        <Button variant="primary" size="sm">
                          <HiPencil className="w-4 h-4 mr-2" />
                          Manage Test
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherChapterTests;













