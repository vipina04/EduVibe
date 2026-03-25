import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const steps = [
  {
    num: '01',
    title: 'Register your account',
    desc: 'Students or teachers register in minutes. Fill your details, verify your email with OTP, and wait for admin approval.',
    icon: '✍️',
    detail: 'OTP email verification • Role-based forms • Class & subject selection',
    color: '#6C63FF',
  },
  {
    num: '02',
    title: 'Get approved & log in',
    desc: 'Admin reviews and approves your account. You receive a unique ID and approval email — then log in instantly.',
    icon: '🎟️',
    detail: 'Unique ID generated • Approval email sent • Login with email or ID',
    color: '#4FACFE',
  },
  {
    num: '03',
    title: 'Start learning or teaching',
    desc: 'Access your personalized dashboard. Attempt tests, view attendance, ask doubts, pay fees, and track your progress.',
    icon: '🚀',
    detail: 'Tests • Attendance • Doubts • Assignments • Fee receipts',
    color: '#a78bfa',
  },
];

const HowItWorks = () => {
  const [ref, inView] = useInView();
  const [active, setActive] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActive(a => (a + 1) % 3), 3000);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section
      id="how-it-works"
      ref={ref}
      style={{
        padding: '120px 24px',
        background: isDark
          ? 'linear-gradient(180deg, #08080f 0%, #0d0d1f 100%)'
          : 'linear-gradient(180deg, #eef2ff 0%, #e8f4fd 100%)',
        fontFamily: "'Sora', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');

        .step-item {
          padding: 32px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .step-item::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--step-color);
          opacity: 0;
          transition: opacity 0.4s;
          border-radius: 3px 0 0 3px;
        }
        .step-item.active::after { opacity: 1; }

        .progress-bar {
          height: 2px;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 16px;
        }
        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 3s linear;
        }

        @media (max-width: 900px) {
          .hiw-layout { flex-direction: column !important; }
          .hiw-visual { display: none !important; }
        }
      `}</style>

      {/* Glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 300,
        background: isDark
          ? 'radial-gradient(ellipse, rgba(79,172,254,0.06) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(79,172,254,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px',
            background: 'rgba(79,172,254,0.10)',
            border: '1px solid rgba(79,172,254,0.25)',
            borderRadius: 50, fontSize: 12, color: '#4FACFE',
            fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
            marginBottom: 24,
            opacity: inView ? 1 : 0,
            transition: 'all 0.7s ease',
          }}>
            How it works
          </div>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 800,
            color: isDark ? 'white' : '#1a1a2e',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            margin: '0 0 20px',
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(30px)',
            transition: 'all 0.7s ease 0.1s',
          }}>
            Up and running in{' '}
            <span style={{
              background: 'linear-gradient(135deg,#4FACFE,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              3 steps
            </span>
          </h2>
        </div>

        {/* Layout */}
        <div className="hiw-layout" style={{ display: 'flex', gap: 64, alignItems: 'center' }}>

          {/* Steps list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map((step, i) => (
              <div
                key={i}
                className={`step-item${active === i ? ' active' : ''}`}
                onClick={() => setActive(i)}
                style={{
                  '--step-color': step.color,
                  background: active === i
                    ? isDark ? `${step.color}10` : `${step.color}08`
                    : isDark ? 'transparent' : 'rgba(255,255,255,0.6)',
                  border: active === i
                    ? `1px solid ${step.color}40`
                    : isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateX(-40px)',
                  transition: `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s, border-color 0.4s, background 0.4s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 800, color: step.color,
                    opacity: 0.7, minWidth: 28, paddingTop: 2, letterSpacing: 1,
                  }}>
                    {step.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{step.icon}</span>
                      <h3 style={{
                        fontSize: 18, fontWeight: 700,
                        color: isDark ? 'white' : '#1a1a2e',
                        margin: 0, letterSpacing: '-0.3px',
                      }}>
                        {step.title}
                      </h3>
                    </div>
                    <p style={{
                      fontSize: 14,
                      color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.55)',
                      lineHeight: 1.65, margin: 0,
                    }}>
                      {step.desc}
                    </p>
                    {active === i && (
                      <div style={{
                        marginTop: 12, padding: '8px 14px',
                        background: `${step.color}18`,
                        border: `1px solid ${step.color}30`,
                        borderRadius: 10, fontSize: 12,
                        color: step.color, fontWeight: 500,
                      }}>
                        {step.detail}
                      </div>
                    )}
                    {active === i && (
                      <div className="progress-bar" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}>
                        <div className="progress-fill" style={{ width: '100%', background: step.color }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual panel */}
          <div
            className="hiw-visual"
            style={{
              flex: 1, maxWidth: 440,
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.80)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark ? 'none' : '0 8px 40px rgba(0,0,0,0.08)',
              borderRadius: 28,
              padding: 40,
              position: 'relative',
              overflow: 'hidden',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateX(40px)',
              transition: 'all 0.7s ease 0.3s',
              minHeight: 340,
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle at 70% 30%, ${steps[active].color}15, transparent 70%)`,
              transition: 'background 0.6s',
            }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 80, marginBottom: 24 }}>{steps[active].icon}</div>
              <div style={{
                fontSize: 64, fontWeight: 800, color: steps[active].color,
                opacity: 0.2, position: 'absolute', top: 0, right: 20,
              }}>
                {steps[active].num}
              </div>
              <h3 style={{
                fontSize: 24, fontWeight: 700,
                color: isDark ? 'white' : '#1a1a2e',
                margin: '0 0 16px', letterSpacing: '-0.5px',
              }}>
                {steps[active].title}
              </h3>
              <p style={{
                fontSize: 15,
                color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
                lineHeight: 1.7,
              }}>
                {steps[active].desc}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {steps.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActive(i)}
                    style={{
                      width: active === i ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: active === i ? steps[i].color : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;






