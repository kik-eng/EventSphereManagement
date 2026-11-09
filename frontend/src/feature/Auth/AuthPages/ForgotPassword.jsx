
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../AuthServices/authServices";
import ThemeToggle from "../../../core/component/ThemeToggle";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({ type: "", text: "" });
    setResetToken("");

    try {
      const res = await forgotPasswordApi({ email });

      setMessage({
        type: "success",
        text:
          res.message ||
          "Password reset token generated successfully.",
      });

      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Unable to process your request. Please try again.",
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

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-indigo-500/15 dark:bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-amber-500/15 dark:bg-amber-500/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-3 group"
        >
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
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
              Account Recovery
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Forgot Password?
            </h1>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">
              No worries! Enter your registered email address and we'll help you reset your password.
            </p>
          </div>

          {/* Alert */}
          {message.text && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-6 rounded-xl border p-4 text-sm leading-5 backdrop-blur-md ${
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Email Address
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
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15 outline-none transition disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Processing Request...
                </>
              ) : (
                <>
                  Send Reset Link
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Token */}
          {resetToken && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-5 backdrop-blur-md">

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2z" />
                    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                  </svg>
                </div>

                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Password Reset Token
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                Your reset token is ready. Use it to continue resetting your password.
              </p>

              <div className="mt-3 break-all rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 p-3 font-mono text-xs text-indigo-600 dark:text-indigo-400 select-all">
                {resetToken}
              </div>

              <Link
                to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Reset Password →
              </Link>
            </div>
          )}

          {/* Footer */}
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

export default ForgotPassword;
