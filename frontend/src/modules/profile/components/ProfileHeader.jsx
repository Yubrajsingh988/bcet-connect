import { useState } from "react";
import {
  Building2,
  GraduationCap,
  Linkedin,
  Github,
  Globe2,
  Camera,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
} from "lucide-react";

/**
 * ProfileHeader — Enhanced Professional Edition
 * -----------------------------------------
 * - Smooth animations & modern glassmorphism
 * - Micro-interactions & hover effects
 * - Professional gradient accents
 * - Optimized performance
 */

export default function ProfileHeader({
  profile,
  isOwner = false,
  onAvatarUpload,
  onUpdateProfile,
}) {
  if (!profile) return null;

  const {
    avatar,
    name,
    role,
    department,
    batch,
    headline,
    bio,
    social = {},
    followersCount = 0,
    followingCount = 0,
    profileCompleteness = 0,
  } = profile;

  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");

  /* ──────────────────────────────
     EDIT FLOW
  ────────────────────────────── */
  const startEdit = (field, value = "") => {
    setEditing(field);
    setDraft(value || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft("");
  };

  const saveEdit = async () => {
    if (!editing) return;

    await onUpdateProfile?.({ [editing]: draft.trim() });
    cancelEdit();
  };

  /* ──────────────────────────────
     AVATAR UPLOAD
  ────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onAvatarUpload?.(file);
  };

  return (
    <section className="relative rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 p-6 md:p-8 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-950/60">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/5 via-cyan-500/5 to-blue-500/5 dark:from-emerald-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        {/* ───────── AVATAR ───────── */}
        <div className="shrink-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative">
              <img
                src={avatar || "/default-avatar.png"}
                alt={name}
                className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl shadow-slate-300/30 dark:shadow-slate-950/50 transition-transform duration-300 group-hover:scale-105"
              />
              
              {isOwner && (
                <>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300"
                  >
                    <Camera className="w-6 h-6 text-white drop-shadow-lg" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </>
              )}
              
              {/* Online Status Indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full shadow-lg">
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          </div>
        </div>

        {/* ───────── INFO ───────── */}
        <div className="flex-1 space-y-5">
          {/* Name & Verification */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              {name}
            </h1>
            <div className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Role / Dept / Batch */}
          <div className="flex flex-wrap gap-2">
            {role && <Badge>{capitalize(role)}</Badge>}
            {department && (
              <Badge color="blue">
                <Building2 className="w-3.5 h-3.5" />
                {department}
              </Badge>
            )}
            {batch && (
              <Badge color="purple">
                <GraduationCap className="w-3.5 h-3.5" />
                Batch {batch}
              </Badge>
            )}
          </div>

          {/* HEADLINE */}
          <EditableBlock
            label="Headline"
            value={headline}
            isOwner={isOwner}
            editing={editing === "headline"}
            onEdit={() => startEdit("headline", headline)}
            onDelete={() => onUpdateProfile?.({ headline: "" })}
          >
            <Editor
              value={draft}
              onChange={setDraft}
              onSave={saveEdit}
              onCancel={cancelEdit}
              placeholder="Add a professional headline"
            />
          </EditableBlock>

          {/* BIO */}
          <EditableBlock
            label="Bio"
            value={bio}
            isOwner={isOwner}
            editing={editing === "bio"}
            onEdit={() => startEdit("bio", bio)}
            onDelete={() => onUpdateProfile?.({ bio: "" })}
          >
            <Editor
              textarea
              value={draft}
              onChange={setDraft}
              onSave={saveEdit}
              onCancel={cancelEdit}
              placeholder="Write a short bio about yourself"
            />
          </EditableBlock>

          {/* FOLLOW INFO */}
          <div className="flex gap-6 text-sm">
            <div className="group cursor-pointer">
              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {followersCount}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">Followers</span>
            </div>
            <div className="group cursor-pointer">
              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {followingCount}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">Following</span>
            </div>
          </div>

          {/* SOCIAL */}
          <div className="flex gap-2 flex-wrap">
            <SocialIcon icon={Linkedin} url={social.linkedin} color="blue" />
            <SocialIcon icon={Github} url={social.github} color="slate" />
            <SocialIcon icon={Globe2} url={social.website} color="emerald" />
          </div>

          {/* PROFILE STRENGTH */}
          <ProfileStrength value={profileCompleteness} />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────
   REUSABLE UI BLOCKS
──────────────────────────────── */

function EditableBlock({
  label,
  value,
  isOwner,
  editing,
  onEdit,
  onDelete,
  children,
}) {
  if (editing) return <div className="animate-in fade-in duration-200">{children}</div>;

  return (
    <div className="group space-y-2 transition-all duration-200">
      {value ? (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {value}
        </p>
      ) : (
        <p className="text-sm italic text-slate-400 dark:text-slate-500">
          No {label.toLowerCase()} added
        </p>
      )}

      {isOwner && (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
          <IconBtn onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </IconBtn>
          {value && (
            <IconBtn danger onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </IconBtn>
          )}
        </div>
      )}
    </div>
  );
}

function Editor({
  value,
  onChange,
  onSave,
  onCancel,
  textarea = false,
  placeholder,
}) {
  const Input = textarea ? "textarea" : "input";

  return (
    <div className="space-y-3">
      <Input
        autoFocus
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex gap-2">
        <IconBtn onClick={onSave} success>
          <Check className="w-4 h-4" />
        </IconBtn>
        <IconBtn danger onClick={onCancel}>
          <X className="w-4 h-4" />
        </IconBtn>
      </div>
    </div>
  );
}

function ProfileStrength({ value }) {
  const label =
    value >= 80 ? "Profile looks great" :
    value >= 50 ? "Good progress" :
    "Complete your profile";

  const color =
    value >= 80 ? "from-emerald-400 to-green-500" :
    value >= 50 ? "from-blue-400 to-cyan-500" :
    "from-amber-400 to-orange-500";

  return (
    <div className="pt-2 space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-600 dark:text-slate-400">Profile strength</span>
        <span className="text-slate-900 dark:text-white">{label} · {value}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-lg transition-all duration-700 ease-out`}
          style={{ width: `${value}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-white/30 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ icon: Icon, url, color = "slate" }) {
  if (!url) return null;
  
  const colors = {
    blue: "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400",
    slate: "hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
    emerald: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400",
  };
  
  return (
    <a
      href={normalizeUrl(url)}
      target="_blank"
      rel="noreferrer"
      className={`p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:scale-110 hover:shadow-lg ${colors[color]}`}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

function Badge({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${colors[color]}`}>
      {children}
    </span>
  );
}

function IconBtn({ children, danger, success, ...props }) {
  const variant = danger
    ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-400 hover:scale-110"
    : success
    ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 dark:hover:border-emerald-400 hover:scale-110"
    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:scale-110";
    
  return (
    <button
      {...props}
      className={`p-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-md ${variant}`}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────── */

function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
}

function capitalize(text) {
  return text ? text[0].toUpperCase() + text.slice(1) : "";
}