import { useState } from "react";
import {
  ExternalLink,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Folder,
  Code2,
  Link2,
  Sparkles,
} from "lucide-react";

/**
 * PortfolioGrid — Enhanced Professional Edition
 * --------------------------------
 * - Beautiful card grid with hover effects
 * - Smooth animations & micro-interactions
 * - Modern modal with glassmorphism
 * - Zero API logic, parent owns persistence
 */

export default function PortfolioGrid({
  items = [],
  isOwner = false,
  onAddProject,
  onEditProject,
  onDeleteProject,
}) {
  const projects = normalizePortfolio(items);

  const [active, setActive] = useState(null);
  const [adding, setAdding] = useState(false);

  return (
    <section className="group relative rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 p-5 md:p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-pink-500/5 dark:from-violet-500/10 dark:via-fuchsia-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      {/* ───────── HEADER ───────── */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <IconBubble>
            <Folder className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </IconBubble>

          <div>
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              Portfolio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {projects.length > 0 ? `${projects.length} project${projects.length > 1 ? 's' : ''}` : "Showcase your work"}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setAdding(true)}
            className="group/btn inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-violet-500 dark:hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-90" />
            Add Project
          </button>
        )}
      </div>

      {/* ───────── EMPTY STATE ───────── */}
      {projects.length === 0 && <EmptyState isOwner={isOwner} />}

      {/* ───────── GRID ───────── */}
      {projects.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 relative z-10">
          {projects.map((p, idx) => (
            <Card
              key={p._id || p.title}
              project={p}
              index={idx}
              isOwner={isOwner}
              onEdit={() => setActive(p)}
              onDelete={() => p._id && onDeleteProject?.(p._id)}
            />
          ))}
        </div>
      )}

      {(adding || active) && (
        <ProjectModal
          initial={active}
          onClose={() => {
            setAdding(false);
            setActive(null);
          }}
          onSave={async (data) => {
            active
              ? await onEditProject?.(active._id, data)
              : await onAddProject?.(data);
            setAdding(false);
            setActive(null);
          }}
        />
      )}
    </section>
  );
}

/* ───────────────── CARD ───────────────── */

function Card({ project, index, isOwner, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className="group/card relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-40 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
        {project.image && !imageError ? (
          <>
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110"
              onError={() => setImageError(true)}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <div className="p-4 rounded-2xl bg-slate-200 dark:bg-slate-800">
              <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              No preview
            </span>
          </div>
        )}

        {/* Hover Actions */}
        {isOwner && (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all duration-200 transform translate-y-2 group-hover/card:translate-y-0">
            <IconBtn onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" />
            </IconBtn>
            <IconBtn danger onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </IconBtn>
          </div>
        )}

        {/* Shimmer effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 ${isHovered ? 'translate-x-full' : ''}`} />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 line-clamp-2 min-h-[2.5rem]">
          {project.title}
        </h4>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {project.techStack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[10px] md:text-[11px] px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-800"
              >
                <Code2 className="w-2.5 h-2.5" />
                {t}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[10px] px-2 py-1 text-slate-500 dark:text-slate-400 font-medium">
                +{project.techStack.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Link */}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Link2 className="w-3.5 h-3.5" />
            View Project
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
    </article>
  );
}

/* ───────────────── EMPTY STATE ───────────────── */

function EmptyState({ isOwner }) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-800/30 px-6 py-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 dark:from-violet-500/10 dark:to-fuchsia-500/10 rounded-full blur-2xl" />

      <div className="relative flex flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 shadow-inner">
          <Folder className="w-8 h-8 text-violet-600 dark:text-violet-400" />
        </div>

        <div className="space-y-2">
          <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
            {isOwner ? "Build Your Portfolio" : "No projects yet"}
          </p>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            {isOwner
              ? "Showcase your best work, side projects, and achievements to stand out to recruiters and collaborators."
              : "This user hasn't added any portfolio projects yet."}
          </p>
          {isOwner && (
            <div className="flex items-center justify-center gap-2 pt-3">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Click "Add Project" to get started
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── MODAL ───────────────── */

function ProjectModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial || {
      title: "",
      description: "",
      link: "",
      image: "",
      techStack: [],
    }
  );

  const handleSave = () => {
    if (!form.title) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-5">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">
                {initial ? "Edit Project" : "Add Project"}
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
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <Field label="Project Title" required>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
              placeholder="e.g., E-commerce Platform"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200 resize-none"
              placeholder="Describe what you built, the problem it solves, and key features..."
            />
          </Field>

          <Field label="Project Link">
            <input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
              placeholder="https://github.com/username/project"
            />
          </Field>

          <Field label="Tech Stack">
            <input
              value={form.techStack.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  techStack: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
              placeholder="React, Node.js, MongoDB (comma separated)"
            />
          </Field>

          <Field label="Cover Image URL">
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
              placeholder="https://example.com/image.jpg (optional)"
            />
            {form.image && (
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
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
              disabled={!form.title}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:hover:scale-100"
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Save Project
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── HELPERS ───────────────── */

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

function normalizePortfolio(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((i) => ({
      _id: i._id,
      title: i.title || "",
      description: i.description || "",
      link: i.link || "",
      image: i.image || "",
      techStack: Array.isArray(i.techStack) ? i.techStack : [],
    }))
    .filter((i) => i.title);
}

function IconBtn({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`p-2 rounded-lg border-2 backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-lg ${
        danger
          ? "border-slate-200/50 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-500"
          : "border-slate-200/50 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function IconBubble({ children }) {
  return (
    <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 via-violet-50 to-fuchsia-100 dark:from-violet-900/40 dark:via-violet-800/20 dark:to-fuchsia-900/40 shadow-lg shadow-violet-500/20 dark:shadow-violet-900/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
      {children}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent" />
    </div>
  );
}