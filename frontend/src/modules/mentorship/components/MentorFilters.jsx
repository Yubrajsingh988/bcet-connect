// frontend/src/modules/mentorship/components/MentorFilters.jsx

import { Search, SlidersHorizontal, X } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "student", label: "Student" },
  { value: "alumni", label: "Alumni" },
  { value: "faculty", label: "Faculty" },
  { value: "industry", label: "Industry Mentor" },
];

export default function MentorFilters({ filters, setFilters }) {
  const { role, skill, company } = filters || {};

  const updateField = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearAll = () => {
    setFilters({
      role: "",
      skill: "",
      company: "",
    });
  };

  const hasActiveFilters = Boolean(role || skill || company);

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm px-4 py-3 md:px-5 md:py-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Filter mentors</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-[11px] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filters grid */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Skill search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={skill}
              onChange={(e) => updateField("skill", e.target.value)}
              placeholder="Filter by skill (e.g. React, ML, DSA)"
              className="w-full pl-8 pr-3 py-2 text-xs md:text-sm rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            />
          </div>
        </div>

        {/* Company search */}
        <div className="flex-1">
          <input
            type="text"
            value={company}
            onChange={(e) => updateField("company", e.target.value)}
            placeholder="Filter by company (e.g. Google, TCS)"
            className="w-full px-3 py-2 text-xs md:text-sm rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          />
        </div>

        {/* Role pills */}
        <div className="md:w-56">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-1">
            {ROLE_OPTIONS.map((opt) => {
              const isActive = role === opt.value;
              return (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => updateField("role", opt.value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] md:text-xs border transition ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active filter chips (optional display) */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {role && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 px-2 py-0.5 text-[10px] border border-blue-100 dark:border-blue-800">
              Role: {ROLE_OPTIONS.find((r) => r.value === role)?.label || role}
            </span>
          )}
          {skill && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 px-2 py-0.5 text-[10px] border border-purple-100 dark:border-purple-800">
              Skill: {skill}
            </span>
          )}
          {company && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 px-2 py-0.5 text-[10px] border border-emerald-100 dark:border-emerald-800">
              Company: {company}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
