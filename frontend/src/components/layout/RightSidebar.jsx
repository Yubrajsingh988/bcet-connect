// frontend/src/components/layout/RightSidebar.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/apiClient"; // make sure this exists and has baseURL + auth header
import { Clock, Briefcase, User, ExternalLink } from "lucide-react";

/**
 * RightSidebar
 * - shows AI Suggestions: recommended jobs, mentors, upcoming events
 * - hidden on small screens (uses xl:block)
 *
 * Notes:
 *  - Replace endpoints below with your backend routes if different:
 *      GET /jobs/recommended
 *      GET /mentors/recommended
 *      GET /events/recommended
 *  - api should be axios instance that sets Authorization header.
 */

const ACCENT_FROM = "from-emerald-600";
const ACCENT_TO = "to-teal-500";
const ACCENT_GRADIENT_SOFT = `bg-gradient-to-br ${ACCENT_FROM}/8 ${ACCENT_TO}/8`;
const ACCENT_TEXT = "text-emerald-600 dark:text-emerald-400";

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

const WidgetCard = ({ title, children, footer }) => (
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
    <div className={`px-4 py-3 ${ACCENT_GRADIENT_SOFT} border-b border-transparent`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
      </div>
    </div>
    <div className="p-3">{children}</div>
    {footer && <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">{footer}</div>}
  </div>
);

export default function RightSidebar() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [mentors, setMentors] = useState(null);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState({ jobs: false, mentors: false, events: false });
  const [error, setError] = useState({ jobs: null, mentors: null, events: null });

  // Only render for authenticated users
  if (!user) return null;

  const fetchJobs = useCallback(async (signal) => {
    setLoading((s) => ({ ...s, jobs: true }));
    setError((s) => ({ ...s, jobs: null }));
    try {
      // Replace endpoint if your backend uses a different route
      const res = await api.get("/jobs/recommended", { signal });
      setJobs(res.data?.data || []);
    } catch (err) {
      if (err.name !== "CanceledError") setError((s) => ({ ...s, jobs: "Failed to load jobs" }));
    } finally {
      setLoading((s) => ({ ...s, jobs: false }));
    }
  }, []);

  const fetchMentors = useCallback(async (signal) => {
    setLoading((s) => ({ ...s, mentors: true }));
    setError((s) => ({ ...s, mentors: null }));
    try {
      // Replace endpoint if different
      const res = await api.get("/mentors/recommended", { signal });
      setMentors(res.data?.data || []);
    } catch (err) {
      if (err.name !== "CanceledError") setError((s) => ({ ...s, mentors: "Failed to load mentors" }));
    } finally {
      setLoading((s) => ({ ...s, mentors: false }));
    }
  }, []);

  const fetchEvents = useCallback(async (signal) => {
    setLoading((s) => ({ ...s, events: true }));
    setError((s) => ({ ...s, events: null }));
    try {
      // Replace endpoint if different
      const res = await api.get("/events/recommended", { signal, params: { upcoming: true, limit: 5 } });
      setEvents(res.data?.data || []);
    } catch (err) {
      if (err.name !== "CanceledError") setError((s) => ({ ...s, events: "Failed to load events" }));
    } finally {
      setLoading((s) => ({ ...s, events: false }));
    }
  }, []);

  // fetch when mounted (and when user changes)
  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(controller.signal);
    fetchMentors(controller.signal);
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [fetchJobs, fetchMentors, fetchEvents, user?.id]);

  const jobItems = useMemo(() => jobs || [], [jobs]);
  const mentorItems = useMemo(() => mentors || [], [mentors]);
  const eventItems = useMemo(() => events || [], [events]);

  return (
    <aside className="hidden xl:block w-80 pl-6">
      <div className="sticky top-20 space-y-4">
        {/* AI Intro */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-600 text-white">
              <Briefcase size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Suggestions</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personalized jobs, mentors, events and learning based on your profile.
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        <WidgetCard
          title="Recommended Jobs"
          footer={
            <div className="flex items-center justify-between">
              <a className="text-xs text-emerald-600 hover:underline flex items-center gap-1" href="/jobs">
                See all <ExternalLink size={12} />
              </a>
              <span className="text-[11px] text-gray-400">based on skills</span>
            </div>
          }
        >
          {loading.jobs ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error.jobs ? (
            <div className="text-xs text-red-500">{error.jobs}</div>
          ) : jobItems.length === 0 ? (
            <div className="text-xs text-gray-500">No recommended jobs yet — update your profile to get better suggestions.</div>
          ) : (
            <ul className="space-y-3">
              {jobItems.slice(0, 3).map((j) => (
                <li key={j._id || j.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-emerald-600">
                    <Briefcase size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{j.title || j.role}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{j.company || j.organization}</div>
                  </div>
                  <div className="text-xs text-gray-400">{j.postedAt ? <time dateTime={j.postedAt}>{new Date(j.postedAt).toLocaleDateString()}</time> : null}</div>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        {/* Recommended Mentors */}
        <WidgetCard
          title="Recommended Mentors"
          footer={
            <div className="flex items-center justify-between">
              <a className="text-xs text-emerald-600 hover:underline flex items-center gap-1" href="/mentors">
                View mentors <ExternalLink size={12} />
              </a>
              <span className="text-[11px] text-gray-400">based on interests</span>
            </div>
          }
        >
          {loading.mentors ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error.mentors ? (
            <div className="text-xs text-red-500">{error.mentors}</div>
          ) : mentorItems.length === 0 ? (
            <div className="text-xs text-gray-500">No mentor suggestions yet — try updating your interests.</div>
          ) : (
            <ul className="space-y-3">
              {mentorItems.slice(0, 3).map((m) => (
                <li key={m._id || m.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-emerald-600 font-semibold">
                    {m.name?.charAt(0)?.toUpperCase() || "M"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{m.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.headline || m.role || "Mentor"}</div>
                  </div>
                  <button
                    onClick={() => window.location.assign(`/mentors/${m._id || m.id}`)}
                    className="text-xs px-2 py-1 rounded-md border border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                    aria-label={`View ${m.name}`}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        {/* Upcoming Events */}
        <WidgetCard
          title="Upcoming Events"
          footer={
            <div className="flex items-center justify-between">
              <a className="text-xs text-emerald-600 hover:underline flex items-center gap-1" href="/events">
                All events <ExternalLink size={12} />
              </a>
              <span className="text-[11px] text-gray-400">upcoming</span>
            </div>
          }
        >
          {loading.events ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error.events ? (
            <div className="text-xs text-red-500">{error.events}</div>
          ) : eventItems.length === 0 ? (
            <div className="text-xs text-gray-500">No upcoming events — check back later.</div>
          ) : (
            <ul className="space-y-3">
              {eventItems.slice(0, 4).map((e) => (
                <li key={e._id || e.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-emerald-600">
                      <Clock size={14} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{e.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span className="truncate">{e.location}</span>
                      <span>•</span>
                      <time className="truncate">{e.date ? new Date(e.date).toLocaleDateString() : "TBD"}</time>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>
    </aside>
  );
}
