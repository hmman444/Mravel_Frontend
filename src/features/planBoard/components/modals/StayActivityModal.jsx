"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaBed, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

export default function StayActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [address, setAddress] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [pricePerNight, setPricePerNight] = useState("");
  const [nights, setNights] = useState("1");

  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  // Load modal
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};

      setTitle(editingCard.text || "");
      setHotelName(data.hotelName || "");
      setAddress(data.address || "");

      setCheckIn(data.checkIn || "");
      setCheckOut(data.checkOut || "");

      setPricePerNight(
        data.pricePerNight != null ? String(data.pricePerNight) : ""
      );

      setNights(data.nights != null ? String(data.nights) : "1");

      setActualCost(
        data.actualCost != null ? String(data.actualCost) : ""
      );

      setNote(editingCard.description || "");

    } else {
      // reset new
      setTitle("");
      setHotelName("");
      setAddress("");
      setCheckIn("");
      setCheckOut("");
      setPricePerNight("");
      setNights("1");
      setActualCost("");
      setNote("");
    }
  }, [open, editingCard]);

  const estimatedCost = useMemo(() => {
    const p = Number(pricePerNight || 0);
    const n = Number(nights || 0);
    return p * n;
  }, [pricePerNight, nights]);

  const handleSubmit = () => {
    if (!hotelName.trim()) return;

    onSubmit?.({
      type: "STAY",
      title: title || `Nghỉ tại ${hotelName}`,

      // cost
      estimatedCost: estimatedCost || null,
      actualCost: actualCost ? Number(actualCost) : null,
      note,

      // data JSON
      hotelName,
      address,
      checkIn,
      checkOut,
      pricePerNight: pricePerNight ? Number(pricePerNight) : null,
      nights: nights ? Number(nights) : null,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400";

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
            className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700 
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
            <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                <FaBed />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Nghỉ ngơi
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Khách sạn, homestay, hostel
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
                  placeholder="Ví dụ: Nghỉ tại Mường Thanh..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Hotel name */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên khách sạn / homestay
                </label>
                <div className="flex items-center gap-2">
                  <FaBed className="text-violet-500" />
                  <input
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="Tên khách sạn..."
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
                    placeholder="Địa chỉ khách sạn..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Check-in/out */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Check-in
                  </label>
                  <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800 
                    border border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                    <FaClock className="text-blue-500" />
                    <TimePicker value={checkIn} onChange={setCheckIn} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Check-out
                  </label>
                  <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800 
                    border border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                    <FaClock className="text-blue-500" />
                    <TimePicker value={checkOut} onChange={setCheckOut} />
                  </div>
                </div>
              </div>

              {/* Cost input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Giá mỗi đêm
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      placeholder="VD: 450.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs text-gray-500">đ</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Số đêm
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={nights}
                    onChange={(e) => setNights(e.target.value)}
                    className={`${inputBase} w-full`}
                  />
                </div>
              </div>

              {/* Estimated cost */}
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Dự kiến:
                <span className="font-semibold ml-1">
                  {estimatedCost.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {/* Actual cost */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Chi phí thực tế (nếu có)
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="Điền sau khi đi xong"
                  className={`${inputBase} w-full`}
                />
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
                  placeholder="Ví dụ: Yêu cầu tầng cao, có hồ bơi..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 
                  text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động nghỉ ngơi"}
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
