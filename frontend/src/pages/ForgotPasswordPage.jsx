import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import api from '../services/api';

// ─── Password Strength Helper ────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',    color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair',    color: '#f97316' };
  if (score <= 3) return { score, label: 'Good',    color: '#eab308' };
  if (score <= 4) return { score, label: 'Strong',  color: '#22c55e' };
  return { score, label: 'Very Strong', color: '#06b6d4' };
};

// ─── OTP Input (6 individual boxes) ─────────────────────────────────────────
const OTPInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = value.split('');

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[idx]) {
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleChange = (e, idx) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    onChange(next.join(''));
    if (char && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center my-2">
      {[0,1,2,3,4,5].map(idx => (
        <motion.input
          key={idx}
          ref={el => inputs.current[idx] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKey(e, idx)}
          onPaste={handlePaste}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.06 }}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200
            bg-white/60 dark:bg-white/5
            ${digits[idx]
              ? 'border-teal-500 text-teal-600 dark:text-teal-400 shadow-[0_0_0_3px_rgba(20,184,166,0.15)]'
              : 'border-gray-300 dark:border-white/20 text-gray-900 dark:text-white'
            }
            focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)]
          `}
        />
      ))}
    </div>
  );
};

// ─── Step Indicator ──────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {['Email', 'OTP', 'New Password'].map((label, i) => {
      const step = i + 1;
      const done = current > step;
      const active = current === step;
      return (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                backgroundColor: done ? '#14b8a6' : active ? '#14b8a6' : 'transparent',
                borderColor: done || active ? '#14b8a6' : '#9ca3af',
                scale: active ? 1.15 : 1,
              }}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold"
              style={{ color: done || active ? '#fff' : '#9ca3af' }}
            >
              {done ? '✓' : step}
            </motion.div>
            <span className={`text-xs font-medium ${active ? 'text-teal-500' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <div className={`w-10 h-0.5 mb-5 rounded transition-all duration-500 ${current > step ? 'bg-teal-500' : 'bg-gray-300 dark:bg-white/20'}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Step 1: email, Step 2: OTP, Step 3: new password
  const [step, setStep] = useState(1);
  const [email, setEmail]   = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [otp, setOtp]       = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [newPw, setNewPw]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  // Resend countdown
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const strength = getStrength(newPw);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setEmailErr('Email is required'); return; }
    if (!emailRegex.test(email)) { setEmailErr('Enter a valid email address'); return; }
    setEmailErr('');
    setLoading(true);
    try {
      await api.post('/users/forgot-password/', { email });
      toast.success('OTP sent! Check your email 📧', { duration: 4000 });
      setStep(2);
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP. Try again.';
      toast.error(msg);
      setEmailErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setOtpErr('Enter the complete 6-digit OTP'); return; }
    setOtpErr('');
    setLoading(true);
    // We just move to step 3 — actual OTP verify happens with password reset
    // But to validate OTP earlier, we can call verify endpoint first:
    setLoading(false);
    setStep(3);
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPw || newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    if (strength.score < 2) {
      toast.error('Please choose a stronger password');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/verify-otp-reset-password/', {
        email,
        otp,
        new_password: newPw,
      });
      setSuccess(true);
      toast.success('Password reset successfully! 🎉');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Reset failed. Check OTP and try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        setStep(2);
        setOtp('');
        setOtpErr(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await api.post('/users/forgot-password/', { email });
      toast.success('New OTP sent!');
      setCountdown(60);
      setOtp('');
      setOtpErr('');
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-indigo-50'}`}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="text-8xl mb-6"
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
          <p className="text-gray-500 dark:text-gray-400">Redirecting you to login...</p>
          <div className="mt-6 h-1 w-48 mx-auto bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5 }}
              className="h-full bg-teal-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark'
        ? 'bg-gray-950'
        : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-indigo-50'
    }`}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className={`rounded-2xl p-8 shadow-2xl border ${
          theme === 'dark'
            ? 'bg-gray-900/80 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}>

          {/* Logo & Title */}
          <div className="text-center mb-6">
            <Link to="/">
              <img src="/images/logo.png" alt="EduVibe" className="h-12 mx-auto mb-4 object-contain" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {step === 1 && "We'll send a verification code to your email"}
              {step === 2 && `OTP sent to ${email}`}
              {step === 3 && 'Create your new password'}
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator current={step} />

          {/* ── STEP 1: Email ── */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                onSubmit={handleSendOTP}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                      placeholder="your.email@example.com"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 outline-none transition-all bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 ${
                        emailErr
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-gray-200 dark:border-white/15 focus:border-teal-500 dark:focus:border-teal-400'
                      }`}
                    />
                  </div>
                  {emailErr && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <span>⚠</span> {emailErr}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <>'Send OTP <span>→</span></>
                  )}
                </button>
              </motion.form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                onSubmit={handleVerifyOTP}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                    Enter the 6-digit code
                  </label>
                  <OTPInput value={otp} onChange={setOtp} />
                  {otpErr && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-red-500 text-center">
                      ⚠ {otpErr}
                    </motion.p>
                  )}
                </div>

                {/* Resend */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Didn't receive it?{' '}
                  {countdown > 0 ? (
                    <span className="text-teal-500 font-medium">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-teal-500 font-semibold hover:text-teal-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-xl font-semibold border-2 border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-teal-400 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={otp.length < 6 || loading}
                    className="flex-[2] py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 active:scale-[0.98] transition-all shadow-lg shadow-teal-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Verify OTP →'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── STEP 3: New Password ── */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-10 pr-12 py-3.5 rounded-xl border-2 border-gray-200 dark:border-white/15 focus:border-teal-500 outline-none transition-all bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      {showNew ? '🙈' : '👁'}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {newPw && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{ backgroundColor: i <= strength.score ? strength.color : '#e5e7eb' }}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: strength.color }}>
                        {strength.label} password
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`w-full pl-10 pr-12 py-3.5 rounded-xl border-2 outline-none transition-all bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 ${
                        confirmPw && confirmPw !== newPw
                          ? 'border-red-400'
                          : confirmPw && confirmPw === newPw
                            ? 'border-green-400'
                            : 'border-gray-200 dark:border-white/15 focus:border-teal-500'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      {showConfirm ? '🙈' : '👁'}
                    </button>
                  </div>
                  {confirmPw && confirmPw !== newPw && (
                    <p className="mt-1.5 text-sm text-red-500">⚠ Passwords do not match</p>
                  )}
                  {confirmPw && confirmPw === newPw && (
                    <p className="mt-1.5 text-sm text-green-500">✓ Passwords match</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3.5 rounded-xl font-semibold border-2 border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-teal-400 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newPw || !confirmPw || newPw !== confirmPw}
                    className="flex-[2] py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 active:scale-[0.98] transition-all shadow-lg shadow-teal-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Resetting...</>
                    ) : '🔐 Reset Password'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Remembered it?{' '}
            <Link to="/login" className="text-teal-500 font-semibold hover:text-teal-600 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>

        <p className="text-center mt-4 text-xs text-gray-400 dark:text-gray-600">
          <Link to="/" className="hover:text-teal-500 transition-colors">← Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;











// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { HiMail, HiLockClosed } from 'react-icons/hi';
// import { motion } from 'framer-motion';
// import { useTheme } from '../context/ThemeContext';
// import Input from '../components/common/Input';
// import Button from '../components/common/Button';
// import Modal from '../components/common/Modal';
// import toast from 'react-hot-toast';
// import api from '../services/api';

// const ForgotPasswordPage = () => {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { theme } = useTheme();

//   const { register, handleSubmit, formState: { errors } } = useForm();

//   const handleSendOTP = async (data) => {
//     setLoading(true);
//     try {
//       await api.post('/api/users/forgot-password/', { email: data.email });
//       setEmail(data.email);
//       setStep(2);
//       toast.success('OTP sent to your email!');
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to send OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResetPassword = async () => {
//     if (!otp || !newPassword || !confirmPassword) {
//       toast.error('Please fill all fields');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     if (newPassword.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);
//     try {
//       await api.post('/api/users/verify-otp-reset-password/', {
//         email,
//         otp,
//         new_password: newPassword,
//       });

//       toast.success('Password reset successful!');
//       setTimeout(() => window.location.href = '/login', 2000);
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Password reset failed');
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
//           <div className="text-center mb-8">
//             <Link to="/" className="inline-block">
//               <img src="/images/logo.png" alt="EduVibe" className="h-12 mx-auto mb-4" />
//             </Link>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//               Reset Password
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400">
//               {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
//             </p>
//           </div>

//           {step === 1 ? (
//             <form onSubmit={handleSubmit(handleSendOTP)} className="space-y-6">
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

//               <Button type="submit" className="w-full" size="lg" loading={loading}>
//                 Send OTP
//               </Button>
//             </form>
//           ) : (
//             <div className="space-y-6">
//               <Input
//                 label="OTP"
//                 type="text"
//                 maxLength={6}
//                 placeholder="000000"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//               />

//               <Input
//                 label="New Password"
//                 type="password"
//                 placeholder="Minimum 6 characters"
//                 icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//               />

//               <Input
//                 label="Confirm Password"
//                 type="password"
//                 placeholder="Re-enter password"
//                 icon={<HiLockClosed className="w-5 h-5 text-gray-400" />}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />

//               <Button onClick={handleResetPassword} className="w-full" size="lg" loading={loading}>
//                 Reset Password
//               </Button>
//             </div>
//           )}

//           <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
//             Remember your password?{' '}
//             <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default ForgotPasswordPage;