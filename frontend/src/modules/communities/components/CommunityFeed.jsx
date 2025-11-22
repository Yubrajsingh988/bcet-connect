// src/modules/communities/components/CommunityFeed.jsx

import { useState } from "react";
import api from "../../../services/apiClient";
import {
  Image as ImageIcon,
  Paperclip,
  Smile,
  SendHorizonal,
  Hash,
  Loader2,
} from "lucide-react";

export default function CommunityFeed({ community, reload }) {
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  const currentChannel = "general"; // future: pass activeChannel prop

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Write something before posting.");
      return;
    }

    try {
      setIsPosting(true);
      setError("");

      await api.post(`/communities/${community._id}/post`, {
        channel: currentChannel,
        text: trimmed,
      });

      setText("");
      reload && reload();
    } catch (err) {
      console.error("Post failed", err);
      setError("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const posts = community.posts || [];
  const totalMembers = community.members?.length || 0;

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {community.name}
          </h1>
          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <Hash className="h-3 w-3" />
            {currentChannel}
          </span>
        </div>

        {community.description && (
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {community.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span>{totalMembers} members</span>
          <span>•</span>
          <span>{posts.length} posts</span>
        </div>
      </header>

      {/* Composer Card */}
      <section
        className="
          rounded-2xl border border-slate-200/80 dark:border-slate-800
          bg-white/90 dark:bg-slate-950/90
          shadow-sm
          px-4 py-3 md:px-5 md:py-4
          flex flex-col gap-2.5
        "
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-900 px-2 py-0.5">
              <Hash className="h-3 w-3" />
              <span className="font-medium text-[11px]">
                Post in #{currentChannel}
              </span>
            </span>
            <span className="hidden md:inline">
              Share an update, doubt, or resource with the community.
            </span>
          </div>
        </div>

        <div className="mt-1">
          <textarea
            placeholder="Share something with your community..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError("");
            }}
            rows={3}
            className="
              w-full resize-none border-none outline-none
              rounded-xl
              bg-slate-50 dark:bg-slate-900
              px-3 py-2
              text-sm text-slate-900 dark:text-slate-50
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700
            "
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          {/* Attachments / actions - future ready */}
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[11px] text-slate-400 dark:text-slate-500">
              {text.trim().length}/500
            </span>
            <button
              type="button"
              onClick={handlePost}
              disabled={isPosting}
              className="
                inline-flex items-center gap-1.5
                rounded-full
                bg-slate-900 text-slate-50
                dark:bg-slate-100 dark:text-slate-900
                px-3.5 py-1.5
                text-xs font-medium
                shadow-sm
                hover:brightness-105
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all
              "
            >
              {isPosting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendHorizonal className="h-3.5 w-3.5" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </section>

      {/* Posts Section */}
      <section className="space-y-3 mt-1">
        {posts.length === 0 ? (
          <div
            className="
              rounded-2xl border border-dashed border-slate-200 dark:border-slate-800
              bg-slate-50/80 dark:bg-slate-950/80
              px-4 py-6 md:px-6
              text-center
            "
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              No posts yet in #{currentChannel}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
              Be the first one to start a discussion and bring this community
              to life.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const authorName = post.user?.name || "Member";
            const initial = authorName?.[0]?.toUpperCase() || "M";
            const createdAtLabel = post.createdAt
              ? new Date(post.createdAt).toLocaleString()
              : null;

            return (
              <article
                key={post._id}
                className="
                  rounded-2xl border border-slate-200/80 dark:border-slate-800
                  bg-white/90 dark:bg-slate-950/90
                  shadow-xs
                  px-3.5 py-3 md:px-4 md:py-3.5
                  hover:shadow-md hover:-translate-y-[1px]
                  transition-all
                "
              >
                <header className="flex items-start gap-3">
                  <div
                    className="
                      flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-full
                      bg-gradient-to-br from-slate-900 to-slate-700
                      dark:from-slate-100 dark:to-slate-300
                      text-xs font-semibold text-slate-50 dark:text-slate-900
                    "
                  >
                    {initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                          {authorName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          in #{post.channel || currentChannel}
                        </p>
                      </div>
                      {createdAtLabel && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {createdAtLabel}
                        </p>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                      {post.text}
                    </p>
                  </div>
                </header>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
