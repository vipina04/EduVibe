import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const [showTop, setShowTop] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <footer style={{
      background: isDark ? '#05050e' : '#1a1a2e',
      borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.10)',
      padding: '72px 24px 40px',
      fontFamily: "'Sora', sans-serif",
      transition: 'background 0.5s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        .footer-link {
          color: rgba(255,255,255,0.40);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        .footer-link:hover { color: rgba(255,255,255,0.90); }
        .back-top {
          position: fixed; bottom: 28px; right: 28px;
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #581c87, #4f46e5, #0d9488);
          border: none; border-radius: 50%;
          color: white; font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
          z-index: 999;
          box-shadow: 0 4px 20px rgba(79,70,229,0.35);
        }
        .back-top:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(79,70,229,0.5);
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top row */}
        <div
          className="footer-grid"
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 60 }}
        >
          {/* Brand */}
          <div>
            {/* Logo + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src="/images/nav-logo.png" alt="EduVibe" style={{ height: 36, width: 'auto' }} />
              <span style={{
                fontSize: 24, fontWeight: 800,
                background: 'linear-gradient(135deg, #541ee7, #2bbcdd)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}>
                EduVibe
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, maxWidth: 280 }}>
              A smart platform built for offline tuition centers — bringing digital tools to real classrooms.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              {['📧', '📞', '📍'].map((icon, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, cursor: 'default',
                }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.70)', marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' }}>
              Platform
            </h4>
            {[
              { label: 'Login', to: '/login' },
              { label: 'Register', to: '/register' },
              { label: 'Features', to: '/#features' },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 12 }}>
                <Link to={l.to} className="footer-link">{l.label}</Link>
              </div>
            ))}
          </div>

          {/* Modules */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.70)', marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' }}>
              Modules
            </h4>
            {['Student Portal', 'Teacher Portal', 'Admin Control', 'Fee Management'].map(l => (
              <div key={l} style={{ marginBottom: 12 }}>
                <span className="footer-link" style={{ cursor: 'default' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.70)', marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' }}>
              Contact
            </h4>
            <div style={{ marginBottom: 12 }}>
              <a href="mailto:support@eduvibe.com" className="footer-link">support@eduvibe.com</a>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span className="footer-link" style={{ cursor: 'default' }}>Kerala, India</span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 28,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} EduVibe. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service'].map(t => (
              <Link key={t} to="#" className="footer-link" style={{ fontSize: 13 }}>{t}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          className="back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </footer>
  );
};

export default Footer;




