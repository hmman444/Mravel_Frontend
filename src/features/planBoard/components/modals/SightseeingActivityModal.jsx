"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaLandmark,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

export default function SightseeingActivityModal({
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
  const [peopleCount, setPeopleCount] = useState("2");
  const [extraSpend, setExtraSpend] = useState("");

  const [note, setNote] = useState("");

  // Load data
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};

      setTitle(editingCard.text || "");
      setPlaceName(data.placeName || "");
      setAddress(data.address || "");

      setTime(data.time || "");

      setTicketPrice(
        data.ticketPrice != null ? String(data.ticketPrice) : ""
      );

      setPeopleCount(
        data.peopleCount != null ? String(data.peopleCount) : "2"
      );

      setExtraSpend(
        data.extraSpend != null ? String(data.extraSpend) : ""
      );

      setNote(editingCard.description || "");

    } else {
      // reset new
      setTitle("");
      setPlaceName("");
      setAddress("");
      setTime("");
      setTicketPrice("");
      setPeopleCount("2");
      setExtraSpend("");
      setNote("");
    }
  }, [open, editingCard]);

  // Cost calculated
  const estimatedCost = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(peopleCount || 0);
    return p * c;
  }, [ticketPrice, peopleCount]);

  const totalWithExtra = useMemo(() => {
    const e = Number(extraSpend || 0);
    return estimatedCost + e;
  }, [estimatedCost, extraSpend]);

  const handleSubmit = () => {
    if (!placeName.trim()) return;

    onSubmit?.({
      type: "SIGHTSEEING",
      title: title || `Tham quan: ${placeName}`,

      // cost
      estimatedCost: estimatedCost || null,
      actualCost: totalWithExtra || null,
      note,

      // detail JSON
      placeName,
      address,
      time,
      ticketPrice: ticketPrice ? Number(ticketPrice) : null,
      peopleCount: peopleCount ? Number(peopleCount) : null,
      extraSpend: extraSpend ? Number(extraSpend) : null,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400";

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
            className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/70 
            rounded-2xl w-[580px] max-h-[90vh] shadow-[0_16px_45px_rgba(0,0,0,0.16)] overflow-hidden relative"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200/70 dark:bg-gray-700/70 
              text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition"
            >
              <FaTimes size={14} />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200/70 dark:border-gray-700/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <FaLandmark />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Tham quan
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vé tham quan, chụp ảnh, địa điểm du lịch
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
                  placeholder="Ví dụ: VinWonders, Nhà thờ Đức Bà..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Place name */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên địa điểm tham quan
                </label>
                <div className="flex items-center gap-2">
                  <FaLandmark className="text-amber-500" />
                  <input
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="Bảo tàng, thắng cảnh..."
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
                    placeholder="Địa chỉ chi tiết..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Thời gian tham quan
                </label>
                <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 
                dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                  <FaClock className="text-blue-500" />
                  <TimePicker value={time} onChange={setTime} />
                </div>
              </div>

              {/* Ticket + people */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Giá vé / người
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="VD: 120.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs text-gray-500">đ</span>
                  </div>
                </div>

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
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Chi phí phụ (gửi xe, đồ uống...)
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

                <div className="flex flex-col justify-center">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Dự kiến vé:
                    <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">
                      {estimatedCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Tổng (vé + phụ phí):
                    <span className="font-semibold ml-1 text-amber-600 dark:text-amber-400">
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
                  placeholder="Ví dụ: Nên đến sớm, có show nước 19h..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 
                  text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động tham quan"}
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
