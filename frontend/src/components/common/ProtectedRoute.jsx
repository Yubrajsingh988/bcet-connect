import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();

  // Show beautiful loader while checking auth
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/30 p-8 text-center animate-fade-in">
          
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            <ShieldAlert className="text-white" size={40} />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Access Denied
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Required role: <span className="font-semibold text-red-600">{roles.join(", ")}</span>
            <br />
            Your role: <span className="font-semibold text-primary">{user.role}</span>
          </p>

          {/* Action Button */}
          <Button
            onClick={() => window.history.back()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft size={18} />
            Go Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  // Render protected content with fade-in animation
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}