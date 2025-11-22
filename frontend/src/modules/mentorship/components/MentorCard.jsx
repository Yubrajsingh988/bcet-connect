import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Sparkles } from "lucide-react";

export default function MentorCard({ mentor }) {
  const {
    _id,
    name,
    avatar,
    role,
    title,
    company,
    location,
    skills = [],
    yearsOfExperience,
    industry,
  } = mentor || {};

  const displayRole = title || role || "Mentor";
  const displayCompany = company || "";
  const displayLocation = location || "";
  const topSkills = skills.slice(0, 3);
  const extraSkillsCount = skills.length > 3 ? skills.length - 3 : 0;

  return (
    <Link to={`/mentorship/${_id}`} className="block group">
      <div className="relative h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden">
        {/* subtle gradient strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 opacity-80" />

        {/* BODY */}
        <div className="p-4 sm:p-5 pt-5 sm:pt-6 flex flex-col gap-4">
          {/* HEADER: Avatar + basic info */}
          <div className="flex gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-blue-100 dark:ring-blue-900/60 bg-gray-100 dark:bg-gray-800">
                <img
                  src={avatar || "/default-avatar.png"}
                  alt={name || "Mentor"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Availability dot (static green for now) */}
              <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
            </div>

            {/* Name + Role + Company */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-50 truncate">
                    {name || "Mentor"}
                  </h3>
                  {displayRole && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                      {displayRole}
                    </p>
                  )}
                </div>

                {/* Small badge on top right */}
                <Badge className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100 border border-blue-100 dark:border-blue-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Mentor
                </Badge>
              </div>

              {/* Company + location line */}
              {(displayCompany || displayLocation) && (
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                  {displayCompany && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span className="truncate max-w-[120px] sm:max-w-[160px]">
                        {displayCompany}
                      </span>
                    </span>
                  )}
                  {displayLocation && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px] sm:max-w-[140px]">
                        {displayLocation}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SKILLS */}
          {topSkills.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">
                Key Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800"
                  >
                    {skill}
                  </span>
                ))}
                {extraSkillsCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    +{extraSkillsCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* FOOTER INFO */}
          {(yearsOfExperience || industry) && (
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
              {yearsOfExperience && (
                <span>{yearsOfExperience}+ yrs experience</span>
              )}
              {industry && (
                <span className="truncate max-w-[120px] sm:max-w-[160px] text-right">
                  {industry}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover highlight border overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-blue-500/70 group-hover:shadow-blue-500/10 transition-all duration-200" />
      </div>
    </Link>
  );
}
