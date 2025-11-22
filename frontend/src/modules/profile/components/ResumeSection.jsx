import { useState } from "react";
import { FileText, Upload, ExternalLink, Trash2, CheckCircle, File } from "lucide-react";

export default function ResumeSection({
  resume,
  isOwner = false,
  onUpload,
  onDelete,
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        await onUpload?.(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getFileName = (url) => {
    try {
      return decodeURIComponent(url.split("/").pop());
    } catch {
      return "Resume";
    }
  };

  const getFileSize = () => {
    // Mock file size - you can pass real size from backend
    return "2.4 MB";
  };

  const isPDF = resume?.toLowerCase().endsWith(".pdf");

  return (
    <section className="group relative rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 p-5 md:p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-blue-500/10 rounded-full blur-3xl -z-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      {/* ───────── HEADER ───────── */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <IconBubble>
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </IconBubble>

          <div>
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              Resume
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {resume ? "Ready to share" : "Boost your profile"}
            </p>
          </div>
        </div>

        {isOwner && (
          <label className="group/btn inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-y-[-2px]" />
            {isUploading ? "Uploading..." : resume ? "Replace" : "Upload"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* ───────── CONTENT ───────── */}
      {resume ? (
        <div className="relative group/card rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600">
          {/* Success Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Uploaded
            </span>
          </div>

          <div className="p-5 space-y-4">
            {/* File Info */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 shadow-lg">
                  <File className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                {/* Type badge */}
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-indigo-600 dark:bg-indigo-500 text-[9px] font-bold text-white uppercase shadow-lg">
                  {isPDF ? "PDF" : "DOC"}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-2">
                <p className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 truncate">
                  {getFileName(resume)}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{getFileSize()}</span>
                  <span>•</span>
                  <span>{isPDF ? "PDF Document" : "Word Document"}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <a
                href={resume}
                target="_blank"
                rel="noreferrer"
                download={!isPDF}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <ExternalLink className="w-4 h-4" />
                {isPDF ? "View Resume" : "Download"}
              </a>

              {isOwner && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-400 text-xs font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Hover shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      ) : (
        <EmptyState isOwner={isOwner} />
      )}
    </section>
  );
}

/* ───────────────── EMPTY STATE ───────────────── */

function EmptyState({ isOwner }) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-800/30 px-6 py-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-2xl" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 shadow-inner">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
            {isOwner ? "Upload Your Resume" : "Resume Not Shared"}
          </p>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isOwner
              ? "Add your resume to increase profile strength and visibility to recruiters. Supported formats: PDF, DOC, DOCX."
              : "This user hasn't uploaded their resume yet."}
          </p>
          {isOwner && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Click "Upload" to add your resume
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── HELPERS ───────────────── */

function IconBubble({ children }) {
  return (
    <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-100 dark:from-indigo-900/40 dark:via-indigo-800/20 dark:to-purple-900/40 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
      {children}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent" />
    </div>
  );
}