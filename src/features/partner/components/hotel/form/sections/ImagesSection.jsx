// src/features/partner/components/hotel/ImagesSection.jsx
import { PlusIcon, ArrowUpTrayIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ImagesSection({
  images,
  addImageByUrl,
  onPickFiles,
  setCover,
  removeImageAt,
  updateImageField,
}) {
  return (
    <details open className="group">
      <summary className="cursor-pointer select-none font-semibold">Ảnh (Gallery)</summary>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{images.length} ảnh</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addImageByUrl}
            className="px-3 py-2 border rounded-xl text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Thêm link ảnh
          </button>

          <label className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 cursor-pointer flex items-center gap-2">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Tải ảnh lên
            <input type="file" accept="image/*" multiple className="hidden" onChange={onPickFiles} />
          </label>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="mt-3 text-sm text-gray-500">Chưa có ảnh.</div>
      ) : (
        <div className="mt-3 space-y-3">
          {images.map((img, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border rounded-2xl p-3">
              <div className="md:col-span-3">
                <div className="w-full aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden">
                  {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <button
                  type="button"
                  onClick={() => setCover(idx)}
                  className={`mt-2 w-full text-xs px-2 py-1.5 rounded-xl border ${
                    img.cover ? "bg-green-50 border-green-200 text-green-700" : "hover:bg-gray-50"
                  }`}
                >
                  {img.cover ? "Ảnh bìa" : "Đặt làm bìa"}
                </button>
              </div>

              <div className="md:col-span-8 space-y-2">
                <input
                  value={img.url}
                  onChange={(e) => updateImageField(idx, { url: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  placeholder="https://..."
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <input
                    value={img.caption}
                    onChange={(e) => updateImageField(idx, { caption: e.target.value })}
                    className="md:col-span-9 border rounded-xl px-3 py-2 text-sm"
                    placeholder="Caption (tuỳ chọn)"
                  />
                  <input
                    value={img.sortOrder}
                    onChange={(e) => updateImageField(idx, { sortOrder: e.target.value })}
                    className="md:col-span-3 border rounded-xl px-3 py-2 text-sm"
                    placeholder="Sort"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex md:justify-end">
                <button
                  type="button"
                  onClick={() => removeImageAt(idx)}
                  className="p-2 rounded-xl hover:bg-red-50"
                  title="Xóa ảnh"
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        * Upload hiện tại dùng base64 (quick). Sau muốn chuẩn: thêm API upload trả URL.
      </div>
    </details>
  );
}