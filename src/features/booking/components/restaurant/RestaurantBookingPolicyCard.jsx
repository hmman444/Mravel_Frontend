import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Info, FileText, X, Clock, CreditCard, PhoneCall, Ban } from "lucide-react";
import { FaUserClock, FaGlassCheers, FaParking, FaWheelchair } from "react-icons/fa";

export default function RestaurantBookingPolicyCard() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const importantNote = {
    title: t("booking.policy_important_note_title"),
    subtitle: t("booking.policy_deposit_hold_title"),
    text: t("booking.policy_important_note_text_restaurant"),
  };

  const sections = [
    {
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      title: t("booking.policy_table_hold_title"),
      text: t("booking.policy_table_hold_text"),
    },
    {
      icon: <CreditCard className="h-4 w-4 text-emerald-600" />,
      title: t("booking.policy_deposit_payment_title"),
      text: t("booking.policy_deposit_payment_text"),
    },
    {
      icon: <FaUserClock className="h-4 w-4 text-orange-500" />,
      title: t("booking.policy_change_time_table_title"),
      text: t("booking.policy_change_time_table_text"),
    },
    {
      icon: <Ban className="h-4 w-4 text-red-500" />,
      title: t("booking.policy_cancel_refund_title"),
      text: t("booking.policy_cancel_refund_text"),
    },
    {
      icon: <PhoneCall className="h-4 w-4 text-purple-600" />,
      title: t("booking.policy_contact_support_title"),
      text: t("booking.policy_contact_support_text"),
    },
    {
      icon: <FaGlassCheers className="h-4 w-4 text-pink-500" />,
      title: t("booking.policy_event_holiday_title"),
      text: t("booking.policy_event_holiday_text"),
    },
    {
      icon: <FaParking className="h-4 w-4 text-gray-700 dark:text-gray-300" />,
      title: t("booking.policy_parking_title"),
      text: t("booking.policy_parking_text"),
    },
    {
      icon: <FaWheelchair className="h-4 w-4 text-indigo-600" />,
      title: t("booking.policy_special_assistance_title"),
      text: t("booking.policy_special_assistance_text"),
    },
  ];

  return (
    <>
      {/* CARD CHÍNH */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm md:p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
              {t("booking.policy_card_title_restaurant")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:underline md:text-sm"
          >
            {t("booking.policy_read_all")}
          </button>
        </div>

        {/* Lưu ý quan trọng */}
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 dark:border-sky-900/40 dark:bg-sky-950/30">
          <div className="flex items-start gap-2 px-4 py-3 md:px-5">
            <div className="mt-0.5">
              <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 md:text-sm">
                {importantNote.title}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-gray-100 md:text-sm">
                {importantNote.subtitle}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-700 dark:text-gray-300 md:text-sm">
                {importantNote.text}
              </p>
            </div>
          </div>
        </div>

        {/* Tóm tắt 2 mục bên dưới (cho “thật” như Hotel) */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 md:text-sm">
                {t("booking.policy_summary_hold_title")}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                {t("booking.policy_summary_hold_text")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CreditCard className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 md:text-sm">
                {t("booking.policy_summary_deposit_title")}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                {t("booking.policy_summary_deposit_text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL ĐỌC TẤT CẢ */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-2 md:px-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 md:text-lg">
                  {importantNote.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-5">
                {/* Block note trong modal */}
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 dark:border-sky-900/40 dark:bg-sky-950/30">
                  <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 md:text-sm">
                    {importantNote.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-gray-100 md:text-sm">
                    {importantNote.subtitle}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-300 md:text-sm">
                    {importantNote.text}
                  </p>
                </div>

                {/* Sections chi tiết */}
                {sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 border-t border-gray-100 dark:border-gray-700 pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
                      {sec.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {sec.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line md:text-sm">
                        {sec.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}