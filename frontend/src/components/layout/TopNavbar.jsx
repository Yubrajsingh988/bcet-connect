// frontend/src/components/layout/TopNavbar.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Sparkles,
  MessageCircle,
  Calendar,
  Briefcase,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import useDebounce from "@/hooks/useDebounce";
import useChat from "@/hooks/useChat";
import useNotifications from "@/hooks/useNotifications";
import searchService from "@/services/searchService";
import { Button } from "@/components/ui/button";

const ACCENT_FROM = "from-emerald-600";
const ACCENT_TO = "to-teal-500";
const ACCENT_GRADIENT = `bg-gradient-to-br ${ACCENT_FROM} ${ACCENT_TO}`;
const ACCENT_GRADIENT_SOFT = `bg-gradient-to-br ${ACCENT_FROM}/10 ${ACCENT_TO}/10`;

export default function TopNavbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { toggleSidebar, toggleRightSidebar } = useUI();
  const navigate = useNavigate();

  // search
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 400);
  const [suggestions, setSuggestions] = useState({ users: [], jobs: [], events: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1); // linearized index for keyboard nav
  const flattenedSuggestions = useMemo(() => {
    const flat = [];
    suggestions.users.forEach((u) => flat.push({ type: "user", item: u }));
    suggestions.jobs.forEach((j) => flat.push({ type: "job", item: j }));
    suggestions.events.forEach((e) => flat.push({ type: "event", item: e }));
    return flat;
  }, [suggestions]);

  // chat + notifications
  const chat = useChat(); // { socket, on, off, getConversations, sendMessage, connected }
  const socket = chat.socket;
  const { notifications, unread, markRead, markAllRead } = useNotifications(socket || undefined);

  // local preview for messages
  const [conversations, setConversations] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  // fetch search suggestions on debouncedQ
  useEffect(() => {
    let mounted = true;
    if (!debouncedQ || debouncedQ.trim().length === 0) {
      if (mounted) {
        setSuggestions({ users: [], jobs: [], events: [] });
        setShowSuggestions(false);
      }
      return;
    }
    (async () => {
      try {
        const res = await searchService.globalSearch(debouncedQ, { limit: 5 });
        // backend returns { users, jobs, events, communities } -> adapt
        if (!mounted) return;
        setSuggestions({
          users: res.data?.data?.users || res.data?.users || [],
          jobs: res.data?.data?.jobs || res.data?.jobs || [],
          events: res.data?.data?.events || res.data?.events || [],
        });
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch (err) {
        // ignore for now
        console.error("Search error", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [debouncedQ]);

  // fetch conversation preview (messages dropdown)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await chat.getConversations?.({ page: 1, limit: 6 });
        // expected shape: res.data.items or res.items
        const items = res?.data?.data?.items || res?.data?.items || res?.items || [];
        if (mounted) setConversations(items);
      } catch (err) {
        console.error("getConversations failed", err);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listen for new incoming messages -> update preview
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      // payload expected: { conversationId, message, lastMessage, unreadCount, ... }
      // simple approach: refresh conversations list
      (async () => {
        try {
          const res = await chat.getConversations?.({ page: 1, limit: 6 });
          const items = res?.data?.data?.items || res?.data?.items || res?.items || [];
          setConversations(items);
        } catch (err) {
          console.error("refresh convos failed", err);
        }
      })();
    };
    socket.on("chat:message", handler);
    return () => socket.off("chat:message", handler);
  }, [socket, chat]);

  // handle outside clicks for suggestions & menus
  useEffect(() => {
    const onDocClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // keyboard navigation in suggestions
  const onSearchKeyDown = useCallback(
    (e) => {
      if (!showSuggestions) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flattenedSuggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && flattenedSuggestions[activeIndex]) {
          const sel = flattenedSuggestions[activeIndex];
          // navigate to appropriate page
          if (sel.type === "user") navigate(`/profile/${sel.item._id}`);
          if (sel.type === "job") navigate(`/jobs/${sel.item._id}`);
          if (sel.type === "event") navigate(`/events/${sel.item._id}`);
          setShowSuggestions(false);
          setQ("");
        } else {
          // full search page
          if (q && q.trim()) {
            navigate(`/search?q=${encodeURIComponent(q.trim())}`);
            setShowSuggestions(false);
            setQ("");
          }
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    },
    [activeIndex, flattenedSuggestions, navigate, q, showSuggestions]
  );

  // click on a suggestion
  const handleSuggestionClick = (s) => {
    if (s.type === "user") navigate(`/profile/${s.item._id}`);
    if (s.type === "job") navigate(`/jobs/${s.item._id}`);
    if (s.type === "event") navigate(`/events/${s.item._id}`);
    setShowSuggestions(false);
    setQ("");
  };

  const handleSearchSubmit = useCallback(
    (incomingQ) => {
      const trimmed = (incomingQ || q).trim();
      if (!trimmed) return;
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setShowSuggestions(false);
      setQ("");
    },
    [navigate, q]
  );

  const userInitial = useMemo(() => (user?.name?.charAt(0)?.toUpperCase() || "U"), [user?.name]);

  const unreadCount = unread ?? (notifications ? notifications.filter((n) => !n.read).length : 0);

  const handleLogout = useCallback(() => {
    logout?.();
    setShowProfileMenu(false);
  }, [logout]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onMenuToggle || toggleSidebar}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            <div className="flex items-center gap-3 select-none">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${ACCENT_GRADIENT} shadow-md`}>
                <Sparkles size={18} />
              </div>
              <div className="hidden md:block">
                <h1 className="font-semibold text-base text-gray-900 dark:text-gray-100">BCET Connect</h1>
              </div>
            </div>

            {/* Search box */}
            <div className="hidden md:block w-full max-w-md ml-4 relative" ref={suggestionsRef}>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                  }}
                  onKeyDown={onSearchKeyDown}
                  onFocus={() => {
                    if (flattenedSuggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="Search people, jobs, events..."
                  aria-label="Search"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && flattenedSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">Suggestions</div>
                  <div className="max-h-64 overflow-y-auto">
                    {flattenedSuggestions.map((s, idx) => (
                      <button
                        key={`${s.type}-${s.item._id || idx}`}
                        onClick={() => handleSuggestionClick(s)}
                        className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          idx === activeIndex ? "bg-gray-50 dark:bg-gray-800" : ""
                        }`}
                        aria-current={idx === activeIndex}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {s.type === "user" && <User size={18} className="text-gray-600" />}
                          {s.type === "job" && <Briefcase size={18} className="text-emerald-600" />}
                          {s.type === "event" && <Calendar size={18} className="text-violet-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {s.type === "user" ? s.item.name : s.item.title || s.item.name}
                            </p>
                            {/* small badge for type */}
                            <span className="text-[11px] text-gray-400">{s.type}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {s.type === "user" ? (s.item.headline || s.item.department || "") : (s.item.company || s.item.location || "")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                    <button
                      onClick={() => handleSearchSubmit(q)}
                      className="w-full text-sm text-emerald-600 dark:text-emerald-400 text-center hover:underline py-1"
                    >
                      View all results for “{q}” →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              onClick={() => navigate("/ai")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-white hover:shadow-xl transition-shadow"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)" }}
            >
              <Sparkles size={16} />
              <span className="text-sm font-medium">Ask AI</span>
            </Button>

            <button
              onClick={() => setDarkMode((v) => !v)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowProfileMenu(false);
                  setShowSuggestions(false);
                }}
                aria-expanded={showNotifications}
                aria-haspopup="true"
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              >
                <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-800 ${ACCENT_GRADIENT_SOFT}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              await markAllRead?.();
                            }}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                          >
                            Mark all read
                          </button>
                          <button onClick={() => setShowNotifications(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <X size={16} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications?.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n._id || n.id}
                            onClick={async () => {
                              await markRead?.(n._id || n.id);
                              // navigate if notification has data.url or type-specific route
                              if (n.data?.url) navigate(n.data.url);
                              setShowNotifications(false);
                            }}
                            className={`w-full flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left ${
                              !n.read ? "bg-emerald-50/40 dark:bg-emerald-900/10" : ""
                            }`}
                          >
                            <div className="mt-1 flex-shrink-0">
                              <MessageCircle size={18} className="text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{n.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 inline-block">{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            {!n.read && <div className="flex-shrink-0"><span className="w-2 h-2 bg-emerald-500 rounded-full block mt-2" /></div>}
                          </button>
                        ))
                      )}
                    </div>

                    {notifications?.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                        <button onClick={() => { navigate("/notifications"); setShowNotifications(false); }} className="w-full text-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline py-1">View all notifications →</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Messages preview */}
            <div className="relative">
              <button
                onClick={() => {
                  navigate("/chats");
                }}
                title="Messages"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MessageCircle size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu((v) => !v);
                  setShowNotifications(false);
                  setShowSuggestions(false);
                }}
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`${ACCENT_GRADIENT} w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-md`}>{userInitial}</div>

                <div className="hidden lg:flex flex-col text-left max-w-[140px]">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || "User"}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{user?.role || "Member"}</span>
                </div>

                <ChevronDown size={16} className={`hidden lg:block transition-transform duration-200 text-gray-500 ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className={`px-4 py-4 border-b border-gray-200 dark:border-gray-800 ${ACCENT_GRADIENT_SOFT}`}>
                      <div className="flex items-center gap-3">
                        <div className={`${ACCENT_GRADIENT} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md`}>{userInitial}</div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name || "User"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "user@example.com"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button onClick={() => { navigate("/profile"); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <User size={18} /> <span className="text-sm">My Profile</span>
                      </button>
                      <button onClick={() => { navigate("/settings"); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Settings size={18} /> <span className="text-sm">Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
                        <LogOut size={18} /> <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right-sidebar toggle (desktop) */}
            <button onClick={toggleRightSidebar} className="hidden lg:inline-flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-sm text-gray-700 dark:text-gray-300">Widgets</span>
            </button>
          </div>
        </div>

        {/* mobile search */}
        <div className="md:hidden pb-3 pt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(q); }}
              placeholder="Search jobs, alumni, communities…"
              aria-label="Search"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
