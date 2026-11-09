import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAttendeeDashboardApi,
  getAttendeeEventsApi,
  getAttendeeRegistrationsApi
} from '../AttendeeServices/attendeeServices';

export default function AttendeeDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({});
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [feedbackData, setFeedbackData] = useState({
    eventName: '',
    comments: ''
  });

  const [feedbackMessage, setFeedbackMessage] = useState('');

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [dashboardRes, eventsRes, registrationsRes] =
          await Promise.all([
            getAttendeeDashboardApi(),
            getAttendeeEventsApi(),
            getAttendeeRegistrationsApi()
          ]);

        setDashboard(
          dashboardRes.data || dashboardRes.dashboard || dashboardRes
        );

        setEvents(
          Array.isArray(eventsRes.data)
            ? eventsRes.data
            : eventsRes.events || []
        );

        setRegistrations(
          Array.isArray(registrationsRes.data)
            ? registrationsRes.data
            : registrationsRes.registrations || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load dashboard. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;

    setFeedbackData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();

    if (
      !feedbackData.eventName.trim() ||
      !rating ||
      !feedbackData.comments.trim()
    ) {
      setFeedbackMessage(
        'Please complete all fields and select a rating.'
      );
      return;
    }

    try {
      const savedFeedback = JSON.parse(
        localStorage.getItem('attendeeFeedback') || '[]'
      );

      savedFeedback.push({
        ...feedbackData,
        rating,
        attendeeName: user.name || 'Attendee',
        attendeeEmail: user.email || '',
        submittedAt: new Date().toISOString()
      });

      localStorage.setItem(
        'attendeeFeedback',
        JSON.stringify(savedFeedback)
      );

      setFeedbackMessage(
        'Thank you! Your feedback has been submitted.'
      );

      setFeedbackData({
        eventName: '',
        comments: ''
      });

      setRating(0);

      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackMessage('');
      }, 1500);
    } catch (err) {
      setFeedbackMessage(
        'Unable to save feedback. Please try again.'
      );
    }
  };

  const stats = [
    {
      title: 'Available Events',
      value: dashboard.totalEvents ?? events.length,
      icon: '◈',
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40'
    },
    {
      title: 'My Registrations',
      value: dashboard.totalRegistrations ?? registrations.length,
      icon: '▤',
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40'
    },
    {
      title: 'Upcoming Events',
      value: dashboard.upcomingEvents ?? registrations.length,
      icon: '◷',
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40'
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 p-7 text-white shadow-xl shadow-indigo-950/20 border border-white/10 sm:p-10 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-amber-400">
            Attendee Workspace
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Welcome back, {user.name?.split(' ')[0] || 'Attendee'}!
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">
            Discover exciting events, manage your registrations and make
            every experience memorable with EventSphere.
          </p>

          <button
            onClick={() => navigate('/attendee/events')}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:from-amber-400 hover:to-amber-500"
          >
            Explore Events →
          </button>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[35px] border-white/5 blur-sm" />
        <div className="pointer-events-none absolute -bottom-28 right-32 h-64 w-64 rounded-full border-[25px] border-amber-500/10 blur-sm" />
      </section>

      {error && (
        <div className="rounded-xl border border-rose-300/60 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-300 backdrop-blur-md">
          {error}
        </div>
      )}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Your Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your event activity at a glance.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <h3 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>
                </div>

                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              My Recent Registrations
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Events you have registered for.
            </p>
          </div>

          <button
            onClick={() => navigate('/attendee/registrations')}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition"
          >
            View All →
          </button>
        </div>

        {registrations.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-3xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
              ◈
            </div>

            <h3 className="font-semibold text-slate-900 dark:text-white">
              No registrations yet
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Explore events and reserve your first pass.
            </p>

            <button
              onClick={() => navigate('/attendee/events')}
              className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.slice(0, 5).map((registration, index) => {
              const event = registration.event || {};

              return (
                <div
                  key={registration._id || index}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-slate-800/40 p-4 transition hover:border-indigo-300 dark:hover:border-indigo-500/40"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {event.title || registration.eventTitle || 'Event'}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {event.venue || event.location || 'Venue not available'}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {registration.status || 'Registered'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-6 shadow-sm backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Your Opinion Matters
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            How was your EventSphere experience?
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Share your thoughts and help us improve.
          </p>
        </div>

        <button
          onClick={() => {
            setFeedbackMessage('');
            setShowFeedback(true);
          }}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          Give Feedback →
        </button>
      </section>

      {showFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowFeedback(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  EventSphere
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  Share Your Feedback
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Tell us about your experience.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Event Name
                </label>

                <input
                  type="text"
                  name="eventName"
                  value={feedbackData.eventName}
                  onChange={handleFeedbackChange}
                  placeholder="Enter event name"
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition"
                />
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Rate Your Experience
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-3xl transition ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 drop-shadow'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {rating ? `${rating} out of 5 stars` : 'Select your rating'}
                </p>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Your Comments
                </label>

                <textarea
                  name="comments"
                  rows="4"
                  value={feedbackData.comments}
                  onChange={handleFeedbackChange}
                  placeholder="Write your experience here..."
                  className="w-full resize-none rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition"
                />
              </div>

              {feedbackMessage && (
                <p className="mb-4 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/80 dark:bg-indigo-950/50 p-3 text-sm text-indigo-700 dark:text-indigo-300 backdrop-blur-md">
                  {feedbackMessage}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeedback(false)}
                  className="rounded-xl border border-slate-200/80 dark:border-white/10 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}