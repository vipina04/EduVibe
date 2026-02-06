import { motion } from 'framer-motion';
import { HiPlay } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';

const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section
      id="home"
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
        theme === 'light' ? 'hero-bg-light' : 'hero-bg-dark'
      }`}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 text-center">
      {/* <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center"> */}
        {/* <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center"></div> */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo Integration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-2"
          >
            <img 
              src="/images/logo.png" 
              alt="EduVibe Logo" 
              className="h-45 w-auto md:h-45 drop-shadow-2xl" 
            />
          </motion.div>

          {/* Badge */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          > */}
          <motion.div className="hidden">
            {/* <div className="glass-light dark:glass-dark px-6 py-2 rounded-full border border-white/20 dark:border-white/10"> */}
              {/* <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                ✨ Modern Tuition Management Platform
              </p> */}
            {/* </div> */}
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight"
          >
            
            
            {/* <span className="text-blue-600 dark:text-blue-400"> */}
            <span className="bg-gradient-to-r from-purple-900 via-indigo-500 to-teal-600 bg-clip-text text-transparent">
              
                      EDUCATE • ELEVATE • EXCEL

            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-5 max-w-3xl mx-auto leading-relaxed"
          >
            Manage classes, teachers, and students effortlessly with EduVibe.
            The complete solution for modern tuition centers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-2 justify-center"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="group shadow-xl border-none text-white bg-gradient-to-r from-purple-900 via-indigo-500 to-teal-600 hover:opacity-90 transition-opacity"

            >
              Get Started 
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            {/* <Button 
              variant="ghost" 
              size="lg"
              className="glass-light dark:glass-dark border border-white/20 dark:border-white/10"
              icon={<HiPlay className="w-5 h-5" />}
            >
              Watch Demo
            </Button> */}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            {[
              // { label: 'Students', value: '10,000+' },
              // { label: 'Teachers', value: '500+' },
              // { label: 'Satisfaction', value: '98%' },
            ].map((stat, index) => (
              <div key={index} className="glass-light dark:glass-dark p-4 md:p-6 rounded-xl border border-white/20 dark:border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero;








































// import { motion } from 'framer-motion';
// import { HiPlay } from 'react-icons/hi';
// import { useNavigate } from 'react-router-dom';
// import { useTheme } from '../../context/ThemeContext';
// import Button from '../common/Button';

// const Hero = () => {
//   const navigate = useNavigate();
//   const { theme } = useTheme();

//   return (
//     <section
//       id="home"
//       className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
//         theme === 'light' ? 'hero-bg-light' : 'hero-bg-dark'
//       }`}
//     >
//       {/* Overlay for better text readability */}
//       <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

//       {/* Content */}
//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           {/* Badge */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.2 }}
//             className="inline-block mb-6"
//           >
//             <div className="glass-light dark:glass-dark px-6 py-2 rounded-full">
//               <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
//                 ✨ Modern Tuition Management Platform
//               </p>
//             </div>
//           </motion.div>

//           {/* Main Heading */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
//           >
//             Empower Learning.  
//             <br />
//             <span className="text-blue-600 dark:text-blue-400">
//               Simplify Management.
//             </span>
//           </motion.h1>

//           {/* Subheading */}
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto"
//           >
//             Manage classes, teachers, and students effortlessly with EduVibe.
//             The complete solution for modern tuition centers.
//           </motion.p>

//           {/* CTA Buttons */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             className="flex flex-col sm:flex-row gap-4 justify-center"
//           >
//             <Button 
//               size="lg" 
//               onClick={() => navigate('/register')}
//               className="group"
//             >
//               Get Started Free
//               <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//               </svg>
//             </Button>
//             <Button 
//               variant="ghost" 
//               size="lg"
//               className="glass-light dark:glass-dark"
//               icon={<HiPlay className="w-5 h-5" />}
//             >
//               Watch Demo
//             </Button>
//           </motion.div>

//           {/* Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
//           >
//             {[
//               { label: 'Students', value: '10,000+' },
//               { label: 'Teachers', value: '500+' },
//               { label: 'Satisfaction', value: '98%' },
//             ].map((stat, index) => (
//               <div key={index} className="glass-light dark:glass-dark p-6 rounded-xl">
//                 <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
//                   {stat.value}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   {stat.label}
//                 </p>
//               </div>
//             ))}
//           </motion.div>
//         </motion.div>
//       </div>

//       {/* Scroll Indicator */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
//         className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
//       >
//         <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//         </svg>
//       </motion.div>
//     </section>
//   );
// };

// export default Hero;











// // import { motion } from 'framer-motion';
// // import { Link } from 'react-router-dom';
// // import { HiPlay, HiArrowRight } from 'react-icons/hi';
// // import { useTheme } from '../../context/ThemeContext';

// // const Hero = () => {
// //   const { theme } = useTheme();

// //   const containerVariants = {
// //     hidden: { opacity: 0 },
// //     visible: {
// //       opacity: 1,
// //       transition: {
// //         delayChildren: 0.3,
// //         staggerChildren: 0.2,
// //       },
// //     },
// //   };

// //   const itemVariants = {
// //     hidden: { y: 20, opacity: 0 },
// //     visible: {
// //       y: 0,
// //       opacity: 1,
// //       transition: {
// //         duration: 0.5,
// //       },
// //     },
// //   };

// //   const highlights = [
// //     { icon: '✓', text: '100% Online Management' },
// //     { icon: '✓', text: 'Easy Scheduling' },
// //     { icon: '✓', text: 'Certified Teachers' },
// //   ];

// //   return (
// //     <section
// //       className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
// //       style={{
// //         backgroundImage: theme === 'dark' 
// //           ? "url('/images/grey_black.png')" 
// //           : "url('/images/blue_white.png')",
// //         backgroundSize: 'cover',
// //         backgroundPosition: 'center',
// //         backgroundRepeat: 'no-repeat',
// //         transition: 'background-image 0.5s ease-in-out',
// //       }}
// //     >
// //       <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 dark:from-black/40 dark:to-black/60" />

// //       <div className="absolute inset-0 overflow-hidden pointer-events-none">
// //         <motion.div
// //           animate={{
// //             scale: [1, 1.2, 1],
// //             rotate: [0, 90, 0],
// //           }}
// //           transition={{
// //             duration: 20,
// //             repeat: Infinity,
// //             ease: 'linear',
// //           }}
// //           className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"
// //         />
// //         <motion.div
// //           animate={{
// //             scale: [1, 1.3, 1],
// //             rotate: [0, -90, 0],
// //           }}
// //           transition={{
// //             duration: 15,
// //             repeat: Infinity,
// //             ease: 'linear',
// //           }}
// //           className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-light/10 rounded-full blur-3xl"
// //         />
// //       </div>

// //       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
// //         <motion.div
// //           variants={containerVariants}
// //           initial="hidden"
// //           animate="visible"
// //           className="text-center"
// //         >
// //           <motion.div variants={itemVariants} className="inline-block mb-6">
// //             <span className="inline-flex items-center px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
// //               <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
// //               Trusted by 10,000+ Students & Teachers
// //             </span>
// //           </motion.div>

// //           <motion.h1
// //             variants={itemVariants}
// //             className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
// //           >
// //             Empower Learning.
// //             <br />
// //             <span className="bg-gradient-to-r from-primary-400 to-accent-light bg-clip-text text-transparent">
// //               Simplify Tuition Management.
// //             </span>
// //           </motion.h1>

// //           <motion.p
// //             variants={itemVariants}
// //             className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed"
// //           >
// //             Manage classes, teachers, and students effortlessly with EduVibe.
// //             <br />
// //             The all-in-one platform for modern education.
// //           </motion.p>

// //           <motion.div
// //             variants={itemVariants}
// //             className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
// //           >
// //             <Link
// //               to="/register"
// //               className="group flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-full hover:from-primary-700 hover:to-primary-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary-500/50"
// //             >
// //               <HiPlay className="w-5 h-5 mr-2" />
// //               Get Started Now
// //               <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
// //             </Link>
// //             <Link
// //               to="/login"
// //               className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
// //             >
// //               Sign In
// //             </Link>
// //           </motion.div>

// //           <motion.div
// //             variants={itemVariants}
// //             className="flex flex-col sm:flex-row gap-4 justify-center items-center"
// //           >
// //             {highlights.map((highlight, index) => (
// //               <motion.div
// //                 key={index}
// //                 initial={{ opacity: 0, y: 20 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.8 + index * 0.1 }}
// //                 className="glass-card px-6 py-3 backdrop-blur-xl bg-white/10 border border-white/20"
// //               >
// //                 <div className="flex items-center space-x-2">
// //                   <span className="text-green-400 text-xl font-bold">
// //                     {highlight.icon}
// //                   </span>
// //                   <span className="text-white font-medium text-sm">
// //                     {highlight.text}
// //                   </span>
// //                 </div>
// //               </motion.div>
// //             ))}
// //           </motion.div>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 1.5 }}
// //           className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
// //         >
// //           <motion.div
// //             animate={{ y: [0, 10, 0] }}
// //             transition={{ duration: 1.5, repeat: Infinity }}
// //             className="flex flex-col items-center text-white/80"
// //           >
// //             <span className="text-sm mb-2">Scroll to explore</span>
// //             <svg
// //               className="w-6 h-6"
// //               fill="none"
// //               stroke="currentColor"
// //               viewBox="0 0 24 24"
// //             >
// //               <path
// //                 strokeLinecap="round"
// //                 strokeLinejoin="round"
// //                 strokeWidth={2}
// //                 d="M19 14l-7 7m0 0l-7-7m7 7V3"
// //               />
// //             </svg>
// //           </motion.div>
// //         </motion.div>
// //       </div>

// //       <motion.div
// //         animate={{
// //           y: [0, -20, 0],
// //         }}
// //         transition={{
// //           duration: 3,
// //           repeat: Infinity,
// //           ease: 'easeInOut',
// //         }}
// //         className="absolute top-1/4 left-10 hidden lg:block"
// //       >
// //         <div className="w-20 h-20 bg-primary-500/20 backdrop-blur-xl rounded-2xl transform rotate-12" />
// //       </motion.div>

// //       <motion.div
// //         animate={{
// //           y: [0, 20, 0],
// //         }}
// //         transition={{
// //           duration: 4,
// //           repeat: Infinity,
// //           ease: 'easeInOut',
// //         }}
// //         className="absolute bottom-1/4 right-10 hidden lg:block"
// //       >
// //         <div className="w-16 h-16 bg-accent-light/20 backdrop-blur-xl rounded-full" />
// //       </motion.div>
// //     </section>
// //   );
// // };

// // export default Hero;