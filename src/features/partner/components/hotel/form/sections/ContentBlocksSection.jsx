// src/features/partner/components/hotel/ContentBlocksSection.jsx
import { useMemo, useState } from "react";
import { PlusIcon, TrashIcon, XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const BLOCK_TYPES = [
  { type: "HEADING", label: "Heading" },
  { type: "PARAGRAPH", label: "Paragraph" },
  { type: "QUOTE", label: "Quote" },
  { type: "INFOBOX", label: "Info box" },
  { type: "IMAGE", label: "Image" },
  { type: "MAP", label: "Map" },
  { type: "DIVIDER", label: "Divider" },
];

const SECTIONS = ["OVERVIEW", "STORY", "OTHER"];

const asArray = (v) => (Array.isArray(v) ? v : []);
const asString = (v, fb = "") => (v == null ? fb : String(v));
const asInt = (v, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fb;
};

const makeDefaultBlock = (type) => {
  const base = {
    section: "OVERVIEW",
    type,
    sortOrder: 0,
    text: "",
    imageUrl: "",
    imageCaption: "",
    mapLat: "",
    mapLon: "",
  };

  if (type === "IMAGE") return { ...base, text: "" };
  if (type === "MAP") return { ...base, text: "", imageUrl: "", imageCaption: "" };
  if (type === "DIVIDER") return { ...base, text: "", imageUrl: "", imageCaption: "", mapLat: "", mapLon: "" };
  return base;
};

export default function ContentBlocksSection({
  content = [],
  addBlock,                 //  kỳ vọng: addBlock(payload)
  removeBlockAt,
  updateBlockField,
  onPickBlockImage,         //  optional: (idx, event) => upload/convert base64 rồi update imageUrl
}) {
  const blocks = useMemo(() => asArray(content), [content]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleAdd = (type) => {
    try {
      //  khuyến nghị: addBlock nhận payload
      addBlock?.(makeDefaultBlock(type));
    } catch (e) {
      // fallback nếu hook bạn vẫn là addBlock() không nhận param
      console.warn("addBlock(payload) failed, fallback addBlock()", e);
      addBlock?.();
      // sau đó user tự đổi type trong block mới (nếu cần)
    }
    setPickerOpen(false);
  };

  const update = (idx, patch) => {
    try {
      updateBlockField?.(idx, patch);
    } catch (e) {
      console.error("updateBlockField error:", e);
    }
  };

  const remove = (idx) => {
    try {
      removeBlockAt?.(idx);
    } catch (e) {
      console.error("removeBlockAt error:", e);
    }
  };

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">Content blocks</summary>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{blocks.length} block</div>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="px-3 py-2 border rounded-xl text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm block
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="mt-3 text-sm text-gray-500">Chưa có content.</div>
      ) : (
        <div className="mt-3 space-y-3">
          {blocks.map((b = {}, idx) => {
            const type = asString(b.type, "PARAGRAPH");
            const section = asString(b.section, "OVERVIEW");

            return (
              <div key={idx} className="border rounded-2xl p-3 space-y-3">
                {/* header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">
                    Block #{idx + 1}{" "}
                    <span className="text-xs text-gray-500">
                      ({section} • {type})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-2 rounded-xl hover:bg-red-50"
                    title="Xóa block"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </div>

                {/* meta row: section + sort (type không cần dropdown nữa, vì type chọn từ lúc tạo) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <label className="md:col-span-4 text-sm">
                    <div className="text-xs text-gray-500 mb-1">Vị trí (section)</div>
                    <select
                      value={section}
                      onChange={(e) => update(idx, { section: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                    >
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="md:col-span-3 text-sm">
                    <div className="text-xs text-gray-500 mb-1">Sort</div>
                    <input
                      type="number"
                      value={asInt(b.sortOrder, 0)}
                      onChange={(e) => update(idx, { sortOrder: asInt(e.target.value, 0) })}
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </label>

                  <div className="md:col-span-5 text-sm">
                    <div className="text-xs text-gray-500 mb-1">Loại block</div>
                    <div className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-50">
                      {type}
                    </div>
                  </div>
                </div>

                {/* body fields by type */}
                {type === "DIVIDER" ? (
                  <div className="text-sm text-gray-500 italic">
                    Divider không có nội dung.
                  </div>
                ) : type === "IMAGE" ? (
                  <div className="space-y-2">
                    {/* preview */}
                    {b.imageUrl ? (
                      <div className="w-full max-w-md h-40 bg-gray-100 rounded-2xl overflow-hidden border">
                        <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full max-w-md h-40 bg-gray-50 rounded-2xl border flex items-center justify-center text-sm text-gray-400">
                        Chưa có ảnh
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      {/* upload */}
                      <label className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 cursor-pointer flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Tải ảnh lên
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onPickBlockImage?.(idx, e)}
                        />
                      </label>

                      {/* hint */}
                      <div className="text-xs text-gray-500">
                        Ảnh sẽ thuộc section: <b>{section}</b>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={asString(b.imageUrl)}
                        onChange={(e) => update(idx, { imageUrl: e.target.value })}
                        className="border rounded-xl px-3 py-2 text-sm"
                        placeholder="Image URL"
                      />
                      <input
                        value={asString(b.imageCaption)}
                        onChange={(e) => update(idx, { imageCaption: e.target.value })}
                        className="border rounded-xl px-3 py-2 text-sm"
                        placeholder="Image caption (tuỳ chọn)"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={asString(b.text)}
                      onChange={(e) => update(idx, { text: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm min-h-[110px]"
                      placeholder={
                        type === "HEADING"
                          ? "Nhập tiêu đề..."
                          : type === "QUOTE"
                          ? "Nhập trích dẫn..."
                          : type === "INFOBOX"
                          ? "Nhập nội dung hộp thông tin..."
                          : "Nhập nội dung..."
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/*  Modal chọn loại block */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPickerOpen(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white border shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-gray-900">Chọn loại block</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Chọn loại trước để form hiển thị đúng field
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-xl p-2 hover:bg-gray-100"
                title="Đóng"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BLOCK_TYPES.map((x) => (
                  <button
                    key={x.type}
                    type="button"
                    onClick={() => handleAdd(x.type)}
                    className="w-full text-left rounded-2xl border p-4 hover:bg-gray-50"
                  >
                    <div className="text-sm font-semibold text-gray-900">{x.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {x.type === "IMAGE"
                        ? "Thêm ảnh + caption + upload từ máy tính"
                        : x.type === "DIVIDER"
                        ? "Đường phân cách, không có nội dung"
                        : "Thêm nội dung văn bản"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="px-4 py-2 text-sm rounded-xl border bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </details>
  );
}