// frontend/src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import NotFound from "@/components/common/NotFound";

// --------- Lazy load pages (code-splitting) ---------
// Auth
const LoginPage = lazy(() => import("../modules/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../modules/auth/pages/RegisterPage"));

// Profile
const MyProfilePage = lazy(() => import("../modules/profile/pages/MyProfilePage"));
const PublicProfilePage = lazy(() => import("../modules/profile/pages/PublicProfilePage"));

// Feed
const FeedPage = lazy(() => import("../modules/feed/pages/FeedPage"));

// Jobs
const JobsListPage = lazy(() => import("../modules/jobs/pages/JobsListPage"));
const JobDetailPage = lazy(() => import("../modules/jobs/pages/JobDetailPage"));
const JobCreatePage = lazy(() => import("../modules/jobs/pages/JobCreatePage"));

// Events
const EventsListPage = lazy(() => import("../modules/events/pages/EventsListPage"));
const EventDetailPage = lazy(() => import("../modules/events/pages/EventDetailPage"));
const EventCreatePage = lazy(() => import("../modules/events/pages/EventCreatePage"));

// Communities
const CommunitiesListPage = lazy(() => import("../modules/communities/pages/CommunitiesListPage"));
const CommunityDetailPage = lazy(() => import("../modules/communities/pages/CommunityDetailPage"));
const CommunityCreatePage = lazy(() => import("../modules/communities/pages/CommunityCreatePage"));

// Mentorship
const MentorsPage = lazy(() => import("../modules/mentorship/pages/MentorsPage"));
const MentorshipChatPage = lazy(() => import("../modules/mentorship/pages/MentorshipChatPage"));

// Learning
const LearningHubPage = lazy(() => import("../modules/learning/pages/LearningHubPage"));

// Layouts
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));

/**
 * AuthGuard
 * - If user is already authenticated, redirect away from auth pages to /feed.
 * - Otherwise render children (auth pages).
 */
function AuthGuard({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (token) {
    // already logged in → go to feed
    return <Navigate to="/feed" replace />;
  }

  return children;
}

/**
 * ProtectedLayout
 * - Wraps the app's protected routes: injects ProtectedRoute + DashboardLayout once.
 * - Nested routes render within <Outlet /> inside DashboardLayout.
 */
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </Suspense>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ---------------- Public / Auth (mounted under /auth) ---------------- */}
        <Route
          path="/auth"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AuthGuard>
                <AuthLayout>
                  <Outlet />
                </AuthLayout>
              </AuthGuard>
            </Suspense>
          }
        >
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route index element={<Navigate to="login" replace />} />
        </Route>

        {/* Keep legacy shortcuts for /login and /register (handy for old links) */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AuthGuard>
                <LoginPage />
              </AuthGuard>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AuthGuard>
                <RegisterPage />
              </AuthGuard>
            </Suspense>
          }
        />

        {/* ---------------- Protected App (Dashboard) ---------------- */}
        <Route element={<ProtectedLayout />}>
          {/* redirect root of protected area to feed */}
          <Route index element={<Navigate to="feed" replace />} />

          {/* FEED */}
          <Route path="feed" element={<FeedPage />} />

          {/* PROFILE */}
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="profile/:userId" element={<PublicProfilePage />} />

          {/* JOBS */}
          <Route path="jobs" element={<JobsListPage />} />
          <Route path="jobs/create" element={<JobCreatePage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />

          {/* EVENTS */}
          <Route path="events" element={<EventsListPage />} />
          <Route path="events/create" element={<EventCreatePage />} />
          <Route path="events/:id" element={<EventDetailPage />} />

          {/* COMMUNITIES */}
          <Route path="communities" element={<CommunitiesListPage />} />
          <Route path="communities/create" element={<CommunityCreatePage />} />
          <Route path="communities/:id" element={<CommunityDetailPage />} />

          {/* MENTORSHIP */}
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="mentors/chat/:id" element={<MentorshipChatPage />} />

          {/* LEARNING */}
          <Route path="learning" element={<LearningHubPage />} />

          {/* ---------------- Admin example (showing roles via ProtectedRoute) ---------------- */}
          <Route
            path="admin/*"
            element={
              <ProtectedRoute roles={["admin", "superadmin"]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <DashboardLayout>
                    <Outlet />
                  </DashboardLayout>
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="p-6">Admin Home (build pages under /modules/admin)</div>} />
            {/* add admin child routes here or lazy-load an AdminRoutes file */}
          </Route>

          {/* Optional dashboard overview */}
          <Route path="dashboard" element={<div className="p-6 text-2xl font-semibold">Dashboard Overview (WIP)</div>} />
        </Route>

        {/* ---------------- Root & redirects ---------------- */}
        {/* If user hits bare root outside protected layout, redirect to feed */}
        <Route path="/" element={<Navigate to="/feed" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
