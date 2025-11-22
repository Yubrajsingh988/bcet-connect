// frontend/src/hooks/useAuth.js
/**
 * Lightweight wrapper around AuthContext's useAuth to keep import paths tidy
 * and to provide a couple of small helpers for common patterns.
 *
 * Usage:
 * import useAuth from "@/hooks/useAuth";
 * const { user, token, login, logout, fetchUnreadNotifications } = useAuth();
 */

import { useMemo } from "react";
import { useAuth as useAuthContext } from "../context/AuthContext";

/**
 * Default export returns everything from AuthContext plus:
 * - isAuthenticated (boolean)
 * - hasRole(roleOrArray) helper
 */
export default function useAuth() {
  const ctx = useAuthContext();

  const isAuthenticated = Boolean(ctx?.token && ctx?.user);

  const hasRole = (roleOrArr) => {
    if (!ctx?.user?.role) return false;
    const userRole = String(ctx.user.role).toLowerCase();
    if (Array.isArray(roleOrArr)) {
      return roleOrArr.map((r) => String(r).toLowerCase()).includes(userRole);
    }
    return String(roleOrArr).toLowerCase() === userRole;
  };

  return useMemo(
    () => ({
      ...ctx,
      isAuthenticated,
      hasRole,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, isAuthenticated]
  );
}
