
import React, { useEffect, useState } from 'react';
import {
  getAttendeeRegistrationsApi,
  cancelAttendeeRegistrationApi
} from '../AttendeeServices/attendeeServices';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAttendeeRegistrationsApi();

      const list = Array.isArray(response.data)
        ? response.data
        : response.registrations || [];

      setRegistrations(list);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load your registrations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this registration?'
    );

    if (!confirmed) return;

    try {
      setCancellingId(id);
      setError('');
      setSuccess('');

      const response = await cancelAttendeeRegistrationApi(id);

      setSuccess(response.message || 'Registration cancelled successfully.');
      await fetchRegistrations();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to cancel registration.'
      );
    } finally {
      setCancellingId('');
    }
  };

  const getStatusStyle = (status) => {
    const value = (status || 'registered').toLowerCase();

    if (value === 'cancelled' || value === 'rejected') {
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20';
    }

    if (value === 'pending') {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
    }

    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Heading */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-amber-600 dark:text-amber-400">
            Your Event Activity
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            My Registrations
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your event reservations and passes.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/80 dark:bg-indigo-950/60 px-5 py-3 backdrop-blur-md">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Registrations</p>
          <p className="mt-1 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {registrations.length}
          </p>
        </div>
      </section>

      {/* Alerts */}
      {success && (
        <div className="rounded-xl border border-emerald-300/60 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300 backdrop-blur-md">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-300 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Registration list */}
      {registrations.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-6 py-16 text-center shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-3xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
            ▤
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No registrations yet
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your registered events will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {registrations.map((registration, index) => {
            const event = registration.event || {};
            const status = registration.status || 'Registered';

            return (
              <article
                key={registration._id || index}
                className="overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/10 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Event Registration
                    </p>

                    <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                      {event.title || registration.eventTitle || 'Event'}
                    </h2>
                  </div>

                  <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${getStatusStyle(status)}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-4 p-5">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Venue</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {event.venue || event.hall?.name || 'TBA'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {event.startDate
                          ? new Date(event.startDate).toLocaleDateString()
                          : 'TBA'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Ticket Price</p>
                      <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {Number(event.ticketPrice || 0) === 0
                          ? 'Free'
                          : `Rs. ${event.ticketPrice}`}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Registration ID</p>
                      <p className="mt-1 break-all text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {registration._id || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {(registration.ticketNumber || registration.ticketId) && (
                    <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 p-4 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Ticket Information
                      </p>
                      <p className="mt-2 font-mono font-bold text-slate-900 dark:text-white">
                        {registration.ticketNumber || registration.ticketId}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end border-t border-slate-200/70 dark:border-white/10 pt-4">
                    {status.toLowerCase() !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(registration._id)}
                        disabled={cancellingId === registration._id}
                        className="rounded-xl border border-rose-300/60 dark:border-rose-500/30 px-5 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        {cancellingId === registration._id
                          ? 'Cancelling...'
                          : 'Cancel Registration'}
                      </button>
                    )}
                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
