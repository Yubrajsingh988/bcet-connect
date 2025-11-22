// src/modules/communities/pages/CommunitiesListPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/apiClient";
import CommunityCard from "../components/CommunityCard";
import { useAuth } from "../../../context/AuthContext";
import { Plus, Search, Users, Loader2 } from "lucide-react";

export default function CommunitiesListPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all | my | popular

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const res = await api.get("/communities");
      const data = res.data?.data || [];
      setCommunities(data);
      setFilteredCommunities(data);
    } catch (err) {
      console.error("Error loading communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  // Apply client-side filters + search
  useEffect(() => {
    let data = [...communities];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "my" && user?._id) {
      data = data.filter((c) =>
        c.members?.some((m) => m._id === user._id)
      );
    }

    if (activeFilter === "popular") {
      data = data
        .slice()
        .sort(
          (a, b) =>
            (b.members?.length || 0) - (a.members?.length || 0)
        );
    }

    setFilteredCommunities(data);
  }, [searchTerm, activeFilter, communities, user]);

  const totalCommunities = communities.length;
  const myCommunitiesCount =
    user && communities.length
      ? communities.filter((c) =>
          c.members?.some((m) => m._id === user._id)
        ).length
      : 0;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 px-4 py-6 md:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6 md:space-y-7">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Communities
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Discover & join communities
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Find interest-based spaces for{" "}
              <span className="font-medium">students, alumni, and mentors</span>{" "}
              across BCET Connect.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Link
              to="/communities/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create community</span>
            </Link>
          </div>
        </header>

        {/* Top stats + search + filters */}
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-4 md:px-5 md:py-4 shadow-sm shadow-slate-900/5 dark:shadow-black/30 backdrop-blur-sm">
          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4 text-slate-400" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {totalCommunities}
                </strong>{" "}
                total communities
                {user && (
                  <>
                    {" · "}
                    <strong className="text-slate-900 dark:text-slate-100">
                      {myCommunitiesCount}
                    </strong>{" "}
                    joined by you
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="w-full md:max-w-sm">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2.5">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search communities by name or description..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900 pl-9 pr-3 py-2.5 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter pills */}
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/70 p-1">
              <FilterPill
                label="All"
                value="all"
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              />
              <FilterPill
                label="My communities"
                value="my"
                active={activeFilter === "my"}
                onClick={() => setActiveFilter("my")}
              />
              <FilterPill
                label="Most active"
                value="popular"
                active={activeFilter === "popular"}
                onClick={() => setActiveFilter("popular")}
              />
            </div>
          </div>
        </section>

        {/* Communities Grid / Loading / Empty state */}
        <section className="space-y-4 md:space-y-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {[1, 2, 3].map((i) => (
                <SkeletonCommunityCard key={i} />
              ))}
            </div>
          ) : filteredCommunities.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {filteredCommunities.length}
                </span>{" "}
                community
                {filteredCommunities.length > 1 ? "ies" : ""} matching your
                filters.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
                {filteredCommunities.map((community) => (
                  <CommunityCard key={community._id} community={community} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Filter Pill Component
─────────────────────────────────────────────── */

function FilterPill({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[11px] md:text-xs font-medium transition ${
        active
          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
          : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900/60"
      }`}
    >
      {label}
    </button>
  );
}

/* ──────────────────────────────────────────────
   Skeleton Card (Loading state)
─────────────────────────────────────────────── */

function SkeletonCommunityCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm">
      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Empty State when no communities match
─────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
        No communities found
      </h2>
      <p className="mt-1 max-w-sm text-xs md:text-sm text-slate-500 dark:text-slate-400">
        Try changing your filters or create a new community for your interest,
        batch, or department.
      </p>

      <Link
        to="/communities/create"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
      >
        <Plus className="h-4 w-4" />
        <span>Start a community</span>
      </Link>
    </div>
  );
}
