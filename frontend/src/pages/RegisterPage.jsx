import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiMail, HiUser, HiLockClosed, HiPhone, HiAcademicCap } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import api from '../services/api';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/api/users/register/', {
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        password: data.password,
        role: data.role,
        class_enrolled: data.role === 'student' ? parseInt(data.class_enrolled) : null,
      });

      setRegisteredEmail(data.email);
      setShowOTPModal(true);
      toast.success('Registration successful! Please verify your email with OTP.');
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      await api.post('/api/users/verify-registration-otp/', {
        email: registeredEmail,
        otp: otp,
      });

      toast.success('Email verified successfully! Please wait for admin approval.');
      setShowOTPModal(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const message = error.response?.data?.error || 'OTP verification failed';
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await api.post('/api/users/resend-otp/', { email: registeredEmail });
      toast.success('OTP resent successfully!');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'light' ? 'hero-bg-light' : 'hero-bg-dark'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-light dark:glass-dark rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img src="/images/logo.png" alt="EduVibe" className="h-12 mx-auto mb-4" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join EduVibe and start your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={<HiUser className="w-5 h-5 text-gray-400" />}
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Full name is required' })}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                icon={<HiMail className="w-5 h-5 text-gray-400" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email',
                  },
                })}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 1234567890"
                icon={<HiPhone className="w-5 h-5 text-gray-400" />}
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone is required' })}
              />

              <Select
                label="Role"
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'teacher', label: 'Teacher' },
                ]}
                error={errors.role?.message}
                {...register('role', { required: 'Role is required' })}
              />

              {watch('role') === 'student' && (
                <Select
                  label="Class"
                  options={[
                    { value: '1', label: 'Class 1' },
                    { value: '2', label: 'Class 2' },
                    { value: '3', label: 'Class 3' },
                    { value: '4', label: 'Class 4' },
                    { value: '5', label: 'Class 5' },
                    { value: '6', label: 'Class 6' },
                    { value: '7', label: 'Class 7' },
                    { value: '8', label: 'Class 8' },
                    { value: '9', label: 'Class 9' },
                    { value: '10', label: 'Class 10' },
                  ]}
                  error={errors.class_enrolled?.message}
                  {...register('class_enrolled', { required: watch('role') === 'student' })}
                />
              )}

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: 'Please confirm password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      {/* OTP Verification Modal */}
      <Modal isOpen={showOTPModal} onClose={() => {}} title="Verify Your Email" showCloseButton={false}>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a 6-digit OTP to <strong>{registeredEmail}</strong>
          </p>

          <Input
            label="Enter OTP"
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest"
          />

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={resendOTP} className="flex-1">
              Resend OTP
            </Button>
            <Button onClick={handleOTPVerification} loading={otpLoading} className="flex-1">
              Verify
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;