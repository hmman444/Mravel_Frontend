import { useTranslation } from "react-i18next";

export default function PartnerSection() {
  const { t } = useTranslation();
  return (
    <section className="py-14 md:py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950 dark:via-slate-900 dark:to-sky-950 border-t border-slate-100/80 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
            {t("home.partner_title")}
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-300">
            {t("home.partner_desc")}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-xs md:text-sm">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-emerald-100/80 dark:border-emerald-900/60">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                +50K
              </div>
              <div className="mt-1 text-gray-500 dark:text-gray-400">
                {t("home.partner_stat_searches")}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-emerald-100/80 dark:border-emerald-900/60">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                0đ
              </div>
              <div className="mt-1 text-gray-500 dark:text-gray-400">
                {t("home.partner_stat_fee")}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-emerald-100/80 dark:border-emerald-900/60">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                24/7
              </div>
              <div className="mt-1 text-gray-500 dark:text-gray-400">
                {t("home.partner_stat_support")}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/partner"
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
            >
              {t("home.partner_register")}
            </a>
          </div>
        </div>

        <div className="hidden md:flex justify-end">
          <div className="relative w-full max-w-sm">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/40 via-sky-400/30 to-blue-500/20 blur-3xl opacity-70 pointer-events-none" />
            <div className="relative rounded-2xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t("home.partner_dashboard")}
                  </div>
                  <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    Mravel Partner
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex items-center justify-center text-lg">
                  ✨
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>{t("home.partner_occupancy")}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    87%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("home.partner_avg_rating")}</span>
                  <span className="font-semibold text-amber-500">
                    ★ 4.7 / 5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("home.partner_bookings_30d")}</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    +126
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                {t("home.partner_quote")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
