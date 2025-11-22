// frontend/src/modules/profile/pages/PublicProfilePage.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import * as userService from "@/services/userService";

import ProfileHeader from "../components/ProfileHeader";
import { AlertCircle } from "lucide-react";

export default function PublicProfilePage() {
  const { id } = useParams(); // /users/:id
  const { user, authReady } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ──────────────────────────────────────────────
     FETCH PUBLIC PROFILE
  ──────────────────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const data = await userService.getPublicProfile(id);
      setProfile(data);
    } catch (err) {
      console.error("❌ Public profile fetch failed:", err);
      setError(
        err?.response?.data?.message ||
          "This profile is not available or does not exist."
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ──────────────────────────────────────────────
     EDGE CASE: VIEWING OWN PROFILE
  ──────────────────────────────────────────────── */
  if (authReady && user && user._id === id) {
    return <Navigate to="/profile/me" replace />;
  }

  /* ──────────────────────────────────────────────
     LOADING STATE
  ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="h-36 rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────
     ERROR / NOT FOUND
  ──────────────────────────────────────────────── */
  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="rounded-3xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 p-8 flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
          </div>

          <h2 className="text-lg font-semibold text-red-800 dark:text-red-100">
            Profile not available
          </h2>

          <p className="text-sm text-red-700 dark:text-red-200 max-w-md">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────
     MAIN PUBLIC PROFILE VIEW
  ──────────────────────────────────────────────── */
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="h-36 md:h-44 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />

      <div className="-mt-24 relative">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 shadow-lg">
          {/* Header (READ-ONLY) */}
          <ProfileHeader profile={profile} isOwner={false} />

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-6" />

          {/* ABOUT + META */}
          <div className="grid md:grid-cols-[2fr,1fr] gap-6">
            {/* ABOUT */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                About
              </h3>

              {profile.bio ? (
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  This user hasn’t added a bio yet.
                </p>
              )}
            </div>

            {/* META */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Profile info
              </h3>

              <div className="flex flex-wrap gap-2">
                {profile.role && (
                  <span className="chip">
                    {profile.role}
                  </span>
                )}
                {profile.department && (
                  <span className="chip chip-blue">
                    {profile.department}
                  </span>
                )}
                {profile.batch && (
                  <span className="chip chip-green">
                    Batch {profile.batch}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase-4+ public sections (future safe) */}
      {/*
        <PublicSkills skills={profile.skills} />
        <PublicPortfolio items={profile.portfolio} />
        <PublicExperience experience={profile.experience} />
      */}
    </div>
  );
}
