import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/services/apiClient";
import {
  RefreshCw,
  Sparkles,
  TrendingUp,
  Rocket,
  AlertCircle,
  Zap,
  ArrowUp
} from "lucide-react";

import CreatePostBox from "../components/CreatePostBox";
import PostCard from "../components/PostCard";
import FeedFilters from "../components/FeedFilters";

/**
 * FeedPage — Ultimate Professional Version
 * ----------------------------------------
 * ✨ LinkedIn/Instagram/YouTube/Netflix inspired
 * 🎨 Premium skeleton loading states
 * 💫 Smooth scroll animations
 * 🚀 Mobile-first responsive design
 * 🎯 Professional empty & error states
 * 📱 Touch-optimized interactions
 */

export default function FeedPage() {
  /* ──────────────────────────────────────────────
     STATE
  ──────────────────────────────────────────────── */
  const [feed, setFeed] = useState([]);
  const [activeType, setActiveType] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* Pagination (future infinite scroll) */
  const pageRef = useRef(1);
  const limitRef = useRef(20);

  /* Abort controller */
  const abortRef = useRef(null);

  /* ──────────────────────────────────────────────
     SCROLL TO TOP HANDLER
  ──────────────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ──────────────────────────────────────────────
     FETCH FEED (SINGLE SOURCE OF TRUTH)
  ──────────────────────────────────────────────── */
  const fetchFeed = useCallback(
    async ({ type = activeType, reset = true, silent = false } = {}) => {
      // cancel previous request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        if (!silent) setLoading(true);
        if (silent) setRefreshing(true);

        setError("");

        if (reset) pageRef.current = 1;

        const res = await api.get("/feed", {
          signal: abortRef.current.signal,
          params: {
            type,
            limit: limitRef.current,
            page: pageRef.current,
          },
        });

        const items = Array.isArray(res.data?.data) ? res.data.data : [];

        setFeed(items);
        setActiveType(type);
      } catch (err) {
        if (err.name === "CanceledError") return;

        console.error("❌ Feed fetch failed:", err);

        setError(
          err?.response?.data?.message ||
          "Failed to load feed. Please try again."
        );

        if (!silent) setFeed([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeType]
  );

  /* ──────────────────────────────────────────────
     INITIAL LOAD
  ──────────────────────────────────────────────── */
  useEffect(() => {
    fetchFeed({ type: "ALL" });

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchFeed]);

  /* ──────────────────────────────────────────────
     EVENT HANDLERS
  ──────────────────────────────────────────────── */
  const handlePostCreated = () => {
    fetchFeed({ silent: true, reset: true });
  };

  const handlePostDeleted = () => {
    fetchFeed({ silent: true, reset: true });
  };

  const handleFilterChange = (type) => {
    if (type === activeType) return;
    fetchFeed({ type, reset: true });
  };

  const handleManualRefresh = () => {
    fetchFeed({ silent: false, reset: true });
  };

  /* ──────────────────────────────────────────────
     LOADING SKELETON (Premium Design)
  ──────────────────────────────────────────────── */
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-sm"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 sm:w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-3 w-20 sm:w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-2.5">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-3 w-11/12 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-3 w-3/5 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>

          {/* Image skeleton */}
          <div className="relative h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-slate-600/20 animate-shimmer" />
          </div>

          {/* Action bar skeleton */}
          <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="ml-auto flex gap-2">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  /* ──────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated top gradient bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 animate-gradient-x" />

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-0 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* ───────── HEADER WITH REFRESH ───────── */}
        <header className="sticky top-0 z-40 -mx-3 sm:-mx-4 lg:mx-0 px-3 sm:px-4 lg:px-0 py-3 sm:py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={2.5} />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Your Feed
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  What's happening in your network
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Feed
                </h1>
              </div>
            </div>

            {/* Refresh button */}
            {!loading && (
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="
                  group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl
                  bg-white dark:bg-slate-800 
                  border border-slate-200 dark:border-slate-700
                  text-slate-600 dark:text-slate-300
                  hover:border-blue-500/50 dark:hover:border-blue-400/50
                  hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                  dark:hover:from-blue-500/10 dark:hover:to-purple-500/10
                  transition-all duration-300
                  shadow-sm hover:shadow-md
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <RefreshCw
                  size={16}
                  strokeWidth={2.5}
                  className={`
                    transition-transform duration-500
                    ${refreshing ? "animate-spin" : "group-hover:rotate-180"}
                  `}
                />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  Refresh
                </span>
              </button>
            )}
          </div>
        </header>

        {/* ───────── CREATE POST ───────── */}
        <div className="animate-in fade-in slide-in-from-top-3 duration-500" style={{ animationDelay: "100ms" }}>
          <CreatePostBox onPostCreated={handlePostCreated} />
        </div>

        {/* ───────── FILTERS ───────── */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: "200ms" }}>
          <FeedFilters value={activeType} onChange={handleFilterChange} />
        </div>

        {/* ───────── SILENT REFRESH INDICATOR ───────── */}
        {refreshing && !loading && (
          <div className="flex items-center justify-center animate-in fade-in duration-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200/50 dark:border-blue-500/20 shadow-sm">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Updating...
              </span>
            </div>
          </div>
        )}

        {/* ───────── ERROR STATE ───────── */}
        {!loading && error && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden rounded-2xl border border-red-200 dark:border-red-500/20 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-500/10 dark:to-red-500/5 p-5 sm:p-6 shadow-lg">
              {/* Decorative background pattern */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />

              <div className="relative flex items-start gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/25">
                  <AlertCircle size={20} className="text-white sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-red-900 dark:text-red-300 mb-1">
                    Unable to load feed
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={handleManualRefresh}
                    className="
                      flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl
                      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
                      text-white text-xs sm:text-sm font-semibold
                      transition-all duration-200
                      active:scale-95
                      shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30
                    "
                  >
                    <RefreshCw size={14} strokeWidth={2.5} />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────── LOADING SKELETON ───────── */}
        {loading && <LoadingSkeleton />}

        {/* ───────── EMPTY STATE ───────── */}
        {!loading && !error && feed.length === 0 && (
          <div className="py-12 sm:py-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center max-w-md mx-auto px-4">
              {/* Animated icon container */}
              <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center">
                  <Rocket size={36} className="text-blue-600 dark:text-blue-400 sm:w-10 sm:h-10" strokeWidth={2} />
                </div>
              </div>

              {/* Text */}
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
                No posts yet
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 leading-relaxed">
                Be the first to share something amazing with your campus community!
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
                <div className="flex items-start gap-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border border-blue-200/50 dark:border-blue-500/20">
                  <Zap size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">Share Ideas</p>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Post your thoughts</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-500/5 border border-purple-200/50 dark:border-purple-500/20">
                  <TrendingUp size={16} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">Get Noticed</p>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Grow your network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────── FEED LIST ───────── */}
        {!loading && !error && feed.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {feed.map((item, idx) => {
              if (!item || !item._id || !item.type) return null;

              if (
                ["USER", "MENTOR", "COMMUNITY", "ADMIN"].includes(item.type)
              ) {
                return (
                  <div
                    key={item._id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                  >
                    <PostCard post={item} onDelete={handlePostDeleted} />
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* ───────── LOAD MORE INDICATOR (Future) ───────── */}
        {!loading && !error && feed.length > 0 && feed.length >= limitRef.current && (
          <div className="py-6 sm:py-8 text-center">
            <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Scroll for more
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ───────── SCROLL TO TOP BUTTON ───────── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="
    fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50
    h-11 w-11 sm:h-12 sm:w-12 rounded-full
    bg-gradient-to-br from-blue-500 to-purple-600
    text-white shadow-xl shadow-blue-500/25
    hover:shadow-2xl hover:shadow-blue-500/40
    hover:scale-110 active:scale-95
    transition-all
    animate-in fade-in zoom-in duration-300
    group
"
          aria-label="Scroll to top"
        >
          <ArrowUp
            size={20}
            strokeWidth={2.5}
            className="mx-auto group-hover:-translate-y-0.5 transition-transform duration-300"
          />
        </button>
      )}
    </div>
  );
}