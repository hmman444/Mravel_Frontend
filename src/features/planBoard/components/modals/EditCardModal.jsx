import { useState } from "react";
import { FaTimes, FaCheck, FaPlus, FaTrashAlt, FaCalendarAlt } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import TimePicker from "../../../../components/TimePicker";

export default function EditCardModal({
  editCard,
  setEditCard,
  saveCard,
  labels,
  setShowLabelModal,
  onClose,
  planMembers = [],
}) {
  const [newTask, setNewTask] = useState("");

  if (!editCard) return null;

  const priorities = [
    { value: "low", label: "Thấp", color: "bg-emerald-500" },
    { value: "medium", label: "Trung bình", color: "bg-amber-400 text-gray-900" },
    { value: "high", label: "Cao", color: "bg-rose-500" },
  ];

  const handleAddTask = () => {
    if (!newTask.trim()) return;

    const updated = [...(editCard.tasks || []), { text: newTask, done: false }];
    setEditCard({ ...editCard, tasks: updated });
    setNewTask("");
  };

  const timeBox =
    "flex-1 flex items-center gap-2 bg-white dark:bg-gray-800/80 border border-gray-300/70 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm";

  const inputBase =
    "bg-white dark:bg-gray-800/80 border border-gray-300/60 dark:border-gray-700 rounded-xl shadow-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400";

  const normalizeTime = (t) =>
    t ? String(t).split(":").slice(0, 2).join(":") : "";

  return (
    <AnimatePresence>
      {editCard && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* WRAPPER GIỮ BO GÓC */}
          <motion.div
            className="
              bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/60 
              shadow-[0_12px_35px_rgba(0,0,0,0.14)] rounded-2xl w-[560px] relative 
              max-h-[88vh] overflow-hidden
            "
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* SCROLLABLE CONTENT */}
            <div className="p-6 overflow-y-auto max-h-[88vh] modal-scroll">
              <style>{`
                .modal-scroll::-webkit-scrollbar { width: 8px; }
                .modal-scroll::-webkit-scrollbar-track { background: transparent; }
                .modal-scroll::-webkit-scrollbar-thumb {
                  background: rgba(0,0,0,0.18);
                  border-radius: 999px;
                }
                .modal-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(0,0,0,0.28);
                }
              `}</style>

              {/* Close Btn */}
              <button
                onClick={onClose}
                className="
                  absolute top-3 right-3 p-2 rounded-full 
                  bg-gray-200/70 dark:bg-gray-700/70 
                  text-gray-600 dark:text-gray-300 
                  hover:bg-red-500 hover:text-white 
                  transition
                "
              >
                <FaTimes size={14} />
              </button>

              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Chỉnh sửa thẻ
              </h3>

              {/* Title */}
              <label className="text-sm mb-1 font-medium block">Tên thẻ</label>
              <input
                value={editCard.text || ""}
                onChange={(e) =>
                  setEditCard({ ...editCard, text: e.target.value })
                }
                className={`${inputBase} w-full mb-4`}
              />

              {/* Assignee */}
              <label className="text-sm mb-1 font-medium block">Người phụ trách</label>
              <select
                value={editCard.assignee || ""}
                onChange={(e) =>
                  setEditCard({ ...editCard, assignee: e.target.value })
                }
                className={`${inputBase} w-full mb-4`}
              >
                <option value="">-- Chưa gán --</option>
                {planMembers.map((m, i) => (
                  <option key={i} value={m.email}>
                    {m.email}
                  </option>
                ))}
              </select>

              {/* Priority */}
              <label className="text-sm mb-1 font-medium block">Mức độ ưu tiên</label>
              <div className="flex gap-3 mb-5">
                {priorities.map((p) => {
                  const isSelected = editCard.priority === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() =>
                        setEditCard({
                          ...editCard,
                          priority: isSelected ? null : p.value,
                        })
                      }
                      className={`
                        flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium border shadow-sm transition-all
                        ${
                          isSelected
                            ? `${p.color} text-white shadow-md scale-105`
                            : "bg-white dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      {p.label}
                      {isSelected && <FaCheck className="text-[10px]" />}
                    </button>
                  );
                })}
              </div>

              {/* Time */}
              <label className="text-sm mb-1 font-medium block">Thời gian thực hiện</label>

              <div className="flex items-center gap-4 mb-6">
                {/* Bắt đầu */}
                <div
                  className="
                    flex-1 flex items-center gap-3
                    bg-white/80 dark:bg-gray-800/70
                    border border-gray-300/60 dark:border-gray-700
                    rounded-xl px-3 py-2
                    shadow-sm hover:shadow-md transition
                  "
                >
                  {/* Nhãn */}
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <FaCalendarAlt className="text-blue-500 text-base" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Bắt đầu:
                    </span>
                  </div>

                  {/* Time Picker */}
                  <div className="flex-1">
                    <TimePicker
                      value={normalizeTime(editCard.start)}
                      onChange={(v) => setEditCard({ ...editCard, start: v })}
                    />
                  </div>
                </div>

                {/* Kết thúc */}
                <div
                  className="
                    flex-1 flex items-center gap-3
                    bg-white/80 dark:bg-gray-800/70
                    border border-gray-300/60 dark:border-gray-700
                    rounded-xl px-3 py-2
                    shadow-sm hover:shadow-md transition
                  "
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <FaCalendarAlt className="text-blue-500 text-base" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Kết thúc:
                    </span>
                  </div>

                  <div className="flex-1">
                    <TimePicker
                      value={normalizeTime(editCard.end)}
                      onChange={(v) => setEditCard({ ...editCard, end: v })}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <label className="text-sm mb-1 font-medium block">Mô tả</label>
              <textarea
                value={editCard.description || ""}
                onChange={(e) =>
                  setEditCard({ ...editCard, description: e.target.value })
                }
                className={`${inputBase} w-full mb-4`}
                rows={3}
              />

              {/* Tasks */}
              <label className="text-sm mb-1 font-medium block">
                Công việc phải làm trước
              </label>

              <div className="space-y-2 mb-5">
                {(editCard.tasks || []).map((task, idx) => (
                  <div
                    key={idx}
                    className="
                      flex items-center justify-between 
                      bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700 
                      rounded-lg px-3 py-2 shadow-sm
                    "
                  >
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => {
                          const updated = [...editCard.tasks];
                          updated[idx].done = !updated[idx].done;
                          setEditCard({ ...editCard, tasks: updated });
                        }}
                      />
                      <span
                        className={
                          task.done
                            ? "line-through text-gray-400"
                            : "text-gray-700 dark:text-gray-200"
                        }
                      >
                        {task.text}
                      </span>
                    </label>

                    <button
                      onClick={() => {
                        const updated = editCard.tasks.filter((_, i) => i !== idx);
                        setEditCard({ ...editCard, tasks: updated });
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Thêm công việc..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    className={`${inputBase} flex-1 py-1.5`}
                  />

                  <button
                    onClick={handleAddTask}
                    className="
                      p-2 bg-blue-500 text-white rounded-lg 
                      hover:brightness-110 transition shadow
                    "
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>

              {/* Labels */}
              <label className="text-sm mb-1 font-medium block">Nhãn</label>
              <div className="flex flex-wrap gap-2 mb-5">
                {labels.map((lbl) => {
                  const isSelected = editCard.labels?.some(
                    (l) => l.text === lbl.text
                  );

                  return (
                    <button
                      key={lbl.text}
                      onClick={() => {
                        const updated = isSelected
                          ? editCard.labels.filter((l) => l.text !== lbl.text)
                          : [...(editCard.labels || []), lbl];

                        setEditCard({ ...editCard, labels: updated });
                      }}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded-md text-white text-sm
                        ${lbl.color}
                        ${
                          isSelected
                            ? "scale-105 shadow-md opacity-100"
                            : "opacity-80 hover:opacity-100"
                        }
                        transition-all
                      `}
                    >
                      {lbl.text}
                      {isSelected && <FaCheck className="text-[10px]" />}
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowLabelModal(true)}
                  className="
                    px-3 py-1 rounded-lg text-sm
                    bg-gray-200/70 dark:bg-gray-700/70 
                    hover:bg-gray-300 dark:hover:bg-gray-600
                    transition shadow-sm
                  "
                >
                  + Tạo nhãn mới
                </button>
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!editCard.text?.trim()) return;
                    saveCard();
                  }}
                  className="
                    px-5 py-2 rounded-xl 
                    bg-gradient-to-r from-blue-500 to-indigo-500 
                    text-white font-medium shadow-md hover:shadow-lg 
                    hover:-translate-y-0.5 transition-all
                  "
                >
                  Lưu
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
