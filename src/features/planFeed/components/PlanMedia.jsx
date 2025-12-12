import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";  
function gridClass(len) {
  switch (len) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-2";
    case 4:
      return "grid-cols-2";
    default:
      return "grid-cols-3";
  }
}

export default function PlanMedia({ images = [], full = false }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  
  const openViewer = (index) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const showPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!viewerOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewerOpen, images.length]); // có thể thêm closeViewer, showPrev, showNext nếu eslint exhaustive-deps báo

  // Hook đã được gọi xong, giờ mới được return conditionally
  if (!images.length) return null;

  const shown = full ? images : images.slice(0, 6);
  const remain = full ? 0 : images.length - shown.length;

  const thumbClass =
    "w-full h-40 md:h-48 object-cover cursor-zoom-in transition-transform duration-200 hover:scale-[1.03]";

  return (
    <>
      <div
        className={`
          grid ${gridClass(shown.length)} gap-2
          rounded-xl overflow-hidden mt-2
          bg-gray-100/60 dark:bg-gray-800/60
          
        `}
      >
        {shown.map((src, idx) => {
          const handleClick = () => openViewer(idx);

          if (images.length === 3 && idx === 0) {
            return (
              <button
                type="button"
                key={idx}
                onClick={handleClick}
                className="col-span-2"
              >
                <img
                  src={src}
                  className="w-full h-72 md:h-80 object-cover cursor-zoom-in transition-transform duration-200 hover:scale-[1.02]"
                />
              </button>
            );
          }

          if (!full && idx === 5 && remain > 0) {
            return (
              <button
                type="button"
                key={idx}
                onClick={handleClick}
                className="relative"
              >
                <img src={src} className={thumbClass} />
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white text-xl font-semibold">
                  <span>+{remain}</span>
                  <span className="mt-1 text-xs opacity-80">Xem tất cả</span>
                </div>
              </button>
            );
          }

          return (
            <button type="button" key={idx} onClick={handleClick}>
              <img src={src} className={thumbClass} />
            </button>
          );
        })}
      </div>

      {viewerOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={closeViewer}
          >
            <div
              className="relative max-w-4xl w-full mx-4 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeViewer}
                className="
                  absolute -top-10 right-0 md:-top-12
                  p-1.5 rounded-full bg-black/60 hover:bg-black
                  text-white transition
                "
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="relative w-full">
                <button
                  type="button"
                  onClick={showPrev}
                  className="
                    hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2
                    items-center justify-center w-9 h-9 rounded-full
                    bg-black/60 hover:bg-black text-white
                    transition
                  "
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <img
                  src={images[currentIndex]}
                  className="
                    max-h-[75vh] w-full object-contain
                    rounded-xl shadow-2xl bg-black/60
                  "
                />

                <button
                  type="button"
                  onClick={showNext}
                  className="
                    hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2
                    items-center justify-center w-9 h-9 rounded-full
                    bg-black/60 hover:bg-black text-white
                    transition
                  "
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between w-full text-xs text-gray-200">
                <span className="px-3 py-1 rounded-full bg-black/40">
                  {currentIndex + 1} / {images.length}
                </span>
                <div className="hidden sm:flex gap-1">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`
                        w-10 h-8 rounded-md overflow-hidden
                        border-2 transition
                        ${
                          idx === currentIndex
                            ? "border-sky-400"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }
                      `}
                    >
                      <img src={src} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

    </>
  );
}
