import { useEffect, useState } from "react";
import { FaTimes, FaLock, FaEye, FaEdit } from "react-icons/fa";

export default function AccessRequestModal({
  isOpen,
  onClose,
  visibility = "PRIVATE",     
  onRequestView,              
  onRequestEdit,              
  loadingType = null,        
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPublic = visibility === "PUBLIC";

  const title = "Yêu cầu quyền truy cập";
  const description = isPublic
    ? "Đây là lịch trình công khai. Bạn có thể xem nội dung, nhưng cần xin quyền để chỉnh sửa."
    : "Bạn chưa có quyền truy cập đầy đủ vào lịch trình này. Hãy gửi yêu cầu để xem hoặc chỉnh sửa, chủ sở hữu sẽ xem xét.";

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center">
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* modal */}
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[420px] max-w-[90vw] transform transition-all duration-200 ${
          mounted
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-95"
        }`}
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          <FaTimes />
        </button>

        <div className="p-6">
          {/* icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
            <FaLock />
          </div>

          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {title}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {description}
          </p>

          {!isPublic && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              • <span className="font-semibold">Quyền xem</span>: chỉ xem lịch trình, không chỉnh sửa. <br />
              • <span className="font-semibold">Quyền chỉnh sửa</span>: có thể thêm, sửa, xóa thẻ và danh sách.
            </p>
          )}

          {/* buttons */}
          <div className="flex justify-end gap-2 mt-2">
            {!isPublic && (
              <button
                onClick={onRequestView}
                disabled={loadingType === "VIEW"}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-gray-300 dark:border-gray-700 transition-colors ${
                  loadingType === "VIEW"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <FaEye className="text-gray-500" />
                {loadingType === "VIEW" ? "Đang gửi..." : "Yêu cầu quyền xem"}
              </button>
            )}

            <button
              onClick={onRequestEdit}
              disabled={loadingType === "EDIT"}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors ${
                loadingType === "EDIT"
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <FaEdit />
              {loadingType === "EDIT"
                ? "Đang gửi..."
                : isPublic
                ? "Yêu cầu quyền chỉnh sửa"
                : "Yêu cầu quyền chỉnh sửa"}
            </button>
          </div>

          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            Yêu cầu của bạn sẽ được gửi đến chủ sở hữu lịch trình. Bạn sẽ được
            thông báo khi được chấp nhận.
          </p>
        </div>
      </div>
    </div>
  );
}
