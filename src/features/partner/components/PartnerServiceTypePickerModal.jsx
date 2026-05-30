import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  XMarkIcon,
  BuildingOffice2Icon,
  CakeIcon,
} from "@heroicons/react/24/outline";

const backdrop = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const panel = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.99 },
};

export default function PartnerServiceTypePickerModal({ open, onClose, onPick }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          variants={backdrop}
          initial="hidden"
          animate="show"
          exit="exit"
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-[0_20px_60px_rgba(2,6,23,0.2)]"
          >
            <div className="relative border-b p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{t("partner.service_type_picker.title")}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t("partner.service_type_picker.subtitle")}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-2xl p-2 hover:bg-gray-100"
                  title={t("common.close")}
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onPick?.("HOTEL")}
                className="group rounded-3xl border p-5 text-left hover:border-blue-400 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition">
                    <BuildingOffice2Icon className="h-6 w-6 text-blue-700" />
                  </span>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("partner.service_type_picker.hotel_title")}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t("partner.service_type_picker.hotel_desc")}</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  {t("partner.service_type_picker.hotel_note")}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onPick?.("RESTAURANT")}
                className="group rounded-3xl border p-5 text-left hover:border-indigo-400 hover:shadow-md transition opacity-70"
                title={t("partner.service_type_picker.restaurant_later")}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 transition">
                    <CakeIcon className="h-6 w-6 text-indigo-700" />
                  </span>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("partner.service_type_picker.restaurant_title")}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t("partner.service_type_picker.restaurant_desc")}</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  {t("partner.service_type_picker.restaurant_note")}
                </div>
              </button>
            </div>

            <div className="border-t bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}