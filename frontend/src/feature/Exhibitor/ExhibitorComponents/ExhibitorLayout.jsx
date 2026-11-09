
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ThemeContext,
  buildTheme,
  useIsMobile,
  Icon,
  ICONS,
} from './ExhibitorUI';
import { useGlobalTheme } from '../../../core/context/ThemeContext';
import ThemeToggle from '../../../core/component/ThemeToggle';

/* ================= NAVIGATION ================= */

const NAV = [
  {
    label: 'MAIN MENU',
    items: [
      {
        label: 'Dashboard',
        path: '/exhibitor/dashboard',
        icon: 'dashboard',
      },
      {
        label: 'Company Profile',
        path: '/exhibitor/profile',
        icon: 'building',
      },
      {
        label: 'Browse Events',
        path: '/exhibitor/events',
        icon: 'ticket',
        match: ['/exhibitor/booth-selection'],
      },
      {
        label: 'My Applications',
        path: '/exhibitor/applications',
        icon: 'file',
      },
      {
        label: 'My Booths',
        path: '/exhibitor/my-booths',
        icon: 'floorPlan',
      },
      {
        label: 'Messages',
        path: '/exhibitor/messages',
        icon: 'message',
      },
    ],
  },
];

/* ================= LAYOUT ================= */

export default function ExhibitorLayout({
  children,
  title = 'Dashboard',
  subtitle = 'Welcome to your exhibitor workspace',
  actions,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(900);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { isDark } = useGlobalTheme();

  const t = buildTheme(isDark);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Unable to read user information:', error);
    }
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (item) => {
    const currentPath = location.pathname;

    if (currentPath === item.path) return true;

    if (item.match?.some((path) => currentPath === path)) {
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const displayName =
    user?.name ||
    user?.companyName ||
    user?.company ||
    'Exhibitor';

  const displayEmail = user?.email || 'Exhibitor Account';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  /* ================= SIDEBAR ================= */

  const Sidebar = () => (
    <aside
      style={{
        width: 270,
        minWidth: 270,
        height: '100%',
        background: t.dark ? 'rgba(2, 6, 23, 0.88)' : '#101F3C',
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        boxSizing: 'border-box',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* LOGO */}

      <div
        style={{
          padding: '27px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 43,
              height: 43,
              borderRadius: 13,
              background: 'linear-gradient(135deg,#315FA8,#244A8F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 5px 15px rgba(49,95,168,0.35)',
            }}
          >
            <Icon d={ICONS.building} size={23} />
          </div>

          <div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#FFFFFF',
              }}
            >
              Event<span style={{ color: '#C6A15B' }}>Sphere</span>
            </div>

            <div
              style={{
                fontSize: 10,
                color: '#AAB6C8',
                letterSpacing: '1.5px',
                marginTop: 3,
                fontWeight: 700,
              }}
            >
              EXHIBITOR PORTAL
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '25px 15px',
        }}
      >
        {NAV.map((section) => (
          <div key={section.label} style={{ marginBottom: 25 }}>
            <div
              style={{
                padding: '0 12px',
                marginBottom: 13,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '1.5px',
                color: '#8493AD',
              }}
            >
              {section.label}
            </div>

            {section.items.map((item) => {
              const active = isActive(item);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    padding: '13px 14px',
                    marginBottom: 5,
                    borderRadius: 11,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: active ? '#FFFFFF' : '#B6C2D5',
                    background: active
                      ? 'linear-gradient(135deg,#244A8F,#315FA8)'
                      : 'transparent',
                    boxShadow: active
                      ? '0 5px 15px rgba(0,0,0,0.15)'
                      : 'none',
                    fontSize: 13.5,
                    fontWeight: active ? 700 : 500,
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background =
                        'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#B6C2D5';
                    }
                  }}
                >
                  <Icon
                    d={ICONS[item.icon]}
                    size={18}
                    style={{
                      color: active ? '#FFFFFF' : '#AAB6C8',
                      flexShrink: 0,
                    }}
                  />

                  <span style={{ flex: 1 }}>{item.label}</span>

                  {active && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#C6A15B',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* USER PROFILE */}

      <div
        style={{
          padding: '17px 16px',
          borderTop: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginBottom: 16,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 39,
              height: 39,
              minWidth: 39,
              borderRadius: 12,
              background: 'rgba(198,161,91,0.18)',
              color: '#D9BC83',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {initials || 'EX'}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </div>

            <div
              style={{
                fontSize: 10.5,
                color: '#9EACC1',
                marginTop: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayEmail}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '11px 13px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            color: '#D5A3A3',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          <Icon d={ICONS.logout} size={17} />
          Logout
        </button>
      </div>
    </aside>
  );

  /* ================= MAIN CONTENT ================= */

  return (
    <ThemeContext.Provider value={t}>
      <div
        className="min-h-screen bg-slate-100/90 text-slate-800 transition-colors duration-300 glass-mesh dark:bg-slate-950 dark:text-slate-100"
        style={{
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* DESKTOP SIDEBAR */}

        {!isMobile && (
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 100,
            }}
          >
            <Sidebar />
          </div>
        )}

        {/* MOBILE DRAWER */}

        {isMobile && drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 200,
                background: 'rgba(2, 6, 23, 0.65)',
                backdropFilter: 'blur(8px)',
              }}
            />

            <div
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 201,
                boxShadow: '10px 0 35px rgba(0,0,0,0.3)',
              }}
            >
              <Sidebar />
            </div>
          </>
        )}

        {/* PAGE AREA */}

        <main
          style={{
            marginLeft: isMobile ? 0 : 270,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          {/* TOP HEADER */}

          <header
            className="sticky top-0 z-50 flex min-h-[82px] items-center justify-between border-b border-slate-200/60 bg-white/70 px-5 shadow-sm shadow-slate-200/50 backdrop-blur-lg transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none sm:px-8"
            style={{
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                minWidth: 0,
              }}
            >
              {isMobile && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-xl text-slate-800 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100"
                >
                  <Icon d={ICONS.menu} size={21} />
                </button>
              )}

              <div style={{ minWidth: 0 }}>
                <h1
                  className="m-0 font-extrabold tracking-tight text-slate-900 dark:text-white"
                  style={{
                    fontSize: isMobile ? 19 : 22,
                  }}
                >
                  {title}
                </h1>

                {subtitle && (
                  <p
                    className="mt-1 text-xs text-slate-500 dark:text-slate-400"
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexShrink: 0,
              }}
            >
              <ThemeToggle showLabel={false} />

              <div className="hidden items-center gap-2 rounded-xl border border-slate-200/60 bg-white/60 px-3.5 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-800/60 sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#C6A15B] shadow-sm shadow-[#C6A15B]/50" />
                <span className="text-xs font-semibold text-[#94702F] dark:text-[#E7C987]">
                  Exhibitor
                </span>
              </div>

              {actions && actions}
            </div>
          </header>

          {/* PAGE CONTENT */}

          <div
            style={{
              flex: 1,
              padding: isMobile ? '20px 15px' : '30px 32px',
              width: '100%',
              maxWidth: 1600,
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
