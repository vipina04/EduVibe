/**
 * CreateTest.jsx
 * Teacher creates a test for a specific chapter of a specific subject of a specific class.
 * Flow: Select Class → Select Subject → Select Chapter → Fill Test Details → Add Questions
 * Connected to academics DB via TeacherAssignment → ClassSubject → Chapter → Test
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MARKS_OPTIONS = [10, 20, 50];

export default function CreateTest() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Step data ──────────────────────────────────────────────────────────────
  const [classes,  setClasses]  = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // ── Selections ─────────────────────────────────────────────────────────────
  const [selectedClass,   setSelectedClass]   = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // ── Test form ──────────────────────────────────────────────────────────────
  const [testType,     setTestType]     = useState('mcq');   // 'mcq' | 'descriptive'
  const [totalMarks,   setTotalMarks]   = useState(10);
  const [testName,     setTestName]     = useState('');
  const [duration,     setDuration]     = useState(30);
  const [description,  setDescription]  = useState('');

  // ── Questions ──────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(true);
  const [step,         setStep]         = useState(1); // 1=select, 2=test details, 3=questions, 4=done
  const [submitting,   setSubmitting]   = useState(false);
  const [createdTestId, setCreatedTestId] = useState(null);

  // ── Mount: check for preselection OR fetch classes ────────────────────────
  useEffect(() => {
    const pre = location.state;
    if (pre?.preselectedChapterId) {
      // Coming from TeacherTestSelection — skip Step 1, jump to Step 2
      setClasses([{ id: pre.preselectedClassId, name: pre.preselectedClassName, subjects: [] }]);
      setSubjects([{ id: pre.preselectedSubjectId, name: pre.preselectedSubjectName, chapters: [] }]);
      setChapters([{ id: pre.preselectedChapterId, name: pre.preselectedChapterName }]);
      setSelectedClass(String(pre.preselectedClassId));
      setSelectedSubject(String(pre.preselectedSubjectId));
      setSelectedChapter(String(pre.preselectedChapterId));
      setLoading(false);
      setStep(2);
    } else {
      // Normal flow — load assigned classes for Step 1 dropdowns
      const fetchClasses = async () => {
        try {
          setLoading(true);
          const res = await api.get('/teachers/assigned-classes/');
          setClasses(res.data?.classes || []);
        } catch (err) {
          toast.error('Failed to load your assigned classes');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchClasses();
    }
  }, []);

  // ── When class changes → filter subjects ──────────────────────────────────
  useEffect(() => {
    if (!selectedClass) { setSubjects([]); setSelectedSubject(''); return; }
    const cls = classes.find(c => String(c.id) === String(selectedClass));
    setSubjects(cls?.subjects || []);
    setSelectedSubject('');
    setSelectedChapter('');
    setChapters([]);
  }, [selectedClass]);

  // ── When subject changes → get chapters ───────────────────────────────────
  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setSelectedChapter(''); return; }
    const subj = subjects.find(s => String(s.id) === String(selectedSubject));
    setChapters(subj?.chapters || []);
    setSelectedChapter('');
  }, [selectedSubject]);

  // ── Auto-generate test name ────────────────────────────────────────────────
  useEffect(() => {
    if (selectedChapter && selectedSubject && testType) {
      const chapterName = chapters.find(c => String(c.id) === String(selectedChapter))?.name || '';
      const subjectName = subjects.find(s => String(s.id) === String(selectedSubject))?.name || '';
      setTestName(`${subjectName} - ${chapterName} (${totalMarks} Marks)`);
    }
  }, [selectedChapter, testType, totalMarks]);

  // ── Build empty questions based on test type + marks ─────────────────────
  const buildEmptyQuestions = () => {
    const count = testType === 'mcq' ? totalMarks : Math.ceil(totalMarks / 5);
    return Array.from({ length: count }, (_, i) => ({
      id:              i + 1,
      question_text:   '',
      question_image:  null,
      type:            testType,
      marks:           testType === 'mcq' ? 1 : 5,
      options:         testType === 'mcq'
        ? [{ text: '', is_correct: false }, { text: '', is_correct: false },
           { text: '', is_correct: false }, { text: '', is_correct: false }]
        : [],
      explanation:     '',
    }));
  };

  // ── Step 1 → Step 2: validate selection ───────────────────────────────────
  const handleProceedToDetails = () => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      toast.error('Please select class, subject, and chapter');
      return;
    }
    setStep(2);
  };

  // ── Step 2 → Step 3: create test in backend ───────────────────────────────
  const handleCreateTest = async () => {
    if (!testName.trim()) { toast.error('Please enter a test name'); return; }
    if (!duration || duration < 5) { toast.error('Duration must be at least 5 minutes'); return; }

    try {
      setSubmitting(true);
      const res = await api.post('/teachers/create-test/', {
        chapter:          parseInt(selectedChapter),
        name:             testName.trim(),
        description:      description.trim(),
        type:             testType,
        marks:            parseInt(totalMarks),
        duration_minutes: parseInt(duration),
      });

      setCreatedTestId(res.data.id);
      setQuestions(buildEmptyQuestions());
      toast.success('Test created! Now add your questions.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create test');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Question field updaters ────────────────────────────────────────────────
  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      const opts = [...updated[qIdx].options];
      opts[oIdx] = { ...opts[oIdx], [field]: value };
      // If marking correct — unmark others
      if (field === 'is_correct' && value === true) {
        opts.forEach((o, i) => { if (i !== oIdx) opts[i] = { ...opts[i], is_correct: false }; });
      }
      updated[qIdx] = { ...updated[qIdx], options: opts };
      return updated;
    });
  };

  // ── Submit all questions ───────────────────────────────────────────────────
  const handleSubmitQuestions = async () => {
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim() && !q.question_image) {
        toast.error(`Question ${i + 1}: Please enter question text or upload an image`);
        return;
      }
      if (q.type === 'mcq') {
        const filledOptions = q.options.filter(o => o.text.trim());
        if (filledOptions.length < 2) {
          toast.error(`Question ${i + 1}: Please fill at least 2 options`);
          return;
        }
        const hasCorrect = q.options.some(o => o.is_correct);
        if (!hasCorrect) {
          toast.error(`Question ${i + 1}: Please mark the correct answer`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      // Submit each question
      for (const q of questions) {
        const formData = new FormData();
        formData.append('test',          createdTestId);
        formData.append('question_text', q.question_text);
        formData.append('type',          q.type);
        formData.append('marks',         q.marks);
        formData.append('explanation',   q.explanation);
        if (q.question_image) formData.append('question_image', q.question_image);
        if (q.type === 'mcq') {
          formData.append('option1', q.options[0]?.text || '');
          formData.append('option2', q.options[1]?.text || '');
          formData.append('option3', q.options[2]?.text || '');
          formData.append('option4', q.options[3]?.text || '');
          const correctIdx = q.options.findIndex(o => o.is_correct);
          formData.append('correct_option', correctIdx + 1); // backend expects 1,2,3,4
        }
        await api.post('/teachers/create-question/', formData);
      }

      toast.success('All questions saved! Test is ready.');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save questions');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const selectedClassName   = classes.find(c => String(c.id) === String(selectedClass))?.name || '';
  const selectedSubjectName = subjects.find(s => String(s.id) === String(selectedSubject))?.name || '';
  const selectedChapterName = chapters.find(c => String(c.id) === String(selectedChapter))?.name || '';

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">

        {/* ── Header ── */}
        <div className="mb-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/teacher/dashboard')}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-3 flex items-center gap-1"
          >
            ← {step > 1 ? 'Back' : 'Back to Dashboard'}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Test</h1>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mt-4">
            {['Select Chapter', 'Test Details', 'Add Questions', 'Done'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${step > i + 1 ? 'bg-green-500 text-white'
                    : step === i + 1 ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block
                  ${step === i + 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < 3 && <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            STEP 1 — Select Class → Subject → Chapter
        ══════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 1: Select Class, Subject & Chapter
            </h2>

            {classes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  You have no assigned classes yet. Ask admin to assign you to a class.
                </p>
              </div>
            ) : (
              <>
                {/* Class */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    1. Select Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    2. Select Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    disabled={!selectedClass}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {selectedClass && subjects.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">No subjects assigned for this class yet.</p>
                  )}
                </div>

                {/* Chapter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    3. Select Chapter
                  </label>
                  <select
                    value={selectedChapter}
                    onChange={e => setSelectedChapter(e.target.value)}
                    disabled={!selectedSubject}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">-- Select Chapter --</option>
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {selectedSubject && chapters.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      No chapters found. Ask admin to add chapters for this subject.
                    </p>
                  )}
                </div>

                <button
                  onClick={handleProceedToDetails}
                  disabled={!selectedClass || !selectedSubject || !selectedChapter}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                             text-white font-semibold rounded-xl transition-colors"
                >
                  Continue →
                </button>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 2 — Test Details
        ══════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 2: Test Details
            </h2>

            {/* Selection summary */}
            <div className="flex flex-wrap gap-2">
              {[selectedClassName, selectedSubjectName, selectedChapterName].map((label, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30
                                         text-indigo-700 dark:text-indigo-300 text-sm rounded-full font-medium">
                  {label}
                </span>
              ))}
            </div>

            {/* Test Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Test Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'mcq',         label: 'MCQ Test',         desc: 'Multiple choice questions with 4 options' },
                  { value: 'descriptive', label: 'Descriptive Test',  desc: 'Written answer questions' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTestType(opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all
                      ${testType === opt.value
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Marks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Total Marks
              </label>
              <div className="flex gap-3">
                {MARKS_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => setTotalMarks(m)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-lg transition-all
                      ${totalMarks === m
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Test Name
              </label>
              <input
                type="text"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                placeholder="e.g. Mathematics - Algebra (10 Marks)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                min="5"
                max="180"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Any instructions for students..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              onClick={handleCreateTest}
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                         text-white font-semibold rounded-xl transition-colors"
            >
              {submitting ? 'Creating Test...' : 'Create Test & Add Questions →'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 3 — Add Questions
        ══════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Step 3: Add Questions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {testType === 'mcq'
                  ? `${questions.length} questions × 1 mark = ${totalMarks} marks`
                  : `${questions.length} questions × 5 marks = ${totalMarks} marks`}
              </p>
            </div>

            {questions.map((q, qIdx) => (
              <div key={q.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                  Question {qIdx + 1}
                  {q.type === 'mcq' ? ' — 1 Mark' : ' — 5 Marks'}
                </h3>

                {/* Question text */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Question Text (or upload image below)
                  </label>
                  <textarea
                    value={q.question_text}
                    onChange={e => updateQuestion(qIdx, 'question_text', e.target.value)}
                    rows={3}
                    placeholder="Type the question here..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                  />
                </div>

                {/* Question image upload */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Or Upload Question Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => updateQuestion(qIdx, 'question_image', e.target.files[0])}
                    className="w-full text-sm text-gray-600 dark:text-gray-400
                               file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                               file:bg-indigo-50 file:text-indigo-700 file:font-medium
                               dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                  />
                </div>

                {/* MCQ Options */}
                {q.type === 'mcq' && (
                  <div className="mb-4 space-y-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Options (type text • tick the correct answer)
                    </label>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center
                          text-xs font-bold flex-shrink-0
                          ${opt.is_correct
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={e => updateOption(qIdx, oIdx, 'text', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <button
                          onClick={() => updateOption(qIdx, oIdx, 'is_correct', !opt.is_correct)}
                          title="Mark as correct answer"
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0
                            ${opt.is_correct
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50'}`}
                        >
                          {opt.is_correct ? '✓ Correct' : 'Mark'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Explanation (shown to students after test)
                  </label>
                  <textarea
                    value={q.explanation}
                    onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
                    rows={2}
                    placeholder="Explain the correct answer..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmitQuestions}
              disabled={submitting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50
                         text-white font-bold rounded-xl transition-colors text-lg"
            >
              {submitting ? 'Saving Questions...' : `✓ Save All ${questions.length} Questions`}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 4 — Done
        ══════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full
                            flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Test Created Successfully!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              <span className="font-semibold text-indigo-600">{testName}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {selectedClassName} · {selectedSubjectName} · {selectedChapterName}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedClass(''); setSelectedSubject(''); setSelectedChapter('');
                  setQuestions([]); setCreatedTestId(null);
                  setTestName(''); setDescription('');
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white
                           font-semibold rounded-xl transition-colors"
              >
                Create Another Test
              </button>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300
                           dark:hover:bg-gray-600 text-gray-900 dark:text-white
                           font-semibold rounded-xl transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}




















// /**
//  * CreateTest.jsx
//  * Teacher creates a test for a specific chapter of a specific subject of a specific class.
//  * Flow: Select Class → Select Subject → Select Chapter → Fill Test Details → Add Questions
//  * Connected to academics DB via TeacherAssignment → ClassSubject → Chapter → Test
//  */

// import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// import { useNavigate, useLocation } from 'react-router-dom';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const MARKS_OPTIONS = [10, 20, 50];

// export default function CreateTest() {
//   const navigate = useNavigate();
//   const location = useLocation(); // ← ADD THIS

// // ── ADD THIS ENTIRE useEffect ──────────────────────────────
//    useEffect(() => {
//    const pre = location.state;
//    if (pre?.preselectedChapterId) {
//     setSelectedClass(String(pre.preselectedClassId));
//     setSelectedSubject(String(pre.preselectedSubjectId));
//     setSelectedChapter(String(pre.preselectedChapterId));
//     // Also set display names directly for Step 2 summary chips
//     setClasses([{ id: pre.preselectedClassId, name: pre.preselectedClassName, subjects: [] }]);
//     setSubjects([{ id: pre.preselectedSubjectId, name: pre.preselectedSubjectName, chapters: [] }]);
//     setChapters([{ id: pre.preselectedChapterId, name: pre.preselectedChapterName }]);
//     setLoading(false);
//     setStep(2); // skip Step 1
//   }
// }, []);

//   // ── Step data ──────────────────────────────────────────────────────────────
//   const [classes,  setClasses]  = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);

//   // ── Selections ─────────────────────────────────────────────────────────────
//   const [selectedClass,   setSelectedClass]   = useState('');
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [selectedChapter, setSelectedChapter] = useState('');

//   // ── Test form ──────────────────────────────────────────────────────────────
//   const [testType,     setTestType]     = useState('mcq');   // 'mcq' | 'descriptive'
//   const [totalMarks,   setTotalMarks]   = useState(10);
//   const [testName,     setTestName]     = useState('');
//   const [duration,     setDuration]     = useState(30);
//   const [description,  setDescription]  = useState('');

//   // ── Questions ──────────────────────────────────────────────────────────────
//   const [questions, setQuestions] = useState([]);

//   // ── UI state ───────────────────────────────────────────────────────────────
//   const [loading,    setLoading]    = useState(true);
//   const [step,       setStep]       = useState(1); // 1=select, 2=test details, 3=questions, 4=done
//   const [submitting, setSubmitting] = useState(false);
//   const [createdTestId, setCreatedTestId] = useState(null);

//   // ── Load assigned classes on mount ────────────────────────────────────────
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get('/teachers/assigned-classes/');
//         setClasses(res.data?.classes || []);
//       } catch (err) {
//         toast.error('Failed to load your assigned classes');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchClasses();
//   }, []);

//   // ── When class changes → filter subjects ──────────────────────────────────
//   useEffect(() => {
//     // if (!selectedClass) { setSubjects([]); setSubject(''); return; }
//     if (!selectedClass) { setSubjects([]); setSelectedSubject(''); return; }
//     const cls = classes.find(c => String(c.id) === String(selectedClass));
//     setSubjects(cls?.subjects || []);
//     setSelectedSubject('');
//     setSelectedChapter('');
//     setChapters([]);
//   }, [selectedClass]);

//   // ── When subject changes → get chapters ───────────────────────────────────
//   useEffect(() => {
//     if (!selectedSubject) { setChapters([]); setSelectedChapter(''); return; }
//     const subj = subjects.find(s => String(s.id) === String(selectedSubject));
//     setChapters(subj?.chapters || []);
//     setSelectedChapter('');
//   }, [selectedSubject]);

//   // ── Auto-generate test name ────────────────────────────────────────────────
//   useEffect(() => {
//     if (selectedChapter && selectedSubject && testType) {
//       const chapterName = chapters.find(c => String(c.id) === String(selectedChapter))?.name || '';
//       const subjectName = subjects.find(s => String(s.id) === String(selectedSubject))?.name || '';
//       setTestName(`${subjectName} - ${chapterName} (${totalMarks} Marks)`);
//     }
//   }, [selectedChapter, testType, totalMarks]);

//   // ── Build empty questions based on test type + marks ─────────────────────
//   const buildEmptyQuestions = () => {
//     const count = testType === 'mcq' ? totalMarks : Math.ceil(totalMarks / 5);
//     return Array.from({ length: count }, (_, i) => ({
//       id:              i + 1,
//       question_text:   '',
//       question_image:  null,
//       type:            testType,
//       marks:           testType === 'mcq' ? 1 : 5,
//       options:         testType === 'mcq'
//         ? [{ text: '', is_correct: false }, { text: '', is_correct: false },
//            { text: '', is_correct: false }, { text: '', is_correct: false }]
//         : [],
//       explanation:     '',
//     }));
//   };

//   // ── Step 1 → Step 2: validate selection ───────────────────────────────────
//   const handleProceedToDetails = () => {
//     if (!selectedClass || !selectedSubject || !selectedChapter) {
//       toast.error('Please select class, subject, and chapter');
//       return;
//     }
//     setStep(2);
//   };

//   // ── Step 2 → Step 3: create test in backend ───────────────────────────────
//   const handleCreateTest = async () => {
//     if (!testName.trim()) { toast.error('Please enter a test name'); return; }
//     if (!duration || duration < 5) { toast.error('Duration must be at least 5 minutes'); return; }

//     try {
//       setSubmitting(true);
//       const res = await api.post('/teachers/create-test/', {
//         chapter:          parseInt(selectedChapter),
//         name:             testName.trim(),
//         description:      description.trim(),
//         type:             testType,
//         marks:            parseInt(totalMarks),
//         duration_minutes: parseInt(duration),
//       });

//       setCreatedTestId(res.data.id);
//       setQuestions(buildEmptyQuestions());
//       toast.success('Test created! Now add your questions.');
//       setStep(3);
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Failed to create test');
//       console.error(err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Question field updaters ────────────────────────────────────────────────
//   const updateQuestion = (idx, field, value) => {
//     setQuestions(prev => {
//       const updated = [...prev];
//       updated[idx] = { ...updated[idx], [field]: value };
//       return updated;
//     });
//   };

//   const updateOption = (qIdx, oIdx, field, value) => {
//     setQuestions(prev => {
//       const updated = [...prev];
//       const opts = [...updated[qIdx].options];
//       opts[oIdx] = { ...opts[oIdx], [field]: value };
//       // If marking correct — unmark others
//       if (field === 'is_correct' && value === true) {
//         opts.forEach((o, i) => { if (i !== oIdx) opts[i] = { ...opts[i], is_correct: false }; });
//       }
//       updated[qIdx] = { ...updated[qIdx], options: opts };
//       return updated;
//     });
//   };

//   // ── Submit all questions ───────────────────────────────────────────────────
//   const handleSubmitQuestions = async () => {
//     // Validate
//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       if (!q.question_text.trim() && !q.question_image) {
//         toast.error(`Question ${i + 1}: Please enter question text or upload an image`);
//         return;
//       }
//       if (q.type === 'mcq') {
//         const filledOptions = q.options.filter(o => o.text.trim());
//         if (filledOptions.length < 2) {
//           toast.error(`Question ${i + 1}: Please fill at least 2 options`);
//           return;
//         }
//         const hasCorrect = q.options.some(o => o.is_correct);
//         if (!hasCorrect) {
//           toast.error(`Question ${i + 1}: Please mark the correct answer`);
//           return;
//         }
//       }
//     }

//     try {
//       setSubmitting(true);
//       // Submit each question
//       for (const q of questions) {
//         const formData = new FormData();
//         // formData.append('test_id',      createdTestId);
//         formData.append('test', createdTestId);
//         formData.append('question_text', q.question_text);
//         formData.append('type',          q.type);
//         formData.append('marks',         q.marks);
//         formData.append('explanation',   q.explanation);
//         if (q.question_image) formData.append('question_image', q.question_image);
//         // if (q.type === 'mcq') {
//         //   formData.append('options', JSON.stringify(q.options));
//         // }
//         if (q.type === 'mcq') {
//            formData.append('option1', q.options[0]?.text || '');
//            formData.append('option2', q.options[1]?.text || '');
//            formData.append('option3', q.options[2]?.text || '');
//            formData.append('option4', q.options[3]?.text || '');
//         const correctIdx = q.options.findIndex(o => o.is_correct);
//            formData.append('correct_option', correctIdx + 1); // backend expects 1,2,3,4
//          }
//         await api.post('/teachers/create-question/', formData);
//       }

//       toast.success('All questions saved! Test is ready.');
//       setStep(4);
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Failed to save questions');
//       console.error(err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const selectedClassName   = classes.find(c => String(c.id) === String(selectedClass))?.name || '';
//   const selectedSubjectName = subjects.find(s => String(s.id) === String(selectedSubject))?.name || '';
//   const selectedChapterName = chapters.find(c => String(c.id) === String(selectedChapter))?.name || '';

//   // ── Loading ───────────────────────────────────────────────────────────────
//   if (loading) return (
//     <DashboardLayout>
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
//       </div>
//     </DashboardLayout>
//   );

//   return (
//     <DashboardLayout>
//       <div className="max-w-4xl mx-auto p-6">

//         {/* ── Header ── */}
//         <div className="mb-8">
//           <button
//             onClick={() => step > 1 ? setStep(step - 1) : navigate('/teacher/dashboard')}
//             className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-3 flex items-center gap-1"
//           >
//             ← {step > 1 ? 'Back' : 'Back to Dashboard'}
//           </button>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Test</h1>

//           {/* Step indicator */}
//           <div className="flex items-center gap-3 mt-4">
//             {['Select Chapter', 'Test Details', 'Add Questions', 'Done'].map((label, i) => (
//               <div key={i} className="flex items-center gap-2">
//                 <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
//                   ${step > i + 1 ? 'bg-green-500 text-white'
//                     : step === i + 1 ? 'bg-indigo-600 text-white'
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
//                   {step > i + 1 ? '✓' : i + 1}
//                 </div>
//                 <span className={`text-xs font-medium hidden sm:block
//                   ${step === i + 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
//                   {label}
//                 </span>
//                 {i < 3 && <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ══════════════════════════════════════════════════════════
//             STEP 1 — Select Class → Subject → Chapter
//         ══════════════════════════════════════════════════════════ */}
//         {step === 1 && (
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//               Step 1: Select Class, Subject & Chapter
//             </h2>

//             {classes.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-gray-500 dark:text-gray-400">
//                   You have no assigned classes yet. Ask admin to assign you to a class.
//                 </p>
//               </div>
//             ) : (
//               <>
//                 {/* Class */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     1. Select Class
//                   </label>
//                   <select
//                     value={selectedClass}
//                     onChange={e => setSelectedClass(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
//                                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                                focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   >
//                     <option value="">-- Select Class --</option>
//                     {classes.map(c => (
//                       <option key={c.id} value={c.id}>{c.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Subject */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     2. Select Subject
//                   </label>
//                   <select
//                     value={selectedSubject}
//                     onChange={e => setSelectedSubject(e.target.value)}
//                     disabled={!selectedClass}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
//                                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                                focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
//                   >
//                     <option value="">-- Select Subject --</option>
//                     {subjects.map(s => (
//                       <option key={s.id} value={s.id}>{s.name}</option>
//                     ))}
//                   </select>
//                   {selectedClass && subjects.length === 0 && (
//                     <p className="text-xs text-yellow-600 mt-1">No subjects assigned for this class yet.</p>
//                   )}
//                 </div>

//                 {/* Chapter */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     3. Select Chapter
//                   </label>
//                   <select
//                     value={selectedChapter}
//                     onChange={e => setSelectedChapter(e.target.value)}
//                     disabled={!selectedSubject}
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
//                                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                                focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
//                   >
//                     <option value="">-- Select Chapter --</option>
//                     {chapters.map(c => (
//                       <option key={c.id} value={c.id}>{c.name}</option>
//                     ))}
//                   </select>
//                   {selectedSubject && chapters.length === 0 && (
//                     <p className="text-xs text-yellow-600 mt-1">
//                       No chapters found. Ask admin to add chapters for this subject.
//                     </p>
//                   )}
//                 </div>

//                 <button
//                   onClick={handleProceedToDetails}
//                   disabled={!selectedClass || !selectedSubject || !selectedChapter}
//                   className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
//                              text-white font-semibold rounded-xl transition-colors"
//                 >
//                   Continue →
//                 </button>
//               </>
//             )}
//           </div>
//         )}

//         {/* ══════════════════════════════════════════════════════════
//             STEP 2 — Test Details
//         ══════════════════════════════════════════════════════════ */}
//         {step === 2 && (
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//               Step 2: Test Details
//             </h2>

//             {/* Selection summary */}
//             <div className="flex flex-wrap gap-2">
//               {[selectedClassName, selectedSubjectName, selectedChapterName].map((label, i) => (
//                 <span key={i} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30
//                                          text-indigo-700 dark:text-indigo-300 text-sm rounded-full font-medium">
//                   {label}
//                 </span>
//               ))}
//             </div>

//             {/* Test Type */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
//                 Test Type
//               </label>
//               <div className="grid grid-cols-2 gap-4">
//                 {[
//                   { value: 'mcq',         label: 'MCQ Test',         desc: 'Multiple choice questions with 4 options' },
//                   { value: 'descriptive', label: 'Descriptive Test',  desc: 'Written answer questions' },
//                 ].map(opt => (
//                   <button
//                     key={opt.value}
//                     onClick={() => setTestType(opt.value)}
//                     className={`p-4 rounded-xl border-2 text-left transition-all
//                       ${testType === opt.value
//                         ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
//                         : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
//                   >
//                     <p className="font-semibold text-gray-900 dark:text-white">{opt.label}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</p>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Total Marks */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
//                 Total Marks
//               </label>
//               <div className="flex gap-3">
//                 {MARKS_OPTIONS.map(m => (
//                   <button
//                     key={m}
//                     onClick={() => setTotalMarks(m)}
//                     className={`flex-1 py-3 rounded-xl border-2 font-bold text-lg transition-all
//                       ${totalMarks === m
//                         ? 'border-indigo-600 bg-indigo-600 text-white'
//                         : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
//                   >
//                     {m}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Test Name */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Test Name
//               </label>
//               <input
//                 type="text"
//                 value={testName}
//                 onChange={e => setTestName(e.target.value)}
//                 placeholder="e.g. Mathematics - Algebra (10 Marks)"
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
//                            bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                            focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>

//             {/* Duration */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Duration (minutes)
//               </label>
//               <input
//                 type="number"
//                 value={duration}
//                 onChange={e => setDuration(e.target.value)}
//                 min="5"
//                 max="180"
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
//                            bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                            focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Description (optional)
//               </label>
//               <textarea
//                 value={description}
//                 onChange={e => setDescription(e.target.value)}
//                 rows={3}
//                 placeholder="Any instructions for students..."
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
//                            bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                            focus:ring-2 focus:ring-indigo-500 resize-none"
//               />
//             </div>

//             <button
//               onClick={handleCreateTest}
//               disabled={submitting}
//               className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
//                          text-white font-semibold rounded-xl transition-colors"
//             >
//               {submitting ? 'Creating Test...' : 'Create Test & Add Questions →'}
//             </button>
//           </div>
//         )}

//         {/* ══════════════════════════════════════════════════════════
//             STEP 3 — Add Questions
//         ══════════════════════════════════════════════════════════ */}
//         {step === 3 && (
//           <div className="space-y-6">
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6">
//               <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
//                 Step 3: Add Questions
//               </h2>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 {testType === 'mcq'
//                   ? `${questions.length} questions × 1 mark = ${totalMarks} marks`
//                   : `${questions.length} questions × 5 marks = ${totalMarks} marks`}
//               </p>
//             </div>

//             {questions.map((q, qIdx) => (
//               <div key={q.id}
//                 className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6">
//                 <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-4">
//                   Question {qIdx + 1}
//                   {q.type === 'mcq' ? ' — 1 Mark' : ' — 5 Marks'}
//                 </h3>

//                 {/* Question text */}
//                 <div className="mb-4">
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                     Question Text (or upload image below)
//                   </label>
//                   <textarea
//                     value={q.question_text}
//                     onChange={e => updateQuestion(qIdx, 'question_text', e.target.value)}
//                     rows={3}
//                     placeholder="Type the question here..."
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
//                                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                                focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
//                   />
//                 </div>

//                 {/* Question image upload */}
//                 <div className="mb-4">
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                     Or Upload Question Image (optional)
//                   </label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={e => updateQuestion(qIdx, 'question_image', e.target.files[0])}
//                     className="w-full text-sm text-gray-600 dark:text-gray-400
//                                file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
//                                file:bg-indigo-50 file:text-indigo-700 file:font-medium
//                                dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
//                   />
//                 </div>

//                 {/* MCQ Options */}
//                 {q.type === 'mcq' && (
//                   <div className="mb-4 space-y-2">
//                     <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
//                       Options (type text • tick the correct answer)
//                     </label>
//                     {q.options.map((opt, oIdx) => (
//                       <div key={oIdx} className="flex items-center gap-3">
//                         <span className={`w-7 h-7 rounded-full flex items-center justify-center
//                           text-xs font-bold flex-shrink-0
//                           ${opt.is_correct
//                             ? 'bg-green-500 text-white'
//                             : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
//                           {String.fromCharCode(65 + oIdx)}
//                         </span>
//                         <input
//                           type="text"
//                           value={opt.text}
//                           onChange={e => updateOption(qIdx, oIdx, 'text', e.target.value)}
//                           placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
//                           className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
//                                      bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                                      focus:ring-2 focus:ring-indigo-500 text-sm"
//                         />
//                         <button
//                           onClick={() => updateOption(qIdx, oIdx, 'is_correct', !opt.is_correct)}
//                           title="Mark as correct answer"
//                           className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0
//                             ${opt.is_correct
//                               ? 'bg-green-500 text-white'
//                               : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50'}`}
//                         >
//                           {opt.is_correct ? '✓ Correct' : 'Mark'}
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Explanation */}
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                     Explanation (shown to students after test)
//                   </label>
//                   <textarea
//                     value={q.explanation}
//                     onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
//                     rows={2}
//                     placeholder="Explain the correct answer..."
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
//                                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
//                                focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
//                   />
//                 </div>
//               </div>
//             ))}

//             <button
//               onClick={handleSubmitQuestions}
//               disabled={submitting}
//               className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50
//                          text-white font-bold rounded-xl transition-colors text-lg"
//             >
//               {submitting ? 'Saving Questions...' : `✓ Save All ${questions.length} Questions`}
//             </button>
//           </div>
//         )}

//         {/* ══════════════════════════════════════════════════════════
//             STEP 4 — Done
//         ══════════════════════════════════════════════════════════ */}
//         {step === 4 && (
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
//             <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full
//                             flex items-center justify-center mx-auto mb-6">
//               <span className="text-4xl">✅</span>
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//               Test Created Successfully!
//             </h2>
//             <p className="text-gray-500 dark:text-gray-400 mb-2">
//               <span className="font-semibold text-indigo-600">{testName}</span>
//             </p>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
//               {selectedClassName} · {selectedSubjectName} · {selectedChapterName}
//             </p>
//             <div className="flex gap-4 justify-center">
//               <button
//                 onClick={() => {
//                   setStep(1);
//                   setSelectedClass(''); setSelectedSubject(''); setSelectedChapter('');
//                   setQuestions([]); setCreatedTestId(null);
//                   setTestName(''); setDescription('');
//                 }}
//                 className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white
//                            font-semibold rounded-xl transition-colors"
//               >
//                 Create Another Test
//               </button>
//               <button
//                 onClick={() => navigate('/teacher/dashboard')}
//                 className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300
//                            dark:hover:bg-gray-600 text-gray-900 dark:text-white
//                            font-semibold rounded-xl transition-colors"
//               >
//                 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         )}

//       </div>
//     </DashboardLayout>
//   );
// }


























// // import { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { HiArrowLeft, HiPlus, HiTrash } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Button from '../../components/common/Button';
// // import { teacherAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const CreateTest = () => {
// //   const { chapterId } = useParams();
// //   const navigate = useNavigate();
// //   const [testData, setTestData] = useState({
// //     name: '',
// //     description: '',
// //     type: 'mcq',
// //     marks: 10,
// //     duration_minutes: 30
// //   });
// //   const [questions, setQuestions] = useState([]);
// //   const [submitting, setSubmitting] = useState(false);

// //   const addQuestion = () => {
// //     const newQuestion = {
// //       id: Date.now(),
// //       question_text: '',
// //       question_image: null,
// //       option1: '',
// //       option2: '',
// //       option3: '',
// //       option4: '',
// //       correct_option: 1,
// //       explanation: ''
// //     };
// //     setQuestions([...questions, newQuestion]);
// //   };

// //   const updateQuestion = (id, field, value) => {
// //     setQuestions(questions.map(q => 
// //       q.id === id ? { ...q, [field]: value } : q
// //     ));
// //   };

// //   const removeQuestion = (id) => {
// //     setQuestions(questions.filter(q => q.id !== id));
// //   };

// //   const handleImageChange = (id, file) => {
// //     setQuestions(questions.map(q => 
// //       q.id === id ? { ...q, question_image: file } : q
// //     ));
// //   };
  

// //   // const handleSubmit = async (e) => {
// //   //   e.preventDefault();
    
// //   //   if (questions.length === 0) {
// //   //     toast.error('Please add at least one question');
// //   //     return;
// //   //   }

// //   //   setSubmitting(true);
// //   //   try {
// //   //     // Create test first
// //   //     const testResponse = await teacherAPI.createTest({
// //   //       chapter: chapterId,
// //   //       ...testData
// //   //     });

// //   //     const testId = testResponse.data.id;

// //   //     // Add questions
// //   //     for (const question of questions) {
// //   //       const formData = new FormData();
// //   //       formData.append('test', testId);
// //   //       formData.append('question_text', question.question_text);
// //   //       if (question.question_image) {
// //   //         formData.append('question_image', question.question_image);
// //   //       }
// //   //       if (testData.type === 'mcq') {
// //   //         formData.append('option1', question.option1);
// //   //         formData.append('option2', question.option2);
// //   //         formData.append('option3', question.option3);
// //   //         formData.append('option4', question.option4);
// //   //         formData.append('correct_option', question.correct_option);
// //   //       }
// //   //       formData.append('explanation', question.explanation);

// //   //       await teacherAPI.createQuestion(formData);
// //   //     }

// //   //     toast.success('Test created successfully!');
// //   //     navigate(`/teacher/test/${testId}/manage`);
// //   //   } catch (error) {
// //   //     console.error('Failed to create test:', error);
// //   //     toast.error('Failed to create test');
// //   //   } finally {
// //   //     setSubmitting(false);
// //   //   }
// //   // };


// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     // Validation
// //     if (questions.length === 0) {
// //       toast.error('Please add at least one question');
// //       return;
// //     }

// //     // Validate MCQ questions
// //     if (testData.type === 'mcq') {
// //       for (let i = 0; i < questions.length; i++) {
// //         const q = questions[i];
// //         if (!q.option1 || !q.option2 || !q.option3 || !q.option4) {
// //           toast.error(`Question ${i + 1} must have all 4 options filled`);
// //           return;
// //         }
// //       }
// //     }

// //     setSubmitting(true);
// //     try {
// //       // Create test first
// //       console.log('Sending test data:', {
// //         chapter: chapterId,
// //         ...testData
// //       });
      
// //       const testResponse = await teacherAPI.createTest({
// //         chapter: chapterId,
// //         ...testData
// //       });

// //       console.log('Full API Response:', testResponse);
// //       console.log('Response data:', testResponse.data);
      
// //       // Try to get test ID from different possible locations
// //       let testId = testResponse.data?.id || testResponse.data?.test?.id || testResponse.id;
      
// //       console.log('Extracted Test ID:', testId);

// //       // Check if testId is valid
// //       if (!testId) {
// //         toast.error('Failed to get test ID from response');
// //         console.error('Full response structure:', JSON.stringify(testResponse, null, 2));
// //         setSubmitting(false);
// //         return;
// //       }

// //       // Add questions one by one
// //       for (const question of questions) {
// //         const formData = new FormData();
// //         formData.append('test', testId);
// //         formData.append('question_text', question.question_text);
        
// //         if (question.question_image) {
// //           formData.append('question_image', question.question_image);
// //         }
        
// //         if (testData.type === 'mcq') {
// //           formData.append('option1', question.option1 || '');
// //           formData.append('option2', question.option2 || '');
// //           formData.append('option3', question.option3 || '');
// //           formData.append('option4', question.option4 || '');
// //           formData.append('correct_option', question.correct_option);
// //         }
        
// //         formData.append('explanation', question.explanation || '');

// //         console.log('Creating question:', question);
// //         // await teacherAPI.createQuestion(formData);
// //         // await teacherAPI.createQuestion(testId, formData);  // Add testId parameter
// //         await teacherAPI.createQuestion(formData);
// //       }

// //       toast.success('Test created successfully!');
// //       navigate(`/teacher/tests`);
// //     } catch (error) {
// //       console.error('Failed to create test:', error);
// //       console.error('Error response:', error.response);
// //       console.error('Error details:', error.response?.data);
      
// //       // Show specific error message
// //       if (error.response?.data?.error) {
// //         toast.error(error.response.data.error);
// //       } else if (error.response?.data?.details) {
// //         toast.error(error.response.data.details);
// //       } else {
// //         toast.error('Failed to create test. Please check console for details.');
// //       }
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   return (
// //     <DashboardLayout>
// //       <div className="p-6 max-w-4xl mx-auto">
// //         {/* Header */}
// //         <div className="flex items-center space-x-4 mb-8">
// //           <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
// //             <HiArrowLeft className="w-4 h-4 mr-2" />
// //             Back
// //           </Button>
// //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// //             Create New Test
// //           </h1>
// //         </div>

// //         <form onSubmit={handleSubmit} className="space-y-6">
// //           {/* Test Details */}
// //           <Card className="bg-white dark:bg-gray-800">
// //             <div className="p-6 space-y-4">
// //               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
// //                 Test Details
// //               </h2>

// //               <div>
// //                 <label htmlFor="test-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                   Test Name *
// //                 </label>
// //                 <input
// //                   id="test-name"
// //                   name="test-name"
// //                   type="text"
// //                   value={testData.name}
// //                   onChange={(e) => setTestData({ ...testData, name: e.target.value })}
// //                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                   required
// //                 />
// //               </div>

// //               <div>
// //                 <label htmlFor="test-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                   Description
// //                 </label>
// //                 <textarea
// //                   id="test-description"
// //                   name="test-description"
// //                   value={testData.description}
// //                   onChange={(e) => setTestData({ ...testData, description: e.target.value })}
// //                   rows={3}
// //                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                 />
// //               </div>

// //               <div className="grid grid-cols-3 gap-4">
// //                 <div>
// //                   <label htmlFor="test-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                     Test Type *
// //                   </label>
// //                   <select
// //                     id="test-type"
// //                     name="test-type"
// //                     value={testData.type}
// //                     onChange={(e) => setTestData({ ...testData, type: e.target.value })}
// //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                   >
// //                     <option value="mcq">MCQ</option>
// //                     <option value="descriptive">Descriptive</option>
// //                   </select>
// //                 </div>

// //                 <div>
// //                   <label htmlFor="test-marks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                     Total Marks *
// //                   </label>
// //                   <input
// //                     id="test-marks"
// //                     name="test-marks"
// //                     type="number"
// //                     value={testData.marks}
// //                     onChange={(e) => setTestData({ ...testData, marks: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
// //                     min="1"
// //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                     required
// //                   />
// //                 </div>

// //                 <div>
// //                   <label htmlFor="test-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                     Duration (minutes) *
// //                   </label>
// //                   <input
// //                     id="test-duration"
// //                     name="test-duration"
// //                     type="number"
// //                     value={testData.duration_minutes}
// //                     onChange={(e) => setTestData({ ...testData, duration_minutes: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
// //                     min="1"
// //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                     required
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </Card>

// //           {/* Questions */}
// //           <div>
// //             <div className="flex items-center justify-between mb-4">
// //               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
// //                 Questions ({questions.length})
// //               </h2>
// //               <Button type="button" variant="primary" onClick={addQuestion}>
// //                 <HiPlus className="w-5 h-5 mr-2" />
// //                 Add Question
// //               </Button>
// //             </div>

// //             {questions.length === 0 ? (
// //               <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// //                 <p className="text-gray-600 dark:text-gray-400">
// //                   No questions added yet. Click "Add Question" to start.
// //                 </p>
// //               </Card>
// //             ) : (
// //               <div className="space-y-4">
// //                 {questions.map((question, index) => (
// //                   <Card key={question.id} className="bg-white dark:bg-gray-800">
// //                     <div className="p-6">
// //                       <div className="flex items-center justify-between mb-4">
// //                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// //                           Question {index + 1}
// //                         </h3>
// //                         <Button
// //                           type="button"
// //                           variant="danger"
// //                           size="sm"
// //                           onClick={() => removeQuestion(question.id)}
// //                         >
// //                           <HiTrash className="w-4 h-4" />
// //                         </Button>
// //                       </div>

// //                       <div className="space-y-4">
// //                         <div>
// //                           <label htmlFor={`question-text-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                             Question Text *
// //                           </label>
// //                           <textarea
// //                             id={`question-text-${question.id}`}
// //                             name={`question-text-${question.id}`}
// //                             value={question.question_text}
// //                             onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
// //                             rows={3}
// //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>

// //                         <div>
// //                           <label htmlFor={`question-image-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                             Question Image (Optional)
// //                           </label>
// //                           <input
// //                             id={`question-image-${question.id}`}
// //                             name={`question-image-${question.id}`}
// //                             type="file"
// //                             accept="image/*"
// //                             onChange={(e) => handleImageChange(question.id, e.target.files[0])}
// //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                           />
// //                         </div>

// //                         {testData.type === 'mcq' && (
// //                           <>
// //                             {[1, 2, 3, 4].map((num) => (
// //                               <div key={num}>
// //                                 <label htmlFor={`option${num}-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                                   Option {num} *
// //                                 </label>
// //                                 <input
// //                                   id={`option${num}-${question.id}`}
// //                                   name={`option${num}-${question.id}`}
// //                                   type="text"
// //                                   value={question[`option${num}`]}
// //                                   onChange={(e) => updateQuestion(question.id, `option${num}`, e.target.value)}
// //                                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                                   required
// //                                 />
// //                               </div>
// //                             ))}

// //                             <div>
// //                               <label htmlFor={`correct-option-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                                 Correct Option *
// //                               </label>
// //                               <select
// //                                 id={`correct-option-${question.id}`}
// //                                 name={`correct-option-${question.id}`}
// //                                 value={question.correct_option}
// //                                 onChange={(e) => updateQuestion(question.id, 'correct_option', parseInt(e.target.value))}
// //                                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                                 required
// //                               >
// //                                 <option value={1}>Option 1</option>
// //                                 <option value={2}>Option 2</option>
// //                                 <option value={3}>Option 3</option>
// //                                 <option value={4}>Option 4</option>
// //                               </select>
// //                             </div>
// //                           </>
// //                         )}

// //                         <div>
// //                           <label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                             Explanation (Optional)
// //                           </label>
// //                           <textarea
// //                             id={`explanation-${question.id}`}
// //                             name={`explanation-${question.id}`}
// //                             value={question.explanation}
// //                             onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
// //                             rows={2}
// //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                           />
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </Card>
// //                 ))}
// //               </div>
// //             )}
// //           </div>

// //           {/* Submit */}
// //           <div className="flex justify-end space-x-4">
// //             <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
// //               Cancel
// //             </Button>
// //             <Button type="submit" variant="primary" disabled={submitting || questions.length === 0}>
// //               {submitting ? 'Creating...' : 'Create Test'}
// //             </Button>
// //           </div>
// //         </form>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default CreateTest;

















































// // // import { useState, useEffect } from 'react';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { HiArrowLeft, HiPlus, HiTrash } from 'react-icons/hi';
// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // import Card from '../../components/common/Card';
// // // import Button from '../../components/common/Button';
// // // import { teacherAPI } from '../../services/api';
// // // import toast from 'react-hot-toast';

// // // const CreateTest = () => {
// // //   const { chapterId } = useParams();
// // //   const navigate = useNavigate();
// // //   const [testData, setTestData] = useState({
// // //     name: '',
// // //     description: '',
// // //     type: 'mcq',
// // //     marks: 10,
// // //     duration_minutes: 30
// // //   });
// // //   const [questions, setQuestions] = useState([]);
// // //   const [submitting, setSubmitting] = useState(false);

// // //   const addQuestion = () => {
// // //     const newQuestion = {
// // //       id: Date.now(),
// // //       question_text: '',
// // //       question_image: null,
// // //       option1: '',
// // //       option2: '',
// // //       option3: '',
// // //       option4: '',
// // //       correct_option: 1,
// // //       explanation: ''
// // //     };
// // //     setQuestions([...questions, newQuestion]);
// // //   };

// // //   const updateQuestion = (id, field, value) => {
// // //     setQuestions(questions.map(q => 
// // //       q.id === id ? { ...q, [field]: value } : q
// // //     ));
// // //   };

// // //   const removeQuestion = (id) => {
// // //     setQuestions(questions.filter(q => q.id !== id));
// // //   };

// // //   const handleImageChange = (id, file) => {
// // //     setQuestions(questions.map(q => 
// // //       q.id === id ? { ...q, question_image: file } : q
// // //     ));
// // //   };
  

// // //   // const handleSubmit = async (e) => {
// // //   //   e.preventDefault();
    
// // //   //   if (questions.length === 0) {
// // //   //     toast.error('Please add at least one question');
// // //   //     return;
// // //   //   }

// // //   //   setSubmitting(true);
// // //   //   try {
// // //   //     // Create test first
// // //   //     const testResponse = await teacherAPI.createTest({
// // //   //       chapter: chapterId,
// // //   //       ...testData
// // //   //     });

// // //   //     const testId = testResponse.data.id;

// // //   //     // Add questions
// // //   //     for (const question of questions) {
// // //   //       const formData = new FormData();
// // //   //       formData.append('test', testId);
// // //   //       formData.append('question_text', question.question_text);
// // //   //       if (question.question_image) {
// // //   //         formData.append('question_image', question.question_image);
// // //   //       }
// // //   //       if (testData.type === 'mcq') {
// // //   //         formData.append('option1', question.option1);
// // //   //         formData.append('option2', question.option2);
// // //   //         formData.append('option3', question.option3);
// // //   //         formData.append('option4', question.option4);
// // //   //         formData.append('correct_option', question.correct_option);
// // //   //       }
// // //   //       formData.append('explanation', question.explanation);

// // //   //       await teacherAPI.createQuestion(formData);
// // //   //     }

// // //   //     toast.success('Test created successfully!');
// // //   //     navigate(`/teacher/test/${testId}/manage`);
// // //   //   } catch (error) {
// // //   //     console.error('Failed to create test:', error);
// // //   //     toast.error('Failed to create test');
// // //   //   } finally {
// // //   //     setSubmitting(false);
// // //   //   }
// // //   // };


// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
    
// // //     // Validation
// // //     if (questions.length === 0) {
// // //       toast.error('Please add at least one question');
// // //       return;
// // //     }

// // //     // Validate MCQ questions
// // //     if (testData.type === 'mcq') {
// // //       for (let i = 0; i < questions.length; i++) {
// // //         const q = questions[i];
// // //         if (!q.option1 || !q.option2 || !q.option3 || !q.option4) {
// // //           toast.error(`Question ${i + 1} must have all 4 options filled`);
// // //           return;
// // //         }
// // //       }
// // //     }

// // //     setSubmitting(true);
// // //     try {
// // //       // Create test first
// // //       console.log('Sending test data:', {
// // //         chapter: chapterId,
// // //         ...testData
// // //       });
      
// // //       const testResponse = await teacherAPI.createTest({
// // //         chapter: chapterId,
// // //         ...testData
// // //       });

// // //       console.log('Full API Response:', testResponse);
// // //       console.log('Response data:', testResponse.data);
      
// // //       // Try to get test ID from different possible locations
// // //       let testId = testResponse.data?.id || testResponse.data?.test?.id || testResponse.id;
      
// // //       console.log('Extracted Test ID:', testId);

// // //       // Check if testId is valid
// // //       if (!testId) {
// // //         toast.error('Failed to get test ID from response');
// // //         console.error('Full response structure:', JSON.stringify(testResponse, null, 2));
// // //         setSubmitting(false);
// // //         return;
// // //       }

// // //       // Add questions one by one
// // //       for (const question of questions) {
// // //         const formData = new FormData();
// // //         formData.append('test', testId);
// // //         formData.append('question_text', question.question_text);
        
// // //         if (question.question_image) {
// // //           formData.append('question_image', question.question_image);
// // //         }
        
// // //         if (testData.type === 'mcq') {
// // //           formData.append('option1', question.option1 || '');
// // //           formData.append('option2', question.option2 || '');
// // //           formData.append('option3', question.option3 || '');
// // //           formData.append('option4', question.option4 || '');
// // //           formData.append('correct_option', question.correct_option);
// // //         }
        
// // //         formData.append('explanation', question.explanation || '');

// // //         console.log('Creating question:', question);
// // //         // await teacherAPI.createQuestion(formData);
// // //         // await teacherAPI.createQuestion(testId, formData);  // Add testId parameter
// // //         await teacherAPI.createQuestion(formData);
// // //       }

// // //       toast.success('Test created successfully!');
// // //       navigate(`/teacher/tests`);
// // //     } catch (error) {
// // //       console.error('Failed to create test:', error);
// // //       console.error('Error response:', error.response);
// // //       console.error('Error details:', error.response?.data);
      
// // //       // Show specific error message
// // //       if (error.response?.data?.error) {
// // //         toast.error(error.response.data.error);
// // //       } else if (error.response?.data?.details) {
// // //         toast.error(error.response.data.details);
// // //       } else {
// // //         toast.error('Failed to create test. Please check console for details.');
// // //       }
// // //     } finally {
// // //       setSubmitting(false);
// // //     }
// // //   };

// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6 max-w-4xl mx-auto">
// // //         {/* Header */}
// // //         <div className="flex items-center space-x-4 mb-8">
// // //           <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
// // //             <HiArrowLeft className="w-4 h-4 mr-2" />
// // //             Back
// // //           </Button>
// // //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // //             Create New Test
// // //           </h1>
// // //         </div>

// // //         <form onSubmit={handleSubmit} className="space-y-6">
// // //           {/* Test Details */}
// // //           <Card className="bg-white dark:bg-gray-800">
// // //             <div className="p-6 space-y-4">
// // //               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
// // //                 Test Details
// // //               </h2>

// // //               <div>
// // //                 <label htmlFor="test-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                   Test Name *
// // //                 </label>
// // //                 <input
// // //                   id="test-name"
// // //                   name="test-name"
// // //                   type="text"
// // //                   value={testData.name}
// // //                   onChange={(e) => setTestData({ ...testData, name: e.target.value })}
// // //                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                   required
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label htmlFor="test-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                   Description
// // //                 </label>
// // //                 <textarea
// // //                   id="test-description"
// // //                   name="test-description"
// // //                   value={testData.description}
// // //                   onChange={(e) => setTestData({ ...testData, description: e.target.value })}
// // //                   rows={3}
// // //                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                 />
// // //               </div>

// // //               <div className="grid grid-cols-3 gap-4">
// // //                 <div>
// // //                   <label htmlFor="test-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                     Test Type *
// // //                   </label>
// // //                   <select
// // //                     id="test-type"
// // //                     name="test-type"
// // //                     value={testData.type}
// // //                     onChange={(e) => setTestData({ ...testData, type: e.target.value })}
// // //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                   >
// // //                     <option value="mcq">MCQ</option>
// // //                     <option value="descriptive">Descriptive</option>
// // //                   </select>
// // //                 </div>

// // //                 <div>
// // //                   <label htmlFor="test-marks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                     Total Marks *
// // //                   </label>
// // //                   <input
// // //                     id="test-marks"
// // //                     name="test-marks"
// // //                     type="number"
// // //                     value={testData.marks}
// // //                     onChange={(e) => setTestData({ ...testData, marks: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
// // //                     min="1"
// // //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                     required
// // //                   />
// // //                 </div>

// // //                 <div>
// // //                   <label htmlFor="test-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                     Duration (minutes) *
// // //                   </label>
// // //                   <input
// // //                     id="test-duration"
// // //                     name="test-duration"
// // //                     type="number"
// // //                     value={testData.duration_minutes}
// // //                     onChange={(e) => setTestData({ ...testData, duration_minutes: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
// // //                     min="1"
// // //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                     required
// // //                   />
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </Card>

// // //           {/* Questions */}
// // //           <div>
// // //             <div className="flex items-center justify-between mb-4">
// // //               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
// // //                 Questions ({questions.length})
// // //               </h2>
// // //               <Button type="button" variant="primary" onClick={addQuestion}>
// // //                 <HiPlus className="w-5 h-5 mr-2" />
// // //                 Add Question
// // //               </Button>
// // //             </div>

// // //             {questions.length === 0 ? (
// // //               <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// // //                 <p className="text-gray-600 dark:text-gray-400">
// // //                   No questions added yet. Click "Add Question" to start.
// // //                 </p>
// // //               </Card>
// // //             ) : (
// // //               <div className="space-y-4">
// // //                 {questions.map((question, index) => (
// // //                   <Card key={question.id} className="bg-white dark:bg-gray-800">
// // //                     <div className="p-6">
// // //                       <div className="flex items-center justify-between mb-4">
// // //                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// // //                           Question {index + 1}
// // //                         </h3>
// // //                         <Button
// // //                           type="button"
// // //                           variant="danger"
// // //                           size="sm"
// // //                           onClick={() => removeQuestion(question.id)}
// // //                         >
// // //                           <HiTrash className="w-4 h-4" />
// // //                         </Button>
// // //                       </div>

// // //                       <div className="space-y-4">
// // //                         <div>
// // //                           <label htmlFor={`question-text-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                             Question Text *
// // //                           </label>
// // //                           <textarea
// // //                             id={`question-text-${question.id}`}
// // //                             name={`question-text-${question.id}`}
// // //                             value={question.question_text}
// // //                             onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
// // //                             rows={3}
// // //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                             required
// // //                           />
// // //                         </div>

// // //                         <div>
// // //                           <label htmlFor={`question-image-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                             Question Image (Optional)
// // //                           </label>
// // //                           <input
// // //                             id={`question-image-${question.id}`}
// // //                             name={`question-image-${question.id}`}
// // //                             type="file"
// // //                             accept="image/*"
// // //                             onChange={(e) => handleImageChange(question.id, e.target.files[0])}
// // //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                           />
// // //                         </div>

// // //                         {testData.type === 'mcq' && (
// // //                           <>
// // //                             {[1, 2, 3, 4].map((num) => (
// // //                               <div key={num}>
// // //                                 <label htmlFor={`option${num}-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                                   Option {num} *
// // //                                 </label>
// // //                                 <input
// // //                                   id={`option${num}-${question.id}`}
// // //                                   name={`option${num}-${question.id}`}
// // //                                   type="text"
// // //                                   value={question[`option${num}`]}
// // //                                   onChange={(e) => updateQuestion(question.id, `option${num}`, e.target.value)}
// // //                                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                                   required
// // //                                 />
// // //                               </div>
// // //                             ))}

// // //                             <div>
// // //                               <label htmlFor={`correct-option-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                                 Correct Option *
// // //                               </label>
// // //                               <select
// // //                                 id={`correct-option-${question.id}`}
// // //                                 name={`correct-option-${question.id}`}
// // //                                 value={question.correct_option}
// // //                                 onChange={(e) => updateQuestion(question.id, 'correct_option', parseInt(e.target.value))}
// // //                                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                                 required
// // //                               >
// // //                                 <option value={1}>Option 1</option>
// // //                                 <option value={2}>Option 2</option>
// // //                                 <option value={3}>Option 3</option>
// // //                                 <option value={4}>Option 4</option>
// // //                               </select>
// // //                             </div>
// // //                           </>
// // //                         )}

// // //                         <div>
// // //                           <label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                             Explanation (Optional)
// // //                           </label>
// // //                           <textarea
// // //                             id={`explanation-${question.id}`}
// // //                             name={`explanation-${question.id}`}
// // //                             value={question.explanation}
// // //                             onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
// // //                             rows={2}
// // //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // //                           />
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                   </Card>
// // //                 ))}
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* Submit */}
// // //           <div className="flex justify-end space-x-4">
// // //             <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
// // //               Cancel
// // //             </Button>
// // //             <Button type="submit" variant="primary" disabled={submitting || questions.length === 0}>
// // //               {submitting ? 'Creating...' : 'Create Test'}
// // //             </Button>
// // //           </div>
// // //         </form>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // };

// // // export default CreateTest;



























// // // // import { useState, useEffect } from 'react';
// // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // import { HiArrowLeft, HiPlus, HiTrash } from 'react-icons/hi';
// // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // import Card from '../../components/common/Card';
// // // // import Button from '../../components/common/Button';
// // // // import { teacherAPI } from '../../services/api';
// // // // import toast from 'react-hot-toast';

// // // // const CreateTest = () => {
// // // //   const { chapterId } = useParams();
// // // //   const navigate = useNavigate();
// // // //   const [testData, setTestData] = useState({
// // // //     name: '',
// // // //     description: '',
// // // //     type: 'mcq',
// // // //     marks: 10,
// // // //     duration_minutes: 30
// // // //   });
// // // //   const [questions, setQuestions] = useState([]);
// // // //   const [submitting, setSubmitting] = useState(false);

// // // //   const addQuestion = () => {
// // // //     const newQuestion = {
// // // //       id: Date.now(),
// // // //       question_text: '',
// // // //       question_image: null,
// // // //       option1: '',
// // // //       option2: '',
// // // //       option3: '',
// // // //       option4: '',
// // // //       correct_option: 1,
// // // //       explanation: ''
// // // //     };
// // // //     setQuestions([...questions, newQuestion]);
// // // //   };

// // // //   const updateQuestion = (id, field, value) => {
// // // //     setQuestions(questions.map(q => 
// // // //       q.id === id ? { ...q, [field]: value } : q
// // // //     ));
// // // //   };

// // // //   const removeQuestion = (id) => {
// // // //     setQuestions(questions.filter(q => q.id !== id));
// // // //   };

// // // //   const handleImageChange = (id, file) => {
// // // //     setQuestions(questions.map(q => 
// // // //       q.id === id ? { ...q, question_image: file } : q
// // // //     ));
// // // //   };
  

// // // //   // const handleSubmit = async (e) => {
// // // //   //   e.preventDefault();
    
// // // //   //   if (questions.length === 0) {
// // // //   //     toast.error('Please add at least one question');
// // // //   //     return;
// // // //   //   }

// // // //   //   setSubmitting(true);
// // // //   //   try {
// // // //   //     // Create test first
// // // //   //     const testResponse = await teacherAPI.createTest({
// // // //   //       chapter: chapterId,
// // // //   //       ...testData
// // // //   //     });

// // // //   //     const testId = testResponse.data.id;

// // // //   //     // Add questions
// // // //   //     for (const question of questions) {
// // // //   //       const formData = new FormData();
// // // //   //       formData.append('test', testId);
// // // //   //       formData.append('question_text', question.question_text);
// // // //   //       if (question.question_image) {
// // // //   //         formData.append('question_image', question.question_image);
// // // //   //       }
// // // //   //       if (testData.type === 'mcq') {
// // // //   //         formData.append('option1', question.option1);
// // // //   //         formData.append('option2', question.option2);
// // // //   //         formData.append('option3', question.option3);
// // // //   //         formData.append('option4', question.option4);
// // // //   //         formData.append('correct_option', question.correct_option);
// // // //   //       }
// // // //   //       formData.append('explanation', question.explanation);

// // // //   //       await teacherAPI.createQuestion(formData);
// // // //   //     }

// // // //   //     toast.success('Test created successfully!');
// // // //   //     navigate(`/teacher/test/${testId}/manage`);
// // // //   //   } catch (error) {
// // // //   //     console.error('Failed to create test:', error);
// // // //   //     toast.error('Failed to create test');
// // // //   //   } finally {
// // // //   //     setSubmitting(false);
// // // //   //   }
// // // //   // };


// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();
    
// // // //     // Validation
// // // //     if (questions.length === 0) {
// // // //       toast.error('Please add at least one question');
// // // //       return;
// // // //     }

// // // //     // Validate MCQ questions
// // // //     if (testData.type === 'mcq') {
// // // //       for (let i = 0; i < questions.length; i++) {
// // // //         const q = questions[i];
// // // //         if (!q.option1 || !q.option2 || !q.option3 || !q.option4) {
// // // //           toast.error(`Question ${i + 1} must have all 4 options filled`);
// // // //           return;
// // // //         }
// // // //       }
// // // //     }

// // // //     setSubmitting(true);
// // // //     try {
// // // //       // Create test first
// // // //       console.log('Sending test data:', {
// // // //         chapter: chapterId,
// // // //         ...testData
// // // //       });
      
// // // //       const testResponse = await teacherAPI.createTest({
// // // //         chapter: chapterId,
// // // //         ...testData
// // // //       });

// // // //       console.log('Full API Response:', testResponse);
// // // //       console.log('Response data:', testResponse.data);
      
// // // //       // Try to get test ID from different possible locations
// // // //       let testId = testResponse.data?.id || testResponse.data?.test?.id || testResponse.id;
      
// // // //       console.log('Extracted Test ID:', testId);

// // // //       // Check if testId is valid
// // // //       if (!testId) {
// // // //         toast.error('Failed to get test ID from response');
// // // //         console.error('Full response structure:', JSON.stringify(testResponse, null, 2));
// // // //         setSubmitting(false);
// // // //         return;
// // // //       }

// // // //       // Add questions one by one
// // // //       for (const question of questions) {
// // // //         const formData = new FormData();
// // // //         formData.append('test', testId);
// // // //         formData.append('question_text', question.question_text);
        
// // // //         if (question.question_image) {
// // // //           formData.append('question_image', question.question_image);
// // // //         }
        
// // // //         if (testData.type === 'mcq') {
// // // //           formData.append('option1', question.option1 || '');
// // // //           formData.append('option2', question.option2 || '');
// // // //           formData.append('option3', question.option3 || '');
// // // //           formData.append('option4', question.option4 || '');
// // // //           formData.append('correct_option', question.correct_option);
// // // //         }
        
// // // //         formData.append('explanation', question.explanation || '');

// // // //         console.log('Creating question:', question);
// // // //         // await teacherAPI.createQuestion(formData);
// // // //         await teacherAPI.createQuestion(testId, formData);  // Add testId parameter
// // // //       }

// // // //       toast.success('Test created successfully!');
// // // //       navigate(`/teacher/tests`);
// // // //     } catch (error) {
// // // //       console.error('Failed to create test:', error);
// // // //       console.error('Error response:', error.response);
// // // //       console.error('Error details:', error.response?.data);
      
// // // //       // Show specific error message
// // // //       if (error.response?.data?.error) {
// // // //         toast.error(error.response.data.error);
// // // //       } else if (error.response?.data?.details) {
// // // //         toast.error(error.response.data.details);
// // // //       } else {
// // // //         toast.error('Failed to create test. Please check console for details.');
// // // //       }
// // // //     } finally {
// // // //       setSubmitting(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <DashboardLayout>
// // // //       <div className="p-6 max-w-4xl mx-auto">
// // // //         {/* Header */}
// // // //         <div className="flex items-center space-x-4 mb-8">
// // // //           <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
// // // //             <HiArrowLeft className="w-4 h-4 mr-2" />
// // // //             Back
// // // //           </Button>
// // // //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // // //             Create New Test
// // // //           </h1>
// // // //         </div>

// // // //         <form onSubmit={handleSubmit} className="space-y-6">
// // // //           {/* Test Details */}
// // // //           <Card className="bg-white dark:bg-gray-800">
// // // //             <div className="p-6 space-y-4">
// // // //               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
// // // //                 Test Details
// // // //               </h2>

// // // //               <div>
// // // //                 <label htmlFor="test-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                   Test Name *
// // // //                 </label>
// // // //                 <input
// // // //                   id="test-name"
// // // //                   name="test-name"
// // // //                   type="text"
// // // //                   value={testData.name}
// // // //                   onChange={(e) => setTestData({ ...testData, name: e.target.value })}
// // // //                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                   required
// // // //                 />
// // // //               </div>

// // // //               <div>
// // // //                 <label htmlFor="test-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                   Description
// // // //                 </label>
// // // //                 <textarea
// // // //                   id="test-description"
// // // //                   name="test-description"
// // // //                   value={testData.description}
// // // //                   onChange={(e) => setTestData({ ...testData, description: e.target.value })}
// // // //                   rows={3}
// // // //                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                 />
// // // //               </div>

// // // //               <div className="grid grid-cols-3 gap-4">
// // // //                 <div>
// // // //                   <label htmlFor="test-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                     Test Type *
// // // //                   </label>
// // // //                   <select
// // // //                     id="test-type"
// // // //                     name="test-type"
// // // //                     value={testData.type}
// // // //                     onChange={(e) => setTestData({ ...testData, type: e.target.value })}
// // // //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                   >
// // // //                     <option value="mcq">MCQ</option>
// // // //                     <option value="descriptive">Descriptive</option>
// // // //                   </select>
// // // //                 </div>

// // // //                 <div>
// // // //                   <label htmlFor="test-marks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                     Total Marks *
// // // //                   </label>
// // // //                   <input
// // // //                     id="test-marks"
// // // //                     name="test-marks"
// // // //                     type="number"
// // // //                     value={testData.marks}
// // // //                     onChange={(e) => setTestData({ ...testData, marks: parseInt(e.target.value) })}
// // // //                     min="1"
// // // //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                     required
// // // //                   />
// // // //                 </div>

// // // //                 <div>
// // // //                   <label htmlFor="test-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                     Duration (minutes) *
// // // //                   </label>
// // // //                   <input
// // // //                     id="test-duration"
// // // //                     name="test-duration"
// // // //                     type="number"
// // // //                     value={testData.duration_minutes}
// // // //                     onChange={(e) => setTestData({ ...testData, duration_minutes: parseInt(e.target.value) })}
// // // //                     min="1"
// // // //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                     required
// // // //                   />
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </Card>

// // // //           {/* Questions */}
// // // //           <div>
// // // //             <div className="flex items-center justify-between mb-4">
// // // //               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
// // // //                 Questions ({questions.length})
// // // //               </h2>
// // // //               <Button type="button" variant="primary" onClick={addQuestion}>
// // // //                 <HiPlus className="w-5 h-5 mr-2" />
// // // //                 Add Question
// // // //               </Button>
// // // //             </div>

// // // //             {questions.length === 0 ? (
// // // //               <Card className="bg-white dark:bg-gray-800 p-8 text-center">
// // // //                 <p className="text-gray-600 dark:text-gray-400">
// // // //                   No questions added yet. Click "Add Question" to start.
// // // //                 </p>
// // // //               </Card>
// // // //             ) : (
// // // //               <div className="space-y-4">
// // // //                 {questions.map((question, index) => (
// // // //                   <Card key={question.id} className="bg-white dark:bg-gray-800">
// // // //                     <div className="p-6">
// // // //                       <div className="flex items-center justify-between mb-4">
// // // //                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// // // //                           Question {index + 1}
// // // //                         </h3>
// // // //                         <Button
// // // //                           type="button"
// // // //                           variant="danger"
// // // //                           size="sm"
// // // //                           onClick={() => removeQuestion(question.id)}
// // // //                         >
// // // //                           <HiTrash className="w-4 h-4" />
// // // //                         </Button>
// // // //                       </div>

// // // //                       <div className="space-y-4">
// // // //                         <div>
// // // //                           <label htmlFor={`question-text-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                             Question Text *
// // // //                           </label>
// // // //                           <textarea
// // // //                             id={`question-text-${question.id}`}
// // // //                             name={`question-text-${question.id}`}
// // // //                             value={question.question_text}
// // // //                             onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
// // // //                             rows={3}
// // // //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                             required
// // // //                           />
// // // //                         </div>

// // // //                         <div>
// // // //                           <label htmlFor={`question-image-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                             Question Image (Optional)
// // // //                           </label>
// // // //                           <input
// // // //                             id={`question-image-${question.id}`}
// // // //                             name={`question-image-${question.id}`}
// // // //                             type="file"
// // // //                             accept="image/*"
// // // //                             onChange={(e) => handleImageChange(question.id, e.target.files[0])}
// // // //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                           />
// // // //                         </div>

// // // //                         {testData.type === 'mcq' && (
// // // //                           <>
// // // //                             {[1, 2, 3, 4].map((num) => (
// // // //                               <div key={num}>
// // // //                                 <label htmlFor={`option${num}-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                                   Option {num} *
// // // //                                 </label>
// // // //                                 <input
// // // //                                   id={`option${num}-${question.id}`}
// // // //                                   name={`option${num}-${question.id}`}
// // // //                                   type="text"
// // // //                                   value={question[`option${num}`]}
// // // //                                   onChange={(e) => updateQuestion(question.id, `option${num}`, e.target.value)}
// // // //                                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                                   required
// // // //                                 />
// // // //                               </div>
// // // //                             ))}

// // // //                             <div>
// // // //                               <label htmlFor={`correct-option-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                                 Correct Option *
// // // //                               </label>
// // // //                               <select
// // // //                                 id={`correct-option-${question.id}`}
// // // //                                 name={`correct-option-${question.id}`}
// // // //                                 value={question.correct_option}
// // // //                                 onChange={(e) => updateQuestion(question.id, 'correct_option', parseInt(e.target.value))}
// // // //                                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                                 required
// // // //                               >
// // // //                                 <option value={1}>Option 1</option>
// // // //                                 <option value={2}>Option 2</option>
// // // //                                 <option value={3}>Option 3</option>
// // // //                                 <option value={4}>Option 4</option>
// // // //                               </select>
// // // //                             </div>
// // // //                           </>
// // // //                         )}

// // // //                         <div>
// // // //                           <label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                             Explanation (Optional)
// // // //                           </label>
// // // //                           <textarea
// // // //                             id={`explanation-${question.id}`}
// // // //                             name={`explanation-${question.id}`}
// // // //                             value={question.explanation}
// // // //                             onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
// // // //                             rows={2}
// // // //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                           />
// // // //                         </div>
// // // //                       </div>
// // // //                     </div>
// // // //                   </Card>
// // // //                 ))}
// // // //               </div>
// // // //             )}
// // // //           </div>

// // // //           {/* Submit */}
// // // //           <div className="flex justify-end space-x-4">
// // // //             <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
// // // //               Cancel
// // // //             </Button>
// // // //             <Button type="submit" variant="primary" disabled={submitting || questions.length === 0}>
// // // //               {submitting ? 'Creating...' : 'Create Test'}
// // // //             </Button>
// // // //           </div>
// // // //         </form>
// // // //       </div>
// // // //     </DashboardLayout>
// // // //   );
// // // // };

// // // // export default CreateTest;


