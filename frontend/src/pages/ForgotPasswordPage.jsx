import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleSendOTP = async (data) => {
    setLoading(true);
    try {
      await api.post('/api/users/forgot-password/', { email: data.email });
      setEmail(data.email);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/users/verify-otp-reset-password/', {
        email,
        otp,
        new_password: newPassword,
      });

      toast.success('Password reset successful!');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'light' ? 'hero-bg-light' : 'hero-bg-dark'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-light dark:glass-dark rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img src="/images/logo.png" alt="EduVibe" className="h-12 mx-auto mb-4" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit(handleSendOTP)} className="space-y-6">
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

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send OTP
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <Input
                label="OTP"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 6 characters"
                icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button onClick={handleResetPassword} className="w-full" size="lg" loading={loading}>
                Reset Password
              </Button>
            </div>
          )}

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;