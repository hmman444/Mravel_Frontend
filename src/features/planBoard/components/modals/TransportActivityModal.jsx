"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaRoute,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

const TRANSPORT_METHODS = [
  { value: "taxi", label: "Taxi / Grab" },
  { value: "motorbike", label: "Xe máy" },
  { value: "car", label: "Ô tô riêng" },
  { value: "bus", label: "Xe buýt" },
  { value: "walk", label: "Đi bộ" },
  { value: "other", label: "Khác" },
];

export default function TransportActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [stops, setStops] = useState([]);
  const [method, setMethod] = useState("taxi");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  // Load dữ liệu khi edit
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};

      setTitle(editingCard.text || "");
      setFromPlace(data.fromPlace || "");
      setToPlace(data.toPlace || "");
      setStops(data.stops || []);
      setMethod(data.method || "taxi");
      setStartTime(editingCard.startTime || "");
      setEndTime(editingCard.endTime || "");
      setEstimatedCost(
        editingCard.estimatedCost != null
          ? String(editingCard.estimatedCost)
          : ""
      );
      setActualCost(
        editingCard.actualCost != null ? String(editingCard.actualCost) : ""
      );
      setNote(editingCard.description || "");
    } else {
      // reset khi tạo mới
      setTitle("");
      setFromPlace("");
      setToPlace("");
      setStops([]);
      setMethod("taxi");
      setStartTime("");
      setEndTime("");
      setEstimatedCost("");
      setActualCost("");
      setNote("");
    }
  }, [open, editingCard]);

  const handleAddStop = () => setStops((prev) => [...prev, ""]);
  const handleChangeStop = (v, i) => {
    const arr = [...stops];
    arr[i] = v;
    setStops(arr);
  };
  const handleRemoveStop = (i) => {
    setStops((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ✅ Quan trọng: trả về dạng "thô" có field `type`
  const handleSubmit = () => {
    if (!fromPlace.trim() || !toPlace.trim()) return;

    onSubmit?.({
      type: "TRANSPORT",
      title: title || `Di chuyển: ${fromPlace} → ${toPlace}`,
      fromPlace,
      toPlace,
      stops: stops.filter((s) => s.trim()),
      method,
      startTime,
      endTime,
      estimatedCost: estimatedCost ? Number(estimatedCost) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      note,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400";
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
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <FaRoute />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Di chuyển
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lên kế hoạch quãng đường và chi phí di chuyển
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[78vh] modal-scroll">
              {/* Tên hoạt động */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên hoạt động (tuỳ chọn)
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đi taxi từ KS về phố đi bộ..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Đi từ / Đến */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Đi từ
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-400" />
                    <input
                      value={fromPlace}
                      onChange={(e) => setFromPlace(e.target.value)}
                      placeholder="Khách sạn, nơi xuất phát..."
                      className={`${inputBase} flex-1`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Đến
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-500" />
                    <input
                      value={toPlace}
                      onChange={(e) => setToPlace(e.target.value)}
                      placeholder="Điểm đến..."
                      className={`${inputBase} flex-1`}
                    />
                  </div>
                </div>
              </div>

              {/* Ghé ngang */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">
                    Ghé ngang (tuỳ chọn)
                  </label>
                  <button
                    onClick={handleAddStop}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-500"
                  >
                    <FaPlus className="text-[10px]" /> Thêm điểm dừng
                  </button>
                </div>

                {stops.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {stops.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={stop}
                          onChange={(e) =>
                            handleChangeStop(e.target.value, idx)
                          }
                          placeholder={`Điểm dừng ${idx + 1}`}
                          className={`${inputBase} flex-1`}
                        />
                        <button
                          onClick={() => handleRemoveStop(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phương tiện */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Phương tiện
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORT_METHODS.map((m) => {
                    const active = m.value === method;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setMethod(m.value)}
                        className={`${pillBtn} ${
                          active
                            ? "bg-sky-500 text-white border-sky-500 shadow-md scale-[1.03]"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thời gian */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Thời gian di chuyển
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                    <FaClock className="text-blue-500" />
                    <span className="text-xs">Bắt đầu</span>
                    <div className="flex-1">
                      <TimePicker value={startTime} onChange={setStartTime} />
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
                    <FaClock className="text-blue-500" />
                    <span className="text-xs">Kết thúc</span>
                    <div className="flex-1">
                      <TimePicker value={endTime} onChange={setEndTime} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi phí */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Chi phí ước lượng
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="VD: 50000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs">đ</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Chi tiêu thực tế
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={actualCost}
                      onChange={(e) => setActualCost(e.target.value)}
                      placeholder="Điền sau khi đi xong"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs">đ</span>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Ghi chú
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: đi chung 3 người, gọi Grab 10 phút trước..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động di chuyển"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
