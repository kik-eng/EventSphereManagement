import { useEffect, useState, useCallback } from 'react';
import apiConfig from '../../../config/ApiConfig';

const API_ORIGIN = apiConfig.defaults.baseURL.replace(/\/api\/?$/, '');

const STATUS_CLASSES = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
};

export default function AdminApplications() {
  const [tab, setTab] = useState('apps');
  const [apps, setApps] = useState([]);
  const [booths, setBooths] = useState([]);
  const [appFilter, setAppFilter] = useState('pending');
  const [boothFilter, setBoothFilter] = useState('reserved');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (tab === 'apps') {
        const params = appFilter === 'all' ? {} : { status: appFilter };
        const res = await apiConfig.get('/admin/applications', { params });
        setApps(res.data.applications || []);
      } else {
        const res = await apiConfig.get('/admin/booth-requests', {
          params: { status: boothFilter },
        });
        setBooths(res.data.booths || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [tab, appFilter, boothFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const done = (msg) => {
    setSuccess(msg || 'Updated successfully.');
    load();
    setTimeout(() => setSuccess(''), 3000);
  };

  const reviewApp = async (id, status) => {
    const remarks = window.prompt(
      status === 'approved'
        ? 'Remarks for exhibitor (optional):'
        : 'Reason for rejection (shown to exhibitor):',
      ''
    );

    if (remarks === null) return;

    try {
      setBusyId(id);
      setError('');

      const res = await apiConfig.put(
        `/admin/applications/${id}/review`,
        { status, adminRemarks: remarks }
      );

      done(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application.');
    } finally {
      setBusyId('');
    }
  };

  const reviewBooth = async (id, action) => {
    const remarks = window.prompt(
      action === 'approve'
        ? 'Note for exhibitor (optional):'
        : 'Reason for rejection (sent to exhibitor):',
      ''
    );

    if (remarks === null) return;

    try {
      setBusyId(id);
      setError('');

      const res = await apiConfig.put(
        `/admin/booth-requests/${id}/review`,
        { action, remarks }
      );

      done(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review booth request.');
    } finally {
      setBusyId('');
    }
  };

  const currentFilter = tab === 'apps' ? appFilter : boothFilter;
  const setFilter = tab === 'apps' ? setAppFilter : setBoothFilter;
  const list = tab === 'apps' ? apps : booths;

  const filters =
    tab === 'apps'
      ? ['pending', 'approved', 'rejected', 'all']
      : ['reserved', 'booked', 'rejected', 'all'];

  const boothStatusKey = (status) =>
    ({ booked: 'approved', rejected: 'rejected' }[status] || 'pending');

  const boothStatusLabel = (status) =>
    ({ booked: 'Approved', rejected: 'Rejected' }[status] || 'Pending');

  return (
    <div className="w-full space-y-7">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-amber-600 dark:text-amber-400">
            ADMINISTRATION
          </p>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Application Management
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review exhibitor applications and manage booth requests.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-100 dark:hover:bg-slate-800 backdrop-blur-md"
        >
          ↻ Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Applications',
            value: apps.length,
            icon: '▤',
            color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40',
          },
          {
            label: 'Pending Applications',
            value: apps.filter(a => a.status === 'pending').length,
            icon: '◷',
            color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40',
          },
          {
            label: 'Approved Applications',
            value: apps.filter(a => a.status === 'approved').length,
            icon: '✓',
            color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40',
          },
          {
            label: 'Booth Requests',
            value: booths.length,
            icon: '▦',
            color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/40',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-5 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md flex items-center justify-between transition-all duration-300 hover:scale-[1.02]"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {item.label}
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white m-0">
                {item.value}
              </h2>
            </div>

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${item.color}`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">

        {/* Tab switcher */}
        <div className="mb-6 flex flex-wrap gap-2.5 border-b border-slate-200/70 dark:border-white/10 pb-4">
          {[
            { id: 'apps', label: 'Expo Applications' },
            { id: 'booths', label: 'Booth Requests' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setError('');
                setSuccess('');
              }}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                tab === item.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  : 'border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            FILTER:
          </span>

          {filters.map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all duration-300 hover:scale-[1.02] ${
                currentFilter === value
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-400 shadow-sm'
                  : 'border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-300/60 bg-rose-500/10 p-4 text-xs font-semibold text-rose-800 dark:text-rose-300 backdrop-blur-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-300/60 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 backdrop-blur-md">
            ✓ {success}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Loading applications...
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-800/20 py-16 px-4 text-center">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Nothing here yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No {tab === 'apps' ? 'applications' : 'booth requests'} found for this filter.
            </p>
          </div>
        ) : tab === 'apps' ? (

          <div className="grid gap-4">
            {apps.map((a) => {
              const c = a.exhibitor?.companyDetails || {};

              return (
                <div
                  key={a._id}
                  className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 p-5 shadow-sm transition hover:border-indigo-400 dark:hover:border-indigo-500/40"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {c.companyName || a.exhibitor?.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {a.exhibitor?.name} · {a.exhibitor?.email}
                      </p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold capitalize ${STATUS_CLASSES[a.status] || STATUS_CLASSES.pending}`}>
                      <span>●</span> {a.status}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Event:</strong>{' '}
                      {a.event?.title || 'N/A'}
                      {a.event?.startDate &&
                        ` · ${new Date(a.event.startDate).toLocaleDateString()}`}
                    </div>

                    {c.category && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Category:</strong> {c.category}
                      </div>
                    )}

                    {a.products?.length > 0 && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Products:</strong>{' '}
                        {a.products.join(', ')}
                      </div>
                    )}

                    {c.description && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Description:</strong>{' '}
                        {c.description}
                      </div>
                    )}

                    {a.message && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Message:</strong>{' '}
                        {a.message}
                      </div>
                    )}

                    {a.documents?.length > 0 && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Documents:</strong>{' '}
                        {a.documents.map((d, i) => (
                          <a
                            key={i}
                            href={API_ORIGIN + d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-3 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {d.name}
                          </a>
                        ))}
                      </div>
                    )}

                    {a.adminRemarks && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Admin Remarks:</strong>{' '}
                        {a.adminRemarks}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {a.status !== 'approved' && (
                      <button
                        disabled={busyId === a._id}
                        onClick={() => reviewApp(a._id, 'approved')}
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                      >
                        ✓ Approve
                      </button>
                    )}

                    {a.status !== 'rejected' && (
                      <button
                        disabled={busyId === a._id}
                        onClick={() => reviewApp(a._id, 'rejected')}
                        className="rounded-xl border border-rose-300/60 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/40 px-5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-rose-100/60 disabled:opacity-60"
                      >
                        ✕ Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          <div className="grid gap-4">
            {booths.map((b) => {
              const ex = b.assignedExhibitor || {};
              const c = ex.companyDetails || {};
              const status = boothStatusKey(b.status);

              return (
                <div
                  key={b._id}
                  className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 p-5 shadow-sm transition hover:border-indigo-400 dark:hover:border-indigo-500/40"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Booth {b.boothNumber}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {b.hallId?.name} · {b.category} · ${b.price}
                      </p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold capitalize ${STATUS_CLASSES[status] || STATUS_CLASSES.pending}`}>
                      ● {boothStatusLabel(b.status)}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Company:</strong>{' '}
                      {c.companyName || ex.name}
                    </div>

                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Exhibitor:</strong>{' '}
                      {ex.name} · {ex.email}
                    </div>

                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Position:</strong>{' '}
                      Row {(b.gridPosition?.row ?? 0) + 1}, Col {(b.gridPosition?.col ?? 0) + 1}
                    </div>

                    {c.category && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Category:</strong>{' '}
                        {c.category}
                      </div>
                    )}

                    {b.details?.showcase?.length > 0 && (
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Showcase:</strong>{' '}
                        {b.details.showcase.join(', ')}
                      </div>
                    )}

                    {b.status === 'rejected' && (
                      <div className="text-rose-600 dark:text-rose-400">
                        Rejected
                        {b.rejectedAt &&
                          ` on ${new Date(b.rejectedAt).toLocaleDateString()}`}
                        {b.rejectionRemarks &&
                          ` — Reason: ${b.rejectionRemarks}`}
                      </div>
                    )}
                  </div>

                  {b.status === 'reserved' && (
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        disabled={busyId === b._id}
                        onClick={() => reviewBooth(b._id, 'approve')}
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                      >
                        ✓ Approve
                      </button>

                      <button
                        disabled={busyId === b._id}
                        onClick={() => reviewBooth(b._id, 'reject')}
                        className="rounded-xl border border-rose-300/60 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/40 px-5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-rose-100/60 disabled:opacity-60"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}