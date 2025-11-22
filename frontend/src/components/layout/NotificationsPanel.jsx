// src/components/layout/NotificationsPanel.jsx
import React, { useRef } from "react";
import useNotifications from "@/hooks/useNotifications";
import useChat from "@/hooks/useChat";
import { Check, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPanel({ onClose }) {
  // get shared socket from useChat
  const { socket } = useChat();
  const {
    notifications,
    unread,
    loading,
    loadingMore,
    markRead,
    markAllRead,
    loadMore,
    total,
  } = useNotifications({ socket, pageSize: 20 });

  const listRef = useRef(null);

  return (
    <div className="w-[360px] max-h-[72vh] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/10">
        <div className="flex items-center gap-2">
          <Inbox size={16} className="text-emerald-600" />
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{unread} unread</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-xs text-emerald-600 hover:underline px-2 py-1 rounded"
            aria-label="Mark all notifications read"
          >
            Mark all
          </button>
          {onClose && (
            <button onClick={onClose} aria-label="Close" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* list */}
      <div ref={listRef} className="overflow-y-auto max-h-[58vh]">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id ?? n.id}
              className={`flex gap-3 px-4 py-3 items-start border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                !n.read ? "bg-emerald-50/40 dark:bg-emerald-900/10" : ""
              }`}
            >
              <div className="flex-none mt-1">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${!n.read ? "bg-emerald-600/10" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <span className="text-emerald-600 text-sm font-semibold">{(n.type || "N").charAt(0).toUpperCase()}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {n.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.message ?? n.text}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ""}
                    </div>

                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id ?? n.id)}
                        className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        aria-label={`Mark notification ${n.title} as read`}
                      >
                        <Check size={14} /> Mark
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* footer / load more */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between">
        <div className="text-xs text-gray-500">Showing {notifications.length} of {total}</div>
        <div>
          {notifications.length < total && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm text-emerald-600 hover:underline"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
