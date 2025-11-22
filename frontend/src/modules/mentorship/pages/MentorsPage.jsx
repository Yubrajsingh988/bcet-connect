import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Users, Sparkles } from "lucide-react";
import api from "../../../services/apiClient";
import MentorCard from "../components/MentorCard";
import { Badge } from "@/components/ui/badge";

const ROLE_FILTERS = [
  { value: "all", label: "All" },
  { value: "alumni", label: "Alumni" },
  { value: "faculty", label: "Faculty" },
  { value: "industry", label: "Industry Mentor" },
];

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("");

  // ==========================
  // FETCH MENTORS
  // ==========================
  useEffect(() => {
    let isMounted = true;

    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/mentorship");
        if (!isMounted) return;

        const data = res.data?.data || [];
        setMentors(data);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Unable to load mentors. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMentors();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================
  // FILTER + SEARCH
  // ==========================
  const filteredMentors = useMemo(() => {
    return mentors
      .filter((m) => {
        if (roleFilter === "all") return true;

        const r = (m.role || m.userRole || "").toLowerCase();
        return r.includes(roleFilter);
      })
      .filter((m) => {
        if (!skillFilter.trim()) return true;
        const q = skillFilter.toLowerCase();
        return m.skills?.some((s) => s.toLowerCase().includes(q));
      })
      .filter((m) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();

        return (
          m.name?.toLowerCase().includes(q) ||
          m.company?.toLowerCase().includes(q) ||
          m.title?.toLowerCase().includes(q) ||
          m.industry?.toLowerCase().includes(q)
        );
      });
  }, [mentors, roleFilter, skillFilter, search]);

  // ==========================
  // LOADING SKELETON
  // ==========================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-900 mt-2 rounded-full animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>

        {/* Search + filters skeleton */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 h-9 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
          <div className="h-9 w-40 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
          <div className="h-9 w-40 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ==========================
  // MAIN UI
  // ==========================
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Find a Mentor
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Connect with alumni, faculty, and industry mentors for guidance on
            careers, projects, and higher studies.
          </p>
        </div>

        {/* Small stats badge */}
        <Badge className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800">
          <Sparkles className="w-3 h-3" />
          {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} available
        </Badge>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* SEARCH + FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search mentors by name, company, title, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          />
        </div>

        {/* Role filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-1">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {ROLE_FILTERS.map((r) => {
            const isActive = roleFilter === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRoleFilter(r.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Skill filter */}
        <div className="w-full md:w-56">
          <input
            type="text"
            placeholder="Filter by skill (e.g. React, ML)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* SMALL META ROW */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {filteredMentors.length}
          </span>{" "}
          mentor{filteredMentors.length !== 1 ? "s" : ""}
        </span>

        {(roleFilter !== "all" || skillFilter.trim()) && (
          <div className="flex flex-wrap items-center gap-2">
            {roleFilter !== "all" && (
              <Badge className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
                Role:{" "}
                {ROLE_FILTERS.find((r) => r.value === roleFilter)?.label ??
                  roleFilter}
              </Badge>
            )}
            {skillFilter.trim() && (
              <Badge className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800">
                Skill: {skillFilter}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* LIST / EMPTY STATE */}
      {filteredMentors.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
            No mentors found
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Try clearing filters or changing your search keywords. New mentors
            appear here as they join the network.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor._id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
