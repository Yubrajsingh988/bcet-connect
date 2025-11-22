// src/modules/communities/pages/CommunityCreatePage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/apiClient";
import { Plus, Image as ImageIcon } from "lucide-react";

// ⚠️ If you're using shadcn/ui, you can optionally replace
// inputs/buttons with their components. For now this is
// Tailwind-first and will work directly.

export default function CommunityCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    banner: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Community name is required.";
    if (form.description.trim().length < 20) {
      errors.description = "Description should be at least 20 characters.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setTouched({ name: true, description: true, banner: true });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/communities", form);

      // OPTIONAL: You can replace this alert with a toast
      // if you already have a global toast system.
      alert("Community created successfully!");

      // Navigate to communities list or detail page
      if (res.data?.data?._id) {
        navigate(`/communities/${res.data.data._id}`);
      } else {
        navigate("/communities");
      }
    } catch (err) {
      console.error("Community create error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to create community. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const errors = validate();
  const descriptionLength = form.description.trim().length;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-5">
          <p className="text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400 uppercase">
            Communities
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Create a new community
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Bring students, alumni, and mentors together in one focused space.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-lg shadow-slate-900/5 dark:shadow-black/40 backdrop-blur-sm">
          {/* Optional banner preview */}
          <BannerPreview banner={form.banner} />

          <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
            {/* Global error */}
            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/60 px-3 py-2.5 text-xs md:text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Community Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                Community name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. BCET Web Dev Club"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500"
              />
              {touched.name && errors.name && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe what this community is about, who should join, and what kind of discussions will happen."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 resize-none"
              />
              <div className="flex items-center justify-between">
                {touched.description && errors.description ? (
                  <p className="text-[11px] text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tip: A clear description helps students understand why they
                    should join.
                  </p>
                )}
                <span className="text-[11px] text-slate-400">
                  {descriptionLength}/280
                </span>
              </div>
            </div>

            {/* Banner URL */}
            <div className="space-y-1.5">
              <label
                htmlFor="banner"
                className="text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                Banner image URL
                <span className="text-[10px] font-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-2.5">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    id="banner"
                    name="banner"
                    value={form.banner}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Paste an image URL for the community banner"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Recommended: wide image (16:9), minimum 1200×400 px.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                You can manage members, channels, and permissions after
                creating the community.
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs md:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create community</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Banner Preview Component
─────────────────────────────────────────────── */

function BannerPreview({ banner }) {
  const showPlaceholder = !banner;

  return (
    <div className="h-32 md:h-40 w-full overflow-hidden rounded-t-2xl border-b border-slate-200/70 dark:border-slate-800 bg-gradient-to-r from-blue-600 via-violet-600 to-sky-500 relative">
      {showPlaceholder ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-white/80 text-xs md:text-sm">
          <p className="font-medium">Your community banner</p>
          <p className="text-[11px] text-white/70">
            Add an image URL to personalize this space.
          </p>
        </div>
      ) : (
        <img
          src={banner}
          alt="Community banner preview"
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to gradient if URL is invalid
            e.target.style.display = "none";
          }}
        />
      )}

      {/* Overlay gradient for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}
