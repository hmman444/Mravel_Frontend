import { useState } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { showError, showSuccess } from "../../../../utils/toastUtils";
import { usePlanBoard } from "../../hooks/usePlanBoard";

export default function LabelModal({
  planId,
  editCard,
  setEditCard,
  onClose,
}) {
  const { upsertLabel } = usePlanBoard(planId);

  const pastelColors = [
    "bg-rose-400",
    "bg-pink-400",
    "bg-fuchsia-400",
    "bg-violet-400",
    "bg-indigo-400",
    "bg-blue-400",
    "bg-cyan-400",
    "bg-teal-400",
    "bg-emerald-400",
    "bg-lime-400",
    "bg-amber-400",
    "bg-orange-400",
  ];

  const [newLabel, setNewLabel] = useState({
    text: "Nhãn mới",
    color: pastelColors[7], // teal đẹp, nhẹ
  });

  const handleCreate = async () => {
    if (!newLabel.text.trim()) {
      showError("Tên nhãn không được để trống");
      return;
    }

    try {
      const label = await upsertLabel(newLabel).unwrap();

      const updated = editCard?.labels
        ? [...editCard.labels, label]
        : [label];

      setEditCard({ ...editCard, labels: updated });
      showSuccess("Đã tạo nhãn mới");
      onClose();
    } catch {
      showError("Không thể tạo nhãn");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="
            w-[420px] bg-white/95 dark:bg-gray-900/95 
            border border-gray-200/60 dark:border-gray-700/60 
            rounded-2xl p-6 shadow-xl relative
          "
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ duration: 0.23, ease: "easeOut" }}
        >
          <button
            onClick={onClose}
            className="
              absolute top-3 right-3 p-2 rounded-full
              bg-gray-200/70 dark:bg-gray-700/70 
              hover:bg-red-500 hover:text-white 
              text-gray-600 dark:text-gray-300
              transition
            "
          >
            <FaTimes size={14} />
          </button>

          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Tạo nhãn mới
          </h3>

          {/* Preview */}
          <div
            className={`
              ${newLabel.color}
              px-4 py-2 rounded-xl text-white text-sm font-medium text-center 
              shadow-inner shadow-black/10 mb-4 transition-all
            `}
          >
            {newLabel.text}
          </div>

          {/* Title */}
          <label className="text-sm font-medium block mb-1">Tiêu đề</label>
          <input
            value={newLabel.text}
            onChange={(e) =>
              setNewLabel({ ...newLabel, text: e.target.value })
            }
            className="
              w-full px-3 py-2 rounded-xl
              bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-700
              shadow-sm outline-none
              focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
            "
            placeholder="Nhập tên nhãn..."
          />

          {/* Colors */}
          <label className="text-sm font-medium block mt-4 mb-2">
            Chọn màu
          </label>

          <div className="grid grid-cols-6 gap-3 mb-4">
            {pastelColors.map((c) => {
              const selected = newLabel.color === c;
              return (
                <button
                  key={c}
                  onClick={() => setNewLabel({ ...newLabel, color: c })}
                  className={`
                    w-8 h-8 rounded-lg ${c}
                    border-2 transition-all shadow-sm
                    ${selected ? "scale-110 border-black dark:border-white shadow-md" : "border-transparent opacity-90 hover:opacity-100"}
                  `}
                />
              );
            })}
          </div>

          <button
            onClick={() => setNewLabel({ ...newLabel, color: "" })}
            className="
              w-full px-3 py-2 rounded-lg text-sm
              bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200
              hover:bg-gray-300 dark:hover:bg-gray-600
              transition shadow-sm mb-4
            "
          >
            Gỡ bỏ màu
          </button>

          {/* Create */}
          <button
            onClick={handleCreate}
            className="
              w-full px-4 py-2 rounded-xl 
              bg-gradient-to-r from-blue-500 to-indigo-500 
              text-white font-medium 
              shadow-md hover:shadow-lg 
              hover:-translate-y-0.5 transition-all
            "
          >
            Tạo mới
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
