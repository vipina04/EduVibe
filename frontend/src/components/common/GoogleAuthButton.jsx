// src/components/common/GoogleAuthButton.jsx
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';
import api from '../../services/api';

/**
 * Drop this button into both LoginPage and RegisterPage.
 *
 * Props:
 *   role  — 'student' | 'teacher'  (only relevant for brand-new users)
 *
 * Flow:
 *   Existing user  → saves token & user → navigates to dashboard
 *   New user       → saves token & user → navigates to /complete-profile
 */
const GoogleAuthButton = ({ role = 'student' }) => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/api/users/auth/google/', {
        credential: credentialResponse.credential,
        role,
      });

      const { token, user, is_new_user } = response.data;

      // ── Persist session (same pattern as LoginView) ──────────────
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Token ${token}`;

      if (is_new_user) {
        toast.success(`Welcome, ${user.first_name}! Let's complete your profile.`);
        navigate('/complete-profile');
      } else {
        // Check if an older Google user somehow still has no profile
        if (!user.profile_complete) {
          toast('Please complete your profile first.', { icon: '📋' });
          navigate('/complete-profile');
          return;
        }
        toast.success(`Welcome back, ${user.first_name}!`);
        if (user.role === 'student')       navigate('/student/dashboard');
        else if (user.role === 'teacher')  navigate('/teacher/dashboard');
        else                               navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google sign-in was cancelled or failed.')}
        useOneTap={false}
        theme="filled_black"
        shape="rectangular"
        size="large"
        text="continue_with"
        width="320"
      />
    </div>
  );
};

export default GoogleAuthButton;