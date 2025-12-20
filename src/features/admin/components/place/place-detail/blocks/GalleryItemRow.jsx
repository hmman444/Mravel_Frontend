import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function GalleryItemRow({
  blockIdx,
  itemIdx,
  item,
  isLockedReadOnly,
  onUpdateItem,
  onRemoveItem,
  onUploadItem,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800/70">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label required>URL ảnh</Label>
          <input
            className={ui.input}
            disabled={isLockedReadOnly}
            value={item.url || ""}
            onChange={(e) => onUpdateItem(blockIdx, itemIdx, "url", e.target.value)}
          />
        </div>

        <div>
          <Label>Thứ tự</Label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            className={ui.input}
            disabled={isLockedReadOnly}
            value={item.sortOrder ?? itemIdx}
            onChange={(e) =>
              onUpdateItem(
                blockIdx,
                itemIdx,
                "sortOrder",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label>Caption</Label>
          <input
            className={ui.input}
            disabled={isLockedReadOnly}
            value={item.caption || ""}
            onChange={(e) => onUpdateItem(blockIdx, itemIdx, "caption", e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <label
            className={`${ui.btn} ${ui.btnGhost} gap-2 w-full ${
              isLockedReadOnly ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <PhotoIcon className="h-5 w-5" />
            Tải ảnh lên
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isLockedReadOnly}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadItem(blockIdx, itemIdx, f);
                e.target.value = "";
              }}
            />
          </label>

          <button
            type="button"
            className={`${ui.btn} ${ui.btnGhost} px-3`}
            disabled={isLockedReadOnly}
            onClick={() => onRemoveItem(blockIdx, itemIdx)}
            title="Xóa ảnh"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {item.url && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <img
            src={item.url}
            alt={item.caption || "gallery-item"}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
