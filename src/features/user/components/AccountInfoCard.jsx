// src/features/user/components/AccountInfoCard.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PersonalInfoForm from "./PersonalInfoForm";

export default function AccountInfoCard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 pt-2">
        <div className="flex gap-6 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={[
              "pb-3 border-b-2",
              activeTab === "info"
                ? "border-sky-600 text-sky-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {t("user.account_info_tab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={[
              "pb-3 border-b-2",
              activeTab === "security"
                ? "border-sky-600 text-sky-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {t("user.password_security_tab")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {activeTab === "info" ? (
          <PersonalInfoForm />
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <p>{t("user.security_placeholder_note")}</p>
            <ul className="list-disc pl-5">
              <li>{t("user.security_change_password")}</li>
              <li>{t("user.security_two_factor")}</li>
              <li>{t("user.security_manage_devices")}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}