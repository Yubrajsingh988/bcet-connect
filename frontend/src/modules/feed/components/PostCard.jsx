import api from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import {
  MoreVertical,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Do you want to delete this post?")) return;
    setIsDeleting(true);
    await api.delete(`/feed/${post._id}`);
    onDelete();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 transition-all hover:shadow-md">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.postedBy.avatar || "/default-avatar.png"}
            className="w-11 h-11 rounded-full object-cover shadow-sm border"
          />

          <div>
            <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white">
              {post.postedBy.name}
            </h3>
            <p className="text-xs text-gray-500">{post.postedBy.role}</p>
          </div>
        </div>

        <MoreVertical size={18} className="text-gray-500 cursor-pointer" />
      </div>

      {/* CONTENT */}
      <p className="mt-4 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line text-[15px]">
        {post.text}
      </p>

      {/* MEDIA PREVIEW */}
      {post.media?.length > 0 && (
        <div className="mt-4 space-y-3">
          {post.media.map((m, i) => (
            <div key={i}>
              {m.type === "image" && (
                <img
                  src={m.url}
                  className="rounded-xl max-h-[450px] w-full object-cover"
                />
              )}
              {m.type === "video" && (
                <video
                  controls
                  className="rounded-xl w-full max-h-[450px] shadow"
                >
                  <source src={m.url} />
                </video>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ACTION BAR */}
      <div className="flex items-center justify-between mt-5 border-t pt-3 text-gray-600 dark:text-gray-400">
        
        {/* Like */}
        <button className="flex items-center gap-2 hover:text-primary transition">
          <Heart size={18} /> Like
        </button>

        {/* Comments */}
        <button className="flex items-center gap-2 hover:text-primary transition">
          <MessageCircle size={18} /> Comment
        </button>

        {/* Share */}
        <button className="flex items-center gap-2 hover:text-primary transition">
          <Share2 size={18} /> Share
        </button>

        {/* Save */}
        <button className="flex items-center gap-2 hover:text-primary transition">
          <Bookmark size={18} /> Save
        </button>
      </div>

      {/* DELETE POST (OWNER or ADMIN) */}
      {(user?._id === post.postedBy._id || user?.role === "admin") && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm hover:underline"
        >
          <Trash2 size={16} /> {isDeleting ? "Deleting..." : "Delete Post"}
        </button>
      )}
    </div>
  );
}
