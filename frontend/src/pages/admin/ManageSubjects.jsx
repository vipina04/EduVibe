import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '', class_ids: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, classesRes] = await Promise.all([
        api.get('/admin/subjects/'),
        api.get('/admin/classes/'),
      ]);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (classId) => {
    setFormData(prev => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter(id => id !== classId)
        : [...prev.class_ids, classId],
    }));
  };

  const handleAdd = () => {
    setFormData({ name: '', class_ids: [] });
    setShowAddModal(true);
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      class_ids: subject.classes ? subject.classes.map(c => c.id) : [],
    });
    setShowEditModal(true);
  };

  const handleDelete = (subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  // ── submit ADD ────────────────────────────────────────────────────
  const submitAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Subject name is required'); return; }
    if (formData.class_ids.length === 0) { toast.error('Select at least one class'); return; }

    try {
      setSubmitting(true);
      const name = formData.name.trim().toUpperCase();

      for (const class_id of formData.class_ids) {
        await api.post('/admin/academic-subjects/', { name, class_id });
      }

      toast.success('Subject added successfully!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add subject');
    } finally {
      setSubmitting(false);
    }
  };

  // ── submit EDIT ───────────────────────────────────────────────────
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Subject name is required'); return; }

    try {
      setSubmitting(true);
      const name = formData.name.trim().toUpperCase();

      // FIXED: correct URL — no trailing /update/
      await api.patch(`/admin/subjects/${selectedSubject.id}/`, { name });

      const currentClassIds = (selectedSubject.classes || []).map(c => c.id);
      const newClassIds = formData.class_ids;

      for (const class_id of newClassIds) {
        if (!currentClassIds.includes(class_id)) {
          try {
            await api.post('/admin/academic-subjects/', { name, class_id });
          } catch (err) {
            // ignore if already exists
          }
        }
      }

      for (const cls of (selectedSubject.classes || [])) {
        if (!newClassIds.includes(cls.id)) {
          const csId = selectedSubject.class_subject_ids?.[cls.id];
          if (csId) {
            try {
              await api.delete(`/admin/academic-subjects/${csId}/`);
            } catch (err) {
              // ignore
            }
          }
        }
      }

      toast.success('Subject updated successfully!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update subject');
    } finally {
      setSubmitting(false);
    }
  };

  // ── submit DELETE ─────────────────────────────────────────────────
  const submitDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/admin/subjects/${selectedSubject.id}/`);
      toast.success('Subject deleted successfully!');
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete subject');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Subjects</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add, edit, and manage subjects for classes
            </p>
          </div>
          <Button onClick={handleAdd}>+ Add Subject</Button>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Subjects Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first subject</p>
            <Button onClick={handleAdd}>Add Subject</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {subject.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
                  {subject.classes && subject.classes.length > 0 ? (
                    subject.classes.map((cls) => (
                      <span key={cls.id}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {cls.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">Not linked to any class</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(subject)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(subject)}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD MODAL */}
        <Modal isOpen={showAddModal} onClose={() => !submitting && setShowAddModal(false)} title="Add New Subject">
          <form onSubmit={submitAdd} className="space-y-4">
            <Input
              label="Subject Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mathematics, Physics"
              required
              disabled={submitting}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Classes to link this subject to
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {classes.length === 0 ? (
                  <p className="text-sm text-gray-500">No classes available. Add classes first.</p>
                ) : (
                  classes.map((cls) => (
                    <label key={cls.id}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.class_ids.includes(cls.id)}
                        onChange={() => toggleClass(cls.id)}
                        disabled={submitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">{cls.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Adding...' : 'Add Subject'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* EDIT MODAL */}
        <Modal isOpen={showEditModal} onClose={() => !submitting && setShowEditModal(false)} title="Edit Subject">
          <form onSubmit={submitEdit} className="space-y-4">
            <Input
              label="Subject Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mathematics, Physics"
              required
              disabled={submitting}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classes (check to link, uncheck to unlink)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {classes.map((cls) => (
                  <label key={cls.id}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.class_ids.includes(cls.id)}
                      onChange={() => toggleClass(cls.id)}
                      disabled={submitting}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{cls.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Updating...' : 'Update Subject'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} disabled={submitting} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* DELETE MODAL */}
        <Modal isOpen={showDeleteModal} onClose={() => !submitting && setShowDeleteModal(false)} title="Delete Subject">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <strong>{selectedSubject?.name}</strong>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              This will remove the subject from all classes permanently.
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={submitDelete} disabled={submitting} variant="danger" className="flex-1">
                {submitting ? 'Deleting...' : 'Delete Subject'}
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




