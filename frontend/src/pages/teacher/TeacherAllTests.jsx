import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiClipboardList, HiEye, HiPencil } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherAllTests = () => {
  const [testsBySubject, setTestsBySubject] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTests();
  }, []);

  const fetchAllTests = async () => {
    try {
      // Call API to get all tests created by this teacher
      const response = await teacherAPI.getAllTests();
      setTestsBySubject(response.data.tests_by_subject || []);
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            All tests you've created across all subjects
          </p>
        </div>

        {/* Tests grouped by subject */}
        {testsBySubject.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Tests Created Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Go to a chapter to create your first test
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {testsBySubject.map((subjectGroup) => (
              <div key={subjectGroup.subject_id}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {subjectGroup.class_name} - {subjectGroup.subject_name}
                </h2>
                
                <div className="space-y-4">
                  {subjectGroup.tests.map((test) => (
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Chapter: {test.chapter_name}
                            </p>
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
                              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center">
                                <HiEye className="w-4 h-4 mr-2" />
                                View Results
                              </button>
                            </Link>
                            <Link to={`/teacher/test/${test.id}/manage`}>
                              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                                <HiPencil className="w-4 h-4 mr-2" />
                                Manage Test
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAllTests;