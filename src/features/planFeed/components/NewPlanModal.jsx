"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import vi from "date-fns/locale/vi";

import {
  FaFlag,
  FaAlignLeft,
  FaCalendarAlt,
  FaLock,
  FaUsers,
  FaGlobe,
  FaMoneyBillWave,
} from "react-icons/fa";

import VisibilityDropdown from "../../planBoard/components/modals/VisibilityDropdown";
import CurrencyDropdown from "./CurrencyDropdown";

import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { createPlan } from "../services/planService";
import { showSuccess, showError } from "../../../utils/toastUtils";

// Đăng ký locale tiếng Việt cho react-datepicker
registerLocale("vi", vi);

export default function NewPlanModal({ open, onClose, onCreated }) {
  const { user } = useSelector((s) => s.auth);
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: null,
    endDate: null,
    visibility: "PRIVATE",
    budgetCurrency: "VND",
    budgetTotal: "",
    budgetPerPerson: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleStart = (d) => {
    if (form.endDate && d > form.endDate)
      return showError(t("feed.newPlan.error.startAfterEnd"));
    setForm((f) => ({ ...f, startDate: d }));
  };

  const handleEnd = (d) => {
    if (form.startDate && d < form.startDate)
      return showError(t("feed.newPlan.error.endBeforeStart"));
    setForm((f) => ({ ...f, endDate: d }));
  };

  const iconMap = {
    PRIVATE: <FaLock className="text-gray-500 dark:text-gray-400" />,
    FRIENDS: <FaUsers className="text-emerald-500" />,
    PUBLIC: <FaGlobe className="text-blue-500" />,
  };

  const visibilityLabel = {
    PRIVATE: t("feed.newPlan.visibility.private"),
    FRIENDS: t("feed.newPlan.visibility.friends"),
    PUBLIC: t("feed.newPlan.visibility.public"),
  };

  const submit = async (e) => {
    e?.preventDefault();

    if (!user?.id) return showError(t("feed.newPlan.error.loginRequired"));
    if (!form.startDate || !form.endDate)
      return showError(t("feed.newPlan.error.invalidDate"));

    // Budget fields must not be negative.
    if (
      (form.budgetTotal !== "" && Number(form.budgetTotal) < 0) ||
      (form.budgetPerPerson !== "" && Number(form.budgetPerPerson) < 0)
    ) {
      return showError(t("feed.newPlan.error.budgetNegative"));
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        startDate: form.startDate.toISOString().substring(0, 10),
        endDate: form.endDate.toISOString().substring(0, 10),
      };

      const res = await createPlan(payload, user);
      showSuccess(t("feed.newPlan.success"));
      onCreated?.(res);
      onClose();
    } catch (e) {
      const msg =
        typeof e === "string"
          ? e
          : e?.response?.data?.message || e?.response?.data?.error || e?.message;
      showError(msg || t("feed.newPlan.error.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputBox =
    "flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm " +
    "shadow-sm focus-within:ring-2 focus-within:ring-sky-400 transition";

  const iconChip =
    "flex items-center justify-center w-9 h-9 rounded-xl bg-sky-50 text-sky-500";

  const fieldLabel = "text-xs font-medium text-gray-600 dark:text-gray-400 px-1 mb-1 block";

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[2000]" onClose={onClose}>
        {/* BACKDROP */}
        <Transition.Child
          as={Fragment}
          enter="duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[3px]" />
        </Transition.Child>

        {/* MODAL */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <Dialog.Panel
              className="
                w-full max-w-md rounded-2xl p-6
                bg-white dark:bg-gray-800
                border border-gray-100 dark:border-gray-700 
                shadow-[0_18px_55px_rgba(0,0,0,0.14)]
              "
            >
              {/* HEADER */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <FaFlag />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t("feed.newPlan.title")}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t("feed.newPlan.subtitle")}
                  </p>
                </div>
              </div>

              {/* FORM */}
              <form
                className="space-y-2"
                onSubmit={(e) => e.preventDefault()}
              >
                {/* TITLE */}
                <div className="space-y-1">
                  <label className={fieldLabel}>{t("feed.newPlan.field.title")}</label>
                  <div className="flex items-center gap-3">
                    <div className={iconChip}>
                      <FaFlag />
                    </div>
                    <div className={inputBox}>
                      <input
                        value={form.title}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder={t("feed.newPlan.field.titlePlaceholder")}
                        className="w-full bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1">
                  <label className={fieldLabel}>{t("feed.newPlan.field.description")}</label>
                  <div className="flex items-start gap-3">
                    <div className={iconChip}>
                      <FaAlignLeft />
                    </div>
                    <div className={inputBox}>
                      <textarea
                        rows={2}
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        placeholder={t("feed.newPlan.field.descriptionPlaceholder")}
                        className="w-full bg-transparent outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* DATE RANGE */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                        {t("feed.newPlan.field.fromDate")}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className={iconChip}>
                          <FaCalendarAlt />
                        </div>
                        <div className={inputBox}>
                          <DatePicker
                            selected={form.startDate}
                            onChange={handleStart}
                            placeholderText={t("feed.newPlan.field.startPlaceholder")}
                            dateFormat="dd/MM/yyyy"
                            locale="vi"
                            className="w-full bg-transparent outline-none"
                            calendarClassName="rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                        {t("feed.newPlan.field.toDate")}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className={iconChip}>
                          <FaCalendarAlt />
                        </div>
                        <div className={inputBox}>
                          <DatePicker
                            selected={form.endDate}
                            onChange={handleEnd}
                            minDate={form.startDate}
                            placeholderText={t("feed.newPlan.field.endPlaceholder")}
                            dateFormat="dd/MM/yyyy"
                            locale="vi"
                            className="w-full bg-transparent outline-none"
                            calendarClassName="rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISIBILITY */}
                <div className="space-y-1">
                  <label className={fieldLabel}>{t("feed.newPlan.field.visibility")}</label>
                  <div className="flex items-center gap-3">
                    <div className={iconChip}>{iconMap[form.visibility]}</div>
                    <div className={`${inputBox} flex items-center justify-between`}>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {visibilityLabel[form.visibility]}
                      </div>
                      <VisibilityDropdown
                        value={form.visibility}
                        onChange={(v) =>
                          setForm((f) => ({ ...f, visibility: v }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* BUDGET */}
                <div className="space-y-2">
                  <label className={fieldLabel}>{t("feed.newPlan.field.budget")}</label>


                    <div className="flex items-center gap-3">
                      <div className={iconChip}>
                        <FaMoneyBillWave />
                      </div>
                      <div className={inputBox}>
                        <input
                          type="number"
                          min={0}
                          placeholder={t("feed.newPlan.field.budgetTotalPlaceholder")}
                          value={form.budgetTotal}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              budgetTotal: e.target.value,
                            }))
                          }
                          className="w-full bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    

                  <div className="flex items-center gap-3">
                    <div className={iconChip}>
                      <FaMoneyBillWave />
                    </div>
                    <div className={inputBox}>
                      <input
                        type="number"
                        min={0}
                        placeholder={t("feed.newPlan.field.budgetPerPersonPlaceholder")}
                        value={form.budgetPerPerson}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            budgetPerPerson: e.target.value,
                          }))
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="
                      px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm 
                      hover:bg-gray-100 transition
                    "
                  >
                    {t("common.cancel")}
                  </button>

                  <button
                    type="button"
                    onClick={() => submit()}
                    disabled={submitting}
                    className="
                      px-6 py-2 rounded-xl text-sm text-white font-semibold
                      bg-gradient-to-r from-sky-500 to-indigo-500
                      shadow hover:shadow-lg hover:-translate-y-0.5
                      transition disabled:opacity-50
                    "
                  >
                    {submitting ? t("feed.newPlan.creating") : t("feed.newPlan.submit")}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
