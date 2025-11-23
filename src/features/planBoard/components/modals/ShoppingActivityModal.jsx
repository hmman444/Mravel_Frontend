"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";

export default function ShoppingActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
}) {
  const [title, setTitle] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");

  // Load khi edit
  useEffect(() => {
    if (!open) return;

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};

      setTitle(editingCard.text || "");
      setStoreName(data.storeName || "");
      setAddress(data.address || "");

      setItems(Array.isArray(data.items) ? data.items : []);

      setNote(editingCard.description || "");
    } else {
      // reset new
      setTitle("");
      setStoreName("");
      setAddress("");
      setItems([]);
      setNote("");
    }
  }, [open, editingCard]);

  // Add item
  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: "", price: "" }]);
  };

  const handleChangeItem = (idx, key, value) => {
    setItems((prev) => {
      const clone = [...prev];
      clone[idx][key] = value;
      return clone;
    });
  };

  const handleRemoveItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Tổng chi phí
  const totalCost = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.price || 0);
      return sum + price;
    }, 0);
  }, [items]);

  // Submit
  const handleSubmit = () => {
    if (!storeName.trim()) return;

    const filteredItems = items
      .filter((it) => it.name.trim() || it.price)
      .map((it) => ({
        name: it.name.trim(),
        price: it.price ? Number(it.price) : 0,
      }));

    onSubmit?.({
      type: "SHOPPING",
      title: title || `Mua sắm tại ${storeName}`,

      // cost
      estimatedCost: totalCost || null,
      actualCost: totalCost || null,
      note,

      // data chi tiết
      storeName,
      address,
      items: filteredItems,
    });

    onClose?.();
  };

  const inputBase =
    "bg-white/90 dark:bg-gray-800/90 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-400";

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
            className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 
            rounded-2xl w-[620px] max-h-[90vh] shadow-[0_16px_45px_rgba(0,0,0,0.15)] overflow-hidden relative"
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
              <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                <FaShoppingBag />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Mua sắm
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ghi lại những gì bạn mua và chi phí
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
                  placeholder="Ví dụ: Mua đặc sản Đà Nẵng..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Store */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                  Tên cửa hàng / khu mua sắm
                </label>
                <div className="flex items-center gap-2">
                  <FaShoppingBag className="text-pink-500" />
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Chợ, mall, cửa hàng..."
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
                    placeholder="Địa chỉ nơi mua..."
                    className={`${inputBase} flex-1`}
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Danh sách món hàng
                  </label>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-[11px] text-pink-600 hover:text-pink-500"
                  >
                    <FaPlus className="text-[10px]" /> Thêm món
                  </button>
                </div>

                {items.length === 0 && (
                  <p className="text-[11px] text-gray-400">
                    Nhập từng món đã mua và giá tiền.
                  </p>
                )}

                <div className="space-y-2 mt-1">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 group"
                    >
                      <input
                        value={it.name}
                        onChange={(e) =>
                          handleChangeItem(idx, "name", e.target.value)
                        }
                        placeholder={`Món hàng ${idx + 1}`}
                        className={`${inputBase} flex-1`}
                      />

                      <div className="flex items-center gap-1">
                        <FaMoneyBillWave className="text-emerald-500" />
                        <input
                          type="number"
                          min="0"
                          value={it.price}
                          onChange={(e) =>
                            handleChangeItem(idx, "price", e.target.value)
                          }
                          placeholder="Giá"
                          className={`${inputBase} w-28`}
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <FaTrashAlt size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="text-right text-sm text-gray-600 dark:text-gray-300 font-medium">
                Tổng tiền:{" "}
                <span className="text-pink-600 dark:text-pink-400 font-semibold">
                  {totalCost.toLocaleString("vi-VN")}đ
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
                  placeholder="Ví dụ: Mua làm quà cho gia đình..."
                  className={`${inputBase} w-full`}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white 
                  font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động mua sắm"}
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
