import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Play, ZoomIn, Maximize2 } from "lucide-react";

/**
 * MediaPreview — Enhanced Professional Version
 * -------------------------------------------
 * ✨ Polished minimal design with smooth animations
 * 🎨 Enhanced carousel with indicators
 * 💫 Better fullscreen modal experience
 * 🚀 Optimized performance
 * 🎯 Improved user interactions
 */

export default function MediaPreview({ media = [] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!Array.isArray(media) || media.length === 0) return null;

  const active = media[index];
  const isVideo = active?.type === "video";

  /* ──────────────────────────────────────────────
     NAVIGATION
  ──────────────────────────────────────────────── */
  const next = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % media.length);
    setImageLoaded(false);
  };

  const prev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i - 1 + media.length) % media.length);
    setImageLoaded(false);
  };

  const goTo = (i) => {
    setIndex(i);
    setImageLoaded(false);
  };

  /* ──────────────────────────────────────────────
     KEYBOARD CONTROLS
  ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  /* ──────────────────────────────────────────────
     MEDIA RENDERER (SAFE)
  ──────────────────────────────────────────────── */
  const RenderMedia = ({ fullscreen = false }) => {
    if (isVideo) {
      return (
        <div className="relative group">
          <video
            key={active.url}
            src={active.url}
            controls
            preload="metadata"
            playsInline
            muted={false}
            autoPlay={fullscreen}
            className={`w-full bg-black ${
              fullscreen
                ? "max-h-[90vh]"
                : "max-h-[420px] rounded-xl"
            }`}
          />
          {!fullscreen && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
      );
    }

    return (
      <div className="relative group">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />
        )}
        
        <img
          key={active.url}
          src={active.url}
          alt="media"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onClick={() => !fullscreen && setOpen(true)}
          className={`
            w-full object-contain transition-all duration-300
            ${imageLoaded ? "opacity-100" : "opacity-0"}
            ${
              fullscreen
                ? "max-h-[90vh]"
                : "max-h-[420px] rounded-xl cursor-zoom-in hover:scale-[1.02]"
            }
          `}
        />
        
        {/* Zoom hint overlay */}
        {!fullscreen && imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white">
              <ZoomIn size={18} strokeWidth={2} />
              <span className="text-sm font-medium">Click to expand</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ───────── INLINE PREVIEW ───────── */}
      <div 
        className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <RenderMedia />

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className={`
                absolute left-3 top-1/2 -translate-y-1/2 
                bg-black/70 hover:bg-black text-white 
                p-2.5 rounded-full backdrop-blur-sm
                transition-all duration-300
                hover:scale-110 active:scale-95
                shadow-lg
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
              `}
              aria-label="Previous"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <button
              onClick={next}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2 
                bg-black/70 hover:bg-black text-white 
                p-2.5 rounded-full backdrop-blur-sm
                transition-all duration-300
                hover:scale-110 active:scale-95
                shadow-lg
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
              `}
              aria-label="Next"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </>
        )}

        {/* Media counter badge */}
        {media.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {index + 1} / {media.length}
          </div>
        )}

        {/* Video badge */}
        {isVideo && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
            <Play size={12} fill="white" />
            Video
          </div>
        )}

        {/* Fullscreen button for images */}
        {!isVideo && imageLoaded && (
          <button
            onClick={() => setOpen(true)}
            className={`
              absolute bottom-3 right-3 
              bg-black/70 hover:bg-black text-white 
              p-2 rounded-full backdrop-blur-sm
              transition-all duration-300
              hover:scale-110 active:scale-95
              shadow-lg
              ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
            `}
            aria-label="Fullscreen"
          >
            <Maximize2 size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* Dot indicators */}
        {media.length > 1 && media.length <= 5 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${
                    i === index
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/70"
                  }
                `}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ───────── FULLSCREEN MODAL ───────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="
              fixed top-6 right-6 
              bg-white/10 hover:bg-white/20 text-white 
              p-3 rounded-full backdrop-blur-md
              transition-all duration-200
              hover:scale-110 active:scale-95
              z-10 shadow-xl
            "
            aria-label="Close"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* Counter badge */}
          {media.length > 1 && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl z-10">
              {index + 1} / {media.length}
            </div>
          )}

          {/* Media container */}
          <div
            className="relative max-w-[95vw] max-h-[90vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <RenderMedia fullscreen />

            {/* Navigation arrows */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="
                    absolute left-4 top-1/2 -translate-y-1/2 
                    bg-white/10 hover:bg-white/20 text-white 
                    p-4 rounded-full backdrop-blur-md
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                    shadow-xl
                  "
                  aria-label="Previous"
                >
                  <ChevronLeft size={32} strokeWidth={2.5} />
                </button>

                <button
                  onClick={next}
                  className="
                    absolute right-4 top-1/2 -translate-y-1/2 
                    bg-white/10 hover:bg-white/20 text-white 
                    p-4 rounded-full backdrop-blur-md
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                    shadow-xl
                  "
                  aria-label="Next"
                >
                  <ChevronRight size={32} strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Thumbnail strip for multiple images */}
            {media.length > 1 && (
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pb-2">
                {media.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`
                      shrink-0 h-16 w-16 rounded-lg overflow-hidden
                      transition-all duration-200
                      ${
                        i === index
                          ? "ring-2 ring-white scale-110"
                          : "ring-1 ring-white/30 opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    {item.type === "video" ? (
                      <div className="h-full w-full bg-slate-800 flex items-center justify-center">
                        <Play size={20} className="text-white" fill="white" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}