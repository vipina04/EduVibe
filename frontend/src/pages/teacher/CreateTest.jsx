





import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlus, HiTrash } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateTest = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState({
    name: '',
    description: '',
    type: 'mcq',
    marks: 10,
    duration_minutes: 30
  });
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question_text: '',
      question_image: null,
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: 1,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleImageChange = (id, file) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, question_image: file } : q
    ));
  };
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (questions.length === 0) {
  //     toast.error('Please add at least one question');
  //     return;
  //   }

  //   setSubmitting(true);
  //   try {
  //     // Create test first
  //     const testResponse = await teacherAPI.createTest({
  //       chapter: chapterId,
  //       ...testData
  //     });

  //     const testId = testResponse.data.id;

  //     // Add questions
  //     for (const question of questions) {
  //       const formData = new FormData();
  //       formData.append('test', testId);
  //       formData.append('question_text', question.question_text);
  //       if (question.question_image) {
  //         formData.append('question_image', question.question_image);
  //       }
  //       if (testData.type === 'mcq') {
  //         formData.append('option1', question.option1);
  //         formData.append('option2', question.option2);
  //         formData.append('option3', question.option3);
  //         formData.append('option4', question.option4);
  //         formData.append('correct_option', question.correct_option);
  //       }
  //       formData.append('explanation', question.explanation);

  //       await teacherAPI.createQuestion(formData);
  //     }

  //     toast.success('Test created successfully!');
  //     navigate(`/teacher/test/${testId}/manage`);
  //   } catch (error) {
  //     console.error('Failed to create test:', error);
  //     toast.error('Failed to create test');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate MCQ questions
    if (testData.type === 'mcq') {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.option1 || !q.option2 || !q.option3 || !q.option4) {
          toast.error(`Question ${i + 1} must have all 4 options filled`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      // Create test first
      console.log('Sending test data:', {
        chapter: chapterId,
        ...testData
      });
      
      const testResponse = await teacherAPI.createTest({
        chapter: chapterId,
        ...testData
      });

      console.log('Full API Response:', testResponse);
      console.log('Response data:', testResponse.data);
      
      // Try to get test ID from different possible locations
      let testId = testResponse.data?.id || testResponse.data?.test?.id || testResponse.id;
      
      console.log('Extracted Test ID:', testId);

      // Check if testId is valid
      if (!testId) {
        toast.error('Failed to get test ID from response');
        console.error('Full response structure:', JSON.stringify(testResponse, null, 2));
        setSubmitting(false);
        return;
      }

      // Add questions one by one
      for (const question of questions) {
        const formData = new FormData();
        formData.append('test', testId);
        formData.append('question_text', question.question_text);
        
        if (question.question_image) {
          formData.append('question_image', question.question_image);
        }
        
        if (testData.type === 'mcq') {
          formData.append('option1', question.option1 || '');
          formData.append('option2', question.option2 || '');
          formData.append('option3', question.option3 || '');
          formData.append('option4', question.option4 || '');
          formData.append('correct_option', question.correct_option);
        }
        
        formData.append('explanation', question.explanation || '');

        console.log('Creating question:', question);
        await teacherAPI.createQuestion(formData);
      }

      toast.success('Test created successfully!');
      navigate(`/teacher/tests`);
    } catch (error) {
      console.error('Failed to create test:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      
      // Show specific error message
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else {
        toast.error('Failed to create test. Please check console for details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <HiArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Test
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Details */}
          <Card className="bg-white dark:bg-gray-800">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Test Details
              </h2>

              <div>
                <label htmlFor="test-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Name *
                </label>
                <input
                  id="test-name"
                  name="test-name"
                  type="text"
                  value={testData.name}
                  onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="test-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="test-description"
                  name="test-description"
                  value={testData.description}
                  onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="test-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Type *
                  </label>
                  <select
                    id="test-type"
                    name="test-type"
                    value={testData.type}
                    onChange={(e) => setTestData({ ...testData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="descriptive">Descriptive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="test-marks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Marks *
                  </label>
                  <input
                    id="test-marks"
                    name="test-marks"
                    type="number"
                    value={testData.marks}
                    onChange={(e) => setTestData({ ...testData, marks: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="test-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    id="test-duration"
                    name="test-duration"
                    type="number"
                    value={testData.duration_minutes}
                    onChange={(e) => setTestData({ ...testData, duration_minutes: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Questions ({questions.length})
              </h2>
              <Button type="button" variant="primary" onClick={addQuestion}>
                <HiPlus className="w-5 h-5 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No questions added yet. Click "Add Question" to start.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="bg-white dark:bg-gray-800">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Question {index + 1}
                        </h3>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <HiTrash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`question-text-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Text *
                          </label>
                          <textarea
                            id={`question-text-${question.id}`}
                            name={`question-text-${question.id}`}
                            value={question.question_text}
                            onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor={`question-image-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Image (Optional)
                          </label>
                          <input
                            id={`question-image-${question.id}`}
                            name={`question-image-${question.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(question.id, e.target.files[0])}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                          />
                        </div>

                        {testData.type === 'mcq' && (
                          <>
                            {[1, 2, 3, 4].map((num) => (
                              <div key={num}>
                                <label htmlFor={`option${num}-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Option {num} *
                                </label>
                                <input
                                  id={`option${num}-${question.id}`}
                                  name={`option${num}-${question.id}`}
                                  type="text"
                                  value={question[`option${num}`]}
                                  onChange={(e) => updateQuestion(question.id, `option${num}`, e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                                  required
                                />
                              </div>
                            ))}

                            <div>
                              <label htmlFor={`correct-option-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Correct Option *
                              </label>
                              <select
                                id={`correct-option-${question.id}`}
                                name={`correct-option-${question.id}`}
                                value={question.correct_option}
                                onChange={(e) => updateQuestion(question.id, 'correct_option', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                                required
                              >
                                <option value={1}>Option 1</option>
                                <option value={2}>Option 2</option>
                                <option value={3}>Option 3</option>
                                <option value={4}>Option 4</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div>
                          <label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Explanation (Optional)
                          </label>
                          <textarea
                            id={`explanation-${question.id}`}
                            name={`explanation-${question.id}`}
                            value={question.explanation}
                            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || questions.length === 0}>
              {submitting ? 'Creating...' : 'Create Test'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateTest;



