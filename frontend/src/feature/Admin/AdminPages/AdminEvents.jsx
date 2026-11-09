
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAllHallsApi } from '../AdminServices/floorPlanServices';

const API_BASE = 'http://localhost:3000/api';

const defaultBanner =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop';

export default function AdminEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedHall, setSelectedHall] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticketPrice, setTicketPrice] = useState(50);
  const [bannerUrl, setBannerUrl] = useState('');

  const token = localStorage.getItem('token');
  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [hallsRes, eventsRes] = await Promise.all([
        getAllHallsApi().catch((err) => {
          console.error('Halls Fetch Error:', err);
          return null;
        }),

        axios.get(`${API_BASE}/admin/events`, authHeaders).catch((err) => {
          console.error('Events Fetch Error:', err);
          return { data: { events: [] } };
        }),
      ]);

      let fetchedHalls = [];

      if (hallsRes) {
        if (Array.isArray(hallsRes)) {
          fetchedHalls = hallsRes;
        } else if (Array.isArray(hallsRes.data)) {
          fetchedHalls = hallsRes.data;
        } else if (Array.isArray(hallsRes.halls)) {
          fetchedHalls = hallsRes.halls;
        } else if (Array.isArray(hallsRes.hall)) {
          fetchedHalls = hallsRes.hall;
        }
      }

      const fetchedEvents =
        eventsRes?.data?.events ||
        (Array.isArray(eventsRes?.data) ? eventsRes.data : []);

      setHalls(fetchedHalls);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedHall('');
    setVenue('');
    setStartDate('');
    setEndDate('');
    setBannerUrl('');
    setTicketPrice(50);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!selectedHall) {
      alert('Please select a Hall from the database!');
      return;
    }

    try {
      const payload = {
        title,
        description,
        hallId: selectedHall,
        venue,
        startDate,
        endDate,
        bannerUrl: bannerUrl || defaultBanner,
        ticketPrice: Number(ticketPrice),
        status: 'Upcoming',
      };

      await axios.post(
        `${API_BASE}/admin/events`,
        payload,
        authHeaders
      );

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  const getStatusStyle = (status) => {
    const value = (status || 'Upcoming').toLowerCase();

    if (value === 'completed') {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
    }

    if (value === 'ongoing') {
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20';
    }

    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
  };

  const formatDate = (date) => {
    if (!date) return 'Date not available';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return 'Date not available';

    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full space-y-7">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-amber-600 dark:text-amber-400">
            EVENT MANAGEMENT
          </p>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Expo Events
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create and manage exhibition events connected to your halls.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-100 dark:hover:bg-slate-800 backdrop-blur-md"
            onClick={fetchData}
            type="button"
          >
            ↻ Refresh
          </button>

          <button
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setShowModal(true)}
            type="button"
          >
            + Create New Event
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Events',
            value: events.length,
            icon: '▦',
            color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40',
          },
          {
            label: 'Available Halls',
            value: halls.length,
            icon: '▤',
            color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40',
          },
          {
            label: 'Upcoming Events',
            value: events.filter(
              (event) => (event.status || 'Upcoming').toLowerCase() === 'upcoming'
            ).length,
            icon: '◷',
            color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-5 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md flex items-center gap-4 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm ${item.color}`}>
              {item.icon}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {item.label}
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white m-0">
                {item.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Events Section */}
      <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              All Events
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your registered exhibition events
            </p>
          </div>

          <span className="rounded-full border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/80 dark:bg-indigo-950/60 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 backdrop-blur-md">
            {events.length} Events
          </span>
        </div>

        {loading ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Loading events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-800/20 py-16 px-4 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
              ▦
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No Events Scheduled
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Create your first event and connect it with an exhibition hall.
            </p>
            <button
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setShowModal(true)}
            >
              + Create New Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((ev) => {
              const statusClass = getStatusStyle(ev.status);

              return (
                <div
                  key={ev._id}
                  className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950">
                    <img
                      src={ev.bannerUrl || defaultBanner}
                      alt={ev.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />

                    <span className={`absolute top-3.5 right-3.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md shadow-sm ${statusClass}`}>
                      {ev.status || 'Upcoming'}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2 min-h-9">
                      {ev.description || 'Exhibition event'}
                    </p>

                    <div className="space-y-2.5 mb-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/70 dark:border-white/10 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400">▤</span>
                        <span>
                          Hall: <strong className="text-slate-900 dark:text-slate-200">{ev.hallId?.name || 'Assigned Hall'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-amber-500">⌖</span>
                        <span className="line-clamp-1">{ev.venue || 'Venue not specified'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500">▦</span>
                        <span>
                          {formatDate(ev.startDate)} – {formatDate(ev.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto mb-4 flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 p-3">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Ticket Price
                      </span>
                      <strong className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        ${ev.ticketPrice ?? 0}
                      </strong>
                    </div>

                    <button
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => navigate('/admin/floor-plan')}
                    >
                      Manage Live Floor Plan →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <form
            onSubmit={handleCreateEvent}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[2px] text-amber-600 dark:text-amber-400 mb-1">
                  EVENT MANAGEMENT
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create New Event
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Event Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. International Tech Summit 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Description
                </label>
                <textarea
                  placeholder="Enter event description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Select Exhibition Hall *
                </label>
                <select
                  required
                  value={selectedHall}
                  onChange={(e) => setSelectedHall(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 cursor-pointer"
                >
                  <option value="">-- Choose Hall from Database --</option>
                  {halls.map((hall) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}{' '}
                      {hall.dimensions
                        ? `(${hall.dimensions.rows} × ${hall.dimensions.cols} Grid)`
                        : ''}
                    </option>
                  ))}
                </select>

                {halls.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                    No halls found. Please create a hall in Floor Plan Builder first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Venue Location *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Expo Center, North Wing"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  placeholder="Paste an image URL"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
              </div>

              {bannerUrl && (
                <div className="h-28 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10">
                  <img
                    src={bannerUrl}
                    alt="Event banner preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    End Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Attendee Ticket Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200/70 dark:border-white/10 pt-4">
              <button
                type="button"
                className="rounded-xl border border-slate-200/80 dark:border-white/10 px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={halls.length === 0}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Publish Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
