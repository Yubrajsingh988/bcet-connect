// frontend/src/routes/RoleRoutes.jsx
import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AccessDenied from "@/components/common/AccessDenied";

/**
 * Helper: Normalize roles to an array of lowercase strings
 * Accepts string or array (e.g. "admin" or ["admin","faculty"])
 */
export const normalizeRoles = (roles) => {
  if (!roles) return [];
  if (typeof roles === "string") return [roles.toLowerCase()];
  if (Array.isArray(roles)) return roles.map((r) => String(r).toLowerCase());
  return [];
};

/**
 * Helper: check if user has any of the allowed roles (case-insensitive).
 * Returns boolean.
 */
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  const userRole = String(user.role).toLowerCase();
  const allowed = normalizeRoles(roles);
  // superadmin bypass
  if (userRole === "superadmin") return true;
  return allowed.length === 0 ? true : allowed.includes(userRole);
};

/**
 * RoleRoute / RoleGuard component
 *
 * Usage:
 * <RoleRoute roles={['admin','faculty']}>
 *   <AdminPage/>
 * </RoleRoute>
 *
 * If the user is not authenticated -> redirects to /login (or custom redirect)
 * If the user is authenticated but doesn't have required role -> shows AccessDenied
 * You can pass a `fallback` prop to display custom element while loading (optional)
 */
export default function RoleRoute({
  roles,
  children,
  redirectTo = "/login",
  fallback = null,
}) {
  const { user, token, loading } = useAuth();

  // while auth state is initializing, show loader or fallback
  if (loading) {
    return fallback ?? <LoadingSpinner />;
  }

  // not authenticated -> go to login
  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // role check
  if (!hasRole(user, roles)) {
    return <AccessDenied />;
  }

  // allowed -> render children
  return <>{children}</>;
}

RoleRoute.propTypes = {
  roles: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
  fallback: PropTypes.node,
};
