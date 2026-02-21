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
























