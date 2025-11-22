// src/hooks/useNotifications.js
// Robust notifications hook for TopNavbar / NotificationsPanel
// - pagination (page/limit)
// - optimistic mark-read / mark-all-read
// - delete
// - realtime via socket ("notification:receive")
// - uses apiClient/socket singletons (adjust import paths if different)

import { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/apiClient"; // your axios instance
import socket from "../services/socket"; // your app-level socket singleton

// Optional: if you created notificationService wrapper, prefer that.
// import notificationService from "../services/notificationService";

export default function useNotifications({ pageSize = 20, listenOnSocket = true } = {}) {
  const [items, setItems] = useState([]); // notifications array
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const abortRef = useRef(null);

  // Helper to safely set state from responses with varying shapes
  const normalizeListResponse = (resData) => {
    // expected: { success: true, data: { total, items, unreadCount? } }
    // also accept: { total, items } or raw items array
    if (!resData) return { total: 0, items: [], unreadCount: 0 };
    if (resData.data && typeof resData.data === "object") {
      const d = resData.data;
      return {
        total: d.total ?? 0,
        items: Array.isArray(d.items) ? d.items : (Array.isArray(d) ? d : []),
        unreadCount: d.unreadCount ?? (Array.isArray(d.items) ? d.items.filter(n => !n.read).length : 0)
      };
    }
    if (Array.isArray(resData)) {
      return { total: resData.length, items: resData, unreadCount: resData.filter(n => !n.read).length };
    }
    if (typeof resData.total !== "undefined" && Array.isArray(resData.items)) {
      return { total: resData.total, items: resData.items, unreadCount: resData.items.filter(n => !n.read).length };
    }
    return { total: 0, items: [], unreadCount: 0 };
  };

  const fetchPage = useCallback(async (p = 1, opts = {}) => {
    // opts.signal for cancellation
    const signal = opts.signal;
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = { page: p, limit: pageSize };
      const res = await api.get("/notifications", { params, signal });
      const normalized = normalizeListResponse(res.data);
      if (p === 1) {
        setItems(normalized.items);
      } else {
        setItems(prev => [...prev, ...normalized.items]);
      }
      setTotal(normalized.total);
      setHasMore((p * pageSize) < normalized.total);
      // prefer explicit unread count if backend provides it, else compute locally
      const unreadCount = (res.data?.data?.unreadCount ?? normalized.unreadCount ?? (normalized.items || []).filter(n => !n.read).length);
      setUnread(unreadCount);
      setPage(p);
      return normalized;
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        // cancelled - ignore
        return null;
      }
      console.error("Failed to fetch notifications:", err);
      throw err;
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]);

  // initial load
  useEffect(() => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchPage(1, { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [fetchPage]);

  // load more
  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    if (!hasMore && page > 1) return;
    const next = page + 1;
    const controller = new AbortController();
    abortRef.current = controller;
    await fetchPage(next, { signal: controller.signal });
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  // reload (refresh)
  const reload = useCallback(async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    await fetchPage(1, { signal: controller.signal });
  }, [fetchPage]);

  // unread count endpoint (optional)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      // expected res.data.data.unreadCount
      const uc = res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0;
      setUnread(uc);
      return uc;
    } catch (err) {
      console.error("Failed to fetch unread count", err);
      return null;
    }
  }, []);

  // mark a single notification read (optimistic)
  const markRead = useCallback(async (id) => {
    // optimistic update
    setItems(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    try {
      await api.post(`/notifications/${id}/mark-read`);
      // optionally re-fetch unread count
      // await fetchUnreadCount();
    } catch (err) {
      // rollback if fails
      console.error("markRead failed", err);
      // refetch list to ensure consistency
      reload();
    }
  }, [fetchUnreadCount, reload]);

  // mark all read (optimistic)
  const markAllRead = useCallback(async () => {
    // optimistic: mark all local as read
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
    try {
      await api.post("/notifications/mark-all-read");
    } catch (err) {
      console.error("markAllRead failed", err);
      reload();
    }
  }, [reload]);

  // delete notification
  const deleteNotification = useCallback(async (id) => {
    // optimistic remove
    const prev = items;
    setItems(prevItems => prevItems.filter(n => !(n._id === id || n.id === id)));
    try {
      await api.delete(`/notifications/${id}`);
      // re-calc unread
      setUnread(prev => Math.max(0, prev - (prev.find?.(n => n._id === id || n.id === id)?.read ? 0 : 1) || 0));
    } catch (err) {
      console.error("deleteNotification failed", err);
      setItems(prev); // rollback
      reload();
    }
  }, [items, reload]);

  // socket handler
  useEffect(() => {
    if (!listenOnSocket || !socket) return;

    const onReceive = (payload) => {
      // payload should be notification object with read flag false
      // keep shape consistent: ensure _id exists
      const notif = payload && (payload._id || payload.id) ? payload : null;
      if (!notif) return;
      // prepend, but avoid duplicates
      setItems(prev => {
        if (prev.some(p => p._id === notif._id || p.id === notif._id || p._id === notif.id)) {
          return prev;
        }
        return [notif, ...prev];
      });
      setTotal(t => t + 1);
      setUnread(u => u + 1);
    };

    socket.on("notification:receive", onReceive);
    // legacy event name fallback
    socket.on("notification:new", onReceive);

    return () => {
      socket.off("notification:receive", onReceive);
      socket.off("notification:new", onReceive);
    };
  }, [listenOnSocket]);

  // convenience: mark first N items as read when panel opened (optional usage)
  // export API below for caller to implement UI behavior

  return {
    items,
    total,
    page,
    pageSize,
    loading,
    loadingMore,
    hasMore,
    unread,
    loadMore,
    reload,
    fetchUnreadCount,
    markRead,
    markAllRead,
    deleteNotification,
  };
}
