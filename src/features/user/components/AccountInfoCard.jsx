// src/features/user/components/AccountInfoCard.jsx
import { useTranslation } from "react-i18next";
import PersonalInfoForm from "./PersonalInfoForm";

export default function AccountInfoCard() {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 pt-2">
        <div className="flex gap-6 text-sm">
          <span className="pb-3 border-b-2 border-sky-600 text-sky-600 font-semibold">
            {t("user.account_info_tab")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <PersonalInfoForm />
      </div>
    </div>
  );
}