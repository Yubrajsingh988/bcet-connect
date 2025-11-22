import { useEffect, useState } from "react";
import api from "../../../services/apiClient";
import CreatePostBox from "../components/CreatePostBox";
import PostCard from "../components/PostCard";
import FeedFilters from "../components/FeedFilters";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async (filter) => {
    setLoading(true);
    const res = await api.get("/feed", { params: { filter } });
    setPosts(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadFeed("all");
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-8 px-3 lg:px-0">
      
      {/* CREATE POST CARD */}
      <CreatePostBox onPostCreated={() => loadFeed("all")} />

      {/* FILTER BAR */}
      <FeedFilters onFilter={loadFeed} />

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center text-gray-500 py-10">
          Loading feed...
        </div>
      )}

      {/* FEED POSTS */}
      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No posts yet. Be the first to post!
        </p>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDelete={() => loadFeed("all")} />
      ))}
    </div>
  );
}
