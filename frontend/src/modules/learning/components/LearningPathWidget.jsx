// src/modules/learning/components/LearningPathWidget.jsx
import { Clock, RefreshCw, Target, CheckCircle2 } from "lucide-react";

export default function LearningPathWidget({ path, onRefresh }) {
  // 🌀 First load / no data yet
  if (!path) {
    return (
      <div className="space-y-3 text-sm">
        <div className="h-4 w-40 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-3 w-56 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
      </div>
    );
  }

  const steps = Array.isArray(path.steps) ? path.steps : [];
  const skills = Array.isArray(path.recommendedSkills)
    ? path.recommendedSkills
    : [];

  return (
    <div className="space-y-5">
      {/* HEADER: GOAL + TIMELINE + REFRESH */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            AI LEARNING ROADMAP
          </p>

          {path.timeline && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Estimated timeline:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {path.timeline}
              </span>
            </p>
          )}

          {path.goalRole && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Goal:{" "}
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {path.goalRole}
              </span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-[11px] font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/80 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh path
        </button>
      </div>

      {/* SKILLS CHIPS */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 font-semibold">
            Focus skills
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 text-[11px] font-medium border border-emerald-100 dark:border-emerald-800"
              >
                <CheckCircle2 className="w-3 h-3" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STEP-BY-STEP TIMELINE */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 font-semibold">
            Step-by-step roadmap
          </p>

          <ol className="space-y-4">
            {steps.map((step, index) => {
              const isActive = index === 0;
              const isLast = index === steps.length - 1;

              return (
                <li key={index} className="flex gap-3">
                  {/* LEFT: DOT + LINE */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-gradient-to-b from-gray-300/80 to-transparent dark:from-gray-700/80" />
                    )}
                  </div>

                  {/* RIGHT: STEP CONTENT */}
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* FALLBACK IF NO SKILLS + NO STEPS */}
      {!skills.length && !steps.length && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          AI ne abhi detailed roadmap nahi diya. Goal role ko thoda generic
          rakho (e.g.{" "}
          <span className="font-medium">"Frontend Developer"</span>) aur
          phir{" "}
          <button
            type="button"
            onClick={onRefresh}
            className="underline underline-offset-2 text-blue-600 dark:text-blue-400"
          >
            refresh
          </button>{" "}
          try karo.
        </p>
      )}
    </div>
  );
}
