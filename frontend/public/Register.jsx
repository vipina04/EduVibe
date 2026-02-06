import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiCalendar } from 'react-icons/hi';
import { authAPI, classAPI, subjectAPI } from '../../services/api';
import { toast } from '../../utils/toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    dob: '',
    role: 'student',
    class_id: '',
    subject_ids: [],
  });

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  const fetchClassesAndSubjects = async () => {
    try {
      const [classRes, subjectRes] = await Promise.all([
        classAPI.getAll(),
        subjectAPI.getAll(),
      ]);
      setClasses(classRes.data.results || classRes.data);
      setSubjects(subjectRes.data.results || subjectRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, subject_ids: options }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.role === 'student' && !formData.class_id) {
      toast.error('Please select a class');
      return;
    }

    if (formData.role === 'teacher' && formData.subject_ids.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      
      if (response.data.success) {
        toast.success('Registration successful! Please verify your email.');
        setShowOTPModal(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.errors?.email?.[0] || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(formData.email, parseInt(otp));
      
      if (response.data.success) {
        toast.success('Email verified! Waiting for admin approval.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(formData.email);
      toast.success('OTP resent to your email!');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-light/10 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <img src="/images/logo.png" alt="EduVibe" className="h-12 w-12" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              EduVibe
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of learners on EduVibe
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'student'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-2">🎓</div>
                  <div className="font-semibold">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'teacher'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-2">👨‍🏫</div>
                  <div className="font-semibold">Teacher</div>
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                icon={HiUser}
                required
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                icon={HiUser}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              icon={HiMail}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="1234567890"
                icon={HiPhone}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                icon={HiCalendar}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={HiLockClosed}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="••••••••"
                icon={HiLockClosed}
                required
              />
            </div>

            {/* Role-specific fields */}
            {formData.role === 'student' && (
              <Select
                label="Select Class"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                options={classes.map(cls => ({ value: cls.id, label: cls.name }))}
                placeholder="Choose your class"
                required
              />
            )}

            {formData.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Subjects (1-3)
                </label>
                <select
                  multiple
                  onChange={handleSubjectChange}
                  className="input-field"
                  size="5"
                  required
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Hold Ctrl/Cmd to select multiple subjects
                </p>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      {/* OTP Verification Modal */}
      <Modal isOpen={showOTPModal} onClose={() => setShowOTPModal(false)} title="Verify Email">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a 6-digit OTP to <strong>{formData.email}</strong>
          </p>
          <Input
            label="Enter OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength="6"
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleVerifyOTP}
              loading={loading}
            >
              Verify
            </Button>
            <Button variant="outline" onClick={handleResendOTP}>
              Resend OTP
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Register;