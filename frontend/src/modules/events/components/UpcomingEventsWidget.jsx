import { useEffect, useState } from "react";
import api from "../../../services/apiClient";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        const data = res.data.data || [];
        setEvents(data.slice(0, 4)); // show only first 4
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // IF LOADING → SKELETON
  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow p-4 space-y-3">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // IF NO EVENTS
  if (!events.length) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow p-6 text-center border border-dashed border-gray-300 dark:border-gray-700">
        <CalendarDays className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No upcoming events right now
        </p>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow p-5 border border-gray-100 dark:border-gray-800">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          Upcoming Events
        </h3>

        <button
          onClick={() => navigate("/events")}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* EVENTS LIST */}
      <div className="space-y-4">
        {events.map((e) => (
          <div
            key={e._id}
            onClick={() => navigate(`/events/${e._id}`)}
            className="cursor-pointer p-3 rounded-xl transition hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
          >
            <p className="font-semibold text-gray-800 dark:text-white">
              {e.title}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📍 {e.location || "Campus"}
            </p>

            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              📅 {new Date(e.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
