import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { ArrowLeft, Briefcase, PlusCircle, IndianRupee } from "lucide-react";

export default function JobCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ============================
  // ACCESS RESTRICTION
  // ============================
  if (user?.role === "student") {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-500 mt-2">
          Only verified alumni, faculty, or admin can post jobs.
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="mt-6 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ============================
  // FORM STATE
  // ============================
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    employmentType: "Full-Time",
    mode: "On-site", // NEW: job mode
    description: "",
    skills: "",
    minSalary: "",
    maxSalary: "",
    currency: "INR",
  });

  const [skillsArray, setSkillsArray] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================
  // SKILLS AS CHIPS
  // ============================
  const handleSkillInput = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, skills: value }));

    const formatted = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSkillsArray(formatted);
  };

  // ============================
  // SUBMIT HANDLER
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Salary object banana (agar dono given hain)
      let salaryRange;
      if (form.minSalary && form.maxSalary) {
        salaryRange = {
          min: Number(form.minSalary),
          max: Number(form.maxSalary),
          currency: form.currency || "INR",
        };
      }

      const payload = {
        title: form.title,
        company: form.company,
        location: form.location,
        employmentType: form.employmentType,
        mode: form.mode, // NEW
        description: form.description,
        skills: skillsArray,
        ...(salaryRange && { salaryRange }), // sirf tab bhejna jab filled ho
      };

      const res = await api.post("/jobs", payload);
      console.log("Job create response:", res.data);

      alert("Job posted successfully 🎉");
      navigate("/jobs");
    } catch (err) {
      console.error("Job post error:", err?.response?.data || err.message);
      alert(
        err?.response?.data?.message ||
          "Failed to post job. Please check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase size={24} className="text-primary" />
            Post a Job Opportunity
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Share internships, full-time roles, or referrals with BCET students & alumni.
          </p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-xl p-8 border border-gray-200 rounded-2xl shadow-xl space-y-6"
      >
        {/* GRID: BASIC DETAILS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* JOB TITLE */}
          <div>
            <label className="font-medium text-gray-800 block">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
              placeholder="Software Engineer Intern"
            />
          </div>

          {/* COMPANY */}
          <div>
            <label className="font-medium text-gray-800 block">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
              placeholder="Google, TCS, Infosys"
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="font-medium text-gray-800 block">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
              placeholder="Bangalore / Remote"
            />
          </div>

          {/* EMPLOYMENT TYPE */}
          <div>
            <label className="font-medium text-gray-800 block">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={form.employmentType}
              onChange={handleChange}
              className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
            >
              <option>Full-Time</option>
              <option>Internship</option>
              <option>Part-Time</option>
              <option>Contract</option>
            </select>
          </div>
        </div>

        {/* MODE + SALARY RANGE */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* MODE */}
          <div>
            <label className="font-medium text-gray-800 block">
              Work Mode
            </label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
            >
              <option>On-site</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>
          </div>

          {/* MIN SALARY */}
          <div>
            <label className="font-medium text-gray-800 block">
              Min Salary (per year)
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-3 py-3 bg-gray-100 rounded-lg border border-gray-300">
                <IndianRupee size={18} className="text-gray-500" />
              </span>
              <input
                type="number"
                name="minSalary"
                value={form.minSalary}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
                placeholder="e.g. 600000"
              />
            </div>
          </div>

          {/* MAX SALARY */}
          <div>
            <label className="font-medium text-gray-800 block">
              Max Salary (per year)
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-3 py-3 bg-gray-100 rounded-lg border border-gray-300">
                <IndianRupee size={18} className="text-gray-500" />
              </span>
              <input
                type="number"
                name="maxSalary"
                value={form.maxSalary}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
                placeholder="e.g. 1200000"
              />
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="font-medium text-gray-800 block">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
            required
            className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
            placeholder="Explain role, responsibilities, tech stack, eligibility..."
          />
        </div>

        {/* SKILLS */}
        <div>
          <label className="font-medium text-gray-800 block">
            Required Skills (comma separated)
          </label>

          <input
            type="text"
            name="skills"
            value={form.skills}
            onChange={handleSkillInput}
            className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/40 outline-none"
            placeholder="React, Node.js, MongoDB"
          />

          {/* LIVE SKILL TAGS */}
          {skillsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skillsArray.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <PlusCircle size={18} />
          {loading ? "Publishing..." : "Publish Job"}
        </button>

        <p className="text-xs text-gray-500 text-center mt-2">
          Once posted, your job may be visible to students after admin verification
          (based on your platform rules).
        </p>
      </form>
    </div>
  );
}
