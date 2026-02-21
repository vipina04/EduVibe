import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiBookOpen,
  HiAcademicCap,
  HiUser,
  HiArrowLeft,
  HiChevronRight,
} from 'react-icons/hi';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StudentSubjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getSubjects();
      
      // ✅ PROFESSIONAL DATA EXTRACTION - Handle multiple response formats
      let subjectsArray = [];
      
      if (response.data) {
        // Case 1: Response is directly an array
        if (Array.isArray(response.data)) {
          subjectsArray = response.data;
        }
        // Case 2: Response has a 'subjects' property (object wrapper)
        else if (response.data.subjects && Array.isArray(response.data.subjects)) {
          subjectsArray = response.data.subjects;
        }
        // Case 3: Response is an object but not expected structure
        else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Log warning and try to extract array from common keys
          console.warn('⚠️ Unexpected subjects data structure:', response.data);
          
          // Try common keys
          const possibleKeys = ['data', 'results', 'items', 'list'];
          for (const key of possibleKeys) {
            if (response.data[key] && Array.isArray(response.data[key])) {
              subjectsArray = response.data[key];
              console.log(`✅ Extracted subjects from key: ${key}`);
              break;
            }
          }
          
          // If still empty, show error
          if (subjectsArray.length === 0) {
            console.error('❌ Could not extract subjects array from response');
            toast.error('Unexpected data format received');
          }
        }
      }
      
      console.log(`✅ Successfully loaded ${subjectsArray.length} subjects`);
      setSubjects(subjectsArray);
      
    } catch (error) {
      console.error('❌ Failed to load subjects:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to load subjects';
      toast.error(errorMessage);
      setSubjects([]); // Ensure subjects is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/student/subject/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <HiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            <HiBookOpen className="mr-3 text-blue-600" />
            My Subjects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and access all your enrolled subjects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Subjects
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {subjects.length}
                </p>
              </div>
              <HiBookOpen className="text-blue-500 text-4xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Active Subjects
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {subjects.filter((s) => s.isActive !== false).length}
                </p>
              </div>
              <HiAcademicCap className="text-green-500 text-4xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Teachers
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {new Set(
                    subjects
                      .map((s) => s.teacher?.id || s.teacher?.name || s.teacher_name)
                      .filter(Boolean)
                  ).size}
                </p>
              </div>
              <HiUser className="text-purple-500 text-4xl" />
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <HiBookOpen className="mx-auto text-gray-400 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No subjects enrolled
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven't been enrolled in any subjects yet. Please contact your administrator.
            </p>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id || subject._id}
                onClick={() => handleSubjectClick(subject.id || subject._id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-500 overflow-hidden group"
              >
                {/* Subject Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <HiBookOpen className="text-3xl opacity-80" />
                    <HiChevronRight className="text-2xl group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mt-4 mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-blue-100 text-sm line-clamp-2">
                    {subject.description || 'No description available'}
                  </p>
                </div>

                {/* Subject Details */}
                <div className="p-6">
                  {/* Teacher Info */}
                  <div className="flex items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                      <HiUser className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Teacher</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {subject.teacher?.name || 
                         subject.teacher_name ||
                         (subject.teacher?.first_name && subject.teacher?.last_name 
                           ? `${subject.teacher.first_name} ${subject.teacher.last_name}` 
                           : 'Not assigned')}
                      </p>
                    </div>
                  </div>

                  {/* Subject Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chapters</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {subject.chaptersCount || 
                         subject.chapters_count || 
                         subject.total_chapters || 
                         subject.chapters?.length || 
                         0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tests</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {subject.testsCount || 
                         subject.tests_count || 
                         subject.total_tests || 
                         subject.tests?.length || 
                         0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;















