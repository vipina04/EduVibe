// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import axios from 'axios'; // ✅ ADDED

const AuthContext = createContext(); 

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // ✅ ADDED
  const navigate = useNavigate();

  // ✅ ADD: Attach token to axios globally
  const setAxiosAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token) {
        setAxiosAuthToken(token); // ✅ ADDED
      }

      if (token && userData) {
        try {
          // Temporary user from storage
          setUser(JSON.parse(userData));

          // 🔥 Fetch full profile
          const response = await authAPI.getProfile();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.clear();
          setAxiosAuthToken(null); // ✅ ADDED
          setUser(null);
        }
      }

      setLoading(false);
      setAuthReady(true); // ✅ ADDED
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await authAPI.login({ identifier, password });

      const { token, role, unique_id } = response.data;

      const userData = { role, unique_id };

      // ✅ SAVE TOKEN + SYNC AXIOS
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setAxiosAuthToken(token); // ✅ ADDED

      setUser(userData);
      toast.success('Login successful!');

      // 🔥 IMMEDIATELY FETCH FULL PROFILE
      try {
        const profileRes = await authAPI.getProfile();
        setUser(profileRes.data);
        localStorage.setItem('user', JSON.stringify(profileRes.data));
      } catch (err) {
        console.error('Profile fetch failed after login', err);
      }

      // Navigate based on role
      if (role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Login failed';

      toast.error(message);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Registration failed';

      toast.error(message);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAxiosAuthToken(null); // ✅ ADDED
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    authReady, // ✅ ADDED
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
  };

  // 🔥 Prevent blank page before auth finishes
  if (!authReady) return null; // ✅ ADDED

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;







































// // src/context/AuthContext.jsx
// import { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { authAPI } from '../services/api';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();


  

//   useEffect(() => {
//     const initAuth = async () => {
//       const token = localStorage.getItem('token'); // ← CHANGED
//       const userData = localStorage.getItem('user');

//       if (token && userData) {
//         try {
//           setUser(JSON.parse(userData));
//           const response = await authAPI.getProfile();
//           setUser(response.data);
//           localStorage.setItem('user', JSON.stringify(response.data));
//         } catch (error) {
//           console.error('Auth verification failed:', error);
//           localStorage.clear();
//           setUser(null);
//         }
//       }
//       setLoading(false);
//     };

//     initAuth();
//   }, []);

//   const login = async (identifier, password) => {
//     try {
//       const response = await authAPI.login({ identifier, password });
//       const { token, role, unique_id } = response.data; // ← CHANGED
//       const normalizedRole = role?.toUpperCase();


//       const userData = { role, unique_id }; // ← CHANGED

//       localStorage.setItem('token', token); // ← CHANGED
//       localStorage.setItem('user', JSON.stringify(userData));

//       setUser(userData);
//       toast.success('Login successful!');


    



               

//       // Navigate based on role
//       if (role === 'student') {
//         navigate('/student/dashboard');
//       } else if (role === 'teacher') {
//         navigate('/teacher/dashboard');
//       } else if (role === 'admin') {
//         navigate('/admin/dashboard');
//       }

//       if (normalizedRole === 'STUDENT') {
//       navigate('/student');
//       } else if (normalizedRole === 'TEACHER') {
//       navigate('/teacher');
//      } else if (normalizedRole === 'ADMIN') {
//       navigate('/admin');
     
//     }
     

//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.error || 
//                      error.response?.data?.message || 
//                      error.response?.data?.detail || 
//                      'Login failed';
//       toast.error(message);
//       return { success: false, error };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await authAPI.register(userData);
//       // Don't auto-navigate - let RegisterPage handle OTP flow
//       return { success: true, data: response.data };
//     } catch (error) {
//       const message = error.response?.data?.error || 
//                      error.response?.data?.message || 
//                      error.response?.data?.detail || 
//                      'Registration failed';
//       toast.error(message);
//       return { success: false, error };
//     }
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setUser(null);
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       toast.success('Logged out successfully');
//       navigate('/login');
//     }
//   };

//   const updateProfile = async (data) => {
//     try {
//       const response = await authAPI.updateProfile(data);
//       setUser(response.data);
//       localStorage.setItem('user', JSON.stringify(response.data));
//       toast.success('Profile updated successfully');
//       return { success: true };
//     } catch (error) {
//       toast.error('Failed to update profile');
//       return { success: false, error };
//     }
//   };

//   const value = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//     updateProfile,
//     isAuthenticated: !!user,
//     isStudent: user?.role === 'student',
//     isTeacher: user?.role === 'teacher',
//     isAdmin: user?.role === 'admin',
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthContext;



























// // import { createContext, useContext, useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { authAPI } from '../services/api';
// // import toast from 'react-hot-toast';

// // const AuthContext = createContext();

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) {
// //     throw new Error('useAuth must be used within AuthProvider');
// //   }
// //   return context;
// // };

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const initAuth = async () => {
// //       const token = localStorage.getItem('access_token');
// //       const userData = localStorage.getItem('user');

// //       if (token && userData) {
// //         try {
// //           setUser(JSON.parse(userData));
// //           const response = await authAPI.getProfile();
// //           setUser(response.data);
// //           localStorage.setItem('user', JSON.stringify(response.data));
// //         } catch (error) {
// //           console.error('Auth verification failed:', error);
// //           localStorage.clear();
// //           setUser(null);
// //         }
// //       }
// //       setLoading(false);
// //     };

// //     initAuth();
// //   }, []);

// //   const login = async (email, password) => {
// //     try {
// //       const response = await authAPI.login({ email, password });
// //       const { access, refresh, user: userData } = response.data;

// //       localStorage.setItem('access_token', access);
// //       localStorage.setItem('refresh_token', refresh);
// //       localStorage.setItem('user', JSON.stringify(userData));

// //       setUser(userData);
// //       toast.success('Login successful!');

// //       if (userData.role === 'student') {
// //         navigate('/student/dashboard');
// //       } else if (userData.role === 'teacher') {
// //         navigate('/teacher/dashboard');
// //       } else if (userData.role === 'admin') {
// //         navigate('/admin/dashboard');
// //       }

// //       return { success: true };
// //     } catch (error) {
// //       const message = error.response?.data?.message || error.response?.data?.detail || 'Login failed';
// //       toast.error(message);
// //       return { success: false, error };
// //     }
// //   };

// //   const register = async (userData) => {
// //     try {
// //       await authAPI.register(userData);
// //       toast.success('Registration successful! Please login.');
// //       navigate('/login');
// //       return { success: true };
// //     } catch (error) {
// //       const message = error.response?.data?.message || error.response?.data?.detail || 'Registration failed';
// //       toast.error(message);
// //       return { success: false, error };
// //     }
// //   };

// //   const logout = async () => {
// //     try {
// //       await authAPI.logout();
// //       setUser(null);
// //       toast.success('Logged out successfully');
// //       navigate('/login');
// //     } catch (error) {
// //       setUser(null);
// //       localStorage.clear();
// //       navigate('/login');
// //     }
// //   };

// //   const updateProfile = async (data) => {
// //     try {
// //       const response = await authAPI.updateProfile(data);
// //       setUser(response.data);
// //       localStorage.setItem('user', JSON.stringify(response.data));
// //       toast.success('Profile updated successfully');
// //       return { success: true };
// //     } catch (error) {
// //       toast.error('Failed to update profile');
// //       return { success: false, error };
// //     }
// //   };

// //   const value = {
// //     user,
// //     loading,
// //     login,
// //     register,
// //     logout,
// //     updateProfile,
// //     isAuthenticated: !!user,
// //     isStudent: user?.role === 'student',
// //     isTeacher: user?.role === 'teacher',
// //     isAdmin: user?.role === 'admin',
// //   };

// //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// // };

// // export default AuthContext;














// // // import { createContext, useContext, useState, useEffect } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import api from '../services/api';
// // // import toast from 'react-hot-toast';

// // // const AuthContext = createContext();

// // // export const useAuth = () => {
// // //   const context = useContext(AuthContext);
// // //   if (!context) {
// // //     throw new Error('useAuth must be used within AuthProvider');
// // //   }
// // //   return context;
// // // };

// // // export const AuthProvider = ({ children }) => {
// // //   const [user, setUser] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const navigate = useNavigate();

// // //   useEffect(() => {
// // //     const loadUser = async () => {
// // //       const token = localStorage.getItem('token');
// // //       const userData = localStorage.getItem('user');
      
// // //       if (token && userData) {
// // //         try {
// // //           const parsedUser = JSON.parse(userData);
// // //           setUser(parsedUser);
// // //           api.defaults.headers.common['Authorization'] = `Token ${token}`;
// // //         } catch (error) {
// // //           console.error('Failed to load user:', error);
// // //           localStorage.removeItem('token');
// // //           localStorage.removeItem('user');
// // //         }
// // //       }
// // //       setLoading(false);
// // //     };

// // //     loadUser();
// // //   }, []);

// // //   const login = async (email, password) => {
// // //     try {
// // //       const response = await api.post('/api/users/login/', { email, password });
// // //       const { token, user: userData } = response.data;

// // //       localStorage.setItem('token', token);
// // //       localStorage.setItem('user', JSON.stringify(userData));
// // //       api.defaults.headers.common['Authorization'] = `Token ${token}`;
// // //       setUser(userData);

// // //       if (userData.role === 'admin') navigate('/admin/dashboard');
// // //       else if (userData.role === 'teacher') navigate('/teacher/dashboard');
// // //       else if (userData.role === 'student') navigate('/student/dashboard');

// // //       toast.success(`Welcome back, ${userData.full_name}!`);
// // //     } catch (error) {
// // //       toast.error(error.response?.data?.error || 'Login failed');
// // //       throw error;
// // //     }
// // //   };

// // //   const register = async (userData) => {
// // //     try {
// // //       const response = await api.post('/api/users/register/', userData);
// // //       toast.success('Registration successful! Please verify your email with the OTP sent.');
// // //       return response.data;
// // //     } catch (error) {
// // //       toast.error(error.response?.data?.error || 'Registration failed');
// // //       throw error;
// // //     }
// // //   };

// // //   const logout = async () => {
// // //     try {
// // //       await api.post('/api/users/logout/');
// // //     } catch (error) {
// // //       console.error('Logout error:', error);
// // //     } finally {
// // //       localStorage.removeItem('token');
// // //       localStorage.removeItem('user');
// // //       delete api.defaults.headers.common['Authorization'];
// // //       setUser(null);
// // //       navigate('/login');
// // //       toast.success('Logged out successfully');
// // //     }
// // //   };

// // //   const value = { user, loading, login, register, logout, setUser };

// // //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// // // };

























// // // // import { createContext, useContext, useState, useEffect } from 'react';
// // // // import { useNavigate } from 'react-router-dom';
// // // // import api from '../services/api';
// // // // import toast from 'react-hot-toast';

// // // // const AuthContext = createContext();

// // // // export const useAuth = () => {
// // // //   const context = useContext(AuthContext);
// // // //   if (!context) {
// // // //     throw new Error('useAuth must be used within AuthProvider');
// // // //   }
// // // //   return context;
// // // // };

// // // // export const AuthProvider = ({ children }) => {
// // // //   const [user, setUser] = useState(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const navigate = useNavigate();

// // // //   // Load user from localStorage on mount
// // // //   useEffect(() => {
// // // //     const loadUser = async () => {
// // // //       const token = localStorage.getItem('token');
// // // //       const userData = localStorage.getItem('user');
      
// // // //       if (token && userData) {
// // // //         try {
// // // //           const parsedUser = JSON.parse(userData);
// // // //           setUser(parsedUser);
          
// // // //           // Set auth header
// // // //           api.defaults.headers.common['Authorization'] = `Token ${token}`;
// // // //         } catch (error) {
// // // //           console.error('Failed to load user:', error);
// // // //           logout();
// // // //         }
// // // //       }
// // // //       setLoading(false);
// // // //     };

// // // //     loadUser();
// // // //   }, []);

// // // //   const login = async (email, password) => {
// // // //     try {
// // // //       const response = await api.post('/api/users/login/', {
// // // //         email,
// // // //         password,
// // // //       });

// // // //       const { token, user: userData } = response.data;

// // // //       // Save to localStorage
// // // //       localStorage.setItem('token', token);
// // // //       localStorage.setItem('user', JSON.stringify(userData));

// // // //       // Set auth header
// // // //       api.defaults.headers.common['Authorization'] = `Token ${token}`;

// // // //       setUser(userData);

// // // //       // Navigate based on role
// // // //       if (userData.role === 'admin') {
// // // //         navigate('/admin/dashboard');
// // // //       } else if (userData.role === 'teacher') {
// // // //         navigate('/teacher/dashboard');
// // // //       } else if (userData.role === 'student') {
// // // //         navigate('/student/dashboard');
// // // //       }

// // // //       toast.success(`Welcome back, ${userData.full_name}!`);
// // // //     } catch (error) {
// // // //       const message = error.response?.data?.error || 'Login failed';
// // // //       toast.error(message);
// // // //       throw error;
// // // //     }
// // // //   };

// // // //   const register = async (userData) => {
// // // //     try {
// // // //       const response = await api.post('/api/users/register/', userData);
      
// // // //       toast.success('Registration successful! Please verify your email with the OTP sent.');
      
// // // //       return response.data;
// // // //     } catch (error) {
// // // //       const message = error.response?.data?.error || 'Registration failed';
// // // //       toast.error(message);
// // // //       throw error;
// // // //     }
// // // //   };

// // // //   const logout = async () => {
// // // //     try {
// // // //       await api.post('/api/users/logout/');
// // // //     } catch (error) {
// // // //       console.error('Logout error:', error);
// // // //     } finally {
// // // //       // Clear localStorage
// // // //       localStorage.removeItem('token');
// // // //       localStorage.removeItem('user');
      
// // // //       // Clear auth header
// // // //       delete api.defaults.headers.common['Authorization'];
      
// // // //       setUser(null);
// // // //       navigate('/login');
// // // //       toast.success('Logged out successfully');
// // // //     }
// // // //   };

// // // //   const value = {
// // // //     user,
// // // //     loading,
// // // //     login,
// // // //     register,
// // // //     logout,
// // // //     setUser,
// // // //   };

// // // //   return (
// // // //     <AuthContext.Provider value={value}>
// // // //       {children}
// // // //     </AuthContext.Provider>
// // // //   );
// // // // };















// // // // // import { createContext, useContext, useState, useEffect } from 'react';
// // // // // import { useNavigate } from 'react-router-dom';
// // // // // import api from '../services/api';
// // // // // import toast from 'react-hot-toast';

// // // // // const AuthContext = createContext();

// // // // // export const useAuth = () => {
// // // // //   const context = useContext(AuthContext);
// // // // //   if (!context) {
// // // // //     throw new Error('useAuth must be used within AuthProvider');
// // // // //   }
// // // // //   return context;
// // // // // };

// // // // // export const AuthProvider = ({ children }) => {
// // // // //   const [user, setUser] = useState(null);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const navigate = useNavigate();

// // // // //   // Load user from localStorage on mount
// // // // //   useEffect(() => {
// // // // //     const loadUser = async () => {
// // // // //       const token = localStorage.getItem('token');
// // // // //       const userData = localStorage.getItem('user');
      
// // // // //       if (token && userData) {
// // // // //         try {
// // // // //           const parsedUser = JSON.parse(userData);
// // // // //           setUser(parsedUser);
          
// // // // //           // Set auth header
// // // // //           api.defaults.headers.common['Authorization'] = `Token ${token}`;
          
// // // // //           // Optionally verify token with backend
// // // // //           // const response = await api.get('/api/users/profile/');
// // // // //           // setUser(response.data);
// // // // //         } catch (error) {
// // // // //           console.error('Failed to load user:', error);
// // // // //           logout();
// // // // //         }
// // // // //       }
// // // // //       setLoading(false);
// // // // //     };

// // // // //     loadUser();
// // // // //   }, []);

// // // // //   const login = async (email, password) => {
// // // // //     try {
// // // // //       const response = await api.post('/api/users/login/', {
// // // // //         email,
// // // // //         password,
// // // // //       });

// // // // //       const { token, user: userData } = response.data;

// // // // //       // Save to localStorage
// // // // //       localStorage.setItem('token', token);
// // // // //       localStorage.setItem('user', JSON.stringify(userData));

// // // // //       // Set auth header
// // // // //       api.defaults.headers.common['Authorization'] = `Token ${token}`;

// // // // //       setUser(userData);

// // // // //       // Navigate based on role
// // // // //       if (userData.role === 'admin') {
// // // // //         navigate('/admin/dashboard');
// // // // //       } else if (userData.role === 'teacher') {
// // // // //         navigate('/teacher/dashboard');
// // // // //       } else if (userData.role === 'student') {
// // // // //         navigate('/student/dashboard');
// // // // //       }

// // // // //       toast.success(`Welcome back, ${userData.full_name}!`);
// // // // //     } catch (error) {
// // // // //       const message = error.response?.data?.error || 'Login failed';
// // // // //       toast.error(message);
// // // // //       throw error;
// // // // //     }
// // // // //   };

// // // // //   const register = async (userData) => {
// // // // //     try {
// // // // //       const response = await api.post('/api/users/register/', userData);
      
// // // // //       toast.success('Registration successful! Please verify your email with the OTP sent.');
      
// // // // //       return response.data;
// // // // //     } catch (error) {
// // // // //       const message = error.response?.data?.error || 'Registration failed';
// // // // //       toast.error(message);
// // // // //       throw error;
// // // // //     }
// // // // //   };

// // // // //   const logout = async () => {
// // // // //     try {
// // // // //       await api.post('/api/users/logout/');
// // // // //     } catch (error) {
// // // // //       console.error('Logout error:', error);
// // // // //     } finally {
// // // // //       // Clear localStorage
// // // // //       localStorage.removeItem('token');
// // // // //       localStorage.removeItem('user');
      
// // // // //       // Clear auth header
// // // // //       delete api.defaults.headers.common['Authorization'];
      
// // // // //       setUser(null);
// // // // //       navigate('/login');
// // // // //       toast.success('Logged out successfully');
// // // // //     }
// // // // //   };

// // // // //   const value = {
// // // // //     user,
// // // // //     loading,
// // // // //     login,
// // // // //     register,
// // // // //     logout,
// // // // //     setUser,
// // // // //   };

// // // // //   return (
// // // // //     <AuthContext.Provider value={value}>
// // // // //       {children}
// // // // //     </AuthContext.Provider>
// // // // //   );
// // // // // };

















// // // // // // import { createContext, useContext, useState, useEffect } from 'react';
// // // // // // import { useNavigate } from 'react-router-dom';

// // // // // // const AuthContext = createContext();

// // // // // // export const useAuth = () => {
// // // // // //   const context = useContext(AuthContext);
// // // // // //   if (!context) {
// // // // // //     throw new Error('useAuth must be used within an AuthProvider');
// // // // // //   }
// // // // // //   return context;
// // // // // // };

// // // // // // export const AuthProvider = ({ children }) => {
// // // // // //   const [user, setUser] = useState(null);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const navigate = useNavigate();

// // // // // //   useEffect(() => {
// // // // // //     // Check if user is logged in
// // // // // //     const storedUser = localStorage.getItem('user');
// // // // // //     const accessToken = localStorage.getItem('access_token');

// // // // // //     if (storedUser && accessToken) {
// // // // // //       setUser(JSON.parse(storedUser));
// // // // // //     }
// // // // // //     setLoading(false);
// // // // // //   }, []);

// // // // // //   const login = (userData, tokens) => {
// // // // // //     localStorage.setItem('user', JSON.stringify(userData));
// // // // // //     localStorage.setItem('access_token', tokens.access);
// // // // // //     localStorage.setItem('refresh_token', tokens.refresh);
// // // // // //     setUser(userData);

// // // // // //     // Redirect based on role
// // // // // //     if (userData.role === 'student') {
// // // // // //       navigate('/student/dashboard');
// // // // // //     } else if (userData.role === 'teacher') {
// // // // // //       navigate('/teacher/dashboard');
// // // // // //     } else if (userData.role === 'admin') {
// // // // // //       navigate('/admin/dashboard');
// // // // // //     }
// // // // // //   };

// // // // // //   const logout = () => {
// // // // // //     localStorage.removeItem('user');
// // // // // //     localStorage.removeItem('access_token');
// // // // // //     localStorage.removeItem('refresh_token');
// // // // // //     setUser(null);
// // // // // //     navigate('/login');
// // // // // //   };

// // // // // //   const value = {
// // // // // //     user,
// // // // // //     loading,
// // // // // //     login,
// // // // // //     logout,
// // // // // //     isAuthenticated: !!user,
// // // // // //     isStudent: user?.role === 'student',
// // // // // //     isTeacher: user?.role === 'teacher',
// // // // // //     isAdmin: user?.role === 'admin',
// // // // // //   };

// // // // // //   return (
// // // // // //     <AuthContext.Provider value={value}>
// // // // // //       {!loading && children}
// // // // // //     </AuthContext.Provider>
// // // // // //   );
// // // // // // };

// // // // // // export default AuthContext;