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
    setMounted(isOpen);
  }, [isOpen]);

  if (!isOpen) return null;

  const isPublic = visibility === "PUBLIC";

  const title = "Yêu cầu quyền truy cập";
  const description = isPublic
    ? "Đây là lịch trình công khai. Bạn có thể xem nội dung, nhưng cần xin quyền để chỉnh sửa."
    : "Bạn chưa có quyền truy cập đầy đủ vào lịch trình này. Hãy gửi yêu cầu để xem hoặc chỉnh sửa, chủ sở hữu sẽ xem xét.";

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-opacity duration-200 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`
          relative w-[420px] max-w-[90vw]
          bg-white/95 dark:bg-gray-900/95
          rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.18)]
          border border-gray-200/60 dark:border-gray-700/60
          backdrop-blur-xl
          transform transition-all duration-200
          ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
        `}
      >
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 p-2 rounded-full
            bg-gray-200/70 dark:bg-gray-700/70
            text-gray-600 dark:text-gray-300
            hover:bg-red-500 hover:text-white transition
          "
        >
          <FaTimes size={14} />
        </button>

        <div className="p-6">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 shadow-inner">
            <FaLock className="text-xl" />
          </div>

          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {title}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {description}
          </p>

          {!isPublic && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
              <p>• <span className="font-semibold">Quyền xem</span>: chỉ xem lịch trình.</p>
              <p>• <span className="font-semibold">Quyền chỉnh sửa</span>: có thể thêm, sửa, xóa nội dung.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">

            {!isPublic && (
              <button
                onClick={onRequestView}
                disabled={loadingType === "VIEW"}
                className={`
                  px-4 py-2 rounded-xl text-sm flex items-center gap-2
                  transition-all border
                  ${
                    loadingType === "VIEW"
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      : "bg-white/80 dark:bg-gray-900/80 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
                  }
                `}
              >
                <FaEye className="text-gray-500" />
                {loadingType === "VIEW" ? "Đang gửi..." : "Yêu cầu quyền xem"}
              </button>
            )}

            <button
              onClick={onRequestEdit}
              disabled={loadingType === "EDIT"}
              className={`
                px-4 py-2 rounded-xl text-sm flex items-center gap-2
                transition-all shadow
                ${
                  loadingType === "EDIT"
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:brightness-110"
                }
              `}
            >
              <FaEdit />
              {loadingType === "EDIT" ? "Đang gửi..." : "Yêu cầu quyền chỉnh sửa"}
            </button>

          </div>

          <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-400">
            Yêu cầu của bạn sẽ được gửi đến chủ sở hữu. Bạn sẽ được thông báo khi có phản hồi.
          </p>
        </div>
      </div>
    </div>
  );
}
