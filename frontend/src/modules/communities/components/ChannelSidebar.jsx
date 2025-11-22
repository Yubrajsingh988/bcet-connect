// src/modules/communities/components/ChannelSidebar.jsx

import { Hash, Plus } from "lucide-react";

export default function ChannelSidebar({
  channels = [],
  activeChannel,
  onChannelSelect,
}) {
  const channelCount = channels.length;

  return (
    <aside
      className="
        hidden md:flex
        w-64 lg:w-72
        flex-col
        rounded-2xl border border-slate-200/80 dark:border-slate-800
        bg-white/80 dark:bg-slate-950/80
        shadow-sm
        p-4
        max-h-[80vh]
        sticky top-20
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Channels
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {channelCount} active {channelCount === 1 ? "channel" : "channels"}
          </p>
        </div>

        <button
          type="button"
          className="
            inline-flex items-center justify-center
            h-7 w-7 rounded-full
            border border-slate-200 dark:border-slate-700
            text-slate-500 dark:text-slate-300
            text-xs
            hover:bg-slate-50 dark:hover:bg-slate-900
            transition-colors
          "
          // future ready: yaha par "Create Channel" modal trigger kar sakte ho
          onClick={() => {}}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* List container with fade */}
      {channelCount === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">
            No channels yet. Start with a{" "}
            <span className="font-semibold">#general</span> channel.
          </p>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden mt-1">
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-50/95 dark:from-slate-950/95 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-slate-50/95 dark:from-slate-950/95 to-transparent pointer-events-none" />

          <nav className="space-y-1 overflow-y-auto pr-1 pb-3 pt-1 custom-scrollbar">
            {channels.map((ch, index) => {
              const isActive =
                activeChannel &&
                (activeChannel === ch.name || activeChannel === ch._id);

              return (
                <button
                  key={ch._id || index}
                  type="button"
                  onClick={() =>
                    onChannelSelect && onChannelSelect(ch.name || ch._id)
                  }
                  className={`
                    w-full flex items-center gap-2
                    rounded-xl px-2.5 py-2
                    text-xs font-medium
                    text-left
                    transition-all
                    ${
                      isActive
                        ? "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-900/70"
                    }
                  `}
                >
                  <span
                    className={`
                      inline-flex items-center justify-center
                      rounded-md
                      h-6 w-6
                      ${
                        isActive
                          ? "bg-slate-800/80 text-slate-50 dark:bg-slate-200 dark:text-slate-900"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-300"
                      }
                    `}
                  >
                    <Hash className="h-3 w-3" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      {ch.name || `channel-${index + 1}`}
                    </p>
                    {ch.description && (
                      <p
                        className={`
                          text-[10px] truncate mt-0.5
                          ${
                            isActive
                              ? "text-slate-200/90 dark:text-slate-700"
                              : "text-slate-400 dark:text-slate-500"
                          }
                        `}
                      >
                        {ch.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}
