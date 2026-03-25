import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';

const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // Dark: deep blue-purple | Light: soft blue-white gradient
        background: isDark
          ? 'linear-gradient(135deg, #040405 0%, #020008 40%, #0d2040 100%)'
          : 'linear-gradient(135deg, #e8f4fd 0%, #dbeafe 40%, #ede9fe 100%)',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        top: '15%', left: '10%',
        width: 400, height: 400,
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(108,99,255,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%', right: '10%',
        width: 300, height: 300,
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(79,172,254,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(79,172,254,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 900,
        margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
          >
            <img
              src="/images/logo.png"
              alt="EduVibe Logo"
              style={{
                height: 500,
                width: 'auto',
                filter: 'drop-shadow(0 8px 32px rgba(108,99,255,0.3))',
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 'clamp(22px, 5vw, 42px)',
              fontWeight: 800,
              margin: '0 0 16px',
              letterSpacing: '-0.5px',
              // gradient text — works on both dark and light
              background: 'linear-gradient(135deg, #4b13b5, #3e35f2, #1fd9b7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            EDUCATE • ELEVATE • EXCEL
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.60)',
              marginBottom: 36,
              lineHeight: 1.6,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Guiding every student towards confidence, clarity and success.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 40px',
                background: 'linear-gradient(135deg, #581c87, #4f46e5, #0d9488)',
                color: 'white',
                border: 'none',
                borderRadius: 50,
                fontSize: 17,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.25s',
                boxShadow: '0 8px 30px rgba(79,70,229,0.35)',
                fontFamily: "'Sora', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 14px 40px rgba(79,70,229,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.35)';
              }}
            >
              Get Started
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <a
          href="#features"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
        >
          <svg
            width="24" height="24"
            fill="none" stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;


