import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, glass, ...props }) => {
  // Handle glass prop correctly - convert to className instead of passing to DOM
  const glassClass = glass ? 'backdrop-blur-lg bg-white/30 dark:bg-gray-800/30' : '';
  
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={`card ${glassClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;














// import { motion } from 'framer-motion';

// const Card = ({ children, className = '', hover = false, ...props }) => {
//   return (
//     <motion.div
//       whileHover={hover ? { scale: 1.02, y: -5 } : {}}
//       className={`card ${className}`}
//       {...props}
//     >
//       {children}
//     </motion.div>
//   );
// };

// export default Card;