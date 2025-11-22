// src/modules/jobs/components/JobCard.jsx
import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  IndianRupee,
} from "lucide-react";

export default function JobCard({ job }) {
  // Safe fallbacks
  const {
    _id,
    title,
    company,
    location,
    employmentType,
    mode,
    skills = [],
    salaryRange,
  } = job || {};

  const initials = company?.charAt(0)?.toUpperCase() || title?.charAt(0)?.toUpperCase() || "J";

  // Optional salary formatting (defensive)
  let salaryText = null;
  if (salaryRange && (salaryRange.min || salaryRange.max)) {
    const min = salaryRange.min ? `${salaryRange.min}` : null;
    const max = salaryRange.max ? `${salaryRange.max}` : null;

    if (min && max) salaryText = `₹${min} – ₹${max}`;
    else if (min) salaryText = `From ₹${min}`;
    else if (max) salaryText = `Up to ₹${max}`;
  }

  return (
    <Link to={`/jobs/${_id}`} className="block">
      <article
        className="
          group relative overflow-hidden
          rounded-2xl border border-gray-200 dark:border-gray-800
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm
          shadow-sm hover:shadow-xl hover:-translate-y-0.5
          transition-all duration-200 cursor-pointer
        "
      >
        {/* Top section */}
        <div className="p-4 sm:p-5 flex gap-4">
          {/* Company Avatar */}
          <div
            className="
              flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14
              rounded-2xl bg-gradient-to-br from-primary to-secondary
              flex items-center justify-center
              text-white font-bold text-lg shadow-md
            "
          >
            {initials}
          </div>

          {/* Main Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">
                  {title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {company && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 size={14} />
                      <span className="truncate">{company}</span>
                    </span>
                  )}
                  {location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} />
                        <span className="truncate">{location}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Type Badge */}
              {employmentType && (
                <span
                  className="
                    inline-flex items-center px-2.5 py-1
                    rounded-full text-[10px] sm:text-xs font-semibold
                    bg-blue-50 text-blue-700
                    dark:bg-blue-950 dark:text-blue-300
                    border border-blue-100 dark:border-blue-900
                  "
                >
                  <Briefcase size={12} className="mr-1" />
                  {employmentType}
                </span>
              )}
            </div>

            {/* Mode + Salary */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {mode && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800/70">
                  <Clock size={12} />
                  {mode}
                </span>
              )}

              {salaryText && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <IndianRupee size={12} />
                  {salaryText}
                </span>
              )}
            </div>

            {/* Skills Chips */}
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="
                      inline-flex items-center px-3 py-1
                      rounded-full text-[11px] sm:text-xs font-medium
                      bg-primary/5 text-primary
                      dark:bg-primary/15 dark:text-primary-foreground/90
                      group-hover:bg-primary/10
                      transition-colors
                    "
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                    +{skills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer strip */}
        <div
          className="
            px-4 sm:px-5 py-2.5
            border-t border-gray-100 dark:border-gray-800/80
            flex items-center justify-between text-[11px] sm:text-xs
            text-gray-500 dark:text-gray-400
            bg-gray-50/70 dark:bg-gray-900/70
          "
        >
          <span>Tap to view details</span>
          <span className="font-medium text-primary group-hover:underline">
            View & Apply →
          </span>
        </div>
      </article>
    </Link>
  );
}
