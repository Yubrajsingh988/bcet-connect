// src/modules/communities/pages/CommunityDetailPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../services/apiClient";
import ChannelSidebar from "../components/ChannelSidebar";
import CommunityFeed from "../components/CommunityFeed";
import CommunityMembers from "../components/CommunityMembers";
import { Users, Info, MessagesSquare, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState("posts"); // posts | members | about
  const [joining, setJoining] = useState(false);

  const loadCommunity = async () => {
    try {
      const res = await api.get(`/communities/${id}`);
      setCommunity(res.data.data);
    } catch (err) {
      console.error("Community fetch error:", err);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [id]);

  const isMember = community?.members?.some((m) => m._id === user?._id);

  const handleJoin = async () => {
    if (!user) return alert("Login required!");
    setJoining(true);

    try {
      await api.post(`/communities/${id}/join`);
      loadCommunity();
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setJoining(true);

    try {
      await api.post(`/communities/${id}/leave`);
      loadCommunity();
    } finally {
      setJoining(false);
    }
  };

  if (!community)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ─── HERO BANNER SECTION ───────────────────────── */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-b-3xl shadow-lg overflow-hidden">
        {community.banner && (
          <img
            src={community.banner}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            alt="community banner"
          />
        )}

        <div className="absolute bottom-5 left-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">
            {community.name}
          </h1>

          <p className="text-sm md:text-base opacity-90 mt-1 max-w-xl">
            {community.description}
          </p>

          <div className="flex items-center gap-2 text-sm mt-3 font-medium">
            <Users className="h-4 w-4" />
            {community.members?.length} Members
          </div>
        </div>

        {/* Join/Leave Button */}
        <div className="absolute bottom-5 right-6">
          {isMember ? (
            <button
              onClick={handleLeave}
              disabled={joining}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg shadow"
            >
              {joining ? "Leaving..." : "Leave Community"}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-4 py-2 bg-white text-blue-600 hover:bg-slate-100 text-sm rounded-lg shadow"
            >
              {joining ? "Joining..." : "Join Community"}
            </button>
          )}
        </div>
      </div>

      {/* ─── TAB NAVIGATION ───────────────────────── */}
      <div className="flex gap-4 px-6 py-3 border-b bg-white dark:bg-slate-900 shadow-sm text-sm">
        <TabBtn
          label="Posts"
          icon={<MessagesSquare className="h-4 w-4" />}
          active={activeTab === "posts"}
          onClick={() => setActiveTab("posts")}
        />
        <TabBtn
          label="Members"
          icon={<Users className="h-4 w-4" />}
          active={activeTab === "members"}
          onClick={() => setActiveTab("members")}
        />
        <TabBtn
          label="About"
          icon={<Info className="h-4 w-4" />}
          active={activeTab === "about"}
          onClick={() => setActiveTab("about")}
        />
      </div>

      {/* ─── MAIN CONTENT AREA ───────────────────────── */}
      <div className="p-6 mx-auto max-w-7xl flex gap-6">
        {/* LEFT SIDEBAR (channels) */}
        <div className="hidden md:block w-64">
          <ChannelSidebar channels={community.channels} />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 space-y-5">
          {activeTab === "posts" && (
            <CommunityFeed community={community} reload={loadCommunity} />
          )}

          {activeTab === "members" && (
            <CommunityMembers members={community.members} />
          )}

          {activeTab === "about" && (
            <AboutSection community={community} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────
   Tab Button Component
─────────────────────────────── */
function TabBtn({ label, icon, active, onClick }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition text-sm ${
        active
          ? "bg-blue-600 text-white shadow"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

/* ───────────────────────────────
   About Section Component
─────────────────────────────── */
function AboutSection({ community }) {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">About {community.name}</h2>

      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {community.description || "No community description added."}
      </p>

      <div className="mt-5 text-sm text-slate-600 dark:text-slate-400">
        <p>
          Created:{" "}
          <span className="font-medium">
            {new Date(community.createdAt).toLocaleDateString()}
          </span>
        </p>
        <p>Visibility: Public Community</p>
      </div>
    </div>
  );
}
