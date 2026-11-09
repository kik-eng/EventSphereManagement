import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../AuthServices/authServices";
import ThemeToggle from "../../../core/component/ThemeToggle";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee",
    companyDetails: {
      companyName: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const inputClass =
    "w-full rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-900 outline-none backdrop-blur-md transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900/80 dark:focus:ring-indigo-500/20";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [name]: value,
      },
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      companyDetails:
        role === "exhibitor"
          ? prev.companyDetails
          : { companyName: "" },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerApi(formData);
      alert("Account created successfully! Redirecting to Login...");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 px-4 py-8 text-slate-800 transition-colors duration-300 glass-mesh dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-10">

      {/* TOP BRAND */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C6A15B] to-[#e4c483] text-slate-950 shadow-md shadow-[#C6A15B]/30">
            <svg viewBox="0 0 24 24" width="25" height="25" fill="none"
              stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M16 3v4M8 3v4M3 11h18" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Event<span className="text-[#C6A15B]">Sphere</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Expo Management Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link to="/login"
            className="hidden rounded-xl border border-slate-200/70 bg-white/70 px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-slate-900/60 dark:text-indigo-400 dark:hover:bg-slate-800 sm:block">
            Sign In
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/75 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-indigo-500/5 lg:grid-cols-[0.9fr_1.1fr]">

        {/* LEFT BRANDING PANEL */}
        <div className="relative hidden overflow-hidden border-r border-slate-200/40 bg-slate-900/90 p-10 text-white backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85 lg:flex lg:min-h-[780px] lg:flex-col lg:justify-between xl:p-14">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#C6A15B]/20" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C6A15B]/30 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-[#E5CB92] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#C6A15B]" />
              YOUR EXPO, ALL IN ONE PLACE
            </span>
          </div>

          <div className="relative z-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#C6A15B]">
              Welcome to EventSphere
            </p>

            <h1 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
              Discover.
              <span className="block bg-gradient-to-r from-[#C6A15B] via-[#E7C987] to-amber-200 bg-clip-text text-transparent">Connect.</span>
              Experience.
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
              A connected platform for exhibitors and attendees.
              Discover events, showcase your business and create
              meaningful opportunities.
            </p>

            <div className="mt-10 space-y-5">
              {[
                ["01", "Explore exciting exhibitions"],
                ["02", "Connect with businesses"],
                ["03", "Create new opportunities"],
              ].map(([number, label]) => (
                <div key={number} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C6A15B]/30 bg-white/5 text-sm font-bold text-[#C6A15B] backdrop-blur-md">
                    {number}
                  </span>
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-6">
            <p className="text-sm font-semibold text-white">
              Where Exhibitors Meet Opportunities.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              One community. Multiple expos. Endless possibilities.
            </p>
          </div>
        </div>

        {/* REGISTRATION FORM */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-lg">

            <div className="mb-8">
              <span className="mb-3 inline-block rounded-full border border-indigo-200/60 bg-indigo-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 backdrop-blur-md dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
                Create your account
              </span>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Join EventSphere
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Create your account and become part of our expo community.
              </p>
            </div>

            {error && (
              <div role="alert"
                className="mb-5 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 backdrop-blur-md dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* ROLE */}
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Your Account Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => handleRoleChange("attendee")}
                    aria-pressed={formData.role === "attendee"}
                    className={`rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      formData.role === "attendee"
                        ? "border-indigo-500 bg-indigo-50/80 shadow-md shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-950/50"
                        : "border-slate-200/70 bg-white/60 hover:border-indigo-400 dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-indigo-400/40"
                    }`}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <svg viewBox="0 0 24 24" width="22" height="22"
                        fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Attendee</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Attend events</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange("exhibitor")}
                    aria-pressed={formData.role === "exhibitor"}
                    className={`rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      formData.role === "exhibitor"
                        ? "border-[#C6A15B] bg-[#fbf7ed] shadow-md shadow-[#C6A15B]/10 dark:border-[#C6A15B] dark:bg-[#C6A15B]/15"
                        : "border-slate-200/70 bg-white/60 hover:border-[#C6A15B] dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-[#C6A15B]/40"
                    }`}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ead4] text-[#9b7838] dark:bg-amber-950/60 dark:text-amber-300">
                      <svg viewBox="0 0 24 24" width="22" height="22"
                        fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Exhibitor</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Showcase business</p>
                  </button>

                </div>
              </div>

              {/* COMPANY NAME */}
              {formData.role === "exhibitor" && (
                <div>
                  <label htmlFor="companyName" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    placeholder="Enter your company name"
                    value={formData.companyDetails.companyName}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-600/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">
                {loading ? "Creating Account..." : "Create Your Account"}
                {!loading && <span>→</span>}
              </button>

            </form>

            <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                Sign In
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="h-px w-10 bg-slate-200 dark:bg-white/10" />
              <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500">CONNECT. DISCOVER. EXPERIENCE.</span>
              <span className="h-px w-10 bg-slate-200 dark:bg-white/10" />
            </div>

          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        © EventSphere Expo Management Platform
      </p>
    </div>
  );
};

export default Register;
