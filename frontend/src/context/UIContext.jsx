// frontend/src/context/UIContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * UIContext
 *
 * Centralized layout/ui state:
 * - sidebarOpen (desktop)
 * - mobileSidebarOpen
 * - rightPanelOpen
 * - modals (open/close by key)
 * - toasts queue (simple toast helper)
 *
 * Designed to be minimal, fast, and predictable.
 *
 * Usage:
 * const { sidebarOpen, toggleSidebar, openModal, showToast, toasts } = useUI();
 */

const UIContext = createContext(null);

// small localStorage helper for booleans with SSR-safety
const safeGet = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "1";
  } catch {
    return fallback;
  }
};

export const UIProvider = ({ children }) => {
  // Desktop sidebar default: open (but remember user's previous preference)
  const [sidebarOpen, setSidebarOpen] = useState(() => safeGet("ui:sidebarOpen", true));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Generic modal map: { modalKey: { open: bool, data: any } }
  const [modals, setModals] = useState({});

  // Toasts queue: array of { id, message, type, timeout }
  const [toasts, setToasts] = useState([]);

  // Persist sidebar preference
  useEffect(() => {
    try {
      localStorage.setItem("ui:sidebarOpen", sidebarOpen ? "1" : "0");
    } catch {}
  }, [sidebarOpen]);

  // Toggle functions
  const toggleSidebar = useCallback(() => setSidebarOpen((s) => !s), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen((s) => !s), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);

  const openRightPanel = useCallback(() => setRightPanelOpen(true), []);
  const closeRightPanel = useCallback(() => setRightPanelOpen(false), []);
  const toggleRightPanel = useCallback(() => setRightPanelOpen((v) => !v), []);

  // Modal helpers
  const openModal = useCallback((key, data = {}) => {
    setModals((m) => ({ ...m, [key]: { open: true, data } }));
  }, []);

  const closeModal = useCallback((key) => {
    setModals((m) => ({ ...m, [key]: { ...(m[key] || {}), open: false } }));
  }, []);

  const setModalData = useCallback((key, data) => {
    setModals((m) => ({ ...m, [key]: { ...(m[key] || {}), data } }));
  }, []);

  // Toast helpers
  const showToast = useCallback((message, { type = "info", timeout = 4500 } = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast = { id, message, type, timeout };
    setToasts((t) => [...t, newToast]);

    // auto-dismiss
    if (timeout && timeout > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, timeout);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // convenience memo
  const value = useMemo(
    () => ({
      // sidebar
      sidebarOpen,
      toggleSidebar,
      openSidebar,
      closeSidebar,

      // mobile sidebar
      mobileSidebarOpen,
      toggleMobileSidebar,
      openMobileSidebar,
      closeMobileSidebar,

      // right panel
      rightPanelOpen,
      openRightPanel,
      closeRightPanel,
      toggleRightPanel,

      // modals
      modals,
      openModal,
      closeModal,
      setModalData,

      // toasts
      toasts,
      showToast,
      dismissToast,
    }),
    [
      sidebarOpen,
      mobileSidebarOpen,
      rightPanelOpen,
      modals,
      toasts,
      toggleSidebar,
      openSidebar,
      closeSidebar,
      toggleMobileSidebar,
      openMobileSidebar,
      closeMobileSidebar,
      openRightPanel,
      closeRightPanel,
      toggleRightPanel,
      openModal,
      closeModal,
      setModalData,
      showToast,
      dismissToast,
    ]
  );

  // Accessibility: close mobile sidebar on escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileSidebarOpen(false);
        setRightPanelOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
};
