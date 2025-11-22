// frontend/src/components/common/NotFound.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPinOff, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
      <section className="max-w-3xl w-full rounded-2xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg p-10 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/10 flex items-center justify-center">
            <MapPinOff className="text-emerald-600 dark:text-emerald-300" size={38} />
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          404
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300">
          Oops — we couldn't find that page.
        </p>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The link might be broken or the page may have been removed.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-100 bg-white dark:bg-gray-800 text-emerald-700 hover:bg-emerald-50 transition"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            aria-label="Go to homepage"
          >
            Go to Home
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-400 dark:text-gray-600">
          If you think this is an error, contact an admin or try refreshing the page.
        </div>
      </section>
    </main>
  );
}
