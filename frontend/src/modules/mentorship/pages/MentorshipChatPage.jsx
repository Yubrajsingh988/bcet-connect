import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../services/apiClient";
import ChatWindow from "../components/ChatWindow";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Loader2,
} from "lucide-react";

export default function MentorshipChatPage() {
  const { id } = useParams(); // mentorId
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingMentor, setLoadingMentor] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);

  // -----------------------------
  // LOAD CHAT + MENTOR
  // -----------------------------
  const loadChat = async () => {
    try {
      setLoadingMessages(true);
      setError(null);
      const res = await api.get(`/mentorship/chat/${id}`);
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load messages. Please try again.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMentor = async () => {
    try {
      setLoadingMentor(true);
      setError(null);
      const res = await api.get(`/mentorship/${id}`);
      setMentor(res.data?.data || null);
    } catch (err) {
      console.error(err);
      setError("Unable to load mentor details. Please try again.");
    } finally {
      setLoadingMentor(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadMentor();
    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isLoading = loadingMentor || loadingMessages;

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (isLoading && !mentor && messages.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div>
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-gray-900 rounded-full mt-2 animate-pulse" />
          </div>
        </div>

        <div className="h-[420px] rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
      </div>
    );
  }

  // -----------------------------
  // MAIN LAYOUT
  // -----------------------------
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-4 md:space-y-6">
      {/* TOP BAR / HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Back button (mobile friendly) */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex md:hidden items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Mentor avatar + meta */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={mentor?.avatar || "/default-avatar.png"}
                alt={mentor?.name || "Mentor"}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-gray-200 dark:border-gray-800"
              />
              {/* Online dot (static for now) */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-semibold tracking-tight">
                  {mentor?.name || "Mentor"}
                </h1>
                <span className="hidden md:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 border border-blue-100 dark:border-blue-800">
                  1:1 Mentorship
                </span>
              </div>

              <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                {mentor?.title || mentor?.role || "Mentor"}{" "}
                {mentor?.company ? `• ${mentor.company}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ACTION ICONS (non-functional placeholders for now) */}
        <div className="hidden md:flex items-center gap-2">
          <button className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            <Phone className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            <Video className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CHAT CONTAINER */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm flex flex-col h-[540px] md:h-[620px] overflow-hidden">
        {/* Sub-header inside card (desktop) */}
        <div className="hidden md:flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active mentorship chat</span>
          </div>
          {loadingMessages && (
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing messages…
            </div>
          )}
        </div>

        {/* CHAT WINDOW (messages + input) */}
        <div className="flex-1 flex flex-col">
          <ChatWindow messages={messages} reload={loadChat} mentorId={id} />
        </div>
      </div>
    </div>
  );
}
