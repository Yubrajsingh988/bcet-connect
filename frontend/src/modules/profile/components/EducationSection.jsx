import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react";

/**
 * EducationSection — Enhanced Professional Edition
 * ------------------------------------------------
 * - Beautiful timeline design with gradient accents
 * - Smooth animations & micro-interactions
 * - Modern modal with glassmorphism
 * - Zero API logic, parent owns persistence
 */

export default function EducationSection({
  education = [],
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
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      {/* ───────── HEADER ───────── */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <IconBubble>
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </IconBubble>

          <div>
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              Education
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {education.length > 0 ? `${education.length} qualification${education.length > 1 ? 's' : ''}` : "Academic background"}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setAdding(true)}
            className="group/btn inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-90" />
            Add Education
          </button>
        )}
      </div>

      {/* ───────── EMPTY STATE ───────── */}
      {education.length === 0 && (
        <EmptyState isOwner={isOwner} />
      )}

      {/* ───────── TIMELINE LIST ───────── */}
      {education.length > 0 && (
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-20 dark:opacity-30" />

          {education.map((e, idx) => (
            <EducationCard
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
        <EducationModal
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
   EDUCATION CARD
─────────────────────────────────────────────── */

function EducationCard({ data, index, isOwner, onEdit, onRemove }) {
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-purple-500 to-pink-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <div 
      className="group/card relative pl-12 animate-in fade-in slide-in-from-left-4 duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Timeline dot */}
      <div className={`absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg transition-all duration-300 group-hover/card:scale-110 group-hover/card:shadow-xl`}>
        <Award className="w-4 h-4 text-white" />
      </div>

      <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1 truncate">
              {data.degree || "Degree"}
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{data.institute}</span>
            </div>
            {data.field && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {data.field}
              </p>
            )}
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
        {(data.startYear || data.endYear) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {data.startYear || "Start"}
              {" – "}
              {data.endYear || "Present"}
            </span>
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
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-2xl" />
      
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 shadow-inner">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
            {isOwner ? "Add Your Academic Background" : "No education details added"}
          </p>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isOwner
              ? "Share your degrees, certifications, and academic achievements to build credibility."
              : "This user hasn't added their education details yet."}
          </p>
          {isOwner && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Click "Add Education" to get started
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

function EducationModal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      institute: "",
      degree: "",
      field: "",
      startYear: "",
      endYear: "",
    }
  );

  const handleSave = () => {
    if (!form.institute || !form.degree) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">
                {initialData ? "Edit Education" : "Add Education"}
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
          <Field label="Institute" required>
            <input
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              value={form.institute}
              onChange={(e) =>
                setForm({ ...form, institute: e.target.value })
              }
              placeholder="e.g., Stanford University"
            />
          </Field>

          <Field label="Degree" required>
            <input
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              value={form.degree}
              onChange={(e) =>
                setForm({ ...form, degree: e.target.value })
              }
              placeholder="e.g., B.Tech, M.Sc, MBA"
            />
          </Field>

          <Field label="Field of Study">
            <input
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              value={form.field}
              onChange={(e) =>
                setForm({ ...form, field: e.target.value })
              }
              placeholder="e.g., Computer Science"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Year">
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                value={form.startYear}
                onChange={(e) =>
                  setForm({ ...form, startYear: e.target.value })
                }
                placeholder="2020"
              />
            </Field>

            <Field label="End Year">
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                value={form.endYear}
                onChange={(e) =>
                  setForm({ ...form, endYear: e.target.value })
                }
                placeholder="Present"
              />
            </Field>
          </div>

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
              disabled={!form.institute || !form.degree}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:hover:scale-100"
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
   SMALL UI HELPERS
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
    <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-100 dark:from-indigo-900/40 dark:via-indigo-800/20 dark:to-purple-900/40 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
      {children}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent" />
    </div>
  );
}