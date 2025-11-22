import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 h-screen w-screen flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50">
      
      {/* Main Spinner */}
      <div className="relative">
        <Loader2 
          className="animate-spin text-primary drop-shadow-lg" 
          size={48} 
        />
        
        {/* Pulse ring effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-gray-700 dark:text-gray-300 font-medium text-lg animate-pulse">
        Loading, please wait…
      </p>

      {/* Skeleton Bars */}
      <div className="mt-8 w-80 space-y-3">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse delay-75" />
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse delay-150" />
      </div>

      {/* Brand watermark */}
      <p className="mt-12 text-xs text-gray-400 dark:text-gray-600 tracking-wider">
        BCET CONNECT
      </p>
    </div>
  );
}