// src/pages/CompleteProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api, { authAPI } from '../services/api';

/**
 * Shown after Google sign-in when is_new_user === true.
 * Collects: phone, dob, and either class (student) or subjects (teacher).
 * Calls POST /api/users/auth/google/complete/
 */
const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [classes, setClasses]   = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Read user from localStorage (set by GoogleAuthButton)
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role       = storedUser.role || 'student';
  const firstName  = storedUser.first_name || '';

  const [formData, setFormData] = useState({
    phone:      '',
    dob:        '',
    class_id:   '',
    subject_ids: [],
  });

  // ── Guard: if no token or profile already complete, redirect ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    if (storedUser.profile_complete) {
      if (role === 'student')      navigate('/student/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else                         navigate('/admin/dashboard');
    }
  }, []);

  // ── Fetch classes & subjects ──────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authAPI.getRegistrationData();
        setClasses(res.data.classes   || []);
        setSubjects(res.data.subjects || []);
      } catch {
        toast.error('Failed to load class/subject data.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectToggle = (id) => {
    setFormData(prev => {
      const current = prev.subject_ids;
      if (current.includes(id)) {
        return { ...prev, subject_ids: current.filter(s => s !== id) };
      }
      if (current.length >= 3) {
        toast.error('Maximum 3 subjects allowed.');
        return prev;
      }
      return { ...prev, subject_ids: [...current, id] };
    });
  };

  const validate = () => {
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      toast.error('Phone must be exactly 10 digits.'); return false;
    }
    if (!formData.dob) {
      toast.error('Date of birth is required.'); return false;
    }
    if (role === 'student' && !formData.class_id) {
      toast.error('Please select your class.'); return false;
    }
    if (role === 'teacher' && formData.subject_ids.length === 0) {
      toast.error('Please select at least one subject.'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        phone: formData.phone,
        dob:   formData.dob,
      };
      if (role === 'student') payload.class_id     = parseInt(formData.class_id);
      if (role === 'teacher') payload.subject_ids  = formData.subject_ids;

      const res = await api.post('/api/users/auth/google/complete/', payload);

      // Update stored user
      const updatedUser = { ...storedUser, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Profile completed! Awaiting admin approval.');
      // Send them to a holding / pending page or login
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl mb-4">
              <span className="text-3xl">{role === 'teacher' ? '👨‍🏫' : '🎓'}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Complete Your Profile
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Hi {firstName}! Just a few more details and you're all set.
            </p>

            {/* Role badge */}
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
              ${role === 'teacher'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
              }`}>
              {role}
            </span>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-white">✓</div>
              <div className="flex-1 h-0.5 bg-teal-500/40" />
              <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-white">2</div>
              <div className="flex-1 h-0.5 bg-slate-700" />
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">3</div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 -mt-6 mb-8 px-1">
            <span>Google</span>
            <span className="text-teal-400">Details</span>
            <span>Pending</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">+91</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="9876543210"
                  className="w-full pl-14 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date of Birth <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white
                  focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                required
              />
            </div>

            {/* Student: Class selector */}
            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Your Class <span className="text-red-400">*</span>
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Teacher: Subject checkboxes */}
            {role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Subjects (1–3) <span className="text-red-400">*</span>
                </label>
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 max-h-52 overflow-y-auto space-y-2">
                  {subjects.map(subject => (
                    <label
                      key={subject.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all
                        ${formData.subject_ids.includes(subject.id)
                          ? 'bg-teal-500/10 border border-teal-500/30'
                          : 'hover:bg-slate-700/40 border border-transparent'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border flex-shrink-0 transition-all
                        ${formData.subject_ids.includes(subject.id)
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-slate-600 bg-slate-800'
                        }`}
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        {formData.subject_ids.includes(subject.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm ${formData.subject_ids.includes(subject.id) ? 'text-teal-300' : 'text-slate-300'}`}
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        {subject.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${formData.subject_ids.length > 0 ? 'text-teal-400' : 'text-slate-500'}`}>
                  {formData.subject_ids.length} / 3 selected
                </p>
              </div>
            )}

            {/* What happens next notice */}
            <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <span className="text-amber-400 text-lg flex-shrink-0">⏳</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                After submitting, your account will be reviewed by an admin.
                You'll be able to log in once approved.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50
                text-white font-semibold rounded-xl transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-teal-500/50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Registration
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;