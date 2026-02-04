import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiUser, HiPhone } from 'react-icons/hi';

const RegisterPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    const { confirm_password, ...registerData } = formData;
    await register(registerData);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-teal-500">EduVibe</h1>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join EduVibe to start your learning journey
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-slate-900/50 p-8 rounded-xl border border-slate-800" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`block w-full px-3 py-3 border ${
                    errors.first_name ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`block w-full px-3 py-3 border ${
                    errors.last_name ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.phone ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="1234567890"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.confirm_password ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-teal-500 hover:text-teal-400 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

























// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { HiMail, HiUser, HiLockClosed, HiPhone, HiAcademicCap } from 'react-icons/hi';
// import { motion } from 'framer-motion';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import Input from '../components/common/Input';
// import Select from '../components/common/Select';
// import Button from '../components/common/Button';
// import Modal from '../components/common/Modal';
// import toast from 'react-hot-toast';
// import api from '../services/api';

// const RegisterPage = () => {
//   const [loading, setLoading] = useState(false);
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [registeredEmail, setRegisteredEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpLoading, setOtpLoading] = useState(false);
//   const { theme } = useTheme();
//   const navigate = useNavigate();

//   const { register, handleSubmit, formState: { errors }, watch } = useForm();
//   const password = watch('password');

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       await api.post('/api/users/register/', {
//         email: data.email,
//         full_name: data.full_name,
//         phone: data.phone,
//         password: data.password,
//         role: data.role,
//         class_enrolled: data.role === 'student' ? parseInt(data.class_enrolled) : null,
//       });

//       setRegisteredEmail(data.email);
//       setShowOTPModal(true);
//       toast.success('Registration successful! Please verify your email with OTP.');
//     } catch (error) {
//       const message = error.response?.data?.error || 'Registration failed';
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOTPVerification = async () => {
//     if (!otp || otp.length !== 6) {
//       toast.error('Please enter a valid 6-digit OTP');
//       return;
//     }

//     setOtpLoading(true);
//     try {
//       await api.post('/api/users/verify-registration-otp/', {
//         email: registeredEmail,
//         otp: otp,
//       });

//       toast.success('Email verified successfully! Please wait for admin approval.');
//       setShowOTPModal(false);
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (error) {
//       const message = error.response?.data?.error || 'OTP verification failed';
//       toast.error(message);
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   const resendOTP = async () => {
//     try {
//       await api.post('/api/users/resend-otp/', { email: registeredEmail });
//       toast.success('OTP resent successfully!');
//     } catch (error) {
//       toast.error('Failed to resend OTP');
//     }
//   };

//   return (
//     <div className={`min-h-screen flex items-center justify-center p-4 ${
//       theme === 'light' ? 'hero-bg-light' : 'hero-bg-dark'
//     }`}>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-2xl"
//       >
//         <div className="glass-light dark:glass-dark rounded-2xl p-8 shadow-2xl">
//           <div className="text-center mb-8">
//             <Link to="/" className="inline-block">
//               <img src="/images/logo.png" alt="EduVibe" className="h-12 mx-auto mb-4" />
//             </Link>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//               Create Account
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400">
//               Join EduVibe and start your learning journey
//             </p>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Input
//                 label="Full Name"
//                 placeholder="John Doe"
//                 icon={<HiUser className="w-5 h-5 text-gray-400" />}
//                 error={errors.full_name?.message}
//                 {...register('full_name', { required: 'Full name is required' })}
//               />

//               <Input
//                 label="Email Address"
//                 type="email"
//                 placeholder="your.email@example.com"
//                 icon={<HiMail className="w-5 h-5 text-gray-400" />}
//                 error={errors.email?.message}
//                 {...register('email', {
//                   required: 'Email is required',
//                   pattern: {
//                     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                     message: 'Invalid email',
//                   },
//                 })}
//               />

//               <Input
//                 label="Phone Number"
//                 type="tel"
//                 placeholder="+91 1234567890"
//                 icon={<HiPhone className="w-5 h-5 text-gray-400" />}
//                 error={errors.phone?.message}
//                 {...register('phone', { required: 'Phone is required' })}
//               />

//               <Select
//                 label="Role"
//                 options={[
//                   { value: 'student', label: 'Student' },
//                   { value: 'teacher', label: 'Teacher' },
//                 ]}
//                 error={errors.role?.message}
//                 {...register('role', { required: 'Role is required' })}
//               />

//               {watch('role') === 'student' && (
//                 <Select
//                   label="Class"
//                   options={[
//                     { value: '1', label: 'Class 1' },
//                     { value: '2', label: 'Class 2' },
//                     { value: '3', label: 'Class 3' },
//                     { value: '4', label: 'Class 4' },
//                     { value: '5', label: 'Class 5' },
//                     { value: '6', label: 'Class 6' },
//                     { value: '7', label: 'Class 7' },
//                     { value: '8', label: 'Class 8' },
//                     { value: '9', label: 'Class 9' },
//                     { value: '10', label: 'Class 10' },
//                   ]}
//                   error={errors.class_enrolled?.message}
//                   {...register('class_enrolled', { required: watch('role') === 'student' })}
//                 />
//               )}

//               <Input
//                 label="Password"
//                 type="password"
//                 placeholder="Minimum 6 characters"
//                 icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
//                 error={errors.password?.message}
//                 {...register('password', {
//                   required: 'Password is required',
//                   minLength: { value: 6, message: 'Min 6 characters' },
//                 })}
//               />

//               <Input
//                 label="Confirm Password"
//                 type="password"
//                 placeholder="Re-enter password"
//                 icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
//                 error={errors.confirm_password?.message}
//                 {...register('confirm_password', {
//                   required: 'Please confirm password',
//                   validate: (value) => value === password || 'Passwords do not match',
//                 })}
//               />
//             </div>

//             <Button type="submit" className="w-full" size="lg" loading={loading}>
//               Create Account
//             </Button>
//           </form>

//           <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
//             Already have an account?{' '}
//             <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </motion.div>

//       {/* OTP Verification Modal */}
//       <Modal isOpen={showOTPModal} onClose={() => {}} title="Verify Your Email" showCloseButton={false}>
//         <div className="text-center">
//           <p className="text-gray-600 dark:text-gray-400 mb-6">
//             We've sent a 6-digit OTP to <strong>{registeredEmail}</strong>
//           </p>

//           <Input
//             label="Enter OTP"
//             type="text"
//             maxLength={6}
//             placeholder="000000"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//             className="text-center text-2xl tracking-widest"
//           />

//           <div className="flex gap-3 mt-6">
//             <Button variant="ghost" onClick={resendOTP} className="flex-1">
//               Resend OTP
//             </Button>
//             <Button onClick={handleOTPVerification} loading={otpLoading} className="flex-1">
//               Verify
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default RegisterPage;