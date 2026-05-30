import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BarChart3, Headphones } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PartnerHeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-7 md:p-10 lg:p-12 items-center">
            {/* LEFT */}
            <div className="text-slate-900 dark:text-slate-100">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
                {t("partner.hero.title_prefix")}{" "}
                <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  {t("partner.hero.title_highlight")}
                </span>
                <br />
                {t("partner.hero.title_suffix")}
              </h1>

              <p className="mt-4 text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">
                {t("partner.hero.description")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Pill icon={<Sparkles className="w-4 h-4" />}>
                  {t("partner.hero.benefit_reach")}
                </Pill>
                <Pill icon={<ShieldCheck className="w-4 h-4" />}>
                  {t("partner.hero.benefit_transparent")}
                </Pill>
                <Pill icon={<BarChart3 className="w-4 h-4" />}>
                  {t("partner.hero.benefit_tracking")}
                </Pill>
                <Pill icon={<Headphones className="w-4 h-4" />}>
                  {t("partner.hero.benefit_support")}
                </Pill>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
              <div className="px-7 py-6">
                <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg">{t("partner.hero.signup_title")}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("partner.hero.signup_subtitle")}
                </p>

                <ul className="mt-5 space-y-4 text-slate-700 dark:text-slate-300">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span>{t("partner.hero.feature_create_profile")}</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span>{t("partner.hero.feature_pending_review")}</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span>{t("partner.hero.feature_pause")}</span>
                  </li>
                </ul>

                <div className="mt-6">
                  <Link
                    to="/partner/register"
                    className="w-full inline-flex items-center justify-center gap-2
                               rounded-xl py-4 font-semibold
                               bg-sky-600 text-white hover:bg-sky-700 transition"
                  >
                    {t("partner.hero.start_now")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="text-center mt-4 text-sm text-slate-600 dark:text-slate-400">
                    {t("partner.hero.already_have_account")}{" "}
                    <Link to="/partner/login" className="text-sky-700 font-semibold hover:underline">
                      {t("common.login")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* END CARD */}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-slate-200 dark:border-slate-700 bg-white/70 text-slate-700 dark:text-slate-300">
      <span className="text-sky-700">{icon}</span>
      {children}
    </span>
  );
}