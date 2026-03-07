// ============================================
// FILE: frontend/src/components/common/GoogleAuthButton.jsx
// COMPLETE WORKING VERSION
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// const GoogleAuthButton = ({ role = 'student' }) => {
const GoogleAuthButton = ({ role = 'student', theme = 'light' }) => {  
  const navigate = useNavigate();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        if (window.google) {
          initializeGoogleSignIn();
        }
        return;
      }

      // Create and load Google Sign-In script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google Sign-In button
        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv) {
          window.google.accounts.id.renderButton(
            buttonDiv,
            {
              type: 'standard', 
              // theme: 'outline',
              theme: theme === 'dark' ? 'filled_black' : 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: Math.min(400, window.innerWidth - 64),
            }
          );
        }
      }
    };

    loadGoogleScript();

    // Cleanup on unmount
    return () => {
      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv) {
        buttonDiv.innerHTML = '';
      }
    };
  // }, []);
  }, [theme]);


  const handleCredentialResponse = async (response) => {
  setIsLoading(true);
  setError('');

  try {
    const credential = response.credential;

    // Check if Google Client ID is configured
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      throw new Error('Google authentication is not configured');
    }

    console.log('🔵 Sending Google credential to backend...');
    
    // Send credential to backend
    const res = await api.post('/users/auth/google/', {
      credential,
      role,
    });

    console.log('✅ Google auth successful:', res.data);

 
    const { token, user } = res.data;

    // ✅ Only approved users reach here (backend rejects others)
    
    // Store authentication data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Try to update auth context if available
    try {
      if (auth?.setUser && typeof auth.setUser === 'function') {
        auth.setUser(user);
      }
      if (auth?.setToken && typeof auth.setToken === 'function') {
        auth.setToken(token);
      }
    } catch (contextError) {
      console.warn('Could not update auth context:', contextError);
    }

    console.log('✅ User logged in:', user.email, '- Role:', user.role);

    // Navigate approved users based on role
    setTimeout(() => {
      switch (user.role) {
        case 'student':
          window.location.href = '/student/dashboard';
          break;
        case 'teacher':
          window.location.href = '/teacher/dashboard';
          break;
        case 'admin':
          window.location.href = '/admin/dashboard';
          break;
        default:
          window.location.href = '/';
      }
    }, 500);

  } catch (err) {
    console.error('❌ Google Sign-In Error:', err);
    console.error('Error details:', err.response);
    
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    
    if (err.response?.status === 404 && err.response?.data?.is_new_user) {
      errorMessage = '📧 No account found with this email. Please sign up first by clicking the sign up shown just below.';
    } else if (err.response?.status === 403 && err.response?.data?.is_existing_user) {
      errorMessage = '⏳ Your account is pending admin approval. You will be notified via email once approved.';
    } else if (err.response?.status === 403) {
      errorMessage = err.response.data.error || 'Your account is pending admin approval. Please contact the administrator.';
    } else if (err.response?.status === 400) {
      errorMessage = err.response.data.error || 'Invalid Google authentication. Please try again.';
    } else if (err.response?.status === 404) {
      errorMessage = err.response?.data?.error || 'Backend endpoint not found. Please check server configuration.';
    } else if (err.response?.status === 500) {
      errorMessage = 'Server error occurred. Please try again later.';
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.message) {
      errorMessage = `Error: ${err.message}`;
    }
    
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="w-full">
       <style>{`
      .google-btn-dark-fix > div,
      .google-btn-dark-fix iframe {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      .dark .google-btn-dark-fix > div {
        filter: invert(0%) !important;
      }
      .dark #google-signin-button > div {
        background: transparent !important;
        border: 1px solid rgba(255,255,255,0.15) !important;
        border-radius: 8px !important;
        overflow: hidden !important;
      }
    `}</style>
      {/* Google Sign-In Button Container */}
      {/* <div 
        id="google-signin-button" 
        className={`w-full flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      /> */}
    <div 
      id="google-signin-button" 
      className={`w-full flex justify-center google-btn-dark-fix ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        />  
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center mt-3">
          <svg 
            className="animate-spin h-5 w-5 text-teal-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Signing in with Google...
          </span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;




























