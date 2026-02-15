import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiAcademicCap, HiArrowLeft, HiBookOpen, HiClipboardList } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      console.log('🔄 Fetching subjects...');
      const response = await studentAPI.getEnrolledSubjects();
      console.log('✅ Subjects data:', response.data);
      setSubjects(response.data || []);
    } catch (error) {
      console.error('❌ Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/student/dashboard">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Subjects
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View all subjects in your class
              </p>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <Card className="p-12 text-center">
            <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No subjects have been assigned to your class yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link key={subject.id} to={`/student/subject/${subject.id}`}>
                <Card hover className="h-full cursor-pointer group transition-all duration-300 hover:shadow-xl">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl group-hover:from-indigo-200 group-hover:to-purple-200 dark:group-hover:from-indigo-900/50 dark:group-hover:to-purple-900/50 transition-all duration-300">
                        <HiAcademicCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      {subject.completed_chapters !== undefined && (
                        <div className="text-right">
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">Completed</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {subject.completed_chapters || 0}/{subject.chapters_count || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Subject Name */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {subject.name}
                    </h3>
                    
                    {/* Teacher */}
                    {subject.teacher_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {subject.teacher_name}
                      </p>
                    )}
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <HiBookOpen className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Chapters</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {subject.chapters_count || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {subject.total_tests !== undefined && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <HiClipboardList className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tests</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {subject.total_tests || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {subject.attempted_tests !== undefined && subject.total_tests > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">Test Progress</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {Math.round((subject.attempted_tests / subject.total_tests) * 100)}%
                          </span>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(subject.attempted_tests / subject.total_tests) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentSubjects;