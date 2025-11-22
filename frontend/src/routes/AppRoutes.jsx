import { Routes, Route, Navigate } from "react-router-dom";

// AUTH
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";

// PROFILE
import MyProfilePage from "../modules/profile/pages/MyProfilePage";
import PublicProfilePage from "../modules/profile/pages/PublicProfilePage";

// FEED
import FeedPage from "../modules/feed/pages/FeedPage";

// JOBS
import JobsListPage from "../modules/jobs/pages/JobsListPage";
import JobDetailPage from "../modules/jobs/pages/JobDetailPage";
import JobCreatePage from "../modules/jobs/pages/JobCreatePage";

// EVENTS
import EventsListPage from "../modules/events/pages/EventsListPage";
import EventDetailPage from "../modules/events/pages/EventDetailPage";
import EventCreatePage from "../modules/events/pages/EventCreatePage";

// COMMUNITIES
import CommunitiesListPage from "../modules/communities/pages/CommunitiesListPage";
import CommunityDetailPage from "../modules/communities/pages/CommunityDetailPage";
import CommunityCreatePage from "../modules/communities/pages/CommunityCreatePage";

// MENTORSHIP
import MentorsPage from "../modules/mentorship/pages/MentorsPage";
import MentorshipChatPage from "../modules/mentorship/pages/MentorshipChatPage";

import LearningHubPage from "../modules/learning/pages/LearningHubPage";


// LAYOUTS & AUTH
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC AUTH ROUTES ================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* DEFAULT → FEED */}
      <Route path="/" element={<Navigate to="/feed" replace />} />


      {/* ================= PROTECTED CORE APP ROUTES ================= */}

      {/* 🌍 FEED */}
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FeedPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* ================= PROFILE ROUTES ================= */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MyProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PublicProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* ================= JOBS MODULE ROUTES ================= */}
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <JobsListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <JobDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <JobCreatePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* ================= EVENTS MODULE ROUTES ================= */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EventsListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EventDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EventCreatePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* ================= COMMUNITIES MODULE ROUTES ================= */}
      <Route
        path="/communities"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CommunitiesListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/communities/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CommunityDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/communities/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CommunityCreatePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* ================= MENTORSHIP MODULE ROUTES ================= */}
      <Route
        path="/mentors"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MentorsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* CHAT WITH MENTOR */}
      <Route
        path="/mentors/chat/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MentorshipChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* ================= OPTIONAL DASHBOARD PAGE ================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LearningHubPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />



      {/* ================= 404 ROUTE ================= */}
      <Route
        path="*"
        element={
          <h1 className="p-6 text-center text-xl font-bold">
            404 | Page Not Found
          </h1>
        }
      />

    </Routes>
  );
}
