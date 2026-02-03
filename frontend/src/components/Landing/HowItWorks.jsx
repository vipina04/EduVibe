import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiUserAdd, HiCog, HiLightningBolt } from 'react-icons/hi';

const HowItWorks = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const steps = [
    {
      icon: <HiUserAdd className="w-12 h-12" />,
      title: 'Sign Up',
      description: 'Create your EduVibe account in minutes. Quick and easy registration process.',
      step: '01',
    },
    {
      icon: <HiCog className="w-12 h-12" />,
      title: 'Setup Classes',
      description: 'Add students, teachers, and schedules. Customize everything to fit your needs.',
      step: '02',
    },
    {
      icon: <HiLightningBolt className="w-12 h-12" />,
      title: 'Start Teaching',
      description: 'Manage tuition efficiently and monitor progress with real-time analytics.',
      step: '03',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Get Started in 3 Simple Steps</h2>
          <p className="section-subtitle">
            Join thousands of educators who have simplified their tuition management with EduVibe.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600 dark:from-primary-800 dark:via-primary-600 dark:to-primary-400 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="glass-card p-8 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.step}
                  </div>

                  <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-600 dark:text-primary-400 mb-6 mt-8">
                    {step.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;