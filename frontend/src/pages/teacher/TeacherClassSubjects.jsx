import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import { showToast } from '../../utils/toast';
import { HiArrowLeft, HiBookOpen, HiDocumentText, HiClipboardList } from 'react-icons/hi';

export default function TeacherClassSubjects() {
  const { classId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (classId) {
      fetchSubjects();
    }
  }, [classId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching subjects for class:', classId);
      const response = await teacherAPI.getClassSubjects(classId);
      console.log('✅ Subjects loaded:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('❌ Failed to load subjects:', error);
      showToast('Failed to load subjects',error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectId) => {
    // Navigate to chapters for this subject in this class
    navigate(`/teacher/class/${classId}/subject/${subjectId}/chapters`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/teacher/classes">
            <Button variant="secondary" size="sm">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back to Classes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.class_name} - Subjects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Select a subject to view chapters and create tests
            </p>
          </div>
        </div>

        {/* Subjects Grid */}
        {!data?.subjects || data.subjects.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to teach any subjects in this class yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSubjectClick(subject.id)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all cursor-pointer group border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <HiBookOpen className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-white/90 text-sm font-medium">
                      Click to view
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Subject Name */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {subject.name}
                  </h3>

                  {/* Stats Grid */}
                  <div className="space-y-3">
                    {/* Chapters Progress */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <HiDocumentText className="w-4 h-4" />
                          <span className="text-xs font-medium">Chapters</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {subject.completed_chapters}/{subject.chapters_count}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: subject.chapters_count > 0
                              ? `${(subject.completed_chapters / subject.chapters_count) * 100}%`
                              : '0%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Tests Count */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <HiClipboardList className="w-4 h-4" />
                        <span className="text-xs font-medium">Tests Created</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {subject.tests_count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Hover Effect */}
                <div className="px-6 pb-6">
                  <div className="w-full py-2 bg-green-600 group-hover:bg-green-700 text-white rounded-lg text-center font-medium transition-colors">
                    View Chapters →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}