// src/modules/learning/components/ResourceCard.jsx
import api from "../../../services/apiClient";
import {
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Star,
} from "lucide-react";

export default function ResourceCard({ resource, onChange }) {
  if (!resource) return null;

  const upCount = resource.upvotes?.length || 0;
  const downCount = resource.downvotes?.length || 0;
  const netScore = upCount - downCount;

  const domain = (() => {
    try {
      if (!resource.url) return null;
      const url = new URL(resource.url);
      return url.hostname.replace("www.", "");
    } catch {
      return null;
    }
  })();

  const level = resource.level?.toUpperCase() || "N/A";

  const handleUpvote = async () => {
    try {
      await api.post(`/learning/resources/${resource._id}/upvote`);
      onChange && onChange();
    } catch (err) {
      console.error("Upvote failed", err);
      alert("Unable to upvote this resource right now.");
    }
  };

  const handleDownvote = async () => {
    try {
      await api.post(`/learning/resources/${resource._id}/downvote`);
      onChange && onChange();
    } catch (err) {
      console.error("Downvote failed", err);
      alert("Unable to downvote this resource right now.");
    }
  };

  return (
    <div className="group rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-950/80 p-4 shadow-sm hover:shadow-md hover:border-blue-500/60 transition-all duration-200">
      {/* TOP: TITLE + LINK + META */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-50 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <span className="truncate">{resource.title}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>

          {resource.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {resource.description}
            </p>
          )}

          {/* Tags row: domain + level */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {domain && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {domain}
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/40 border border-amber-100 dark:border-amber-800 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-200">
              <Star className="w-3 h-3 fill-amber-400/80 text-amber-500" />
              Level: {level}
            </span>
          </div>
        </div>

        {/* Net score badge */}
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[10px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
            Score
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {netScore}
          </span>
        </div>
      </div>

      {/* SKILL TAGS */}
      {resource.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {resource.skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-900/40 border border-purple-100 dark:border-purple-800 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-200"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* FOOTER: VOTES + CTA */}
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUpvote}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{upCount}</span>
          </button>

          <button
            type="button"
            onClick={handleDownvote}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{downCount}</span>
          </button>
        </div>

        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          Community rating based on votes
        </span>
      </div>
    </div>
  );
}
