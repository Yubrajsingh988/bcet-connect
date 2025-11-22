// src/modules/learning/components/SkillCard.jsx
import { Sparkles } from "lucide-react";

export default function SkillCard({ skill }) {
  if (!skill) return null;

  // ✅ Support both: "React" OR { name, level, progress }
  let name = "";
  let level = "";
  let progress = null;

  if (typeof skill === "string") {
    name = skill;
  } else if (typeof skill === "object") {
    name = skill.name || skill.title || "";
    level = skill.level || "";
    progress =
      typeof skill.progress === "number" && skill.progress >= 0
        ? Math.min(100, Math.max(0, skill.progress))
        : null;
  }

  if (!name) return null;

  const safeLevel = level || "Skill";

  // 🎯 Dynamic level badge colors
  const levelClass = (() => {
    const lvl = safeLevel.toLowerCase();
    if (lvl.includes("beginner"))
      return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800";
    if (lvl.includes("intermediate") || lvl.includes("mid"))
      return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800";
    if (lvl.includes("advanced") || lvl.includes("expert"))
      return "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800";
    return "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-800";
  })();

  return (
    <div className="group inline-flex min-w-[180px] max-w-xs flex-col gap-2 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/80 px-3 py-2 shadow-sm hover:shadow-md hover:border-blue-500/60 transition-all duration-200">
      {/* TOP ROW: Icon + skill + level */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 group-hover:scale-105 transition">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="truncate text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-50">
            {name}
          </p>
        </div>

        <span
          className={`ml-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${levelClass}`}
        >
          {safeLevel}
        </span>
      </div>

      {/* PROGRESS BAR (optional, only if provided) */}
      {progress !== null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
