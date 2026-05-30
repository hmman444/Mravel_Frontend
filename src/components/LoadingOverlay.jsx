// src/components/LoadingOverlay.jsx
import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export default function LoadingOverlay({ open, message }) {
  const { t } = useTranslation();
  if (!open) return null;

  const resolvedMessage = message ?? t("common.processing");

  return createPortal(
    <div
      className="
        fixed inset-0 z-[4000]
        bg-black/30 flex items-center justify-center
      "
    >
      <div
        className="
          px-6 py-4 rounded-2xl
          bg-white dark:bg-gray-800 shadow-xl
          text-base font-semibold text-gray-700 dark:text-gray-200
          flex items-center gap-3
        "
      >
        <div
          className="
            w-6 h-6 rounded-full 
            border-4 border-blue-500 border-t-transparent 
            animate-spin
          "
        />
        {resolvedMessage}
      </div>
    </div>,
    document.body
  );
}
