// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import GoogleAuthButton from '../components/common/GoogleAuthButton';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [role, setRole] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    classId: '',
    subjectIds: [],
  });

  const [otpData, setOtpData] = useState({
    email: '',
    otp: '',
  });

  // Fetch classes and subjects on mount
  useEffect(() => {
    fetchRegistrationData();
  }, []);

  const fetchRegistrationData = async () => {
    try {
      const response = await authAPI.getRegistrationData();
      setClasses(response.data.classes || []);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Error fetching registration data:', error);
      toast.error('Failed to load registration data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'subjectIds') {
      const subjectId = parseInt(value);
      setFormData((prev) => {
        const currentSubjects = prev.subjectIds || [];
        if (checked) {
          if (currentSubjects.length >= 3) {
            toast.error('Maximum 3 subjects allowed');
            return prev;
          }
          return { ...prev, subjectIds: [...currentSubjects, subjectId] };
        } else {
          return {
            ...prev,
            subjectIds: currentSubjects.filter((id) => id !== subjectId),
          };
        }
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const validateForm = () => {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      dob,
      classId,
      subjectIds,
    } = formData;

    if (!email || !password || !firstName || !lastName || !phone || !dob) {
      toast.error('Please fill all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Phone number must be 10 digits');
      return false;
    }

    if (role === 'student' && !classId) {
      toast.error('Please select a class');
      return false;
    }

    if (role === 'teacher' && (!subjectIds || subjectIds.length === 0)) {
      toast.error('Please select at least 1 subject');
      return false;
    }

    if (role === 'teacher' && subjectIds.length > 3) {
      toast.error('Maximum 3 subjects allowed');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        role: formData.role,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        dob: formData.dob,
      };

      if (role === 'student') {
        payload.class_id = parseInt(formData.classId);
      } else if (role === 'teacher') {
        payload.subject_ids = formData.subjectIds;
      }

      const response = await authAPI.register(payload);
      
      toast.success(response.message || 'Registration successful! Check your email for OTP');
      
      // Move to OTP verification step
      setOtpData({ email: formData.email, otp: '' });
      setStep(2);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Registration failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otpData.otp || otpData.otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyRegistrationOTP({
        email: otpData.email,
        otp: otpData.otp,
      });

      toast.success(response.data.message || 'Email verified! Please wait for admin approval');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'OTP verification failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await authAPI.resendOTP(otpData.email);
      toast.success('OTP resent to your email');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
            EduVibe
          </h1>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>

        {/* Registration Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8">
          
          {/* ========== STEP 1: REGISTRATION FORM ========== */}
          {step === 1 ? (
            <>
              {/* Role Selection */}
              {!role && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white text-center mb-6">
                    Select Your Role
                  </h2>
                  <button
                    onClick={() => handleRoleSelect('student')}
                    className="w-full p-6 bg-gradient-to-r from-magenta-600 to-cyan-800 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-3xl mb-2">🎓</div>
                    <div className="text-xl">Register as Student</div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('teacher')}
                    className="w-full p-6 bg-gradient-to-r from-magenta-600 to-cyan-600 hover:from-teal-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-3xl mb-2">👨‍🏫</div>
                    <div className="text-xl">Register as Teacher</div>
                  </button>
                  <div className="text-center mt-6">
                    <Link
                      to="/login"
                      className="text-teal-400 hover:text-teal-300 text-sm"
                    >
                      Already have an account? Login
                    </Link>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              {role && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {role === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'} Registration
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('');
                        setFormData({ ...formData, role: '', classId: '', subjectIds: [] });
                      }}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      Change Role
                    </button>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone (10 digits) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Student: Class Selection */}
                  {role === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Class *
                      </label>
                      <select
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                        required
                      >
                        <option value="">-- Select Class --</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Teacher: Subject Selection */}
                  {role === 'teacher' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Subjects (1-3) *
                      </label>
                      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                        {subjects.map((subject) => (
                          <label
                            key={subject.id}
                            className="flex items-center space-x-3 p-2 hover:bg-slate-700/30 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              name="subjectIds"
                              value={subject.id}
                              checked={formData.subjectIds.includes(subject.id)}
                              onChange={handleChange}
                              className="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
                            />
                            <span className="text-slate-300">{subject.name}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Selected: {formData.subjectIds.length} / 3
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                      placeholder="Re-enter password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      'Register'
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-teal-400 hover:text-teal-300 text-sm"
                    >
                      Already have an account? Login
                    </Link>
                  </div>
                </form>
              )}
            </>
          ) : (
            
            /* ========== STEP 2: OTP VERIFICATION ========== */
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Email</h2>
                <p className="text-slate-400">
                  Enter the 6-digit OTP sent to <br />
                  <span className="text-teal-400 font-semibold">{otpData.email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otpData.otp}
                  onChange={(e) =>
                    setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })
                  }
                  maxLength="6"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="space-y-4">

  {/* ...your existing register form... */}

  {/* Divider */}
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-slate-700" />
    </div>
    <div className="relative flex justify-center">
      <span className="px-4 bg-slate-900 text-slate-500 text-sm">or sign up with</span>
    </div>
  </div>

  {/* role comes from your existing role state / formData.role */}
  <GoogleAuthButton role={role} />

</div>

              

              

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-teal-400 hover:text-teal-300 text-sm disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ← Back to Registration
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;



