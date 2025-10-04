export default function CardDetailModal({ card, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{card.title}</h2>
        <textarea
          className="w-full border rounded p-2 mb-4"
          placeholder="Thêm mô tả chi tiết..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Đóng
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
