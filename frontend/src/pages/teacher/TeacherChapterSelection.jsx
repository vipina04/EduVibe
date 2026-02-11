import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiBookOpen,
  HiPlus,
  HiCheckCircle
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const TeacherChapterSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, classId, chapters = [] } = location.state || {};

  useEffect(() => {
    // Redirect if no data
    if (!subjectId || !classId) {
      toast.error('Please select subject and class first');
      navigate('/teacher/test/create');
    }
  }, [subjectId, classId, navigate]);

  const handleChapterSelect = (chapterId) => {
    // Navigate to actual test creation page with chapter selected
    navigate(`/teacher/test/create/${chapterId}`);
  };

  if (!subjectId || !classId) {
    return null; // Will redirect
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/teacher/test/create">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Select Chapter
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Choose a chapter to create a test for
              </p>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        {chapters.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Chapters Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No chapters have been created for this class and subject yet.
            </p>
            <Link to="/teacher/dashboard">
              <Button variant="primary">
                Back to Dashboard
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <Card 
                key={chapter.id}
                className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => handleChapterSelect(chapter.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <HiBookOpen className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    {chapter.is_completed && (
                      <HiCheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {chapter.name}
                  </h3>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`font-semibold ${
                        chapter.is_completed 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {chapter.is_completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Existing Tests:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {chapter.tests_count || 0}
                      </span>
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChapterSelect(chapter.id);
                    }}
                  >
                    <HiPlus className="w-4 h-4 mr-2" />
                    Create Test for this Chapter
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherChapterSelection;