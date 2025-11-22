import { useRef, useState } from "react";
import api from "@/services/apiClient";
import {
  Image as ImageIcon,
  Video,
  Sparkles,
  Loader2,
  X,
  Smile,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";

/**
 * CreatePostBox — Enhanced Professional Version
 * ---------------------------------------------
 * - Polished, minimal design with smooth animations
 * - Enhanced media preview with hover effects
 * - Better visual hierarchy and spacing
 * - Improved focus states and interactions
 * - Glass-morphism inspired styling
 */

export default function CreatePostBox({
  context = "USER",
  communityId = null,
  onPostCreated,
}) {
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [text, setText] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  /* ──────────────────────────────────────────────
     VISIBILITY
  ──────────────────────────────────────────────── */
  const visibility =
    context === "ADMIN"
      ? "PUBLIC"
      : context === "COMMUNITY"
      ? "COMMUNITY"
      : "FOLLOWERS";

  /* ──────────────────────────────────────────────
     MEDIA HANDLING
  ──────────────────────────────────────────────── */
  const handleFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setMedia((prev) => [...prev, ...list].slice(0, 6));
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  /* ──────────────────────────────────────────────
     CREATE POST
  ──────────────────────────────────────────────── */
  const handlePost = async () => {
    if (!text.trim() && media.length === 0) return;

    const formData = new FormData();
    formData.append("text", text.trim());
    formData.append("type", context);
    formData.append("visibility", visibility);

    if (communityId) {
      formData.append("community", communityId);
    }

    media.forEach((file) => {
      formData.append("media", file);
    });

    setLoading(true);
    try {
      await api.post("/feed", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setText("");
      setMedia([]);
      onPostCreated?.();
    } catch (err) {
      console.error("❌ Post create failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasContent = text.trim() || media.length > 0;

  /* ──────────────────────────────────────────────
     UI
  ──────────────────────────────────────────────── */
  return (
    <div
      className={`
        relative rounded-2xl border bg-white dark:bg-slate-900 
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        ${
          isFocused
            ? "border-blue-500/40 dark:border-blue-400/40 shadow-lg shadow-blue-500/10"
            : "border-slate-200 dark:border-slate-800"
        }
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-purple-500/[0.02] dark:from-blue-400/[0.03] dark:to-purple-400/[0.03] rounded-2xl pointer-events-none" />

      <div className="relative p-5">
        {/* USER + INPUT */}
        <div className="flex gap-4 items-start">
          <Avatar className="h-11 w-11 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 transition-all">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
              {user?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <Textarea
              placeholder="Share something with your campus…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="
                min-h-[80px] resize-none rounded-xl 
                bg-slate-50/50 dark:bg-slate-800/50 
                border-slate-200/60 dark:border-slate-700/60
                focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20
                focus-visible:border-blue-500/40 dark:focus-visible:border-blue-400/40
                focus-visible:bg-white dark:focus-visible:bg-slate-800
                transition-all duration-200
                placeholder:text-slate-400 dark:placeholder:text-slate-500
              "
            />
          </div>
        </div>

        {/* MEDIA PREVIEW */}
        {media.length > 0 && (
          <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-3 gap-3">
              {media.map((file, idx) => {
                const url = URL.createObjectURL(file);
                const isVideo = file.type.startsWith("video");

                return (
                  <div
                    key={idx}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 animate-in fade-in zoom-in-95 duration-200"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {isVideo ? (
                      <video
                        src={url}
                        className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        muted
                      />
                    ) : (
                      <img
                        src={url}
                        alt="preview"
                        className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    {/* Remove button */}
                    <button
                      onClick={() => removeMedia(idx)}
                      className="
                        absolute top-2 right-2 
                        bg-black/70 hover:bg-black text-white 
                        rounded-full p-1.5 
                        opacity-0 group-hover:opacity-100
                        transition-all duration-200
                        hover:scale-110 active:scale-95
                        backdrop-blur-sm
                      "
                      aria-label="Remove media"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>

                    {/* Video indicator */}
                    {isVideo && (
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
                        <Video size={12} className="text-white" />
                        <span className="text-[10px] text-white font-medium">
                          VIDEO
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          {/* LEFT - Media Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-slate-600 dark:text-slate-400
                hover:bg-blue-50 dark:hover:bg-blue-500/10
                hover:text-blue-600 dark:hover:text-blue-400
                transition-all duration-200
                active:scale-95
              "
              aria-label="Add image"
            >
              <ImageIcon size={18} strokeWidth={2} />
              <span className="text-sm font-medium hidden sm:inline">Photo</span>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-slate-600 dark:text-slate-400
                hover:bg-purple-50 dark:hover:bg-purple-500/10
                hover:text-purple-600 dark:hover:text-purple-400
                transition-all duration-200
                active:scale-95
              "
              aria-label="Add video"
            >
              <Video size={18} strokeWidth={2} />
              <span className="text-sm font-medium hidden sm:inline">Video</span>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-slate-600 dark:text-slate-400
                hover:bg-amber-50 dark:hover:bg-amber-500/10
                hover:text-amber-600 dark:hover:text-amber-400
                transition-all duration-200
                active:scale-95
                sm:hidden
              "
              aria-label="Add emoji"
            >
              <Smile size={18} strokeWidth={2} />
            </button>

            <div className="hidden lg:flex items-center">
              <button
                disabled
                className="
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  bg-gradient-to-r from-slate-100 to-slate-50 
                  dark:from-slate-800 dark:to-slate-800/50
                  text-slate-400 dark:text-slate-500
                  cursor-not-allowed
                  border border-slate-200/50 dark:border-slate-700/50
                "
              >
                <Sparkles size={16} strokeWidth={2} />
                <span className="text-xs font-medium">AI Assist</span>
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* POST BUTTON */}
          <Button
            onClick={handlePost}
            disabled={loading || !hasContent}
            className={`
              rounded-full px-6 py-2.5 font-semibold
              transition-all duration-200
              ${
                hasContent && !loading
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
              }
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span className="hidden sm:inline">Posting...</span>
              </span>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}