import { useState } from "react";
import { Sparkles, Plus, X, Check, Zap } from "lucide-react";

export default function SkillsSection({
  skills = [],
  editable = false,
  isOwner = false,
  onAddSkill,
  onRemoveSkill,
}) {
  const canEdit = editable || isOwner;

  const normalizedSkills = normalizeSkills(skills);
  const hasSkills = normalizedSkills.length > 0;
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(null);

  const handleConfirmAdd = async () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (normalizedSkills.includes(skill)) {
      setIsAdding(false);
      setNewSkill("");
      return;
    }
    try {
      setLoadingSkill(skill);
      await onAddSkill?.(skill);
    } finally {
      setLoadingSkill(null);
      setIsAdding(false);
      setNewSkill("");
    }
  };

  const handleRemove = async (skill) => {
    try {
      setLoadingSkill(skill);
      await onRemoveSkill?.(skill);
    } finally {
      setLoadingSkill(null);
    }
  };

  return (
    <section className="group relative rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 px-5 py-6 md:px-6 md:py-7 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50">
      {/* Background Gradient Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      {/* ───────── HEADER ───────── */}
      <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <IconBubble>
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </IconBubble>

          <div>
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              Skills & Expertise
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {hasSkills ? `${normalizedSkills.length} skills` : "Your tech stack"}
            </p>
          </div>
        </div>

        {canEdit && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="group/btn inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-90" />
            Add Skill
          </button>
        )}
      </div>

      {/* ───────── ADD INPUT ───────── */}
      {canEdit && isAdding && (
        <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative flex-1">
            <input
              autoFocus
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmAdd();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewSkill("");
                }
              }}
              placeholder="e.g. React, Node.js, TypeScript..."
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
            />
            <Zap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <button
            onClick={handleConfirmAdd}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-2.5 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-110"
            title="Add skill"
          >
            <Check className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsAdding(false);
              setNewSkill("");
            }}
            className="rounded-xl border-2 border-slate-300 dark:border-slate-600 p-2.5 text-slate-500 hover:text-red-500 hover:border-red-500 dark:hover:border-red-400 dark:hover:text-red-400 transition-all duration-200 hover:scale-110"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ───────── CONTENT ───────── */}
      {hasSkills ? (
        <div className="flex flex-wrap gap-2.5 relative z-10">
          {normalizedSkills.map((skill, index) => (
            <SkillChip
              key={skill.toLowerCase()}
              name={skill}
              index={index}
              editable={canEdit}
              loading={loadingSkill === skill}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <EmptyState editable={canEdit} />
      )}
    </section>
  );
}

function SkillChip({ name, index, editable, loading, onRemove }) {
  // Gradient colors for variety
  const gradients = [
    "from-blue-500 to-cyan-600",
    "from-purple-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-indigo-500 to-purple-600",
    "from-green-500 to-emerald-600",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <div 
      className="group/chip relative inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 hover:border-slate-300 dark:hover:border-slate-600"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icon with gradient */}
      <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-xs font-bold text-white uppercase shadow-lg`}>
        {name.charAt(0)}
      </span>

      <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100">
        {name}
      </span>

      {editable && (
        <button
          disabled={loading}
          onClick={() => onRemove(name)}
          className="ml-1 rounded-lg p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/chip:opacity-100 transition-all duration-200 disabled:opacity-50 hover:scale-110"
          title="Remove skill"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/chip:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

function EmptyState({ editable }) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-800/30 px-6 py-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-2xl" />
      
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 shadow-inner">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
            {editable ? "Showcase Your Skills" : "No skills added yet"}
          </p>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {editable
              ? "Add your technical skills and expertise to stand out. This helps with job matches, mentor connections, and personalized AI recommendations."
              : "This user hasn't added their skills yet. Check back later!"}
          </p>
          {editable && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Get started by clicking "Add Skill" above
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBubble({ children }) {
  return (
    <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 dark:from-blue-900/40 dark:via-blue-800/20 dark:to-purple-900/40 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
      {children}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent" />
    </div>
  );
}

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];

  return [
    ...new Set(
      skills
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    ),
  ];
}