// ============================================
// FILE: frontend/src/components/common/GoogleAuthButton.jsx
// COMPLETE WORKING VERSION
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const GoogleAuthButton = ({ role = 'student' }) => {
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
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: Math.min(400, window.innerWidth - 14),
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
  }, []);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError('');

    try {
      const credential = response.credential;

      console.log('🔵 Sending Google credential to backend...');
      
      // Send credential to backend
      const res = await api.post('/users/auth/google/', {
        credential,
        role,
      });

      console.log('✅ Google auth successful:', res.data);

      const { token, user } = res.data;

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

      // Navigate based on user role
      // Using window.location.href for full page reload (ensures auth state is fresh)
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
      
      if (err.response?.status === 403) {
        errorMessage = err.response.data.message || 'Your account is pending admin approval. Please contact the administrator.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.error || 'Invalid Google authentication. Please try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Backend endpoint not found. Please check server configuration.';
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
      {/* Google Sign-In Button Container */}
      <div 
        id="google-signin-button" 
        className={`w-full flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
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
































// // ============================================
// // FILE: frontend/src/components/common/GoogleAuthButton.jsx
// // FINAL FIXED VERSION
// // ============================================

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';

// const GoogleAuthButton = ({ role = 'student' }) => {
//   const navigate = useNavigate();
//   const { setUser, setToken } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadGoogleScript = () => {
//       const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
//       if (existingScript) {
//         if (window.google) {
//           initializeGoogleSignIn();
//         }
//         return;
//       }

//       const script = document.createElement('script');
//       script.src = 'https://accounts.google.com/gsi/client';
//       script.async = true;
//       script.defer = true;
//       script.onload = initializeGoogleSignIn;
//       document.body.appendChild(script);
//     };

//     const initializeGoogleSignIn = () => {
//       if (window.google) {
//         window.google.accounts.id.initialize({
//           client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
//           callback: handleCredentialResponse,
//           auto_select: false,
//           cancel_on_tap_outside: true,
//         });

//         const buttonDiv = document.getElementById('google-signin-button');
//         if (buttonDiv) {
//           window.google.accounts.id.renderButton(
//             buttonDiv,
//             {
//               type: 'standard',
//               theme: 'filled_black',
//               size: 'large',
//               text: 'continue_with',
//               shape: 'rectangular',
//               logo_alignment: 'left',
//               width: 400,  // ✅ FIXED: Use number, not "100%"
//             }
//           );
//         }
//       }
//     };

//     loadGoogleScript();

//     return () => {
//       const buttonDiv = document.getElementById('google-signin-button');
//       if (buttonDiv) {
//         buttonDiv.innerHTML = '';
//       }
//     };
//   }, []);

//   const handleCredentialResponse = async (response) => {
//     setIsLoading(true);
//     setError('');

//     try {
//       const credential = response.credential;

//       console.log('🔵 Sending Google credential to backend...');
      
//       const res = await api.post('/users/auth/google/', {
//         credential,
//         role,
//       });

//       console.log('✅ Google auth successful:', res.data);

//       const { token, user } = res.data;

//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));

//       setToken(token);
//       setUser(user);

//       // Navigate based on role
//       switch (user.role) {
//         case 'student':
//           navigate('/student/dashboard');
//           break;
//         case 'teacher':
//           navigate('/teacher/dashboard');
//           break;
//         case 'admin':
//           navigate('/admin/dashboard');
//           break;
//         default:
//           navigate('/');
//       }

//     } catch (err) {
//       console.error('❌ Google Sign-In Error:', err);
      
//       let errorMessage = 'Google sign-in failed. Please try again.';
      
//       if (err.response?.status === 403) {
//         errorMessage = err.response.data.message || 'Your account is pending admin approval.';
//       } else if (err.response?.status === 400) {
//         errorMessage = err.response.data.error || 'Invalid Google authentication.';
//       } else if (err.response?.status === 404) {
//         errorMessage = 'Backend endpoint not found. Please check server configuration.';
//       } else if (err.response?.data?.error) {
//         errorMessage = err.response.data.error;
//       }
      
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* Google Sign-In Button Container */}
//       <div 
//         id="google-signin-button" 
//         className={`w-full flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
//       />
      
//       {/* Loading State */}
//       {isLoading && (
//         <div className="flex items-center justify-center mt-2">
//           <svg className="animate-spin h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Signing in with Google...</span>
//         </div>
//       )}
      
//       {/* Error Message */}
//       {error && (
//         <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//           <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default GoogleAuthButton;





























// // // src/components/common/GoogleAuthButton.jsx
// // import { GoogleLogin } from '@react-oauth/google';
// // import { useNavigate } from 'react-router-dom';
// // import { toast } from 'react-hot-toast';
// // import { authAPI } from '../../services/api';
// // import api from '../../services/api';

// // /**
// //  * Drop this button into both LoginPage and RegisterPage.
// //  *
// //  * Props:
// //  *   role  — 'student' | 'teacher'  (only relevant for brand-new users)
// //  *
// //  * Flow:
// //  *   Existing user  → saves token & user → navigates to dashboard
// //  *   New user       → saves token & user → navigates to /complete-profile
// //  */
// // const GoogleAuthButton = ({ role = 'student' }) => {
// //   const navigate = useNavigate();

// //   const handleSuccess = async (credentialResponse) => {
// //     try {
// //       const response = await api.post('/api/users/auth/google/', {
// //         credential: credentialResponse.credential,
// //         role,
// //       });

// //       const { token, user, is_new_user } = response.data;

// //       // ── Persist session (same pattern as LoginView) ──────────────
// //       localStorage.setItem('token', token);
// //       localStorage.setItem('user', JSON.stringify(user));
// //       api.defaults.headers.common['Authorization'] = `Token ${token}`;

// //       if (is_new_user) {
// //         toast.success(`Welcome, ${user.first_name}! Let's complete your profile.`);
// //         navigate('/complete-profile');
// //       } else {
// //         // Check if an older Google user somehow still has no profile
// //         if (!user.profile_complete) {
// //           toast('Please complete your profile first.', { icon: '📋' });
// //           navigate('/complete-profile');
// //           return;
// //         }
// //         toast.success(`Welcome back, ${user.first_name}!`);
// //         if (user.role === 'student')       navigate('/student/dashboard');
// //         else if (user.role === 'teacher')  navigate('/teacher/dashboard');
// //         else                               navigate('/admin/dashboard');
// //       }
// //     } catch (err) {
// //       toast.error(err.response?.data?.error || 'Google sign-in failed. Please try again.');
// //     }
// //   };

// //   return (
// //     <div className="flex justify-center">
// //       <GoogleLogin
// //         onSuccess={handleSuccess}
// //         onError={() => toast.error('Google sign-in was cancelled or failed.')}
// //         useOneTap={false}
// //         theme="filled_black"
// //         shape="rectangular"
// //         size="large"
// //         text="continue_with"
// //         width="320"
// //       />
// //     </div>
// //   );
// // };

// // export default GoogleAuthButton;