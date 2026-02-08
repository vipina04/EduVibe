import Navbar from '../components/layout/Navbar';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import HowItWorks from '../components/Landing/HowItWorks';
import Testimonials from '../components/Landing/Testimonials';
// import CTA from '../components/Landing/CTA';
import Footer from '../components/Landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      {/* <CTA /> */}
      <Footer />
    </div>
  );
};

export default LandingPage;























// import { useNavigate } from 'react-router-dom';
// import { useTheme } from '../context/ThemeContext';

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <div className={theme === 'light' ? 'bg-white' : 'bg-gray-900'}>
//       {/* Navbar */}
//       <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex items-center justify-between h-16">
//             <h1 className="text-2xl font-bold text-blue-600">EduVibe</h1>
//             <div className="flex items-center space-x-4">
//               <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
//                 {theme === 'light' ? '🌙' : '☀️'}
//               </button>
//               <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-700 dark:text-gray-300">
//                 Login
//               </button>
//               <button onClick={() => navigate('/register')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
//                 Get Started
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero */}
//       <div className="pt-24 pb-20 px-4 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
//         <div className="max-w-7xl mx-auto text-center">
//           <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
//             Empower Learning.<br />
//             <span className="text-blue-600">Simplify Management.</span>
//           </h1>
//           <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
//             Manage classes, teachers, and students effortlessly with EduVibe.
//           </p>
//           <div className="flex gap-4 justify-center">
//             <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700">
//               Get Started Free →
//             </button>
//             <button className="px-8 py-4 bg-white dark:bg-gray-800 rounded-lg text-lg font-semibold border">
//               Watch Demo
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;




















// // const LandingPage = () => {
// //   return (
// //     <div style={{ padding: '50px', background: 'white' }}>
// //       <h1 style={{ color: 'black', fontSize: '48px' }}>
// //         🎉 EduVibe is Working!
// //       </h1>
// //       <p style={{ color: 'gray', fontSize: '20px' }}>
// //         If you see this, React is rendering correctly.
// //       </p>
// //     </div>
// //   );
// // };

// // export default LandingPage;















// // // import Navbar from '../components/layout/Navbar';
// // // import Hero from '../components/Landing/Hero';
// // // import Features from '../components/Landing/Features';
// // // import HowItWorks from '../components/Landing/HowItWorks';
// // // import Testimonials from '../components/Landing/Testimonials';
// // // import CTA from '../components/Landing/CTA';
// // // import Footer from '../components/Landing/Footer';

// // // const LandingPage = () => {
// // //   return (
// // //     <div className="min-h-screen">
// // //       <Navbar />
// // //       <Hero />
// // //       <Features />
// // //       <HowItWorks />
// // //       <Testimonials />
// // //       <CTA />
// // //       <Footer />
// // //     </div>
// // //   );
// // // };

// // // export default LandingPage;