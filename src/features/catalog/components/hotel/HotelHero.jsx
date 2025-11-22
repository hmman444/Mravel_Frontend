import { useMemo, useState, useMemo as useReactMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HotelHero() {
  const banners = useMemo(
    () => [
      {
        id: "bn1",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/11/13/1763015291415-ccfd305c295d62161ff7165aed9659e4.jpeg?tr=dpr-2,q-75",
        title: "Thấy vé rẻ hơn, Mravel tặng gấp đôi",
        sub: "Siêu ưu đãi cho bạn",
      },
      {
        id: "bn2",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/11/13/1763015291415-ccfd305c295d62161ff7165aed9659e4.jpeg?tr=dpr-2,q-75",
        title: "Mã giảm đến 1 triệu",
        sub: "Áp dụng cho khách sạn chọn lọc",
      },
      {
        id: "bn3",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/11/13/1763015291415-ccfd305c295d62161ff7165aed9659e4.jpeg?tr=dpr-2,q-75",
        title: "Ưu đãi khai trương",
        sub: "Chỉ từ 2.292.000 VND/đêm",
      },
      {
        id: "bn4",
        img: "https://ik.imagekit.io/tvlk/image/imageResource/2025/11/13/1763015291415-ccfd305c295d62161ff7165aed9659e4.jpeg?tr=dpr-2,q-75",
        title: "Trọn gói nghỉ dưỡng 2N1Đ",
        sub: "Chỉ từ 1.250.000 VND/gói",
      },
    ],
    []
  );

  const [mode, setMode] = useState("intro"); // "intro" | "carousel"
  const [index, setIndex] = useState(0);

  const pages = useReactMemo(() => {
    const result = [];
    if (!banners.length) return result;

    for (let i = 0; i < banners.length; i++) {
      const primary = banners[i];
      const secondary = banners[i + 1] ?? null;
      const peek = banners[i + 2] ?? null;

      if (!secondary && !peek && i !== banners.length - 1) continue;
      result.push({ primary, secondary, peek });
    }
    return result;
  }, [banners]);

  const maxIndex = Math.max(0, pages.length - 1);
  const total = pages.length;

  const canPrev = mode === "carousel";
  const canNext = mode === "intro" || (mode === "carousel" && index < maxIndex);

  const next = () => {
    if (!canNext) return;
    if (mode === "intro") {
      setMode("carousel");
      setIndex(0);
      return;
    }
    setIndex((i) => Math.min(maxIndex, i + 1));
  };

  const prev = () => {
    if (!canPrev) return;
    if (mode === "carousel" && index === 0) {
      setMode("intro");
      return;
    }
    setIndex((i) => Math.max(0, i - 1));
  };

  return (
    // giảm pt/pb để hero đỡ dài
    <header className="relative bg-gradient-to-r from-sky-500 to-blue-600 text-white pb-10 pt-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* MOBILE */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold leading-tight">
            Tìm &amp; đặt phòng khách sạn giá tốt chỉ với 3 bước đơn giản!
          </h1>
          <p className="mt-2 text-white/90 text-sm">
            Tìm ưu đãi khách sạn chất lượng trên Mravel
          </p>
        </div>

        {/* DESKTOP HERO ZONE */}
        <div className="hidden md:flex items-center gap-6 h-[220px] lg:h-[240px] overflow-hidden">
          {/* TEXT BÊN TRÁI */}
          <div
            className={[
              "transition-all duration-500 ease-out",
              "transform",
              mode === "intro"
                ? "basis-[38%] opacity-100 translate-x-0"
                : "basis-0 opacity-0 -translate-x-3 pointer-events-none",
            ].join(" ")}
          >
            <h1 className="text-3xl font-bold leading-tight">
              Tìm &amp; đặt phòng khách sạn giá tốt chỉ với 3 bước đơn giản!
            </h1>
            <p className="mt-2 text-white/90 text-base">
              Tìm ưu đãi khách sạn chất lượng trên Mravel
            </p>
          </div>

          {/* SLIDER BÊN PHẢI */}
          <div className="relative transition-all duration-500 ease-out basis-[62%] ml-auto">
            {/* INTRO: 1 full + 1 peek */}
            {mode === "intro" && (
              <div className="flex justify-end">
                <div className="flex gap-4 h-40 lg:h-56 overflow-hidden w-full">
                  <BannerFull banner={banners[0]} className="basis-[70%]" />
                  <BannerPeek banner={banners[1]} className="basis-[30%]" />
                </div>
              </div>
            )}

            {/* CAROUSEL: 2 full + 1 peek */}
            {mode === "carousel" && (
              <div className="relative h-40 lg:h-56 overflow-hidden w-full">
                <div
                  className="flex h-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {pages.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex flex-none w-full gap-4 h-full"
                    >
                      {p.primary && (
                        <BannerFull
                          banner={p.primary}
                          className="basis-[40%]"
                        />
                      )}
                      {p.secondary && (
                        <BannerFull
                          banner={p.secondary}
                          className="basis-[40%]"
                        />
                      )}
                      {p.peek && (
                        <BannerPeek
                          banner={p.peek}
                          className="basis-[35%] -mr-[10%]"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {index < total - 1 && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-sky-500/80 to-transparent" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* NAV BUTTONS */}
        <div className="mt-4 flex items-center justify-center gap-5 text-sm opacity-95">
          <button
            onClick={prev}
            disabled={!canPrev}
            className={[
              "w-8 h-8 flex items-center justify-center rounded-full",
              "transition-transform duration-150",
              canPrev
                ? "text-white hover:scale-110"
                : "text-white/40 cursor-not-allowed",
            ].join(" ")}
            aria-label="Quay lại"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="cursor-pointer hover:opacity-80">
            Xem thêm khuyến mãi
          </span>

          <button
            onClick={next}
            disabled={!canNext}
            className={[
              "w-8 h-8 flex items-center justify-center rounded-full",
              "transition-transform duration-150",
              canNext
                ? "text-white hover:scale-110"
                : "text-white/40 cursor-not-allowed",
            ].join(" ")}
            aria-label="Xem tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------------- BANNER CARD ---------------------- */

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
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