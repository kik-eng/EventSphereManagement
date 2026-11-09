
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAttendeeEventsApi,
  registerForEventApi
} from '../AttendeeServices/attendeeServices';

export default function AttendeeEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [registeringId, setRegisteringId] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAttendeeEventsApi();
      const list = Array.isArray(response.data)
        ? response.data
        : response.events || [];

      setEvents(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (id) => {
    try {
      setRegisteringId(id);
      setMessage('');
      setError('');

      const response = await registerForEventApi(id);
      setMessage(response.message || 'Successfully registered for the event!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to register for this event.'
      );
    } finally {
      setRegisteringId('');
    }
  };

  const filteredEvents = events.filter(event =>
    `${event.title || ''} ${event.venue || ''} ${event.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Page heading */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-amber-600 dark:text-amber-400">
            Discover Experiences
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Explore Events
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find events and reserve your place.
          </p>
        </div>

        <span className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/80 dark:bg-indigo-950/60 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 backdrop-blur-md">
          {events.length} Events Available
        </span>
      </section>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events by title, venue..."
          className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-5 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        />
      </div>

      {/* Alerts */}
      {message && (
        <div className="rounded-xl border border-emerald-300/60 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300 backdrop-blur-md">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-300 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Events */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-6 py-16 text-center shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-3xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
            ◈
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No events found
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Try another search or check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map(event => (
            <article
              key={event._id}
              className="group overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* Banner */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950">
                {event.bannerUrl ? (
                  <img
                    src={event.bannerUrl}
                    alt={event.title || 'Event banner'}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl text-white/50">
                    ◈
                  </div>
                )}

                <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                  {event.status || 'Upcoming'}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {event.title || 'Untitled Event'}
                </h2>

                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {event.description || 'Discover this exciting event with EventSphere.'}
                </p>

                <div className="mt-5 space-y-3 border-t border-slate-200/70 dark:border-white/10 pt-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Venue</span>
                    <span className="text-right font-medium text-slate-800 dark:text-slate-200">
                      {event.venue || event.hall?.name || 'TBA'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Start Date</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString()
                        : 'TBA'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Ticket Price</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {Number(event.ticketPrice || 0) === 0
                        ? 'Free'
                        : `Rs. ${event.ticketPrice}`}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/attendee/events/${event._id}`)}
                    className="rounded-xl border border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/40 px-3 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleRegister(event._id)}
                    disabled={registeringId === event._id}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {registeringId === event._id ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
