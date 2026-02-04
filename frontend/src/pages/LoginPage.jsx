import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed } from 'react-icons/hi';

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    await login(formData.email, formData.password);
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
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-slate-900/50 p-8 rounded-xl border border-slate-800" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
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
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-teal-500 hover:text-teal-400 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-teal-500 hover:text-teal-400 font-medium transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
















// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
// import { motion } from 'framer-motion';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import Input from '../components/common/Input';
// import Button from '../components/common/Button';
// import toast from 'react-hot-toast';

// const LoginPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const { theme } = useTheme();
//   const navigate = useNavigate();

//   const { register, handleSubmit, formState: { errors } } = useForm();

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       await login(data.email, data.password);
//     } catch (error) {
//       console.error('Login failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={`min-h-screen flex items-center justify-center p-4 ${
//       theme === 'light' ? 'hero-bg-light' : 'hero-bg-dark'
//     }`}>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         <div className="glass-light dark:glass-dark rounded-2xl p-8 shadow-2xl">
//           {/* Logo & Title */}
//           <div className="text-center mb-8">
//             <Link to="/" className="inline-block">
//               <img src="/images/logo.png" alt="EduVibe" className="h-12 mx-auto mb-4" />
//             </Link>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//               Welcome Back
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400">
//               Sign in to continue to EduVibe
//             </p>
//           </div>

//           {/* Login Form */}
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             {/* Email */}
//             <Input
//               label="Email Address"
//               type="email"
//               placeholder="your.email@example.com"
//               icon={<HiMail className="w-5 h-5 text-gray-400" />}
//               error={errors.email?.message}
//               {...register('email', {
//                 required: 'Email is required',
//                 pattern: {
//                   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                   message: 'Invalid email address',
//                 },
//               })}
//             />

//             {/* Password */}
//             <div className="relative">
//               <Input
//                 label="Password"
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder="Enter your password"
//                 icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
//                 error={errors.password?.message}
//                 {...register('password', {
//                   required: 'Password is required',
//                   minLength: {
//                     value: 6,
//                     message: 'Password must be at least 6 characters',
//                   },
//                 })}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//               >
//                 {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
//               </button>
//             </div>

//             {/* Forgot Password */}
//             <div className="flex justify-end">
//               <Link
//                 to="/forgot-password"
//                 className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               className="w-full"
//               size="lg"
//               loading={loading}
//             >
//               Sign In
//             </Button>
//           </form>

//           {/* Register Link */}
//           <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
//             Don't have an account?{' '}
//             <Link
//               to="/register"
//               className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
//             >
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default LoginPage;