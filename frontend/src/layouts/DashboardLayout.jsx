// frontend/src/layouts/DashboardLayout.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";

/**
 * DashboardLayout
 *
 * Responsive layout with:
 *  - Desktop sidebar (visible on lg+)
 *  - Mobile drawer sidebar with overlay & focus management
 *  - Top navbar
 *  - Main content area with glass card wrapper
 *
 * Usage:
 * <DashboardLayout>
 *   <YourPage />
 * </DashboardLayout>
 */

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // determine in effect
  const prevActiveElement = useRef(null);
  const drawerRef = useRef(null);
  const resizeTimer = useRef(null);

  // Safe media check (no window access during SSR)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);

    // initial
    checkMobile();

    // debounce resize
    const onResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(checkMobile, 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, []);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    const original = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    if (mobileMenuOpen) {
      // calculate scrollbar width to avoid layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original.overflow || "";
      document.body.style.paddingRight = original.paddingRight || "";
    }

    return () => {
      document.body.style.overflow = original.overflow || "";
      document.body.style.paddingRight = original.paddingRight || "";
    };
  }, [mobileMenuOpen]);

  // Focus management for mobile drawer (basic trap)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    prevActiveElement.current = document.activeElement;

    // move focus into the drawer
    const focusable = drawerRef.current?.querySelector(
      'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
      // basic trap: keep focus inside drawer while open
      if (e.key === "Tab") {
        const focusables = drawerRef.current.querySelectorAll(
          'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // restore focus
      try {
        prevActiveElement.current?.focus?.();
      } catch (_) {}
    };
  }, [mobileMenuOpen]);

  // Toggle handler (stable)
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((s) => !s);
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 transition-colors">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:block shrink-0 border-r border-slate-200 dark:border-slate-800"
        aria-hidden={isMobile ? "true" : "false"}
      >
        <div className="h-screen sticky top-0">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile Drawer + Overlay */}
      {isMobile && (
        <>
          {/* overlay */}
          <div
            className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${
              mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!mobileMenuOpen}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* drawer */}
          <nav
            ref={drawerRef}
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } bg-white dark:bg-slate-900/95 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800`}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
          >
            <div className="h-full overflow-y-auto">
              <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-md w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-300">BC</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">BCET Connect</div>
                </div>
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="p-3">
                <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </nav>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onMenuToggle={toggleMobileMenu} />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            <div
              className="
                bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl
                shadow-xl border border-slate-200/50 dark:border-slate-700
                rounded-2xl p-4 sm:p-6 md:p-8 min-h-[calc(100vh-160px)]
                transition-all duration-200 ease-in-out
              "
            >
              {children}
            </div>

            <footer className="py-5 text-center text-xs text-slate-600 dark:text-slate-400">
              <p>© {new Date().getFullYear()} BCET Connect — Alumni & Student Network</p>
              <div className="flex items-center justify-center gap-4 mt-1">
                <a href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">Privacy</a>
                <span>•</span>
                <a href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">Terms</a>
                <span>•</span>
                <a href="/support" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">Support</a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
