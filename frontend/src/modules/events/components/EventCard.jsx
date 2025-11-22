import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EventCard({ event }) {
  if (!event) return null;

  // Safeguards
  const dateValue = event.date ? new Date(event.date) : null;

  const formattedDate = dateValue
    ? dateValue.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : event.date || "Date TBA";

  const formattedDayMonth = dateValue
    ? dateValue.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "";

  const isPast = dateValue ? dateValue < new Date() : false;
  const statusLabel = isPast ? "Past Event" : "Upcoming";

  return (
    <Link to={`/events/${event._id}`} className="block group">
      <Card
        className="
          overflow-hidden border border-gray-200/70 dark:border-gray-700/70
          bg-white/80 dark:bg-gray-900/70
          shadow-sm hover:shadow-xl
          transition-all duration-200
          hover:-translate-y-1
          rounded-2xl
        "
      >
        {/* Banner + Date Badge */}
        <div className="relative w-full h-40 md:h-44 overflow-hidden">
          {event.banner ? (
            <img
              src={event.banner}
              alt={event.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white/90 font-semibold text-sm md:text-base">
                BCET Connect Event
              </span>
            </div>
          )}

          {/* Date pill */}
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 rounded-xl px-3 py-1 shadow-md flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
              {formattedDayMonth || formattedDate}
            </span>
          </div>

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                isPast
                  ? "bg-gray-800/85 text-gray-100"
                  : "bg-emerald-500/90 text-white"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <CardContent className="p-4 md:p-5 space-y-3">
          {/* Title & Category */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2
                className="
                  text-lg md:text-xl font-semibold 
                  text-gray-900 dark:text-gray-100 
                  group-hover:text-blue-600 dark:group-hover:text-blue-400
                  transition-colors
                  line-clamp-2
                "
              >
                {event.title}
              </h2>
              {event.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  {event.category.charAt(0).toUpperCase() +
                    event.category.slice(1)}
                </span>
              )}
            </div>
          </div>

          {/* Description (short preview) */}
          {event.description && (
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Meta info: location + date + time */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px] md:max-w-[200px]">
                  {event.location}
                </span>
              </div>
            )}

            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}

            {event.time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{event.time}</span>
              </div>
            )}
          </div>

          {/* Bottom CTA hint */}
          <div className="pt-1 flex items-center justify-between text-[11px] md:text-xs text-gray-400">
            <span>Tap to view details & register</span>
            <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              View Event →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
