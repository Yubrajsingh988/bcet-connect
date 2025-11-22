import { NavLink } from "react-router-dom"; 
import { useAuth } from "@/context/AuthContext";
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
  PlusCircle
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allowedToPostJob =
    ["admin", "alumni", "faculty"].includes(user?.role?.toLowerCase());

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
    { path: "/admin/users", label: "User Management", icon: Shield },
    { path: "/admin/jobs", label: "Jobs Approval", icon: FileCheck },
    { path: "/admin/events", label: "Events Approval", icon: FileCheck },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const MenuItem = ({ item, isAdmin }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${
          isActive
            ? isAdmin
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
              : "bg-primary text-white shadow-lg"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02]"
        }`
      }
    >
      <item.icon size={20} />

      {!isCollapsed && (
        <span className="flex-1 text-sm font-medium">{item.label}</span>
      )}

      {item.badge && !isCollapsed && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-md">
          {item.badge}
        </span>
      )}

      {isCollapsed && (
        <span className="
          absolute left-full ml-3 px-3 py-1.5 rounded-md bg-black text-white 
          text-xs opacity-0 group-hover:opacity-100 
          whitespace-nowrap shadow-lg z-50
        ">
          {item.label}
        </span>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } min-h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
      border-r border-gray-200 dark:border-gray-800 shadow-xl
      transition-all duration-300 flex flex-col relative`}
    >
      {/* HEADER */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                BCET Connect
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alumni Network
              </p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="text-white" size={20} />
          </div>
        )}
      </div>

      {/* USER INFO */}
      {user && (
        <div
          className={`${
            isCollapsed ? "mx-auto mt-4" : "mx-4 mt-4 p-4"
          } bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20 shadow-sm`}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg text-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-600 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-2 text-xs uppercase text-gray-500 font-semibold">Main Menu</p>
        )}

        {mainMenuItems.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}

        {/* POST JOB BUTTON */}
        {allowedToPostJob && (
          <NavLink
            to="/jobs/create"
            className="flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition mt-4"
          >
            <PlusCircle size={20} />
            {!isCollapsed && <span className="font-medium text-sm">Post a Job</span>}
          </NavLink>
        )}

        {/* ADMIN SECTION */}
        {user?.role === "admin" && (
          <>
            {!isCollapsed && (
              <p className="px-2 mt-6 mb-2 text-xs uppercase text-orange-600 font-bold flex items-center gap-2">
                <Shield size={14} /> Admin Panel
              </p>
            )}
            {adminMenuItems.map((item) => (
              <MenuItem key={item.path} item={item} isAdmin />
            ))}
          </>
        )}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm rounded-xl hover:bg-gray-200"
        >
          <ChevronLeft size={18} className={`${isCollapsed ? "rotate-180" : ""}`} />
          {!isCollapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-red-200"
        >
          <LogOut size={16} />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
