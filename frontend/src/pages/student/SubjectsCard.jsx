// ============================================
// FILE: frontend/src/components/student/SubjectsCard.jsx
// Professional Subjects & Chapters Display Component
// ============================================

import { useState, useEffect } from 'react';
import { HiBookOpen, HiChevronDown, HiChevronRight, HiAcademicCap } from 'react-icons/hi';
import Card from '../common/Card';
import Loading from '../common/Loading';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SubjectsCard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [chaptersData, setChaptersData] = useState({});
  const [loadingChapters, setLoadingChapters] = useState({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getEnrolledSubjects();
      console.log('📚 Subjects response:', response.data);
      
      // Handle different response structures
      const subjectsArray = Array.isArray(response.data) 
        ? response.data 
        : response.data.subjects || [];
      
      setSubjects(subjectsArray);
    } catch (error) {
      console.error('❌ Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (subjectId) => {
    try {
      setLoadingChapters(prev => ({ ...prev, [subjectId]: true }));
      const response = await studentAPI.getSubjectChapters(subjectId);
      console.log(`📖 Chapters for subject ${subjectId}:`, response.data);
      
      // Handle different response structures
      const chaptersArray = Array.isArray(response.data)
        ? response.data
        : response.data.chapters || [];
      
      setChaptersData(prev => ({
        ...prev,
        [subjectId]: chaptersArray
      }));
    } catch (error) {
      console.error(`❌ Failed to fetch chapters for subject ${subjectId}:`, error);
      toast.error('Failed to load chapters');
      setChaptersData(prev => ({
        ...prev,
        [subjectId]: []
      }));
    } finally {
      setLoadingChapters(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const toggleSubject = (subjectId) => {
    if (expandedSubject === subjectId) {
      // Collapse
      setExpandedSubject(null);
    } else {
      // Expand
      setExpandedSubject(subjectId);
      
      // Fetch chapters if not already loaded
      if (!chaptersData[subjectId]) {
        fetchChapters(subjectId);
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      </Card>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <HiBookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My Subjects
          </h2>
        </div>
        <div className="text-center py-8">
          <HiAcademicCap className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No subjects enrolled yet
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <HiBookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Subjects
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-3">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Subject Header - Clickable */}
            <button
              onClick={() => toggleSubject(subject.id)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSubject === subject.id ? (
                  <HiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <HiChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {subject.name}
                  </h3>
                  {subject.total_chapters !== undefined && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {subject.total_chapters} chapter{subject.total_chapters !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Stats Badge */}
              {subject.total_tests !== undefined && (
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                    {subject.attempted_tests || 0}/{subject.total_tests || 0} tests
                  </span>
                </div>
              )}
            </button>

            {/* Chapters List - Expandable */}
            {expandedSubject === subject.id && (
              <div className="px-4 py-3 bg-white dark:bg-gray-900/50">
                {loadingChapters[subject.id] ? (
                  <div className="flex items-center justify-center py-4">
                    <Loading size="sm" />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading chapters...
                    </span>
                  </div>
                ) : chaptersData[subject.id] && chaptersData[subject.id].length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      Chapters
                    </p>
                    {chaptersData[subject.id].map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {chapter.name}
                          </span>
                        </div>
                        
                        {chapter.tests_count !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {chapter.tests_count} test{chapter.tests_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No chapters available yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SubjectsCard;