// src/modules/profile/components/ProfileHeader.jsx

import {
  MapPin,
  Building2,
  GraduationCap,
  Linkedin,
  Github,
  Globe2,
} from "lucide-react";

export default function ProfileHeader({ profile }) {
  if (!profile) return null;

  const {
    avatar,
    name,
    role,
    headline,
    bio,
    social = {},
    location,
    company,
    branch,
    batch,
    currentRole,
    portfolio = [],
    skills = [],
  } = profile;

  // -------- PROFILE STRENGTH (simple heuristic) --------
  const points = [
    !!headline,
    !!bio,
    skills?.length > 0,
    !!social.linkedin,
    !!social.github,
    portfolio?.length > 0,
  ].filter(Boolean).length;

  const strength = Math.min(100, (points / 6) * 100);
  let strengthLabel = "Getting started";
  if (strength >= 80) strengthLabel = "Profile looks great";
  else if (strength >= 50) strengthLabel = "Good progress";

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-7">
      {/* AVATAR */}
      <div className="shrink-0">
        <div className="relative">
          <img
            src={avatar || "/default-avatar.png"}
            alt={name || "User avatar"}
            className="h-24 w-24 md:h-28 md:w-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md shadow-slate-900/10 dark:shadow-black/40"
          />
          {/* Optional status dot */}
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-sm" />
        </div>
      </div>

      {/* MAIN INFO */}
      <div className="flex-1 space-y-3">
        {/* Name + Role line */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {name || "Unnamed User"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs md:text-[13px] text-slate-600 dark:text-slate-300">
            {currentRole || role ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 font-medium text-slate-800 dark:text-slate-100">
                {currentRole || (role && role[0].toUpperCase() + role.slice(1))}
              </span>
            ) : null}

            {company && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 font-medium text-blue-700 dark:text-blue-200">
                <Building2 className="w-3 h-3" />
                {company}
              </span>
            )}

            {(branch || batch) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-900/30 px-3 py-1 font-medium text-purple-700 dark:text-purple-200">
                <GraduationCap className="w-3 h-3" />
                {branch && <span>{branch}</span>}
                {branch && batch && <span>•</span>}
                {batch && <span>Batch {batch}</span>}
              </span>
            )}
          </div>
        </div>

        {/* Headline */}
        {headline && (
          <p className="text-sm md:text-[15px] font-medium text-slate-800 dark:text-slate-100">
            {headline}
          </p>
        )}

        {/* Bio */}
        {bio && (
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
            {bio}
          </p>
        )}

        {/* Location + counts row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </span>
          )}
          {skills?.length > 0 && (
            <span>{skills.length} skill{skills.length > 1 ? "s" : ""}</span>
          )}
          {portfolio?.length > 0 && (
            <span>
              {portfolio.length} project
              {portfolio.length > 1 ? "s" : ""} in portfolio
            </span>
          )}
        </div>

        {/* Social links */}
        {(social.linkedin || social.github || social.website) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 hover:border-sky-400 hover:bg-sky-50/70 dark:hover:bg-sky-950/40 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                LinkedIn
              </a>
            )}
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-800 dark:text-slate-100 hover:border-slate-400 hover:bg-slate-50/80 dark:hover:bg-slate-800 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
            )}
            {social.website && (
              <a
                href={social.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <Globe2 className="w-3.5 h-3.5" />
                Portfolio
              </a>
            )}
          </div>
        )}

        {/* Profile Strength */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span>Profile strength</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {strengthLabel} · {Math.round(strength)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500"
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
