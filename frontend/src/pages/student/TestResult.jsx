import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiCheckCircle, 
  HiXCircle,
  HiEye
} from 'react-icons/hi';
// Move HiTrophy to hi2 to fix the SyntaxError
import { HiTrophy } from 'react-icons/hi2'; 
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TestResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const response = await studentAPI.getTestResult(attemptId);
      setResult(response.data);
    } catch (error) {
      console.error('Failed to load result:', error);
      toast.error('Failed to load test result');
      navigate('/student/my-tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!result) return null;

  const { attempt, questions_with_answers } = result;
  const percentage = ((attempt.score / attempt.test.marks) * 100).toFixed(1);
  const isPassed = percentage >= 40;

  const correctCount = questions_with_answers?.filter(q => q.is_correct).length || 0;
  const wrongCount = questions_with_answers?.filter(q => !q.is_correct && q.student_answer).length || 0;
  const skippedCount = questions_with_answers?.filter(q => !q.student_answer).length || 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/student/my-tests">
            <Button variant="secondary" size="sm">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back to Tests
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Test Result
          </h1>
        </div>

        {/* Result Card */}
        <Card className={`mb-8 bg-gradient-to-br ${
          isPassed 
            ? 'from-green-500 to-green-600' 
            : 'from-red-500 to-red-600'
        } text-white shadow-xl`}>
          <div className="p-8 text-center">
            {isPassed ? (
              <HiTrophy className="w-20 h-20 mx-auto mb-4 opacity-90" />
            ) : (
              <HiXCircle className="w-20 h-20 mx-auto mb-4 opacity-90" />
            )}
            <h2 className="text-4xl font-bold mb-2">
              {isPassed ? 'Congratulations!' : 'Keep Trying!'}
            </h2>
            <p className="text-xl opacity-90 mb-6">
              You scored {attempt.score} out of {attempt.test.marks}
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div>
                <p className="text-5xl font-bold">{percentage}%</p>
                <p className="text-sm opacity-90">Your Score</p>
              </div>
              <div className="h-16 w-px bg-white opacity-30"></div>
              <div>
                <p className={`text-2xl font-bold ${isPassed ? 'text-white' : 'text-white'}`}>
                  {isPassed ? 'PASSED' : 'FAILED'}
                </p>
                <p className="text-sm opacity-90">Status</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Correct</p>
                <p className="text-3xl font-bold text-green-600">{correctCount}</p>
              </div>
              <HiCheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Wrong</p>
                <p className="text-3xl font-bold text-red-600">{wrongCount}</p>
              </div>
              <HiXCircle className="w-10 h-10 text-red-500" />
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Skipped</p>
                <p className="text-3xl font-bold text-gray-600">{skippedCount}</p>
              </div>
              <HiEye className="w-10 h-10 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Solutions Toggle */}
        <div className="mb-6">
          <Button
            variant={showSolutions ? 'primary' : 'secondary'}
            onClick={() => setShowSolutions(!showSolutions)}
          >
            {showSolutions ? 'Hide Solutions' : 'Show Solutions & Explanations'}
          </Button>
        </div>

        {/* Questions with Solutions */}
        {showSolutions && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Solutions & Explanations
            </h2>
            {questions_with_answers?.map((item, index) => (
              <Card key={item.question.id} className="bg-white dark:bg-gray-800">
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h3>
                    {item.is_correct ? (
                      <span className="flex items-center text-green-600 font-semibold">
                        <HiCheckCircle className="w-5 h-5 mr-1" />
                        Correct
                      </span>
                    ) : item.student_answer ? (
                      <span className="flex items-center text-red-600 font-semibold">
                        <HiXCircle className="w-5 h-5 mr-1" />
                        Wrong
                      </span>
                    ) : (
                      <span className="text-gray-500 font-semibold">
                        Skipped
                      </span>
                    )}
                  </div>

                  {/* Question */}
                  {item.question.question_text && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {item.question.question_text}
                    </p>
                  )}
                  {item.question.question_image && (
                    <img
                      src={item.question.question_image}
                      alt="Question"
                      className="max-w-full h-auto rounded-lg mb-4"
                    />
                  )}

                  {/* Options (for MCQ) */}
                  {attempt.test.type === 'mcq' && (
                    <div className="space-y-2 mb-4">
                      {[1, 2, 3, 4].map((optionNum) => {
                        const optionText = item.question[`option${optionNum}`];
                        if (!optionText) return null;

                        const isCorrect = item.question.correct_option === optionNum;
                        const isSelected = item.student_answer?.selected_option === optionNum;

                        return (
                          <div
                            key={optionNum}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrect
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : isSelected
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900 dark:text-white">
                                {optionText}
                              </span>
                              {isCorrect && (
                                <HiCheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {isSelected && !isCorrect && (
                                <HiXCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {item.question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Explanation:
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        {item.question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
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
//   HiEye,
//   HiTrophy
// } from 'react-icons/hi';
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























// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // export default function TestResult() {
// //   return (
// //     <DashboardLayout>
// //       <div className="p-6">
// //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Result - Coming Soon</h1>
// //       </div>
// //     </DashboardLayout>
// //   );
// // }