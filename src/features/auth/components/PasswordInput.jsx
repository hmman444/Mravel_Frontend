import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function PasswordInput({ label, icon: Icon = LockClosedIcon, ...props }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const resolvedLabel = label ?? t("common.password");

  return (
    <label className="block">
      <span className="text-sm text-gray-600 dark:text-gray-400">{resolvedLabel}</span>
      <div className="relative mt-1">
        <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

        <input
          {...props}
          type={show ? "text" : "password"}
          className="block w-full pl-10 pr-12 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
        >
          {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
    </label>
  );
}
