import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiUser, HiTrendingUp, HiTrendingDown, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TestResults = () => {
  const { testId } = useParams();
  const [testInfo, setTestInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      fetchTestResults();
    }
  }, [testId]); 

  const fetchTestResults = async () => {
    try {
      const response = await teacherAPI.getTestResults(testId);
      setTestInfo(response.data.test_info);
      setResults(response.data.results || []);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load test results:', error);
      toast.error('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 75) return <HiTrendingUp className="w-5 h-5" />;
    if (percentage >= 50) return <HiCheckCircle className="w-5 h-5" />;
    return <HiTrendingDown className="w-5 h-5" />;
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/teacher/TeacherAllTests">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Test Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {testInfo?.name}
              </p>
            </div>
          </div>
          <Link to={`/teacher/test/${testId}/manage`}>
            <Button variant="primary" size="sm">
              Manage Test
            </Button>
          </Link>
        </div>

        {/* Test Info Card */}
        <Card className="bg-white dark:bg-gray-800 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {testInfo?.subject_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {testInfo?.class_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chapter</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {testInfo?.chapter_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {testInfo?.marks}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {testInfo?.type}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="p-6">
                <p className="text-sm opacity-90 mb-2">Total Attempts</p>
                <p className="text-4xl font-bold">{stats.total_attempts}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="p-6">
                <p className="text-sm opacity-90 mb-2">Average Score</p>
                <p className="text-4xl font-bold">{stats.average_score?.toFixed(1) || '0.0'}%</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="p-6">
                <p className="text-sm opacity-90 mb-2">Highest Score</p>
                <p className="text-4xl font-bold">{stats.highest_score || 0}%</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="p-6">
                <p className="text-sm opacity-90 mb-2">Lowest Score</p>
                <p className="text-4xl font-bold">{stats.lowest_score || 0}%</p>
              </div>
            </Card>
          </div>
        )}

        {/* Results List */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Student Results ({results.length})
          </h2>
        </div>

        {results.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Attempts Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Students haven't attempted this test yet
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card 
                key={result.id}
                className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {result.student_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.student_unique_id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                        <div className={`flex items-center space-x-2 ${getScoreColor(result.percentage)}`}>
                          {getScoreIcon(result.percentage)}
                          <p className="text-2xl font-bold">
                            {result.score}/{testInfo?.marks}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                        <p className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                          {result.percentage.toFixed(1)}%
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(result.submitted_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(result.submitted_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {result.percentage >= 75 ? (
                        <HiCheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <HiXCircle className="w-8 h-8 text-gray-400" />
                      )}
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

export default TestResults;
