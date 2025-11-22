import { useState } from "react";
import {
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

/**
 * FeedFilters — Enhanced Professional Version
 * ------------------------------------------
 * ✨ Polished minimal design with smooth animations
 * 🎨 Enhanced pill design with gradients
 * 💫 Better active state transitions
 * 🚀 Optimized performance
 * 🎯 Improved user interactions
 */

const FILTERS = [
  { 
    key: "ALL", 
    label: "All", 
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500"
  },
  { 
    key: "USER", 
    label: "People", 
    icon: Users,
    gradient: "from-blue-500 to-cyan-500"
  },
  { 
    key: "COMMUNITY", 
    label: "Communities", 
    icon: GraduationCap,
    gradient: "from-green-500 to-emerald-500"
  },
  { 
    key: "MENTOR", 
    label: "Mentors", 
    icon: GraduationCap,
    gradient: "from-orange-500 to-amber-500"
  },
  { 
    key: "JOB_CARD", 
    label: "Jobs", 
    icon: Briefcase,
    gradient: "from-indigo-500 to-purple-500"
  },
  { 
    key: "EVENT_CARD", 
    label: "Events", 
    icon: CalendarDays,
    gradient: "from-rose-500 to-pink-500"
  },
  { 
    key: "ADMIN", 
    label: "Announcements", 
    icon: ShieldCheck,
    gradient: "from-red-500 to-orange-500"
  },
];

export default function FeedFilters({ value = "ALL", onChange }) {
  const [active, setActive] = useState(value);
  const [hoveredKey, setHoveredKey] = useState(null);

  const handleSelect = (key) => {
    setActive(key);
    onChange?.(key);
  };

  const activeFilter = FILTERS.find((f) => f.key === active);

  return (
    <div className="w-full">
      {/* Container with subtle background */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-purple-500/[0.02] dark:from-blue-400/[0.03] dark:to-purple-400/[0.03] rounded-2xl pointer-events-none" />

        {/* Pills */}
        <div className="relative flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {FILTERS.map(({ key, label, icon: Icon, gradient }) => {
            const isActive = active === key;
            const isHovered = hoveredKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`
                  group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                  text-sm font-medium whitespace-nowrap 
                  transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "text-white shadow-lg scale-[1.03]"
                      : "text-slate-600 dark:text-slate-300 hover:scale-[1.02] active:scale-95"
                  }
                `}
              >
                {/* Background */}
                <div
                  className={`
                    absolute inset-0 rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? `bg-gradient-to-r ${gradient} opacity-100`
                        : isHovered
                        ? "bg-slate-200 dark:bg-slate-800 opacity-100"
                        : "bg-slate-100 dark:bg-slate-800/50 opacity-100"
                    }
                  `}
                />

                {/* Glow effect for active */}
                {isActive && (
                  <div
                    className={`
                      absolute inset-0 rounded-xl blur-md opacity-40
                      bg-gradient-to-r ${gradient}
                    `}
                  />
                )}

                {/* Icon */}
                <Icon
                  size={16}
                  strokeWidth={2.5}
                  className={`
                    relative z-10 transition-all duration-300
                    ${
                      isActive
                        ? "opacity-100 scale-110"
                        : "opacity-70 group-hover:opacity-100 group-hover:scale-110"
                    }
                  `}
                />

                {/* Label */}
                <span className="relative z-10">{label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="relative z-10 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active filter info */}
        {activeFilter && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeFilter.gradient}`} />
            <span>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{activeFilter.label}</span> feed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}