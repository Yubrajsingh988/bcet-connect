// frontend/src/components/common/NotificationBell.jsx
import React, { useEffect, useRef, useState } from "react";
import { Bell, X, Check, Inbox } from "lucide-react";
import useNotifications from "../../hooks/useNotifications"; // assume exists
import { formatDistanceToNowStrict } from "date-fns"; // optional, install if using (or remove)
import { Button } from "@/components/ui/button";

export default function NotificationBell() {
  const { notifications = [], unreadCount = 0, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // close on outside click / Esc
  useEffect(() => {
    function onDocClick(e) {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const handleMarkAll = async () => {
    try {
      await markAllRead();
    } catch (err) {
      console.error("markAllRead error", err);
    }
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Notifications"
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Bell size={18} className="text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-[320px] max-h-[70vh] md:w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/10">
            <div className="flex items-center gap-2">
              <Inbox size={18} className="text-emerald-600" />
              <h3 className="font-medium text-sm">Notifications</h3>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAll}
                className="text-xs text-emerald-600 hover:underline px-2 py-1 rounded"
                aria-label="Mark all notifications as read"
              >
                Mark all
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* list */}
          <div className="overflow-y-auto max-h-[56vh]">
            {notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            )}

            {notifications.map((n) => (
              <article
                key={n._id || n.id}
                className={`flex gap-3 px-4 py-3 items-start border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition`}
                aria-live="polite"
              >
                <div className="flex-none mt-1">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      n.unread ? "bg-emerald-600/10" : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {/* icon placeholder */}
                    <span className="text-emerald-600 text-sm font-semibold">
                      {n.type?.charAt(0)?.toUpperCase() || "N"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {n.message || n.text || n.body}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {/* nicely formatted relative time if available */}
                        {n.createdAt
                          ? formatDistanceToNowStrict(new Date(n.createdAt), {
                              addSuffix: true,
                            })
                          : n.time || ""}
                      </p>

                      {/* mark read button */}
                      {!n.unread ? null : (
                        <button
                          onClick={() => markRead(n._id || n.id)}
                          className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          aria-label={`Mark notification ${n.title} as read`}
                        >
                          <Check size={14} />
                          Mark
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between">
            <small className="text-xs text-gray-500 dark:text-gray-400">
              Notifications are real-time
            </small>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                /* you can navigate to notifications page */
              }}
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
