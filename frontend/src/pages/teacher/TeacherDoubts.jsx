import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiQuestionMarkCircle, HiReply, HiFilter } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// TeacherDoubts
//
// API FLOW:
//   1. On mount          → GET /api/teachers/classes/
//   2. On class select   → GET /api/teachers/class/<id>/subjects/
//                        → GET /api/teachers/doubts/?class_id=<id>
//   3. On subject select → GET /api/teachers/doubts/?class_id=&subject_id=
//   4. On reply submit   → POST /api/teachers/doubts/<id>/reply/
//
// WHY single-effect pattern (not 3 separate effects):
//   React state updates are async. If useEffect A sets selectedSubject=''
//   and useEffect B watches selectedSubject, B fires with the OLD selectedClass
//   value. This causes double-fetches with stale data. Using ONE effect
//   that watches [selectedClass, selectedSubject] together fixes this entirely.
// ─────────────────────────────────────────────────────────────────────────────

const TeacherDoubts = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [classes,         setClasses]         = useState([]);
  const [subjects,        setSubjects]        = useState([]);
  const [doubts,          setDoubts]          = useState([]);

  const [pageLoading,     setPageLoading]     = useState(true);
  const [doubtsLoading,   setDoubtsLoading]   = useState(false);

  const [selectedClass,   setSelectedClass]   = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [replyingTo,      setReplyingTo]      = useState(null);
  const [replyText,       setReplyText]       = useState('');
  const [replyImage,      setReplyImage]      = useState(null);
  const [replySubmitting, setReplySubmitting] = useState(false);

  // ── 1. Initial load — fetch classes once ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setPageLoading(true);
        console.log('🔄 Fetching teacher classes...');
        const response = await teacherAPI.getClasses();
        console.log('✅ Classes response:', response.data);
        setClasses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('❌ Failed to load classes:', error?.response?.status, error?.message);
        toast.error('Failed to load classes');
        setClasses([]);
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, []);

  // ── 2. Single effect for class+subject changes ────────────────────────────
  //
  // Both selectors watched together — no stale state problem.
  // When class changes → fetch subjects + doubts for that class.
  // When subject changes → only fetch doubts (subjects stay the same).
  //
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setDoubts([]);
      return;
    }

    // const fetchSubjectsForClass = async () => {
    //   try {
    //     console.log(`🔄 Fetching subjects for class ${selectedClass}...`);
    //     const response = await teacherAPI.getClassSubjects(selectedClass);
    //     console.log('✅ Subjects response:', response.data);
    //     setSubjects(Array.isArray(response.data) ? response.data : []);
    //   } catch (error) {
    //     console.error('❌ Failed to load subjects:', error?.response?.status, error?.message);
    //     setSubjects([]);
    //   }
    // };
    const fetchSubjectsForClass = () => {
  // No API call needed — subjects are already inside classes data
    const selectedClassData = classes.find(c => String(c.id) === String(selectedClass));
    setSubjects(selectedClassData?.subjects || []);
    };

    const fetchDoubtsForSelection = async () => {
      try {
        setDoubtsLoading(true);
        const params = { class_id: selectedClass };
        if (selectedSubject) params.subject_id = selectedSubject;

        console.log('🔄 Fetching doubts with params:', params);
        const response = await teacherAPI.getDoubts(params);
        console.log('✅ Doubts response:', response.data);
        setDoubts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('❌ Failed to load doubts:', error?.response?.status, error?.message);
        toast.error('Failed to load doubts');
        setDoubts([]);
      } finally {
        setDoubtsLoading(false);
      }
    };

    fetchSubjectsForClass();
    fetchDoubtsForSelection();

  }, [selectedClass, selectedSubject]);

  // ── Class dropdown handler ─────────────────────────────────────────────────
  // Reset subject BEFORE setting class so both state updates go into the
  // same render batch → the effect above sees the correct final state.
  const handleClassChange = (e) => {
    const newClassId = e.target.value;
    setSelectedSubject('');
    setSelectedClass(newClassId);
  };

  // ── Reply Submit ───────────────────────────────────────────────────────────
  const handleReplySubmit = async (doubtId) => {
    if (!replyText.trim() && !replyImage) {
      toast.error('Please enter a reply or attach an image');
      return;
    }
    try {
      setReplySubmitting(true);
      const formData = new FormData();
      formData.append('reply_text', replyText.trim());
      // if (replyImage) formData.append('image', replyImage);
      if (replyImage) formData.append('reply_image', replyImage);

      await teacherAPI.replyToDoubt(doubtId, formData);
      toast.success('Reply posted successfully!');

      setReplyingTo(null);
      setReplyText('');
      setReplyImage(null);

      // Refresh doubts to show the new reply inline
      const params = { class_id: selectedClass };
      if (selectedSubject) params.subject_id = selectedSubject;
      const refreshed = await teacherAPI.getDoubts(params);
      setDoubts(Array.isArray(refreshed.data) ? refreshed.data : []);
    } catch (error) {
      console.error('❌ Reply failed:', error);
      toast.error(error.response?.data?.error || 'Failed to post reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
    setReplyImage(null);
  };

  // ── Loading (initial page) ─────────────────────────────────────────────────
  if (pageLoading) return <Loading fullScreen />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/teacher/dashboard">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Student Doubts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and respond to student queries for your subjects
              </p>
            </div>
          </div>

          {/* ── Filter Dropdowns ──────────────────────────────────────── */}
          <div className="flex items-center space-x-3">
            <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />

            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {selectedClass && subjects.length > 0 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ── Content States ─────────────────────────────────────────────── */}

        {classes.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Classes Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven&apos;t been assigned to any class yet. Contact admin to get class assignments.
            </p>
          </Card>

        ) : !selectedClass ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiFilter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select a Class
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a class from the dropdown above to view student doubts.
            </p>
          </Card>

        ) : doubtsLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
          </div>

        ) : doubts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Doubts Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedSubject
                ? 'No doubts posted for this subject yet.'
                : "Students haven't posted any doubts for this class yet."}
            </p>
          </Card>

        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <Card key={doubt.id} className="bg-white dark:bg-gray-800">
                <div className="p-6">

                  {/* Doubt Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {doubt.subject?.name || 'Subject'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          doubt.reply_count > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}>
                          {doubt.reply_count > 0 ? `${doubt.reply_count} Replies` : 'Pending'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Asked by{' '}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {doubt.student?.name || 'Student'}
                        </span>
                        {doubt.student?.unique_id && (
                          <span className="ml-1 text-xs">({doubt.student.unique_id})</span>
                        )}
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 mb-3">{doubt.doubt_text}</p>

                      {/* {doubt.image_url && ( */}
                      {doubt.doubt_image && (  
                        <img
                          src={doubt.doubt_image}
                          alt="Doubt attachment"
                          className="max-w-sm h-auto rounded-lg mb-3 border border-gray-200 dark:border-gray-700"
                        />
                      )}

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Posted {new Date(doubt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Existing Replies */}
                  {doubt.replies && doubt.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Replies:</h4>
                      {doubt.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <HiReply className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {reply.replied_by_name}
                              {reply.replied_by_role === 'teacher' && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded text-xs">
                                  Teacher
                                </span>
                              )}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">{reply.text}</p>
                            {/* {reply.image_url && ( */}
                            {reply.reply_image && (  
                              <img
                                src={reply.image_url}
                                alt="Reply attachment"
                                className="max-w-xs h-auto rounded-lg mt-2 border border-gray-200 dark:border-gray-700"
                              />
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {replyingTo === doubt.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                          placeholder="Write your reply to help the student..."
                          disabled={replySubmitting}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attach Image (Optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setReplyImage(e.target.files[0])}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                            disabled={replySubmitting}
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReplySubmit(doubt.id)}
                            disabled={replySubmitting}
                          >
                            {replySubmitting ? 'Posting...' : 'Post Reply'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelReply}
                            disabled={replySubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setReplyingTo(doubt.id)}
                      >
                        <HiReply className="w-4 h-4 mr-2" />
                        Reply to this doubt
                      </Button>
                    )}
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TeacherDoubts;














































