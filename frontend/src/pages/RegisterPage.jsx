// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';

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













































// // src/pages/RegisterPage.jsx
// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { authAPI } from '../services/api';

// const RegisterPage = () => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
//   const [role, setRole] = useState('');
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(true);

//   const [formData, setFormData] = useState({
//     role: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     firstName: '',
//     lastName: '',
//     phone: '',
//     dob: '',
//     classId: '',
//     subjectIds: [],
//   });

//   const [otpData, setOtpData] = useState({
//     email: '',
//     otp: '',
//   });

//   // Fetch classes and subjects on mount
//   useEffect(() => {
//     fetchRegistrationData();
//   }, []);

//   const fetchRegistrationData = async () => {
//     try {
//       const response = await authAPI.getRegistrationData();
//       setClasses(response.data.classes || []);
//       setSubjects(response.data.subjects || []);
//     } catch (error) {
//       console.error('Error fetching registration data:', error);
//       toast.error('Failed to load registration data');
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name === 'subjectIds') {
//       // Handle multiple subject selection
//       const subjectId = parseInt(value);
//       setFormData((prev) => {
//         const currentSubjects = prev.subjectIds || [];
//         if (checked) {
//           // Add subject (max 3)
//           if (currentSubjects.length >= 3) {
//             toast.error('Maximum 3 subjects allowed');
//             return prev;
//           }
//           return { ...prev, subjectIds: [...currentSubjects, subjectId] };
//         } else {
//           // Remove subject
//           return {
//             ...prev,
//             subjectIds: currentSubjects.filter((id) => id !== subjectId),
//           };
//         }
//       });
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleRoleSelect = (selectedRole) => {
//     setRole(selectedRole);
//     setFormData((prev) => ({ ...prev, role: selectedRole }));
//   };

//   const validateForm = () => {
//     const {
//       email,
//       password,
//       confirmPassword,
//       firstName,
//       lastName,
//       phone,
//       dob,
//       classId,
//       subjectIds,
//     } = formData;

//     if (!email || !password || !firstName || !lastName || !phone || !dob) {
//       toast.error('Please fill all required fields');
//       return false;
//     }

//     if (password !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return false;
//     }

//     if (password.length < 8) {
//       toast.error('Password must be at least 8 characters');
//       return false;
//     }

//     if (phone.length !== 10 || !/^\d+$/.test(phone)) {
//       toast.error('Phone number must be 10 digits');
//       return false;
//     }

//     if (role === 'student' && !classId) {
//       toast.error('Please select a class');
//       return false;
//     }

//     if (role === 'teacher' && (!subjectIds || subjectIds.length === 0)) {
//       toast.error('Please select at least 1 subject');
//       return false;
//     }

//     if (role === 'teacher' && subjectIds.length > 3) {
//       toast.error('Maximum 3 subjects allowed');
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       const payload = {
//         role: formData.role,
//         email: formData.email,
//         password: formData.password,
//         first_name: formData.firstName,
//         last_name: formData.lastName,
//         phone: formData.phone,
//         dob: formData.dob,
//       };

//       if (role === 'student') {
//         payload.class_id = parseInt(formData.classId);
//       } else if (role === 'teacher') {
//         payload.subject_ids = formData.subjectIds;
//       }

//       const response = await authAPI.register(payload);
      
//       toast.success(response.message || 'Registration successful! Check your email for OTP');
      
//       setOtpData({ email: formData.email, otp: '' });
//       setStep(2);
//     } catch (error) {
//       const errorMsg = error.error || error.message || 'Registration failed';
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();

//     if (!otpData.otp || otpData.otp.length !== 6) {
//       toast.error('Please enter 6-digit OTP');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await authAPI.verifyRegistrationOTP({
//         email: otpData.email,
//         otp: otpData.otp,
//       });

//       toast.success(response.message || 'Email verified! Please wait for admin approval');
      
//       setTimeout(() => {
//         navigate('/login');
//       }, 2000);
//     } catch (error) {
//       const errorMsg = error.error || error.message || 'OTP verification failed';
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     setLoading(true);
//     try {
//       await authAPI.resendOTP(otpData.email);
//       toast.success('OTP resent to your email');
//     } catch (error) {
//       toast.error('Failed to resend OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 px-4 py-12">
//       <div className="max-w-md w-full">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
//             EduVibe
//           </h1>
//           <p className="text-slate-400 mt-2">Create your account</p>
//         </div>

//         {/* Registration Card */}
//         <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8">
//           {step === 1 ? (
//             <>
//               {/* Role Selection */}
//               {!role && (
//                 <div className="space-y-4">
//                   <h2 className="text-2xl font-bold text-white text-center mb-6">
//                     Select Your Role
//                   </h2>
//                   <button
//                     onClick={() => handleRoleSelect('student')}
//                     className="w-full p-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
//                   >
//                     <div className="text-3xl mb-2">🎓</div>
//                     <div className="text-xl">Register as Student</div>
//                   </button>
//                   <button
//                     onClick={() => handleRoleSelect('teacher')}
//                     className="w-full p-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
//                   >
//                     <div className="text-3xl mb-2">👨‍🏫</div>
//                     <div className="text-xl">Register as Teacher</div>
//                   </button>
//                   <div className="text-center mt-6">
//                     <Link
//                       to="/login"
//                       className="text-teal-400 hover:text-teal-300 text-sm"
//                     >
//                       Already have an account? Login
//                     </Link>
//                   </div>
//                 </div>
//               )}

//               {/* Registration Form */}
//               {role && (
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="flex items-center justify-between mb-6">
//                     <h2 className="text-xl font-bold text-white">
//                       {role === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'} Registration
//                     </h2>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setRole('');
//                         setFormData({ ...formData, role: '', classId: '', subjectIds: [] });
//                       }}
//                       className="text-slate-400 hover:text-white text-sm"
//                     >
//                       Change Role
//                     </button>
//                   </div>

//                   {/* Personal Info */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-slate-300 mb-2">
//                         First Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="firstName"
//                         value={formData.firstName}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                         placeholder="John"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-300 mb-2">
//                         Last Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="lastName"
//                         value={formData.lastName}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                         placeholder="Doe"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-300 mb-2">
//                       Email *
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                       placeholder="your.email@example.com"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-300 mb-2">
//                       Phone (10 digits) *
//                     </label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       maxLength="10"
//                       className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                       placeholder="9876543210"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-300 mb-2">
//                       Date of Birth *
//                     </label>
//                     <input
//                       type="date"
//                       name="dob"
//                       value={formData.dob}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                       required
//                     />
//                   </div>

//                   {/* Student: Class Selection */}
//                   {role === 'student' && (
//                     <div>
//                       <label className="block text-sm font-medium text-slate-300 mb-2">
//                         Select Class *
//                       </label>
//                       <select
//                         name="classId"
//                         value={formData.classId}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                         required
//                       >
//                         <option value="">-- Select Class --</option>
//                         {classes.map((cls) => (
//                           <option key={cls.id} value={cls.id}>
//                             {cls.name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}

//                   {/* Teacher: Subject Selection */}
//                   {role === 'teacher' && (
//                     <div>
//                       <label className="block text-sm font-medium text-slate-300 mb-2">
//                         Select Subjects (1-3) *
//                       </label>
//                       <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
//                         {subjects.map((subject) => (
//                           <label
//                             key={subject.id}
//                             className="flex items-center space-x-3 p-2 hover:bg-slate-700/30 rounded cursor-pointer"
//                           >
//                             <input
//                               type="checkbox"
//                               name="subjectIds"
//                               value={subject.id}
//                               checked={formData.subjectIds.includes(subject.id)}
//                               onChange={handleChange}
//                               className="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
//                             />
//                             <span className="text-slate-300">{subject.name}</span>
//                           </label>
//                         ))}
//                       </div>
//                       <p className="text-xs text-slate-500 mt-2">
//                         Selected: {formData.subjectIds.length} / 3
//                       </p>
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-medium text-slate-300 mb-2">
//                       Password *
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                       placeholder="Min 8 characters"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-300 mb-2">
//                       Confirm Password *
//                     </label>
//                     <input
//                       type="password"
//                       name="confirmPassword"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                       placeholder="Re-enter password"
//                       required
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
//                   >
//                     {loading ? (
//                       <span className="flex items-center justify-center">
//                         <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                             fill="none"
//                           />
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           />
//                         </svg>
//                         Registering...
//                       </span>
//                     ) : (
//                       'Register'
//                     )}
//                   </button>

//                   <div className="text-center">
//                     <Link
//                       to="/login"
//                       className="text-teal-400 hover:text-teal-300 text-sm"
//                     >
//                       Already have an account? Login
//                     </Link>
//                   </div>
//                 </form>
//               )}
//             </>
//           ) : (
//             /* OTP Verification */
//             <form onSubmit={handleOtpSubmit} className="space-y-6">
//               <div className="text-center">
//                 <div className="text-5xl mb-4">📧</div>
//                 <h2 className="text-2xl font-bold text-white mb-2">Verify Email</h2>
//                 <p className="text-slate-400">
//                   Enter the 6-digit OTP sent to <br />
//                   <span className="text-teal-400 font-semibold">{otpData.email}</span>
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   OTP Code
//                 </label>
//                 <input
//                   type="text"
//                   value={otpData.otp}
//                   onChange={(e) =>
//                     setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })
//                   }
//                   maxLength="6"
//                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
//                   placeholder="000000"
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
//               >
//                 {loading ? 'Verifying...' : 'Verify OTP'}
//               </button>

//               <div className="text-center space-y-2">
//                 <button
//                   type="button"
//                   onClick={handleResendOTP}
//                   disabled={loading}
//                   className="text-teal-400 hover:text-teal-300 text-sm disabled:opacity-50"
//                 >
//                   Resend OTP
//                 </button>
//                 <div>
//                   <button
//                     type="button"
//                     onClick={() => setStep(1)}
//                     className="text-slate-400 hover:text-white text-sm"
//                   >
//                     ← Back to Registration
//                   </button>
//                 </div>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;


































// // import { useState } from 'react';
// // import { Link } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import { HiMail, HiLockClosed, HiUser, HiPhone } from 'react-icons/hi';

// // const RegisterPage = () => {
// //   const { register } = useAuth();
// //   const [formData, setFormData] = useState({
// //     first_name: '',
// //     last_name: '',
// //     email: '',
// //     phone: '',
// //     password: '',
// //     confirm_password: '',
// //     role: 'student',
// //   });
// //   const [errors, setErrors] = useState({});
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));
// //     if (errors[name]) {
// //       setErrors(prev => ({ ...prev, [name]: '' }));
// //     }
// //   };

// //   const validate = () => {
// //     const newErrors = {};
    
// //     if (!formData.first_name) newErrors.first_name = 'First name is required';
// //     if (!formData.last_name) newErrors.last_name = 'Last name is required';
    
// //     if (!formData.email) {
// //       newErrors.email = 'Email is required';
// //     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
// //       newErrors.email = 'Email is invalid';
// //     }
    
// //     if (!formData.phone) {
// //       newErrors.phone = 'Phone number is required';
// //     } else if (!/^\d{10}$/.test(formData.phone)) {
// //       newErrors.phone = 'Phone number must be 10 digits';
// //     }
    
// //     if (!formData.password) {
// //       newErrors.password = 'Password is required';
// //     } else if (formData.password.length < 6) {
// //       newErrors.password = 'Password must be at least 6 characters';
// //     }
    
// //     if (formData.password !== formData.confirm_password) {
// //       newErrors.confirm_password = 'Passwords do not match';
// //     }
    
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     if (!validate()) return;
    
// //     setIsSubmitting(true);
// //     const { confirm_password, ...registerData } = formData;
// //     await register(registerData);
// //     setIsSubmitting(false);
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 py-12 px-4 sm:px-6 lg:px-8">
// //       <div className="max-w-md w-full space-y-8">
// //         <div className="text-center">
// //           <Link to="/" className="inline-block">
// //             <h1 className="text-4xl font-bold text-teal-500">EduVibe</h1>
// //           </Link>
// //           <h2 className="mt-6 text-3xl font-extrabold text-white">
// //             Create Account
// //           </h2>
// //           <p className="mt-2 text-sm text-gray-400">
// //             Join EduVibe to start your learning journey
// //           </p>
// //         </div>

// //         <form className="mt-8 space-y-6 bg-slate-900/50 p-8 rounded-xl border border-slate-800" onSubmit={handleSubmit}>
// //           <div className="space-y-4">
// //             <div className="grid grid-cols-2 gap-4">
// //               <div>
// //                 <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
// //                   First Name
// //                 </label>
// //                 <input
// //                   id="first_name"
// //                   name="first_name"
// //                   type="text"
// //                   value={formData.first_name}
// //                   onChange={handleChange}
// //                   className={`block w-full px-3 py-3 border ${
// //                     errors.first_name ? 'border-red-500' : 'border-slate-700'
// //                   } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
// //                   placeholder="John"
// //                 />
// //                 {errors.first_name && (
// //                   <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
// //                 )}
// //               </div>

// //               <div>
// //                 <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
// //                   Last Name
// //                 </label>
// //                 <input
// //                   id="last_name"
// //                   name="last_name"
// //                   type="text"
// //                   value={formData.last_name}
// //                   onChange={handleChange}
// //                   className={`block w-full px-3 py-3 border ${
// //                     errors.last_name ? 'border-red-500' : 'border-slate-700'
// //                   } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
// //                   placeholder="Doe"
// //                 />
// //                 {errors.last_name && (
// //                   <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
// //                 )}
// //               </div>
// //             </div>

// //             <div>
// //               <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
// //                 Email Address
// //               </label>
// //               <div className="relative">
// //                 <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
// //                 <input
// //                   id="email"
// //                   name="email"
// //                   type="email"
// //                   value={formData.email}
// //                   onChange={handleChange}
// //                   className={`block w-full pl-10 pr-3 py-3 border ${
// //                     errors.email ? 'border-red-500' : 'border-slate-700'
// //                   } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
// //                   placeholder="you@example.com"
// //                 />
// //               </div>
// //               {errors.email && (
// //                 <p className="mt-1 text-sm text-red-500">{errors.email}</p>
// //               )}
// //             </div>

// //             <div>
// //               <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
// //                 Phone Number
// //               </label>
// //               <div className="relative">
// //                 <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
// //                 <input
// //                   id="phone"
// //                   name="phone"
// //                   type="tel"
// //                   value={formData.phone}
// //                   onChange={handleChange}
// //                   className={`block w-full pl-10 pr-3 py-3 border ${
// //                     errors.phone ? 'border-red-500' : 'border-slate-700'
// //                   } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
// //                   placeholder="1234567890"
// //                 />
// //               </div>
// //               {errors.phone && (
// //                 <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
// //               )}
// //             </div>

// //             <div>
// //               <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
// //                 I am a
// //               </label>
// //               <select
// //                 id="role"
// //                 name="role"
// //                 value={formData.role}
// //                 onChange={handleChange}
// //                 className="block w-full px-3 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
// //               >
// //                 <option value="student">Student</option>
// //                 <option value="teacher">Teacher</option>
// //               </select>
// //             </div>

// //             <div>
// //               <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
// //                 Password
// //               </label>
// //               <div className="relative">
// //                 <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
// //                 <input
// //                   id="password"
// //                   name="password"
// //                   type="password"
// //                   value={formData.password}
// //                   onChange={handleChange}
// //                   className={`block w-full pl-10 pr-3 py-3 border ${
// //                     errors.password ? 'border-red-500' : 'border-slate-700'
// //                   } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
// //                   placeholder="••••••••"
// //                 />
// //               </div>
// //               {errors.password && (
// //                 <p className="mt-1 text-sm text-red-500">{errors.password}</p>
// //               )}
// //             </div>

// //             <div>
// //               <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300 mb-2">
// //                 Confirm Password
// //               </label>
// //               <div className="relative">
// //                 <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
// //                 <input
// //                   id="confirm_password"
// //                   name="confirm_password"
// //                   type="password"
// //                   value={formData.confirm_password}
// //                   onChange={handleChange}
// //                   className={`block w-full pl-10 pr-3 py-3 border ${
// //                     errors.confirm_password ? 'border-red-500' : 'border-slate-700'
// //                   } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
// //                   placeholder="••••••••"
// //                 />
// //               </div>
// //               {errors.confirm_password && (
// //                 <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
// //               )}
// //             </div>
// //           </div>

// //           <button
// //             type="submit"
// //             disabled={isSubmitting}
// //             className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //           >
// //             {isSubmitting ? 'Creating account...' : 'Create Account'}
// //           </button>

// //           <div className="text-center">
// //             <p className="text-sm text-gray-400">
// //               Already have an account?{' '}
// //               <Link
// //                 to="/login"
// //                 className="text-teal-500 hover:text-teal-400 font-medium transition-colors"
// //               >
// //                 Sign in
// //               </Link>
// //             </p>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default RegisterPage;

























// // // import { useState } from 'react';
// // // import { Link, useNavigate } from 'react-router-dom';
// // // import { useForm } from 'react-hook-form';
// // // import { HiMail, HiUser, HiLockClosed, HiPhone, HiAcademicCap } from 'react-icons/hi';
// // // import { motion } from 'framer-motion';
// // // import { useAuth } from '../context/AuthContext';
// // // import { useTheme } from '../context/ThemeContext';
// // // import Input from '../components/common/Input';
// // // import Select from '../components/common/Select';
// // // import Button from '../components/common/Button';
// // // import Modal from '../components/common/Modal';
// // // import toast from 'react-hot-toast';
// // // import api from '../services/api';

// // // const RegisterPage = () => {
// // //   const [loading, setLoading] = useState(false);
// // //   const [showOTPModal, setShowOTPModal] = useState(false);
// // //   const [registeredEmail, setRegisteredEmail] = useState('');
// // //   const [otp, setOtp] = useState('');
// // //   const [otpLoading, setOtpLoading] = useState(false);
// // //   const { theme } = useTheme();
// // //   const navigate = useNavigate();

// // //   const { register, handleSubmit, formState: { errors }, watch } = useForm();
// // //   const password = watch('password');

// // //   const onSubmit = async (data) => {
// // //     setLoading(true);
// // //     try {
// // //       await api.post('/api/users/register/', {
// // //         email: data.email,
// // //         full_name: data.full_name,
// // //         phone: data.phone,
// // //         password: data.password,
// // //         role: data.role,
// // //         class_enrolled: data.role === 'student' ? parseInt(data.class_enrolled) : null,
// // //       });

// // //       setRegisteredEmail(data.email);
// // //       setShowOTPModal(true);
// // //       toast.success('Registration successful! Please verify your email with OTP.');
// // //     } catch (error) {
// // //       const message = error.response?.data?.error || 'Registration failed';
// // //       toast.error(message);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleOTPVerification = async () => {
// // //     if (!otp || otp.length !== 6) {
// // //       toast.error('Please enter a valid 6-digit OTP');
// // //       return;
// // //     }

// // //     setOtpLoading(true);
// // //     try {
// // //       await api.post('/api/users/verify-registration-otp/', {
// // //         email: registeredEmail,
// // //         otp: otp,
// // //       });

// // //       toast.success('Email verified successfully! Please wait for admin approval.');
// // //       setShowOTPModal(false);
// // //       setTimeout(() => navigate('/login'), 2000);
// // //     } catch (error) {
// // //       const message = error.response?.data?.error || 'OTP verification failed';
// // //       toast.error(message);
// // //     } finally {
// // //       setOtpLoading(false);
// // //     }
// // //   };

// // //   const resendOTP = async () => {
// // //     try {
// // //       await api.post('/api/users/resend-otp/', { email: registeredEmail });
// // //       toast.success('OTP resent successfully!');
// // //     } catch (error) {
// // //       toast.error('Failed to resend OTP');
// // //     }
// // //   };

// // //   return (
// // //     <div className={`min-h-screen flex items-center justify-center p-4 ${
// // //       theme === 'light' ? 'hero-bg-light' : 'hero-bg-dark'
// // //     }`}>
// // //       <motion.div
// // //         initial={{ opacity: 0, y: 20 }}
// // //         animate={{ opacity: 1, y: 0 }}
// // //         className="w-full max-w-2xl"
// // //       >
// // //         <div className="glass-light dark:glass-dark rounded-2xl p-8 shadow-2xl">
// // //           <div className="text-center mb-8">
// // //             <Link to="/" className="inline-block">
// // //               <img src="/images/logo.png" alt="EduVibe" className="h-12 mx-auto mb-4" />
// // //             </Link>
// // //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
// // //               Create Account
// // //             </h1>
// // //             <p className="text-gray-600 dark:text-gray-400">
// // //               Join EduVibe and start your learning journey
// // //             </p>
// // //           </div>

// // //           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
// // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // //               <Input
// // //                 label="Full Name"
// // //                 placeholder="John Doe"
// // //                 icon={<HiUser className="w-5 h-5 text-gray-400" />}
// // //                 error={errors.full_name?.message}
// // //                 {...register('full_name', { required: 'Full name is required' })}
// // //               />

// // //               <Input
// // //                 label="Email Address"
// // //                 type="email"
// // //                 placeholder="your.email@example.com"
// // //                 icon={<HiMail className="w-5 h-5 text-gray-400" />}
// // //                 error={errors.email?.message}
// // //                 {...register('email', {
// // //                   required: 'Email is required',
// // //                   pattern: {
// // //                     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
// // //                     message: 'Invalid email',
// // //                   },
// // //                 })}
// // //               />

// // //               <Input
// // //                 label="Phone Number"
// // //                 type="tel"
// // //                 placeholder="+91 1234567890"
// // //                 icon={<HiPhone className="w-5 h-5 text-gray-400" />}
// // //                 error={errors.phone?.message}
// // //                 {...register('phone', { required: 'Phone is required' })}
// // //               />

// // //               <Select
// // //                 label="Role"
// // //                 options={[
// // //                   { value: 'student', label: 'Student' },
// // //                   { value: 'teacher', label: 'Teacher' },
// // //                 ]}
// // //                 error={errors.role?.message}
// // //                 {...register('role', { required: 'Role is required' })}
// // //               />

// // //               {watch('role') === 'student' && (
// // //                 <Select
// // //                   label="Class"
// // //                   options={[
// // //                     { value: '1', label: 'Class 1' },
// // //                     { value: '2', label: 'Class 2' },
// // //                     { value: '3', label: 'Class 3' },
// // //                     { value: '4', label: 'Class 4' },
// // //                     { value: '5', label: 'Class 5' },
// // //                     { value: '6', label: 'Class 6' },
// // //                     { value: '7', label: 'Class 7' },
// // //                     { value: '8', label: 'Class 8' },
// // //                     { value: '9', label: 'Class 9' },
// // //                     { value: '10', label: 'Class 10' },
// // //                   ]}
// // //                   error={errors.class_enrolled?.message}
// // //                   {...register('class_enrolled', { required: watch('role') === 'student' })}
// // //                 />
// // //               )}

// // //               <Input
// // //                 label="Password"
// // //                 type="password"
// // //                 placeholder="Minimum 6 characters"
// // //                 icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
// // //                 error={errors.password?.message}
// // //                 {...register('password', {
// // //                   required: 'Password is required',
// // //                   minLength: { value: 6, message: 'Min 6 characters' },
// // //                 })}
// // //               />

// // //               <Input
// // //                 label="Confirm Password"
// // //                 type="password"
// // //                 placeholder="Re-enter password"
// // //                 icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
// // //                 error={errors.confirm_password?.message}
// // //                 {...register('confirm_password', {
// // //                   required: 'Please confirm password',
// // //                   validate: (value) => value === password || 'Passwords do not match',
// // //                 })}
// // //               />
// // //             </div>

// // //             <Button type="submit" className="w-full" size="lg" loading={loading}>
// // //               Create Account
// // //             </Button>
// // //           </form>

// // //           <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
// // //             Already have an account?{' '}
// // //             <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
// // //               Sign in
// // //             </Link>
// // //           </p>
// // //         </div>
// // //       </motion.div>

// // //       {/* OTP Verification Modal */}
// // //       <Modal isOpen={showOTPModal} onClose={() => {}} title="Verify Your Email" showCloseButton={false}>
// // //         <div className="text-center">
// // //           <p className="text-gray-600 dark:text-gray-400 mb-6">
// // //             We've sent a 6-digit OTP to <strong>{registeredEmail}</strong>
// // //           </p>

// // //           <Input
// // //             label="Enter OTP"
// // //             type="text"
// // //             maxLength={6}
// // //             placeholder="000000"
// // //             value={otp}
// // //             onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
// // //             className="text-center text-2xl tracking-widest"
// // //           />

// // //           <div className="flex gap-3 mt-6">
// // //             <Button variant="ghost" onClick={resendOTP} className="flex-1">
// // //               Resend OTP
// // //             </Button>
// // //             <Button onClick={handleOTPVerification} loading={otpLoading} className="flex-1">
// // //               Verify
// // //             </Button>
// // //           </div>
// // //         </div>
// // //       </Modal>
// // //     </div>
// // //   );
// // // };

// // // export default RegisterPage;