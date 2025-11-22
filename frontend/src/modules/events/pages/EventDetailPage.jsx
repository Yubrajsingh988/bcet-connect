import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/apiClient";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);

  // ==========================
  // LOAD EVENT DETAILS
  // ==========================
  useEffect(() => {
    let isMounted = true;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/events/${id}`);
        if (isMounted) {
          setEvent(res.data.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Unable to load event details. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // ==========================
  // DERIVED VALUES
  // ==========================
  const dateValue = event?.date ? new Date(event.date) : null;

  const formattedDate = dateValue
    ? dateValue.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : event?.date || "Date TBA";

  const isPast = dateValue ? dateValue < new Date() : false;

  const categoryLabel = event?.category
    ? event.category.charAt(0).toUpperCase() + event.category.slice(1)
    : "General";

  // ==========================
  // REGISTER HANDLER
  // ==========================
  const handleRegister = async () => {
    if (!id || registering) return;
    setRegistering(true);

    try {
      await api.post(`/events/${id}/register`);
      alert("Registered for event 🎉");
    } catch (err) {
      console.error(err);
      alert("Failed to register. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  // ==========================
  // LOADING SKELETON
  // ==========================
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-52 md:h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="grid md:grid-cols-[2fr,1fr] gap-6 mt-4">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            </div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // ERROR STATE
  // ==========================
  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500 font-medium mb-2">
          {error || "Event not found."}
        </p>
        <button
          onClick={() => navigate("/events")}
          className="mt-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700 transition"
        >
          Back to Events
        </button>
      </div>
    );
  }

  // ==========================
  // MAIN RENDER
  // ==========================
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to events</span>
      </button>

      {/* HERO BANNER */}
      <div className="relative w-full h-52 md:h-64 overflow-hidden rounded-2xl shadow-lg">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white/90 font-semibold text-lg">
              {event.title}
            </span>
          </div>
        )}

        {/* Category + Status badge on banner */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <Badge className="bg-white/95 text-gray-900 text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {categoryLabel}
          </Badge>
          <Badge
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              isPast
                ? "bg-gray-900/90 text-gray-100"
                : "bg-emerald-500/95 text-white"
            }`}
          >
            {isPast ? "Past Event" : "Upcoming"}
          </Badge>
        </div>
      </div>

      {/* CONTENT + SIDEBAR */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(260px,1fr)]">
        {/* LEFT: MAIN INFO */}
        <Card className="bg-white/80 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 shadow-md rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
              {event.title}
            </CardTitle>

            <CardDescription className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {formattedDate}
              </span>
              {event.time && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </span>
              )}
              {event.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Description */}
            <section>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                About this event
              </h3>
              <p className="text-sm md:text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {event.description}
              </p>
            </section>

            {/* Optional extra info placeholders */}
            <section className="grid md:grid-cols-2 gap-4 text-sm">
              {event.host && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Hosted By
                  </h4>
                  <p className="text-gray-800 dark:text-gray-100">
                    {event.host}
                  </p>
                </div>
              )}

              {event.capacity && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Capacity
                  </h4>
                  <p className="flex items-center gap-1 text-gray-800 dark:text-gray-100">
                    <Users className="w-4 h-4" />
                    {event.capacity} attendees
                  </p>
                </div>
              )}
            </section>
          </CardContent>
        </Card>

        {/* RIGHT: REGISTER SIDEBAR */}
        <div className="md:sticky md:top-24 space-y-4">
          <Card className="bg-white/90 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl">
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Event Details
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check the schedule and location, then reserve your spot.
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>{formattedDate}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRegister}
                disabled={registering || isPast}
                className={`w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition ${
                  isPast
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-70`}
              >
                {isPast
                  ? "Event has ended"
                  : registering
                  ? "Registering..."
                  : "Register Now"}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
