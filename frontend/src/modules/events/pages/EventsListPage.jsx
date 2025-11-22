import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/apiClient";
import EventCard from "../components/EventCard";
import { useAuth } from "../../../context/AuthContext";
import { Search, Filter, PlusCircle, CalendarDays, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "tech", label: "Tech" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "community", label: "Community" },
];

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [includePast, setIncludePast] = useState(false); // 🔥 NEW

  const navigate = useNavigate();
  const { user } = useAuth();

  // ==========================
  // LOAD EVENTS (PUBLIC API)
  // ==========================
  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔥 Important: use /events/public so that
        // approved events aaye without auth issues
        const res = await api.get("/events/public");
        if (!isMounted) return;

        const data = res.data?.data || [];
        console.log("📌 Events from API:", data);
        setEvents(data);
      } catch (err) {
        console.error("❌ Error fetching events:", err.response || err);
        if (isMounted) {
          setError("Unable to load events. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================
  // FILTER + SEARCH + SORT
  // ==========================
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter((event) => {
        if (!event.date) return true;

        const eventDate = new Date(event.date);
        if (!Number.isFinite(eventDate.getTime())) return true;

        // 🔥 If includePast = false -> sirf upcoming
        if (!includePast && eventDate < now) {
          return false;
        }
        return true;
      })
      .filter((event) => {
        if (category === "all") return true;
        const cat = (event.category || "general").toLowerCase();
        return cat === category;
      })
      .filter((event) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          event.title?.toLowerCase().includes(q) ||
          event.location?.toLowerCase().includes(q) ||
          event.description?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : Infinity;
        const db = b.date ? new Date(b.date).getTime() : Infinity;
        return da - db;
      });
  }, [events, search, category, includePast]);

  // ==========================
  // LOADING SKELETON
  // ==========================
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-900 mt-2 rounded-full animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 h-9 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
          <div className="h-9 w-40 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ==========================
  // MAIN RENDER
  // ==========================
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Events & Activities
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Discover college fests, tech talks, workshops and alumni meetups.
          </p>
        </div>

        {/* Create button – only non-students */}
        {user && user.role !== "student" && (
          <button
            onClick={() => navigate("/events/create")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* SEARCH + FILTERS + TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title, location, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-1">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* COUNT + BADGES + PAST-TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {filteredEvents.length}
            </span>{" "}
            event{filteredEvents.length !== 1 ? "s" : ""}
          </span>
          {category !== "all" && (
            <Badge className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
              Filter: {CATEGORIES.find((c) => c.value === category)?.label}
            </Badge>
          )}
        </div>

        {/* Include Past Toggle */}
        <button
          type="button"
          onClick={() => setIncludePast((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${
            includePast
              ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900"
              : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          }`}
        >
          <History className="w-3 h-3" />
          {includePast ? "Including past events" : "Upcoming only"}
        </button>
      </div>

      {/* LIST / EMPTY STATE */}
      {filteredEvents.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
            No events found
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Try changing filters, include past events, or adjust your search
            keywords.
          </p>

          {user && user.role !== "student" && (
            <button
              onClick={() => navigate("/events/create")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Create a new event
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mt-2">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
