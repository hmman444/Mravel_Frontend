import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { showError, showSuccess } from "../../../../utils/toastUtils";
import { usePlanBoard } from "../../hooks/usePlanBoard";

/**
 * Modal tạo nhãn mới (Label)
 * - Gọi API upsertLabel(planId, payload)
 * - Cập nhật lại editCard.labels và board.labels
 */
export default function LabelModal({
  planId,
  colors = [],
  editCard,
  setEditCard,
  onClose,
}) {
  const { upsertLabel } = usePlanBoard(planId);

  const [newLabel, setNewLabel] = useState({
    text: "Nhãn mới",
    color: "bg-green-600",
  });

  const handleCreate = async () => {
    if (!newLabel.text.trim()) {
      showError("Tên nhãn không được để trống");
      return;
    }

    try {
      // tạo hoặc cập nhật nhãn
      const label = await upsertLabel(newLabel).unwrap();

      // cập nhật local card
      const updatedLabels = editCard?.labels
        ? [...editCard.labels, label]
        : [label];
      setEditCard({ ...editCard, labels: updatedLabels });

      showSuccess("Đã tạo nhãn mới");
      onClose();
    } catch (err) {
      showError("Không thể tạo nhãn");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px] relative shadow-xl">
        {/* Đóng modal */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          <FaTimes />
        </button>

        <h3 className="text-lg font-bold mb-3">Tạo nhãn mới</h3>

        {/* Xem trước */}
        <div
          className={`px-3 py-2 rounded mb-3 text-white text-sm text-center ${newLabel.color}`}
        >
          {newLabel.text}
        </div>

        {/* Tên nhãn */}
        <label className="text-sm block mb-1">Tiêu đề</label>
        <input
          value={newLabel.text}
          onChange={(e) => setNewLabel({ ...newLabel, text: e.target.value })}
          className="w-full border rounded-lg px-2 py-1 mb-3 dark:bg-gray-700 dark:text-white"
          placeholder="Nhập tên nhãn..."
        />

        {/* Chọn màu */}
        <label className="text-sm block mb-1">Chọn màu</label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setNewLabel({ ...newLabel, color: c })}
              className={`w-8 h-8 rounded ${c} border-2 ${
                newLabel.color === c ? "border-black dark:border-white" : "border-transparent"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setNewLabel({ ...newLabel, color: "" })}
          className="px-3 py-1 border rounded mb-3 text-sm w-full"
        >
          Gỡ bỏ màu
        </button>

        {/* Tạo mới */}
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-primary text-white rounded-lg w-full"
        >
          Tạo mới
        </button>
      </div>
    </div>
  );
}
