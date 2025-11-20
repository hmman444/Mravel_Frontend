import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCatalogPlaces } from "../hooks/useCatalogPlaces";

/**
 * Carousel ngang - trượt TỪNG MỤC (3/2/1 item per view)
 * - Card bo góc, có khoảng hở giữa các card
 * - Mép trái/phải có gradient fade
 * - Tự chạy 3s, pause khi hover
 */
export default function SuggestedDestinations({ currentSlug, size = 12 }) {
  const navigate = useNavigate();
  const { items, loading, error, fetchPlaces } = useCatalogPlaces();

  useEffect(() => {
    fetchPlaces({ kind: "DESTINATION", page: 0, size });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const list = useMemo(
    () => (items || []).filter((d) => d.slug !== currentSlug),
    [items, currentSlug]
  );

  // responsive items per view
  const getPerView = () => {
    const w = window.innerWidth;
    if (w >= 1280) return 3;
    if (w >= 640) return 2;
    return 1;
  };
  const [perView, setPerView] = useState(getPerView());
  useEffect(() => {
    const onResize = () => setPerView(getPerView());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [index, setIndex] = useState(0);
  const canSlide = list.length > perView;

  // mỗi item chiếm % bề rộng
  const widthPct = perView > 0 ? 100 / perView : 100;

  const next = () => {
    if (!canSlide) return;
    setIndex((i) => (i + 1) % list.length);
  };
  const prev = () => {
    if (!canSlide) return;
    setIndex((i) => (i - 1 + list.length) % list.length);
  };

  // autoplay 3s, pause khi hover
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    if (paused || !canSlide) return;
    timerRef.current = setInterval(next, 3000);
    return () => clearInterval(timerRef.current);
  }, [paused, canSlide, list.length, perView]);

  const go = (slug) => navigate(`/locations/search?spec=${encodeURIComponent(slug)}`);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }
  if (error || list.length === 0) return null;

  // render list x2 để quay vòng mượt
  const doubled = [...list, ...list];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* nút điều hướng */}
      {canSlide && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 border dark:border-white/10 shadow hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 border dark:border-white/10 shadow hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* vùng hiển thị + fade hai mép */}
      <div className="relative overflow-hidden px-8">
        {/* fade trái/phải */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-white dark:from-gray-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-white dark:from-gray-950 to-transparent" />

        {/* track */}
        <div
          className="flex transition-transform duration-500 ease-out -mx-2" /* -mx-2 để cân spacing con px-2 */
          style={{ transform: `translateX(-${index * widthPct}%)` }}
        >
          {doubled.map((p, idx) => {
            const bg = p.coverImageUrl || p.images?.[0]?.url;
            return (
              <div
                key={`${p.slug}-${idx}`}
                className="px-2"
                style={{ width: `${widthPct}%`, flex: `0 0 ${widthPct}%` }}
              >
                <button
                  onClick={() => go(p.slug)}
                  className="block w-full text-left group"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5 dark:ring-white/10">
                    {bg ? (
                      <img
                        src={bg}
                        alt={p.name}
                        className="w-full h-56 object-cover transform group-hover:scale-[1.03] transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gray-100" />
                    )}
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition duration-300" />
                    <div className="absolute inset-0 flex items-end">
                      <div className="w-full p-4">
                        <div className="backdrop-blur-[1px]">
                          <h3 className="text-white text-lg font-semibold drop-shadow">
                            {p.name}
                          </h3>
                          <p className="mt-0.5 text-white/85 text-xs">
                            {p.addressLine || p.provinceName || p.countryCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* dots */}
      {canSlide && (
        <div className="mt-4 flex justify-center gap-2">
          {list.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === index % list.length ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}