// frontend/src/App.jsx
import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useUI } from "./context/UIContext";
import { useTheme } from "./context/ThemeContext";

/**
 * Small ErrorBoundary for runtime errors inside routes.
 * If you already have a shared ErrorBoundary component, replace this with your own.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // TODO: send to logging service
    // console.error("Uncaught error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 text-center max-w-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Something went wrong</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              An unexpected error occurred. Try refreshing the page or contact support.
            </p>
            <pre className="text-xs text-left max-h-40 overflow-auto bg-gray-100 dark:bg-gray-900 p-2 rounded">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button
              className="mt-4 inline-block px-4 py-2 rounded bg-gray-800 text-white hover:opacity-95"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Minimal ToastStack that reads toasts from UIContext and renders them.
 * If you already have a toast lib (shadcn, react-hot-toast), replace this.
 */
function ToastStack() {
  const { toasts, dismissToast } = useUI();

  return (
    <div className="fixed top-4 right-4 z-[1200] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`max-w-xs w-full rounded-lg shadow-lg px-4 py-3
            ${t.type === "error" ? "bg-red-50 text-red-800" : ""}
            ${t.type === "success" ? "bg-green-50 text-green-800" : ""}
            ${t.type === "warning" ? "bg-yellow-50 text-amber-800" : ""}
            ${t.type === "info" || !t.type ? "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100" : ""}
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm leading-snug">{t.message}</div>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="ml-3 text-xs opacity-60 hover:opacity-90"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  // ensure theme provider applied early; hook used here just to avoid lint unused import
  useTheme(); // ensures theme effects run in client

  return (
    <ErrorBoundary>
      {/* Suspense fallback while routes lazy-load, keep fallback minimal to avoid big layout shift */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="animate-pulse text-center text-gray-600 dark:text-gray-300">Loading…</div>
          </div>
        }
      >
        {/* ToastStack sits above routes so it's always available */}
        <ToastStack />
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}
