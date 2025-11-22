// src/hooks/useChat.js
// useChat hook: single socket.io instance + helpers for chat & notification wiring
//
// Requirements:
// - you have `socket.io-client` installed
// - you have an AuthContext exposing useAuth() that returns { user, token }
// - you have an axios instance at ../services/apiClient
//
// Usage:
// const { socket, connected, on, off, sendMessage, getConversations, disconnect } = useChat();

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import api from "../services/apiClient";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || ""; // adapt as needed

// Keep a single socket instance application-wide
let singletonSocket = null;
let singletonRefCount = 0;

export default function useChat({ autoConnect = true } = {}) {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map()); // event => Set(handlers)
  const [connected, setConnected] = useState(false);

  // Create or reuse singleton socket
  const ensureSocket = useCallback(() => {
    if (singletonSocket) return singletonSocket;

    // Create socket with auth token
    const socket = io(SOCKET_URL || "/", {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: {
        token: token || null,
      },
      // optional: increase pingTimeout / reconnection attempts as needed
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // attach basic state handlers
    socket.on("connect", () => {
      // console.log("socket connected", socket.id);
    });
    socket.on("disconnect", (reason) => {
      // console.log("socket disconnected", reason);
    });

    singletonSocket = socket;
    return singletonSocket;
  }, [token]);

  // Connect and set up event forwarding
  useEffect(() => {
    if (!autoConnect) return;

    const socket = ensureSocket();
    socketRef.current = socket;
    singletonRefCount += 1;

    // update auth token dynamically before connect (if token may change)
    if (token) socket.auth = { token };

    // connect if not connected
    if (!socket.connected) socket.connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // re-emit any locally registered handlers to socket (if any)
    for (const [evt, handlers] of listenersRef.current.entries()) {
      handlers.forEach(h => socket.on(evt, h));
    }

    return () => {
      // cleanup: remove handlers we attached here
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);

      // remove all listeners we added through this hook instance
      for (const [evt, handlers] of listenersRef.current.entries()) {
        handlers.forEach(h => socket.off(evt, h));
      }
      listenersRef.current.clear();

      singletonRefCount = Math.max(0, singletonRefCount - 1);
      // optionally disconnect socket when no more consumers
      if (singletonRefCount === 0 && socket) {
        // give server time to handle disconnect gracefully
        socket.disconnect();
        singletonSocket = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensureSocket, token, autoConnect]);

  // public: get raw socket (may be null until created)
  const socket = socketRef.current || singletonSocket;

  // helper to register event handlers (keeps local map for cleanup)
  const on = useCallback((event, handler) => {
    const s = ensureSocket();
    // register in our local map so we can cleanup when hook unmounts
    const set = listenersRef.current.get(event) ?? new Set();
    set.add(handler);
    listenersRef.current.set(event, set);
    s.on(event, handler);
    return () => off(event, handler);
  }, [ensureSocket]);

  const off = useCallback((event, handler) => {
    const s = singletonSocket;
    if (!s) return;
    if (handler) {
      s.off(event, handler);
      const set = listenersRef.current.get(event);
      if (set) {
        set.delete(handler);
        if (set.size === 0) listenersRef.current.delete(event);
      }
    } else {
      s.removeAllListeners(event);
      listenersRef.current.delete(event);
    }
  }, []);

  // send message helper (emit + optional REST fallback)
  // payload: { conversationId, toUserId, text, meta }
  const sendMessage = useCallback(async (payload) => {
    const s = ensureSocket();
    if (s && s.connected) {
      // emit and rely on server ack to persist / forward
      s.emit("chat:send", payload, (ack) => {
        // ack could be { ok: true, storedMessage } or error; handle if needed
      });
      return { ok: true, via: "socket" };
    } else {
      // fallback to REST: POST /chat/message
      try {
        const res = await api.post("/chat/message", payload);
        return { ok: true, via: "rest", data: res.data };
      } catch (err) {
        console.error("sendMessage failed:", err);
        return { ok: false, error: err };
      }
    }
  }, [ensureSocket]);

  // join conversation room (optional convenience)
  const join = useCallback((roomName) => {
    const s = ensureSocket();
    if (!s) return;
    s.emit("room:join", { room: roomName }, (ack) => {
      // optionally check ack
    });
  }, [ensureSocket]);

  const leave = useCallback((roomName) => {
    const s = ensureSocket();
    if (!s) return;
    s.emit("room:leave", { room: roomName }, (ack) => {});
  }, [ensureSocket]);

  // fetch conversations via REST (for the dropdown)
  const getConversations = useCallback(async (params = { page: 1, limit: 20 }) => {
    try {
      const res = await api.get("/chat/conversations", { params });
      // expected shape: { success: true, data: { items: [...], total } }
      return res.data;
    } catch (err) {
      console.error("getConversations failed", err);
      throw err;
    }
  }, []);

  const getConversation = useCallback(async (conversationId, params = { page: 1, limit: 50 }) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}`, { params });
      return res.data;
    } catch (err) {
      console.error("getConversation failed", err);
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    const s = singletonSocket;
    if (s) {
      try {
        s.disconnect();
      } finally {
        singletonSocket = null;
      }
    }
  }, []);

  return {
    socket: singletonSocket,
    connected,
    on,
    off,
    sendMessage,
    join,
    leave,
    getConversations,
    getConversation,
    disconnect,
  };
}
