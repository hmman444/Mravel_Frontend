import { PlusIcon } from "@heroicons/react/24/outline";
import { ui } from "./uiTokens";
import PlaceImageRow from "./PlaceImageRow";

export default function PlaceImagesCard({
  images,
  isLockedReadOnly,
  onAdd,
  onChangeField,
  onRemoveRow,
  onUploadRow,
}) {
  return (
    <div className={ui.card}>
      <div className={ui.cardHeader}>
        <div>
          <div className={ui.title}>Ảnh</div>
          <div className={ui.sub}>Quản lý cover + caption + upload cloud</div>
        </div>

        <button
          type="button"
          className={`${ui.btn} ${ui.btnGhost} gap-2`}
          onClick={onAdd}
          disabled={isLockedReadOnly}
        >
          <PlusIcon className="h-5 w-5" />
          Thêm ảnh
        </button>
      </div>

      <div className={ui.cardBody}>
        {!images || images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Chưa có ảnh. Thêm ảnh để có cover cho trang chi tiết.
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((im, idx) => (
              <PlaceImageRow
                key={idx}
                idx={idx}
                image={im}
                isLockedReadOnly={isLockedReadOnly}
                onChangeField={onChangeField}
                onRemove={onRemoveRow}
                onUpload={onUploadRow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
