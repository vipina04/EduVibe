// src/pages/student/TestResult.jsx
// Professional Test Result Display with Auto-Evaluation
// FIXED: Removed HiTrophy (doesn't exist in react-icons/hi)

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiCheckCircle, 
  HiXCircle, 
  HiLightBulb,
  HiClock,
  HiChartBar
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TestResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [showExplanations, setShowExplanations] = useState(true);

  useEffect(() => {
    fetchTestResult();
  }, [attemptId]);

  const fetchTestResult = async () => {
    try {
      const response = await studentAPI.getTestResult(attemptId);
      console.log('✅ Test Result Data:', response.data);
      setResultData(response.data);
    } catch (error) {
      console.error('❌ Failed to load test result:', error);
      toast.error(error.response?.data?.error || 'Failed to load test result');
      navigate('/student/my-tests');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (percentage >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
    if (percentage >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return { icon: '🏆', text: 'Outstanding Performance!' };
    if (percentage >= 80) return { icon: '⭐', text: 'Excellent Work!' };
    if (percentage >= 70) return { icon: '👍', text: 'Great Job!' };
    if (percentage >= 60) return { icon: '📈', text: 'Good Effort!' };
    if (percentage >= 50) return { icon: '💪', text: 'Keep Practicing!' };
    return { icon: '📚', text: 'Need More Practice' };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading fullScreen />
      </DashboardLayout>
    );
  }

  if (!resultData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <HiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Result Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Unable to load test results
            </p>
            <Button onClick={() => navigate('/student/my-tests')}>
              Back to Tests
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { test, score, max_marks, percentage, attempted_at, results } = resultData;
  const performance = getPerformanceMessage(percentage);
  const correctCount = results.filter(r => r.is_correct).length;
  const wrongCount = results.filter(r => !r.is_correct && r.selected_option).length;
  const skippedCount = results.filter(r => !r.selected_option).length;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/student/my-tests">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Test Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {test.subject} - {test.chapter}
              </p>
            </div>
          </div>
        </div>

        {/* Score Card - Big Display */}
        <Card className={`mb-6 ${getScoreBgColor(percentage)}`}>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-4">
              <div>
                <div className={`text-5xl font-bold ${getScoreColor(percentage)}`}>
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {score}/{max_marks}
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {performance.icon} {performance.text}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400">
              You scored {score} out of {max_marks} marks
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <HiCheckCircle className="w-6 h-6" />
                  <span className="text-2xl font-bold">{correctCount}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Correct</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <HiXCircle className="w-6 h-6" />
                  <span className="text-2xl font-bold">{wrongCount}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Wrong</p>
              </div>
              
              {skippedCount > 0 && (
                <div className="text-center">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <HiClock className="w-6 h-6" />
                    <span className="text-2xl font-bold">{skippedCount}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Skipped</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Test Info */}
        <Card className="bg-white dark:bg-gray-800 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {test.subject}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chapter</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {test.chapter}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Test Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {test.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attempted On</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(attempted_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Toggle Explanations */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detailed Analysis ({results.length} Questions)
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExplanations(!showExplanations)}
          >
            <HiLightBulb className="w-4 h-4 mr-2" />
            {showExplanations ? 'Hide' : 'Show'} Explanations
          </Button>
        </div>

        {/* Questions with Answers */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card 
              key={result.question_id}
              className={`bg-white dark:bg-gray-800 border-l-4 ${
                result.is_correct 
                  ? 'border-green-500' 
                  : result.selected_option 
                    ? 'border-red-500' 
                    : 'border-gray-400'
              }`}
            >
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold">
                        {index + 1}
                      </span>
                      {result.is_correct ? (
                        <span className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-semibold">
                          <HiCheckCircle className="w-5 h-5" />
                          <span>Correct</span>
                        </span>
                      ) : result.selected_option ? (
                        <span className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-semibold">
                          <HiXCircle className="w-5 h-5" />
                          <span>Incorrect</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 font-semibold">
                          <HiClock className="w-5 h-5" />
                          <span>Not Answered</span>
                        </span>
                      )}
                    </div>

                    {/* Question Text */}
                    <p className="text-lg text-gray-900 dark:text-white font-medium mb-3">
                      {result.question_text}
                    </p>

                    {/* Question Image */}
                    {result.question_image && (
                      <img
                        src={result.question_image}
                        alt="Question"
                        className="max-w-md h-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-4"
                      />
                    )}
                  </div>
                </div>

                {/* MCQ Options */}
                {test.type === 'MCQ' && (
                  <div className="space-y-2 mb-4">
                    {[1, 2, 3, 4].map((optionNum) => {
                      const optionText = result[`option${optionNum}`];
                      if (!optionText) return null;

                      const isCorrect = result.correct_option === optionNum;
                      const isSelected = result.selected_option === optionNum;

                      let bgColor = 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
                      let textColor = 'text-gray-700 dark:text-gray-300';
                      let borderColor = 'border';

                      if (isCorrect) {
                        bgColor = 'bg-green-50 dark:bg-green-900/20 border-green-500';
                        textColor = 'text-green-900 dark:text-green-300';
                        borderColor = 'border-2';
                      } else if (isSelected && !isCorrect) {
                        bgColor = 'bg-red-50 dark:bg-red-900/20 border-red-500';
                        textColor = 'text-red-900 dark:text-red-300';
                        borderColor = 'border-2';
                      }

                      return (
                        <div
                          key={optionNum}
                          className={`flex items-center p-4 rounded-lg ${borderColor} ${bgColor}`}
                        >
                          <div className="flex items-center flex-1 space-x-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              isCorrect ? 'bg-green-200 dark:bg-green-800' :
                              isSelected ? 'bg-red-200 dark:bg-red-800' :
                              'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              <span className="font-semibold">{String.fromCharCode(64 + optionNum)}</span>
                            </div>
                            <span className={`flex-1 ${textColor} font-medium`}>
                              {optionText}
                            </span>
                          </div>
                          
                          {isCorrect && (
                            <HiCheckCircle className="w-6 h-6 text-green-600" />
                          )}
                          {isSelected && !isCorrect && (
                            <HiXCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Descriptive Answer */}
                {test.type === 'Descriptive' && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Your Answer:
                    </p>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {result.your_answer || 'No answer provided'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {showExplanations && result.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <HiLightBulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Explanation
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/student/my-tests')}
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Tests
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/student/home')}
          >
            <HiChartBar className="w-5 h-5 mr-2" />
            View Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestResult;































// import { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { 
//   HiArrowLeft, 
//   HiCheckCircle, 
//   HiXCircle,
//   HiEye
// } from 'react-icons/hi';
// // Move HiTrophy to hi2 to fix the SyntaxError
// import { HiTrophy } from 'react-icons/hi2'; 
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import { studentAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const TestResult = () => {
//   const { attemptId } = useParams();
//   const navigate = useNavigate();
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showSolutions, setShowSolutions] = useState(false);

//   useEffect(() => {
//     fetchResult();
//   }, [attemptId]);

//   const fetchResult = async () => {
//     try {
//       const response = await studentAPI.getTestResult(attemptId);
//       setResult(response.data);
//     } catch (error) {
//       console.error('Failed to load result:', error);
//       toast.error('Failed to load test result');
//       navigate('/student/my-tests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading fullScreen />;
//   if (!result) return null;

//   const { attempt, questions_with_answers } = result;
//   const percentage = ((attempt.score / attempt.test.marks) * 100).toFixed(1);
//   const isPassed = percentage >= 40;

//   const correctCount = questions_with_answers?.filter(q => q.is_correct).length || 0;
//   const wrongCount = questions_with_answers?.filter(q => !q.is_correct && q.student_answer).length || 0;
//   const skippedCount = questions_with_answers?.filter(q => !q.student_answer).length || 0;

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center space-x-4 mb-8">
//           <Link to="/student/my-tests">
//             <Button variant="secondary" size="sm">
//               <HiArrowLeft className="w-4 h-4 mr-2" />
//               Back to Tests
//             </Button>
//           </Link>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             Test Result
//           </h1>
//         </div>

//         {/* Result Card */}
//         <Card className={`mb-8 bg-gradient-to-br ${
//           isPassed 
//             ? 'from-green-500 to-green-600' 
//             : 'from-red-500 to-red-600'
//         } text-white shadow-xl`}>
//           <div className="p-8 text-center">
//             {isPassed ? (
//               <HiTrophy className="w-20 h-20 mx-auto mb-4 opacity-90" />
//             ) : (
//               <HiXCircle className="w-20 h-20 mx-auto mb-4 opacity-90" />
//             )}
//             <h2 className="text-4xl font-bold mb-2">
//               {isPassed ? 'Congratulations!' : 'Keep Trying!'}
//             </h2>
//             <p className="text-xl opacity-90 mb-6">
//               You scored {attempt.score} out of {attempt.test.marks}
//             </p>
//             <div className="flex items-center justify-center space-x-8">
//               <div>
//                 <p className="text-5xl font-bold">{percentage}%</p>
//                 <p className="text-sm opacity-90">Your Score</p>
//               </div>
//               <div className="h-16 w-px bg-white opacity-30"></div>
//               <div>
//                 <p className={`text-2xl font-bold ${isPassed ? 'text-white' : 'text-white'}`}>
//                   {isPassed ? 'PASSED' : 'FAILED'}
//                 </p>
//                 <p className="text-sm opacity-90">Status</p>
//               </div>
//             </div>
//           </div>
//         </Card>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-6 mb-8">
//           <Card className="bg-white dark:bg-gray-800 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 dark:text-gray-400 mb-1">Correct</p>
//                 <p className="text-3xl font-bold text-green-600">{correctCount}</p>
//               </div>
//               <HiCheckCircle className="w-10 h-10 text-green-500" />
//             </div>
//           </Card>

//           <Card className="bg-white dark:bg-gray-800 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 dark:text-gray-400 mb-1">Wrong</p>
//                 <p className="text-3xl font-bold text-red-600">{wrongCount}</p>
//               </div>
//               <HiXCircle className="w-10 h-10 text-red-500" />
//             </div>
//           </Card>

//           <Card className="bg-white dark:bg-gray-800 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 dark:text-gray-400 mb-1">Skipped</p>
//                 <p className="text-3xl font-bold text-gray-600">{skippedCount}</p>
//               </div>
//               <HiEye className="w-10 h-10 text-gray-400" />
//             </div>
//           </Card>
//         </div>

//         {/* Solutions Toggle */}
//         <div className="mb-6">
//           <Button
//             variant={showSolutions ? 'primary' : 'secondary'}
//             onClick={() => setShowSolutions(!showSolutions)}
//           >
//             {showSolutions ? 'Hide Solutions' : 'Show Solutions & Explanations'}
//           </Button>
//         </div>

//         {/* Questions with Solutions */}
//         {showSolutions && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//               Solutions & Explanations
//             </h2>
//             {questions_with_answers?.map((item, index) => (
//               <Card key={item.question.id} className="bg-white dark:bg-gray-800">
//                 <div className="p-6">
//                   {/* Question Header */}
//                   <div className="flex items-start justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Question {index + 1}
//                     </h3>
//                     {item.is_correct ? (
//                       <span className="flex items-center text-green-600 font-semibold">
//                         <HiCheckCircle className="w-5 h-5 mr-1" />
//                         Correct
//                       </span>
//                     ) : item.student_answer ? (
//                       <span className="flex items-center text-red-600 font-semibold">
//                         <HiXCircle className="w-5 h-5 mr-1" />
//                         Wrong
//                       </span>
//                     ) : (
//                       <span className="text-gray-500 font-semibold">
//                         Skipped
//                       </span>
//                     )}
//                   </div>

//                   {/* Question */}
//                   {item.question.question_text && (
//                     <p className="text-gray-700 dark:text-gray-300 mb-4">
//                       {item.question.question_text}
//                     </p>
//                   )}
//                   {item.question.question_image && (
//                     <img
//                       src={item.question.question_image}
//                       alt="Question"
//                       className="max-w-full h-auto rounded-lg mb-4"
//                     />
//                   )}

//                   {/* Options (for MCQ) */}
//                   {attempt.test.type === 'mcq' && (
//                     <div className="space-y-2 mb-4">
//                       {[1, 2, 3, 4].map((optionNum) => {
//                         const optionText = item.question[`option${optionNum}`];
//                         if (!optionText) return null;

//                         const isCorrect = item.question.correct_option === optionNum;
//                         const isSelected = item.student_answer?.selected_option === optionNum;

//                         return (
//                           <div
//                             key={optionNum}
//                             className={`p-3 rounded-lg border-2 ${
//                               isCorrect
//                                 ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
//                                 : isSelected
//                                 ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
//                                 : 'border-gray-200 dark:border-gray-700'
//                             }`}
//                           >
//                             <div className="flex items-center justify-between">
//                               <span className="text-gray-900 dark:text-white">
//                                 {optionText}
//                               </span>
//                               {isCorrect && (
//                                 <HiCheckCircle className="w-5 h-5 text-green-600" />
//                               )}
//                               {isSelected && !isCorrect && (
//                                 <HiXCircle className="w-5 h-5 text-red-600" />
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {/* Explanation */}
//                   {item.question.explanation && (
//                     <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
//                       <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
//                         Explanation:
//                       </p>
//                       <p className="text-blue-800 dark:text-blue-200">
//                         {item.question.explanation}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TestResult;































// // import { useState, useEffect } from 'react';
// // import { useParams, Link, useNavigate } from 'react-router-dom';
// // import { 
// //   HiArrowLeft, 
// //   HiCheckCircle, 
// //   HiXCircle,
// //   HiEye,
// //   HiTrophy
// // } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Loading from '../../components/common/Loading';
// // import Button from '../../components/common/Button';
// // import { studentAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const TestResult = () => {
// //   const { attemptId } = useParams();
// //   const navigate = useNavigate();
// //   const [result, setResult] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [showSolutions, setShowSolutions] = useState(false);

// //   useEffect(() => {
// //     fetchResult();
// //   }, [attemptId]);

// //   const fetchResult = async () => {
// //     try {
// //       const response = await studentAPI.getTestResult(attemptId);
// //       setResult(response.data);
// //     } catch (error) {
// //       console.error('Failed to load result:', error);
// //       toast.error('Failed to load test result');
// //       navigate('/student/my-tests');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) return <Loading fullScreen />;
// //   if (!result) return null;

// //   const { attempt, questions_with_answers } = result;
// //   const percentage = ((attempt.score / attempt.test.marks) * 100).toFixed(1);
// //   const isPassed = percentage >= 40;

// //   const correctCount = questions_with_answers?.filter(q => q.is_correct).length || 0;
// //   const wrongCount = questions_with_answers?.filter(q => !q.is_correct && q.student_answer).length || 0;
// //   const skippedCount = questions_with_answers?.filter(q => !q.student_answer).length || 0;

// //   return (
// //     <DashboardLayout>
// //       <div className="p-6 max-w-5xl mx-auto">
// //         {/* Header */}
// //         <div className="flex items-center space-x-4 mb-8">
// //           <Link to="/student/my-tests">
// //             <Button variant="secondary" size="sm">
// //               <HiArrowLeft className="w-4 h-4 mr-2" />
// //               Back to Tests
// //             </Button>
// //           </Link>
// //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// //             Test Result
// //           </h1>
// //         </div>

// //         {/* Result Card */}
// //         <Card className={`mb-8 bg-gradient-to-br ${
// //           isPassed 
// //             ? 'from-green-500 to-green-600' 
// //             : 'from-red-500 to-red-600'
// //         } text-white shadow-xl`}>
// //           <div className="p-8 text-center">
// //             {isPassed ? (
// //               <HiTrophy className="w-20 h-20 mx-auto mb-4 opacity-90" />
// //             ) : (
// //               <HiXCircle className="w-20 h-20 mx-auto mb-4 opacity-90" />
// //             )}
// //             <h2 className="text-4xl font-bold mb-2">
// //               {isPassed ? 'Congratulations!' : 'Keep Trying!'}
// //             </h2>
// //             <p className="text-xl opacity-90 mb-6">
// //               You scored {attempt.score} out of {attempt.test.marks}
// //             </p>
// //             <div className="flex items-center justify-center space-x-8">
// //               <div>
// //                 <p className="text-5xl font-bold">{percentage}%</p>
// //                 <p className="text-sm opacity-90">Your Score</p>
// //               </div>
// //               <div className="h-16 w-px bg-white opacity-30"></div>
// //               <div>
// //                 <p className={`text-2xl font-bold ${isPassed ? 'text-white' : 'text-white'}`}>
// //                   {isPassed ? 'PASSED' : 'FAILED'}
// //                 </p>
// //                 <p className="text-sm opacity-90">Status</p>
// //               </div>
// //             </div>
// //           </div>
// //         </Card>

// //         {/* Stats */}
// //         <div className="grid grid-cols-3 gap-6 mb-8">
// //           <Card className="bg-white dark:bg-gray-800 p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Correct</p>
// //                 <p className="text-3xl font-bold text-green-600">{correctCount}</p>
// //               </div>
// //               <HiCheckCircle className="w-10 h-10 text-green-500" />
// //             </div>
// //           </Card>

// //           <Card className="bg-white dark:bg-gray-800 p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Wrong</p>
// //                 <p className="text-3xl font-bold text-red-600">{wrongCount}</p>
// //               </div>
// //               <HiXCircle className="w-10 h-10 text-red-500" />
// //             </div>
// //           </Card>

// //           <Card className="bg-white dark:bg-gray-800 p-6">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-gray-600 dark:text-gray-400 mb-1">Skipped</p>
// //                 <p className="text-3xl font-bold text-gray-600">{skippedCount}</p>
// //               </div>
// //               <HiEye className="w-10 h-10 text-gray-400" />
// //             </div>
// //           </Card>
// //         </div>

// //         {/* Solutions Toggle */}
// //         <div className="mb-6">
// //           <Button
// //             variant={showSolutions ? 'primary' : 'secondary'}
// //             onClick={() => setShowSolutions(!showSolutions)}
// //           >
// //             {showSolutions ? 'Hide Solutions' : 'Show Solutions & Explanations'}
// //           </Button>
// //         </div>

// //         {/* Questions with Solutions */}
// //         {showSolutions && (
// //           <div className="space-y-6">
// //             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
// //               Solutions & Explanations
// //             </h2>
// //             {questions_with_answers?.map((item, index) => (
// //               <Card key={item.question.id} className="bg-white dark:bg-gray-800">
// //                 <div className="p-6">
// //                   {/* Question Header */}
// //                   <div className="flex items-start justify-between mb-4">
// //                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// //                       Question {index + 1}
// //                     </h3>
// //                     {item.is_correct ? (
// //                       <span className="flex items-center text-green-600 font-semibold">
// //                         <HiCheckCircle className="w-5 h-5 mr-1" />
// //                         Correct
// //                       </span>
// //                     ) : item.student_answer ? (
// //                       <span className="flex items-center text-red-600 font-semibold">
// //                         <HiXCircle className="w-5 h-5 mr-1" />
// //                         Wrong
// //                       </span>
// //                     ) : (
// //                       <span className="text-gray-500 font-semibold">
// //                         Skipped
// //                       </span>
// //                     )}
// //                   </div>

// //                   {/* Question */}
// //                   {item.question.question_text && (
// //                     <p className="text-gray-700 dark:text-gray-300 mb-4">
// //                       {item.question.question_text}
// //                     </p>
// //                   )}
// //                   {item.question.question_image && (
// //                     <img
// //                       src={item.question.question_image}
// //                       alt="Question"
// //                       className="max-w-full h-auto rounded-lg mb-4"
// //                     />
// //                   )}

// //                   {/* Options (for MCQ) */}
// //                   {attempt.test.type === 'mcq' && (
// //                     <div className="space-y-2 mb-4">
// //                       {[1, 2, 3, 4].map((optionNum) => {
// //                         const optionText = item.question[`option${optionNum}`];
// //                         if (!optionText) return null;

// //                         const isCorrect = item.question.correct_option === optionNum;
// //                         const isSelected = item.student_answer?.selected_option === optionNum;

// //                         return (
// //                           <div
// //                             key={optionNum}
// //                             className={`p-3 rounded-lg border-2 ${
// //                               isCorrect
// //                                 ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
// //                                 : isSelected
// //                                 ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
// //                                 : 'border-gray-200 dark:border-gray-700'
// //                             }`}
// //                           >
// //                             <div className="flex items-center justify-between">
// //                               <span className="text-gray-900 dark:text-white">
// //                                 {optionText}
// //                               </span>
// //                               {isCorrect && (
// //                                 <HiCheckCircle className="w-5 h-5 text-green-600" />
// //                               )}
// //                               {isSelected && !isCorrect && (
// //                                 <HiXCircle className="w-5 h-5 text-red-600" />
// //                               )}
// //                             </div>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   )}

// //                   {/* Explanation */}
// //                   {item.question.explanation && (
// //                     <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
// //                       <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
// //                         Explanation:
// //                       </p>
// //                       <p className="text-blue-800 dark:text-blue-200">
// //                         {item.question.explanation}
// //                       </p>
// //                     </div>
// //                   )}
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default TestResult;























// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // export default function TestResult() {
// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6">
// // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Result - Coming Soon</h1>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // }