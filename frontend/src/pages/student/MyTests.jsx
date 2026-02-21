import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiBookOpen,
  HiChevronRight,
  HiChevronDown,
  HiClipboardList,
  HiCheckCircle,
  HiPlay,
  HiEye,
  HiClock,
  HiAcademicCap,
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loading from '../../components/common/Loading';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyTests = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chaptersData, setChaptersData] = useState(null);
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await studentAPI.getSubjects();
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.subjects || []);
      setSubjects(list);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // const handleSubjectClick = async (subject) => {
  //   setSelectedSubject(subject);
  //   setStep('chapters');
  //   setChaptersData(null);
  //   setLoadingChapters(true);
  //   try {
  //     const response = await studentAPI.getChapters(subject.id);
  //     setChaptersData(response.data);
  //   } catch (error) {
  //     console.error('Failed to load chapters:', error);
  //     toast.error('Failed to load chapters');
  //   } finally {
  //     setLoadingChapters(false);
  //   }
  // };
  const handleSubjectClick = async (subject) => {
  setSelectedSubject(subject);
  setStep('chapters');
  setChaptersData(null);
  setLoadingChapters(true);
  try {
    const response = await studentAPI.getChapters(subject.id);
    console.log('CHAPTERS DATA:', JSON.stringify(response.data, null, 2)); // ← ADD THIS
    setChaptersData(response.data);
  } catch (error) {
    console.error('Failed to load chapters:', error);
    toast.error('Failed to load chapters');
  } finally {
    setLoadingChapters(false);
  }
};

  const handleStartTest = (testId) => {
    navigate(`/student/test/${testId}/take`);
  };

  const goBack = () => {
    if (step === 'chapters') {
      setStep('subjects');
      setSelectedSubject(null);
      setChaptersData(null);
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tests</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {step === 'subjects'
                ? 'Select a subject to view its chapters and tests'
                : `${selectedSubject?.name} — Select a chapter to view tests`}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span
            onClick={() => step === 'chapters' && goBack()}
            className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
              step === 'subjects'
                ? 'bg-blue-600 text-white'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:underline'
            }`}
          >
            1. Subjects
          </span>
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          <span className={`px-3 py-1 rounded-full font-medium ${
            step === 'chapters'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
          }`}>
            2. Chapters & Tests {selectedSubject ? `— ${selectedSubject.name}` : ''}
          </span>
        </div>

        {/* STEP 1: Subjects */}
        {step === 'subjects' && (
          <>
            {loadingSubjects ? <Loading /> : subjects.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow">
                <HiAcademicCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Subjects Found</h3>
                <p className="text-gray-500 dark:text-gray-400">No subjects assigned to your class yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className="w-full bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md p-5 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {subject.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>{subject.chapter_count || subject.chapters_count || 0} chapters</span>
                          <span>•</span>
                          <span>{subject.test_count || subject.total_tests || 0} tests</span>
                          {(subject.attempt_count || subject.attempted_tests || 0) > 0 && (
                            <><span>•</span>
                            <span className="text-green-600 font-medium">
                              {subject.attempt_count || subject.attempted_tests} attempted
                            </span></>
                          )}
                        </div>
                      </div>
                    </div>
                    <HiChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* STEP 2: Chapters & Tests */}
        {step === 'chapters' && (
          <>
            {loadingChapters ? <Loading /> : !chaptersData || chaptersData.chapters?.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow">
                <HiClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Chapters Yet</h3>
                <p className="text-gray-500 dark:text-gray-400">No chapters added for this subject yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chaptersData.chapters.map((chapter, index) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    onStartTest={handleStartTest}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

// ── Chapter Card ──────────────────────────────────────────────────────────────
const ChapterCard = ({ chapter, index, onStartTest }) => {
  const tests = chapter.tests || [];
  const totalTests = tests.length || chapter.test_count || 0;
  const pendingTests = tests.filter(t => !t.attempted);
  const attemptedTests = tests.filter(t => t.attempted);
  const hasPending = pendingTests.length > 0;

  // ✅ THE FIX: auto-expand if chapter has any pending (unattempted) tests
  const [expanded, setExpanded] = useState(hasPending);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border-2 transition-all ${
      hasPending
        ? 'border-orange-400 dark:border-orange-500'  // orange border = has new tests
        : 'border-gray-200 dark:border-gray-700'
    }`}>

      {/* Chapter Header */}
      <button
        onClick={() => totalTests > 0 && setExpanded(!expanded)}
        className={`w-full p-5 flex items-center justify-between transition-colors ${
          totalTests > 0 ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Number badge — orange if pending, purple if all done */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            hasPending ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
          }`}>
            <span className={`font-bold text-sm ${
              hasPending ? 'text-orange-600 dark:text-orange-400' : 'text-purple-600 dark:text-purple-400'
            }`}>
              {(index + 1).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{chapter.name}</h3>

              {/* ✅ "N New!" badge — only shown when there are pending tests */}
              {hasPending && (
                <span className="px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full animate-pulse">
                  {pendingTests.length} New!
                </span>
              )}

              {/* "All Done" badge when all attempted */}
              {totalTests > 0 && !hasPending && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <HiCheckCircle className="w-3 h-3" /> All Done
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span>{totalTests} test{totalTests !== 1 ? 's' : ''}</span>
              {attemptedTests.length > 0 && (
                <><span>•</span>
                <span className="text-green-600 dark:text-green-400">{attemptedTests.length} done</span></>
              )}
              {pendingTests.length > 0 && (
                <><span>•</span>
                <span className="text-orange-500 dark:text-orange-400 font-medium">{pendingTests.length} pending</span></>
              )}
              {totalTests === 0 && <span className="italic">No tests yet</span>}
            </div>
          </div>
        </div>

        {totalTests > 0 && (
          expanded
            ? <HiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            : <HiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Tests List */}
      {expanded && totalTests > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className={`p-4 rounded-lg border-2 flex items-center justify-between gap-4 ${
                test.attempted
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                  : 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{test.name}</h4>
                  {/* New label on unattempted tests */}
                  {!test.attempted && (
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <HiClock className="w-3.5 h-3.5" />{test.duration_minutes} min
                  </span>
                  <span>•</span>
                  <span>{test.marks} marks</span>
                  <span>•</span>
                  <span className="uppercase text-xs font-medium text-blue-600 dark:text-blue-400">{test.type}</span>
                  {test.attempted && test.percentage !== null && (
                    <><span>•</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Score: {test.percentage}%</span></>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {test.attempted ? (
                  <>
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                      <HiCheckCircle className="w-4 h-4" /> Done
                    </span>
                    <Link
                      to={`/student/chapter/${chapter.id}/tests`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <HiEye className="w-4 h-4" /> View
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => onStartTest(test.id)}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <HiPlay className="w-4 h-4" /> Start Test
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTests;















