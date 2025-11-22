// src/modules/admin/pages/AdminDashboardPage.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/apiClient";
import StatCard from "../components/StatCard.jsx";
import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  CalendarDays,
  Activity,
  ShieldCheck,
  ArrowRight,
  RefreshCcw,
} from "lucide-react";

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const res = await api.get("/admin/analytics");
      setAnalytics(res.data.data);
    } catch (err) {
      console.error("Admin analytics load error:", err);
      setError("Failed to load dashboard insights. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totals = {
    totalUsers: analytics?.totalUsers ?? 0,
    totalAlumni: analytics?.totalAlumni ?? 0,
    totalStudents: analytics?.totalStudents ?? 0,
    jobsApproved: analytics?.jobsApproved ?? 0,
    eventsApproved: analytics?.eventsApproved ?? 0,
  };

  const alumniShare =
    totals.totalUsers > 0
      ? Math.round((totals.totalAlumni / totals.totalUsers) * 100)
      : 0;

  const studentShare =
    totals.totalUsers > 0
      ? Math.round((totals.totalStudents / totals.totalUsers) * 100)
      : 0;

  const statCards = [
    {
      title: "Total Users",
      value: totals.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: "bg-slate-50 dark:bg-slate-950/40",
      textColor: "text-slate-700 dark:text-slate-100",
    },
    {
      title: "Alumni",
      value: totals.totalAlumni,
      icon: <GraduationCap className="h-5 w-5" />,
      color: "bg-emerald-50 dark:bg-emerald-950/40",
      textColor: "text-emerald-700 dark:text-emerald-200",
    },
    {
      title: "Students",
      value: totals.totalStudents,
      icon: <Activity className="h-5 w-5" />,
      color: "bg-sky-50 dark:bg-sky-950/40",
      textColor: "text-sky-700 dark:text-sky-200",
    },
    {
      title: "Approved Jobs",
      value: totals.jobsApproved,
      icon: <BriefcaseBusiness className="h-5 w-5" />,
      color: "bg-indigo-50 dark:bg-indigo-950/40",
      textColor: "text-indigo-700 dark:text-indigo-200",
    },
    {
      title: "Approved Events",
      value: totals.eventsApproved,
      icon: <CalendarDays className="h-5 w-5" />,
      color: "bg-orange-50 dark:bg-orange-950/40",
      textColor: "text-orange-700 dark:text-orange-200",
    },
  ];

  const isInitialLoading = loading && !analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              Admin Control Center
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
          </div>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Get a quick snapshot of users, jobs, and events across the BCET
            Connect platform. Use quick actions to moderate and manage faster.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {error && (
            <span className="hidden md:inline text-[11px] text-red-500 dark:text-red-400">
              {error}
            </span>
          )}
          <button
            type="button"
            onClick={() => loadAnalytics(true)}
            className="
              inline-flex items-center gap-1.5
              rounded-full border border-slate-200 dark:border-slate-800
              bg-white/80 dark:bg-slate-950/80
              px-3 py-1.5
              text-xs font-medium text-slate-600 dark:text-slate-300
              shadow-sm
              hover:bg-slate-50 dark:hover:bg-slate-900
              transition-colors
            "
          >
            <RefreshCcw
              className={`h-3.5 w-3.5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 shadow-sm animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 w-14 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
          {statCards.map((s, idx) => (
            <StatCard
              key={idx}
              title={s.title}
              value={s.value}
              icon={s.icon}
              color={s.color}
              textColor={s.textColor}
            />
          ))}
        </div>
      )}

      {/* Middle Row: Snapshot + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* System Snapshot */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Platform Snapshot
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Auto-generated from latest analytics
            </span>
          </div>

          {analytics ? (
            <div className="space-y-4">
              {/* Users distribution */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    User distribution
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {totals.totalUsers} total users
                  </p>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500/80 dark:bg-emerald-500"
                    style={{ width: `${alumniShare}%` }}
                  />
                  <div
                    className="h-full bg-sky-500/80 dark:bg-sky-500 -mt-2.5"
                    style={{ width: `${studentShare}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Alumni: {alumniShare}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    Students: {studentShare}%
                  </span>
                </div>
              </div>

              {/* Activity summary list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] md:text-xs">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                  <p className="font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    Talent activity
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {totals.jobsApproved} jobs are currently visible to
                    students & alumni.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                  <p className="font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    Engagement
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {totals.eventsApproved} approved events are driving campus &
                    alumni interactions.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                  <p className="font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    Governance
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Use jobs & events approval queues to keep the platform
                    high-quality and safe.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No analytics data available yet.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 shadow-sm p-4 md:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Quick actions
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Jump directly into the most important admin workflows.
          </p>

          <div className="flex flex-col gap-2 mt-1 text-xs">
            <Link
              to="/admin/jobs-approval"
              className="
                group inline-flex items-center justify-between
                rounded-xl border border-slate-100 dark:border-slate-800
                bg-slate-50/70 dark:bg-slate-950/60
                px-3 py-2
                hover:bg-slate-100 dark:hover:bg-slate-900
                transition-colors
              "
            >
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 dark:text-slate-100">
                    Review pending jobs
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Approve or reject newly submitted job posts.
                  </span>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/admin/events"
              className="
                group inline-flex items-center justify-between
                rounded-xl border border-slate-100 dark:border-slate-800
                bg-slate-50/70 dark:bg-slate-950/60
                px-3 py-2
                hover:bg-slate-100 dark:hover:bg-slate-900
                transition-colors
              "
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 dark:text-slate-100">
                    Manage events
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Approve, reject, or update campus & alumni events.
                  </span>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/admin/users"
              className="
                group inline-flex items-center justify-between
                rounded-xl border border-slate-100 dark:border-slate-800
                bg-slate-50/70 dark:bg-slate-950/60
                px-3 py-2
                hover:bg-slate-100 dark:hover:bg-slate-900
                transition-colors
              "
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 dark:text-slate-100">
                    Manage users & roles
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Promote alumni, assign admins, or deactivate accounts.
                  </span>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/admin/analytics"
              className="
                group inline-flex items-center justify-between
                rounded-xl border border-slate-100 dark:border-slate-800
                bg-slate-50/70 dark:bg-slate-950/60
                px-3 py-2
                hover:bg-slate-100 dark:hover:bg-slate-900
                transition-colors
              "
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 dark:text-slate-100">
                    Open full analytics
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Deep dive into engagement & growth trends.
                  </span>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {error && (
            <p className="mt-2 text-[11px] text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
