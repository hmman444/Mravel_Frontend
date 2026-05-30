import { useTranslation } from "react-i18next";

export default function HeroSection({ children }) {
  const { t } = useTranslation();
  return (
    <section
      className="relative bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/mountain-bg.jpg)" }}
    >
      {/* Main dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-slate-950/90" />

      {/* Soft color glow overlay */}
      <div className="absolute inset-0 opacity-70 mix-blend-soft-light pointer-events-none">
        <div className="w-[620px] h-[620px] rounded-full bg-sky-500/25 blur-3xl absolute -top-40 -left-40" />
        <div className="w-[520px] h-[520px] rounded-full bg-amber-400/20 blur-3xl absolute -bottom-40 right-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[540px] md:min-h-[620px] items-center py-16 md:py-20">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-[11px] md:text-xs text-sky-100 mb-4 shadow-sm shadow-sky-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-wide">
                Mravel • {t("home.hero_badge")}
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight drop-shadow-[0_8px_24px_rgba(15,23,42,0.8)]">
              {t("home.hero_heading_1")}
              <span className="text-sky-300"> {t("home.hero_heading_2")}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-3 md:mt-4 text-base md:text-lg text-sky-100/90 max-w-xl leading-relaxed">
              {t("home.hero_subtitle")}
            </p>
          </div>

          {/* SearchBar / children in glass card */}
          {children && (
            <div className="mt-6 md:mt-8">
              <div
                className="
                  relative z-30
                  rounded-2xl bg-black/25 border border-white/12
                  shadow-[0_18px_45px_rgba(15,23,42,0.85)]
                  backdrop-blur-lg
                  p-3 sm:p-4 md:p-5
                  transform translate-y-0
                  transition-all duration-300
                  hover:bg-black/30
                "
              >
                {children}
              </div>
            </div>
          )}

          {/* Feature chips */}
          <div className="relative z-10 mt-6 md:mt-7 flex flex-wrap gap-3 text-[11px] md:text-xs text-sky-100/85">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span>✈️</span>
              <span>{t("home.chip_destinations")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span>🧭</span>
              <span>{t("home.chip_flexible")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span>🤝</span>
              <span>{t("home.chip_community")}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50 dark:to-gray-950" />
    </section>
  );
}
