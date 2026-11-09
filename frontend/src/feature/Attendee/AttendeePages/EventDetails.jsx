
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAttendeeEventByIdApi,
  registerForEventApi
} from '../AttendeeServices/attendeeServices';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getAttendeeEventByIdApi(id);
        setEvent(response.data || response.event || response);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load event details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    try {
      setRegistering(true);
      setMessage('');
      setError('');

      const response = await registerForEventApi(id);
      setMessage(response.message || 'You have successfully registered!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="rounded-3xl border border-rose-300/60 bg-white/70 dark:bg-slate-900/60 p-10 text-center backdrop-blur-md">
        <p className="font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        <button
          onClick={() => navigate('/attendee/events')}
          className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02]"
        >
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-7">

      {/* Back button */}
      <button
        onClick={() => navigate('/attendee/events')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition"
      >
        ← Back to Events
      </button>

      {/* Banner */}
      <section className="relative h-64 overflow-hidden rounded-3xl border border-slate-200/60 dark:border-white/10 bg-gradient-to-r from-slate-900 to-indigo-950 sm:h-80 shadow-xl">
        {event.bannerUrl && (
          <img
            src={event.bannerUrl}
            alt={event.title || 'Event banner'}
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-7 left-6 right-6 sm:left-10">
          <span className="rounded-full bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold backdrop-blur-md shadow-sm">
            {event.status || 'Upcoming'}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            {event.title || 'Event Details'}
          </h1>
        </div>
      </section>

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

      <div className="grid gap-7 lg:grid-cols-[1fr_320px]">

        {/* Description */}
        <section className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            About This Event
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600 dark:text-slate-400">
            {event.description || 'No event description available.'}
          </p>

          <div className="mt-8 grid gap-5 border-t border-slate-200/70 dark:border-white/10 pt-7 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Venue
              </p>
              <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">
                {event.venue || event.hall?.name || 'To be announced'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Start Date
              </p>
              <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">
                {event.startDate
                  ? new Date(event.startDate).toLocaleDateString()
                  : 'To be announced'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                End Date
              </p>
              <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">
                {event.endDate
                  ? new Date(event.endDate).toLocaleDateString()
                  : 'To be announced'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Event Status
              </p>
              <p className="mt-2 font-semibold text-indigo-600 dark:text-indigo-400">
                {event.status || 'Upcoming'}
              </p>
            </div>
          </div>
        </section>

        {/* Registration card */}
        <aside className="h-fit rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Registration Price
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {Number(event.ticketPrice || 0) === 0
              ? 'Free'
              : `Rs. ${event.ticketPrice}`}
          </h2>

          <div className="my-6 border-t border-slate-200/70 dark:border-white/10" />

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Reserve your place and be part of this EventSphere experience.
          </p>

          <button
            onClick={handleRegister}
            disabled={registering}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
          >
            {registering ? 'Registering...' : 'Register for Event'}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-amber-500">✦</span>
            EventSphere Registration
          </div>
        </aside>

      </div>
    </div>
  );
}
