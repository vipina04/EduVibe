import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiAcademicCap,
  HiBookOpen,
  HiChevronRight,
  HiClipboardList,
  HiDocumentText,
  HiCheckCircle,
  HiPlus
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherTestSelection = () => {
  const navigate = useNavigate();

  // Step tracking: 'subject' | 'class' | 'chapter'
  const [step, setStep] = useState('subject');

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [selectedClass, setSelectedClass] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // ── Load subjects on mount ────────────────────────────────
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await teacherAPI.getSubjects();
      const data = response.data || [];

      // Deduplicate by subject id on frontend too (safety net)
      const seen = new Map();
      data.forEach(s => {
        if (!seen.has(s.id)) seen.set(s.id, s);
      });
      setSubjects(Array.from(seen.values()));
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // ── Step 1: Subject selected → load its classes ───────────
  const handleSubjectSelect = async (subject) => {
    setSelectedSubject(subject);
    setStep('class');
    setClasses([]);
    setLoadingClasses(true);
    try {
      // GET /teachers/subject-classes/?subject_id=<id>
      const response = await teacherAPI.getSubjectClasses(subject.id);
      const data = Array.isArray(response.data) ? response.data : (response.data.classes || []);
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error('Failed to load classes for this subject');
    } finally {
      setLoadingClasses(false);
    }
  };

  // ── Step 2: Class selected → load chapters ────────────────
  const handleClassSelect = async (classItem) => {
    setSelectedClass(classItem);
    setStep('chapter');
    setChapters([]);
    setLoadingChapters(true);
    try {
      // GET /teachers/class/<classId>/subject/<subjectId>/chapters/
      const response = await teacherAPI.getClassChapters(classItem.id, selectedSubject.id);
      const data = Array.isArray(response.data) ? response.data : [];
      setChapters(data);
      if (data.length === 0) {
        toast.error('No chapters found for this subject in this class. Ask admin to add chapters.');
      }
    } catch (error) {
      console.error('Failed to load chapters:', error);
      toast.error('Failed to load chapters');
    } finally {
      setLoadingChapters(false);
    }
  };

  // ── Step 3: Chapter selected → go to CreateTest ───────────
  // const handleChapterSelect = (chapter) => {
  //   navigate(`/teacher/chapter/${chapter.id}/test/create`, {
  //     state: {
  //       chapterId: chapter.id,
  //       chapterName: chapter.name,
  //       subjectId: selectedSubject.id,
  //       subjectName: selectedSubject.name,
  //       classId: selectedClass.id,
  //       className: selectedClass.name,
  //     }
  //   });
  // };
//   const handleChapterSelect = (chapter) => {
//   navigate('/teacher/test/new', {
//     state: {
//       preselectedChapterId: chapter.id,
//       preselectedChapterName: chapter.name,
//       preselectedSubjectId: selectedSubject.id,
//       preselectedSubjectName: selectedSubject.name,
//       preselectedClassId: selectedClass.id,
//       preselectedClassName: selectedClass.name,
//     }
//   });
// };
const handleChapterSelect = (chapter) => {
  navigate(`/teacher/chapter/${chapter.id}/test/create`);
  };

  // ── Breadcrumb / back navigation ──────────────────────────
  const goBack = () => {
    if (step === 'chapter') {
      setStep('class');
      setSelectedClass(null);
      setChapters([]);
    } else if (step === 'class') {
      setStep('subject');
      setSelectedSubject(null);
      setClasses([]);
    } else {
      navigate('/teacher/dashboard');
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Test</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Select a subject and class to create a test
            </p>
          </div>
        </div>

        {/* Breadcrumb Steps */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className={`px-3 py-1 rounded-full font-medium ${step === 'subject' ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
            1. Subject {selectedSubject ? `— ${selectedSubject.name}` : ''}
          </span>
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          <span className={`px-3 py-1 rounded-full font-medium ${step === 'class' ? 'bg-blue-600 text-white' : step === 'chapter' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            2. Class {selectedClass ? `— ${selectedClass.name}` : ''}
          </span>
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          <span className={`px-3 py-1 rounded-full font-medium ${step === 'chapter' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            3. Chapter
          </span>
        </div>

        {/* ── STEP 1: Select Subject ── */}
        {step === 'subject' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Select a Subject you teach:
            </h2>
            {loadingSubjects ? (
              <Loading />
            ) : subjects.length === 0 ? (
              <Card className="p-12 text-center">
                <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Subjects Assigned</h3>
                <p className="text-gray-500 dark:text-gray-400">Contact admin for subject assignments.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className="w-full p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to view classes</p>
                      </div>
                    </div>
                    <HiChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Select Class ── */}
        {step === 'class' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Select a Class for <span className="text-blue-600">{selectedSubject?.name}</span>:
            </h2>
            {loadingClasses ? (
              <Loading />
            ) : classes.length === 0 ? (
              <Card className="p-12 text-center">
                <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Classes Found</h3>
                <p className="text-gray-500 dark:text-gray-400">You are not assigned to any class for this subject.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {classes.map((classItem) => (
                  <button
                    key={classItem.id}
                    onClick={() => handleClassSelect(classItem)}
                    className="w-full p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <HiAcademicCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {classItem.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to view chapters</p>
                      </div>
                    </div>
                    <HiChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Select Chapter ── */}
        {step === 'chapter' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Select a Chapter — <span className="text-blue-600">{selectedSubject?.name}</span> / <span className="text-green-600">{selectedClass?.name}</span>:
            </h2>
            {loadingChapters ? (
              <Loading />
            ) : chapters.length === 0 ? (
              <Card className="p-12 text-center">
                <HiDocumentText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Chapters Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Ask admin to add chapters for this subject in this class.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(chapter)}
                    className="w-full p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {chapter.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {chapter.tests_count || 0} test{chapter.tests_count !== 1 ? 's' : ''} created
                          </p>
                          {chapter.is_completed && (
                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <HiCheckCircle className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full flex items-center gap-1">
                        <HiPlus className="w-3 h-3" /> Create Test
                      </span>
                      <HiChevronRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TeacherTestSelection;



