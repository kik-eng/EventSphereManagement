
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordApi } from "../AuthServices/authServices";
import ThemeToggle from "../../../core/component/ThemeToggle";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await resetPasswordApi({
        token,
        newPassword,
      });

      setMessage({
        type: "success",
        text: res.message || "Password updated successfully!",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Password reset failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300">

      {/* Floating Theme Toggle */}
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-indigo-500/15 dark:bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-amber-500/15 dark:bg-amber-500/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
            E
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Event<span className="text-amber-500 dark:text-amber-400">Sphere</span>
          </span>
        </Link>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/60 p-7 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl sm:p-10 transition-colors duration-300">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <path d="M12 15v3" />
              </svg>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
              Account Security
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Set New Password
            </h1>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">
              Create a strong password to secure your EventSphere account. You will be redirected to login after updating it.
            </p>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-6 rounded-xl border p-4 text-sm backdrop-blur-md ${
                message.type === "success"
                  ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "border-rose-300/60 bg-rose-500/10 text-rose-800 dark:text-rose-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="font-bold">
                  {message.type === "success" ? "✓" : "!"}
                </span>
                <p>{message.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Reset Token */}
            <div>
              <label
                htmlFor="resetToken"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Reset Token
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <circle cx="8" cy="15" r="5" />
                    <path d="m10.5 11.5 7-7 3 3-7 7" />
                    <path d="m17 5 2 2" />
                  </svg>
                </span>

                <input
                  id="resetToken"
                  name="token"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Enter your reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15 outline-none transition disabled:opacity-60"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                New Password
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>

                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 py-3.5 pl-12 pr-20 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15 outline-none transition disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Use at least 8 characters for your password.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !token.trim() || !newPassword}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "Updating Password..." : "Update Password →"}
            </button>

          </form>

          {/* Back to Login */}
          <div className="mt-8 border-t border-slate-200/80 dark:border-white/10 pt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              ← Back to Login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} EventSphere Management. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
