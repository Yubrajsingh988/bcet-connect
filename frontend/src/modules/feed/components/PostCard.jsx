import { useState } from "react";
import api from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import {
  MoreVertical,
  Heart,
  MessageCircle,
  Trash2,
  BadgeCheck,
  Share2,
  Bookmark,
} from "lucide-react";

import Comments from "./Comments";
import MediaPreview from "./MediaPreview";

/**
 * PostCard — Enhanced Professional Version
 * ----------------------------------------
 * ✨ Polished minimal design with smooth animations
 * 🎨 Enhanced hover effects and transitions
 * 💫 Better visual hierarchy
 * 🚀 Optimized performance
 * 🎯 Improved user interactions
 */

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();

  /* ──────────────────────────────────────────────
     STATE
  ──────────────────────────────────────────────── */
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [loadingLike, setLoadingLike] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [isHovered, setIsHovered] = useState(false);

  /* ──────────────────────────────────────────────
     PERMISSIONS
  ──────────────────────────────────────────────── */
  const isOwner = user?._id === post.author?._id;
  const isAdmin = user?.role === "admin";

  const canInteract =
    post.type !== "ADMIN" &&
    post.type !== "JOB_CARD" &&
    post.type !== "EVENT_CARD";

  const commentsDisabled =
    post.type === "ADMIN" ||
    post.type === "JOB_CARD" ||
    post.type === "EVENT_CARD";

  /* ──────────────────────────────────────────────
     LIKE / UNLIKE (SAFE OPTIMISTIC)
  ──────────────────────────────────────────────── */
  const toggleLike = async () => {
    if (!canInteract || loadingLike) return;

    const nextLiked = !liked;

    setLoadingLike(true);
    setLiked(nextLiked);
    setLikes((prev) => prev + (nextLiked ? 1 : -1));

    try {
      await api.post(`/feed/${post._id}/like`);
    } catch (err) {
      // rollback
      setLiked(!nextLiked);
      setLikes((prev) => prev + (nextLiked ? -1 : 1));
    } finally {
      setLoadingLike(false);
    }
  };

  /* ──────────────────────────────────────────────
     DELETE POST
  ──────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm("Delete this post?")) return;

    try {
      setDeleting(true);
      await api.delete(`/feed/${post._id}`);
      onDelete?.();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  /* ──────────────────────────────────────────────
     UI
  ──────────────────────────────────────────────── */
  return (
    <article
      className={`
        relative rounded-2xl border bg-white dark:bg-slate-900 
        p-6 space-y-4
        transition-all duration-300 ease-out
        ${
          isHovered
            ? "border-slate-300 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50"
            : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.01] to-purple-500/[0.01] dark:from-blue-400/[0.02] dark:to-purple-400/[0.02] rounded-2xl pointer-events-none" />

      <div className="relative">
        {/* ───── HEADER ───── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar with ring effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
              <img
                src={post.author?.avatar || "/default-avatar.png"}
                alt={post.author?.name}
                className="relative h-11 w-11 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 transition-transform duration-300 group-hover:scale-105"
              />
              {/* Online indicator (optional) */}
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {post.author?.name}
                </h4>

                {post.author?.role === "mentor" && (
                  <div className="relative group/badge">
                    <BadgeCheck className="w-4 h-4 text-blue-500 transition-transform duration-200 group-hover/badge:scale-110" />
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                      Verified Mentor
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="capitalize">{post.author?.role}</span>
                {post.community?.name && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium truncate">
                      {post.community.name}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {(isOwner || isAdmin) && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`
                p-2 rounded-lg
                text-slate-400 hover:text-red-500 dark:hover:text-red-400
                hover:bg-red-50 dark:hover:bg-red-500/10
                transition-all duration-200
                active:scale-95
                ${deleting ? "opacity-50 cursor-not-allowed" : ""}
              `}
              aria-label="Delete post"
            >
              <Trash2 size={16} strokeWidth={2} />
            </button>
          )}
        </header>

        {/* ───── TEXT ───── */}
        {post.text && (
          <div className="mt-4">
            <p className="text-[15px] leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {post.text}
            </p>
          </div>
        )}

        {/* ───── MEDIA ───── */}
        {post.media?.length > 0 && (
          <div className="mt-4 animate-in fade-in duration-300">
            <MediaPreview media={post.media} />
          </div>
        )}

        {/* ───── ACTION BAR ───── */}
        {canInteract && (
          <footer className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={toggleLike}
                disabled={loadingLike}
                className={`
                  group flex items-center gap-2 px-3 py-2 rounded-lg
                  transition-all duration-200
                  active:scale-95
                  ${
                    liked
                      ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                  }
                  ${loadingLike ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Heart
                  size={18}
                  strokeWidth={2}
                  fill={liked ? "currentColor" : "none"}
                  className={`transition-transform duration-300 ${
                    liked ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <span className="text-sm font-medium">
                  {likes > 0 ? likes : ""}
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => setShowComments((p) => !p)}
                className={`
                  group flex items-center gap-2 px-3 py-2 rounded-lg
                  transition-all duration-200
                  active:scale-95
                  ${
                    showComments
                      ? "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                  }
                `}
              >
                <MessageCircle
                  size={18}
                  strokeWidth={2}
                  fill={showComments ? "currentColor" : "none"}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-sm font-medium">
                  {comments.length > 0 ? comments.length : ""}
                </span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
                aria-label="Share post"
              >
                <Share2 size={16} strokeWidth={2} />
              </button>

              <button
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
                aria-label="Bookmark post"
              >
                <Bookmark size={16} strokeWidth={2} />
              </button>
            </div>
          </footer>
        )}

        {/* ───── COMMENTS ───── */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <Comments
              postId={post._id}
              comments={comments}
              setComments={setComments}
              disabled={commentsDisabled}
            />
          </div>
        )}
      </div>
    </article>
  );
}