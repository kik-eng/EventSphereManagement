
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStatsApi,
  getAllUsersApi,
} from '../AdminServices/adminServices';

/* =========================
   ICON COMPONENT
========================= */
const Icon = ({ d, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  building: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
  ticket: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M9 9h.01 M15 9h.01 M9 15h.01 M15 15h.01',
  floorPlan: 'M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z M14 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6z M4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z M14 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z',
  search: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
};

/* =========================
   ROLE BADGE
========================= */
const ROLE_CFG = {
  admin: {
    label: 'Admin',
    bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20',
    dot: 'bg-indigo-600 dark:bg-indigo-400',
  },
  exhibitor: {
    label: 'Exhibitor',
    bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  attendee: {
    label: 'Attendee',
    bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
  },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] || {
    label: role || 'User',
    bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({ label, value, icon, colorClass, loading, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-5 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-14 h-14 min-w-[56px] rounded-2xl flex items-center justify-center text-xl shadow-sm ${colorClass}`}>
        <Icon d={icon} size={23} />
      </div>

      <div className="min-w-0">
        <p className="m-0 mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>

        {loading ? (
          <div className="h-7 w-16 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ) : (
          <h2 className="m-0 text-2xl font-extrabold text-slate-900 dark:text-white">
            {value ?? '—'}
          </h2>
        )}
      </div>
    </div>
  );
}

/* =========================
   SECTION HEADER
========================= */
function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <h2 className="m-0 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h2>

      {count !== null && count !== undefined && (
        <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 rounded-full px-2.5 py-0.5 text-xs font-bold">
          {count}
        </span>
      )}
    </div>
  );
}

/* =========================
   SKELETON ROW
========================= */
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-200/60 dark:border-white/5">
      {[40, 150, 180, 90, 110].map((width, index) => (
        <td key={index} className="px-4 py-4">
          <div
            style={{ width }}
            className="max-w-full h-3.5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"
          />
        </td>
      ))}
    </tr>
  );
}

/* =========================
   TABLE ROW
========================= */
function TableRow({ user, index, last }) {
  const avatarGradients = [
    'from-indigo-600 to-blue-500',
    'from-amber-500 to-amber-600',
    'from-emerald-500 to-teal-600',
    'from-purple-600 to-indigo-600',
  ];
  const gradient = avatarGradients[index % avatarGradients.length];

  return (
    <tr className={`transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${last ? '' : 'border-b border-slate-200/60 dark:border-white/5'}`}>
      <td className="px-4 py-3.5 text-xs font-medium text-slate-400">
        {index + 1}
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white text-xs font-extrabold shadow-sm`}>
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>

          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm whitespace-nowrap">
            {user.name || 'Unnamed User'}
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
        {user.email || '—'}
      </td>

      <td className="px-4 py-3.5">
        <RoleBadge role={user.role} />
      </td>

      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—'}
      </td>
    </tr>
  );
}

/* =========================
   MAIN ADMIN DASHBOARD
========================= */
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeView, setActiveView] = useState('dashboard');

  /* Load dashboard data */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [statsResponse, usersResponse] = await Promise.all([
          getAdminStatsApi(),
          getAllUsersApi(),
        ]);

        setStats(statsResponse.stats);
        setUsers(usersResponse.users || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* Switch between user views */
  const switchView = (view) => {
    setActiveView(view);
    setSearch('');

    if (view === 'exhibitors') {
      setRoleFilter('exhibitor');
    } else if (view === 'attendees') {
      setRoleFilter('attendee');
    } else {
      setRoleFilter('all');
    }
  };

  /* Search and role filtering */
  const filteredUsers = users.filter((user) => {
    const role = user.role || '';

    const matchRole =
      roleFilter === 'all' || role === roleFilter;

    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const searchText = search.toLowerCase();

    const matchSearch =
      name.includes(searchText) ||
      email.includes(searchText);

    return matchRole && matchSearch;
  });

  const viewTitle = {
    dashboard: 'All Users',
    users: 'All Users',
    exhibitors: 'Exhibitors',
    attendees: 'Attendees',
  }[activeView];

  const cardColors = {
    blue: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40',
    gold: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40',
    green: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40',
    softBlue: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/40',
  };

  return (
    <div className="w-full space-y-7">

      {/* Welcome section */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-amber-600 dark:text-amber-400">
            OVERVIEW
          </p>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, Admin!
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening in your EventSphere workspace.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-md">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-500/10 p-4 text-sm font-semibold text-rose-800 dark:text-rose-300 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Statistics */}
      {activeView === 'dashboard' && (
        <section className="space-y-4">
          <SectionHeader title="Platform Statistics" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={stats?.totalUsers}
              icon={ICONS.users}
              colorClass={cardColors.blue}
              loading={loading}
              onClick={() => switchView('users')}
            />

            <StatCard
              label="Total Exhibitors"
              value={stats?.totalExhibitors}
              icon={ICONS.building}
              colorClass={cardColors.gold}
              loading={loading}
              onClick={() => switchView('exhibitors')}
            />

            <StatCard
              label="Total Attendees"
              value={stats?.totalAttendees}
              icon={ICONS.ticket}
              colorClass={cardColors.green}
              loading={loading}
              onClick={() => switchView('attendees')}
            />

            <StatCard
              label="Floor Plan"
              value="Manage"
              icon={ICONS.floorPlan}
              colorClass={cardColors.softBlue}
              loading={false}
              onClick={() => navigate('/admin/floor-plan')}
            />
          </div>
        </section>
      )}

      {/* Users management */}
      <section className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
        {/* Section title and controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionHeader
              title={viewTitle}
              count={!loading ? filteredUsers.length : null}
            />

            <p className="-mt-3 text-xs text-slate-500 dark:text-slate-400">
              View and manage registered platform users.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'exhibitors', label: 'Exhibitors' },
              { id: 'attendees', label: 'Attendees' },
            ].map((btn) => (
              <button
                key={btn.id}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  activeView === btn.id
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    : 'border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => switchView(btn.id)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and filter */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <Icon d={ICONS.search} size={18} />
            </span>

            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>

          {(activeView === 'dashboard' || activeView === 'users') && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="exhibitor">Exhibitor</option>
              <option value="attendee">Attendee</option>
            </select>
          )}
        </div>

        {/* Users table */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-white/10 bg-slate-100/60 dark:bg-slate-800/50">
                {['#', 'Name', 'Email Address', 'Role', 'Joined'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-14 px-4 text-center"
                  >
                    <div className="flex justify-center mb-3 text-indigo-500 dark:text-indigo-400">
                      <Icon d={ICONS.search} size={36} />
                    </div>

                    <p className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                      No users found
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Try another search or change the role filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow
                    key={user._id || index}
                    user={user}
                    index={index}
                    last={index === filteredUsers.length - 1}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                {filteredUsers.length}
              </strong>{' '}
              of{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                {users.length}
              </strong>{' '}
              users
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Data loaded
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
