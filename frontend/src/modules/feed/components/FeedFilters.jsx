import { useState } from "react";
import {
  Sparkles,
  Hash,
  Briefcase,
  CalendarDays,
  BookOpenText,
} from "lucide-react";

const FILTERS = [
  { key: "all", label: "All Posts", icon: Sparkles },
  { key: "general", label: "General", icon: Hash },
  { key: "jobs", label: "Jobs & Internships", icon: Briefcase },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "resource", label: "Resources", icon: BookOpenText },
];

export default function FeedFilters({ onFilter }) {
  const [active, setActive] = useState("all");

  const handleClick = (key) => {
    setActive(key);
    onFilter?.(key);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Filter feed
        </h2>
        <p className="text-[11px] text-gray-400 hidden sm:block">
          See posts by type
        </p>
      </div>

      {/* Pills bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleClick(item.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-[13px]
                border transition-all duration-200 flex-shrink-0
                ${
                  isActive
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/30"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
              <Icon
                size={14}
                className={isActive ? "opacity-100" : "opacity-70"}
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
