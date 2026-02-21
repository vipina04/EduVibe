import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiBookOpen, HiCheckCircle, HiPlus } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherChapters = () => {
  const { classId, subjectId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId && subjectId) {
      fetchChapters();
    }
  }, [classId, subjectId]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      // ✅ Correct endpoint: /teachers/class/<classId>/subject/<subjectId>/chapters/
      const response = await teacherAPI.getChapters(classId, subjectId);
      setChapters(response.data || []);

      // Get subject/class name from first chapter or from subjects API
      if (response.data?.length > 0) {
        setSubjectName(response.data[0]?.subject_name || '');
        setClassName(response.data[0]?.class_name || '');
      }
    } catch (error) {
      console.error('Failed to load chapters:', error);
      toast.error('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (chapterId, isCompleted) => {
    try {
      await teacherAPI.markChapterComplete(chapterId);
      toast.success(`Chapter marked as ${isCompleted ? 'incomplete' : 'completed'}`);
      fetchChapters();
    } catch (error) {
      console.error('Failed to update chapter:', error);
      toast.error('Failed to update chapter');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to={`/teacher/class/${classId}/subjects`}>
            <Button variant="secondary" size="sm">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back to Subjects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chapters
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage chapters and create tests
            </p>
          </div>
        </div>

        {/* Chapters List */}
        {chapters.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Chapters Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Chapters need to be added by the admin first.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <Card
                key={chapter.id}
                className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold text-gray-400">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {chapter.name}
                        </h3>
                        {chapter.is_completed && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs font-semibold flex items-center">
                            <HiCheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-6 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Tests Created</p>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {chapter.tests_count || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Link to={`/teacher/chapter/${chapter.id}/tests`}>
                        <Button variant="primary" size="sm">
                          <HiBookOpen className="w-4 h-4 mr-2" />
                          View Tests
                        </Button>
                      </Link>
                      {/* ✅ Create test navigates with classId+subjectId context */}
                      <Link to={`/teacher/chapter/${chapter.id}/test/create`}>
                        <Button variant="secondary" size="sm">
                          <HiPlus className="w-4 h-4 mr-2" />
                          Create Test
                        </Button>
                      </Link>
                      <Button
                        variant={chapter.is_completed ? "secondary" : "success"}
                        size="sm"
                        onClick={() => handleMarkComplete(chapter.id, chapter.is_completed)}
                      >
                        {chapter.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                      </Button>
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

export default TeacherChapters;


















