// src/features/planBoard/components/modals/AccessRequestModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { FaTimes, FaLock, FaEye, FaEdit, FaCheckCircle } from "react-icons/fa";

export default function AccessRequestModal({
  isOpen,
  onClose,
  visibility = "PRIVATE",
  onRequestView,
  onRequestEdit,
  loadingType = null,

  // optional: khóa không cho click ra ngoài để đóng
  lockBackdropClose = true,
}) {
  const [mounted, setMounted] = useState(false);
  const [sent, setSent] = useState({ VIEW: false, EDIT: false });

  useEffect(() => {
    setMounted(isOpen);

    // mỗi lần mở lại modal thì reset trạng thái đã gửi
    if (isOpen) setSent({ VIEW: false, EDIT: false });
  }, [isOpen]);

  const isPublic = visibility === "PUBLIC";

  const title = "Yêu cầu quyền truy cập";
  const description = useMemo(() => {
    if (isPublic) {
      return "Kế hoạch công khai: bạn có thể xem, nhưng cần xin quyền để chỉnh sửa.";
    }
    return "Bạn chưa có quyền truy cập. Hãy gửi yêu cầu xin quyền xem hoặc chỉnh sửa, chủ sở hữu sẽ xem xét.";
  }, [isPublic]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!lockBackdropClose) onClose?.();
  };

  const handleRequestView = async () => {
    if (loadingType || sent.VIEW) return;
    try {
      await onRequestView?.();
      // KHÔNG đóng modal
      setSent((s) => ({ ...s, VIEW: true }));
    } catch {
      // lỗi thì giữ nguyên để user bấm lại
    }
  };

  const handleRequestEdit = async () => {
    if (loadingType || sent.EDIT) return;
    try {
      await onRequestEdit?.();
      // KHÔNG đóng modal
      setSent((s) => ({ ...s, EDIT: true }));
    } catch {
      // lỗi thì giữ nguyên để user bấm lại
    }
  };

  const viewBtnDisabled = isPublic || loadingType === "VIEW" || sent.VIEW;
  const editBtnDisabled = loadingType === "EDIT" || sent.EDIT;

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center">
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-opacity duration-200 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleBackdropClick}
      />

      {/* panel */}
      <div
        className={`
          relative w-[520px] max-w-[92vw]
          bg-white/95 dark:bg-gray-900/95
          rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.18)]
          border border-gray-200/60 dark:border-gray-700/60
          backdrop-blur-xl
          transform transition-all duration-200
          ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
        `}
      >
        {/* NAVBAR */}
        <div
          className="
            flex items-center justify-between
            px-5 py-4
            border-b border-gray-200/60 dark:border-gray-700/60
          "
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner shrink-0">
              <FaLock className="text-lg" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                {description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              p-2 rounded-full
              bg-gray-200/70 dark:bg-gray-700/70
              text-gray-600 dark:text-gray-300
              hover:bg-red-500 hover:text-white transition
            "
            aria-label="Đóng"
            title="Đóng"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5">
          {!isPublic && (
            <div className="mb-4 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/70 dark:bg-gray-800/40 p-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                • <span className="font-semibold">Quyền xem</span>: chỉ xem lịch trình.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                • <span className="font-semibold">Quyền chỉnh sửa</span>: thêm/sửa/xóa nội dung.
              </p>
            </div>
          )}

          {/* trạng thái đã gửi */}
          {(sent.VIEW || sent.EDIT) && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200/70 dark:border-emerald-700/40 bg-emerald-50/70 dark:bg-emerald-900/10 p-3">
              <FaCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Bạn đã gửi{" "}
                <span className="font-semibold">
                  {sent.EDIT ? "yêu cầu quyền chỉnh sửa" : "yêu cầu quyền xem"}
                </span>
                . Modal sẽ giữ nguyên để bạn theo dõi trạng thái.
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!isPublic && (
              <button
                onClick={handleRequestView}
                disabled={viewBtnDisabled}
                className={`
                  px-4 py-2 rounded-xl text-sm flex items-center gap-2
                  transition-all border
                  ${
                    viewBtnDisabled
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700"
                      : "bg-white/80 dark:bg-gray-900/80 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
                  }
                `}
              >
                <FaEye className="text-gray-500" />
                {loadingType === "VIEW"
                  ? "Đang gửi..."
                  : sent.VIEW
                  ? "Đã gửi quyền xem"
                  : "Yêu cầu quyền xem"}
              </button>
            )}

            <button
              onClick={handleRequestEdit}
              disabled={editBtnDisabled}
              className={`
                px-4 py-2 rounded-xl text-sm flex items-center gap-2
                transition-all shadow
                ${
                  editBtnDisabled
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:brightness-110"
                }
              `}
            >
              <FaEdit />
              {loadingType === "EDIT"
                ? "Đang gửi..."
                : sent.EDIT
                ? "Đã gửi quyền sửa"
                : "Yêu cầu quyền chỉnh sửa"}
            </button>
          </div>

          <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-400">
            Yêu cầu sẽ được gửi đến chủ sở hữu. Bạn sẽ được thông báo khi có phản hồi.
          </p>
        </div>
      </div>
    </div>
  );
}
