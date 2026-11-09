
import { createContext, useContext, useState, useEffect } from 'react';

/* ================= THEME ================= */

export const buildTheme = (dark) => ({
  dark,
  bg: dark ? '#020617' : '#F8FAFC',
  surface: dark ? 'rgba(15, 23, 42, 0.70)' : 'rgba(255, 255, 255, 0.75)',
  sidebarBg: dark ? 'rgba(2, 6, 23, 0.85)' : 'rgba(255, 255, 255, 0.85)',
  border: dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.75)',
  text: dark ? '#F8FAFC' : '#0F172A',
  muted: dark ? '#94A3B8' : '#64748B',
  soft: dark ? '#CBD5E1' : '#475569',
  inputBg: dark ? 'rgba(15, 23, 42, 0.60)' : 'rgba(255, 255, 255, 0.70)',
  thBg: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(241, 245, 249, 0.60)',
});

export const ThemeContext = createContext(buildTheme(false));
export const useTheme = () => useContext(ThemeContext);

/* ================= RESPONSIVE ================= */

export const useIsMobile = (breakpoint = 900) => {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return mobile;
};

/* ================= ICONS ================= */

export const Icon = ({ d, size = 18, strokeWidth = 1.75, style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {Array.isArray(d)
      ? d.map((p, i) => <path key={i} d={p} />)
      : <path d={d} />}
  </svg>
);

export const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  building: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
  ticket: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M9 9h.01 M15 9h.01 M9 15h.01 M15 15h.01',
  floorPlan: 'M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z M14 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6z M4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z M14 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z',
  file: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  sun: 'M12 3v2 M12 19v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M3 12h2 M19 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  menu: 'M3 12h18 M3 6h18 M3 18h18',
  x: 'M18 6L6 18 M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  plus: 'M12 5v14 M5 12h14',
  alert: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01',
  arrow: 'M5 12h14 M12 5l7 7-7 7',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  trash: 'M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  mapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
};

/* ================= STATUS BADGE ================= */

const STATUS = {
  pending: {
    label: 'Pending',
    light: ['#FFF4DF', '#B7791F'],
    dark: ['rgba(245,158,11,0.16)', '#fbbf24'],
  },
  approved: {
    label: 'Approved',
    light: ['#E5F5EC', '#218653'],
    dark: ['rgba(16,185,129,0.16)', '#34d399'],
  },
  rejected: {
    label: 'Rejected',
    light: ['#FCEAEA', '#C44747'],
    dark: ['rgba(239,68,68,0.16)', '#f87171'],
  },
  available: {
    label: 'Available',
    light: ['#E5F5EC', '#218653'],
    dark: ['rgba(16,185,129,0.16)', '#34d399'],
  },
  reserved: {
    label: 'Reserved',
    light: ['#FFF4DF', '#B7791F'],
    dark: ['rgba(245,158,11,0.16)', '#fbbf24'],
  },
  booked: {
    label: 'Booked',
    light: ['#FCEAEA', '#C44747'],
    dark: ['rgba(239,68,68,0.16)', '#f87171'],
  },
  Upcoming: {
    label: 'Upcoming',
    light: ['#EAF0FA', '#315FA8'],
    dark: ['rgba(49,95,168,0.2)', '#A9C5F0'],
  },
  Live: {
    label: 'Live',
    light: ['#E5F5EC', '#218653'],
    dark: ['rgba(16,185,129,0.16)', '#34d399'],
  },
  Completed: {
    label: 'Completed',
    light: ['#F1F3F7', '#475569'],
    dark: ['rgba(255,255,255,0.08)', '#94a3b8'],
  },
};

export const StatusBadge = ({ status, label }) => {
  const { dark } = useTheme();
  const s = STATUS[status] || {
    label: status,
    light: ['#F1F3F7', '#475569'],
    dark: ['rgba(255,255,255,0.08)', '#94a3b8'],
  };

  const [bg, color] = dark ? s.dark : s.light;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 99,
      background: bg,
      color,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
      }} />
      {label || s.label}
    </span>
  );
};

/* ================= BASIC COMPONENTS ================= */

export const Spinner = ({ size = 14 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    animation: 'spin 0.7s linear infinite',
  }} />
);

export const Button = ({
  children,
  variant = 'primary',
  disabled,
  loading,
  onClick,
  type = 'button',
  style = {},
  ...rest
}) => {
  const { border, soft } = useTheme();
  const blocked = disabled || loading;

  const variants = {
    primary: {
      background: 'linear-gradient(135deg,#315FA8,#244A8F)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 4px 14px rgba(36,74,143,0.3)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.06)',
      color: soft,
      border: `1.5px solid ${border}`,
      backdropFilter: 'blur(8px)',
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      color: '#EF4444',
      border: '1px solid rgba(239,68,68,0.3)',
      backdropFilter: 'blur(8px)',
    },
    success: {
      background: 'linear-gradient(135deg,#10B981,#059669)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
    },
  };

  return (
    <button
      type={type}
      disabled={blocked}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 18px',
        borderRadius: 12,
        fontSize: 13.5,
        fontWeight: 700,
        cursor: blocked ? 'not-allowed' : 'pointer',
        opacity: blocked ? 0.55 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        ...variants[variant],
        ...style,
      }}
      className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

export const Card = ({ children, style = {}, className = '', ...rest }) => {
  const { dark, surface, border } = useTheme();

  return (
    <div
      className={`rounded-2xl border border-slate-200/70 bg-white/70 shadow-lg shadow-slate-200/50 backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none ${className}`}
      style={{
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export const Alert = ({ type = 'error', children, onClose }) => {
  const { dark } = useTheme();

  const palette = {
    error: {
      color: '#C44747',
      bg: dark ? 'rgba(239,68,68,0.1)' : '#FFF0F0',
      bd: 'rgba(239,68,68,0.25)',
    },
    success: {
      color: '#218653',
      bg: dark ? 'rgba(16,185,129,0.1)' : '#EAF7EF',
      bd: 'rgba(16,185,129,0.3)',
    },
    warning: {
      color: '#B7791F',
      bg: dark ? 'rgba(245,158,11,0.1)' : '#FFF4DF',
      bd: 'rgba(198,161,91,0.3)',
    },
  }[type];

  return (
    <div style={{
      padding: '12px 18px',
      borderRadius: 12,
      marginBottom: 20,
      background: palette.bg,
      border: `1px solid ${palette.bd}`,
      color: palette.color,
      fontSize: 13.5,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <Icon d={type === 'success' ? ICONS.check : ICONS.alert} size={16} />
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: palette.color,
            display: 'flex',
          }}
        >
          <Icon d={ICONS.x} size={14} />
        </button>
      )}
    </div>
  );
};

export const inputStyle = (t) => ({
  width: '100%',
  padding: '11px 15px',
  borderRadius: 12,
  fontSize: 14,
  border: `1.5px solid ${t.border}`,
  background: t.inputBg,
  color: t.text,
  outline: 'none',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
});

export const Field = ({ label, hint, children }) => {
  const { soft, muted } = useTheme();

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 700,
        color: soft,
        marginBottom: 6,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ margin: '5px 0 0', fontSize: 11.5, color: muted }}>
          {hint}
        </p>
      )}
    </div>
  );
};

export const Modal = ({ show, onClose, title, children, maxWidth = 520 }) => {
  const t = useTheme();
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(2, 6, 23, 0.65)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 24,
          background: t.dark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.90)',
          border: `1px solid ${t.border}`,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(16px)',
          animation: 'slideUp 0.22s ease',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: `1px solid ${t.border}`,
          background: t.thBg,
        }}>
          <h3 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: t.text,
          }}>
            {title}
          </h3>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: t.muted,
              display: 'flex',
            }}
          >
            <Icon d={ICONS.x} size={18} />
          </button>
        </div>

        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
};

export const EmptyState = ({
  icon = ICONS.file,
  title,
  text,
  action,
}) => {
  const t = useTheme();

  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 72,
        height: 72,
        borderRadius: 22,
        background: t.dark ? 'rgba(198,161,91,0.15)' : '#FBF5E9',
        marginBottom: 16,
        color: '#C6A15B',
      }}>
        <Icon d={icon} size={32} strokeWidth={1.4} />
      </div>

      <h3 style={{
        margin: '0 0 6px',
        fontSize: 18,
        fontWeight: 800,
        color: t.text,
      }}>
        {title}
      </h3>

      <p style={{
        margin: '0 0 20px',
        fontSize: 14,
        color: t.muted,
      }}>
        {text}
      </p>

      {action}
    </div>
  );
};

export const PageLoader = () => {
  const t = useTheme();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '60px 0',
      color: '#315FA8',
    }}>
      <Spinner size={26} />
      <span style={{
        marginLeft: 12,
        color: t.muted,
        fontSize: 14,
      }}>
        Loading…
      </span>
    </div>
  );
};
