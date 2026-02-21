import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { 
  HiClipboardList, 
  HiPlus, 
  HiCalendar, 
  HiUsers,
  HiCheckCircle,
  HiClock 
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getAssignments();
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'active') return assignment.status === 'active';
    if (filter === 'completed') return assignment.status === 'completed';
    return true;
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Assignments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage assignments for your students
            </p>
          </div>
          <Button
            onClick={() => navigate('/teacher/assignments/create')}
            className="flex items-center space-x-2"
          >
            <HiPlus className="w-5 h-5" />
            <span>Create Assignment</span>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          {['all', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <Card className="p-12 text-center">
            <HiClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't created any assignments yet."
                : `No ${filter} assignments found.`}
            </p>
            <Button onClick={() => navigate('/teacher/assignments/create')}>
              Create Your First Assignment
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/teacher/assignments/${assignment.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {assignment.subject_name} - {assignment.class_name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>

                {/* Description */}
                {assignment.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <HiCalendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Due Date</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <HiUsers className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Submissions</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {assignment.submissions_count || 0} / {assignment.total_students || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Submission Progress</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {Math.round(((assignment.submissions_count || 0) / (assignment.total_students || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round(((assignment.submissions_count || 0) / (assignment.total_students || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/assignments/${assignment.id}`);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/assignments/${assignment.id}/submissions`);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    Submissions
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignments;














