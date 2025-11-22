import { useEffect, useRef, useState } from "react";
import api from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { Send, Paperclip, Smile, Mic } from "lucide-react";

export default function ChatWindow({ messages, reload, mentorId }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      await api.post(`/mentorship/chat/${mentorId}`, { text: text.trim() });
      setText("");
      await reload();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-3 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-950 dark:to-gray-950">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <div className="mb-2 text-lg">👋</div>
            <p className="font-medium mb-1">Start your mentorship conversation</p>
            <p className="max-w-xs text-[11px] md:text-xs">
              Ask about career paths, interview prep, projects, or anything you
              need help with.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              msg.sender?._id &&
              user?._id &&
              msg.sender._id.toString() === user._id.toString();

            return (
              <div
                key={msg._id}
                className={`flex w-full ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-3 py-2 text-xs md:text-sm shadow-sm relative ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {/* Sender name + time */}
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-medium opacity-80">
                      {isMe ? "You" : msg.sender?.name || "Mentor"}
                    </span>
                    <span className="text-[9px] opacity-70">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap leading-snug">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 md:px-4 py-2.5">
        <div className="flex items-end gap-2">
          {/* Left icons */}
          <div className="hidden md:flex flex-col gap-2 mr-1">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 text-yellow-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1">
            <div className="relative">
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message…"
                className="w-full resize-none rounded-full md:rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 md:px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {/* Mic icon (mobile) */}
              <div className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <Mic className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4 md:w-4.5 md:h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
