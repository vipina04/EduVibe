import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiBookOpen, HiClock, HiCheckCircle, HiDownload } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await studentAPI.getMyAssignments();
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  const pendingAssignments = assignments.filter(a => !a.submitted);
  const completedAssignments = assignments.filter(a => a.submitted);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/student/dashboard">
            <Button variant="secondary" size="sm">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Assignments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and submit your assignments
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Total</p>
                <p className="text-3xl font-bold">{assignments.length}</p>
              </div>
              <HiBookOpen className="w-10 h-10 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 mb-1">Pending</p>
                <p className="text-3xl font-bold">{pendingAssignments.length}</p>
              </div>
              <HiClock className="w-10 h-10 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Completed</p>
                <p className="text-3xl font-bold">{completedAssignments.length}</p>
              </div>
              <HiCheckCircle className="w-10 h-10 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Assignments Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your assignments will appear here when teachers post them.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Assignments */}
            {pendingAssignments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Pending Assignments
                </h2>
                <div className="space-y-4">
                  {pendingAssignments.map((assignment) => (
                    <Card 
                      key={assignment.id}
                      className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all border-l-4 border-orange-500"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {assignment.title || 'Assignment'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {assignment.description}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Subject</p>
                                <p className="text-gray-900 dark:text-white font-medium">
                                  {assignment.subject_name || 'N/A'}
                                </p>
                              </div>
                              {assignment.due_date && (
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Due Date</p>
                                  <p className="text-gray-900 dark:text-white font-medium">
                                    {new Date(assignment.due_date).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-6 flex flex-col space-y-2">
                            {assignment.file && (
                              <a 
                                href={assignment.file}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="secondary" size="sm">
                                  <HiDownload className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Assignments */}
            {completedAssignments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Completed Assignments
                </h2>
                <div className="space-y-4">
                  {completedAssignments.map((assignment) => (
                    <Card 
                      key={assignment.id}
                      className="bg-white dark:bg-gray-800 border-l-4 border-green-500"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {assignment.title || 'Assignment'}
                              </h3>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Submitted
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Subject</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {assignment.subject_name || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Submitted On</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {assignment.submitted_at 
                                    ? new Date(assignment.submitted_at).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                              </div>
                              {assignment.grade && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Grade</p>
                                  <p className="text-sm font-medium text-green-600">
                                    {assignment.grade}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <HiCheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAssignments;



















// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function MyAssignments() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assignments - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }