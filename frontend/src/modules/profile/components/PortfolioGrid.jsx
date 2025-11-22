// src/modules/profile/components/PortfolioGrid.jsx

import { ExternalLink, Image as ImageIcon } from "lucide-react";

export default function PortfolioGrid({ items = [] }) {
  const hasItems = items && items.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm shadow-slate-900/5 dark:shadow-black/30 px-4 py-5 md:px-6 md:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Portfolio
        </h3>
      </div>

      {!hasItems ? (
        <EmptyPortfolioState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <PortfolioCard key={index} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────
   CARD COMPONENT
─────────────────────────────────────────────── */

function PortfolioCard({ item }) {
  const { image, title, link, description, tech } = item;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/40 transition-all duration-300">
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

        {/* Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h4 className="text-white font-semibold text-sm md:text-base drop-shadow">
            {title}
          </h4>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Description */}
        {description && (
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
            {description}
          </p>
        )}

        {/* Tech Stack Tags */}
        {tech?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tech.map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[10px] md:text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] md:text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Visit Project <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   EMPTY STATE UI
─────────────────────────────────────────────── */
function EmptyPortfolioState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-6 text-center text-sm md:text-base text-slate-500 dark:text-slate-400">
      <p className="font-medium text-slate-700 dark:text-slate-300">
        No portfolio items added yet 🎨
      </p>
      <p className="text-xs mt-1">
        Add projects, achievements, GitHub repos, or design case studies to showcase your work.
      </p>
    </div>
  );
}
