import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-light dark:glass-dark shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LEFT EMPTY (Logo Removed) */}
          <div></div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Side - Auth & Theme */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <HiMoon className="w-5 h-5" />
              ) : (
                <HiSun className="w-5 h-5" />
              )}
            </button>

            {/* Auth Buttons (Dashboard removed) */}
            {!user && (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass-light dark:glass-dark border-t border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {theme === 'light' ? (
                  <>
                    <HiMoon className="w-5 h-5" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <HiSun className="w-5 h-5" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>

              {/* Mobile Auth Buttons (Dashboard removed) */}
              {!user && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;


























// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';
// import { useTheme } from '../../context/ThemeContext';
// import { useAuth } from '../../context/AuthContext';
// import Button from '../common/Button';

// const Navbar = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const { theme, toggleTheme } = useTheme();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // Handle scroll
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const navLinks = [
//     { name: 'Home', href: '#home' },
//     { name: 'About', href: '#about' },
//     { name: 'Features', href: '#features' },
//     { name: 'Pricing', href: '#pricing' },
//     { name: 'Contact', href: '#contact' },
//   ];

//   return (
//     <nav
//       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//         isScrolled
//           ? 'glass-light dark:glass-dark shadow-lg'
//           : 'bg-transparent'
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-20">
//           {/* Logo */}
//           <Link to="/" className="flex items-center space-x-3">
//             <img 
//               src="/images/logo.png" 
//               alt="EduVibe Logo" 
//               className="h-10 w-auto"
//             />
//             <span className="text-2xl font-bold text-gray-900 dark:text-white">
//               EduVibe
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             {navLinks.map((link) => (
//               <a
//                 key={link.name}
//                 href={link.href}
//                 className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
//               >
//                 {link.name}
//               </a>
//             ))}
//           </div>

//           {/* Right Side - Auth & Theme */}
//           <div className="hidden md:flex items-center space-x-4">
//             {/* Theme Toggle */}
//             <button
//               onClick={toggleTheme}
//               // className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//               aria-label="Toggle theme"
//             >
//               {theme === 'light' ? (
//                 <HiMoon className="w-5 h-5" />
//               ) : (
//                 <HiSun className="w-5 h-5" />
//               )}
//             </button>

//             {/* Auth Buttons */}
//             {user ? (
//               <Button
//                 onClick={() => {
//                   if (user.role === 'admin') navigate('/admin/dashboard');
//                   else if (user.role === 'teacher') navigate('/teacher/dashboard');
//                   else navigate('/student/dashboard');
//                 }}
//               >
//                 Dashboard
//               </Button>
//             ) : (
//               <>
//                 <Button variant="ghost" onClick={() => navigate('/login')}>
//                   Login
//                 </Button>
//                 <Button onClick={() => navigate('/register')}>
//                   Get Started
//                 </Button>
//               </>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
//           >
//             {mobileMenuOpen ? (
//               <HiX className="w-6 h-6" />
//             ) : (
//               <HiMenu className="w-6 h-6" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           className="md:hidden glass-light dark:glass-dark border-t border-gray-200 dark:border-gray-700"
//         >
//           <div className="px-4 py-6 space-y-4">
//             {navLinks.map((link) => (
//               <a
//                 key={link.name}
//                 href={link.href}
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
//               >
//                 {link.name}
//               </a>
//             ))}
            
//             <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
//               {/* Theme Toggle */}
//               <button
//                 onClick={toggleTheme}
//                 className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
//               >
//                 {theme === 'light' ? (
//                   <>
//                     <HiMoon className="w-5 h-5" />
//                     <span>Dark Mode</span>
//                   </>
//                 ) : (
//                   <>
//                     <HiSun className="w-5 h-5" />
//                     <span>Light Mode</span>
//                   </>
//                 )}
//               </button>

//               {/* Auth Buttons */}
//               {user ? (
//                 <Button
//                   className="w-full"
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     if (user.role === 'admin') navigate('/admin/dashboard');
//                     else if (user.role === 'teacher') navigate('/teacher/dashboard');
//                     else navigate('/student/dashboard');
//                   }}
//                 >
//                   Dashboard
//                 </Button>
//               ) : (
//                 <>
//                   <Button
//                     variant="ghost"
//                     className="w-full"
//                     onClick={() => {
//                       setMobileMenuOpen(false);
//                       navigate('/login');
//                     }}
//                   >
//                     Login
//                   </Button>
//                   <Button
//                     className="w-full"
//                     onClick={() => {
//                       setMobileMenuOpen(false);
//                       navigate('/register');
//                     }}
//                   >
//                     Get Started
//                   </Button>
//                 </>
//               )}
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;




















// // import { useState, useEffect } from 'react';
// // import { Link, useLocation } from 'react-router-dom';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { HiMenu, HiX, HiMoon, HiSun } from 'react-icons/hi';
// // import { useTheme } from '../../context/ThemeContext';
// // import { useAuth } from '../../context/AuthContext';

// // const Navbar = () => {
// //   const [isScrolled, setIsScrolled] = useState(false);
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// //   const { theme, toggleTheme } = useTheme();
// //   const { isAuthenticated, user, logout } = useAuth();
// //   const location = useLocation();

// //   useEffect(() => {
// //     const handleScroll = () => setIsScrolled(window.scrollY > 50);
// //     window.addEventListener('scroll', handleScroll);
// //     return () => window.removeEventListener('scroll', handleScroll);
// //   }, []);

// //   useEffect(() => {
// //     setIsMobileMenuOpen(false);
// //   }, [location]);

// //   const navLinks = isAuthenticated ? [] : [
// //     { name: 'Home', path: '/' },
// //     { name: 'About', path: '/about' },
// //     { name: 'Courses', path: '/courses' },
// //     { name: 'Teachers', path: '/teachers' },
// //     { name: 'Pricing', path: '/pricing' },
// //     { name: 'Contact', path: '/contact' },
// //   ];

// //   const isActive = (path) => location.pathname === path;

// //   const getDashboardPath = () => {
// //     if (user?.role === 'student') return '/student/dashboard';
// //     if (user?.role === 'teacher') return '/teacher/dashboard';
// //     if (user?.role === 'admin') return '/admin/dashboard';
// //     return '/';
// //   };

// //   return (
// //     <>
// //       <motion.nav
// //         initial={{ y: -100 }}
// //         animate={{ y: 0 }}
// //         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
// //           isScrolled
// //             ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg'
// //             : 'bg-transparent'
// //         }`}
// //       >
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="flex justify-between items-center h-20">
// //             <Link to={isAuthenticated ? getDashboardPath() : '/'} className="flex items-center space-x-2 group">
// //               <img
// //                 src="/images/logo.png"
// //                 alt="EduVibe"
// //                 className="h-10 w-10 object-contain transform group-hover:scale-110 transition-transform duration-300"
// //               />
// //               <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
// //                 EduVibe
// //               </span>
// //             </Link>

// //             {/* Desktop Navigation */}
// //             <div className="hidden lg:flex items-center space-x-8">
// //               {navLinks.map((link) => (
// //                 <Link
// //                   key={link.path}
// //                   to={link.path}
// //                   className={`relative text-sm font-medium transition-colors duration-300 ${
// //                     isActive(link.path)
// //                       ? 'text-primary-600 dark:text-primary-400'
// //                       : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
// //                   }`}
// //                 >
// //                   {link.name}
// //                   {isActive(link.path) && (
// //                     <motion.div
// //                       layoutId="navbar-indicator"
// //                       className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
// //                       transition={{ type: 'spring', stiffness: 380, damping: 30 }}
// //                     />
// //                   )}
// //                 </Link>
// //               ))}
// //             </div>

// //             <div className="hidden lg:flex items-center space-x-4">
// //               <button
// //                 onClick={toggleTheme}
// //                 className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
// //                 aria-label="Toggle theme"
// //               >
// //                 {theme === 'light' ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
// //               </button>

// //               {isAuthenticated ? (
// //                 <>
// //                   <Link
// //                     to={getDashboardPath()}
// //                     className="px-6 py-2 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-gray-800 rounded-full transition-colors"
// //                   >
// //                     Dashboard
// //                   </Link>
// //                   <button
// //                     onClick={logout}
// //                     className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
// //                   >
// //                     Logout
// //                   </button>
// //                 </>
// //               ) : (
// //                 <>
// //                   <Link
// //                     to="/login"
// //                     className="px-6 py-2 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-gray-800 rounded-full transition-colors"
// //                   >
// //                     Login
// //                   </Link>
// //                   <Link to="/register" className="btn-primary">
// //                     Get Started
// //                   </Link>
// //                 </>
// //               )}
// //             </div>

// //             {/* Mobile Menu Button */}
// //             <div className="lg:hidden flex items-center space-x-4">
// //               <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
// //                 {theme === 'light' ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
// //               </button>
// //               <button
// //                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
// //                 className="p-2 rounded-lg text-gray-700 dark:text-gray-300"
// //               >
// //                 {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </motion.nav>

// //       {/* Mobile Menu */}
// //       <AnimatePresence>
// //         {isMobileMenuOpen && (
// //           <>
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               exit={{ opacity: 0 }}
// //               onClick={() => setIsMobileMenuOpen(false)}
// //               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
// //             />
// //             <motion.div
// //               initial={{ x: '100%' }}
// //               animate={{ x: 0 }}
// //               exit={{ x: '100%' }}
// //               transition={{ type: 'tween', duration: 0.3 }}
// //               className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto"
// //             >
// //               <div className="p-6">
// //                 <div className="flex justify-between items-center mb-8">
// //                   <Link to="/" className="flex items-center space-x-2">
// //                     <img src="/images/logo.png" alt="EduVibe" className="h-8 w-8" />
// //                     <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
// //                       EduVibe
// //                     </span>
// //                   </Link>
// //                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg">
// //                     <HiX className="w-6 h-6" />
// //                   </button>
// //                 </div>

// //                 <nav className="space-y-1">
// //                   {navLinks.map((link) => (
// //                     <Link
// //                       key={link.path}
// //                       to={link.path}
// //                       className={`block px-4 py-3 rounded-lg font-medium ${
// //                         isActive(link.path)
// //                           ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
// //                           : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
// //                       }`}
// //                     >
// //                       {link.name}
// //                     </Link>
// //                   ))}
// //                 </nav>

// //                 <div className="mt-8 space-y-3">
// //                   {isAuthenticated ? (
// //                     <>
// //                       <Link
// //                         to={getDashboardPath()}
// //                         className="block w-full px-6 py-3 text-center bg-primary-600 text-white font-semibold rounded-full"
// //                       >
// //                         Dashboard
// //                       </Link>
// //                       <button
// //                         onClick={logout}
// //                         className="block w-full px-6 py-3 text-center bg-red-600 text-white font-semibold rounded-full"
// //                       >
// //                         Logout
// //                       </button>
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Link
// //                         to="/login"
// //                         className="block w-full px-6 py-3 text-center bg-white dark:bg-gray-800 text-primary-600 border-2 border-primary-600 font-semibold rounded-full"
// //                       >
// //                         Login
// //                       </Link>
// //                       <Link
// //                         to="/register"
// //                         className="block w-full px-6 py-3 text-center btn-primary"
// //                       >
// //                         Get Started
// //                       </Link>
// //                     </>
// //                   )}
// //                 </div>
// //               </div>
// //             </motion.div>
// //           </>
// //         )}
// //       </AnimatePresence>
// //     </>
// //   );
// // };

// // export default Navbar;