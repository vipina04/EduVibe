/**
 * TeacherAllTests.jsx
 * Route: /teacher/tests
 * Features:
 *  - View all tests grouped by subject → chapter
 *  - View who attended + scores + stats (modal)
 *  - Edit test name / description / duration (modal)
 *  - Delete test with confirmation
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiChevronDown, HiChevronRight,
  HiClipboardList, HiUsers, HiPencil, HiTrash,
  HiCheckCircle, HiClock, HiX, HiPlus,
} from 'react-icons/hi';

// ─── helpers ──────────────────────────────────────────────────────────────────
const badge = (type) =>
  type === 'mcq'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeacherAllTests() {
  const navigate = useNavigate();
  const [groups,   setGroups]   = useState([]);   // tests_by_subject[]
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState({});   // { subjectId: bool }

  // modals
  const [resultsModal, setResultsModal] = useState(null);  // { test, data }
  const [editModal,    setEditModal]    = useState(null);   // test object
  const [deleteTarget, setDeleteTarget] = useState(null);   // test object

  useEffect(() => { fetchTests(); }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers/tests/all/');
      const data = res.data?.tests_by_subject || [];
      setGroups(data);
      // Auto-expand first group
      if (data.length > 0) {
        setExpanded({ [data[0].subject_id]: true });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ── View Results ─────────────────────────────────────────────────────────
  const handleViewResults = async (test) => {
    try {
      const res = await api.get(`/teachers/tests/${test.id}/results-detailed/`);
      setResultsModal({ test, data: res.data });
    } catch (err) {
      toast.error('Failed to load results');
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEditSave = async (testId, payload) => {
    try {
      await api.patch(`/teachers/tests/${testId}/edit/`, payload);
      toast.success('Test updated!');
      setEditModal(null);
      fetchTests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/teachers/tests/${deleteTarget.id}/delete/`);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchTests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-1 flex items-center gap-1"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Tests</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage your tests — view results, edit details, or delete
            </p>
          </div>
          <button
            onClick={() => navigate('/teacher/test/create')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                       text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <HiPlus className="w-4 h-4" /> Create Test
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border border-gray-200 dark:border-gray-700">
            <HiClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Tests Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first test to get started.</p>
            <button
              onClick={() => navigate('/teacher/test/create')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              + Create Test
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(group => (
              <div key={group.subject_id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

                {/* Subject Header */}
                <button
                  onClick={() => toggleGroup(group.subject_id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <HiClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">{group.subject_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {group.class_name} · {group.tests.length} test{group.tests.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {expanded[group.subject_id]
                    ? <HiChevronDown className="w-5 h-5 text-gray-400" />
                    : <HiChevronRight className="w-5 h-5 text-gray-400" />}
                </button>

                {/* Tests List */}
                {expanded[group.subject_id] && (
                  <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                    {group.tests.map(test => (
                      <div key={test.id} className="px-6 py-4 flex items-start justify-between gap-4">
                        
                        {/* Test Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{test.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${badge(test.type)}`}>
                              {test.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Chapter: {test.chapter_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <HiClock className="w-3.5 h-3.5" />{test.duration_minutes} min
                            </span>
                            <span>· {test.marks} marks</span>
                            <span>· {test.questions_count} questions</span>
                            <span className={`flex items-center gap-1 font-medium ${
                              test.attempts_count > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400'
                            }`}>
                              <HiUsers className="w-3.5 h-3.5" />
                              {test.attempts_count} attempted
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Results */}
                          <button
                            onClick={() => handleViewResults(test)}
                            title="View Results"
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                                       text-green-700 bg-green-50 hover:bg-green-100
                                       dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/40
                                       rounded-lg transition-colors border border-green-200 dark:border-green-800"
                          >
                            <HiUsers className="w-3.5 h-3.5" /> Results
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setEditModal(test)}
                            title="Edit Test"
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                                       text-blue-700 bg-blue-50 hover:bg-blue-100
                                       dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40
                                       rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                          >
                            <HiPencil className="w-3.5 h-3.5" /> Edit
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(test)}
                            title="Delete Test"
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                                       text-red-700 bg-red-50 hover:bg-red-100
                                       dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40
                                       rounded-lg transition-colors border border-red-200 dark:border-red-800"
                          >
                            <HiTrash className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Results Modal ── */}
      {resultsModal && (
        <ResultsModal
          data={resultsModal}
          onClose={() => setResultsModal(null)}
        />
      )}

      {/* ── Edit Modal ── */}
      {editModal && (
        <EditModal
          test={editModal}
          onClose={() => setEditModal(null)}
          onSave={handleEditSave}
        />
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Test"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will also delete all questions and student attempts. This cannot be undone.`}
          confirmLabel="Yes, Delete"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </DashboardLayout>
  );
}

// ─── Results Modal ────────────────────────────────────────────────────────────
function ResultsModal({ data, onClose }) {
  const { test, data: rd } = data;
  const { test_info, results, stats } = rd;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{test_info.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {test_info.class_name} · {test_info.subject_name} · {test_info.chapter_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-100 dark:border-gray-700">
          {[
            { label: 'Attempted',  value: stats.total_attempts || 0 },
            { label: 'Average %',  value: stats.average_score ? `${Math.round(stats.average_score)}%` : '—' },
            { label: 'Highest %',  value: stats.highest_score ? `${Math.round(stats.highest_score)}%` : '—' },
            { label: 'Lowest %',   value: stats.lowest_score  ? `${Math.round(stats.lowest_score)}%`  : '—' },
          ].map(s => (
            <div key={s.label} className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <HiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No students have attempted this test yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2 uppercase">
                <span className="col-span-2">Student</span>
                <span className="text-center">Score</span>
                <span className="text-center">%</span>
              </div>
              {results.map((r, i) => (
                <div key={r.id}
                  className={`grid grid-cols-4 gap-2 items-center px-3 py-3 rounded-xl ${
                    i === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-gray-50 dark:bg-gray-700/30'
                  }`}>
                  <div className="col-span-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{r.student_name}</p>
                    <p className="text-xs text-gray-400">{r.student_unique_id}</p>
                  </div>
                  <p className="text-center font-semibold text-gray-700 dark:text-gray-300">
                    {r.score} / {test_info.marks}
                  </p>
                  <p className={`text-center font-bold ${
                    r.percentage >= 70 ? 'text-green-600 dark:text-green-400'
                    : r.percentage >= 40 ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>
                    {r.percentage != null ? `${r.percentage}%` : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ test, onClose, onSave }) {
  const [name,     setName]     = useState(test.name);
  const [desc,     setDesc]     = useState(test.description || '');
  const [duration, setDuration] = useState(test.duration_minutes);
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Test name is required'); return; }
    if (!duration || duration < 1) { toast.error('Duration must be at least 1 minute'); return; }
    setSaving(true);
    await onSave(test.id, { name: name.trim(), description: desc.trim(), duration_minutes: parseInt(duration) });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">

        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Test</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Test Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Instructions for students..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            Note: Test type and marks cannot be edited after creation.
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                       text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                       text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}




















// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { HiClipboardList, HiEye, HiPencil } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import { teacherAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const TeacherAllTests = () => {
//   const [testsBySubject, setTestsBySubject] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAllTests();
//   }, []);

//   const fetchAllTests = async () => {
//     try {
//       // Call API to get all tests created by this teacher
//       const response = await teacherAPI.getAllTests();
//       setTestsBySubject(response.data.tests_by_subject || []);
//     } catch (error) {
//       console.error('Failed to load tests:', error);
//       toast.error('Failed to load tests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             My Tests
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">
//             All tests you've created across all subjects
//           </p>
//         </div>

//         {/* Tests grouped by subject */}
//         {testsBySubject.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Tests Created Yet
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               Go to a chapter to create your first test
//             </p>
//           </Card>
//         ) : (
//           <div className="space-y-8">
//             {testsBySubject.map((subjectGroup) => (
//               <div key={subjectGroup.subject_id}>
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//                   {subjectGroup.class_name} - {subjectGroup.subject_name}
//                 </h2>
                
//                 <div className="space-y-4">
//                   {subjectGroup.tests.map((test) => (
//                     <Card 
//                       key={test.id}
//                       className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
//                     >
//                       <div className="p-6">
//                         <div className="flex items-center justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center space-x-3 mb-2">
//                               <h3 className="text-xl font-bold text-gray-900 dark:text-white">
//                                 {test.name}
//                               </h3>
//                               <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
//                                 test.type === 'mcq'
//                                   ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
//                                   : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
//                               }`}>
//                                 {test.type}
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
//                               Chapter: {test.chapter_name}
//                             </p>
//                             {test.description && (
//                               <p className="text-gray-600 dark:text-gray-400 mb-3">
//                                 {test.description}
//                               </p>
//                             )}
//                             <div className="grid grid-cols-4 gap-4 mt-4">
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Total Marks</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">
//                                   {test.marks}
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">
//                                   {test.questions_count || 0}
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">
//                                   {test.duration_minutes} min
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Attempts</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">
//                                   {test.attempts_count || 0}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="ml-6 flex flex-col space-y-2">
//                              <Link to={`/teacher/tests/${test.id}/results`}>
//                             {/* <Link to={`/teacher/TeacherAllTests/${test.id}/results`}> */}
//                               <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center">
//                                 <HiEye className="w-4 h-4 mr-2" />
//                                 View Results
//                               </button>
//                             </Link>
//                             <Link to={`/teacher/test/${test.id}/manage`}>
//                               <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
//                                 <HiPencil className="w-4 h-4 mr-2" />
//                                 Manage Test
//                               </button>
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TeacherAllTests;