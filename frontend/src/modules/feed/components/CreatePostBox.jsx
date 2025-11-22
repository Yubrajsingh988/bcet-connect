import { useState } from "react";
import api from "../../../services/apiClient";
import { Image, Video, Smile, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../../../context/AuthContext";

export default function CreatePostBox({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text.trim() && media.length === 0) return;

    setLoading(true);
    try {
      await api.post("/feed", { text, media });
      setText("");
      setMedia([]);
      onPostCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-5 border border-gray-200 dark:bg-gray-900/70 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
      {/* TOP SECTION: USER + TEXT INPUT */}
      <div className="flex gap-4 items-start">
        
        {/* USER AVATAR */}
        <Avatar className="shadow-md">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* TEXTAREA */}
        <Textarea
          placeholder="Share something with your campus community..."
          className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl resize-none min-h-[70px] p-3 text-sm focus:ring-2 focus:ring-primary/40"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        
        {/* LEFT ICONS */}
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <button className="hover:text-blue-600 transition-colors">
            <Image size={20} />
          </button>

          <button className="hover:text-purple-600 transition-colors">
            <Video size={20} />
          </button>

          <button className="hover:text-yellow-500 transition-colors">
            <Smile size={20} />
          </button>

          {/* AI ASSIST BUTTON */}
          <button className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md">
            <Sparkles size={14} />
            AI Assist
          </button>
        </div>

        {/* POST BUTTON */}
        <Button
          onClick={handlePost}
          disabled={loading || (!text.trim() && media.length === 0)}
          className="rounded-full px-6 font-medium"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </div>
  );
}
