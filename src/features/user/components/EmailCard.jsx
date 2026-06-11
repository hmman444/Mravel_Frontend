// src/features/user/components/EmailCard.jsx
import { useSelector } from "react-redux";
import { Mail, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EmailCard() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const emails = [
    user?.email && { label: t("user.primary_email"), value: user.email, primary: true },
    user?.secondaryEmail && { label: t("user.secondary_email_1"), value: user.secondaryEmail },
    user?.tertiaryEmail && { label: t("user.secondary_email_2"), value: user.tertiaryEmail },
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-500" />
            Email
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("user.email_max_hint")}
          </p>
        </div>
        <button
          type="button"
          disabled
          title={t("coming_soon.title")}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-not-allowed opacity-60"
        >
          <Plus className="w-3 h-3" />
          {t("user.add_email")}
        </button>
      </div>

      <div className="px-4 md:px-6 py-3 text-sm space-y-2">
        {emails.length === 0 && (
          <p className="text-slate-500 dark:text-slate-300">
            {t("user.no_email_hint")}
          </p>
        )}

        {emails.map((e, idx) => (
          <div key={idx} className="space-y-0.5">
            <p className="font-medium">
              {idx + 1}.{" "}
              <span className="text-sky-600 break-all">{e.value}</span>
            </p>
            <p className="text-xs text-slate-400">
              {e.label} {e.primary && <span className="text-emerald-600">· {t("user.notification_recipient")}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}