import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { 
  RefreshCw, 
  AlertCircle, 
  Sparkles,
  TrendingUp,
  Award,
  Target
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import * as userService from "@/services/userService";

import ProfileHeader from "../components/ProfileHeader";
import SkillsSection from "../components/SkillsSection";
import EducationSection from "../components/EducationSection";
import ExperienceSection from "../components/ExperienceSection";
import PortfolioGrid from "../components/PortfolioGrid";
import ResumeSection from "../components/ResumeSection";

/**
 * MyProfilePage — Enhanced Professional Edition
 * ------------------------------------------------
 * - Beautiful loading states with staggered animations
 * - Enhanced error handling with retry button
 * - Profile completion insights with dynamic badges
 * - Smooth transitions between all states
 * - Responsive 2-column layout for Education/Experience
 * - Premium gradient backgrounds and animations
 */

export default function MyProfilePage() {
  const { user, authReady } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ──────────────────────────────────────────────
     FETCH PROFILE (Single Source of Truth)
  ──────────────────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getMyProfile();
      setProfile(data);
    } catch (err) {
      console.error("❌ Profile fetch failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load profile"
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    fetchProfile();
  }, [authReady, user, fetchProfile]);

  /* ──────────────────────────────────────────────
     GENERIC PROFILE UPDATE
  ──────────────────────────────────────────────── */
  const handleUpdateProfile = async (patch) => {
    try {
      const updated = await userService.updateProfile(patch);
      setProfile(updated);
    } catch (err) {
      console.error("❌ Profile update failed:", err);
      fetchProfile();
    }
  };

  /* ──────────────────────────────────────────────
     AVATAR
  ──────────────────────────────────────────────── */
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    try {
      const updated = await userService.uploadAvatar(file);
      setProfile(updated);
    } catch (err) {
      console.error("❌ Avatar upload failed:", err);
      fetchProfile();
    }
  };

  /* ──────────────────────────────────────────────
     RESUME
  ──────────────────────────────────────────────── */
  const handleResumeUpload = async (file) => {
    if (!file) return;
    try {
      const updated = await userService.uploadResume(file);
      setProfile(updated);
    } catch (err) {
      console.error("❌ Resume upload failed:", err);
      fetchProfile();
    }
  };

  const handleResumeDelete = async () => {
    try {
      const updated = await userService.updateProfile({ resume: "" });
      setProfile(updated);
    } catch (err) {
      console.error("❌ Resume delete failed:", err);
      fetchProfile();
    }
  };

  /* ──────────────────────────────────────────────
     SKILLS
  ──────────────────────────────────────────────── */
  const handleAddSkill = async (skill) => {
    try {
      const updated = await userService.addSkill(
        profile.skills || [],
        skill
      );
      setProfile(updated);
    } catch (err) {
      console.error("❌ Add skill failed:", err);
      fetchProfile();
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      const updated = await userService.removeSkill(
        profile.skills || [],
        skill
      );
      setProfile(updated);
    } catch (err) {
      console.error("❌ Remove skill failed:", err);
      fetchProfile();
    }
  };

  /* ──────────────────────────────────────────────
     EDUCATION
  ──────────────────────────────────────────────── */
  const handleAddEducation = async (item) => {
    try {
      const updated = await userService.updateProfile({
        education: [...(profile.education || []), item],
      });
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  const handleUpdateEducation = async (index, item) => {
    try {
      const next = [...profile.education];
      next[index] = item;
      const updated = await userService.updateProfile({ education: next });
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  const handleRemoveEducation = async (index) => {
    try {
      const next = profile.education.filter((_, i) => i !== index);
      const updated = await userService.updateProfile({ education: next });
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  /* ──────────────────────────────────────────────
     EXPERIENCE
  ──────────────────────────────────────────────── */
  const handleAddExperience = async (item) => {
    try {
      const updated = await userService.updateProfile({
        experience: [...(profile.experience || []), item],
      });
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  const handleUpdateExperience = async (index, item) => {
    try {
      const next = [...profile.experience];
      next[index] = item;
      const updated = await userService.updateProfile({ experience: next });
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  const handleRemoveExperience = async (index) => {
    try {
      const next = profile.experience.filter((_, i) => i !== index);
      const updated = await userService.updateProfile({ experience: next });
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  /* ──────────────────────────────────────────────
     PORTFOLIO
  ──────────────────────────────────────────────── */
  const handleAddProject = async (project) => {
    try {
      const updated = await userService.addPortfolioProject(
        profile.portfolio || [],
        project
      );
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  const handleEditProject = async (id, patch) => {
    try {
      const updated = await userService.updatePortfolioProject(
        profile.portfolio || [],
        id,
        patch
      );
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const updated = await userService.deletePortfolioProject(
        profile.portfolio || [],
        id
      );
      setProfile(updated);
    } catch {
      fetchProfile();
    }
  };

  /* ──────────────────────────────────────────────
     AUTH GUARDS
  ──────────────────────────────────────────────── */
  if (authReady && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!authReady || loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchProfile} />;
  }

  if (!profile) {
    return <NotFoundState />;
  }

  /* ──────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-10">
        {/* Page Header */}
        <PageHeader profile={profile} />

        {/* Profile Content */}
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ProfileHeader
            profile={profile}
            isOwner
            onAvatarUpload={handleAvatarUpload}
            onUpdateProfile={handleUpdateProfile}
          />

          <SkillsSection
            skills={profile.skills}
            isOwner
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <EducationSection
              education={profile.education}
              isOwner
              onAdd={handleAddEducation}
              onUpdate={handleUpdateEducation}
              onRemove={handleRemoveEducation}
            />

            <ExperienceSection
              experience={profile.experience}
              isOwner
              onAdd={handleAddExperience}
              onUpdate={handleUpdateExperience}
              onRemove={handleRemoveExperience}
            />
          </div>

          <PortfolioGrid
            items={profile.portfolio}
            isOwner
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />

          <ResumeSection
            resume={profile.resume}
            isOwner
            onUpload={handleResumeUpload}
            onDelete={handleResumeDelete}
          />
        </div>

        {/* Footer Spacer */}
        <div className="h-12" />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PAGE HEADER
──────────────────────────────────────────────── */

function PageHeader({ profile }) {
  const completeness = profile?.profileCompleteness || 0;
  
  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              My Profile
            </h1>
            {completeness >= 80 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg animate-in zoom-in duration-300">
                <Award className="w-3.5 h-3.5" />
                Complete
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            Manage your professional presence
          </p>
        </div>

        {completeness < 80 && (
          <div className="hidden md:block">
            <ProfileInsight completeness={completeness} />
          </div>
        )}
      </div>

      {/* Mobile insight */}
      {completeness < 80 && (
        <div className="md:hidden mb-6">
          <ProfileInsight completeness={completeness} />
        </div>
      )}
    </div>
  );
}

function ProfileInsight({ completeness }) {
  const getInsight = () => {
    if (completeness >= 60) return { icon: TrendingUp, text: "Almost there!", color: "blue" };
    if (completeness >= 30) return { icon: Target, text: "Keep building", color: "purple" };
    return { icon: Sparkles, text: "Get started", color: "indigo" };
  };

  const insight = getInsight();
  const Icon = insight.icon;

  const colors = {
    blue: "from-blue-500 to-cyan-600 shadow-blue-500/30",
    purple: "from-purple-500 to-pink-600 shadow-purple-500/30",
    indigo: "from-indigo-500 to-purple-600 shadow-indigo-500/30",
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${colors[insight.color]} text-white text-xs md:text-sm font-semibold shadow-lg animate-pulse`}>
      <Icon className="w-4 h-4" />
      {insight.text} · {completeness}%
    </div>
  );
}

/* ──────────────────────────────────────────────
   LOADING STATE
──────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header skeleton */}
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="h-10 w-48 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl animate-pulse" />
          <div className="h-5 w-64 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-xl animate-pulse" />
        </div>

        {/* Content skeletons with staggered animation */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-3xl bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ERROR STATE
──────────────────────────────────────────────── */

function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="relative rounded-3xl border-2 border-red-200 dark:border-red-900/30 bg-white dark:bg-slate-900 p-8 text-center space-y-6 overflow-hidden shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
          
          <div className="relative space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 shadow-lg">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>

            {/* Action */}
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   NOT FOUND STATE
──────────────────────────────────────────────── */

function NotFoundState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-xl">
            <AlertCircle className="w-10 h-10 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Profile Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            We couldn't load your profile data.
          </p>
        </div>
      </div>
    </div>
  );
}