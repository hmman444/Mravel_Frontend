import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HotelHero() {
  const { t } = useTranslation();
  const banners = useMemo(
    () => [
      {
        id: "bn1",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/12/22/1766383097281-9677b44f656fe03e7b07d9cc906cac30.jpeg?tr=h-230,q-75,w-472",
        title: t("hotel.banner1_title"),
        sub: t("hotel.banner1_sub"),
      },
      {
        id: "bn2",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/12/14/1765729430496-56dcb18f1fa0c5ca306e5596a0f0db43.jpeg?tr=h-230,q-75,w-472",
        title: t("hotel.banner2_title"),
        sub: t("hotel.banner2_sub"),
      },
      {
        id: "bn3",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/07/09/1752036510252-61e121867314d3e385fb91d0fb67c371.jpeg?tr=dpr-2,h-230,q-75,w-472",
        title: t("hotel.banner3_title"),
        sub: t("hotel.banner3_sub"),
      },
      {
        id: "bn4",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/11/13/1763015291415-ccfd305c295d62161ff7165aed9659e4.jpeg?tr=dpr-2,q-75",
        title: t("hotel.banner4_title"),
        sub: t("hotel.banner4_sub"),
      },
    ],
    [t]
  );

  const n = banners.length;

  // Mỗi "page" luôn có 2 full + 1 peek (wrap-around)
  const slides = useMemo(() => {
    if (!n) return [];
    return banners.map((_, i) => ({
      primary: banners[i],
      secondary: banners[(i + 1) % n],
      peek: banners[(i + 2) % n],
      key: `slide-${i}`,
    }));
  }, [banners, n]);

  // Infinite loop bằng clone: [last, ...slides, first]
  const extended = useMemo(() => {
    if (!slides.length) return [];
    return [slides[n - 1], ...slides, slides[0]];
  }, [slides, n]);

  // current = 1 là slide đầu thật (vì 0 là clone last)
  const [current, setCurrent] = useState(1);
  const [animating, setAnimating] = useState(false);

  const next = useCallback(() => {
    if (!extended.length || animating) return;
    setAnimating(true);
    setCurrent((c) => c + 1);
  }, [extended.length, animating]);

  const prev = useCallback(() => {
    if (!extended.length || animating) return;
    setAnimating(true);
    setCurrent((c) => c - 1);
  }, [extended.length, animating]);

  const handleTransitionEnd = useCallback(() => {
    // Nếu đang ở clone đầu (0) -> nhảy về slide cuối thật (n) không animation
    if (current === 0) {
      setAnimating(false);
      setCurrent(n);
      return;
    }
    // Nếu đang ở clone cuối (n+1) -> nhảy về slide đầu thật (1) không animation
    if (current === n + 1) {
      setAnimating(false);
      setCurrent(1);
      return;
    }
    setAnimating(false);
  }, [current, n]);

  const canNav = n > 1;

  return (
    <header className="relative overflow-hidden text-white pb-10 pt-8">
      {/*  BACKGROUND (dịu, dễ nhìn)  */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9] via-[#2563EB] to-[#1E3A8A]" />
      <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-white/12 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 w-[560px] h-[560px] rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* MOBILE */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
            {t("hotel.hero_heading")}
          </h1>
          <p className="mt-2 text-white/90 text-sm drop-shadow-[0_1px_10px_rgba(0,0,0,0.20)]">
            {t("hotel.hero_sub")}
          </p>

          {/* Mobile: 1 banner (vẫn vòng lặp) */}
          {n > 0 && (
            <div className="mt-4 relative overflow-hidden h-40 rounded-2xl">
              <img
                src={banners[(current - 1 + n) % n]?.img}
                alt={banners[(current - 1 + n) % n]?.title}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-4 text-white drop-shadow">
                <div className="font-bold text-base truncate">
                  {banners[(current - 1 + n) % n]?.title}
                </div>
                <div className="text-sm opacity-90 truncate">
                  {banners[(current - 1 + n) % n]?.sub}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP HERO ZONE */}
        <div className="hidden md:flex items-center gap-6 h-[220px] lg:h-[240px] overflow-hidden">
          {/* TEXT BÊN TRÁI */}
          <div className="basis-[38%]">
            <h1 className="text-3xl font-bold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
              {t("hotel.hero_heading")}
            </h1>
            <p className="mt-2 text-white/90 text-base drop-shadow-[0_1px_10px_rgba(0,0,0,0.20)]">
              {t("hotel.hero_sub")}
            </p>
          </div>

          {/* SLIDER BÊN PHẢI */}
          <div className="relative basis-[62%] ml-auto">
            <div className="relative h-40 lg:h-56 overflow-hidden w-full">
              <div
                className="flex h-full"
                style={{
                  transform: `translateX(-${current * 100}%)`,
                  transition: animating ? "transform 500ms ease-out" : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {extended.map((p, idx) => (
                  <div
                    key={`${p.key}-ext-${idx}`}
                    className="flex flex-none w-full gap-4 h-full"
                  >
                    <BannerFull banner={p.primary} className="basis-[40%]" />
                    <BannerFull banner={p.secondary} className="basis-[40%]" />
                    <BannerPeek
                      banner={p.peek}
                      className="basis-[35%] -mr-[10%]"
                    />
                  </div>
                ))}
              </div>

              {/* gradient mép phải cho đẹp (theo nền mới) */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#1E3A8A]/70 to-transparent" />
            </div>
          </div>
        </div>

        {/* NAV BUTTONS */}
        <div className="mt-4 flex items-center justify-center gap-5 text-sm opacity-95">
          <button
            onClick={prev}
            disabled={!canNav || animating}
            className={[
              "w-8 h-8 flex items-center justify-center rounded-full",
              "transition-transform duration-150",
              canNav && !animating
                ? "text-white hover:scale-110"
                : "text-white/40 cursor-not-allowed",
            ].join(" ")}
            aria-label={t("common.back")}
            title={t("common.back")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="cursor-pointer hover:opacity-80 select-none">
            {t("hotel.see_more_promotions")}
          </span>

          <button
            onClick={next}
            disabled={!canNav || animating}
            className={[
              "w-8 h-8 flex items-center justify-center rounded-full",
              "transition-transform duration-150",
              canNav && !animating
                ? "text-white hover:scale-110"
                : "text-white/40 cursor-not-allowed",
            ].join(" ")}
            aria-label={t("hotel.next")}
            title={t("hotel.next")}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/*  BANNER CARD  */

function BannerFull({ banner, className = "" }) {
  if (!banner) return null;
  return (
    <div
      className={
        "relative flex-shrink-0 h-full rounded-2xl overflow-hidden " + className
      }
    >
      <img
        src={banner.img}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      <div className="absolute bottom-3 left-3 right-4 text-white drop-shadow">
        <div className="font-bold text-lg truncate">{banner.title}</div>
        <div className="text-sm opacity-90 truncate">{banner.sub}</div>
      </div>
    </div>
  );
}

function BannerPeek({ banner, className = "" }) {
  if (!banner) return null;
  return (
    <div
      className={
        "relative flex-shrink-0 h-full rounded-2xl overflow-hidden opacity-90 " +
        className
      }
    >
      <img
        src={banner.img}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/70 to-transparent" />
    </div>
  );
}
