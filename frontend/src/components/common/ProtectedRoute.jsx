// frontend/src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ProtectedRoute
 * - children: component(s) to render when allowed
 * - roles: optional array of allowed roles (strings)
 *
 * Usage:
 * <ProtectedRoute roles={['admin','faculty']}>
 *   <AdminPage/>
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles = null }) {
  const { user, token, loading } = useAuth();

  // still checking auth
  if (loading) return <LoadingSpinner />;

  // not authenticated -> redirect to login
  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // if roles provided, normalize check
  if (roles && Array.isArray(roles) && roles.length > 0) {
    const userRole = (user.role || "").toString().toLowerCase();
    const allowed = roles.map((r) => String(r).toLowerCase());
    if (!allowed.includes(userRole)) {
      // role mismatch — show friendly access denied UX
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-600/10 flex items-center justify-center">
              <ShieldAlert className="text-emerald-600" size={36} />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access this page.
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Required role: <strong>{roles.join(", ")}</strong>
              <br />
              Your role: <strong className="text-emerald-600">{user.role}</strong>
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.history.back()}
                className="w-full inline-flex items-center justify-center gap-2 py-3"
              >
                <ArrowLeft size={16} />
                Go Back
              </Button>

              <Button
                asChild
                variant="ghost"
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                <a className="w-full inline-flex items-center justify-center gap-2 py-3">Go Home</a>
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // allowed — render children
  return <>{children}</>;
}
