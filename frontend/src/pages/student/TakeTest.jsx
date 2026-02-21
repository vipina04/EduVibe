import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiCheckCircle, HiClock } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittingRef = useRef(submitting);
  submittingRef.current = submitting;

  useEffect(() => {
    loadTest();
  }, [testId]);

  useEffect(() => {
    if (!test || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!submittingRef.current) {
            toast.error('Time is up! Submitting your test...');
            submitTest(answersRef.current, true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.startTest(testId);
      const data = response.data;

      if (!data.test) throw new Error('Invalid test data from server');
      if (!data.questions || data.questions.length === 0) {
        toast.error('This test has no questions yet.');
        navigate(-1);
        return;
      }

      setTest(data.test);
      setQuestions(data.questions);
      console.log('FIRST QUESTION:', JSON.stringify(data.questions[0], null, 2));
      setTimeLeft((data.test.duration_minutes || 30) * 60);
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to load test';
      toast.error(msg);
      setTimeout(() => navigate(-1), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitTest = async (currentAnswers, autoSubmit = false) => {
    if (submittingRef.current) return;

    if (!autoSubmit) {
      const confirmed = window.confirm(
        `You have answered ${Object.keys(currentAnswers).length} out of ${questions.length} questions. Submit now?`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        selected_option: currentAnswers[q.id] || null,
        answer_text: currentAnswers[q.id] || ''
      }));

      const response = await studentAPI.submitTest(testId, formattedAnswers);
      const data = response.data;

      toast.success(`Test submitted! Score: ${data.score}/${data.max_marks} (${data.percentage}%)`);
      navigate(`/student/test-attempt/${data.attempt_id}/result`);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to submit test';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => submitTest(answers, false);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeWarning = timeLeft <= 120;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-64 gap-4">
          <Loading />
          <p className="text-gray-500 dark:text-gray-400">Loading test...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!test || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  // ✅ Normalize type to lowercase for safe comparison
  const testType = test.type?.toLowerCase();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4">

        {/* Header */}
        <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold mb-1">{test.name}</h1>
              <p className="text-indigo-200 text-sm">
                {test.chapter} • {test.subject} • {test.marks} marks •{' '}
                <span className="uppercase font-semibold">{testType}</span>
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg flex-shrink-0 ${
              isTimeWarning ? 'bg-red-500 animate-pulse' : 'bg-white/20'
            }`}>
              <HiClock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-indigo-200 mb-1">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <div className="p-6">
            {/* Question text */}
            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-5">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                Q{currentQuestionIndex + 1}.
              </span>
              {currentQuestion.question_text}
            </p>

            {/* Question image */}
            {currentQuestion.question_image && (
              <img
                src={currentQuestion.question_image}
                alt="Question"
                className="max-w-full h-auto rounded-lg border border-gray-200 mb-5"
              />
            )}

            {/* ✅ MCQ Options — only when type is mcq */}
            {testType === 'mcq' && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((optNum) => {
                  const optKey = `option${optNum}`;
                  const optText = currentQuestion[optKey];
                  if (!optText) return null;
                  const isSelected = answers[currentQuestion.id] === optNum;

                  return (
                    <label
                      key={optNum}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        value={optNum}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(currentQuestion.id, optNum)}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div className="flex items-start gap-2">
                        <span className={`font-bold text-sm mt-0.5 flex-shrink-0 ${
                          isSelected ? 'text-indigo-600' : 'text-gray-400'
                        }`}>
                          {String.fromCharCode(64 + optNum)}.
                        </span>
                        <span className={`text-gray-700 dark:text-gray-300 ${isSelected ? 'font-medium' : ''}`}>
                          {optText}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* ✅ Descriptive textarea — only when type is descriptive */}
            {testType === 'descriptive' && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Write your answer below:
                </p>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-600 focus:outline-none dark:bg-gray-700 dark:text-white resize-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {(answers[currentQuestion.id] || '').length} characters
                </p>
              </div>
            )}

            {/* ✅ Safety fallback — if type is unknown show message */}
            {testType !== 'mcq' && testType !== 'descriptive' && (
              <p className="text-red-500 text-sm">
                Unknown test type: "{test.type}". Please contact your teacher.
              </p>
            )}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="secondary"
          >
            <HiArrowLeft className="w-5 h-5 mr-1" /> Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              <HiCheckCircle className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <Button onClick={handleNext}>
              Next <HiArrowRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>

        {/* Answer Status Grid */}
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Answer Status</h3>
              <span className="text-sm text-gray-500">{answeredCount}/{questions.length} answered</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                    currentQuestionIndex === index
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                      : answers[q.id]
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 border-2 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-green-100 border-2 border-green-300 inline-block" />
                Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300 inline-block" />
                Not Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-indigo-600 inline-block" />
                Current
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleSubmitClick}
                disabled={submitting}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : `Submit Test (${answeredCount}/${questions.length} answered)`}
              </button>
            </div>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default TakeTest;





























// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { HiArrowLeft, HiArrowRight, HiCheckCircle, HiClock } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import { studentAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const TakeTest = () => {
//   const { testId } = useParams();
//   const navigate = useNavigate();

//   const [test, setTest] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(0);

//   // Use ref to avoid stale closure in timer → auto-submit
//   const answersRef = useRef(answers);
//   answersRef.current = answers;
//   const submittingRef = useRef(submitting);
//   submittingRef.current = submitting;

//   // ── Load test + questions on mount ──────────────────────
//   useEffect(() => {
//     loadTest();
//   }, [testId]);

//   // ── Timer countdown ──────────────────────────────────────
//   useEffect(() => {
//     if (!test || timeLeft <= 0) return;

//     const timer = setInterval(() => {
//       setTimeLeft(prev => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           // Auto-submit when time runs out
//           if (!submittingRef.current) {
//             toast.error('Time is up! Submitting your test...');
//             submitTest(answersRef.current, true);
//           }
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [test]); // Only start timer once test is loaded

//   const loadTest = async () => {
//     try {
//       setLoading(true);
//       // GET /students/tests/:testId/start/ → { test, questions, total_questions }
//       const response = await studentAPI.startTest(testId);
//       const data = response.data;

//       if (!data.test) throw new Error('Invalid test data from server');
//       if (!data.questions || data.questions.length === 0) {
//         toast.error('This test has no questions yet.');
//         navigate(-1);
//         return;
//       }

//       setTest(data.test);
//       setQuestions(data.questions);
//       setTimeLeft((data.test.duration_minutes || 30) * 60);
//     } catch (error) {
//       const msg = error.response?.data?.error || error.message || 'Failed to load test';
//       toast.error(msg);
//       setTimeout(() => navigate(-1), 1500);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Answer selection ─────────────────────────────────────
//   const handleAnswerChange = (questionId, value) => {
//     setAnswers(prev => ({ ...prev, [questionId]: value }));
//   };

//   // ── Submit ───────────────────────────────────────────────
//   // POST /students/test-attempts/:testId/submit/ → { attempt_id, score, max_marks, percentage }
//   const submitTest = async (currentAnswers, autoSubmit = false) => {
//     if (submittingRef.current) return;

//     if (!autoSubmit) {
//       const confirmed = window.confirm(
//         `You have answered ${Object.keys(currentAnswers).length} out of ${questions.length} questions. Submit now?`
//       );
//       if (!confirmed) return;
//     }

//     setSubmitting(true);
//     try {
//       // Build answers array
//       const formattedAnswers = questions.map(q => ({
//         question_id: q.id,
//         selected_option: currentAnswers[q.id] || null,
//         answer_text: currentAnswers[q.id] || ''
//       }));

//       // POST to /students/test-attempts/:testId/submit/
//       const response = await studentAPI.submitTest(testId, formattedAnswers);
//       const data = response.data;

//       toast.success(`Test submitted! Score: ${data.score}/${data.max_marks} (${data.percentage}%)`);

//       // Navigate to result using attempt_id returned from submit
//       navigate(`/student/test-attempt/${data.attempt_id}/result`);
//     } catch (error) {
//       const msg = error.response?.data?.error || 'Failed to submit test';
//       toast.error(msg);
//       setSubmitting(false);
//     }
//   };

//   const handleSubmitClick = () => submitTest(answers, false);

//   // ── Navigation ───────────────────────────────────────────
//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(prev => prev + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(prev => prev - 1);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const isTimeWarning = timeLeft <= 120; // last 2 minutes → red

//   // ── Loading state ────────────────────────────────────────
//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex flex-col items-center justify-center min-h-64 gap-4">
//           <Loading />
//           <p className="text-gray-500 dark:text-gray-400">Loading test...</p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   if (!test || questions.length === 0) return null;

//   const currentQuestion = questions[currentQuestionIndex];
//   const answeredCount = Object.keys(answers).length;

//   return (
//     <DashboardLayout>
//       <div className="max-w-4xl mx-auto p-4">

//         {/* ── Header Bar ── */}
//         <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <h1 className="text-xl font-bold mb-1">{test.name}</h1>
//               <p className="text-indigo-200 text-sm">
//                 {test.chapter} • {test.subject} • {test.marks} marks
//               </p>
//             </div>
//             {/* Timer */}
//             <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg flex-shrink-0 ${
//               isTimeWarning ? 'bg-red-500 animate-pulse' : 'bg-white/20'
//             }`}>
//               <HiClock className="w-5 h-5" />
//               {formatTime(timeLeft)}
//             </div>
//           </div>

//           {/* Progress bar */}
//           <div className="mt-4">
//             <div className="flex justify-between text-xs text-indigo-200 mb-1">
//               <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
//               <span>{answeredCount} answered</span>
//             </div>
//             <div className="w-full bg-white/20 rounded-full h-2">
//               <div
//                 className="bg-white rounded-full h-2 transition-all"
//                 style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* ── Question Card ── */}
//         <Card className="mb-6">
//           <div className="p-6">
//             {/* Question text */}
//             <p className="text-lg font-semibold text-gray-800 dark:text-white mb-5">
//               <span className="text-indigo-600 dark:text-indigo-400 mr-2">
//                 Q{currentQuestionIndex + 1}.
//               </span>
//               {currentQuestion.question_text}
//             </p>

//             {/* Question image */}
//             {currentQuestion.question_image && (
//               <img
//                 src={currentQuestion.question_image}
//                 alt="Question"
//                 className="max-w-full h-auto rounded-lg border border-gray-200 mb-5"
//               />
//             )}

//             {/* ── MCQ Options ── */}
//             {/* {test.type === 'mcq' && ( */}
//               {test.type?.toLowerCase() === 'descriptive' && (
//               <div className="space-y-3">
//                 {[1, 2, 3, 4].map((optNum) => {
//                   const optKey = `option${optNum}`;
//                   const optText = currentQuestion[optKey];
//                   if (!optText) return null;
//                   const isSelected = answers[currentQuestion.id] === optNum;

//                   return (
//                     <label
//                       key={optNum}
//                       className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                         isSelected
//                           ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
//                           : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700'
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         name={`q-${currentQuestion.id}`}
//                         value={optNum}
//                         checked={isSelected}
//                         onChange={() => handleAnswerChange(currentQuestion.id, optNum)}
//                         className="mt-0.5 accent-indigo-600"
//                       />
//                       <div className="flex items-start gap-2">
//                         <span className={`font-bold text-sm mt-0.5 flex-shrink-0 ${
//                           isSelected ? 'text-indigo-600' : 'text-gray-400'
//                         }`}>
//                           {String.fromCharCode(64 + optNum)}.
//                         </span>
//                         <span className={`text-gray-700 dark:text-gray-300 ${isSelected ? 'font-medium' : ''}`}>
//                           {optText}
//                         </span>
//                       </div>
//                     </label>
//                   );
//                 })}
//               </div>
//             )}

//             {/* ── Descriptive Answer ── */}
//             {/* {test.type === 'descriptive' && ( */}
//             {test.type?.toLowerCase() === 'descriptive' && (
          
//               <textarea
//                 value={answers[currentQuestion.id] || ''}
//                 onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
//                 placeholder="Type your answer here..."
//                 rows={8}
//                 className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-600 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
//               />
//             )}
//           </div>
//         </Card>

//         {/* ── Navigation Buttons ── */}
//         <div className="flex justify-between items-center mb-6">
//           <Button
//             onClick={handlePrevious}
//             disabled={currentQuestionIndex === 0}
//             variant="secondary"
//           >
//             <HiArrowLeft className="w-5 h-5 mr-1" /> Previous
//           </Button>

//           {currentQuestionIndex === questions.length - 1 ? (
//             <button
//               onClick={handleSubmitClick}
//               disabled={submitting}
//               className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
//             >
//               <HiCheckCircle className="w-5 h-5" />
//               {submitting ? 'Submitting...' : 'Submit Test'}
//             </button>
//           ) : (
//             <Button onClick={handleNext}>
//               Next <HiArrowRight className="w-5 h-5 ml-1" />
//             </Button>
//           )}
//         </div>

//         {/* ── Answer Status Grid ── */}
//         <Card>
//           <div className="p-4">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-semibold text-gray-700 dark:text-gray-300">Answer Status</h3>
//               <span className="text-sm text-gray-500">{answeredCount}/{questions.length} answered</span>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {questions.map((q, index) => (
//                 <button
//                   key={q.id}
//                   onClick={() => setCurrentQuestionIndex(index)}
//                   className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
//                     currentQuestionIndex === index
//                       ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
//                       : answers[q.id]
//                       ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300'
//                       : 'bg-gray-100 dark:bg-gray-700 text-gray-500 border-2 border-gray-300 dark:border-gray-600'
//                   }`}
//                 >
//                   {index + 1}
//                 </button>
//               ))}
//             </div>
//             <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
//               <span className="flex items-center gap-1">
//                 <span className="w-4 h-4 rounded bg-green-100 border-2 border-green-300 inline-block" />
//                 Answered
//               </span>
//               <span className="flex items-center gap-1">
//                 <span className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300 inline-block" />
//                 Not Answered
//               </span>
//               <span className="flex items-center gap-1">
//                 <span className="w-4 h-4 rounded bg-indigo-600 inline-block" />
//                 Current
//               </span>
//             </div>

//             {/* Submit button at bottom too */}
//             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
//               <button
//                 onClick={handleSubmitClick}
//                 disabled={submitting}
//                 className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
//               >
//                 {submitting ? 'Submitting...' : `Submit Test (${answeredCount}/${questions.length} answered)`}
//               </button>
//             </div>
//           </div>
//         </Card>

//       </div>
//     </DashboardLayout>
//   );
// };

// export default TakeTest;







































// // import { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { HiArrowLeft, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Loading from '../../components/common/Loading';
// // import Button from '../../components/common/Button';
// // import { studentAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const TakeTest = () => {
// //   const { testId } = useParams();
// //   const navigate = useNavigate();
  
// //   const [test, setTest] = useState(null);
// //   const [attempt, setAttempt] = useState(null);
// //   const [questions, setQuestions] = useState([]);
// //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //   const [answers, setAnswers] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [timeLeft, setTimeLeft] = useState(0);

// //   useEffect(() => {
// //     startTest();
// //   }, [testId]);

// //   useEffect(() => {
// //     if (timeLeft > 0 && !submitting) {
// //       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
// //       return () => clearTimeout(timer);
// //     } else if (timeLeft === 0 && test && !submitting) {
// //       handleSubmit();
// //     }
// //   }, [timeLeft, submitting]);

// // //   const startTest = async () => {
// // //     try {
// // //       const response = await studentAPI.startTest(testId);
// // //       setTest(response.data.test);
// // //       setAttempt(response.data.attempt);
// // //       setQuestions(response.data.questions || []);
// // //       // setTimeLeft((response.data.test.duration_minutes || 30) * 60);
// // //  const durationMinutes = response.data.test.duration_minutes || 30;
// // //  const durationSeconds = durationMinutes * 60;
// // //       console.log(`⏱️ Test Duration: ${durationMinutes} minutes`);
// // //       setTimeLeft(durationSeconds);
// // //     } catch (error) {
// // //       console.error('Failed to start test:', error);
// // //       toast.error(error.response?.data?.error || 'Failed to start test');
// // //       navigate('/student/my-tests');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };
// // const startTest = async () => {
// //   try {
// //     console.log('🚀 Starting test with ID:', testId);
// //     console.log('📡 Calling API:', `/students/tests/${testId}/start/`);
    
// //     const response = await studentAPI.startTest(testId);
    
// //     console.log('✅ Full Response:', response);
// //     console.log('📦 Response Data:', response.data);
// //     console.log('🧪 Test Object:', response.data.test);
// //     console.log('📝 Attempt Object:', response.data.attempt);
// //     console.log('❓ Questions:', response.data.questions);
    
// //     // Check if we have all required data
// //     if (!response.data.test) {
// //       throw new Error('No test data in response');
// //     }
// //     if (!response.data.attempt) {
// //       throw new Error('No attempt data in response');
// //     }
// //     if (!response.data.questions) {
// //       throw new Error('No questions data in response');
// //     }
    
// //     setTest(response.data.test);
// //     setAttempt(response.data.attempt);
// //     setQuestions(response.data.questions || []);
    
// //     const durationMinutes = response.data.test.duration_minutes || 30;
// //     const durationSeconds = durationMinutes * 60;
// //     console.log(`⏱️ Test Duration: ${durationMinutes} minutes (${durationSeconds} seconds)`);
// //     setTimeLeft(durationSeconds);
    
// //     console.log('✅ Test started successfully!');
// //   } catch (error) {
// //     console.error('❌ ERROR DETAILS:');
// //     console.error('Error object:', error);
// //     console.error('Error message:', error.message);
// //     console.error('Error response:', error.response);
// //     console.error('Response status:', error.response?.status);
// //     console.error('Response data:', error.response?.data);
// //     console.error('Response headers:', error.response?.headers);
    
// //     const errorMessage = error.response?.data?.error || error.message || 'Failed to start test';
// //     toast.error(errorMessage);
    
// //     setLoading(false);
    
// //     // Wait before redirecting so user can see error
// //     setTimeout(() => {
// //       navigate(-1);
// //     }, 2500);
    
// //     return;
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// //   const handleAnswerChange = (questionId, answer) => {
// //     setAnswers({
// //       ...answers,
// //       [questionId]: answer
// //     });
// //   };

// //   const handleNext = () => {
// //     if (currentQuestionIndex < questions.length - 1) {
// //       setCurrentQuestionIndex(currentQuestionIndex + 1);
// //     }
// //   };

// //   const handlePrevious = () => {
// //     if (currentQuestionIndex > 0) {
// //       setCurrentQuestionIndex(currentQuestionIndex - 1);
// //     }
// //   };

// //   const handleSubmit = async () => {
// //     if (submitting) return;
    
// //     const confirmSubmit = window.confirm(
// //       `You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Do you want to submit?`
// //     );
    
// //     if (!confirmSubmit) return;
    
// //     setSubmitting(true);
// //     try {
// //       const formattedAnswers = Object.keys(answers).map(questionId => ({
// //         question_id: parseInt(questionId),
// //         selected_option: answers[questionId]
// //       }));

// //       const response = await studentAPI.submitTest(attempt.id, formattedAnswers);
// //       toast.success('Test submitted successfully!');
      
// //       // Navigate to result page
// //       navigate(`/student/test-attempt/${attempt.id}/result`);
// //     } catch (error) {
// //       console.error('Failed to submit test:', error);
// //       toast.error(error.response?.data?.error || 'Failed to submit test');
// //       setSubmitting(false);
// //     }
// //   };

// //   const formatTime = (seconds) => {
// //     const mins = Math.floor(seconds / 60);
// //     const secs = seconds % 60;
// //     return `${mins}:${secs.toString().padStart(2, '0')}`;
// //   };

// //   if (loading) {
// //     return (
// //       <DashboardLayout>
// //         <Loading />
// //       </DashboardLayout>
// //     );
// //   }

// //   const currentQuestion = questions[currentQuestionIndex];

// //   return (
// //     <DashboardLayout>
// //       <div className="max-w-4xl mx-auto">
// //         {/* Header */}
// //         <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
// //           <h1 className="text-2xl font-bold mb-2">{test?.chapter?.name} - {test?.type === 'mcq' ? 'MCQ' : 'Descriptive'} Test</h1>
// //           <div className="flex items-center justify-between">
// //             <p className="text-indigo-100">Total Marks: {test?.marks}</p>
// //             <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
// //               <HiCheckCircle className="w-5 h-5" />
// //               <span className="font-semibold">{formatTime(timeLeft)}</span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Question Counter */}
// //         <div className="mb-4 text-center">
// //           <span className="text-gray-600">
// //             Question {currentQuestionIndex + 1} of {questions.length}
// //           </span>
// //         </div>

// //         {/* Question Card */}
// //         <Card className="mb-6">
// //           <div className="p-6">
// //             {/* Question Text/Image */}
// //             <div className="mb-6">
// //               <p className="text-lg font-semibold text-gray-800 mb-4">
// //                 Q{currentQuestionIndex + 1}. {currentQuestion?.question_text}
// //               </p>
              
// //               {currentQuestion?.question_image && (
// //                 <img
// //                   src={currentQuestion.question_image}
// //                   alt="Question"
// //                   className="max-w-full h-auto rounded-lg border border-gray-200 mb-4"
// //                 />
// //               )}
// //             </div>

// //             {/* Options (MCQ) */}
// //             {test?.type === 'mcq' && (
// //               <div className="space-y-3">
// //                 {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
// //                   currentQuestion?.[optionKey] && (
// //                     <label
// //                       key={optionKey}
// //                       className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
// //                         answers[currentQuestion.id] === index + 1
// //                           ? 'border-indigo-600 bg-indigo-50'
// //                           : 'border-gray-200 hover:border-indigo-300'
// //                       }`}
// //                     >
// //                       <input
// //                         type="radio"
// //                         name={`question-${currentQuestion.id}`}
// //                         value={index + 1}
// //                         checked={answers[currentQuestion.id] === index + 1}
// //                         onChange={() => handleAnswerChange(currentQuestion.id, index + 1)}
// //                         className="mt-1 mr-3"
// //                       />
// //                       <span className="text-gray-700">{currentQuestion[optionKey]}</span>
// //                     </label>
// //                   )
// //                 ))}
// //               </div>
// //             )}

// //             {/* Descriptive Answer */}
// //             {test?.type === 'descriptive' && (
// //               <textarea
// //                 value={answers[currentQuestion?.id] || ''}
// //                 onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
// //                 placeholder="Type your answer here..."
// //                 rows="8"
// //                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
// //               />
// //             )}
// //           </div>
// //         </Card>

// //         {/* Navigation Buttons */}
// //         <div className="flex justify-between items-center">
// //           <Button
// //             onClick={handlePrevious}
// //             disabled={currentQuestionIndex === 0}
// //             variant="secondary"
// //             className="flex items-center space-x-2"
// //           >
// //             <HiArrowLeft className="w-5 h-5" />
// //             <span>Previous</span>
// //           </Button>

// //           {currentQuestionIndex === questions.length - 1 ? (
// //             <Button
// //               onClick={handleSubmit}
// //               disabled={submitting}
// //               className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
// //             >
// //               <HiCheckCircle className="w-5 h-5" />
// //               <span>{submitting ? 'Submitting...' : 'Submit Test'}</span>
// //             </Button>
// //           ) : (
// //             <Button
// //               onClick={handleNext}
// //               className="flex items-center space-x-2"
// //             >
// //               <span>Next</span>
// //               <HiArrowRight className="w-5 h-5" />
// //             </Button>
// //           )}
// //         </div>

// //         {/* Answer Status Grid */}
// //         <Card className="mt-6">
// //           <div className="p-4">
// //             <h3 className="font-semibold text-gray-700 mb-3">Answer Status</h3>
// //             <div className="grid grid-cols-10 gap-2">
// //               {questions.map((q, index) => (
// //                 <button
// //                   key={q.id}
// //                   onClick={() => setCurrentQuestionIndex(index)}
// //                   className={`w-10 h-10 rounded-lg font-semibold transition-all ${
// //                     currentQuestionIndex === index
// //                       ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
// //                       : answers[q.id]
// //                       ? 'bg-green-100 text-green-700 border-2 border-green-300'
// //                       : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
// //                   }`}
// //                 >
// //                   {index + 1}
// //                 </button>
// //               ))}
// //             </div>
// //             <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
// //               <div className="flex items-center space-x-2">
// //                 <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-300"></div>
// //                 <span className="text-gray-600">Answered</span>
// //               </div>
// //               <div className="flex items-center space-x-2">
// //                 <div className="w-6 h-6 rounded bg-gray-100 border-2 border-gray-300"></div>
// //                 <span className="text-gray-600">Not Answered</span>
// //               </div>
// //             </div>
// //           </div>
// //         </Card>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default TakeTest;

































































// // // import { useState, useEffect } from 'react';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { HiArrowLeft, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // import Card from '../../components/common/Card';
// // // import Loading from '../../components/common/Loading';
// // // import Button from '../../components/common/Button';
// // // import { studentAPI } from '../../services/api';
// // // import toast from 'react-hot-toast';

// // // const TakeTest = () => {
// // //   const { testId } = useParams();
// // //   const navigate = useNavigate();
  
// // //   const [test, setTest] = useState(null);
// // //   const [attempt, setAttempt] = useState(null);
// // //   const [questions, setQuestions] = useState([]);
// // //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// // //   const [answers, setAnswers] = useState({});
// // //   const [loading, setLoading] = useState(true);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [timeLeft, setTimeLeft] = useState(0);

// // //   useEffect(() => {
// // //     startTest();
// // //   }, [testId]);

// // //   useEffect(() => {
// // //     if (timeLeft > 0 && !submitting) {
// // //       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
// // //       return () => clearTimeout(timer);
// // //     } else if (timeLeft === 0 && test && !submitting) {
// // //       handleSubmit();
// // //     }
// // //   }, [timeLeft, submitting]);

// // // //   const startTest = async () => {
// // // //     try {
// // // //       const response = await studentAPI.startTest(testId);
// // // //       setTest(response.data.test);
// // // //       setAttempt(response.data.attempt);
// // // //       setQuestions(response.data.questions || []);
// // // //       // setTimeLeft((response.data.test.duration_minutes || 30) * 60);
// // // //  const durationMinutes = response.data.test.duration_minutes || 30;
// // // //  const durationSeconds = durationMinutes * 60;
// // // //       console.log(`⏱️ Test Duration: ${durationMinutes} minutes`);
// // // //       setTimeLeft(durationSeconds);
// // // //     } catch (error) {
// // // //       console.error('Failed to start test:', error);
// // // //       toast.error(error.response?.data?.error || 'Failed to start test');
// // // //       navigate('/student/my-tests');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };
// // // const startTest = async () => {
// // //   try {
// // //     console.log('🚀 Starting test with ID:', testId);
// // //     console.log('📡 Calling API:', `/students/tests/${testId}/start/`);
    
// // //     const response = await studentAPI.startTest(testId);
    
// // //     console.log('✅ Full Response:', response);
// // //     console.log('📦 Response Data:', response.data);
// // //     console.log('🧪 Test Object:', response.data.test);
// // //     console.log('📝 Attempt Object:', response.data.attempt);
// // //     console.log('❓ Questions:', response.data.questions);
    
// // //     // Check if we have all required data
// // //     if (!response.data.test) {
// // //       throw new Error('No test data in response');
// // //     }
// // //     if (!response.data.attempt) {
// // //       throw new Error('No attempt data in response');
// // //     }
// // //     if (!response.data.questions) {
// // //       throw new Error('No questions data in response');
// // //     }
    
// // //     setTest(response.data.test);
// // //     setAttempt(response.data.attempt);
// // //     setQuestions(response.data.questions || []);
    
// // //     const durationMinutes = response.data.test.duration_minutes || 30;
// // //     const durationSeconds = durationMinutes * 60;
// // //     console.log(`⏱️ Test Duration: ${durationMinutes} minutes (${durationSeconds} seconds)`);
// // //     setTimeLeft(durationSeconds);
    
// // //     console.log('✅ Test started successfully!');
// // //   } catch (error) {
// // //     console.error('❌ ERROR DETAILS:');
// // //     console.error('Error object:', error);
// // //     console.error('Error message:', error.message);
// // //     console.error('Error response:', error.response);
// // //     console.error('Response status:', error.response?.status);
// // //     console.error('Response data:', error.response?.data);
// // //     console.error('Response headers:', error.response?.headers);
    
// // //     const errorMessage = error.response?.data?.error || error.message || 'Failed to start test';
// // //     toast.error(errorMessage);
    
// // //     setLoading(false);
    
// // //     // Wait before redirecting so user can see error
// // //     setTimeout(() => {
// // //       navigate(-1);
// // //     }, 2500);
    
// // //     return;
// // //   } finally {
// // //     setLoading(false);
// // //   }
// // // };

// // //   const handleAnswerChange = (questionId, answer) => {
// // //     setAnswers({
// // //       ...answers,
// // //       [questionId]: answer
// // //     });
// // //   };

// // //   const handleNext = () => {
// // //     if (currentQuestionIndex < questions.length - 1) {
// // //       setCurrentQuestionIndex(currentQuestionIndex + 1);
// // //     }
// // //   };

// // //   const handlePrevious = () => {
// // //     if (currentQuestionIndex > 0) {
// // //       setCurrentQuestionIndex(currentQuestionIndex - 1);
// // //     }
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (submitting) return;
    
// // //     const confirmSubmit = window.confirm(
// // //       `You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Do you want to submit?`
// // //     );
    
// // //     if (!confirmSubmit) return;
    
// // //     setSubmitting(true);
// // //     try {
// // //       const formattedAnswers = Object.keys(answers).map(questionId => ({
// // //         question_id: parseInt(questionId),
// // //         selected_option: answers[questionId]
// // //       }));

// // //       const response = await studentAPI.submitTest(attempt.id, formattedAnswers);
// // //       toast.success('Test submitted successfully!');
      
// // //       // Navigate to result page
// // //       navigate(`/student/test-attempt/${attempt.id}/result`);
// // //     } catch (error) {
// // //       console.error('Failed to submit test:', error);
// // //       toast.error(error.response?.data?.error || 'Failed to submit test');
// // //       setSubmitting(false);
// // //     }
// // //   };

// // //   const formatTime = (seconds) => {
// // //     const mins = Math.floor(seconds / 60);
// // //     const secs = seconds % 60;
// // //     return `${mins}:${secs.toString().padStart(2, '0')}`;
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <DashboardLayout>
// // //         <Loading />
// // //       </DashboardLayout>
// // //     );
// // //   }

// // //   const currentQuestion = questions[currentQuestionIndex];

// // //   return (
// // //     <DashboardLayout>
// // //       <div className="max-w-4xl mx-auto">
// // //         {/* Header */}
// // //         <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
// // //           <h1 className="text-2xl font-bold mb-2">{test?.chapter?.name} - {test?.type === 'mcq' ? 'MCQ' : 'Descriptive'} Test</h1>
// // //           <div className="flex items-center justify-between">
// // //             <p className="text-indigo-100">Total Marks: {test?.marks}</p>
// // //             <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
// // //               <HiCheckCircle className="w-5 h-5" />
// // //               <span className="font-semibold">{formatTime(timeLeft)}</span>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Question Counter */}
// // //         <div className="mb-4 text-center">
// // //           <span className="text-gray-600">
// // //             Question {currentQuestionIndex + 1} of {questions.length}
// // //           </span>
// // //         </div>

// // //         {/* Question Card */}
// // //         <Card className="mb-6">
// // //           <div className="p-6">
// // //             {/* Question Text/Image */}
// // //             <div className="mb-6">
// // //               <p className="text-lg font-semibold text-gray-800 mb-4">
// // //                 Q{currentQuestionIndex + 1}. {currentQuestion?.question_text}
// // //               </p>
              
// // //               {currentQuestion?.question_image && (
// // //                 <img
// // //                   src={currentQuestion.question_image}
// // //                   alt="Question"
// // //                   className="max-w-full h-auto rounded-lg border border-gray-200 mb-4"
// // //                 />
// // //               )}
// // //             </div>

// // //             {/* Options (MCQ) */}
// // //             {test?.type === 'mcq' && (
// // //               <div className="space-y-3">
// // //                 {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
// // //                   currentQuestion?.[optionKey] && (
// // //                     <label
// // //                       key={optionKey}
// // //                       className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
// // //                         answers[currentQuestion.id] === index + 1
// // //                           ? 'border-indigo-600 bg-indigo-50'
// // //                           : 'border-gray-200 hover:border-indigo-300'
// // //                       }`}
// // //                     >
// // //                       <input
// // //                         type="radio"
// // //                         name={`question-${currentQuestion.id}`}
// // //                         value={index + 1}
// // //                         checked={answers[currentQuestion.id] === index + 1}
// // //                         onChange={() => handleAnswerChange(currentQuestion.id, index + 1)}
// // //                         className="mt-1 mr-3"
// // //                       />
// // //                       <span className="text-gray-700">{currentQuestion[optionKey]}</span>
// // //                     </label>
// // //                   )
// // //                 ))}
// // //               </div>
// // //             )}

// // //             {/* Descriptive Answer */}
// // //             {test?.type === 'descriptive' && (
// // //               <textarea
// // //                 value={answers[currentQuestion?.id] || ''}
// // //                 onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
// // //                 placeholder="Type your answer here..."
// // //                 rows="8"
// // //                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
// // //               />
// // //             )}
// // //           </div>
// // //         </Card>

// // //         {/* Navigation Buttons */}
// // //         <div className="flex justify-between items-center">
// // //           <Button
// // //             onClick={handlePrevious}
// // //             disabled={currentQuestionIndex === 0}
// // //             variant="secondary"
// // //             className="flex items-center space-x-2"
// // //           >
// // //             <HiArrowLeft className="w-5 h-5" />
// // //             <span>Previous</span>
// // //           </Button>

// // //           {currentQuestionIndex === questions.length - 1 ? (
// // //             <Button
// // //               onClick={handleSubmit}
// // //               disabled={submitting}
// // //               className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
// // //             >
// // //               <HiCheckCircle className="w-5 h-5" />
// // //               <span>{submitting ? 'Submitting...' : 'Submit Test'}</span>
// // //             </Button>
// // //           ) : (
// // //             <Button
// // //               onClick={handleNext}
// // //               className="flex items-center space-x-2"
// // //             >
// // //               <span>Next</span>
// // //               <HiArrowRight className="w-5 h-5" />
// // //             </Button>
// // //           )}
// // //         </div>

// // //         {/* Answer Status Grid */}
// // //         <Card className="mt-6">
// // //           <div className="p-4">
// // //             <h3 className="font-semibold text-gray-700 mb-3">Answer Status</h3>
// // //             <div className="grid grid-cols-10 gap-2">
// // //               {questions.map((q, index) => (
// // //                 <button
// // //                   key={q.id}
// // //                   onClick={() => setCurrentQuestionIndex(index)}
// // //                   className={`w-10 h-10 rounded-lg font-semibold transition-all ${
// // //                     currentQuestionIndex === index
// // //                       ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
// // //                       : answers[q.id]
// // //                       ? 'bg-green-100 text-green-700 border-2 border-green-300'
// // //                       : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
// // //                   }`}
// // //                 >
// // //                   {index + 1}
// // //                 </button>
// // //               ))}
// // //             </div>
// // //             <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
// // //               <div className="flex items-center space-x-2">
// // //                 <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-300"></div>
// // //                 <span className="text-gray-600">Answered</span>
// // //               </div>
// // //               <div className="flex items-center space-x-2">
// // //                 <div className="w-6 h-6 rounded bg-gray-100 border-2 border-gray-300"></div>
// // //                 <span className="text-gray-600">Not Answered</span>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </Card>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // };

// // // export default TakeTest;




























// // // // import { useState, useEffect } from 'react';
// // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // import { HiClock, HiCheckCircle } from 'react-icons/hi';
// // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // import Card from '../../components/common/Card';
// // // // import Loading from '../../components/common/Loading';
// // // // import Button from '../../components/common/Button';
// // // // import { studentAPI } from '../../services/api';
// // // // import toast from 'react-hot-toast';

// // // // const TakeTest = () => {
// // // //   const { testId } = useParams();
// // // //   const navigate = useNavigate();
// // // //   const [test, setTest] = useState(null);
// // // //   const [attempt, setAttempt] = useState(null);
// // // //   const [questions, setQuestions] = useState([]);
// // // //   const [answers, setAnswers] = useState({});
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [submitting, setSubmitting] = useState(false);
// // // //   const [timeLeft, setTimeLeft] = useState(0);

// // // //   useEffect(() => {
// // // //     startTest();
// // // //   }, [testId]);

// // // //   useEffect(() => {
// // // //     if (timeLeft > 0 && !submitting) {
// // // //       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
// // // //       return () => clearTimeout(timer);
// // // //     } else if (timeLeft === 0 && test) {
// // // //       handleSubmit();
// // // //     }
// // // //   }, [timeLeft, submitting]);

// // // //   const startTest = async () => {
// // // //     try {
// // // //       const response = await studentAPI.startTest(testId);
// // // //       setTest(response.data.test);
// // // //       setAttempt(response.data.attempt);
// // // //       setQuestions(response.data.questions || []);
// // // //       setTimeLeft((response.data.test.duration_minutes || 30) * 60);
// // // //     } catch (error) {
// // // //       console.error('Failed to start test:', error);
// // // //       toast.error(error.response?.data?.error || 'Failed to start test');
// // // //       navigate('/student/dashboard');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleAnswerChange = (questionId, answer) => {
// // // //     setAnswers({
// // // //       ...answers,
// // // //       [questionId]: answer
// // // //     });
// // // //   };

// // // //   const handleSubmit = async () => {
// // // //     if (submitting) return;
    
// // // //     setSubmitting(true);
// // // //     try {
// // // //       const formattedAnswers = Object.keys(answers).map(questionId => ({
// // // //         question_id: parseInt(questionId),
// // // //         selected_option: answers[questionId]
// // // //       }));

// // // //       const response = await studentAPI.submitTest(attempt.id, formattedAnswers);
// // // //       toast.success('Test submitted successfully!');
// // // //       navigate(`/student/test-attempt/${attempt.id}/result`);
// // // //     } catch (error) {
// // // //       console.error('Failed to submit test:', error);
// // // //       toast.error('Failed to submit test');
// // // //       setSubmitting(false);
// // // //     }
// // // //   };

// // // //   if (loading) return <Loading fullScreen />;

// // // //   const formatTime = (seconds) => {
// // // //     const mins = Math.floor(seconds / 60);
// // // //     const secs = seconds % 60;
// // // //     return `${mins}:${secs.toString().padStart(2, '0')}`;
// // // //   };

// // // //   const answeredCount = Object.keys(answers).length;
// // // //   const totalQuestions = questions.length;

// // // //   return (
// // // //     <DashboardLayout>
// // // //       <div className="p-6 max-w-4xl mx-auto">
// // // //         {/* Header with Timer */}
// // // //         <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6 sticky top-0 z-10">
// // // //           <div className="flex items-center justify-between p-4">
// // // //             <div>
// // // //               <h1 className="text-2xl font-bold">{test?.name || 'Test'}</h1>
// // // //               <p className="text-blue-100 mt-1">
// // // //                 {test?.type === 'mcq' ? 'Multiple Choice Questions' : 'Descriptive'} • {test?.marks} Marks
// // // //               </p>
// // // //             </div>
// // // //             <div className="text-right">
// // // //               <div className="flex items-center space-x-2 text-xl font-bold">
// // // //                 <HiClock className="w-6 h-6" />
// // // //                 <span className={timeLeft < 300 ? 'text-red-300' : ''}>
// // // //                   {formatTime(timeLeft)}
// // // //                 </span>
// // // //               </div>
// // // //               <p className="text-blue-100 text-sm mt-1">
// // // //                 {answeredCount} / {totalQuestions} answered
// // // //               </p>
// // // //             </div>
// // // //           </div>
// // // //         </Card>

// // // //         {/* Questions */}
// // // //         <div className="space-y-6 mb-6">
// // // //           {questions.map((question, index) => (
// // // //             <Card key={question.id} className="bg-white dark:bg-gray-800">
// // // //               <div className="p-6">
// // // //                 <div className="flex items-start justify-between mb-4">
// // // //                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// // // //                     Question {index + 1}
// // // //                   </h3>
// // // //                   {answers[question.id] && (
// // // //                     <HiCheckCircle className="w-6 h-6 text-green-500" />
// // // //                   )}
// // // //                 </div>

// // // //                 {/* Question Text/Image */}
// // // //                 {question.question_text && (
// // // //                   <p className="text-gray-700 dark:text-gray-300 mb-4">
// // // //                     {question.question_text}
// // // //                   </p>
// // // //                 )}
// // // //                 {question.question_image && (
// // // //                   <img
// // // //                     src={question.question_image}
// // // //                     alt="Question"
// // // //                     className="max-w-full h-auto rounded-lg mb-4"
// // // //                   />
// // // //                 )}

// // // //                 {/* MCQ Options */}
// // // //                 {test?.type === 'mcq' && (
// // // //                   <div className="space-y-3">
// // // //                     {[1, 2, 3, 4].map((optionNum) => {
// // // //                       const optionText = question[`option${optionNum}`];
// // // //                       if (!optionText) return null;

// // // //                       return (
// // // //                         <label
// // // //                           key={optionNum}
// // // //                           className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
// // // //                             answers[question.id] === optionNum
// // // //                               ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
// // // //                               : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
// // // //                           }`}
// // // //                         >
// // // //                           <input
// // // //                             type="radio"
// // // //                             name={`question-${question.id}`}
// // // //                             value={optionNum}
// // // //                             checked={answers[question.id] === optionNum}
// // // //                             onChange={() => handleAnswerChange(question.id, optionNum)}
// // // //                             className="w-5 h-5 text-blue-600"
// // // //                           />
// // // //                           <span className="ml-3 text-gray-900 dark:text-white">
// // // //                             {optionText}
// // // //                           </span>
// // // //                         </label>
// // // //                       );
// // // //                     })}
// // // //                   </div>
// // // //                 )}

// // // //                 {/* Descriptive Answer */}
// // // //                 {test?.type === 'descriptive' && (
// // // //                   <textarea
// // // //                     value={answers[question.id] || ''}
// // // //                     onChange={(e) => handleAnswerChange(question.id, e.target.value)}
// // // //                     placeholder="Write your answer here..."
// // // //                     rows={6}
// // // //                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                   />
// // // //                 )}
// // // //               </div>
// // // //             </Card>
// // // //           ))}
// // // //         </div>

// // // //         {/* Submit Button */}
// // // //         <Card className="bg-white dark:bg-gray-800 sticky bottom-0">
// // // //           <div className="p-4 flex items-center justify-between">
// // // //             <div>
// // // //               <p className="text-gray-900 dark:text-white font-semibold">
// // // //                 {answeredCount} of {totalQuestions} questions answered
// // // //               </p>
// // // //               <p className="text-sm text-gray-600 dark:text-gray-400">
// // // //                 {totalQuestions - answeredCount} remaining
// // // //               </p>
// // // //             </div>
// // // //             <Button
// // // //               variant="primary"
// // // //               size="lg"
// // // //               onClick={handleSubmit}
// // // //               disabled={submitting}
// // // //             >
// // // //               {submitting ? 'Submitting...' : 'Submit Test'}
// // // //             </Button>
// // // //           </div>
// // // //         </Card>
// // // //       </div>
// // // //     </DashboardLayout>
// // // //   );
// // // // };

// // // // export default TakeTest;























// // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // export default function TakeTest() {
// // // // //   return (
// // // // //     <DashboardLayout>
// // // // //       <div className="p-6">
// // // // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Take Test - Coming Soon</h1>
// // // // //       </div>
// // // // //     </DashboardLayout>
// // // // //   );
// // // // // }