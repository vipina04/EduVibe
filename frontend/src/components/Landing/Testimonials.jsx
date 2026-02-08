// In Features.jsx
<section id="features" className="py-20"> ... </section>
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiChevronLeft, HiChevronRight, HiStar } from 'react-icons/hi';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Tuition Owner',
      image: '👨‍🏫',
      rating: 5,
      text: 'EduVibe has transformed how we manage our tuition center. The automated scheduling and payment tracking save us hours every week!',
    },
    {
      name: 'Priya Sharma',
      role: 'Teacher',
      image: '👩‍🏫',
      rating: 5,
      text: 'As a teacher, I love how easy it is to track student progress and communicate with parents. The platform is intuitive and powerful.',
    },
    {
      name: 'Amit Patel',
      role: 'Parent',
      image: '👨‍💼',
      rating: 5,
      text: "I can monitor my child's attendance and performance in real-time. The transparency and ease of use are exceptional!",
    },
    {
      name: 'Sneha Reddy',
      role: 'Student',
      image: '👩‍🎓',
      rating: 5,
      text: 'The online tests and instant feedback help me understand my weak areas. EduVibe makes learning engaging and effective!',
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-primary-50 to-accent-light/10 dark:from-gray-900 dark:to-gray-800" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Trusted by Hundreds of Educators</h2>
          <p className="section-subtitle">
            See what our users have to say about their experience with EduVibe.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-12 text-center"
            >
              <div className="text-6xl mb-6">{testimonials[currentIndex].image}</div>

              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <HiStar key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 italic mb-8 leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-primary-600 dark:text-primary-400 font-medium">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors duration-300"
            aria-label="Previous testimonial"
          >
            <HiChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors duration-300"
            aria-label="Next testimonial"
          >
            <HiChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary-600 dark:bg-primary-400 w-8'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;