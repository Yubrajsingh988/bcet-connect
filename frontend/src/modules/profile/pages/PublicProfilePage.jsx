// src/modules/profile/pages/PublicProfilePage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../services/apiClient";
import ProfileHeader from "../components/ProfileHeader";
import { AlertCircle } from "lucide-react";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/user/${userId}`);
        if (!active) return;
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error("Public profile fetch error:", err);
        if (!active) return;
        setError(
          err.response?.data?.message ||
            "Unable to load profile. This user may be private or does not exist."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [userId]);

  // ============ LOADING SKELETON ============
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <div className="h-32 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-24 rounded-full bg-slate-100 dark:bg-slate-900 animate-pulse" />
              <div className="h-3 w-56 rounded-full bg-slate-100 dark:bg-slate-900 animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-900 animate-pulse" />
          <div className="h-3 w-2/3 rounded-full bg-slate-100 dark:bg-slate-900 animate-pulse" />
        </div>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-red-200/80 dark:border-red-900 bg-red-50/70 dark:bg-red-950/60 px-6 py-7 shadow-sm flex flex-col items-center text-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
          </div>
          <h1 className="text-lg font-semibold text-red-800 dark:text-red-100">
            Profile not available
          </h1>
          <p className="text-sm text-red-700/80 dark:text-red-200/80 max-w-md">
            {error ||
              "This profile could not be loaded. The user may be private, removed, or the link is incorrect."}
          </p>
        </div>
      </div>
    );
  }

  // ============ MAIN PUBLIC PROFILE VIEW ============
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* TOP GRADIENT STRIP (subtle hero background) */}
      <div className="h-32 md:h-40 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-sm" />

      {/* MAIN CARD */}
      <div className="-mt-20 md:-mt-24 relative">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 px-4 py-5 md:px-8 md:py-7 shadow-lg shadow-slate-900/5 dark:shadow-black/40 backdrop-blur">
          {/* Reuse your existing ProfileHeader (we'll upgrade that separately) */}
          <ProfileHeader profile={profile} />

          {/* Divider */}
          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mt-6 mb-4" />

          {/* ABOUT / META SECTION */}
          <div className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
            {/* About / Bio */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400">
                About
              </h3>
              {profile.bio ? (
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                  This user hasn&apos;t added a bio yet.
                </p>
              )}
            </div>

            {/* Quick meta */}
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Quick info
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.role && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-800 dark:text-slate-100">
                      {profile.role.charAt(0).toUpperCase() +
                        profile.role.slice(1)}
                    </span>
                  )}
                  {profile.currentRole && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-200">
                      {profile.currentRole}
                    </span>
                  )}
                  {profile.batch && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                      Batch {profile.batch}
                    </span>
                  )}
                  {profile.branch && (
                    <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/40 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-200">
                      {profile.branch}
                    </span>
                  )}
                </div>
              </div>

              {/* Public links hint (ProfileHeader already renders links; this is just note) */}
              {(profile.social?.linkedin || profile.social?.github) && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  External links (like LinkedIn or GitHub) are visible only if
                  the user has added them to their profile.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reserved area: future public sections (skills / portfolio / activity) */}
      {/* Example: 
        <PublicSkillsPreview skills={profile.skills} />
        <PublicPortfolioPreview items={profile.portfolio} />
      */}
    </div>
  );
}
