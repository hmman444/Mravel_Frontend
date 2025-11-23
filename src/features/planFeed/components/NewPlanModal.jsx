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

import VisibilityDropdown from "../../planBoard/components/VisibilityDropdown";
import CurrencyDropdown from "./CurrencyDropdown";

import { useSelector } from "react-redux";
import { createPlan } from "../services/planService";
import { showSuccess, showError } from "../../../utils/toastUtils";

// Đăng ký locale tiếng Việt cho react-datepicker
registerLocale("vi", vi);

export default function NewPlanModal({ open, onClose, onCreated }) {
  const { user } = useSelector((s) => s.auth);

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
      return showError("Ngày bắt đầu không thể sau ngày kết thúc!");
    setForm((f) => ({ ...f, startDate: d }));
  };

  const handleEnd = (d) => {
    if (form.startDate && d < form.startDate)
      return showError("Ngày kết thúc không thể trước ngày bắt đầu!");
    setForm((f) => ({ ...f, endDate: d }));
  };

  const iconMap = {
    PRIVATE: <FaLock className="text-gray-500" />,
    FRIENDS: <FaUsers className="text-emerald-500" />,
    PUBLIC: <FaGlobe className="text-blue-500" />,
  };

  const visibilityLabel = {
    PRIVATE: "Riêng tư",
    FRIENDS: "Bạn bè",
    PUBLIC: "Công khai",
  };

  const submit = async (e) => {
    e?.preventDefault();

    if (!user?.id) return showError("Bạn cần đăng nhập!");
    if (!form.startDate || !form.endDate)
      return showError("Vui lòng chọn ngày hợp lệ!");

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        startDate: form.startDate.toISOString().substring(0, 10),
        endDate: form.endDate.toISOString().substring(0, 10),
      };

      const res = await createPlan(payload, user);
      showSuccess("🎉 Tạo lịch trình thành công!");
      onCreated?.(res);
      onClose();
    } catch {
      showError("Không thể tạo lịch trình!");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBox =
    "flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm " +
    "shadow-sm focus-within:ring-2 focus-within:ring-sky-400 transition";

  const iconChip =
    "flex items-center justify-center w-9 h-9 rounded-xl bg-sky-50 text-sky-500";

  const fieldLabel = "text-xs font-medium text-gray-600 px-1 mb-1 block";

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
                bg-white
                border border-gray-100 
                shadow-[0_18px_55px_rgba(0,0,0,0.14)]
              "
            >
              {/* HEADER */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <FaFlag />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tạo lịch trình mới
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lên kế hoạch chuyến đi và chia sẻ với mọi người
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
                  <label className={fieldLabel}>Tiêu đề lịch trình</label>
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
                        placeholder="Ví dụ: Đà Lạt 3N2Đ, Team building..."
                        className="w-full bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1">
                  <label className={fieldLabel}>Mô tả</label>
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
                        placeholder="Ghi chú nhanh về lịch trình, mục đích chuyến đi..."
                        className="w-full bg-transparent outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* DATE RANGE */}
                <div className="space-y-2">
                  <p className={fieldLabel}>Thời gian chuyến đi</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 px-1">
                        Từ ngày
                      </span>
                      <div className="flex items-center gap-3">
                        <div className={iconChip}>
                          <FaCalendarAlt />
                        </div>
                        <div className={inputBox}>
                          <DatePicker
                            selected={form.startDate}
                            onChange={handleStart}
                            placeholderText="Chọn ngày bắt đầu"
                            dateFormat="dd/MM/yyyy"
                            locale="vi"
                            className="w-full bg-transparent outline-none"
                            calendarClassName="rounded-xl shadow-xl bg-white border border-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 px-1">
                        Đến ngày
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
                            placeholderText="Chọn ngày kết thúc"
                            dateFormat="dd/MM/yyyy"
                            locale="vi"
                            className="w-full bg-transparent outline-none"
                            calendarClassName="rounded-xl shadow-xl bg-white border border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISIBILITY */}
                <div className="space-y-1">
                  <label className={fieldLabel}>Quyền hiển thị</label>
                  <div className="flex items-center gap-3">
                    <div className={iconChip}>{iconMap[form.visibility]}</div>
                    <div className={`${inputBox} flex items-center justify-between`}>
                      <div className="text-sm text-gray-700">
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
                  <label className={fieldLabel}>Ngân sách dự kiến</label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3">
                      <div className={iconChip}>
                        <FaMoneyBillWave />
                      </div>
                      <div className={inputBox}>
                        <CurrencyDropdown
                          value={form.budgetCurrency}
                          onChange={(v) =>
                            setForm((f) => ({ ...f, budgetCurrency: v }))
                          }
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
                          placeholder="Ngân sách tổng (ước tính)"
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
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={iconChip}>
                      <FaMoneyBillWave />
                    </div>
                    <div className={inputBox}>
                      <input
                        type="number"
                        placeholder="Ngân sách / người (nếu có)"
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
                      px-4 py-2 rounded-xl border border-gray-300 text-sm 
                      hover:bg-gray-100 transition
                    "
                  >
                    Hủy
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
                    {submitting ? "Đang tạo..." : "Tạo lịch trình"}
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
