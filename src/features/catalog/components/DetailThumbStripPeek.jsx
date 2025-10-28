// src/features/catalog/components/DetailThumbStripPeek.jsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function DetailThumbStripPeek({
  images = [],
  interval = 3200,
  visible = 3,
  gap = 14,
  aspect = 16 / 10,
  edgeFade = 14,
  edgePadding = 10,
  buttonOffset = 28,
  minThumbWidth = 240,
  containerClass = "max-w-7xl",
}) {
  const data = useMemo(
    () =>
      (images || [])
        .filter((i) => !i?.cover && i?.url) // chỉ ảnh con (cover = false)
        .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0)),
    [images]
  );
  if (data.length === 0) return null;

  if (data.length === 1) {
    return (
      <Outer>
        <StripFrame edgeFade={edgeFade} edgePadding={edgePadding}>
          <div className="flex justify-center py-3">
            <ThumbBox src={data[0].url} alt={data[0].caption || ""} widthPx={420} aspect={aspect} />
          </div>
        </StripFrame>
      </Outer>
    );
  }

  return (
    <AnimatedStrip
      items={data}
      interval={interval}
      visible={visible}
      gap={gap}
      aspect={aspect}
      edgeFade={edgeFade}
      edgePadding={edgePadding}
      buttonOffset={buttonOffset}
      minThumbWidth={minThumbWidth}
      containerClass={containerClass}
    />
  );
}

/* ---------------- core ---------------- */

function AnimatedStrip({ items, interval, visible, gap, aspect, edgeFade, edgePadding, buttonOffset, minThumbWidth, containerClass }) {
  const [list, setList] = useState(items);
  const [translate, setTranslate] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1: next, -1: prev

  // Lightbox state
  const [lightboxIdx, setLightboxIdx] = useState(null); // null = đóng

  const outerRef = useRef(null);
  const frameRef = useRef(null);
  const trackRef = useRef(null);

  const stepRef = useRef(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [viewportW, setViewportW] = useState(0); // NEW: chiều rộng khung nhìn

  useEffect(() => setList(items), [items]);

  // Kích thước thumbnail
  useEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const frameW = frame.getBoundingClientRect().width;
      const inner = Math.max(0, frameW - edgePadding * 2);
      const available = inner - (visible - 1) * gap;
      const w = Math.max(minThumbWidth, Math.floor(available / visible));
      setThumbWidth(w);
      stepRef.current = w + gap;
      setViewportW(visible * w + (visible - 1) * gap);
    };
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visible, gap, edgePadding, minThumbWidth]);

  // Auto step
  useEffect(() => {
    if (list.length < 2 || !thumbWidth) return;
    const id = setInterval(() => {
      if (paused || animating) return;
      next();
    }, interval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, list.length, paused, animating, thumbWidth]);

  // Transition end
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onEnd = () => {
      setAnimating(false);
      setTranslate(0);
      setList((prev) => {
        if (prev.length < 2) return prev;
        if (direction === 1) {
          const [first, ...rest] = prev;
          return [...rest, first];
        } else {
          const last = prev[prev.length - 1];
          return [last, ...prev.slice(0, -1)];
        }
      });
      track.style.transition = "none";
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      track.offsetHeight;
      track.style.transition = "";
    };
    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [direction]);

  const next = () => {
    if (animating) return;
    setDirection(1);
    setAnimating(true);
    setTranslate(-stepRef.current);
  };
  const prev = () => {
    if (animating) return;
    setDirection(-1);
    setAnimating(true);
    setTranslate(stepRef.current);
  };

  const trackStyle = {
    transform: `translateX(${translate}px)`,
    transition: animating ? "transform 600ms ease" : undefined,
    gap: `${gap}px`,
  };

  // Lightbox handlers
  const openLightbox = (index) => setLightboxIdx(index);
  const closeLightbox = () => setLightboxIdx(null);

  // ESC để đóng
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    if (lightboxIdx !== null) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx]);

  return (
    <Outer refObj={outerRef} className={containerClass}>
      {/* Nút điều hướng — ngoài strip */}
      <PlainArrow side="left"  onClick={prev}  offset={buttonOffset} />
      <PlainArrow side="right" onClick={next}  offset={buttonOffset} />

      <StripFrame
        refObj={frameRef}
        edgeFade={edgeFade}
        edgePadding={edgePadding}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="overflow-hidden mx-auto" style={{ width: viewportW || undefined, visibility: viewportW ? "visible" : "hidden" }}>
          <div ref={trackRef} className="flex items-center" style={trackStyle}>
            {list.map((img, idx) => (
              <div key={`${img.url}-${idx}`} className="shrink-0">
                <ThumbBox
                  src={img.url}
                  alt={img.caption || ""}
                  widthPx={thumbWidth}
                  aspect={aspect}
                  onClick={() => openLightbox(idx)}
                />
              </div>
            ))}
          </div>
        </div>
      </StripFrame>

      {/* Lightbox đơn giản: click vùng tối để đóng */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <img
            src={list[lightboxIdx]?.url}
            alt={list[lightboxIdx]?.caption || ""}
            className="max-w-[92vw] max-h-[86vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} // tránh đóng khi click vào ảnh
          />
        </div>
      )}
    </Outer>
  );
}

/* ---------------- layout helpers ---------------- */

function Outer({ children, refObj, className }) {
  return (
    <div ref={refObj} className={`relative ${className} mx-auto px-6 mt-8`}>
      {children}
    </div>
  );
}

function StripFrame({ children, edgeFade = 14, edgePadding = 10, className = "", refObj, ...rest }) {
  return (
    <div
      ref={refObj}
      className={`rounded-2xl shadow-lg bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/40 ${className}`}
      style={{
        overflow: "hidden",
        paddingLeft: edgePadding,
        paddingRight: edgePadding,
        WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${edgeFade}px, black calc(100% - ${edgeFade}px), transparent 100%)`,
        maskImage: `linear-gradient(to right, transparent 0, black ${edgeFade}px, black calc(100% - ${edgeFade}px), transparent 100%)`,
      }}
      {...rest}
    >
      <div className="p-3">{children}</div>
    </div>
  );
}

function PlainArrow({ side = "left", onClick, offset = 28 }) {
  const isLeft = side === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2
        ${isLeft ? `left-0 -translate-x-[calc(100%+${offset}px)]` : `right-0 translate-x-[calc(100%+${offset}px)]`}
        select-none text-6xl md:text-7xl leading-none
        text-black/70 hover:text-black/95 dark:text-white/80 dark:hover:text-white
        drop-shadow-lg`}
      aria-label={isLeft ? "Previous" : "Next"}
    >
      {isLeft ? "‹" : "›"}
    </button>
  );
}

function ThumbBox({ src, alt, widthPx = 280, aspect = 16 / 10, onClick }) {
  const heightPx = Math.round(widthPx / aspect);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
      className="rounded-xl overflow-hidden focus:outline-none"
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />
    </button>
  );
}