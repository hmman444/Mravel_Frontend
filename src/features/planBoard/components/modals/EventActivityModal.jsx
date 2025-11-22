"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

export default function EventActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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
      setEventName(data.eventName || "");
      setVenue(data.venue || "");
      setAddress(data.address || "");

      setStartTime(editingCard.startTime || data.startTime || "");
      setEndTime(editingCard.endTime || data.endTime || "");

      setTicketPrice(
        data.ticketPrice != null ? String(data.ticketPrice) : ""
      );
      setTicketCount(
        data.ticketCount != null ? String(data.ticketCount) : "1"
      );
      setExtraSpend(
        data.extraSpend != null ? String(data.extraSpend) : ""
      );

      setNote(editingCard.description || "");
    } else {
      // reset khi tạo mới
      setTitle("");
      setEventName("");
      setVenue("");
      setAddress("");
      setStartTime("");
      setEndTime("");
      setTicketPrice("");
      setTicketCount("1");
      setExtraSpend("");
      setNote("");
    }
  }, [open, editingCard]);

  // Dự kiến
  const estimatedCost = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(ticketCount || 0);
    return p * c;
  }, [ticketPrice, ticketCount]);

  // Tổng thực
  const totalWithExtra = useMemo(() => {
    const e = Number(extraSpend || 0);
    return estimatedCost + e;
  }, [estimatedCost, extraSpend]);

  // Submit
  const handleSubmit = () => {
    if (!eventName.trim()) return;

    onSubmit?.({
      type: "EVENT",
      title: title || `Sự kiện: ${eventName}`,
      startTime: startTime || null,
      endTime: endTime || null,
      estimatedCost: estimatedCost || null,
      actualCost: totalWithExtra || null,
      note,

      // dữ liệu chi tiết đưa vào JSON
      eventName,
      venue,
      address,
      ticketPrice: ticketPrice ? Number(ticketPrice) : null,
      ticketCount: ticketCount ? Number(ticketCount) : null,
      extraSpend: extraSpend ? Number(extraSpend) : null,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400";

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
            className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/70 rounded-2xl w-[600px] max-h-[90vh] shadow-[0_16px_45px_rgba(0,0,0,0.16)] overflow-hidden relative"
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
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FaCalendarAlt />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Sự kiện
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Concert, lễ hội, workshop, show...
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
                  placeholder="Ví dụ: Concert Đen Vâu..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Event name */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên sự kiện
                </label>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-indigo-500" />
                  <input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Tên sự kiện chính..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Địa điểm / Venue
                </label>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  <input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Tên sân vận động, hội trường..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Địa chỉ chi tiết
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Địa chỉ (tuỳ chọn)"
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Time range */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Thời gian sự kiện
                </label>
                <div className="flex items-center gap-4">
                  {/* Start */}
                  <div className="flex-1 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                    <FaClock className="text-blue-500" />
                    <span className="text-xs whitespace-nowrap">Bắt đầu</span>
                    <div className="flex-1">
                      <TimePicker value={startTime} onChange={setStartTime} />
                    </div>
                  </div>

                  {/* End */}
                  <div className="flex-1 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                    <FaClock className="text-blue-500" />
                    <span className="text-xs whitespace-nowrap">Kết thúc</span>
                    <div className="flex-1">
                      <TimePicker value={endTime} onChange={setEndTime} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket + count */}
              <div className="grid grid-cols-2 gap-3">
                {/* Price */}
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
                      placeholder="VD: 500.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs">đ</span>
                  </div>
                </div>

                {/* Count */}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Số vé
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

              {/* Extra */}
              <div className="grid grid-cols-2 gap-3">
                {/* Phụ phí */}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Chi phí phụ (gửi xe, đồ ăn, merch...)
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={extraSpend}
                      onChange={(e) => setExtraSpend(e.target.value)}
                      placeholder="VD: 100.000"
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
                      {estimatedCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Tổng:
                    <span className="font-semibold ml-1 text-indigo-600 dark:text-indigo-400">
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
                  placeholder="Ví dụ: Nên đến sớm 30 phút..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động sự kiện"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
