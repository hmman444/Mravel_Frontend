import { useState } from "react";
import { FaTimes, FaCheck, FaPlus, FaTrashAlt, FaCalendarAlt } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

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
    { value: "low", label: "Thấp", color: "bg-green-500" },
    { value: "medium", label: "Trung bình", color: "bg-yellow-500" },
    { value: "high", label: "Cao", color: "bg-red-500" },
  ];

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const updated = [...(editCard.tasks || []), { text: newTask, done: false }];
    setEditCard({ ...editCard, tasks: updated });
    setNewTask("");
  };

  const toggleTask = (index) => {
    const updated = [...(editCard.tasks || [])];
    updated[index].done = !updated[index].done;
    setEditCard({ ...editCard, tasks: updated });
  };

  const deleteTask = (index) => {
    const updated = (editCard.tasks || []).filter((_, i) => i !== index);
    setEditCard({ ...editCard, tasks: updated });
  };

  return (
    <AnimatePresence>
      {editCard && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[520px] relative max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* 🔹 Nút đóng modal */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition"
            >
              <FaTimes />
            </button>

            <h3 className="text-lg font-bold mb-4">Chỉnh sửa thẻ</h3>

            {/* Tiêu đề */}
            <label className="text-sm block mb-1 font-medium">Tên thẻ</label>
            <input
              value={editCard.text || ""}
              onChange={(e) => setEditCard({ ...editCard, text: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-primary"
            />

            {/* Người phụ trách */}
            <label className="text-sm block mb-1 font-medium">Người phụ trách</label>
            <select
              value={editCard.assignee || ""}
              onChange={(e) => setEditCard({ ...editCard, assignee: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 bg-white dark:bg-gray-700"
            >
              <option value="">-- Chưa gán --</option>
              {planMembers.map((m, i) => (
                <option key={i} value={m.email}>
                  {m.email}
                </option>
              ))}
            </select>

            {/* Mức độ ưu tiên */}
            <label className="text-sm block mb-1 font-medium">Mức độ ưu tiên</label>
            <div className="flex gap-3 mb-4">
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
                    className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      isSelected
                        ? `${p.color} text-white`
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {p.label}
                    {isSelected && <FaCheck className="text-[10px]" />}
                  </button>
                );
              })}
            </div>

            {/* Thời gian */}
            <label className="text-sm block mb-1 font-medium">Thời gian thực hiện</label>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 flex items-center border rounded-lg px-3 py-2 dark:border-gray-700 bg-white dark:bg-gray-700">
                <FaCalendarAlt className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Bắt đầu:</span>
                <input
                  type="time"
                  value={editCard.start || ""}
                  onChange={(e) => setEditCard({ ...editCard, start: e.target.value })}
                  className="ml-2 flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>
              <div className="flex-1 flex items-center border rounded-lg px-3 py-2 dark:border-gray-700 bg-white dark:bg-gray-700">
                <FaCalendarAlt className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Kết thúc:</span>
                <input
                  type="time"
                  value={editCard.end || ""}
                  onChange={(e) => setEditCard({ ...editCard, end: e.target.value })}
                  className="ml-2 flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>
            </div>

            {/* Mô tả */}
            <label className="text-sm block mb-1 font-medium">Mô tả</label>
            <textarea
              value={editCard.description || ""}
              onChange={(e) => setEditCard({ ...editCard, description: e.target.value })}
              className="w-full border rounded-lg px-2 py-2 mb-3"
              placeholder="Thêm mô tả chi tiết..."
              rows={3}
            />

            {/* Công việc phải làm trước */}
            <label className="text-sm block mb-1 font-medium">Công việc phải làm trước</label>
            <div className="space-y-2 mb-4">
              {(editCard.tasks || []).map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-700"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!task.done}
                      onChange={() => toggleTask(index)}
                    />
                    <span
                      className={`${
                        task.done
                          ? "line-through text-gray-400"
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {task.text}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteTask(index)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Thêm công việc..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 border rounded-md px-2 py-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                />
                <button
                  onClick={handleAddTask}
                  className="px-2 py-1 bg-primary text-white rounded-md"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            {/* Nhãn */}
            <label className="text-sm block mb-1 font-medium">Nhãn</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((lbl) => {
                const isSelected = editCard.labels?.some((l) => l.text === lbl.text);
                return (
                  <button
                    key={lbl.text}
                    onClick={() => {
                      let updated = editCard.labels || [];
                      updated = isSelected
                        ? updated.filter((l) => l.text !== lbl.text)
                        : [...updated, lbl];
                      setEditCard({ ...editCard, labels: updated });
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-white text-sm ${lbl.color} ${
                      isSelected ? "scale-105 shadow-md" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {lbl.text}
                    {isSelected && <FaCheck className="text-[10px]" />}
                  </button>
                );
              })}
              <button
                onClick={() => setShowLabelModal(true)}
                className="px-2 py-1 border rounded-md text-sm bg-gray-100 dark:bg-gray-700"
              >
                + Tạo nhãn mới
              </button>
            </div>

            {/* Nút lưu */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  if (!editCard.text?.trim()) return;
                  saveCard();
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:brightness-110 transition"
              >
                Lưu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
