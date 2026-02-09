import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiClock, HiCheckCircle } from 'react-icons/hi';
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
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    startTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && test) {
      handleSubmit();
    }
  }, [timeLeft, submitting]);

  const startTest = async () => {
    try {
      const response = await studentAPI.startTest(testId);
      setTest(response.data.test);
      setAttempt(response.data.attempt);
      setQuestions(response.data.questions || []);
      setTimeLeft((response.data.test.duration_minutes || 30) * 60);
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error(error.response?.data?.error || 'Failed to start test');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        question_id: parseInt(questionId),
        selected_option: answers[questionId]
      }));

      const response = await studentAPI.submitTest(attempt.id, formattedAnswers);
      toast.success('Test submitted successfully!');
      navigate(`/student/test-attempt/${attempt.id}/result`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      toast.error('Failed to submit test');
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header with Timer */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-2xl font-bold">{test?.name || 'Test'}</h1>
              <p className="text-blue-100 mt-1">
                {test?.type === 'mcq' ? 'Multiple Choice Questions' : 'Descriptive'} • {test?.marks} Marks
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-xl font-bold">
                <HiClock className="w-6 h-6" />
                <span className={timeLeft < 300 ? 'text-red-300' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                {answeredCount} / {totalQuestions} answered
              </p>
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-6 mb-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="bg-white dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Question {index + 1}
                  </h3>
                  {answers[question.id] && (
                    <HiCheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>

                {/* Question Text/Image */}
                {question.question_text && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {question.question_text}
                  </p>
                )}
                {question.question_image && (
                  <img
                    src={question.question_image}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg mb-4"
                  />
                )}

                {/* MCQ Options */}
                {test?.type === 'mcq' && (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((optionNum) => {
                      const optionText = question[`option${optionNum}`];
                      if (!optionText) return null;

                      return (
                        <label
                          key={optionNum}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[question.id] === optionNum
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={optionNum}
                            checked={answers[question.id] === optionNum}
                            onChange={() => handleAnswerChange(question.id, optionNum)}
                            className="w-5 h-5 text-blue-600"
                          />
                          <span className="ml-3 text-gray-900 dark:text-white">
                            {optionText}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Descriptive Answer */}
                {test?.type === 'descriptive' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Write your answer here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Card className="bg-white dark:bg-gray-800 sticky bottom-0">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">
                {answeredCount} of {totalQuestions} questions answered
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalQuestions - answeredCount} remaining
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TakeTest;























// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function TakeTest() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Take Test - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }