"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaUtensils,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

export default function FoodActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");

  const [pricePerPerson, setPricePerPerson] = useState("");
  const [peopleCount, setPeopleCount] = useState("2");
  const [extraSpend, setExtraSpend] = useState("");
  const [note, setNote] = useState("");

  // Load khi edit
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};

      setTitle(editingCard.text || "");
      setRestaurantName(data.restaurantName || "");
      setLocation(data.location || "");
      setTime(editingCard.startTime || data.time || "");

      setPricePerPerson(
        data.pricePerPerson != null ? String(data.pricePerPerson) : ""
      );

      setPeopleCount(
        data.peopleCount != null ? String(data.peopleCount) : "2"
      );

      setExtraSpend(
        editingCard.actualCost != null ? String(data.extraSpend || "") : ""
      );

      setNote(editingCard.description || "");
    } else {
      // reset khi tạo mới
      setTitle("");
      setRestaurantName("");
      setLocation("");
      setTime("");
      setPricePerPerson("");
      setPeopleCount("2");
      setExtraSpend("");
      setNote("");
    }
  }, [open, editingCard]);

  // Dự kiến
  const totalEstimated = useMemo(() => {
    const p = Number(pricePerPerson || 0);
    const c = Number(peopleCount || 0);
    return p * c;
  }, [pricePerPerson, peopleCount]);

  // Tổng thực tế
  const totalWithExtra = useMemo(() => {
    const e = Number(extraSpend || 0);
    return totalEstimated + e;
  }, [totalEstimated, extraSpend]);

  // Submit
  const handleSubmit = () => {
    if (!restaurantName.trim()) return;

    onSubmit?.({
      type: "FOOD",
      title: title || `Ăn uống: ${restaurantName}`,
      startTime: time,
      endTime: time,
      estimatedCost: totalEstimated || null,
      actualCost: totalWithExtra || null,
      note,

      // data chi tiết
      restaurantName,
      location,
      time,
      pricePerPerson: pricePerPerson ? Number(pricePerPerson) : null,
      peopleCount: peopleCount ? Number(peopleCount) : null,
      extraSpend: extraSpend ? Number(extraSpend) : null,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/70 rounded-2xl w-[560px] max-h-[90vh] shadow-[0_16px_45px_rgba(0,0,0,0.16)] overflow-hidden relative"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition"
            >
              <FaTimes size={14} />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200/70 dark:border-gray-700/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <FaUtensils />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Ăn uống
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lên kế hoạch quán ăn, cafe và chi phí bữa ăn
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[78vh]">

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên hoạt động (tuỳ chọn)
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ăn tối bún bò, uống cafe..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Restaurant name */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên quán / địa điểm ăn uống
                </label>
                <div className="flex items-center gap-2">
                  <FaUtensils className="text-orange-500" />
                  <input
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Tên quán ăn, cafe..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Địa chỉ
                </label>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Địa chỉ quán..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Thời gian ăn
                </label>
                <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm w-full">
                  <FaClock className="text-blue-500" />
                  <TimePicker value={time} onChange={setTime} />
                </div>
              </div>

              {/* Price + people */}
              <div className="grid grid-cols-2 gap-3">
                {/* price */}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Chi phí dự tính / 1 người
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={pricePerPerson}
                      onChange={(e) => setPricePerPerson(e.target.value)}
                      placeholder="VD: 70.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs">đ</span>
                  </div>
                </div>

                {/* people */}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Số người
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(e.target.value)}
                    className={`${inputBase} w-full`}
                  />
                </div>
              </div>

              {/* Extra + summary */}
              <div className="grid grid-cols-2 gap-3">
                {/* Extra */}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Chi phí phụ (nước thêm, tráng miệng...)
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={extraSpend}
                      onChange={(e) => setExtraSpend(e.target.value)}
                      placeholder="VD: 30.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs">đ</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col justify-center">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Dự kiến:
                    <span className="font-semibold ml-1">
                      {totalEstimated.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Tổng sau phụ phí:
                    <span className="font-semibold ml-1 text-emerald-600 dark:text-emerald-400">
                      {totalWithExtra.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Ghi chú
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Nên đặt bàn, thử món đặc sản..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động ăn uống"}
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
