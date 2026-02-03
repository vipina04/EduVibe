import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiUserGroup, HiAcademicCap, HiCalendar, HiChartBar } from 'react-icons/hi';

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <HiUserGroup className="w-8 h-8" />,
      title: 'Student Management',
      description: 'Organize student profiles, track attendance, and monitor performance with powerful analytics.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <HiAcademicCap className="w-8 h-8" />,
      title: 'Teacher Management',
      description: 'Assign classes, track performance, manage payroll, and streamline teacher workflows.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <HiCalendar className="w-8 h-8" />,
      title: 'Class Scheduling',
      description: 'Automated timetable generation, smart reminders, and instant notifications for everyone.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <HiChartBar className="w-8 h-8" />,
      title: 'Payment & Reports',
      description: 'Track payments, generate invoices, and gain insights with comprehensive analytics.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Why Choose EduVibe?</h2>
          <p className="section-subtitle">
            Powerful features designed to simplify education management and enhance learning outcomes.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="glass-card p-8 h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 transform group-hover:rotate-6 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: '10,000+', label: 'Students Enrolled' },
            { number: '500+', label: 'Expert Teachers' },
            { number: '100+', label: 'Courses Offered' },
            { number: '98%', label: 'Satisfaction Rate' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-light bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;