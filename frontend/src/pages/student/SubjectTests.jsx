import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiClipboardList, 
  HiClock, 
  HiCheckCircle,
  HiPlay,
  HiEye 
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SubjectTests = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectTests();
  }, [subjectId]);

  const fetchSubjectTests = async () => {
    try {
      const response = await studentAPI.getSubjectTests(subjectId);
      setTests(response.data.tests);
      setSubjectName(response.data.subject_name);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error(error.response?.data?.error || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId) => {
    navigate(`/student/test/${testId}/take`);
  };

  const handleViewResult = (attemptId) => {
    navigate(`/student/test-attempt/${attemptId}/result`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/student/my-tests')}
            variant="secondary"
            className="mb-4 flex items-center space-x-2"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Back to Subjects</span>
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{subjectName}</h1>
          <p className="text-gray-600">Available Tests: {tests.length}</p>
        </div>

        {/* Tests List */}
        {tests.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <HiClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No tests available for this subject yet.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <Card
                key={test.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Test Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          test.type_code === 'mcq'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {test.type}
                        </span>
                        
                        {test.attempted && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 flex items-center">
                            <HiCheckCircle className="w-4 h-4 mr-1" />
                            Attempted
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {test.chapter_name}
                      </h3>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <HiClipboardList className="w-4 h-4" />
                          <span>Marks: {test.marks}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <HiClock className="w-4 h-4" />
                          <span>Duration: {test.duration_minutes} mins</span>
                        </div>
                      </div>

                      {test.attempted && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Your Score:</span>
                            <span className="font-bold text-lg text-indigo-600">
                              {test.score}/{test.marks} ({test.percentage}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6">
                      {test.attempted ? (
                        <Button
                          onClick={() => handleViewResult(test.attempt_id)}
                          variant="secondary"
                          className="flex items-center space-x-2"
                        >
                          <HiEye className="w-5 h-5" />
                          <span>View Result</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleStartTest(test.id)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          <HiPlay className="w-5 h-5" />
                          <span>Start Test</span>
                        </Button>
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

export default SubjectTests;