// src/modules/jobs/components/JobMatchWidget.jsx
import { useMemo } from "react";
import { Brain, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function JobMatchWidget({ jobSkills = [] }) {
  // --- Fake AI match (stable per mount) ---
  const match = useMemo(() => {
    // 75–96% range
    return Math.floor(Math.random() * 22) + 75;
  }, []);

  const matchLabel =
    match >= 90 ? "Excellent Match" : match >= 85 ? "Good Match" : "Decent Match";

  // Colour based on score
  const matchColorClass =
    match >= 90
      ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800"
      : match >= 85
      ? "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800"
      : "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800";

  // Circular gauge style
  const gaugeStyle = {
    backgroundImage: `conic-gradient(#2563eb ${match * 3.6}deg, #e5e7eb 0deg)`,
  };

  return (
    <section
      className="
        mt-4
        rounded-2xl border border-gray-200 dark:border-gray-800
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
        shadow-sm px-4 sm:px-5 py-4 sm:py-5
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Brain size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              AI Match Score
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Based on job requirements vs your profile
            </p>
          </div>
        </div>

        <div
          className={`
            hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5
            rounded-full text-[11px] font-semibold border
            ${matchColorClass}
          `}
        >
          {match >= 85 ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          <span>{matchLabel}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
        {/* Gauge */}
        <div className="flex items-center justify-center sm:justify-start">
          <div
            className="
              relative w-24 h-24 sm:w-28 sm:h-28 rounded-full
              flex items-center justify-center
            "
            style={gaugeStyle}
          >
            <div
              className="
                w-18 h-18 sm:w-20 sm:h-20 rounded-full
                bg-white dark:bg-gray-900
                flex flex-col items-center justify-center
                shadow-inner
              "
            >
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
                {match}%
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                match
              </span>
            </div>
          </div>
        </div>

        {/* Text + skills */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Mobile label */}
          <div
            className={`
              inline-flex sm:hidden items-center gap-1.5 px-2.5 py-1
              rounded-full text-[11px] font-semibold border
              ${matchColorClass}
            `}
          >
            {match >= 85 ? (
              <CheckCircle2 size={13} />
            ) : (
              <AlertCircle size={13} />
            )}
            <span>{matchLabel}</span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Higher score means your skills and experience are closer to what this
            role is looking for. Improve your profile skills to boost this score.
          </p>

          {/* Required skills */}
          {jobSkills?.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                Required key skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {jobSkills.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="
                      inline-flex items-center gap-1 px-3 py-1
                      rounded-full text-[11px] sm:text-xs font-medium
                      bg-primary/5 text-primary
                      dark:bg-primary/15 dark:text-primary-foreground/90
                    "
                  >
                    <Sparkles size={12} />
                    {skill}
                  </span>
                ))}
                {jobSkills.length > 6 && (
                  <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                    +{jobSkills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Info line */}
          <p className="mt-1 text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">
            *This is a demo AI score for UI. In the final version, it will use
            your BCET Connect profile & real AI/ML to compute a precise match.
          </p>
        </div>
      </div>
    </section>
  );
}
