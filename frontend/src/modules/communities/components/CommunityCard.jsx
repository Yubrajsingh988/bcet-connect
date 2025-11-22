// src/modules/communities/components/CommunityCard.jsx

import { Link } from "react-router-dom";
import { Users } from "lucide-react";

export default function CommunityCard({ community }) {
  if (!community) return null;

  const memberCount = community.members?.length || 0;
  const banner = community.banner;

  return (
    <Link to={`/communities/${community._id}`} className="block">
      <article
        className="
          group relative overflow-hidden
          rounded-2xl border border-slate-200/80 dark:border-slate-800
          bg-white/80 dark:bg-slate-900/80
          shadow-sm hover:shadow-md
          transition-all duration-200
          hover:-translate-y-0.5
        "
      >
        {/* Banner / Accent */}
        <div className="relative h-20 w-full overflow-hidden">
          {banner ? (
            <img
              src={banner}
              alt={community.name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div
              className="
                h-full w-full
                bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500
                opacity-90 group-hover:opacity-100
              "
            />
          )}

          {/* Subtle overlay gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 space-y-3">
          {/* Name + Badge */}
          <div className="flex items-start justify-between gap-2">
            <h2
              className="
                text-base md:text-lg font-semibold
                text-slate-900 dark:text-slate-50
                line-clamp-1
              "
            >
              {community.name}
            </h2>

            {memberCount > 0 && (
              <span
                className="
                  inline-flex items-center gap-1
                  rounded-full border border-slate-200 dark:border-slate-700
                  bg-white/70 dark:bg-slate-900/60
                  px-2 py-0.5
                  text-[11px] font-medium
                  text-slate-600 dark:text-slate-300
                "
              >
                <Users className="h-3 w-3" />
                {memberCount}{" "}
                <span className="hidden sm:inline">members</span>
              </span>
            )}
          </div>

          {/* Description */}
          {community.description && (
            <p
              className="
                text-xs md:text-sm
                text-slate-600 dark:text-slate-300
                leading-relaxed
                line-clamp-2
              "
            >
              {community.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-2">
              {community.members?.slice(0, 3).map((m) => (
                <div
                  key={m._id}
                  className="
                    h-7 w-7 rounded-full
                    bg-slate-200 dark:bg-slate-700
                    border border-white dark:border-slate-900
                    flex items-center justify-center
                    text-[10px] font-semibold
                    text-slate-700 dark:text-slate-100
                  "
                >
                  {m.name?.charAt(0).toUpperCase()}
                </div>
              ))}
              {memberCount > 3 && (
                <div
                  className="
                    h-7 w-7 rounded-full
                    bg-slate-100 dark:bg-slate-800
                    border border-dashed border-slate-300 dark:border-slate-600
                    flex items-center justify-center
                    text-[10px] text-slate-500 dark:text-slate-300
                  "
                >
                  +{memberCount - 3}
                </div>
              )}
            </div>

            <span
              className="
                text-[11px] md:text-xs
                inline-flex items-center gap-1
                px-3 py-1 rounded-full
                bg-slate-100 dark:bg-slate-800
                text-slate-700 dark:text-slate-200
                font-medium
                group-hover:bg-blue-50 group-hover:text-blue-700
                dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-300
                transition-colors
              "
            >
              Explore community
              <span className="text-xs">↗</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
