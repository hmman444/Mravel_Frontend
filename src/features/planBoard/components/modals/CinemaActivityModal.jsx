"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaFilm,
  FaMapMarkerAlt,
  FaClock,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

const FORMATS = [
  { value: "2D", label: "2D" },
  { value: "3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
  { value: "4DX", label: "4DX" },
];

export default function CinemaActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [cinemaName, setCinemaName] = useState("");
  const [address, setAddress] = useState("");
  const [movieName, setMovieName] = useState("");
  const [showtime, setShowtime] = useState("");
  const [format, setFormat] = useState("2D");
  const [seats, setSeats] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [comboPrice, setComboPrice] = useState("");
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
      setCinemaName(data.cinemaName || "");
      setAddress(data.address || "");
      setMovieName(data.movieName || "");
      setFormat(data.format || "2D");
      setShowtime(editingCard.startTime || "");
      setSeats(data.seats || "");

      setTicketPrice(
        editingCard.estimatedCost != null ? String(data.ticketPrice || "") : ""
      );
      setComboPrice(data.comboPrice ? String(data.comboPrice) : "");
      setExtraSpend(
        editingCard.actualCost != null ? String(data.extraSpend || "") : ""
      );

      setNote(editingCard.description || "");
    } else {
      // reset khi tạo mới
      setTitle("");
      setCinemaName("");
      setAddress("");
      setMovieName("");
      setShowtime("");
      setFormat("2D");
      setSeats("");
      setTicketPrice("");
      setComboPrice("");
      setExtraSpend("");
      setNote("");
    }
  }, [open, editingCard]);

  // Tổng dự kiến
  const totalEstimated = useMemo(() => {
    const t = Number(ticketPrice || 0);
    const c = Number(comboPrice || 0);
    return t + c;
  }, [ticketPrice, comboPrice]);

  // Tổng thực tế
  const totalActual = useMemo(() => {
    const e = Number(extraSpend || 0);
    return totalEstimated + e;
  }, [totalEstimated, extraSpend]);

  // Submit
  const handleSubmit = () => {
    if (!cinemaName.trim() || !movieName.trim()) return;

    onSubmit?.({
      type: "CINEMA",
      title: title || `Xem phim: ${movieName}`,
      startTime: showtime,
      endTime: showtime,
      estimatedCost: totalEstimated || null,
      actualCost: totalActual || null,
      note,

      // dữ liệu chi tiết lưu vào JSON
      cinemaName,
      address,
      movieName,
      showtime,
      format,
      seats,
      ticketPrice: ticketPrice ? Number(ticketPrice) : null,
      comboPrice: comboPrice ? Number(comboPrice) : null,
      extraSpend: extraSpend ? Number(extraSpend) : null,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400";

  const pillBtn =
    "px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm transition-all";

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
            className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 
            dark:border-gray-700/70 rounded-2xl w-[620px] max-h-[90vh] 
            shadow-[0_16px_45px_rgba(0,0,0,0.16)] overflow-hidden relative"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full 
              bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 
              hover:bg-red-500 hover:text-white transition"
            >
              <FaTimes size={14} />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200/70 dark:border-gray-700/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <FaFilm />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Xem phim
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Chọn rạp, phim, giờ chiếu và chi phí đi xem phim
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
                  placeholder="Ví dụ: Xem phim tối tại CGV..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Cinema name */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Rạp chiếu phim
                </label>
                <div className="flex items-center gap-2">
                  <FaFilm className="text-rose-500" />
                  <input
                    value={cinemaName}
                    onChange={(e) => setCinemaName(e.target.value)}
                    placeholder="CGV, Lotte Cinema..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Địa chỉ rạp
                </label>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Địa chỉ chi tiết"
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Movie name */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên phim
                </label>
                <input
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  placeholder="Tên bộ phim..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Showtime */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Giờ chiếu
                </label>
                <div
                  className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border 
                  border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm w-full"
                >
                  <FaClock className="text-blue-500" />
                  <TimePicker value={showtime} onChange={setShowtime} />
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Định dạng phim
                </label>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => {
                    const active = f.value === format;
                    return (
                      <button
                        key={f.value}
                        onClick={() => setFormat(f.value)}
                        className={`${pillBtn} ${
                          active
                            ? "bg-rose-500 text-white border-rose-500 shadow-md scale-[1.03]"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seats */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Ghế ngồi (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaChair className="text-indigo-500" />
                  <input
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    placeholder="VD: H8, H9"
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Giá vé
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="VD: 90.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs text-gray-500">đ</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Giá combo bắp nước (tuỳ chọn)
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={comboPrice}
                      onChange={(e) => setComboPrice(e.target.value)}
                      placeholder="VD: 50.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs text-gray-500">đ</span>
                  </div>
                </div>
              </div>

              {/* Extra cost */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Chi phí phát sinh (gửi xe, đồ ăn thêm...)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={extraSpend}
                    onChange={(e) => setExtraSpend(e.target.value)}
                    placeholder="VD: 10.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-gray-500">đ</span>
                </div>
              </div>

              {/* Summary */}
              <div className="text-right text-sm text-gray-600 dark:text-gray-300 font-medium">
                Tổng dự kiến:{" "}
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {totalEstimated.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                Tổng thực tế:{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {totalActual.toLocaleString("vi-VN")}đ
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
                  placeholder="Ví dụ: Phim hay, nên đi sớm 10 phút..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 
                  text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động xem phim"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
