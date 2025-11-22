// frontend/src/layouts/AuthLayout.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * AuthLayout
 *
 * Usage:
 * <AuthLayout
 *   title="Welcome back"
 *   subtitle="Sign in to continue to BCET Connect"
 *   logo={<img src="/logo.svg" alt="BCET Connect" className="h-8" />}
 *   footer={<div>By continuing you agree to the <Link to="/tos">Terms</Link></div>}
 * >
 *   <YourLoginForm />
 * </AuthLayout>
 *
 * Notes:
 * - This component is intentionally dependency-free (no ThemeContext required).
 * - It respects dark mode if your app toggles `class="dark"` on <html>.
 */

export default function AuthLayout({
  children,
  title = "Welcome",
  subtitle = "",
  logo = null,
  footer = null,
  showBrand = true, // show brand name to the right of logo
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 theme-transition">
      <div className="min-h-screen flex flex-col">
        {/* Top area: optional small link (e.g., 'Back to site') */}
        <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 focus:outline-none">
              {/* logo slot (caller can pass an <img/> or component) */}
              <div
                aria-hidden
                className="flex items-center justify-center rounded-full w-10 h-10 bg-emerald-100 dark:bg-emerald-900 ring-1 ring-emerald-200 dark:ring-emerald-800"
              >
                {logo ? (
                  // if caller passes a logo element, render it
                  React.cloneElement(logo, { className: logo.props.className ?? "h-6 w-auto" })
                ) : (
                  // default simple monogram
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">BC</span>
                )}
              </div>

              {showBrand && (
                <span className="hidden sm:inline-block text-lg font-medium text-slate-700 dark:text-slate-100">
                  BCET Connect
                </span>
              )}
            </Link>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300">
            {/* small space for a link if desired; keep empty by default */}
            <Link to="/about" className="hover:underline">
              About
            </Link>
          </div>
        </header>

        {/* Main centered area */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <div
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            aria-live="polite"
          >
            {/* Left / Decorative column (hidden on small screens) */}
            <section
              className="hidden md:flex flex-col gap-6 px-6 py-10 rounded-2xl
                         bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900
                         shadow-lg ring-1 ring-slate-100 dark:ring-slate-800"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg p-3 bg-emerald-50 dark:bg-emerald-900/20">
                  {/* small decorative icon */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-600 dark:text-emerald-300">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.12" />
                    <path d="M12 13l-10-5v6l10 5 10-5v-6l-10 5z" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Welcome to BCET Connect</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Connect with mentors, share posts, explore events and grow your campus network.
                  </p>
                </div>
              </div>

              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                <ul className="list-inside list-disc space-y-2">
                  <li>Secure authentication and role-based access</li>
                  <li>Fast media uploads (Cloudinary integrated)</li>
                  <li>Real-time chat and notifications</li>
                </ul>
              </div>

              <div className="mt-auto">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Tip: Use your college email to register for alumni-only features.
                </div>
              </div>
            </section>

            {/* Right / Form column */}
            <section
              className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 sm:p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800
                         flex flex-col gap-4"
            >
              <div className="mb-2">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
                {subtitle && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
              </div>

              <div className="w-full">{children}</div>

              {/* optional social / divider */}
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                  <div className="text-xs text-slate-400">or continue with</div>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium
                               bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700
                               ring-1 ring-slate-100 dark:ring-slate-700"
                  >
                    {/* Placeholder - replace with real provider icons */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2v20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Continue</span>
                  </button>

                  <button
                    type="button"
                    className="px-3 py-2 rounded-md text-sm bg-transparent border border-slate-200 dark:border-slate-700
                               hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-100"
                  >
                    Help
                  </button>
                </div>
              </div>

              {/* footer area (links / small text) */}
              {footer && <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">{footer}</div>}
            </section>
          </div>
        </main>

        {/* small footer */}
        <footer className="w-full py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} BCET Connect — Built for students & alumni.
          </div>
        </footer>
      </div>
    </div>
  );
}
