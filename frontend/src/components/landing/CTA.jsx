import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-slate-600 to-slate-10000">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Tuition Management?
          </h2> */}
          {/* <p className="text-xl text-blue-100 mb-10">
            Join thousands of educators already using EduVibe to simplify their workflow
          </p> */}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button> */}
          </div>

          {/* <p className="mt-6 text-sm text-blue-100">
            No credit card required • 14-day free trial • Cancel anytime
          </p> */}
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;



























// import { motion } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';
// import { Link } from 'react-router-dom';
// import { HiArrowRight, HiPlay } from 'react-icons/hi';

// const CTA = () => {
//   const [ref, inView] = useInView({
//     triggerOnce: true,
//     threshold: 0.1,
//   });

//   return (
//     <section className="py-20 relative overflow-hidden" ref={ref}>
//       <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-light" />
      
//       <motion.div
//         animate={{
//           scale: [1, 1.2, 1],
//           rotate: [0, 90, 0],
//         }}
//         transition={{
//           duration: 20,
//           repeat: Infinity,
//           ease: 'linear',
//         }}
//         className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
//       />
//       <motion.div
//         animate={{
//           scale: [1, 1.3, 1],
//           rotate: [0, -90, 0],
//         }}
//         transition={{
//           duration: 15,
//           repeat: Infinity,
//           ease: 'linear',
//         }}
//         className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
//       />

//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={inView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.6 }}
//           className="glass-card p-12 md:p-16 text-center backdrop-blur-xl bg-white/10 border-white/20"
//         >
//           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
//             Ready to Simplify Your
//             <br />
//             Tuition Management?
//           </h2>

//           <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
//             Join thousands of educators who trust EduVibe to streamline their operations
//             and enhance learning outcomes.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//             <Link
//               to="/register"
//               className="group flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl"
//             >
//               <HiPlay className="w-5 h-5 mr-2" />
//               Get Started Now
//               <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
//             </Link>
//             <Link
//               to="/login"
//               className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-primary-600 transform hover:scale-105 transition-all duration-300"
//             >
//               Sign In
//             </Link>
//           </div>

//           <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
//             <div className="flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
//               </svg>
//               <span className="text-sm font-medium">10,000+ Users</span>
//             </div>
//             <div className="flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//               </svg>
//               <span className="text-sm font-medium">4.9/5 Rating</span>
//             </div>
//             <div className="flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//               <span className="text-sm font-medium">100% Secure</span>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default CTA;