import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../core/component/ThemeToggle';

const navigation = [
  { name: 'Dashboard', path: '/attendee/dashboard', icon: '▦' },
  { name: 'Explore Events', path: '/attendee/events', icon: '◈' },
  { name: 'My Registrations', path: '/attendee/registrations', icon: '▤' },
  { name: 'My Profile', path: '/attendee/profile', icon: '◉' },
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export default function AttendeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const pageTitles = {
    '/attendee/dashboard': 'Attendee Dashboard',
    '/attendee/events': 'Explore Events',
    '/attendee/registrations': 'My Registrations',
    '/attendee/profile': 'My Profile',
  };

  const currentPath = location.pathname;
  let pageTitle = pageTitles[currentPath] || 'Attendee Portal';
  if (currentPath.startsWith('/attendee/events/')) {
    pageTitle = 'Event Details';
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 transition-colors duration-300 glass-mesh dark:bg-slate-950 dark:text-slate-100">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-slate-200/50 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950/80 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-[82px] items-center gap-3 border-b border-white/10 px-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#C6A15B] to-[#e4c483] text-xl font-bold text-slate-950 shadow-md shadow-[#C6A15B]/30">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">
              Event<span className="text-[#C6A15B]">Sphere</span>
            </h1>
            <p className="text-[10px] font-bold tracking-[2px] text-[#C6A15B]">
              ATTENDEE PORTAL
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-4 text-[10px] font-bold tracking-[2px] text-slate-400">
            MAIN NAVIGATION
          </p>

          <div className="space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? 'border border-indigo-400/30 bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/30 backdrop-blur-md'
                      : 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="w-5 text-center text-lg text-[#C6A15B]">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Attendee profile & logout */}
        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/40">
              {(user.name || user.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user.name || 'Attendee'}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user.email || 'Attendee Account'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-white/15 px-4 py-2.5 text-left text-sm font-semibold text-[#E5C98F] transition-all duration-300 hover:border-[#E5C98F]/40 hover:bg-white/10 active:scale-95"
          >
            ↪ &nbsp; Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[270px]">

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-slate-200/60 bg-white/70 px-5 shadow-sm shadow-slate-200/50 backdrop-blur-lg transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-xl text-slate-800 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                {pageTitle}
              </h2>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Welcome to your EventSphere attendee experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle showLabel={false} />

            <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/60 px-3.5 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-800/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Attendee
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-7 lg:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
