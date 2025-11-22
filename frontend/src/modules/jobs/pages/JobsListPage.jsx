import { useEffect, useState } from "react";
import api from "../../../services/apiClient";
import JobCard from "../components/JobCard";
import JobFilters from "../components/JobFilters";
import { Search, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const allowedToPostJob =
    ["admin", "alumni", "faculty"].includes(user?.role?.toLowerCase());

  const loadJobs = async () => {
    setLoading(true);
    const res = await api.get("/jobs", { params: { search } });
    setJobs(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities for You</h1>
          <p className="text-gray-600">Jobs from alumni & verified companies</p>
        </div>

        {allowedToPostJob && (
          <button
            onClick={() => navigate("/jobs/create")}
            className="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl shadow hover:bg-primary/90"
          >
            <PlusCircle size={18} />
            Post Job
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-lg">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            loadJobs();
          }}
          placeholder="Search job roles, companies, skills…"
          className="w-full pl-10 pr-4 py-3 bg-gray-100 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* FILTERS */}
      <JobFilters onFilter={loadJobs} />

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No jobs found. Try another keyword 🔍
        </div>
      )}

      {/* JOB GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!loading &&
          jobs.map((job) => <JobCard key={job._id} job={job} />)}
      </div>

      {/* FLOATING BUTTON (MOBILE) */}
      {allowedToPostJob && (
        <button
          onClick={() => navigate("/jobs/create")}
          className="md:hidden fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-xl"
        >
          <PlusCircle size={26} />
        </button>
      )}
    </div>
  );
}
