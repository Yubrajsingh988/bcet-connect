// src/components/layout/MobileSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useUI } from "@/context/UIContext";
import { Home, Briefcase, Calendar, Layers, MessageCircle, User, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menu = [
  { path: "/feed", label: "Feed", icon: Home },
  { path: "/jobs", label: "Jobs", icon: Briefcase },
  { path: "/events", label: "Events", icon: Calendar },
  { path: "/communities", label: "Communities", icon: Layers },
  { path: "/mentors", label: "Mentorship", icon: MessageCircle },
  { path: "/profile", label: "Profile", icon: User },
];

export default function MobileSidebar() {
  const { mobileSidebarOpen, closeMobileSidebar } = useUI();
  const { user, logout } = useAuth();

  if (!mobileSidebarOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={closeMobileSidebar} />

      {/* panel */}
      <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-600 text-white flex items-center justify-center">BC</div>
            <div className="font-semibold">BCET Connect</div>
          </div>
          <button onClick={closeMobileSidebar} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <NavLink
                to={m.path}
                key={m.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? "bg-emerald-600 text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`
                }
              >
                <Icon size={18} />
                <span className="font-medium">{m.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">Signed in as</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-medium">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              closeMobileSidebar();
            }}
            className="mt-4 w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-rose-600"
          >
            <div className="flex items-center gap-2">
              <LogOut size={16} />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
