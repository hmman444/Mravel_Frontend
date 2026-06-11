import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

function gridClass(len) {
  switch (len) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-2";
    case 3: return "grid-cols-2";
    case 4: return "grid-cols-2";
    default: return "grid-cols-3";
  }
}

export default function PlanMedia({ images = [], videos = [], full = false, canEdit = false, onRemove = null }) {
  const { t } = useTranslation();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Merge into unified items array: { type: 'image'|'video', src }
  const allItems = [
    ...images.map((src) => ({ type: "image", src })),
    ...videos.map((src) => ({ type: "video", src })),
  ];

  const openViewer = (index) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const showPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? allItems.length - 1 : prev - 1));

  const showNext = () =>
    setCurrentIndex((prev) => (prev === allItems.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    if (!viewerOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewerOpen, allItems.length]);

  if (!allItems.length) return null;

  const shown = full ? allItems : allItems.slice(0, 6);
  const remain = full ? 0 : allItems.length - shown.length;

  const thumbClass =
    "w-full h-40 md:h-48 object-cover cursor-zoom-in transition-transform duration-200 hover:scale-[1.03]";

  return (
    <>
      <div
        className={`grid ${gridClass(shown.length)} gap-2 rounded-xl overflow-hidden mt-2 bg-gray-100/60 dark:bg-gray-800/60`}
      >
        {shown.map((item, idx) => {
          const handleClick = () => openViewer(idx);
          const isLast = !full && idx === 5 && remain > 0;
          const isWide = allItems.length === 3 && idx === 0;

          const deleteBtn = canEdit && onRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(item.type, item.src); }}
              className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          );

          const thumbnail =
            item.type === "image" ? (
              <img
                src={item.src}
                className={thumbClass}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                }}
              />
            ) : (
              <div className="relative w-full h-40 md:h-48 bg-black flex items-center justify-center cursor-zoom-in">
                <video
                  src={item.src}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-2">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );

          if (isWide) {
            return (
              <div key={idx} className="relative group col-span-2">
                <button type="button" onClick={handleClick} className="w-full">
                  {item.type === "image" ? (
                    <img
                      src={item.src}
                      className="w-full h-72 md:h-80 object-cover cursor-zoom-in transition-transform duration-200 hover:scale-[1.02]"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                      }}
                    />
                  ) : (
                    <div className="relative w-full h-72 md:h-80 bg-black flex items-center justify-center">
                      <video src={item.src} className="w-full h-full object-cover" preload="metadata" muted />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                          <PlayIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </button>
                {deleteBtn}
              </div>
            );
          }

          if (isLast) {
            return (
              <div key={idx} className="relative group">
                <button type="button" onClick={handleClick} className="w-full relative">
                  {thumbnail}
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white text-xl font-semibold">
                    <span>+{remain}</span>
                    <span className="mt-1 text-xs opacity-80">{t("feed.media.viewAll")}</span>
                  </div>
                </button>
                {deleteBtn}
              </div>
            );
          }

          return (
            <div key={idx} className="relative group">
              <button type="button" onClick={handleClick} className="w-full">
                {thumbnail}
              </button>
              {deleteBtn}
            </div>
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
                className="absolute -top-10 right-0 md:-top-12 p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="relative w-full">
                <button
                  type="button"
                  onClick={showPrev}
                  className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white transition"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {allItems[currentIndex]?.type === "video" ? (
                  <video
                    key={allItems[currentIndex].src}
                    src={allItems[currentIndex].src}
                    controls
                    autoPlay
                    className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl bg-black"
                  />
                ) : (
                  <img
                    src={allItems[currentIndex]?.src}
                    className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl bg-black/60"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={showNext}
                  className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white transition"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between w-full text-xs text-gray-200">
                <span className="px-3 py-1 rounded-full bg-black/40">
                  {currentIndex + 1} / {allItems.length}
                </span>
                <div className="hidden sm:flex gap-1">
                  {allItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-10 h-8 rounded-md overflow-hidden border-2 transition ${
                        idx === currentIndex
                          ? "border-sky-400"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.src}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <PlayIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
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
