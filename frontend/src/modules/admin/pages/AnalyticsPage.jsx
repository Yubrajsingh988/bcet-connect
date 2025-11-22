import { useEffect, useState } from "react";
import api from "../../../services/apiClient";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { BarChart3, Loader2, RefreshCcw, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const res = await api.get("/admin/analytics");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: data?.totalUsers,
      color: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      title: "Alumni Registered",
      value: data?.totalAlumni,
      color: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Students Active",
      value: data?.totalStudents,
      color: "bg-sky-50 dark:bg-sky-950/30",
    },
    {
      title: "Approved Jobs",
      value: data?.jobsApproved,
      color: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "Approved Events",
      value: data?.eventsApproved,
      color: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-8 p-4">
      {/* 🔥 HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-indigo-600" /> Platform Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Visual insights into users, jobs, alumni engagement & campus activity.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg 
          bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 
          shadow hover:bg-gray-50 dark:hover:bg-slate-800 text-sm"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing && "animate-spin"}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ❌ ERROR */}
      {error && (
        <p className="text-red-500 bg-red-100 border border-red-200 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300 p-2 rounded">
          {error}
        </p>
      )}

      {/* 📊 TOP METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border shadow-sm ${c.color}`}
          >
            <p className="text-xs text-gray-600 uppercase">{c.title}</p>
            <h2 className="text-2xl font-semibold mt-1">{c.value}</h2>
          </div>
        ))}
      </div>

      {/* 📈 INSIGHTS BANNER */}
      <div className="rounded-xl p-4 border bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 shadow flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" /> Engagement Insights
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Metrics based on verified users & approved interactions.
          </p>
        </div>
      </div>

      {/* 📉 MAIN CHART SECTION */}
      <div className="rounded-2xl p-4 border shadow bg-white dark:bg-slate-900 dark:border-slate-700">
        <AnalyticsCharts data={data || { users: [], jobs: [], communityPie: {} }} />
      </div>

      {/* 📌 "More Detail CTA" */}
      <div className="text-center py-8 text-gray-500 text-sm">
        🔍 More advanced analytics coming soon: retention curves, alumni hiring, event heatmaps.
      </div>
    </div>
  );
}
