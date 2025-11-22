import { useState } from "react";
import api from "@/services/apiClient";
import { Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

/**
 * Comments — Enhanced Professional Version
 * ----------------------------------------
 * ✨ Polished minimal design with smooth animations
 * 🎨 Enhanced chat-like interface
 * 💫 Better visual hierarchy
 * 🚀 Optimized performance
 * 🎯 Improved user interactions
 */

export default function Comments({
  postId,
  comments = [],
  setComments,
  disabled = false,
  maxLength = 1000,
}) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  /* ──────────────────────────────────────────────
     GUARDS
  ──────────────────────────────────────────────── */
  if (disabled) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-2">
          <span className="text-lg">💬</span>
          Comments are disabled for this post
        </p>
      </div>
    );
  }

  if (!user) return null;

  /* ──────────────────────────────────────────────
     SUBMIT COMMENT
  ──────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (loading) return;

    const content = text.trim();
    if (!content) return;

    if (content.length > maxLength) {
      alert(`Comment cannot exceed ${maxLength} characters`);
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const optimistic = {
      _id: tempId,
      author: user,
      text: content,
      createdAt: new Date().toISOString(),
      __optimistic: true,
    };

    // optimistic update
    setText("");
    setComments((prev) => [...prev, optimistic]);

    try {
      setLoading(true);

      const res = await api.post(`/feed/${postId}/comment`, { text: content });

      // backend is source of truth
      setComments(res.data.data.comments);
    } catch (err) {
      console.error("❌ Comment failed:", err);

      // rollback optimistic comment
      setComments((prev) => prev.filter((c) => c._id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ──────────────────────────────────────────────
     UI
  ──────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* COMMENTS LIST */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
          {comments.map((c, idx) => {
            const isOwn = c.author?._id === user._id;

            return (
              <div
                key={c._id}
                className={`
                  flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300
                  ${isOwn ? "flex-row-reverse" : ""}
                `}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 transition-all">
                  <AvatarImage src={c.author?.avatar} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                    {c.author?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Comment Bubble */}
                <div
                  className={`
                    group relative rounded-2xl px-4 py-2.5 max-w-[85%]
                    transition-all duration-200
                    ${
                      c.__optimistic
                        ? "bg-slate-200/60 dark:bg-slate-700/60 animate-pulse"
                        : isOwn
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-md"
                    }
                    ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}
                  `}
                >
                  {!isOwn && (
                    <p
                      className={`text-xs font-semibold mb-1 ${
                        c.__optimistic
                          ? "text-slate-600 dark:text-slate-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {c.author?.name}
                    </p>
                  )}

                  <p
                    className={`text-[13px] leading-relaxed ${
                      c.__optimistic
                        ? "text-slate-600 dark:text-slate-400"
                        : isOwn
                        ? "text-white"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {c.text}
                  </p>

                  {/* Timestamp on hover */}
                  <div
                    className={`
                    absolute -bottom-5 text-[10px] text-slate-400 dark:text-slate-500
                    opacity-0 group-hover:opacity-100 transition-opacity
                    ${isOwn ? "right-0" : "left-0"}
                  `}
                  >
                    {new Date(c.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="py-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-2">
            <Send size={20} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Be the first to comment
          </p>
        </div>
      )}

      {/* INPUT FORM */}
      <form
        onSubmit={handleSubmit}
        className={`
          flex items-end gap-3 pt-3
          transition-all duration-200
        `}
      >
        {/* Avatar */}
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
            {user.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Input Container */}
        <div className="flex-1 relative">
          <div
            className={`
              relative rounded-2xl overflow-hidden
              transition-all duration-200
              ${
                isFocused
                  ? "ring-2 ring-blue-500/30 dark:ring-blue-400/30 shadow-md"
                  : "ring-1 ring-slate-200 dark:ring-slate-700"
              }
            `}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={handleKeyPress}
              placeholder="Write a comment..."
              maxLength={maxLength}
              disabled={loading}
              className="
                w-full bg-white dark:bg-slate-800 
                px-4 py-3 pr-12
                text-sm text-slate-700 dark:text-slate-200
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />

            {/* Character Counter */}
            {text.length > maxLength * 0.8 && (
              <div
                className={`
                absolute right-12 top-1/2 -translate-y-1/2
                text-[10px] font-medium
                ${
                  text.length >= maxLength
                    ? "text-red-500"
                    : "text-slate-400 dark:text-slate-500"
                }
              `}
              >
                {text.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Hint Text */}
          <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 px-1">
            Press Enter to send
          </p>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className={`
            shrink-0 h-9 w-9 rounded-full
            flex items-center justify-center
            transition-all duration-200
            ${
              text.trim() && !loading
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-110 active:scale-95"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }
          `}
          aria-label="Send comment"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} strokeWidth={2.5} />
          )}
        </button>
      </form>
    </div>
  );
}