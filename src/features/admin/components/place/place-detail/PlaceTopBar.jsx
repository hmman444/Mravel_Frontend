import { ArrowLeftIcon, PencilSquareIcon, CheckIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ui } from "./uiTokens";
import { KindPill, StatusPill } from "./pills";

export default function PlaceTopBar({
  headerTitle,
  isCreate,
  isEditing,
  form,
  loading,
  saving,
  deleting,
  dirty,
  onBack,
  onEdit,
  onCancel,
  onSave,
  onToggleLock,
  onAskDelete,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onBack} className={`${ui.btn} ${ui.btnGhost} px-3`} title="Quay lại">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{headerTitle}</h1>
            {!isCreate && (
              <>
                <KindPill kind={form.kind} />
                <StatusPill active={!!form.active} />
              </>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {isCreate
              ? "Tạo địa điểm theo phong cách seed (nội dung dạng blocks)."
              : "Xem chi tiết – bấm Chỉnh sửa để thay đổi."}
            {(isCreate || isEditing) && dirty ? " (Có thay đổi chưa lưu)" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isCreate && !isEditing && (
          <>
            <button type="button" className={`${ui.btn} ${ui.btnGhost} gap-2`} onClick={onEdit}>
              <PencilSquareIcon className="h-5 w-5" />
              Chỉnh sửa
            </button>

            <button
              type="button"
              className={`${ui.btn} ${ui.btnGhost}`}
              onClick={onToggleLock}
              disabled={loading || deleting}
              title="Khóa/Mở khóa"
            >
              {form.active ? "Khóa" : "Mở khóa"}
            </button>

            <button
              type="button"
              className={`${ui.btn} ${ui.btnDanger} gap-2`}
              onClick={onAskDelete}
              disabled={loading || deleting}
              title="Xóa"
            >
              <TrashIcon className="h-5 w-5" />
              Xóa
            </button>
          </>
        )}

        {(isCreate || isEditing) && (
          <>
            <button type="button" className={`${ui.btn} ${ui.btnGhost} gap-2`} onClick={onCancel}>
              <XMarkIcon className="h-5 w-5" />
              Hủy
            </button>

            <button
              type="button"
              className={`${ui.btn} ${ui.btnPrimary} gap-2`}
              onClick={onSave}
              disabled={loading || saving}
            >
              <CheckIcon className="h-5 w-5" />
              Lưu
            </button>
          </>
        )}
      </div>
    </div>
  );
}
