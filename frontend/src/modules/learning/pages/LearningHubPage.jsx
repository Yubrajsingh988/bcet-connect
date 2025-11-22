// src/modules/learning/pages/LearningHubPage.jsx

import { useEffect, useState } from "react";
import api from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import SkillCard from "../components/SkillCard";
import LearningPathWidget from "../components/LearningPathWidget";
import ResourceCard from "../components/ResourceCard";
import { Search, Sparkles } from "lucide-react";

export default function LearningHubPage() {
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [goalRole, setGoalRole] = useState("Full Stack Developer");
  const [loadingPath, setLoadingPath] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  // Fetch Resources
  const loadResources = async () => {
    try {
      setLoadingResources(true);
      const res = await api.get("/learning/resources");
      setResources(res.data.data || []);
    } finally {
      setLoadingResources(false);
    }
  };

  // Fetch AI Path
  const loadLearningPath = async () => {
    try {
      setLoadingPath(true);
      const res = await api.post("/learning/learning-path", { goalRole });
      setLearningPath(res.data.data || null);
    } finally {
      setLoadingPath(false);
    }
  };

  useEffect(() => {
    loadResources();
    loadLearningPath();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 bg-transparent">
      
      {/* ---------------- HEADER ----------------- */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          Learning Hub
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Personalized roadmap, AI-powered recommendations & curated resources
        </p>
      </header>

      {/* ---------------- YOUR SKILLS SECTION ----------------- */}
      <section className="glass-card rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-3">Your Skills</h2>

        <div className="flex flex-wrap gap-2">
          {user?.skills?.length ? (
            user.skills.map((s) => <SkillCard key={s} skill={s} />)
          ) : (
            <p className="text-sm text-gray-500">
              No skills added yet. Add skills from your Profile to get personalized recommendations.
            </p>
          )}
        </div>
      </section>

      {/* ---------------- AI LEARNING PATH SECTION ----------------- */}
      <section className="glass-card rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-md space-y-5">

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🚀 AI Learning Path
          </h2>

          {/* GOAL INPUT */}
          <div className="flex gap-2 items-center">
            <input
              className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg text-sm"
              value={goalRole}
              onChange={(e) => setGoalRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
            <button
              onClick={loadLearningPath}
              disabled={loadingPath}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              {loadingPath ? "Generating..." : "Update"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loadingPath && !learningPath ? (
          <p className="text-sm text-gray-500">Preparing your path...</p>
        ) : (
          <LearningPathWidget
            path={learningPath}
            onRefresh={loadLearningPath}
          />
        )}
      </section>

      {/* ---------------- RESOURCES SECTION ----------------- */}
      <section className="glass-card rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-md">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Recommended Resources</h2>

          {loadingResources && <span className="text-xs text-gray-500">Loading...</span>}
        </div>

        {resources.length === 0 && !loadingResources ? (
          <p className="text-sm text-gray-500">
            No learning resources found. Add some resources from backend panel.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {resources.map((r) => (
              <ResourceCard key={r._id} resource={r} onChange={loadResources} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
