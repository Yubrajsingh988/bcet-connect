import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors">

      {/* ================= SIDEBAR (Desktop) ================= */}
      <div className="hidden lg:block border-r border-gray-200 dark:border-gray-800">
        <Sidebar />
      </div>

      {/* ================= SIDEBAR (Mobile Overlay) ================= */}
      {isMobile && mobileMenuOpen && (
        <>
          {/* Background dimmer */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 animate-slide-in shadow-2xl">
            <Sidebar />
          </div>
        </>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}
        <TopNavbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* PAGE WRAPPER */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">

          <div className="max-w-7xl mx-auto w-full space-y-6">

            {/* PAGE CONTENT BOX (Glass wrapper) */}
            <div className="
              bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl 
              shadow-xl border border-gray-200/50 dark:border-gray-700 
              rounded-2xl p-6 md:p-8 min-h-[calc(100vh-180px)]
              animate-fade-in transition-all
            ">
              {children}
            </div>

            {/* FOOTER */}
            <footer className="py-5 text-center text-xs text-gray-600 dark:text-gray-400">
              <p>© {new Date().getFullYear()} BCET Connect — Alumni & Student Network</p>

              <div className="flex items-center justify-center gap-4 mt-1">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ANIMATIONS — Add to index.css if missing:

@keyframes slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

*/
