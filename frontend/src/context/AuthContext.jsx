// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api, { getToken as _getToken } from "@/services/apiClient";

/**
 * AuthContext responsibilities:
 * - store user & token
 * - login / logout / update user
 * - auto-load user (GET /auth/me) when token present
 * - expose getToken() helper
 *
 * Keep socket creation out of this context (we'll use SocketContext).
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [loading, setLoading] = useState(Boolean(token)); // if token exists, try auto-load
  const [authReady, setAuthReady] = useState(false);

  // Attach centralized 401 handler to api client
  useEffect(() => {
    api._onUnauthenticated = () => {
      // simple default: clear local auth — consumer can override by subscribing
      handleLogoutLocal();
    };
    return () => {
      api._onUnauthenticated = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure axios header updated whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Auto-load / validate token
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!token) {
        setLoading(false);
        setAuthReady(true);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get("/auth/me"); // expects { data: { ...user } }
        const me = res?.data?.data ?? null;
        if (!mounted) return;
        if (me) {
          setUser(me);
          setRole(me.role || "");
          try {
            localStorage.setItem("user", JSON.stringify(me));
            localStorage.setItem("role", me.role || "");
          } catch {}
        } else {
          // invalid token
          handleLogoutLocal();
        }
      } catch (err) {
        // token invalid -> clear
        handleLogoutLocal();
      } finally {
        if (mounted) {
          setLoading(false);
          setAuthReady(true);
        }
      }
    };
    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // local helper used by this provider to clear auth synchronously
  const handleLogoutLocal = useCallback(() => {
    setToken("");
    setUser(null);
    setRole("");
    setAuthReady(true);
    // clear storage
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    } catch {}
    // clear axios header
    delete api.defaults.headers.common["Authorization"];
  }, []);

  // PUBLIC: login
  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    // Accept multiple common shapes:
    // 1) { data: { user, token } }
    // 2) { data: { token, user } }
    // 3) { data: { ... } } (fallback)
    const payload = res?.data?.data ?? res?.data ?? {};
    const authToken = payload.token || res?.data?.token || "";
    const authUser = payload.user || (payload.id ? payload : null);

    if (!authToken) {
      throw new Error("Authentication token missing from server response");
    }

    // persist token & user
    setToken(authToken);
    localStorage.setItem("token", authToken);

    if (authUser) {
      setUser(authUser);
      setRole(authUser.role || "");
      try {
        localStorage.setItem("user", JSON.stringify(authUser));
        localStorage.setItem("role", authUser.role || "");
      } catch {}
    }

    // attach axios header
    api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

    return authUser;
  }, []);

  // PUBLIC: logout (calls server but doesn't wait)
  const logout = useCallback(async () => {
    try {
      // fire and forget, avoid blocking
      api.post("/auth/logout").catch(() => {});
    } catch {}
    handleLogoutLocal();
  }, [handleLogoutLocal]);

  // PUBLIC: updateUser (local patch & persist)
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (patch?.role) {
      setRole(patch.role);
      try {
        localStorage.setItem("role", patch.role);
      } catch {}
    }
  }, []);

  // PUBLIC: fetch unread count - optional helper (can be used by UI)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      return res?.data?.data?.unreadCount ?? 0;
    } catch {
      return 0;
    }
  }, []);

  // expose a simple getToken helper for other non-React modules
  const getToken = useCallback(() => {
    return _getToken();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      loading,
      authReady,
      login,
      logout,
      updateUser,
      fetchUnreadCount,
      getToken,
    }),
    [user, token, role, loading, authReady, login, logout, updateUser, fetchUnreadCount, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
