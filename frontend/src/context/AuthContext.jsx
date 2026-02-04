import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Set auth header
          api.defaults.headers.common['Authorization'] = `Token ${token}`;
          
          // Optionally verify token with backend
          // const response = await api.get('/api/users/profile/');
          // setUser(response.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/users/login/', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set auth header
      api.defaults.headers.common['Authorization'] = `Token ${token}`;

      setUser(userData);

      // Navigate based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (userData.role === 'student') {
        navigate('/student/dashboard');
      }

      toast.success(`Welcome back, ${userData.full_name}!`);
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/users/register/', userData);
      
      toast.success('Registration successful! Please verify your email with the OTP sent.');
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/users/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear auth header
      delete api.defaults.headers.common['Authorization'];
      
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

















// import { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is logged in
//     const storedUser = localStorage.getItem('user');
//     const accessToken = localStorage.getItem('access_token');

//     if (storedUser && accessToken) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData, tokens) => {
//     localStorage.setItem('user', JSON.stringify(userData));
//     localStorage.setItem('access_token', tokens.access);
//     localStorage.setItem('refresh_token', tokens.refresh);
//     setUser(userData);

//     // Redirect based on role
//     if (userData.role === 'student') {
//       navigate('/student/dashboard');
//     } else if (userData.role === 'teacher') {
//       navigate('/teacher/dashboard');
//     } else if (userData.role === 'admin') {
//       navigate('/admin/dashboard');
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     setUser(null);
//     navigate('/login');
//   };

//   const value = {
//     user,
//     loading,
//     login,
//     logout,
//     isAuthenticated: !!user,
//     isStudent: user?.role === 'student',
//     isTeacher: user?.role === 'teacher',
//     isAdmin: user?.role === 'admin',
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;