import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../AuthServices/authServices";
import ThemeToggle from "../../../core/component/ThemeToggle";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(formData);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      if (res.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.user.role === "exhibitor") {
        navigate("/exhibitor/dashboard");
      } else {
        navigate("/attendee/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3.5 text-sm text-slate-900 outline-none backdrop-blur-md transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900/80 dark:focus:ring-indigo-500/20";

  return (
    <div className="relative min-h-screen bg-slate-100/90 text-slate-800 transition-colors duration-300 glass-mesh dark:bg-slate-950 dark:text-slate-100 md:grid md:grid-cols-2">

      {/* Floating Theme Toggle */}
      <div className="absolute right-5 top-5 z-30">
        <ThemeToggle />
      </div>

      {/* LEFT SIDE - BRANDING */}
      <section className="relative hidden min-h-screen flex-col justify-center overflow-hidden border-r border-slate-200/40 bg-slate-900/90 px-6 py-12 text-white backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85 sm:px-12 md:flex md:px-12 lg:px-16">

        {/* Ambient Glows */}
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-[#C6A15B]/20 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-lg">

          {/* Logo */}
          <Link to="/" className="mb-12 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C6A15B] to-[#e4c483] text-slate-950 shadow-lg shadow-[#C6A15B]/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 16 2 2 4-4"
                />
              </svg>
            </div>

            <span className="text-2xl font-bold tracking-tight text-white">
              Event<span className="text-[#C6A15B]">Sphere</span>
            </span>
          </Link>

          {/* Branding */}
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#C6A15B]">
            Welcome Back
          </p>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Your Events.
            <span className="mt-2 block bg-gradient-to-r from-[#C6A15B] via-[#E7C987] to-amber-200 bg-clip-text text-transparent">
              Your Opportunities.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
            One Platform. Every Expo. Endless Opportunities.
            Connect with exhibitors, discover exciting events, and
            manage your expo experience with ease.
          </p>

          {/* Event image card */}
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-1.5 shadow-2xl backdrop-blur-md">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85"
                alt="People attending an event"
                className="h-56 w-full object-cover sm:h-64 md:h-72"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              <div className="absolute bottom-5 left-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E7C987]">
                  EventSphere Management
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Where Events Come Together
                </h3>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300 backdrop-blur-md">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C6A15B] text-slate-950 font-bold">
              ✓
            </div>
            <p>Everything you need to make every expo successful.</p>
          </div>

        </div>
      </section>

      {/* RIGHT SIDE - LOGIN FORM */}
      <section className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10 lg:px-16">

        <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/75 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-indigo-500/5 sm:p-10">

          {/* Mobile Logo Header */}
          <div className="mb-8 md:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C6A15B] to-[#e4c483] text-slate-950 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 16 2 2 4-4"
                  />
                </svg>
              </div>

              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Event<span className="text-[#C6A15B]">Sphere</span>
              </span>
            </Link>
          </div>

          {/* Form heading */}
          <div className="mb-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-200/60 bg-indigo-50/80 text-indigo-600 backdrop-blur-md dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM5 20a7 7 0 0114 0M19 8h3m-1.5-1.5v3"
                />
              </svg>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
              Your Account
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Sign In
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Enter your details below to access your EventSphere account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 backdrop-blur-md dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 transition hover:underline dark:text-indigo-400"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-20`}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50/80 dark:text-indigo-400 dark:hover:bg-slate-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-600/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-6-6 6 6-6 6"
                    />
                  </svg>
                </>
              )}
            </button>

          </form>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-indigo-600 transition hover:underline dark:text-indigo-400"
            >
              Create an account
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-200/60 pt-5 text-center dark:border-white/10">
            <p className="text-xs leading-5 text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} EventSphere Management. All rights reserved.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Login;
