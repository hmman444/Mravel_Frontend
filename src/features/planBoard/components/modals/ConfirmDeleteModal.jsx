export default function ConfirmDeleteModal({ card, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
        <p className="mb-6">
          Bạn có chắc chắn muốn xóa thẻ "{card.text}"?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
