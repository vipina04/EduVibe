import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

export const CTA = () => {
  const navigate = useNavigate();
  const [ref, inView] = useInView();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      ref={ref}
      style={{
        padding: '120px 24px',
        background: isDark ? '#08080f' : '#eef2ff',
        fontFamily: "'Sora', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        @keyframes floatOrb2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px,-20px); }
        }
        .cta-btn-main {
          padding: 18px 52px;
          border: none;
          border-radius: 50px;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.3px;
        }
        .cta-btn-main:hover {
          transform: translateY(-3px) scale(1.03);
        }
        .cta-btn-outline {
          padding: 18px 52px;
          background: transparent;
          border-radius: 50px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Sora', sans-serif;
        }
      `}</style>

      {/* Orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 400, height: 400, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(108,99,255,0.10) 0%, transparent 70%)',
        animation: 'floatOrb2 8s ease infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: 300, height: 300, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(79,172,254,0.14) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(79,172,254,0.10) 0%, transparent 70%)',
        animation: 'floatOrb2 12s ease infinite reverse', pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 780, margin: '0 auto', textAlign: 'center',
        position: 'relative', zIndex: 1,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(50px)',
        transition: 'all 0.9s cubic-bezier(0.23,1,0.32,1)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 20px',
          background: 'rgba(108,99,255,0.12)',
          border: '1px solid rgba(108,99,255,0.30)',
          borderRadius: 50, fontSize: 12, color: '#a78bfa',
          fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
          marginBottom: 28,
        }}>
          Join EduVibe today
        </div>

        <h2 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800,
          color: isDark ? 'white' : '#1a1a2e',
          lineHeight: 1.08, letterSpacing: '-2px',
          margin: '0 0 24px',
        }}>
          Ready to make your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6C63FF, #4FACFE, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            tuition smarter?
          </span>
        </h2>

        <p style={{
          fontSize: 18,
          color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.55)',
          lineHeight: 1.7, margin: '0 auto 48px', maxWidth: 520,
        }}>
          Register today. Admin approval is quick. Students and teachers get their own dashboard from day one.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Same gradient as hero Get Started */}
          <button
            className="cta-btn-main"
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #581c87, #4f46e5, #0d9488)',
              color: 'white',
              boxShadow: '0 8px 30px rgba(79,70,229,0.35)',
            }}
          >
            Create Account →
          </button>
          <button
            className="cta-btn-outline"
            onClick={() => navigate('/login')}
            style={{
              border: isDark ? '1px solid rgba(255,255,255,0.20)' : '1px solid rgba(0,0,0,0.15)',
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.65)',
            }}
          >
            I already have an account
          </button>
        </div>

        {/* Trust row */}
        <div style={{
          display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap',
          marginTop: 56, fontSize: 13, fontWeight: 500,
          color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.40)',
        }}>
          {['✓ No credit card needed', '✓ Free to join', '✓ Admin approved security'].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;







