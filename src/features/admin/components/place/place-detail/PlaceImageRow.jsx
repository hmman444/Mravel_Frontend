import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ui } from "./uiTokens";
import { Label } from "./pills";

export default function PlaceImageRow({ idx, image, isLockedReadOnly, onChangeField, onRemove, onUpload }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label required>URL ảnh</Label>
              <input
                className={ui.input}
                disabled={isLockedReadOnly}
                value={image.url}
                onChange={(e) => onChangeField(idx, "url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Caption</Label>
              <input
                className={ui.input}
                disabled={isLockedReadOnly}
                value={image.caption}
                onChange={(e) => onChangeField(idx, "caption", e.target.value)}
                placeholder="Ví dụ: Phố cổ về đêm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <Label>Thứ tự (sortOrder)</Label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className={ui.input}
                disabled={isLockedReadOnly}
                value={image.sortOrder ?? idx}
                onChange={(e) =>
                  onChangeField(idx, "sortOrder", e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </div>

            <div className="flex items-end gap-3">
              <label
                className={`${ui.btn} ${ui.btnGhost} gap-2 w-full ${isLockedReadOnly ? "pointer-events-none opacity-50" : ""}`}
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
                    if (f) onUpload(idx, f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className={`${ui.btn} ${ui.btnGhost} w-full`}
                disabled={isLockedReadOnly}
                onClick={() => onChangeField(idx, "cover", true)}
              >
                {image.cover ? "✓ Ảnh bìa" : "Đặt làm bìa"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${ui.btn} ${ui.btnGhost} px-3`}
            disabled={isLockedReadOnly}
            onClick={() => onRemove(idx)}
            title="Xóa ảnh"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {image.url && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <img src={image.url} alt={image.caption || "image"} className="h-52 w-full object-cover" loading="lazy" />
        </div>
      )}
    </div>
  );
}
