import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageChapters() {
  // ── Data ──────────────────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // ── Selection state ───────────────────────────────────────────────
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // ── UI state ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Modals ────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [formData, setFormData] = useState({ name: '', order: '' });

  // ── On mount: load classes ─────────────────────────────────────────
  useEffect(() => {
    fetchClasses();
  }, []);

  // ── When class selected: load subjects of that class ──────────────
  useEffect(() => {
    if (selectedClass) {
      fetchSubjectsForClass(selectedClass.id);
      setSelectedSubject(null);
      setChapters([]);
    }
  }, [selectedClass]);

  // ── When subject selected: load chapters ──────────────────────────
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchChapters(selectedClass.id, selectedSubject.id);
    }
  }, [selectedSubject]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/classes/');
      setClasses(res.data);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      const res = await api.get(`/admin/subjects/?class_id=${classId}`);
      setSubjects(res.data);
    } catch {
      toast.error('Failed to load subjects');
    }
  };

  const fetchChapters = async (classId, subjectId) => {
    try {
      setChaptersLoading(true);
      const res = await api.get(`/admin/chapters/?class_id=${classId}&subject_id=${subjectId}`);
      setChapters(res.data);
    } catch {
      toast.error('Failed to load chapters');
    } finally {
      setChaptersLoading(false);
    }
  };

  // ── Modals open ───────────────────────────────────────────────────
  const handleAdd = () => {
    setFormData({ name: '', order: chapters.length + 1 });
    setShowAddModal(true);
  };

  const handleEdit = (chapter) => {
    setSelectedChapter(chapter);
    setFormData({ name: chapter.name, order: chapter.order ?? '' });
    setShowEditModal(true);
  };

  const handleDelete = (chapter) => {
    setSelectedChapter(chapter);
    setShowDeleteModal(true);
  };

  // ── Submit ADD ────────────────────────────────────────────────────
  const submitAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Chapter name is required'); return; }

    try {
      setSubmitting(true);
      await api.post('/admin/chapters/', {
        name: formData.name.trim(),
        subject_id: selectedSubject.id,
        class_id: selectedClass.id,
        order: parseInt(formData.order) || 0,
      });
      toast.success('Chapter added successfully!');
      setShowAddModal(false);
      fetchChapters(selectedClass.id, selectedSubject.id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add chapter');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit EDIT ───────────────────────────────────────────────────
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Chapter name is required'); return; }

    try {
      setSubmitting(true);
      await api.put(`/admin/chapters/${selectedChapter.id}/`, {
        name: formData.name.trim(),
        order: parseInt(formData.order) || 0,
      });
      toast.success('Chapter updated successfully!');
      setShowEditModal(false);
      fetchChapters(selectedClass.id, selectedSubject.id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update chapter');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit DELETE ─────────────────────────────────────────────────
  const submitDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/admin/chapters/${selectedChapter.id}/`);
      toast.success('Chapter deleted!');
      setShowDeleteModal(false);
      fetchChapters(selectedClass.id, selectedSubject.id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete chapter');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96"><Loading /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Chapters</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select a class and subject to manage its chapters
          </p>
        </div>

        {/* ── Step 1: Select Class ── */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Step 1 — Select a Class
          </h2>
          {classes.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                No classes found. Please add classes first from the <strong>Manage Classes</strong> section.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                    selectedClass?.id === cls.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Step 2: Select Subject ── */}
        {selectedClass && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Step 2 — Select a Subject in <span className="text-blue-600">{selectedClass.name}</span>
            </h2>
            {subjects.length === 0 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  No subjects linked to <strong>{selectedClass.name}</strong>. Link subjects from the <strong>Manage Subjects</strong> section.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                      selectedSubject?.id === sub.id
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Chapters Table ── */}
        {selectedClass && selectedSubject && (
          <div>
            {/* Sub-header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Step 3 — Chapters of{' '}
                  <span className="text-emerald-600">{selectedSubject.name}</span>
                  {' '}in{' '}
                  <span className="text-blue-600">{selectedClass.name}</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <Button onClick={handleAdd}>+ Add Chapter</Button>
            </div>

            {chaptersLoading ? (
              <div className="flex justify-center py-12"><Loading /></div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Chapters Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Add the first chapter for {selectedSubject.name} in {selectedClass.name}
                </p>
                <Button onClick={handleAdd}>+ Add First Chapter</Button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chapter Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {chapters.map((chapter, index) => (
                      <tr key={chapter.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 dark:text-white font-medium">{chapter.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            Order: {chapter.order ?? index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(chapter)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(chapter)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ADD MODAL ── */}
        <Modal isOpen={showAddModal} onClose={() => !submitting && setShowAddModal(false)} title="Add New Chapter">
          <form onSubmit={submitAdd} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
              Adding chapter to: <strong>{selectedSubject?.name}</strong> → <strong>{selectedClass?.name}</strong>
            </div>
            <Input
              label="Chapter Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Introduction to Algebra"
              required
              disabled={submitting}
            />
            <Input
              label="Order (for sorting)"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              placeholder="e.g., 1, 2, 3..."
              disabled={submitting}
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Adding...' : 'Add Chapter'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── EDIT MODAL ── */}
        <Modal isOpen={showEditModal} onClose={() => !submitting && setShowEditModal(false)} title="Edit Chapter">
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-sm text-emerald-800 dark:text-emerald-200">
              Editing chapter in: <strong>{selectedSubject?.name}</strong> → <strong>{selectedClass?.name}</strong>
            </div>
            <Input
              label="Chapter Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Introduction to Algebra"
              required
              disabled={submitting}
            />
            <Input
              label="Order (for sorting)"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              placeholder="e.g., 1, 2, 3..."
              disabled={submitting}
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Updating...' : 'Update Chapter'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} disabled={submitting} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── DELETE MODAL ── */}
        <Modal isOpen={showDeleteModal} onClose={() => !submitting && setShowDeleteModal(false)} title="Delete Chapter">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete chapter <strong>"{selectedChapter?.name}"</strong>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ This will permanently delete this chapter and all tests linked to it.
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={submitDelete} disabled={submitting} variant="danger" className="flex-1">
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={submitting} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}

























// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function ManageChapters() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Chapters - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }