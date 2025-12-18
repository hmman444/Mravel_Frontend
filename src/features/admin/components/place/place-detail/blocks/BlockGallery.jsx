import { PlusIcon } from "@heroicons/react/24/outline";
import { ui } from "../uiTokens";
import { Label } from "../pills";
import GalleryItemRow from "./GalleryItemRow";

export default function BlockGallery({
  idx,
  block,
  isLockedReadOnly,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onUploadItem,
}) {
  const gallery = Array.isArray(block.gallery) ? block.gallery : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Gallery</Label>
        <button
          type="button"
          className={`${ui.btn} ${ui.btnGhost} gap-2`}
          disabled={isLockedReadOnly}
          onClick={() => onAddItem(idx)}
        >
          <PlusIcon className="h-5 w-5" />
          Thêm ảnh
        </button>
      </div>

      {gallery.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Gallery đang trống.
        </div>
      ) : (
        <div className="space-y-3">
          {gallery.map((g, gi) => (
            <GalleryItemRow
              key={gi}
              blockIdx={idx}
              itemIdx={gi}
              item={g}
              isLockedReadOnly={isLockedReadOnly}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              onUploadItem={onUploadItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
