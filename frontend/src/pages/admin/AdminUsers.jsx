import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loading from '../../components/common/Loading';
import { toast } from 'react-hot-toast';
import {
  HiUsers, HiSearch, HiCheckCircle,
  HiXCircle, HiTrash, HiPencil, HiEye, HiX, HiSave
} from 'react-icons/hi';

// ── Badges ────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    student: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    teacher: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    admin:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
};

// ✅ FIX: approved is now properly sent from backend as true/false
const StatusBadge = ({ approved }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
    approved
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  }`}>
    {approved ? 'Approved' : 'Pending'}
  </span>
);

// ── Modal ─────────────────────────────────────────────────
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-slate-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
          <HiX className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  </div>
);

// ── Input helper ──────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500";

// ─────────────────────────────────────────────────────────
const AdminUsers = () => {
  const navigate = useNavigate();

  const [allUsers,     setAllUsers]     = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [classList,    setClassList]    = useState([]);   // for student class dropdown
  const [subjectList,  setSubjectList]  = useState([]);   // for teacher subjects
  const [loading,      setLoading]      = useState(true);

  const [activeTab,   setActiveTab]   = useState('all');
  const [roleFilter,  setRoleFilter]  = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [viewUser,  setViewUser]  = useState(null);
  const [editUser,  setEditUser]  = useState(null);
  const [editForm,  setEditForm]  = useState({});
  const [saving,    setSaving]    = useState(false);

  // ── fetch ─────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [allRes, pendRes, classRes, subjectRes] = await Promise.allSettled([
        adminAPI.getAllUsers(),
        adminAPI.getPendingUsers(),
        adminAPI.getClasses(),
        adminAPI.getSubjects(),
      ]);

      if (allRes.status === 'fulfilled')     setAllUsers(allRes.value.data || []);
      if (pendRes.status === 'fulfilled')    setPendingUsers(pendRes.value.data || []);
      if (classRes.status === 'fulfilled')   setClassList(classRes.value.data || []);
      if (subjectRes.status === 'fulfilled') setSubjectList(subjectRes.value.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── approve ──────────────────────────────────────────
  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('User approved! Approval email sent.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed');
    }
  };

  // ── reject ───────────────────────────────────────────
  const handleReject = async (userId) => {
    if (!window.confirm('Reject and delete this pending user?')) return;
    try {
      await adminAPI.rejectUser(userId);
      toast.success('User rejected and removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reject failed');
    }
  };

  // ── delete ───────────────────────────────────────────
  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  // ── open edit ────────────────────────────────────────
  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      first_name:       user.first_name       || '',
      last_name:        user.last_name        || '',
      phone:            user.phone            || '',
      email:            user.email            || '',
      // student
      class_assigned_id: user.class_assigned_id || '',
      // teacher — pre-select their current subject ids
      subject_ids: (user.subjects || []).map(s => s.id),
    });
  };

  // ── toggle subject selection ─────────────────────────
  const toggleSubject = (subjectId) => {
    setEditForm(prev => {
      const ids = prev.subject_ids || [];
      return {
        ...prev,
        subject_ids: ids.includes(subjectId)
          ? ids.filter(id => id !== subjectId)
          : [...ids, subjectId],
      };
    });
  };

  // ── save edit ────────────────────────────────────────
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(editUser.id, editForm);
      toast.success('User updated successfully');
      setEditUser(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ── filter ───────────────────────────────────────────
  const baseList = activeTab === 'pending' ? pendingUsers : allUsers;
  const displayed = baseList.filter(u => {
    const matchRole = !roleFilter || u.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name  || '').toLowerCase().includes(q) ||
      (u.email      || '').toLowerCase().includes(q) ||
      (u.unique_id  || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Approve, edit, or remove users from EduVibe</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
            ← Back to Dashboard
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            ['Total',    allUsers.length,                                    'blue'],
            ['Pending',  pendingUsers.length,                                'yellow'],
            ['Students', allUsers.filter(u => u.role === 'student').length,  'green'],
            ['Teachers', allUsers.filter(u => u.role === 'teacher').length,  'purple'],
          ].map(([label, count, color]) => (
            <div key={label} className={`px-4 py-2 bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-xl text-sm font-semibold text-${color}-700 dark:text-${color}-300`}>
              {label}: {count}
            </div>
          ))}
        </div>

        {/* Tabs + filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
            {[
              { key: 'all',     label: `All Users (${allUsers.length})` },
              { key: 'pending', label: `Pending (${pendingUsers.length})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setRoleFilter(''); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </select>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search name / email / ID..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-56" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <HiUsers className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Unique ID</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {displayed.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : <span className="text-gray-400">{user.username}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-3">
                        {/* ✅ is_approved now properly comes from backend */}
                        <StatusBadge approved={user.is_approved} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{user.unique_id || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <button onClick={() => setViewUser(user)} title="View Details"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                            <HiEye className="h-4 w-4" />
                          </button>
                          <button onClick={() => openEdit(user)} title="Edit User"
                            className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition">
                            <HiPencil className="h-4 w-4" />
                          </button>
                          {!user.is_approved && (
                            <button onClick={() => handleApprove(user.id)} title="Approve"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition">
                              <HiCheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {!user.is_approved && (
                            <button onClick={() => handleReject(user.id)} title="Reject"
                              className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition">
                              <HiXCircle className="h-4 w-4" />
                            </button>
                          )}
                          {user.is_approved && (
                            <button onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)} title="Delete"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                              <HiTrash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── VIEW MODAL ────────────────────────────────── */}
      {viewUser && (
        <Modal title="User Details" onClose={() => setViewUser(null)}>
          <div className="space-y-0 text-sm">
            {[
              ['Full Name',     `${viewUser.first_name || ''} ${viewUser.last_name || ''}`.trim() || viewUser.username],
              ['Email',         viewUser.email],
              ['Phone',         viewUser.phone || '—'],
              ['Role',          viewUser.role],
              ['Status',        viewUser.is_approved ? '✅ Approved' : '⏳ Pending'],
              ['Unique ID',     viewUser.unique_id || '—'],
              ['Date of Birth', viewUser.dob || '—'],
              ['Joined',        viewUser.date_joined ? new Date(viewUser.date_joined).toLocaleDateString() : '—'],
              // ✅ FIX: was class_assigned__name (wrong key), now class_assigned_name
              ['Class',         viewUser.class_assigned_name || '—'],
              // ✅ NEW: show subjects for teachers
              ['Subjects',      viewUser.role === 'teacher'
                ? (viewUser.subjects?.length ? viewUser.subjects.map(s => s.name).join(', ') : '—')
                : undefined],
            ].filter(([, v]) => v !== undefined).map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="font-medium text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-gray-900 dark:text-white text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── EDIT MODAL ────────────────────────────────── */}
      {editUser && (
        <Modal title={`Edit — ${editUser.first_name} ${editUser.last_name}`} onClose={() => setEditUser(null)}>
          <div className="space-y-4">

            {/* Basic fields — same for everyone */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name">
                <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Last Name">
                <input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <Field label="Email">
              <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} />
            </Field>

            {/* ✅ NEW: Class dropdown — only for students */}
            {editUser.role === 'student' && (
              <Field label="Assigned Class">
                <select
                  value={editForm.class_assigned_id || ''}
                  onChange={e => setEditForm(p => ({ ...p, class_assigned_id: e.target.value ? Number(e.target.value) : '' }))}
                  className={inputCls}
                >
                  <option value="">— No class assigned —</option>
                  {classList.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </Field>
            )}

            {/* ✅ NEW: Subject checkboxes — only for teachers */}
            {editUser.role === 'teacher' && subjectList.length > 0 && (
              <Field label="Assigned Subjects">
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {subjectList.map(subject => (
                    <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(editForm.subject_ids || []).includes(subject.id)}
                        onChange={() => toggleSubject(subject.id)}
                        className="w-4 h-4 rounded accent-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{subject.name}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditUser(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-2 disabled:opacity-60">
                <HiSave className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </DashboardLayout>
  );
};

export default AdminUsers;


























// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { adminAPI } from '../../services/api';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Loading from '../../components/common/Loading';
// import { toast } from 'react-hot-toast';
// import {
//   HiUsers, HiAcademicCap, HiSearch, HiCheckCircle,
//   HiXCircle, HiTrash, HiPencil, HiEye, HiX, HiSave
// } from 'react-icons/hi';

// // ── small badge helper ────────────────────────────────────
// const RoleBadge = ({ role }) => {
//   const map = {
//     student: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
//     teacher: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
//     admin:   'bg-red-100   text-red-800   dark:bg-red-900/30   dark:text-red-400',
//   };
//   return (
//     <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[role] || 'bg-gray-100 text-gray-700'}`}>
//       {role}
//     </span>
//   );
// };

// const StatusBadge = ({ approved }) => (
//   <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
//     approved
//       ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
//       : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
//   }`}>
//     {approved ? 'Approved' : 'Pending'}
//   </span>
// );

// // ── Modal overlay ─────────────────────────────────────────
// const Modal = ({ title, children, onClose }) => (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//     <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
//       <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//         <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
//         <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
//           <HiX className="h-5 w-5" />
//         </button>
//       </div>
//       <div className="px-6 py-4">{children}</div>
//     </div>
//   </div>
// );

// // ─────────────────────────────────────────────────────────
// const AdminUsers = () => {
//   const navigate = useNavigate();

//   // data
//   const [allUsers,     setAllUsers]     = useState([]);
//   const [pendingUsers, setPendingUsers] = useState([]);
//   const [loading,      setLoading]      = useState(true);

//   // UI state
//   const [activeTab,    setActiveTab]    = useState('all');   // 'all' | 'pending'
//   const [roleFilter,   setRoleFilter]   = useState('');      // '' | 'student' | 'teacher'
//   const [searchQuery,  setSearchQuery]  = useState('');

//   // modals
//   const [viewUser,  setViewUser]  = useState(null);   // user object to view
//   const [editUser,  setEditUser]  = useState(null);   // user object to edit
//   const [editForm,  setEditForm]  = useState({});
//   const [saving,    setSaving]    = useState(false);

//   // ── fetch ───────────────────────────────────────────────
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [allRes, pendRes] = await Promise.all([
//         adminAPI.getAllUsers(),
//         adminAPI.getPendingUsers(),
//       ]);
//       setAllUsers(allRes.data || []);
//       setPendingUsers(pendRes.data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   // ── approve ─────────────────────────────────────────────
//   const handleApprove = async (userId) => {
//     try {
//       await adminAPI.approveUser(userId);
//       toast.success('User approved! Approval email sent.');
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Approval failed');
//     }
//   };

//   // ── reject (pending only) ────────────────────────────────
//   const handleReject = async (userId) => {
//     if (!window.confirm('Reject and delete this pending user?')) return;
//     try {
//       await adminAPI.rejectUser(userId);
//       toast.success('User rejected and removed');
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Reject failed');
//     }
//   };

//   // ── delete approved user ─────────────────────────────────
//   const handleDelete = async (userId, name) => {
//     if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
//     try {
//       await adminAPI.deleteUser(userId);
//       toast.success('User deleted');
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Delete failed');
//     }
//   };

//   // ── open edit modal ──────────────────────────────────────
//   const openEdit = (user) => {
//     setEditUser(user);
//     setEditForm({
//       first_name: user.first_name || '',
//       last_name:  user.last_name  || '',
//       phone:      user.phone      || '',
//       email:      user.email      || '',
//     });
//   };

//   // ── save edit ────────────────────────────────────────────
//   const handleSaveEdit = async () => {
//     setSaving(true);
//     try {
//       await adminAPI.updateUser(editUser.id, editForm);
//       toast.success('User updated successfully');
//       setEditUser(null);
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Update failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── filter helpers ───────────────────────────────────────
//   const baseList = activeTab === 'pending' ? pendingUsers : allUsers;

//   const displayed = baseList.filter(u => {
//     const matchRole = !roleFilter || u.role === roleFilter;
//     const q = searchQuery.toLowerCase();
//     const matchSearch =
//       !q ||
//       (u.first_name || '').toLowerCase().includes(q) ||
//       (u.last_name  || '').toLowerCase().includes(q) ||
//       (u.email      || '').toLowerCase().includes(q) ||
//       (u.unique_id  || '').toLowerCase().includes(q);
//     return matchRole && matchSearch;
//   });

//   // ── loading ──────────────────────────────────────────────
//   if (loading) {
//     return <DashboardLayout><Loading /></DashboardLayout>;
//   }

//   // ── render ───────────────────────────────────────────────
//   return (
//     <DashboardLayout>
//       <div className="space-y-6">

//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-1">
//               Approve, edit, or remove users from EduVibe
//             </p>
//           </div>
//           <button
//             onClick={() => navigate('/admin/dashboard')}
//             className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
//           >
//             ← Back to Dashboard
//           </button>
//         </div>

//         {/* Summary chips */}
//         <div className="flex flex-wrap gap-3">
//           <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300">
//             Total: {allUsers.length}
//           </div>
//           <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm font-semibold text-yellow-700 dark:text-yellow-300">
//             Pending: {pendingUsers.length}
//           </div>
//           <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm font-semibold text-green-700 dark:text-green-300">
//             Students: {allUsers.filter(u => u.role === 'student').length}
//           </div>
//           <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-sm font-semibold text-purple-700 dark:text-purple-300">
//             Teachers: {allUsers.filter(u => u.role === 'teacher').length}
//           </div>
//         </div>

//         {/* Tabs + filters */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-3
//                         bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">

//           {/* Tabs */}
//           <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
//             {[
//               { key: 'all',     label: `All Users (${allUsers.length})` },
//               { key: 'pending', label: `Pending (${pendingUsers.length})` },
//             ].map(tab => (
//               <button
//                 key={tab.key}
//                 onClick={() => { setActiveTab(tab.key); setRoleFilter(''); }}
//                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
//                   activeTab === tab.key
//                     ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow'
//                     : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           <div className="flex items-center gap-2 flex-wrap">
//             {/* Role filter */}
//             <select
//               value={roleFilter}
//               onChange={e => setRoleFilter(e.target.value)}
//               className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5
//                          bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="">All Roles</option>
//               <option value="student">Students</option>
//               <option value="teacher">Teachers</option>
//             </select>

//             {/* Search */}
//             <div className="relative">
//               <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search name / email / ID..."
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
//                            bg-white dark:bg-slate-700 text-gray-900 dark:text-white
//                            focus:outline-none focus:ring-2 focus:ring-purple-500 w-56"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//           {displayed.length === 0 ? (
//             <div className="text-center py-16 text-gray-400 dark:text-gray-500">
//               <HiUsers className="h-12 w-12 mx-auto mb-3 opacity-40" />
//               <p className="text-lg font-medium">No users found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-gray-50 dark:bg-slate-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     <th className="px-4 py-3">Name</th>
//                     <th className="px-4 py-3">Email</th>
//                     <th className="px-4 py-3">Role</th>
//                     <th className="px-4 py-3">Status</th>
//                     <th className="px-4 py-3">Unique ID</th>
//                     <th className="px-4 py-3">Joined</th>
//                     <th className="px-4 py-3 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
//                   {displayed.map(user => (
//                     <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
//                       <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
//                         {user.first_name} {user.last_name}
//                         {!user.first_name && !user.last_name && (
//                           <span className="text-gray-400">{user.username}</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
//                       <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
//                       <td className="px-4 py-3"><StatusBadge approved={user.is_approved} /></td>
//                       <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
//                         {user.unique_id || '—'}
//                       </td>
//                       <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
//                         {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center justify-center gap-1 flex-wrap">

//                           {/* View */}
//                           <button
//                             onClick={() => setViewUser(user)}
//                             title="View Details"
//                             className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
//                           >
//                             <HiEye className="h-4 w-4" />
//                           </button>

//                           {/* Edit */}
//                           <button
//                             onClick={() => openEdit(user)}
//                             title="Edit User"
//                             className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition"
//                           >
//                             <HiPencil className="h-4 w-4" />
//                           </button>

//                           {/* Approve (only for pending) */}
//                           {!user.is_approved && (
//                             <button
//                               onClick={() => handleApprove(user.id)}
//                               title="Approve User"
//                               className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
//                             >
//                               <HiCheckCircle className="h-4 w-4" />
//                             </button>
//                           )}

//                           {/* Reject (only pending) */}
//                           {!user.is_approved && (
//                             <button
//                               onClick={() => handleReject(user.id)}
//                               title="Reject User"
//                               className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition"
//                             >
//                               <HiXCircle className="h-4 w-4" />
//                             </button>
//                           )}

//                           {/* Delete (approved users) */}
//                           {user.is_approved && (
//                             <button
//                               onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
//                               title="Delete User"
//                               className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
//                             >
//                               <HiTrash className="h-4 w-4" />
//                             </button>
//                           )}

//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── VIEW MODAL ─────────────────────────────────── */}
//       {viewUser && (
//         <Modal title="User Details" onClose={() => setViewUser(null)}>
//           <div className="space-y-3 text-sm">
//             {[
//               ['Full Name',  `${viewUser.first_name || ''} ${viewUser.last_name || ''}`.trim() || viewUser.username],
//               ['Email',      viewUser.email],
//               ['Phone',      viewUser.phone || '—'],
//               ['Role',       viewUser.role],
//               ['Status',     viewUser.is_approved ? 'Approved' : 'Pending'],
//               ['Unique ID',  viewUser.unique_id || '—'],
//               ['Date of Birth', viewUser.dob || '—'],
//               ['Joined',     viewUser.date_joined ? new Date(viewUser.date_joined).toLocaleDateString() : '—'],
//               ['Class',      viewUser.class_assigned__name || '—'],
//             ].map(([label, value]) => (
//               <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
//                 <span className="font-medium text-gray-500 dark:text-gray-400">{label}</span>
//                 <span className="text-gray-900 dark:text-white">{value}</span>
//               </div>
//             ))}
//           </div>
//         </Modal>
//       )}

//       {/* ── EDIT MODAL ─────────────────────────────────── */}
//       {editUser && (
//         <Modal title={`Edit – ${editUser.first_name} ${editUser.last_name}`} onClose={() => setEditUser(null)}>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">First Name</label>
//                 <input
//                   value={editForm.first_name}
//                   onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))}
//                   className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
//                              bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Last Name</label>
//                 <input
//                   value={editForm.last_name}
//                   onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))}
//                   className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
//                              bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
//               <input
//                 value={editForm.email}
//                 onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
//                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
//                            bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
//               <input
//                 value={editForm.phone}
//                 onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
//                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
//                            bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//             </div>
//             <div className="flex justify-end gap-2 pt-2">
//               <button
//                 onClick={() => setEditUser(null)}
//                 className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveEdit}
//                 disabled={saving}
//                 className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-2 disabled:opacity-60"
//               >
//                 <HiSave className="h-4 w-4" />
//                 {saving ? 'Saving…' : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//     </DashboardLayout>
//   );
// };

// export default AdminUsers;