
import React, { useEffect, useState } from 'react';
import {
  getAttendeeProfileApi,
  updateAttendeeProfileApi
} from '../AttendeeServices/attendeeServices';

export default function AttendeeProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    address: '',
    contact: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getAttendeeProfileApi();

        const data = response.data || response.user || response.profile || response;

        setProfile({
          name: data.name || '',
          email: data.email || '',
          address: data.address || '',
          contact: data.contact || ''
        });
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load your profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await updateAttendeeProfileApi(profile);

      const updated = response.data || response.user || response.profile;

      if (updated) {
        setProfile({
          name: updated.name || profile.name,
          email: updated.email || profile.email,
          address: updated.address || profile.address,
          contact: updated.contact || profile.contact
        });
      }

      // Keep the updated user details in localStorage.
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

        localStorage.setItem(
          'user',
          JSON.stringify({
            ...storedUser,
            ...profile,
            ...(updated || {})
          })
        );
      } catch {
        // Profile update can still succeed if local storage data is invalid.
      }

      setSuccess(response.message || 'Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">

      {/* Heading */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-amber-600 dark:text-amber-400">
          Account Settings
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal information and account details.
        </p>
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

      {/* Profile banner */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-xl sm:p-9 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-tr from-amber-500 to-amber-600 text-2xl font-extrabold text-slate-950 shadow-lg shadow-amber-500/25">
            {initials}
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {profile.name || 'Attendee'}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {profile.email || 'No email available'}
            </p>
            <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm">
              EventSphere Attendee
            </span>
          </div>
        </div>
      </section>

      {/* Profile form */}
      <section className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md sm:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Personal Information
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your registered account details.
            </p>
          </div>

          {!editing && (
            <button
              onClick={() => {
                setError('');
                setSuccess('');
                setEditing(true);
              }}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div className="grid gap-6 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing}
                required
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/60 dark:bg-slate-800/30 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Email cannot be changed here.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Contact Number
              </label>
              <input
                type="text"
                name="contact"
                value={profile.contact}
                onChange={handleChange}
                disabled={!editing}
                required
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Address
              </label>
              <textarea
                name="address"
                rows="3"
                value={profile.address}
                onChange={handleChange}
                disabled={!editing}
                required
                className="w-full resize-none rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

          </div>

          {editing && (
            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200/70 dark:border-white/10 pt-6">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setSuccess('');
                }}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </section>

    </div>
  );
}
