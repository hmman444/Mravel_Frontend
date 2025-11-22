"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaPenFancy,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

export default function OtherActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");

  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  const [customFields, setCustomFields] = useState([{ key: "", value: "" }]);

  // Load khi edit
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};

      setTitle(editingCard.text || "");
      setLocation(data.location || "");
      setTime(editingCard.startTime || data.time || "");

      setEstimatedCost(
        editingCard.estimatedCost != null
          ? String(editingCard.estimatedCost)
          : ""
      );

      setActualCost(
        editingCard.actualCost != null
          ? String(editingCard.actualCost)
          : ""
      );

      setNote(editingCard.description || "");

      setCustomFields(
        Array.isArray(data.customFields) && data.customFields.length > 0
          ? data.customFields
          : [{ key: "", value: "" }]
      );
    } else {
      // reset new
      setTitle("");
      setLocation("");
      setTime("");
      setEstimatedCost("");
      setActualCost("");
      setNote("");
      setCustomFields([{ key: "", value: "" }]);
    }
  }, [open, editingCard]);

  // Thêm field
  const handleAddField = () => {
    setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleChangeField = (index, field, value) => {
    const next = [...customFields];
    next[index][field] = value;
    setCustomFields(next);
  };

  const handleRemoveField = (index) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = () => {
    onSubmit?.({
      type: "OTHER",
      title: title || "Hoạt động khác",
      startTime: time,
      endTime: time,
      estimatedCost: estimatedCost ? Number(estimatedCost) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      note,

      // data chi tiết
      location,
      time,
      customFields: customFields.filter(
        (f) => f.key.trim() !== "" || f.value.trim() !== ""
      ),
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300/70 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400";

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
            rounded-2xl w-[600px] max-h-[90vh] shadow-[0_16px_45px_rgba(0,0,0,0.16)] overflow-hidden relative"
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
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                <FaPenFancy />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Hoạt động khác
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Thêm hoạt động tuỳ chỉnh không thuộc các nhóm mặc định
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[78vh]">

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên hoạt động
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Sinh nhật, họp nhóm, check-in..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Địa điểm (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Địa điểm diễn ra hoạt động"
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Thời gian (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border 
                border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm w-full">
                  <FaClock className="text-blue-500" />
                  <TimePicker value={time} onChange={setTime} />
                </div>
              </div>

              {/* Cost */}
              <div className="grid grid-cols-2 gap-3">
                {/* Estimated */}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Chi phí ước lượng
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="VD: 100.000"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs">đ</span>
                  </div>
                </div>

                {/* Actual */}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                    Chi tiêu thực tế
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={actualCost}
                      onChange={(e) => setActualCost(e.target.value)}
                      placeholder="Điền sau khi hoàn thành"
                      className={`${inputBase} flex-1`}
                    />
                    <span className="text-xs">đ</span>
                  </div>
                </div>
              </div>

              {/* Custom fields */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Thông tin thêm (tuỳ chọn)
                  </label>
                  <button
                    onClick={handleAddField}
                    className="text-[11px] text-blue-500 hover:text-blue-400"
                  >
                    + Thêm trường
                  </button>
                </div>

                {customFields.map((f, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      placeholder="Tên trường (vd: Sự kiện)"
                      value={f.key}
                      onChange={(e) =>
                        handleChangeField(idx, "key", e.target.value)
                      }
                      className={`${inputBase}`}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        placeholder="Giá trị"
                        value={f.value}
                        onChange={(e) =>
                          handleChangeField(idx, "value", e.target.value)
                        }
                        className={`${inputBase} flex-1`}
                      />
                      <button
                        onClick={() => handleRemoveField(idx)}
                        className="text-red-500 hover:text-red-600 text-xs ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
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
                  placeholder="Mô tả thêm về hoạt động..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-gray-700 text-white 
                  font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động khác"}
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
