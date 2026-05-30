import { useMemo, useState } from "react";
import { ChevronDown, ShieldCheck, FileText, TrendingUp, Lock, EyeOff, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PartnerDetailsFaq() {
  const { t } = useTranslation();
  const faqs = useMemo(
    () => [
      {
        q: t("partner.faq.q1.question"),
        a: t("partner.faq.q1.answer"),
      },
      {
        q: t("partner.faq.q2.question"),
        a: t("partner.faq.q2.answer"),
      },
      {
        q: t("partner.faq.q3.question"),
        a: t("partner.faq.q3.answer"),
      },
      {
        q: t("partner.faq.q4.question"),
        a: t("partner.faq.q4.answer"),
      },
    ],
    [t]
  );

  return (
    <section className="mt-10 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT: 3 cards nội dung */}
        <div className="lg:col-span-2 space-y-6">
          <InfoBlock
            id="safe"
            icon={<ShieldCheck className="w-5 h-5" />}
            title={t("partner.info.safe.title")}
            subtitle={t("partner.info.safe.subtitle")}
            bullets={[
              { icon: <Lock className="w-4 h-4" />, text: t("partner.info.safe.bullet1") },
              { icon: <EyeOff className="w-4 h-4" />, text: t("partner.info.safe.bullet2") },
              { icon: <BadgeCheck className="w-4 h-4" />, text: t("partner.info.safe.bullet3") },
            ]}
            desc={t("partner.info.safe.desc")}
          />

          <InfoBlock
            id="start"
            icon={<FileText className="w-5 h-5" />}
            title={t("partner.info.start.title")}
            subtitle={t("partner.info.start.subtitle")}
            bullets={[
              { icon: <span className="w-4 h-4 rounded-full bg-sky-600" />, text: t("partner.info.start.bullet1") },
              { icon: <span className="w-4 h-4 rounded-full bg-indigo-600" />, text: t("partner.info.start.bullet2") },
              { icon: <span className="w-4 h-4 rounded-full bg-cyan-600" />, text: t("partner.info.start.bullet3") },
            ]}
            desc={t("partner.info.start.desc")}
          />

          <InfoBlock
            id="reach"
            icon={<TrendingUp className="w-5 h-5" />}
            title={t("partner.info.reach.title")}
            subtitle={t("partner.info.reach.subtitle")}
            bullets={[
              { icon: <span className="w-4 h-4 rounded-full bg-emerald-600" />, text: t("partner.info.reach.bullet1") },
              { icon: <span className="w-4 h-4 rounded-full bg-amber-500" />, text: t("partner.info.reach.bullet2") },
              { icon: <span className="w-4 h-4 rounded-full bg-rose-500" />, text: t("partner.info.reach.bullet3") },
            ]}
            desc={t("partner.info.reach.desc")}
          />
        </div>

        {/* RIGHT: FAQ accordion */}
        <div id="faq" className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{t("partner.faq.title")}</h3>

          <div className="mt-5 space-y-3">
            {faqs.map((f, idx) => (
              <FaqItem key={idx} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ id, icon, title, subtitle, bullets, desc }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-700">
            {icon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-sky-700">{title}</div>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-slate-100">{subtitle}</h2>

            <div className="mt-4 space-y-2">
              {bullets.map((b, i) => (
                <div key={i} className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <div className="mt-1 text-slate-500 dark:text-slate-400">{b.icon}</div>
                  <div className="leading-relaxed">{b.text}</div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 overflow-hidden cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="font-semibold text-slate-900 dark:text-slate-100">{q}</div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}