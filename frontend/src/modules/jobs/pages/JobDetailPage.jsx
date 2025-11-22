import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/apiClient";
import JobMatchWidget from "../components/JobMatchWidget";
import { MapPin, Building2, ArrowLeft, Briefcase, Calendar, Send } from "lucide-react";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data.data));
  }, [id]);

  if (!job)
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        Loading job details...
      </div>
    );

  const handleApply = async () => {
    await api.post(`/jobs/${id}/apply`, { resume: "resume.pdf" });
    alert("Applied Successfully! 🎉");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      
      {/* BACK BUTTON + TITLE */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Briefcase className="text-primary" />
          {job.title}
        </h1>
      </div>

      {/* HERO SECTION */}
      <div className="bg-white dark:bg-gray-900/60 shadow-xl border border-gray-200 dark:border-gray-700 p-8 rounded-2xl flex flex-col gap-6">
        {/* Company + Location */}
        <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-300 text-lg">
          <span className="flex items-center gap-2">
            <Building2 size={20} />
            {job.company}
          </span>

          <span className="flex items-center gap-2">
            <MapPin size={20} />
            {job.location}
          </span>

          <span className="flex items-center gap-2">
            <Calendar size={20} />
            Posted recently
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mt-2">
          {job.skills?.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-800/40 dark:text-blue-300 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT SIDE — JOB DESCRIPTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Job Description</h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* AI MATCH SCORE */}
          <JobMatchWidget jobSkills={job.skills} />
        </div>

        {/* RIGHT SIDEBAR — APPLY BOX */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Ready to Apply?</h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Submit your application with one click.
            </p>

            <button
              onClick={handleApply}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Apply Now
            </button>

            <div className="text-xs text-gray-500 text-center pt-1">
              Your resume will be shared securely with posting alumni.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
