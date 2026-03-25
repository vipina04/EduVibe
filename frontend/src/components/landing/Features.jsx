import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// ── Intersection Observer hook ─────────────────────────────
const useInView = (threshold = 0.10) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ── Animated number counter ────────────────────────────────
const Counter = ({ target, suffix = '', isDark }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return (
    <span ref={ref} style={{
      fontSize: 36, fontWeight: 800,
      background: 'linear-gradient(135deg, #6C63FF, #4FACFE)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>
      {count}{suffix}
    </span>
  );
};

// ── Feature card with its own observer ────────────────────
const FeatureCard = ({ feat, i, isDark }) => {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 24,
        padding: '36px 32px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        background: hovered
          ? isDark ? `${feat.accent}10` : `${feat.accent}08`
          : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.90)',
        border: hovered
          ? `1px solid ${feat.accent}60`
          : isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: hovered
          ? `0 30px 60px ${feat.accent}25`
          : isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.06)',
        opacity: inView ? 1 : 0,
        transform: inView
          ? hovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0)'
          : 'translateY(60px)',
        transition: inView
          ? 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease, opacity 0.01s'
          : `opacity 0.7s ease ${i * 0.10}s, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.10}s`,
      }}
    >
      {/* Glow spot on hover */}
      <div style={{
        position: 'absolute',
        top: -40, right: -40,
        width: 140, height: 140,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${feat.accent}35, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        fontSize: 44,
        marginBottom: 20,
        display: 'inline-block',
        transform: hovered ? 'scale(1.2) rotate(-8deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        filter: hovered ? `drop-shadow(0 4px 12px ${feat.accent}70)` : 'none',
      }}>
        {feat.icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 21,
        fontWeight: 700,
        color: hovered ? feat.accent : isDark ? 'white' : '#1a1a2e',
        margin: '0 0 12px',
        letterSpacing: '-0.4px',
        transition: 'color 0.3s ease',
      }}>
        {feat.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 15,
        color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.58)',
        lineHeight: 1.75,
        margin: '0 0 24px',
      }}>
        {feat.desc}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {feat.tags.map((tag, j) => (
          <span key={j} style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: 50,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            background: `${feat.accent}18`,
            color: feat.accent,
            border: `1px solid ${feat.accent}40`,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom accent line on hover */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${feat.accent}, transparent)`,
        borderRadius: '0 0 24px 24px',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />
    </div>
  );
};

// ── Feature data ───────────────────────────────────────────
const features = [
  {
    icon: '🧪',
    title: 'Smart Tests',
    desc: 'MCQ & descriptive tests with auto-evaluation, chapter-wise or full-syllabus — teachers create, students attempt, system scores instantly.',
    accent: '#6C63FF',
    tags: ['Auto-graded', 'MCQ & Descriptive'],
  },
  {
    icon: '📅',
    title: 'Attendance Tracking',
    desc: 'Mark daily attendance with class time. Students view their own records. Admins and teachers see working hours with date-range filters.',
    accent: '#4FACFE',
    tags: ['Time-stamped', 'Subject-wise'],
  },
  {
    icon: '💰',
    title: 'Fee Management',
    desc: 'Admin records payments, generates printable receipts. Students download their fee history anytime — zero follow-ups needed.',
    accent: '#22c55e',
    tags: ['Instant Receipts', 'Payment History'],
  },
  {
    icon: '❓',
    title: 'Doubt Forum',
    desc: 'Students post doubts with text or photos. The assigned teacher replies. Classmates can also answer — real peer learning.',
    accent: '#f59e0b',
    tags: ['Photo Upload', 'Teacher Reply'],
  },
  {
    icon: '📝',
    title: 'Assignments',
    desc: 'Teachers assign work with PDF uploads or typed questions. Students submit responses digitally — all in one organized space.',
    accent: '#ec4899',
    tags: ['PDF Support', 'Digital Submit'],
  },
  {
    icon: '🔔',
    title: 'Notifications',
    desc: 'Admin sends targeted messages to individual users, all students, or all teachers. Important updates reach everyone instantly.',
    accent: '#a78bfa',
    tags: ['Targeted', 'Broadcast'],
  },
];

// ── Stats row ──────────────────────────────────────────────
const stats = [
  { target: 3,   suffix: '',   label: 'User Roles',    icon: '👥' },
  { target: 6,   suffix: '+',  label: 'Core Features', icon: '⚡' },
  { target: 100, suffix: '%',  label: 'Auto Graded',   icon: '🎯' },
  { target: 24,  suffix: '/7', label: 'Available',     icon: '🌐' },
];

// ── Main component ─────────────────────────────────────────
const Features = () => {
  const [headerRef, headerInView] = useInView();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="features"
      style={{
        padding: '120px 24px',
        background: isDark ? '#08080f' : '#f5f7ff',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Sora', sans-serif",
        transition: 'background 0.5s ease',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');

        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33%       { transform: translateY(-24px) translateX(12px); }
          66%       { transform: translateY(12px) translateX(-12px); }
        }

        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid    { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Floating background orbs ── */}
      <div style={{
        position: 'absolute', top: '5%', left: '3%',
        width: 500, height: 500, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)',
        animation: 'floatOrb 10s ease infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '3%',
        width: 400, height: 400, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(79,172,254,0.07) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)',
        animation: 'floatOrb 14s ease infinite reverse',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '45%', right: '12%',
        width: 260, height: 260, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
        animation: 'floatOrb 18s ease infinite',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>

        {/* ── Section header ── */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 72 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 20px',
            background: 'rgba(108,99,255,0.10)',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: 50, fontSize: 12, color: '#a78bfa',
            fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
            marginBottom: 28,
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.7s ease',
          }}>
            ✦ Everything in one place
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 62px)',
            fontWeight: 800,
            color: isDark ? 'white' : '#1a1a2e',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            margin: '0 0 20px',
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? 'translateY(0)' : 'translateY(32px)',
            transition: 'all 0.7s ease 0.12s',
          }}>
            Built for how tuition{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6C63FF, #4FACFE)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              actually works
            </span>
          </h2>

          {/* Subtext */}
          <p style={{
            fontSize: 18,
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)',
            maxWidth: 520, margin: '0 auto', lineHeight: 1.75,
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.22s',
          }}>
            Every feature built specifically for offline tuition centers that want to go smarter without going complicated.
          </p>
        </div>

        {/* ── Stats row ── */}
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            marginBottom: 80,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '28px 20px',
                borderRadius: 20,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.80)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.05)',
                opacity: headerInView ? 1 : 0,
                transform: headerInView ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.7s ease ${0.3 + i * 0.08}s`,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <Counter target={stat.target} suffix={stat.suffix} isDark={isDark} />
              <div style={{
                fontSize: 13, fontWeight: 500, marginTop: 6,
                color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.50)',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Feature cards grid ── */}
        <div
          className="features-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
        >
          {features.map((feat, i) => (
            <FeatureCard key={i} feat={feat} i={i} isDark={isDark} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;

