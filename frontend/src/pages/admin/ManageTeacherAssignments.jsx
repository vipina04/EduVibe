import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageTeacherAssignments() {
  const [assignments, setAssignments]   = useState([]);
  const [classes, setClasses]           = useState([]);
  const [subjects, setSubjects]         = useState([]);
  const [teachers, setTeachers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  // Modal
  const [showAssignModal, setShowAssignModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form
  const [selectedClass, setSelectedClass]     = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [formData, setFormData] = useState({
    class_id: '', subject_id: '', teacher_id: ''
  });

  useEffect(() => { fetchAll(); }, []);

  // When class changes in form — filter subjects for that class
  useEffect(() => {
    if (formData.class_id) {
      const classSubjects = subjects.filter(s =>
        s.classes && s.classes.some(c => c.id === parseInt(formData.class_id))
      );
      setFilteredSubjects(classSubjects);
      setFormData(prev => ({ ...prev, subject_id: '' }));
    } else {
      setFilteredSubjects([]);
    }
  }, [formData.class_id, subjects]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [assignRes, classRes, subjectRes, teacherRes] = await Promise.all([
        api.get('/admin/teacher-assignments/'),
        api.get('/admin/classes/'),
        api.get('/admin/subjects/'),
        api.get('/admin/teachers/'),
      ]);
      setAssignments(assignRes.data);
      setClasses(classRes.data);
      setSubjects(subjectRes.data);
      setTeachers(teacherRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!formData.class_id || !formData.subject_id || !formData.teacher_id) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/admin/assign-teacher/', {
        class_id:   parseInt(formData.class_id),
        subject_id: parseInt(formData.subject_id),
        teacher_id: parseInt(formData.teacher_id),
      });
      toast.success('Teacher assigned successfully!');
      setShowAssignModal(false);
      setFormData({ class_id: '', subject_id: '', teacher_id: '' });
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/admin/teacher-assignments/delete/${selectedAssignment.id}/`);
      toast.success('Assignment removed!');
      setShowDeleteModal(false);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96"><Loading /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teacher Assignments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Assign teachers to teach specific subjects in specific classes
            </p>
          </div>
          <Button onClick={() => setShowAssignModal(true)}>
            + Assign Teacher
          </Button>
        </div>

        {/* Assignments Table */}
        {assignments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Assignments Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Start by assigning a teacher to a subject and class
            </p>
            <Button onClick={() => setShowAssignModal(true)}>+ Assign First Teacher</Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Class</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {assignments.map((a, index) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {a.teacher?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {a.teacher?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full font-medium">
                        {a.subject?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium">
                        {a.class?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedAssignment(a); setShowDeleteModal(true); }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ASSIGN MODAL */}
        <Modal isOpen={showAssignModal} onClose={() => !submitting && setShowAssignModal(false)} title="Assign Teacher to Subject">
          <form onSubmit={handleAssign} className="space-y-4">

            {/* Step 1: Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                1. Select Class
              </label>
              <select
                value={formData.class_id}
                onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required disabled={submitting}
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Subject (filtered by class) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                2. Select Subject
              </label>
              <select
                value={formData.subject_id}
                onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                required disabled={submitting || !formData.class_id}
              >
                <option value="">-- Select Subject --</option>
                {filteredSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {formData.class_id && filteredSubjects.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  No subjects linked to this class. Add subjects first.
                </p>
              )}
            </div>

            {/* Step 3: Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                3. Select Teacher
              </label>
              <select
                value={formData.teacher_id}
                onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required disabled={submitting}
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.first_name} {t.last_name} ({t.unique_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Assigning...' : 'Assign Teacher'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)} disabled={submitting} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* DELETE MODAL */}
        <Modal isOpen={showDeleteModal} onClose={() => !submitting && setShowDeleteModal(false)} title="Remove Assignment">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Remove <strong>{selectedAssignment?.teacher?.name}</strong> from teaching{' '}
              <strong>{selectedAssignment?.subject?.name}</strong> in{' '}
              <strong>{selectedAssignment?.class?.name}</strong>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ The teacher will lose access to this class-subject.
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleDelete} disabled={submitting} variant="danger" className="flex-1">
                {submitting ? 'Removing...' : 'Yes, Remove'}
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