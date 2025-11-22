// frontend/src/components/common/AccessDenied.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";

/**
 * AccessDenied
 * - nice, responsive access denied page
 * - shows helpful actions and contact/admin hint
 *
 * Props (optional):
 * - message: custom explanation text
 * - showSupport: boolean to show "Contact admin" hint
 */
export default function AccessDenied({
  message = "You do not have permission to view this page.",
  showSupport = true,
}) {
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4"
      aria-labelledby="access-denied-title"
    >
      <section className="max-w-xl w-full rounded-2xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg p-8">
        <div className="flex items-center gap-4">
          <div className="flex-none w-16 h-16 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/10 flex items-center justify-center">
            <ShieldOff className="text-emerald-600 dark:text-emerald-300" size={34} />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              id="access-denied-title"
              className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Access Denied
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-100 bg-white dark:bg-gray-900 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            aria-label="Go to Home"
          >
            <span className="text-sm font-medium">Go to Home</span>
          </Link>
        </div>

        {showSupport && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            If you think this is a mistake, contact your administrator or check
            your account permissions.
          </div>
        )}
      </section>
    </main>
  );
}
