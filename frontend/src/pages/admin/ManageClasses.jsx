// frontend/src/pages/admin/ManageClasses.jsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.9l-3 1 1-3a4 4 0 01.9-1.414z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);
const TeacherIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ─── Modal Wrapper ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'max-w-2xl' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <XIcon />
          </button>
        </div>
        {/* Body */}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Dialog ──────────────────────────────────────────────────────
function ConfirmDelete({ message, onConfirm, onCancel, saving }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel}>
      <div className="flex gap-3 mb-5">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
          <TrashIcon />
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 transition"
        >
          {saving && <SpinnerIcon />}
          Yes, Delete
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [detailCache, setDetailCache] = useState({});   // { [classId]: detailData }
  const [detailLoading, setDetailLoading] = useState({});

  // Modal control
  const [modal, setModal] = useState(null);
  // Possible values: 'addClass' | 'editClass' | 'deleteClass' | 'addSubject' | 'editSubject' | 'deleteSubject' | 'viewStudents'

  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeClass, setActiveClass] = useState(null);   // class being acted on
  const [activeSubject, setActiveSubject] = useState(null); // subject being acted on

  // ── Load all classes ──────────────────────────────────────────────────────────
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllClasses();
      setClasses(res.data);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  // ── Load detail for a class (subjects + students) ──────────────────────────
  const loadDetail = async (classId, forceRefresh = false) => {
    if (detailCache[classId] && !forceRefresh) return;
    try {
      setDetailLoading(prev => ({ ...prev, [classId]: true }));
      const res = await adminAPI.getClassDetail(classId);
      setDetailCache(prev => ({ ...prev, [classId]: res.data }));
    } catch {
      toast.error('Failed to load class details');
    } finally {
      setDetailLoading(prev => ({ ...prev, [classId]: false }));
    }
  };

  // ── Toggle expand ─────────────────────────────────────────────────────────────
  const toggleExpand = (classId) => {
    if (expandedId === classId) {
      setExpandedId(null);
    } else {
      setExpandedId(classId);
      loadDetail(classId);
    }
  };

  const closeModal = () => {
    setModal(null);
    setFormName('');
    setActiveClass(null);
    setActiveSubject(null);
  };

  // ── ADD CLASS ──────────────────────────────────────────────────────────────────
  const handleAddClass = async () => {
    if (!formName.trim()) { toast.error('Enter a class name'); return; }
    try {
      setSaving(true);
      const res = await adminAPI.createClass({ name: formName.trim() });
      toast.success('Class added successfully!');
      closeModal();
      // Add to list without full reload
      const newClass = res.data.class || { id: Date.now(), name: formName.trim(), subjects_count: 0 };
      setClasses(prev => [...prev, { ...newClass, subjects_count: 0 }]);
      await loadClasses(); // refresh to get proper IDs
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to add class');
    } finally { setSaving(false); }
  };

  // ── RENAME CLASS ───────────────────────────────────────────────────────────────
  const handleRenameClass = async () => {
    if (!formName.trim()) { toast.error('Enter a class name'); return; }
    try {
      setSaving(true);
      await adminAPI.updateClass(activeClass.id, { name: formName.trim() });
      toast.success('Class renamed!');
      setClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, name: formName.trim() } : c));
      if (detailCache[activeClass.id]) {
        setDetailCache(prev => ({ ...prev, [activeClass.id]: { ...prev[activeClass.id], name: formName.trim() } }));
      }
      closeModal();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to rename class');
    } finally { setSaving(false); }
  };

  // ── DELETE CLASS ───────────────────────────────────────────────────────────────
  const handleDeleteClass = async () => {
    try {
      setSaving(true);
      await adminAPI.deleteClass(activeClass.id);
      toast.success('Class deleted!');
      setClasses(prev => prev.filter(c => c.id !== activeClass.id));
      if (expandedId === activeClass.id) setExpandedId(null);
      closeModal();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete class');
    } finally { setSaving(false); }
  };

  // ── ADD SUBJECT TO CLASS ───────────────────────────────────────────────────────
  const handleAddSubject = async () => {
    if (!formName.trim()) { toast.error('Enter a subject name'); return; }
    try {
      setSaving(true);
      await adminAPI.addSubjectToClass({ name: formName.trim(), class_id: activeClass.id });
      toast.success('Subject added!');
      closeModal();
      await loadDetail(activeClass.id, true); // force refresh detail
      setClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, subjects_count: (c.subjects_count || 0) + 1 } : c));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to add subject');
    } finally { setSaving(false); }
  };

  // ── RENAME SUBJECT ─────────────────────────────────────────────────────────────
  const handleRenameSubject = async () => {
    if (!formName.trim()) { toast.error('Enter a subject name'); return; }
    try {
      setSaving(true);
      await adminAPI.updateAcademicSubject(activeSubject.id, { name: formName.trim() });
      toast.success('Subject renamed!');
      closeModal();
      await loadDetail(activeClass.id, true);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to rename subject');
    } finally { setSaving(false); }
  };

  // ── DELETE SUBJECT ─────────────────────────────────────────────────────────────
  const handleDeleteSubject = async () => {
    try {
      setSaving(true);
      await adminAPI.deleteAcademicSubject(activeSubject.id);
      toast.success('Subject deleted!');
      closeModal();
      await loadDetail(activeClass.id, true);
      setClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, subjects_count: Math.max(0, (c.subjects_count || 1) - 1) } : c));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete subject');
    } finally { setSaving(false); }
  };

  // ── Helpers to open modals cleanly ────────────────────────────────────────────
  const openAddClass = () => { setFormName(''); setModal('addClass'); };

  const openEditClass = (cls) => {
    setActiveClass(cls);
    setFormName(cls.name);
    setModal('editClass');
  };

  const openDeleteClass = (cls) => {
    setActiveClass(cls);
    setModal('deleteClass');
  };

  const openAddSubject = (cls) => {
    setActiveClass(cls);
    setFormName('');
    setModal('addSubject');
  };

  const openEditSubject = (cls, subject) => {
    setActiveClass(cls);
    setActiveSubject(subject);
    setFormName(subject.name);
    setModal('editSubject');
  };

  const openDeleteSubject = (cls, subject) => {
    setActiveClass(cls);
    setActiveSubject(subject);
    setModal('deleteSubject');
  };

  const openViewStudents = (cls) => {
    setActiveClass(cls);
    loadDetail(cls.id);
    setModal('viewStudents');
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const totalSubjects = classes.reduce((sum, c) => sum + (c.subjects_count || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Classes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Add classes, add subjects to each class, view enrolled students.
            </p>
          </div>
          <button
            onClick={openAddClass}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition shrink-0"
          >
            <PlusIcon /> Add New Class
          </button>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <BookIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{classes.length}</p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">Total Classes</p>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <UsersIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{totalSubjects}</p>
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">Total Subjects</p>
            </div>
          </div>
        </div>

        {/* ── Classes List ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-500 dark:text-gray-400">
            <SpinnerIcon />
            <span className="text-sm">Loading classes...</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
            <BookIcon />
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">No classes yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">Add your first class to get started</p>
            <button
              onClick={openAddClass}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Add Class
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => {
              const isExpanded = expandedId === cls.id;
              const detail = detailCache[cls.id];
              const isLoadingDetail = detailLoading[cls.id];

              return (
                <div
                  key={cls.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                  {/* ── Class Row Header ────────────────────────────────── */}
                  <div className="flex items-center gap-3 p-4">
                    {/* Color dot */}
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />

                    {/* Class name + meta */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{cls.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <BookIcon />
                          {cls.subjects_count || 0} subject{(cls.subjects_count || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* View Students */}
                      <button
                        onClick={() => openViewStudents(cls)}
                        title="View Students"
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                      >
                        <UsersIcon />
                      </button>
                      {/* Add Subject */}
                      <button
                        onClick={() => openAddSubject(cls)}
                        title="Add Subject"
                        className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                      >
                        <PlusIcon />
                      </button>
                      {/* Edit Class */}
                      <button
                        onClick={() => openEditClass(cls)}
                        title="Rename Class"
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                      >
                        <EditIcon />
                      </button>
                      {/* Delete Class */}
                      <button
                        onClick={() => openDeleteClass(cls)}
                        title="Delete Class"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <TrashIcon />
                      </button>
                      {/* Expand */}
                      <button
                        onClick={() => toggleExpand(cls.id)}
                        title={isExpanded ? 'Collapse' : 'Expand subjects'}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <ChevronIcon open={isExpanded} />
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded: Subjects List ──────────────────────────── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                      {isLoadingDetail ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                          <SpinnerIcon /> Loading subjects...
                        </div>
                      ) : detail ? (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Subjects ({detail.subjects?.length || 0})
                            </p>
                            <button
                              onClick={() => openAddSubject(cls)}
                              className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                              <PlusIcon /> Add Subject
                            </button>
                          </div>

                          {detail.subjects?.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
                              No subjects added yet. Click "Add Subject" to add one.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {detail.subjects.map((subj) => (
                                <div
                                  key={subj.id}
                                  className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5"
                                >
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{subj.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-xs text-gray-400">
                                        {subj.chapter_count || 0} chapter{(subj.chapter_count || 0) !== 1 ? 's' : ''}
                                      </span>
                                      {subj.assigned_teacher ? (
                                        <span className="text-xs text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                                          <TeacherIcon />
                                          {subj.assigned_teacher.name}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-amber-500">No teacher assigned</span>
                                      )}
                                    </div>
                                  </div>
                                  {/* Subject Actions */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => openEditSubject(cls, subj)}
                                      title="Rename subject"
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                                    >
                                      <EditIcon />
                                    </button>
                                    <button
                                      onClick={() => openDeleteSubject(cls, subj)}
                                      title="Delete subject"
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                    >
                                      <TrashIcon />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Add Class */}
      {modal === 'addClass' && (
        <Modal title="Add New Class" onClose={closeModal}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Class Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddClass()}
            placeholder="e.g. Grade 10, Class 1, Standard 5..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button onClick={handleAddClass} disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition">
              {saving && <SpinnerIcon />} Add Class
            </button>
          </div>
        </Modal>
      )}

      {/* Rename Class */}
      {modal === 'editClass' && (
        <Modal title={`Rename "${activeClass?.name}"`} onClose={closeModal}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            New Class Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRenameClass()}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button onClick={handleRenameClass} disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition">
              {saving && <SpinnerIcon />} Save
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Class */}
      {modal === 'deleteClass' && (
        <ConfirmDelete
          message={`Are you sure you want to delete the class "${activeClass?.name}"? All subjects and chapters inside it will also be permanently deleted. This cannot be undone.`}
          onConfirm={handleDeleteClass}
          onCancel={closeModal}
          saving={saving}
        />
      )}

      {/* Add Subject to Class */}
      {modal === 'addSubject' && (
        <Modal title={`Add Subject to "${activeClass?.name}"`} onClose={closeModal}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
            placeholder="e.g. Mathematics, Science, English..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button onClick={handleAddSubject} disabled={saving} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition">
              {saving && <SpinnerIcon />} Add Subject
            </button>
          </div>
        </Modal>
      )}

      {/* Rename Subject */}
      {modal === 'editSubject' && (
        <Modal title={`Rename Subject "${activeSubject?.name}"`} onClose={closeModal}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            New Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRenameSubject()}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button onClick={handleRenameSubject} disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition">
              {saving && <SpinnerIcon />} Save
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Subject */}
      {modal === 'deleteSubject' && (
        <ConfirmDelete
          message={`Delete subject "${activeSubject?.name}" from "${activeClass?.name}"? All chapters inside this subject will also be deleted permanently.`}
          onConfirm={handleDeleteSubject}
          onCancel={closeModal}
          saving={saving}
        />
      )}

      {/* View Students */}
      {modal === 'viewStudents' && (
        <Modal title={`Students in "${activeClass?.name}"`} onClose={closeModal} size="lg">
          {detailLoading[activeClass?.id] ? (
            <div className="flex items-center gap-2 py-6 text-gray-500 text-sm">
              <SpinnerIcon /> Loading students...
            </div>
          ) : (
            <>
              {(!detailCache[activeClass?.id]?.students || detailCache[activeClass?.id]?.students.length === 0) ? (
                <div className="text-center py-10">
                  <UsersIcon />
                  <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">No students enrolled in this class yet.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {detailCache[activeClass?.id]?.students.length} student(s) enrolled
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {detailCache[activeClass?.id]?.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.unique_id} · {student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}



















// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function ManageClasses() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Classes - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }