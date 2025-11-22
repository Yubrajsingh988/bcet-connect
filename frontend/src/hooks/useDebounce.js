// src/hooks/useDebounce.js
import { useState, useEffect, useRef, useCallback } from "react";
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
export function useDebouncedCallback(fn, wait = 300, options = {}) {
  const timer = useRef(null);
  const lastArgs = useRef(null);
  const leadingCalled = useRef(false);
  const savedFn = useRef(fn);

  // keep latest fn reference
  useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    lastArgs.current = null;
    leadingCalled.current = false;
  }, []);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      const args = lastArgs.current;
      lastArgs.current = null;
      leadingCalled.current = false;
      if (args) savedFn.current(...args);
    }
  }, []);

  const debounced = useCallback(
    (...args) => {
      lastArgs.current = args;
      const invokeLeading = options.leading && !leadingCalled.current;

      if (invokeLeading) {
        leadingCalled.current = true;
        savedFn.current(...args);
        // still start timer to reset leadingCalled after wait
        timer.current = setTimeout(() => {
          timer.current = null;
          leadingCalled.current = false;
          lastArgs.current = null;
        }, wait);
        return;
      }

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        leadingCalled.current = false;
        const callArgs = lastArgs.current;
        lastArgs.current = null;
        if (callArgs) savedFn.current(...callArgs);
      }, wait);
    },
    [wait, options.leading]
  );

  // cleanup on unmount
  useEffect(() => cancel, [cancel]);

  // attach helpers to the function so callers can control it
  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}
