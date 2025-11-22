// frontend/src/components/layout/Sidebar.jsx
import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
// Use relative import — change to "@/context/AuthContext" if your project uses that alias
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Briefcase,
  Users,
  BookOpen,
  Calendar,
  Layers,
  MessageCircle,
  Settings,
  User,
  BarChart3,
  Shield,
  FileCheck,
  LogOut,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  PlusCircle,
  Menu,
  X
} from "lucide-react";

/**
 * Professional Sidebar with:
 * - collapse (persisted)
 * - mobile overlay mode
 * - accessible controls
 * - theme-aware / dark-friendly styles
 *
 * If you want a different accent color, replace `accentFrom` / `accentTo` classes.
 */

const ACCENT_FROM = "from-teal-600";
const ACCENT_TO = "to-emerald-500";
const ACCENT_BG = "bg-gradient-to-br " + ACCENT_FROM + " " + ACCENT_TO;
const ACCENT_BG_SOFT = "bg-gradient-to-br " + ACCENT_FROM + "/10 " + ACCENT_TO + "/10";

function IconWrap({ Icon, className }) {
  return <Icon size={18} className={className} aria-hidden="true" />;
}

function Tooltip({ children }) {
  return (
    <span
      role="tooltip"
      className="absolute left-full ml-3 px-3 py-1.5 rounded-md bg-black text-white text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-lg z-50"
    >
      {children}
    </span>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth() || {};
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar:collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelRef = useRef();

  useEffect(() => {
    try {
      localStorage.setItem("sidebar:collapsed", isCollapsed ? "true" : "false");
    } catch {}
  }, [isCollapsed]);

  // close mobile on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // click outside to close mobile panel
  useEffect(() => {
    const onClick = (e) => {
      if (!mobileOpen) return;
      if (mobilePanelRef.current && !mobilePanelRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileOpen]);

  const allowedToPostJob = ["admin", "alumni", "faculty"].includes(
    (user?.role || "").toLowerCase()
  );

  const mainMenuItems = [
    { path: "/feed", label: "Feed", icon: Home },
    { path: "/profile", label: "My Profile", icon: User },
    { path: "/jobs", label: "Jobs", icon: Briefcase },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/communities", label: "Communities", icon: Layers },
    { path: "/mentors", label: "Mentorship", icon: GraduationCap },
    { path: "/learning", label: "Learning Hub", icon: BookOpen, badge: "New" },
    { path: "/chat", label: "Messages", icon: MessageCircle },
  ];

  const adminMenuItems = [
    { path: "/admin/users", label: "User Management", icon: Users },
    { path: "/admin/jobs", label: "Jobs Approval", icon: FileCheck },
    { path: "/admin/events", label: "Events Approval", icon: FileCheck },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const MenuItem = ({ item, isAdmin }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
         ${isActive ? ` ${ACCENT_BG} text-white shadow-lg` : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02]"}`
      }
      title={isCollapsed ? item.label : undefined}
      aria-current={undefined}
    >
      <item.icon size={18} className="flex-shrink-0" />

      {!isCollapsed && (
        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
      )}

      {item.badge && !isCollapsed && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-md">
          {item.badge}
        </span>
      )}

      {isCollapsed && <Tooltip>{item.label}</Tooltip>}
    </NavLink>
  );

  return (
    <>
      {/* Mobile header button */}
      <div className="md:hidden fixed top-4 left-4 z-[60]">
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-800"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar (desktop) */}
      <aside
        className={`hidden md:flex flex-col
          ${isCollapsed ? "w-20" : "w-72"}
          min-h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
          border-r border-gray-200 dark:border-gray-800 shadow-xl
          transition-all duration-300`}
        aria-label="Primary navigation"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className={`${ACCENT_BG} rounded-lg w-10 h-10 flex items-center justify-center shadow-md`}>
                <Sparkles className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">BCET Connect</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Alumni Network</p>
              </div>
            </div>
          ) : (
            <div className={`${ACCENT_BG} rounded-lg w-10 h-10 flex items-center justify-center shadow-md mx-auto`}>
              <Sparkles className="text-white" size={18} />
            </div>
          )}

          {/* collapse toggle */}
          <button
            onClick={() => setIsCollapsed((s) => !s)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft size={16} className={`${isCollapsed ? "rotate-180" : ""} transition-transform`} />
          </button>
        </div>

        {/* Profile summary */}
        {user && (
          <div className={`${isCollapsed ? "mx-auto mt-4" : "mx-4 mt-4 p-4"} rounded-xl ${ACCENT_BG_SOFT} border border-transparent`}>
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-lg shadow">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">{user.role}</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold shadow mx-auto">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {!isCollapsed && <p className="px-2 text-xs uppercase text-gray-500 font-semibold">Main Menu</p>}

          {mainMenuItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}

          {allowedToPostJob && (
            <NavLink
              to="/jobs/create"
              className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition"
            >
              <PlusCircle size={18} />
              {!isCollapsed && <span className="font-medium text-sm">Post a Job</span>}
              {isCollapsed && <Tooltip>Post a Job</Tooltip>}
            </NavLink>
          )}

          {/* Admin section */}
          {user?.role === "admin" && (
            <>
              {!isCollapsed && <p className="px-2 mt-6 mb-2 text-xs uppercase text-orange-600 font-bold flex items-center gap-2"><Shield size={14} /> Admin Panel</p>}
              {adminMenuItems.map((item) => (
                <MenuItem key={item.path} item={item} isAdmin />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsCollapsed((s) => !s)}
            className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={16} className={`${isCollapsed ? "rotate-180" : ""}`} />
            {!isCollapsed && <span>Collapse</span>}
          </button>

          <button
            onClick={() => logout && logout()}
            className="w-full mt-3 px-4 py-2 bg-red-100 text-red-600 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-red-200"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div
            ref={mobilePanelRef}
            className="relative w-80 max-w-full h-full bg-white dark:bg-gray-900 shadow-2xl overflow-auto"
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`${ACCENT_BG} rounded-lg w-9 h-9 flex items-center justify-center shadow-md`}>
                  <Sparkles className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">BCET Connect</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Alumni</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              {user && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-2">
                {mainMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg ${isActive ? `${ACCENT_BG} text-white` : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`
                    }
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                ))}

                {allowedToPostJob && (
                  <NavLink
                    to="/jobs/create"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-emerald-600 text-white"
                  >
                    <PlusCircle size={18} />
                    <span className="font-medium text-sm">Post a Job</span>
                  </NavLink>
                )}

                {user?.role === "admin" && (
                  <>
                    <div className="mt-4 text-xs uppercase text-orange-600 font-bold flex items-center gap-2"><Shield size={14} /> Admin Panel</div>
                    {adminMenuItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-3 rounded-lg ${isActive ? `${ACCENT_BG} text-white` : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`
                        }
                      >
                        <item.icon size={18} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </NavLink>
                    ))}
                  </>
                )}
              </nav>

              <div className="mt-6">
                <button onClick={() => logout && logout()} className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg flex items-center justify-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
