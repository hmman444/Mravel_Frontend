import { useTranslation } from "react-i18next";

export default function BlockDivider() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-700 dark:text-slate-300">
      {t("admin.block_divider_label")}
    </div>
  );
}
