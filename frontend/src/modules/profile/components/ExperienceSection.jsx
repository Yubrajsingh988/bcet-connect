import { useState } from "react";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Calendar,
  Building2,
  FileText,
  TrendingUp,
} from "lucide-react";

/**
 * ExperienceSection — Enhanced Professional Edition
 * ------------------------------------------------
 * - Beautiful timeline design with gradient accents
 * - Smooth animations & micro-interactions
 * - Modern modal with glassmorphism
 * - Zero API logic, parent owns persistence
 */

export default function ExperienceSection({
  experience = [],
  isOwner = false,
  onAdd,
  onUpdate,
  onRemove,
}) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  return (
    <section className="group relative rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 px-5 py-6 md:px-6 md:py-7 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10 rounded-full blur-3xl -z-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      {/* ───────── HEADER ───────── */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <IconBubble>
            <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </IconBubble>

          <div>
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              Work Experience
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {experience.length > 0 ? `${experience.length} position${experience.length > 1 ? 's' : ''}` : "Professional journey"}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setAdding(true)}
            className="group/btn inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-90" />
            Add Experience
          </button>
        )}
      </div>

      {/* ───────── EMPTY STATE ───────── */}
      {experience.length === 0 && (
        <EmptyState isOwner={isOwner} />
      )}

      {/* ───────── TIMELINE LIST ───────── */}
      {experience.length > 0 && (
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 opacity-20 dark:opacity-30" />

          {experience.map((e, idx) => (
            <ExperienceCard
              key={idx}
              data={e}
              index={idx}
              isOwner={isOwner}
              onEdit={() => setEditing({ ...e, idx })}
              onRemove={() => onRemove(idx)}
            />
          ))}
        </div>
      )}

      {/* ───────── MODAL ───────── */}
      {(adding || editing) && (
        <ExperienceModal
          initialData={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={(data) => {
            editing ? onUpdate(editing.idx, data) : onAdd(data);
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────
   EXPERIENCE CARD
─────────────────────────────────────────────── */

function ExperienceCard({ data, index, isOwner, onEdit, onRemove }) {
  const gradients = [
    "from-emerald-500 to-teal-600",
    "from-teal-500 to-cyan-600",
    "from-blue-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <div 
      className="group/card relative pl-12 animate-in fade-in slide-in-from-left-4 duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Timeline dot */}
      <div className={`absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg transition-all duration-300 group-hover/card:scale-110 group-hover/card:shadow-xl`}>
        <TrendingUp className="w-4 h-4 text-white" />
      </div>

      <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1 truncate">
              {data.role || "Role"}
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate font-medium">{data.company}</span>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all duration-200">
              <IconBtn onClick={onEdit}>
                <Pencil className="w-3.5 h-3.5" />
              </IconBtn>
              <IconBtn danger onClick={onRemove}>
                <Trash2 className="w-3.5 h-3.5" />
              </IconBtn>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {formatDate(data.startDate) || "Start"}
            {" – "}
            {data.endDate ? formatDate(data.endDate) : "Present"}
          </span>
        </div>

        {/* Description */}
        {data.description && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
              <p>{data.description}</p>
            </div>
          </div>
        )}

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   EMPTY STATE
─────────────────────────────────────────────── */

function EmptyState({ isOwner }) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-800/30 px-6 py-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-full blur-2xl" />
      
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 shadow-inner">
            <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
            {isOwner ? "Build Your Professional Story" : "No experience listed"}
          </p>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isOwner
              ? "Share your work experience to showcase your career journey and attract opportunities."
              : "This user hasn't added their work experience yet."}
          </p>
          {isOwner && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Click "Add Experience" to get started
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MODAL
─────────────────────────────────────────────── */

function ExperienceModal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    }
  );

  const handleSave = () => {
    if (!form.company || !form.role || !form.startDate) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">
                {initialData ? "Edit Experience" : "Add Experience"}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <Field label="Company" required>
            <input
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              value={form.company}
              onChange={(e) =>
                setForm({ ...form, company: e.target.value })
              }
              placeholder="e.g., Google, Microsoft, Startup Inc."
            />
          </Field>

          <Field label="Role" required>
            <input
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
              placeholder="e.g., Software Engineer, Product Manager"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </Field>

            <Field label="End Date">
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
                placeholder="Leave blank if current"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 resize-none"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe your role, achievements, and responsibilities..."
            />
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={!form.company || !form.role || !form.startDate}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:hover:scale-100"
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Save
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────── */

function Field({ label, required, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function IconBtn({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md ${
        danger
          ? "border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500"
          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function IconBubble({ children }) {
  return (
    <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:via-emerald-800/20 dark:to-teal-900/40 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
      {children}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent" />
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}