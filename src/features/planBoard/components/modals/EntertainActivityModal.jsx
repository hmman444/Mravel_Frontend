"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaGamepad,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

export default function EntertainActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [time, setTime] = useState("");

  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketCount, setTicketCount] = useState("1");

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
      setPlaceName(data.placeName || "");
      setAddress(data.address || "");

      setTime(editingCard.startTime || data.time || "");

      setTicketPrice(
        data.ticketPrice != null ? String(data.ticketPrice) : ""
      );

      setTicketCount(
        data.ticketCount != null ? String(data.ticketCount) : "1"
      );

      setExtraSpend(
        editingCard.actualCost != null ? String(data.extraSpend || "") : ""
      );

      setNote(editingCard.description || "");
    } else {
      // reset khi tạo mới
      setTitle("");
      setPlaceName("");
      setAddress("");
      setTime("");
      setTicketPrice("");
      setTicketCount("1");
      setExtraSpend("");
      setNote("");
    }
  }, [open, editingCard]);

  // Chi phí dự kiến
  const estimatedCost = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(ticketCount || 0);
    return p * c;
  }, [ticketPrice, ticketCount]);

  // Tổng có phát sinh
  const totalWithExtra = useMemo(() => {
    const e = Number(extraSpend || 0);
    return estimatedCost + e;
  }, [estimatedCost, extraSpend]);

  // Submit
  const handleSubmit = () => {
    if (!placeName.trim()) return;

    onSubmit?.({
      type: "ENTERTAIN",
      title: title || `Vui chơi: ${placeName}`,
      startTime: time,
      endTime: time,
      estimatedCost: estimatedCost || null,
      actualCost: totalWithExtra || null,
      note,

      // data chi tiết để đưa vào JSON
      placeName,
      address,
      time,
      ticketPrice: ticketPrice ? Number(ticketPrice) : null,
      ticketCount: ticketCount ? Number(ticketCount) : null,
      extraSpend: extraSpend ? Number(extraSpend) : null,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400";

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
            className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/70 rounded-2xl w-[580px] max-h-[90vh] shadow-[0_16px_45px_rgba(0,0,0,0.16)] overflow-hidden relative"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition"
            >
              <FaTimes size={14} />
            </button>

            <div className="px-6 pt-6 pb-4 border-b border-gray-200/70 dark:border-gray-700/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FaGamepad />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Vui chơi
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Công viên, trò chơi, khu giải trí, thuê đồ chơi...
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[78vh]">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên hoạt động (tuỳ chọn)
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Chơi moto nước, công viên nước..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Place */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Địa điểm vui chơi
                </label>
                <div className="flex items-center gap-2">
                  <FaGamepad className="text-emerald-500" />
                  <input
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="Tên khu vui chơi, bãi biển, trò chơi..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Địa chỉ
                </label>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Địa chỉ (nếu có)"
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Thời gian
                </label>
                <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                  <FaClock className="text-blue-500" />
                  <TimePicker value={time} onChange={setTime} />
                </div>
              </div>

              {/* Ticket + Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Giá vé / lượt
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="VD: 150.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs text-gray-500">đ</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Số lượt / người tham gia
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(e.target.value)}
                    className={`${inputBase} w-full`}
                  />
                </div>
              </div>

              {/* Extra cost */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Chi phí phụ (thuê đồ, gửi xe...)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={extraSpend}
                    onChange={(e) => setExtraSpend(e.target.value)}
                    placeholder="VD: 50.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-gray-500">đ</span>
                </div>
              </div>

              {/* Summary */}
              <div className="text-right text-xs text-gray-600 dark:text-gray-300">
                Dự kiến:{" "}
                <span className="font-semibold">
                  {estimatedCost.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="text-right text-xs text-gray-600 dark:text-gray-300">
                Tổng (kèm phụ phí):{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {totalWithExtra.toLocaleString("vi-VN")}đ
                </span>
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
                  placeholder="Ví dụ: nên thuê phao, đồ bảo hộ..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động vui chơi"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
