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

































// import { useState, useEffect } from 'react';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Modal from '../../components/common/Modal';
// import Button from '../../components/common/Button';
// import Input from '../../components/common/Input';
// import Loading from '../../components/common/Loading';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// export default function ManageSubjects() {
//   const [subjects, setSubjects] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   const [selectedSubject, setSelectedSubject] = useState(null);
//   const [formData, setFormData] = useState({ name: '', class_ids: [] });
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => { fetchData(); }, []);

//   // ── fetch subjects + classes ──────────────────────────────────────
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [subjectsRes, classesRes] = await Promise.all([
//         api.get('/admin/subjects/'),
//         api.get('/admin/classes/'),
//       ]);
//       setSubjects(subjectsRes.data);
//       setClasses(classesRes.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── helpers ───────────────────────────────────────────────────────
//   const toggleClass = (classId) => {
//     setFormData(prev => ({
//       ...prev,
//       class_ids: prev.class_ids.includes(classId)
//         ? prev.class_ids.filter(id => id !== classId)
//         : [...prev.class_ids, classId],
//     }));
//   };

//   // ── open modals ───────────────────────────────────────────────────
//   const handleAdd = () => {
//     setFormData({ name: '', class_ids: [] });
//     setShowAddModal(true);
//   };

//   const handleEdit = (subject) => {
//     setSelectedSubject(subject);
//     setFormData({
//       name: subject.name,
//       class_ids: subject.classes ? subject.classes.map(c => c.id) : [],
//     });
//     setShowEditModal(true);
//   };

//   const handleDelete = (subject) => {
//     setSelectedSubject(subject);
//     setShowDeleteModal(true);
//   };

//   // ── submit ADD ────────────────────────────────────────────────────
//   const submitAdd = async (e) => {
//     e.preventDefault();
//     if (!formData.name.trim()) { toast.error('Subject name is required'); return; }
//     if (formData.class_ids.length === 0) { toast.error('Select at least one class'); return; }

//     try {
//       setSubmitting(true);
//       // Step 1: create the subject (or get existing)
//       // Step 2: link to each selected class via /admin/academic-subjects/
//       // We do this by posting once per class_id
//       const name = formData.name.trim().toUpperCase();

//       for (const class_id of formData.class_ids) {
//         await api.post('/admin/academic-subjects/', { name, class_id });
//       }

//       toast.success('Subject added successfully!');
//       setShowAddModal(false);
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to add subject');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── submit EDIT ───────────────────────────────────────────────────
//   const submitEdit = async (e) => {
//     e.preventDefault();
//     if (!formData.name.trim()) { toast.error('Subject name is required'); return; }

//     try {
//       setSubmitting(true);
//       const name = formData.name.trim().toUpperCase();

//       // Update the subject name via AcademicSubjectDetailView PATCH
//       // selectedSubject.class_subject_id is the ClassSubject id
//       // But since subject may be linked to multiple classes, we update
//       // the Subject name directly using subject id
//       await api.patch(`/admin/subjects/${selectedSubject.id}/`, { name });

//       // Handle class links:
//       // Remove classes that were deselected, add newly selected ones
//       const currentClassIds = (selectedSubject.classes || []).map(c => c.id);
//       const newClassIds = formData.class_ids;

//       // Add new links
//       for (const class_id of newClassIds) {
//         if (!currentClassIds.includes(class_id)) {
//           try {
//             await api.post('/admin/academic-subjects/', { name, class_id });
//           } catch (err) {
//             // ignore if already exists
//           }
//         }
//       }

//       // Remove deselected links
//       for (const cls of (selectedSubject.classes || [])) {
//         if (!newClassIds.includes(cls.id)) {
//           // find the class_subject id for this subject+class combo
//           // We stored class_subject_ids in fetchData below
//           const csId = selectedSubject.class_subject_ids?.[cls.id];
//           if (csId) {
//             try {
//               await api.delete(`/admin/academic-subjects/${csId}/`);
//             } catch (err) {
//               // ignore
//             }
//           }
//         }
//       }

//       toast.success('Subject updated successfully!');
//       setShowEditModal(false);
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to update subject');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── submit DELETE ─────────────────────────────────────────────────
//   const submitDelete = async () => {
//     try {
//       setSubmitting(true);
//       // Delete the Subject itself — cascades to all ClassSubject links
//       await api.delete(`/admin/subjects/${selectedSubject.id}/`);
//       toast.success('Subject deleted successfully!');
//       setShowDeleteModal(false);
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to delete subject');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center h-96">
//           <Loading />
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // ── render ────────────────────────────────────────────────────────
//   return (
//     <DashboardLayout>
//       <div className="p-6">

//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Subjects</h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               Add, edit, and manage subjects for classes
//             </p>
//           </div>
//           <Button onClick={handleAdd}>+ Add Subject</Button>
//         </div>

//         {/* Subjects Grid */}
//         {subjects.length === 0 ? (
//           <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
//             <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//             </svg>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Subjects Yet</h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first subject</p>
//             <Button onClick={handleAdd}>Add Subject</Button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {subjects.map((subject) => (
//               <div key={subject.id}
//                 className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
//                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
//                   {subject.name}
//                 </h3>

//                 {/* Classes linked to this subject */}
//                 <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
//                   {subject.classes && subject.classes.length > 0 ? (
//                     subject.classes.map((cls) => (
//                       <span key={cls.id}
//                         className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
//                         {cls.name}
//                       </span>
//                     ))
//                   ) : (
//                     <span className="text-xs text-gray-400 italic">Not linked to any class</span>
//                   )}
//                 </div>

//                 <div className="flex gap-2">
//                   <button onClick={() => handleEdit(subject)}
//                     className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
//                     Edit
//                   </button>
//                   <button onClick={() => handleDelete(subject)}
//                     className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── ADD MODAL ─────────────────────────────────────────── */}
//         <Modal isOpen={showAddModal} onClose={() => !submitting && setShowAddModal(false)} title="Add New Subject">
//           <form onSubmit={submitAdd} className="space-y-4">
//             <Input
//               label="Subject Name"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               placeholder="e.g., Mathematics, Physics"
//               required
//               disabled={submitting}
//             />

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Select Classes to link this subject to
//               </label>
//               <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                 {classes.length === 0 ? (
//                   <p className="text-sm text-gray-500">No classes available. Add classes first.</p>
//                 ) : (
//                   classes.map((cls) => (
//                     <label key={cls.id}
//                       className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={formData.class_ids.includes(cls.id)}
//                         onChange={() => toggleClass(cls.id)}
//                         disabled={submitting}
//                         className="w-4 h-4 text-blue-600 border-gray-300 rounded"
//                       />
//                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{cls.name}</span>
//                     </label>
//                   ))
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-3 pt-2">
//               <Button type="submit" disabled={submitting} className="flex-1">
//                 {submitting ? 'Adding...' : 'Add Subject'}
//               </Button>
//               <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}
//                 disabled={submitting} className="flex-1">
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </Modal>

//         {/* ── EDIT MODAL ─────────────────────────────────────────── */}
//         <Modal isOpen={showEditModal} onClose={() => !submitting && setShowEditModal(false)} title="Edit Subject">
//           <form onSubmit={submitEdit} className="space-y-4">
//             <Input
//               label="Subject Name"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               placeholder="e.g., Mathematics, Physics"
//               required
//               disabled={submitting}
//             />

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Classes (check to link, uncheck to unlink)
//               </label>
//               <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                 {classes.map((cls) => (
//                   <label key={cls.id}
//                     className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={formData.class_ids.includes(cls.id)}
//                       onChange={() => toggleClass(cls.id)}
//                       disabled={submitting}
//                       className="w-4 h-4 text-blue-600 border-gray-300 rounded"
//                     />
//                     <span className="ml-2 text-sm text-gray-900 dark:text-white">{cls.name}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="flex gap-3 pt-2">
//               <Button type="submit" disabled={submitting} className="flex-1">
//                 {submitting ? 'Updating...' : 'Update Subject'}
//               </Button>
//               <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}
//                 disabled={submitting} className="flex-1">
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </Modal>

//         {/* ── DELETE MODAL ───────────────────────────────────────── */}
//         <Modal isOpen={showDeleteModal} onClose={() => !submitting && setShowDeleteModal(false)} title="Delete Subject">
//           <div className="space-y-4">
//             <p className="text-gray-700 dark:text-gray-300">
//               Are you sure you want to delete{' '}
//               <strong>{selectedSubject?.name}</strong>?
//             </p>
//             <p className="text-sm text-red-600 dark:text-red-400">
//               This will remove the subject from all classes permanently.
//             </p>
//             <div className="flex gap-3 pt-2">
//               <Button onClick={submitDelete} disabled={submitting} variant="danger" className="flex-1">
//                 {submitting ? 'Deleting...' : 'Delete Subject'}
//               </Button>
//               <Button type="button" variant="secondary" onClick={() => setShowDeleteModal(false)}
//                 disabled={submitting} className="flex-1">
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </Modal>

//       </div>
//     </DashboardLayout>
//   );
// }





















































































// // import { useState, useEffect } from 'react';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Modal from '../../components/common/Modal';
// // import Button from '../../components/common/Button';
// // import Input from '../../components/common/Input';
// // import Loading from '../../components/common/Loading';
// // import { showToast } from '../../utils/toast';
// // import api from '../../services/api';

// // export default function ManageSubjects() {
// //   const [subjects, setSubjects] = useState([]);
// //   const [classes, setClasses] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [showDeleteModal, setShowDeleteModal] = useState(false);
// //   const [selectedSubject, setSelectedSubject] = useState(null);
// //   const [formData, setFormData] = useState({
// //     name: '',
// //     class_ids: []
// //   });
// //   const [submitting, setSubmitting] = useState(false);

// //   // Fetch subjects and classes
// //   useEffect(() => {
// //     fetchData();
// //   }, []);

// //   const fetchData = async () => {
// //     try {
// //       setLoading(true);
// //       const [subjectsRes, classesRes] = await Promise.all([
// //         api.get('/admin/subjects/'),
// //         api.get('/admin/classes/')
// //       ]);
// //       setSubjects(subjectsRes.data);
// //       setClasses(classesRes.data);
// //     } catch (error) {
// //       console.error('Error fetching data:', error);
// //       showToast.error('Failed to load data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle add subject
// //   const handleAdd = () => {
// //     setFormData({ name: '', class_ids: [] });
// //     setShowAddModal(true);
// //   };

// //   // Handle edit subject
// //   const handleEdit = (subject) => {
// //     setSelectedSubject(subject);
// //     setFormData({
// //       name: subject.name,
// //       class_ids: subject.classes.map(c => c.id)
// //     });
// //     setShowEditModal(true);
// //   };

// //   // Handle delete subject
// //   const handleDelete = (subject) => {
// //     setSelectedSubject(subject);
// //     setShowDeleteModal(true);
// //   };

// //   // Submit add subject
// //   const submitAdd = async (e) => {
// //     e.preventDefault();
    
// //     if (!formData.name.trim()) {
// //       showToast.error('Subject name is required');
// //       return;
// //     }
    
// //     if (formData.class_ids.length === 0) {
// //       showToast.error('Please select at least one class');
// //       return;
// //     }

// //     try {
// //       setSubmitting(true);
// //       const response = await api.post('/admin/subjects/create/', formData);
// //       showToast.success(response.data.message);
// //       setShowAddModal(false);
// //       fetchData();
// //     } catch (error) {
// //       showToast.error(error.response?.data?.error || 'Failed to add subject');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   // Submit edit subject
// //   const submitEdit = async (e) => {
// //     e.preventDefault();
    
// //     if (!formData.name.trim()) {
// //       showToast.error('Subject name is required');
// //       return;
// //     }
    
// //     if (formData.class_ids.length === 0) {
// //       showToast.error('Please select at least one class');
// //       return;
// //     }

// //     try {
// //       setSubmitting(true);
// //       const response = await api.put(`/admin/subjects/${selectedSubject.id}/update/`, formData);
// //       // const response = await api.put(`/admin/subjects/${selectedSubject.id}/`, formData);
// //       showToast.success(response.data.message);
// //       setShowEditModal(false);
// //       fetchData();
// //     } catch (error) {
// //       showToast.error(error.response?.data?.error || 'Failed to update subject');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   // Submit delete subject
// //   const submitDelete = async () => {
// //     try {
// //       setSubmitting(true);
// //       const response = await api.delete(`/admin/subjects/${selectedSubject.id}/delete/`);
// //       showToast.success(response.data.message);
// //       setShowDeleteModal(false);
// //       fetchData();
// //     } catch (error) {
// //       showToast.error(error.response?.data?.error || 'Failed to delete subject');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   // Handle class checkbox toggle
// //   const toggleClass = (classId) => {
// //     setFormData(prev => ({
// //       ...prev,
// //       class_ids: prev.class_ids.includes(classId)
// //         ? prev.class_ids.filter(id => id !== classId)
// //         : [...prev.class_ids, classId]
// //     }));
// //   };

// //   if (loading) {
// //     return (
// //       <DashboardLayout>
// //         <div className="flex items-center justify-center h-96">
// //           <Loading />
// //         </div>
// //       </DashboardLayout>
// //     );
// //   }

// //   return (
// //     <DashboardLayout>
// //       <div className="p-6">
// //         {/* Header */}
// //         <div className="flex justify-between items-center mb-6">
// //           <div>
// //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Subjects</h1>
// //             <p className="text-gray-600 dark:text-gray-400 mt-1">Add, edit, and manage subjects for classes</p>
// //           </div>
// //           <Button onClick={handleAdd}>
// //             Add Subject
// //           </Button>
// //         </div>

// //         {/* Subjects Grid */}
// //         {subjects.length === 0 ? (
// //           <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
// //             <div className="text-gray-400 dark:text-gray-500 mb-4">
// //               <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
// //               </svg>
// //             </div>
// //             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Subjects Yet</h3>
// //             <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first subject</p>
// //             <Button onClick={handleAdd}>Add Subject</Button>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //             {subjects.map((subject) => (
// //               <div
// //                 key={subject.id}
// //                 className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
// //               >
// //                 <div className="flex justify-between items-start mb-4">
// //                   <div>
// //                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
// //                       {subject.name}
// //                     </h3>
// //                     <div className="flex flex-wrap gap-2">
// //                       {subject.classes.map((cls) => (
// //                         <span
// //                           key={cls.id}
// //                           className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
// //                         >
// //                           {cls.name}
// //                         </span>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 </div>
                
// //                 <div className="flex gap-2 mt-4">
// //                   <button
// //                     onClick={() => handleEdit(subject)}
// //                     className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
// //                   >
// //                     Edit
// //                   </button>
// //                   <button
// //                     onClick={() => handleDelete(subject)}
// //                     className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
// //                   >
// //                     Delete
// //                   </button>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}

// //         {/* Add Subject Modal */}
// //         <Modal
// //           isOpen={showAddModal}
// //           onClose={() => !submitting && setShowAddModal(false)}
// //           title="Add New Subject"
// //         >
// //           <form onSubmit={submitAdd} className="space-y-4">
// //             <Input
// //               label="Subject Name"
// //               value={formData.name}
// //               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //               placeholder="e.g., Mathematics, Physics, Chemistry"
// //               required
// //               disabled={submitting}
// //             />

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                 Select Classes
// //               </label>
// //               <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
// //                 {classes.length === 0 ? (
// //                   <p className="text-sm text-gray-500 dark:text-gray-400">
// //                     No classes available. Please add classes first.
// //                   </p>
// //                 ) : (
// //                   classes.map((cls) => (
// //                     <label
// //                       key={cls.id}
// //                       className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
// //                     >
// //                       <input
// //                         type="checkbox"
// //                         checked={formData.class_ids.includes(cls.id)}
// //                         onChange={() => toggleClass(cls.id)}
// //                         disabled={submitting}
// //                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600"
// //                       />
// //                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{cls.name}</span>
// //                     </label>
// //                   ))
// //                 )}
// //               </div>
// //             </div>

// //             <div className="flex gap-3 pt-4">
// //               <Button
// //                 type="submit"
// //                 disabled={submitting}
// //                 className="flex-1"
// //               >
// //                 {submitting ? 'Adding...' : 'Add Subject'}
// //               </Button>
// //               <Button
// //                 type="button"
// //                 variant="secondary"
// //                 onClick={() => setShowAddModal(false)}
// //                 disabled={submitting}
// //                 className="flex-1"
// //               >
// //                 Cancel
// //               </Button>
// //             </div>
// //           </form>
// //         </Modal>

// //         {/* Edit Subject Modal */}
// //         <Modal
// //           isOpen={showEditModal}
// //           onClose={() => !submitting && setShowEditModal(false)}
// //           title="Edit Subject"
// //         >
// //           <form onSubmit={submitEdit} className="space-y-4">
// //             <Input
// //               label="Subject Name"
// //               value={formData.name}
// //               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //               placeholder="e.g., Mathematics, Physics, Chemistry"
// //               required
// //               disabled={submitting}
// //             />

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                 Select Classes
// //               </label>
// //               <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
// //                 {classes.map((cls) => (
// //                   <label
// //                     key={cls.id}
// //                     className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
// //                   >
// //                     <input
// //                       type="checkbox"
// //                       checked={formData.class_ids.includes(cls.id)}
// //                       onChange={() => toggleClass(cls.id)}
// //                       disabled={submitting}
// //                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600"
// //                     />
// //                     <span className="ml-2 text-sm text-gray-900 dark:text-white">{cls.name}</span>
// //                   </label>
// //                 ))}
// //               </div>
// //             </div>

// //             <div className="flex gap-3 pt-4">
// //               <Button
// //                 type="submit"
// //                 disabled={submitting}
// //                 className="flex-1"
// //               >
// //                 {submitting ? 'Updating...' : 'Update Subject'}
// //               </Button>
// //               <Button
// //                 type="button"
// //                 variant="secondary"
// //                 onClick={() => setShowEditModal(false)}
// //                 disabled={submitting}
// //                 className="flex-1"
// //               >
// //                 Cancel
// //               </Button>
// //             </div>
// //           </form>
// //         </Modal>

// //         {/* Delete Confirmation Modal */}
// //         <Modal
// //           isOpen={showDeleteModal}
// //           onClose={() => !submitting && setShowDeleteModal(false)}
// //           title="Delete Subject"
// //         >
// //           <div className="space-y-4">
// //             <p className="text-gray-700 dark:text-gray-300">
// //               Are you sure you want to delete <strong className="font-semibold">{selectedSubject?.name}</strong>?
// //             </p>
// //             <p className="text-sm text-red-600 dark:text-red-400">
// //               This action cannot be undone. The subject will be permanently removed.
// //             </p>
// //             <div className="flex gap-3 pt-4">
// //               <Button
// //                 onClick={submitDelete}
// //                 disabled={submitting}
// //                 variant="danger"
// //                 className="flex-1"
// //               >
// //                 {submitting ? 'Deleting...' : 'Delete Subject'}
// //               </Button>
// //               <Button
// //                 type="button"
// //                 variant="secondary"
// //                 onClick={() => setShowDeleteModal(false)}
// //                 disabled={submitting}
// //                 className="flex-1"
// //               >
// //                 Cancel
// //               </Button>
// //             </div>
// //           </div>
// //         </Modal>
// //       </div>
// //     </DashboardLayout>
// //   );
// // }



























// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // export default function ManageSubjects() {
// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6">
// // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Subjects - Coming Soon</h1>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // }




















// // // // import { useState, useEffect } from 'react';
// // // // import { Link } from 'react-router-dom';
// // // // import { 
// // // //   HiArrowLeft, 
// // // //   HiPlus, 
// // // //   HiAcademicCap, 
// // // //   HiUserAdd,
// // // //   HiTrash,
// // // //   HiEye
// // // // } from 'react-icons/hi';
// // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // import Card from '../../components/common/Card';
// // // // import Loading from '../../components/common/Loading';
// // // // import Button from '../../components/common/Button';
// // // // import Modal from '../../components/common/Modal';
// // // // import { adminAPI } from '../../services/api';
// // // // import toast from 'react-hot-toast';

// // // // const ManageSubjects = () => {
// // // //   const [subjects, setSubjects] = useState([]);
// // // //   const [classes, setClasses] = useState([]);
// // // //   const [teachers, setTeachers] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [showCreateModal, setShowCreateModal] = useState(false);
// // // //   const [showTeachersModal, setShowTeachersModal] = useState(false);
// // // //   const [selectedSubject, setSelectedSubject] = useState(null);
// // // //   const [subjectTeachers, setSubjectTeachers] = useState([]);
  
// // // //   const [newSubject, setNewSubject] = useState({
// // // //     name: '',
// // // //     class_ids: [],
// // // //     teacher_assignments: [] // Array of {teacher_id, class_id}
// // // //   });

// // // //   useEffect(() => {
// // // //     loadAllData();
// // // //   }, []);

// // // //   const loadAllData = async () => {
// // // //     setLoading(true);
// // // //     await Promise.all([
// // // //       fetchSubjects(),
// // // //       fetchClasses(),
// // // //       fetchTeachers()
// // // //     ]);
// // // //     setLoading(false);
// // // //   };

// // // //   const fetchSubjects = async () => {
// // // //     try {
// // // //       const response = await adminAPI.getSubjects();
// // // //       setSubjects(response.data || []);
// // // //     } catch (error) {
// // // //       console.error('Failed to load subjects:', error);
// // // //       toast.error('Failed to load subjects');
// // // //     }
// // // //   };

// // // //   const fetchClasses = async () => {
// // // //     try {
// // // //       const response = await adminAPI.getClasses();
// // // //       setClasses(response.data || []);
// // // //     } catch (error) {
// // // //       console.error('Failed to load classes:', error);
// // // //     }
// // // //   };

// // // //   const fetchTeachers = async () => {
// // // //     try {
// // // //       const response = await adminAPI.getAvailableTeachers();
// // // //       setTeachers(response.data || []);
// // // //     } catch (error) {
// // // //       console.error('Failed to load teachers:', error);
// // // //     }
// // // //   };

// // // //   const handleCreateSubject = async (e) => {
// // // //     e.preventDefault();
    
// // // //     if (!newSubject.name.trim()) {
// // // //       toast.error('Subject name is required');
// // // //       return;
// // // //     }

// // // //     if (newSubject.class_ids.length === 0) {
// // // //       toast.error('Please select at least one class');
// // // //       return;
// // // //     }

// // // //     try {
// // // //       await adminAPI.createSubject(newSubject);
// // // //       toast.success('Subject created successfully!');
// // // //       setShowCreateModal(false);
// // // //       setNewSubject({ name: '', class_ids: [], teacher_assignments: [] });
// // // //       fetchSubjects();
// // // //     } catch (error) {
// // // //       console.error('Failed to create subject:', error);
// // // //       toast.error(error.response?.data?.error || 'Failed to create subject');
// // // //     }
// // // //   };

// // // //   const handleClassToggle = (classId) => {
// // // //     setNewSubject(prev => {
// // // //       const isSelected = prev.class_ids.includes(classId);
      
// // // //       if (isSelected) {
// // // //         // Remove class and its teacher assignments
// // // //         return {
// // // //           ...prev,
// // // //           class_ids: prev.class_ids.filter(id => id !== classId),
// // // //           teacher_assignments: prev.teacher_assignments.filter(
// // // //             ta => ta.class_id !== classId
// // // //           )
// // // //         };
// // // //       } else {
// // // //         // Add class
// // // //         return {
// // // //           ...prev,
// // // //           class_ids: [...prev.class_ids, classId]
// // // //         };
// // // //       }
// // // //     });
// // // //   };

// // // //   const handleTeacherAssignment = (classId, teacherId) => {
// // // //     setNewSubject(prev => {
// // // //       // Remove any existing assignment for this class
// // // //       const filtered = prev.teacher_assignments.filter(
// // // //         ta => ta.class_id !== classId
// // // //       );
      
// // // //       // Add new assignment if teacher is selected
// // // //       if (teacherId) {
// // // //         return {
// // // //           ...prev,
// // // //           teacher_assignments: [
// // // //             ...filtered,
// // // //             { teacher_id: parseInt(teacherId), class_id: classId }
// // // //           ]
// // // //         };
// // // //       } else {
// // // //         return {
// // // //           ...prev,
// // // //           teacher_assignments: filtered
// // // //         };
// // // //       }
// // // //     });
// // // //   };

// // // //   const getAssignedTeacher = (classId) => {
// // // //     const assignment = newSubject.teacher_assignments.find(
// // // //       ta => ta.class_id === classId
// // // //     );
// // // //     return assignment ? assignment.teacher_id : '';
// // // //   };

// // // //   const viewSubjectTeachers = async (subject) => {
// // // //     try {
// // // //       const response = await adminAPI.getSubjectTeachers(subject.id);
// // // //       setSubjectTeachers(response.data.assignments || []);
// // // //       setSelectedSubject(subject);
// // // //       setShowTeachersModal(true);
// // // //     } catch (error) {
// // // //       console.error('Failed to load subject teachers:', error);
// // // //       toast.error('Failed to load teachers for this subject');
// // // //     }
// // // //   };

// // // //   if (loading) return <Loading fullScreen />;

// // // //   return (
// // // //     <DashboardLayout>
// // // //       <div className="p-6 max-w-7xl mx-auto">
// // // //         {/* Header */}
// // // //         <div className="flex items-center justify-between mb-8">
// // // //           <div className="flex items-center space-x-4">
// // // //             <Link to="/admin/dashboard">
// // // //               <Button variant="secondary" size="sm">
// // // //                 <HiArrowLeft className="w-4 h-4 mr-2" />
// // // //                 Back
// // // //               </Button>
// // // //             </Link>
// // // //             <div>
// // // //               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // // //                 Manage Subjects
// // // //               </h1>
// // // //               <p className="text-gray-600 dark:text-gray-400 mt-1">
// // // //                 Create subjects and assign teachers to classes
// // // //               </p>
// // // //             </div>
// // // //           </div>
// // // //           <Button variant="primary" onClick={() => setShowCreateModal(true)}>
// // // //             <HiPlus className="w-5 h-5 mr-2" />
// // // //             Create Subject
// // // //           </Button>
// // // //         </div>

// // // //         {/* Subjects Grid */}
// // // //         {subjects.length === 0 ? (
// // // //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// // // //             <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// // // //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// // // //               No Subjects Yet
// // // //             </h3>
// // // //             <p className="text-gray-600 dark:text-gray-400 mb-6">
// // // //               Create your first subject to get started
// // // //             </p>
// // // //             <Button variant="primary" onClick={() => setShowCreateModal(true)}>
// // // //               <HiPlus className="w-5 h-5 mr-2" />
// // // //               Create First Subject
// // // //             </Button>
// // // //           </Card>
// // // //         ) : (
// // // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // //             {subjects.map(subject => (
// // // //               <Card key={subject.id} className="bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
// // // //                 <div className="p-6">
// // // //                   <div className="flex items-center justify-between mb-4">
// // // //                     <HiAcademicCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
// // // //                     <Button
// // // //                       variant="secondary"
// // // //                       size="sm"
// // // //                       onClick={() => viewSubjectTeachers(subject)}
// // // //                     >
// // // //                       <HiEye className="w-4 h-4 mr-1" />
// // // //                       View Teachers
// // // //                     </Button>
// // // //                   </div>
                  
// // // //                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
// // // //                     {subject.name}
// // // //                   </h3>
                  
// // // //                   <div className="space-y-2">
// // // //                     <div className="flex items-center justify-between text-sm">
// // // //                       <span className="text-gray-600 dark:text-gray-400">Classes:</span>
// // // //                       <span className="font-semibold text-gray-900 dark:text-white">
// // // //                         {subject.classes?.length || 0}
// // // //                       </span>
// // // //                     </div>
                    
// // // //                     {subject.classes && subject.classes.length > 0 && (
// // // //                       <div className="flex flex-wrap gap-2 mt-3">
// // // //                         {subject.classes.map(cls => (
// // // //                           <span
// // // //                             key={cls.id}
// // // //                             className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-xs font-semibold"
// // // //                           >
// // // //                             {cls.name}
// // // //                           </span>
// // // //                         ))}
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               </Card>
// // // //             ))}
// // // //           </div>
// // // //         )}

// // // //         {/* Create Subject Modal */}
// // // //         <Modal
// // // //           isOpen={showCreateModal}
// // // //           onClose={() => {
// // // //             setShowCreateModal(false);
// // // //             setNewSubject({ name: '', class_ids: [], teacher_assignments: [] });
// // // //           }}
// // // //           title="Create New Subject"
// // // //         >
// // // //           <form onSubmit={handleCreateSubject} className="space-y-6">
// // // //             {/* Subject Name */}
// // // //             <div>
// // // //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // // //                 Subject Name *
// // // //               </label>
// // // //               <input
// // // //                 type="text"
// // // //                 value={newSubject.name}
// // // //                 onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
// // // //                 placeholder="e.g., Mathematics, Science, English"
// // // //                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// // // //                 required
// // // //               />
// // // //             </div>

// // // //             {/* Class Selection with Teacher Assignment */}
// // // //             <div>
// // // //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
// // // //                 Select Classes & Assign Teachers (Optional) *
// // // //               </label>
              
// // // //               <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
// // // //                 {classes.map(cls => (
// // // //                   <div 
// // // //                     key={cls.id}
// // // //                     className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
// // // //                   >
// // // //                     {/* Class Checkbox */}
// // // //                     <label className="flex items-center cursor-pointer mb-2">
// // // //                       <input
// // // //                         type="checkbox"
// // // //                         checked={newSubject.class_ids.includes(cls.id)}
// // // //                         onChange={() => handleClassToggle(cls.id)}
// // // //                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
// // // //                       />
// // // //                       <span className="ml-2 font-semibold text-gray-900 dark:text-white">
// // // //                         {cls.name}
// // // //                       </span>
// // // //                     </label>

// // // //                     {/* Teacher Assignment for this class */}
// // // //                     {newSubject.class_ids.includes(cls.id) && (
// // // //                       <div className="ml-6 mt-2">
// // // //                         <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
// // // //                           Assign Teacher (Optional)
// // // //                         </label>
// // // //                         <select
// // // //                           value={getAssignedTeacher(cls.id)}
// // // //                           onChange={(e) => handleTeacherAssignment(cls.id, e.target.value)}
// // // //                           className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// // // //                         >
// // // //                           <option value="">No teacher assigned yet</option>
// // // //                           {teachers.map(teacher => (
// // // //                             <option key={teacher.id} value={teacher.id}>
// // // //                               {teacher.name} ({teacher.unique_id})
// // // //                             </option>
// // // //                           ))}
// // // //                         </select>
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
              
// // // //               <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
// // // //                 You can assign teachers now or later from the Teacher Assignments page
// // // //               </p>
// // // //             </div>

// // // //             {/* Summary */}
// // // //             {newSubject.class_ids.length > 0 && (
// // // //               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
// // // //                 <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
// // // //                   Summary
// // // //                 </h4>
// // // //                 <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
// // // //                   <li>• {newSubject.class_ids.length} class(es) selected</li>
// // // //                   <li>• {newSubject.teacher_assignments.length} teacher(s) assigned</li>
// // // //                 </ul>
// // // //               </div>
// // // //             )}

// // // //             {/* Form Actions */}
// // // //             <div className="flex space-x-3 pt-4">
// // // //               <Button type="submit" variant="primary" className="flex-1">
// // // //                 Create Subject
// // // //               </Button>
// // // //               <Button
// // // //                 type="button"
// // // //                 variant="secondary"
// // // //                 onClick={() => {
// // // //                   setShowCreateModal(false);
// // // //                   setNewSubject({ name: '', class_ids: [], teacher_assignments: [] });
// // // //                 }}
// // // //               >
// // // //                 Cancel
// // // //               </Button>
// // // //             </div>
// // // //           </form>
// // // //         </Modal>

// // // //         {/* View Subject Teachers Modal */}
// // // //         <Modal
// // // //           isOpen={showTeachersModal}
// // // //           onClose={() => {
// // // //             setShowTeachersModal(false);
// // // //             setSelectedSubject(null);
// // // //             setSubjectTeachers([]);
// // // //           }}
// // // //           title={`Teachers - ${selectedSubject?.name}`}
// // // //         >
// // // //           <div className="space-y-4">
// // // //             {subjectTeachers.length === 0 ? (
// // // //               <div className="text-center py-8">
// // // //                 <HiUserAdd className="w-12 h-12 text-gray-400 mx-auto mb-3" />
// // // //                 <p className="text-gray-600 dark:text-gray-400">
// // // //                   No teachers assigned to this subject yet
// // // //                 </p>
// // // //                 <Link to="/admin/teacher-assignments">
// // // //                   <Button variant="primary" className="mt-4">
// // // //                     <HiUserAdd className="w-4 h-4 mr-2" />
// // // //                     Assign Teachers
// // // //                   </Button>
// // // //                 </Link>
// // // //               </div>
// // // //             ) : (
// // // //               <div className="space-y-3">
// // // //                 {subjectTeachers.map(assignment => (
// // // //                   <div 
// // // //                     key={assignment.id}
// // // //                     className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
// // // //                   >
// // // //                     <div className="flex items-center justify-between">
// // // //                       <div>
// // // //                         <h4 className="font-semibold text-gray-900 dark:text-white">
// // // //                           {assignment.teacher?.name}
// // // //                         </h4>
// // // //                         <p className="text-sm text-gray-600 dark:text-gray-400">
// // // //                           {assignment.teacher?.unique_id} • {assignment.class?.name}
// // // //                         </p>
// // // //                       </div>
// // // //                       <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs font-semibold">
// // // //                         Active
// // // //                       </span>
// // // //                     </div>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </Modal>
// // // //       </div>
// // // //     </DashboardLayout>
// // // //   );
// // // // };

// // // // export default ManageSubjects;