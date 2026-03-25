import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { HiSun, HiMoon } from 'react-icons/hi';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const isDark = theme === 'dark';

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      padding: '0 24px',
      height: 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.4s ease',
      background: scrolled
        ? isDark ? 'rgba(8,8,15,0.90)' : 'rgba(255,255,255,0.90)'
        : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled
        ? isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)'
        : '1px solid transparent',
      fontFamily: "'Sora', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          text-decoration: none;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          padding: 0;
        }
        .nav-login {
          padding: 9px 22px;
          border-radius: 50px;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'Sora', sans-serif;
        }
        .nav-cta {
          padding: 9px 22px;
          background: linear-gradient(135deg, #581c87, #4f46e5, #0d9488);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'Sora', sans-serif;
        }
        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(79,70,229,0.4);
          opacity: 0.92;
        }
        .theme-toggle-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s;
          font-size: 17px;
        }
        .hamburger { display: none; }
        .mobile-menu {
          display: none;
          position: fixed;
          top: 68px; left: 0; right: 0;
          backdrop-filter: blur(20px);
          padding: 24px;
          flex-direction: column;
          gap: 16px;
          z-index: 99;
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .hamburger {
            display: flex; align-items: center; justify-content: center;
            width: 38px; height: 38px; border-radius: 10px;
            cursor: pointer; font-size: 20px; border: none;
          }
          .mobile-menu.open { display: flex; }
        }
      `}</style>

      {/* ── LEFT: Logo image + EduVibe text ── */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        {/* Logo image — same as hero section */}
        <img
          src="/images/navlogos.png"
          alt="EduVibe Logo"
          style={{ height: 70, width: 'auto', objectFit: 'contain' }}
        />
        {/* EduVibe text */}
        <span style={{
          fontSize: 22,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #4109dc, #38c8f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>
          EduVibe
        </span>
      </div>

      {/* ── CENTER/RIGHT: Desktop nav ── */}
      <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32, marginLeft: 'auto' }}>
      {/* <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}> */}

      {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            color: isDark ? '#facc15' : '#4f46e5',
          }}
        >
          {isDark ? <HiSun /> : <HiMoon />}
        </button>

        
        <button
          className="nav-link"
          onClick={() => scrollTo('features')}
          style={{ color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.60)' }}
        >
          Features
        </button>
        <button
          className="nav-link"
          onClick={() => scrollTo('how-it-works')}
          style={{ color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.60)' }}
        >
          How It Works
        </button>

        

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="nav-login"
            onClick={() => navigate('/login')}
            style={{
              border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.15)',
              color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.70)',
            }}
          >
            Sign In
          </button>
          {/* Same gradient as Hero Get Started button */}
          <button className="nav-cta" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </div>

      {/* ── MOBILE: Theme toggle + Hamburger ── */}
      {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            color: isDark ? '#facc15' : '#4f46e5',
            display: 'flex',
          }}
        >
          {isDark ? <HiSun /> : <HiMoon />}
        </button>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            color: isDark ? 'white' : '#333',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div> */}

      {/* ── Mobile Menu ── */}
      <div
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        style={{
          background: isDark ? 'rgba(8,8,15,0.97)' : 'rgba(255,255,255,0.97)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <button
          className="nav-link"
          onClick={() => scrollTo('features')}
          style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.70)', textAlign: 'left' }}
        >
          Features
        </button>
        <button
          className="nav-link"
          onClick={() => scrollTo('how-it-works')}
          style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.70)', textAlign: 'left' }}
        >
          How It Works
        </button>
        <button
          className="nav-login"
          onClick={() => { setMenuOpen(false); navigate('/login'); }}
          style={{
            border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.15)',
            color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.70)',
            textAlign: 'center',
          }}
        >
          Sign In
        </button>
        <button
          className="nav-cta"
          onClick={() => { setMenuOpen(false); navigate('/register'); }}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;








