import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import GoogleAuthButton from '../components/common/GoogleAuthButton';

const LoginPage = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950' 
        : 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Transparent Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/30 dark:bg-black/30 border-b border-white/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              EduVibe
            </span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white/20 dark:bg-black/30 hover:bg-white/30 dark:hover:bg-black/40 transition-all duration-200 backdrop-blur-sm border border-white/10 dark:border-white/5"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <HiSun className="w-5 h-5 text-yellow-300" />
            ) : (
              <HiMoon className="w-5 h-5 text-indigo-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Header with Logo and Login Text */}
          <div className="text-center space-y-4">
            {/* EduVibe Logo */}
            <div className="flex justify-center mb-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                EduVibe
              </span>
            </div>
            
            {/* Login Heading - Reduced size for better visibility */}
            <h1 className="text-2xl sm:text-2xl font-bold bg-gradient-to-r from-gray-500 to-slate-500 bg-clip-text text-transparent pb-1">
              LOGIN
            </h1>
          </div>

          {/* Form Card */}
          <div className="backdrop-blur-2xl bg-white/70 dark:bg-black/40 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-8 sm:p-10 transition-all duration-300">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <HiMail className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : theme === 'dark'
                          ? 'border-white/20 focus:border-teal-500 focus:ring-teal-500'
                          : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                    } bg-white/60 dark:bg-black/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="Email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <HiLockClosed className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : theme === 'dark'
                          ? 'border-white/20 focus:border-teal-500 focus:ring-teal-500'
                          : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                    } bg-white/60 dark:bg-black/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className={`text-sm ${
                    theme === 'dark' ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'
                  } transition-colors duration-200`}
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium text-lg shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="space-y-4">

  {/* ...your existing login form... */}
  {/* Divider */}
<div className="relative my-6">
  {/* The Line */}
  <div className="absolute inset-0 flex items-center" aria-hidden="true">
    <div className={`w-full border-t ${
      theme === 'dark' ? 'border-white/10' : 'border-gray-200'
    }`} />
  </div>
  
  {/* The Text with Background Mask */}
  <div className="relative flex justify-center text-sm font-medium">
    <span className={`px-4 rounded-full ${
      theme === 'dark' 
        ? 'bg-gray-950 text-gray-400' // Matches the dark card depth
        : 'bg-white text-gray-500'    // Matches the light card depth
    }`}>
      or continue with
    </span>
  </div>
</div>






  {/* Divider */}
  {/* <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-slate-700" />
    </div>
    <div className="relative flex justify-center">
      <span className="px-4 text-slate-500 text-sm">or continue with</span>
    </div>
  </div> */}

  {/* Google button — role doesn't matter on login (user already exists) */}
  <GoogleAuthButton role="student" />

</div>



              {/* Sign Up Link */}
              <div className={`text-center text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className={`${
                    theme === 'dark' ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'
                  } font-medium transition-colors duration-200`}
                >
                  Sign up now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


















