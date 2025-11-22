// src/modules/profile/components/SkillsSection.jsx

import { Sparkles, Plus } from "lucide-react";

export default function SkillsSection({
  skills = [],
  editable = false,
  onAddSkill,
}) {
  // Normalize: support both ["React", "Node"] and [{ name, level }]
  const normalizedSkills = (skills || [])
    .filter(Boolean)
    .map((skill) =>
      typeof skill === "string"
        ? { name: skill, level: null }
        : {
            name: skill.name || "",
            level: skill.level || skill.proficiency || null,
          }
    )
    .filter((s) => s.name);

  const hasSkills = normalizedSkills.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm shadow-slate-900/5 dark:shadow-black/30 px-4 py-4 md:px-5 md:py-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/40">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
              Skills
            </h3>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
              Highlight what you’re good at
            </p>
          </div>
        </div>

        {editable && (
          <button
            type="button"
            onClick={onAddSkill}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] md:text-xs font-medium text-slate-800 dark:text-slate-100 hover:border-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add skill
          </button>
        )}
      </div>

      {/* Content */}
      {hasSkills ? (
        <div className="flex flex-wrap gap-2.5">
          {normalizedSkills.map((skill) => (
            <SkillChip
              key={skill.name}
              name={skill.name}
              level={skill.level}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 px-4 py-4 text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-start gap-3">
          <span className="mt-0.5 text-slate-400 dark:text-slate-500">💡</span>
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200 mb-0.5">
              No skills added yet
            </p>
            <p>
              Add your tech stack, tools, and soft skills to get better job and
              mentorship matches.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

// -----------------------------------------
// Small sub-component: single skill chip
// -----------------------------------------
function SkillChip({ name, level }) {
  const shortLevel =
    typeof level === "string"
      ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
      : null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900 px-3 py-1.5">
      {/* Initial bubble */}
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-[10px] font-semibold text-blue-700 dark:text-blue-200 uppercase">
        {name.charAt(0)}
      </span>

      {/* Skill name */}
      <span className="text-xs md:text-[13px] font-medium text-slate-800 dark:text-slate-100">
        {name}
      </span>

      {/* Optional level badge */}
      {shortLevel && (
        <span className="ml-1 rounded-full bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-200">
          {shortLevel}
        </span>
      )}
    </div>
  );
}
