// frontend/src/components/common/LoadingSpinner.jsx
import React from "react";
import { Loader2 } from "lucide-react";

/**
 * LoadingSpinner
 *
 * Props:
 * - fullScreen (boolean) default true -> covers viewport with backdrop
 * - message (string) optional helper text under spinner
 * - size (number) spinner size in px (default 48)
 *
 * Usage examples:
 * <LoadingSpinner />                // fullscreen overlay
 * <LoadingSpinner fullScreen={false} message="Saving..." /> // inline
 */
export default function LoadingSpinner({
  fullScreen = true,
  message = "Loading, please wait…",
  size = 48,
}) {
  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="relative">
        <Loader2
          size={size}
          className="animate-spin text-emerald-600 dark:text-emerald-300"
          aria-hidden="true"
        />
        {/* soft ring for subtle effect */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 6px 18px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.02)",
          }}
        />
      </div>

      {message && (
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      )}

      {/* simple skeleton lines to indicate background progress */}
      {fullScreen && (
        <div className="mt-4 w-56 space-y-2">
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="inline-flex items-center justify-center">{spinner}</div>;
}
