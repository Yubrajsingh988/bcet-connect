// src/modules/communities/components/CommunityMembers.jsx

import { Users } from "lucide-react";

export default function CommunityMembers({ members = [] }) {
  const memberCount = members.length;

  const getInitials = (name = "") => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const getRoleBadgeStyle = (role = "") => {
    const r = role.toLowerCase();
    if (r.includes("admin")) {
      return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200/70 dark:border-red-700/70";
    }
    if (r.includes("mod")) {
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/70 dark:border-amber-700/70";
    }
    return "bg-slate-50 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200 border-slate-200/70 dark:border-slate-700/70";
  };

  return (
    <aside
      className="
        w-full md:w-72 lg:w-80
        rounded-2xl border border-slate-200/80 dark:border-slate-800
        bg-white/80 dark:bg-slate-950/70
        shadow-sm
        p-4 md:p-5
        flex flex-col
        max-h-[70vh]
        sticky top-20
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div
            className="
              h-8 w-8 rounded-full
              bg-blue-50 dark:bg-blue-900/40
              flex items-center justify-center
              text-blue-600 dark:text-blue-300
            "
          >
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Members
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {memberCount === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            No members yet. Be the first to join this community.
          </p>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-50/90 dark:from-slate-950/95 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-50/95 dark:from-slate-950/95 to-transparent pointer-events-none" />

          <div className="space-y-2 overflow-y-auto pr-1 pt-2 pb-4 custom-scrollbar">
            {members.map((m) => (
              <div
                key={m._id}
                className="
                  flex items-center gap-3
                  rounded-xl
                  px-2.5 py-2
                  hover:bg-slate-50 dark:hover:bg-slate-900/70
                  transition-colors
                "
              >
                {/* Avatar */}
                <div className="relative">
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="
                        h-9 w-9 rounded-full object-cover
                        border border-slate-200 dark:border-slate-700
                      "
                    />
                  ) : (
                    <div
                      className="
                        h-9 w-9 rounded-full
                        bg-gradient-to-br from-blue-600 to-indigo-500
                        flex items-center justify-center
                        text-[11px] font-semibold
                        text-white
                      "
                    >
                      {getInitials(m.name)}
                    </div>
                  )}

                  {/* Online dot (future-ready, placeholder) */}
                  <span
                    className="
                      absolute -bottom-0.5 -right-0.5
                      h-2.5 w-2.5 rounded-full
                      border border-slate-900 dark:border-slate-950
                      bg-emerald-400 dark:bg-emerald-400
                    "
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {m.name}
                  </p>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    {m.role && (
                      <span
                        className={`
                          inline-flex items-center gap-1
                          rounded-full border
                          px-2 py-[2px]
                          text-[10px] font-medium
                          ${getRoleBadgeStyle(m.role)}
                        `}
                      >
                        {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
