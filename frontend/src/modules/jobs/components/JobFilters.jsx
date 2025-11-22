// src/modules/jobs/components/JobFilters.jsx
import { useState } from "react";
import {
  SlidersHorizontal,
  Briefcase,
  Laptop2,
  Globe2,
  Building2,
  RefreshCcw,
} from "lucide-react";

export default function JobFilters({ onFilterChange }) {
  const [selectedType, setSelectedType] = useState("all"); // all | full-time | internship | part-time
  const [selectedMode, setSelectedMode] = useState("all"); // all | remote | onsite | hybrid

  const handleChange = (newType, newMode) => {
    const nextType = newType ?? selectedType;
    const nextMode = newMode ?? selectedMode;

    setSelectedType(nextType);
    setSelectedMode(nextMode);

    // Parent ko batana ho to optional callback
    if (typeof onFilterChange === "function") {
      onFilterChange({
        type: nextType,
        mode: nextMode,
      });
    }
  };

  const resetFilters = () => {
    handleChange("all", "all");
  };

  const typeOptions = [
    { key: "all", label: "All Roles", icon: SlidersHorizontal },
    { key: "full-time", label: "Full-Time", icon: Briefcase },
    { key: "internship", label: "Internships", icon: Laptop2 },
    { key: "part-time", label: "Part-Time", icon: Briefcase },
  ];

  const modeOptions = [
    { key: "all", label: "Any Mode", icon: Globe2 },
    { key: "onsite", label: "On-site", icon: Building2 },
    { key: "remote", label: "Remote", icon: Laptop2 },
    { key: "hybrid", label: "Hybrid", icon: Globe2 },
  ];

  const PillButton = ({ active, icon: Icon, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 whitespace-nowrap
        rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium
        border transition-all duration-150
        ${
          active
            ? "bg-primary text-white border-primary shadow-sm"
            : "bg-white/80 dark:bg-gray-900/70 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        }
      `}
    >
      {Icon && <Icon size={14} className={active ? "" : "text-gray-400"} />}
      <span>{label}</span>
    </button>
  );

  return (
    <section
      className="
        mb-4 sm:mb-6 rounded-2xl border border-gray-200 dark:border-gray-800
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
        shadow-sm px-3 sm:px-4 py-3 sm:py-4
      "
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary" />
          <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">
            Filter Jobs
          </p>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="
            inline-flex items-center gap-1 text-[11px] sm:text-xs
            text-gray-500 hover:text-primary
          "
        >
          <RefreshCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Type Filter */}
      <div className="space-y-1.5">
        <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
          Job type
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {typeOptions.map((opt) => (
            <PillButton
              key={opt.key}
              active={selectedType === opt.key}
              icon={opt.icon}
              label={opt.label}
              onClick={() => handleChange(opt.key, null)}
            />
          ))}
        </div>
      </div>

      {/* Mode Filter */}
      <div className="space-y-1.5 mt-3">
        <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
          Work mode
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {modeOptions.map((opt) => (
            <PillButton
              key={opt.key}
              active={selectedMode === opt.key}
              icon={opt.icon}
              label={opt.label}
              onClick={() => handleChange(null, opt.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
