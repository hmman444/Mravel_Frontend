import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

function labelOfAmenity(a) {
  const name =
    a?.name ??
    a?.title ??
    a?.label ??
    a?.displayName ??
    a?.code ??
    a?.id ??
    "—";

  if (typeof name === "object" && name) return name.vi || name.en || JSON.stringify(name);
  return String(name);
}

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function AmenityMultiSelect({
  title = "Tiện ích",
  hint,
  items = [],
  value = [],
  onChange,

  //  ưu tiên code để match DB amenityCodes
  getKey = (a) => a?.code ?? a?.id,
}) {
  const [q, setQ] = useState("");
  const [openAll, setOpenAll] = useState(false);
  const [openSuggest, setOpenSuggest] = useState(false);

  //  map key(code) -> item để render label VI từ code
  const itemMap = useMemo(() => {
    const m = new Map();
    (items || []).forEach((a) => {
      const k = getKey(a);
      const key = k == null ? "" : String(k);
      if (key) m.set(key, a);
    });
    return m;
  }, [items, getKey]);

  //  normalize value -> list of keys (string) giữ order
  const selectedList = useMemo(() => {
    const out = [];
    const seen = new Set();

    (value || []).forEach((x) => {
      const k = typeof x === "string" ? x : getKey(x);
      const key = k == null ? "" : String(k);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });

    return out;
  }, [value, getKey]);

  const selectedKeys = useMemo(() => new Set(selectedList), [selectedList]);

  const resolveLabel = (key) => {
    const it = itemMap.get(String(key));
    return it ? labelOfAmenity(it) : String(key);
  };

  const filtered = useMemo(() => {
    const s = norm(q);
    if (!s) return [];
    return (items || []).filter((a) => {
      const hay = norm(`${getKey(a) ?? ""} ${labelOfAmenity(a)} ${a?.description ?? ""}`);
      return hay.includes(s);
    });
  }, [items, q, getKey]);

  // gợi ý chỉ lấy tối đa 12 cái cho gọn
  const suggestions = useMemo(() => filtered.slice(0, 12), [filtered]);

  //  toggle theo KEY và emit mảng KEY (string) => đồng bộ DB
  const toggle = (a) => {
    const raw = getKey(a);
    const k = raw == null ? "" : String(raw);
    if (!k) return;

    const next = selectedKeys.has(k)
      ? selectedList.filter((x) => x !== k)
      : [...selectedList, k];

    onChange?.(next);
  };

  const clearAll = () => onChange?.([]);

  const closeSuggest = () => setOpenSuggest(false);

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {hint ? <div className="text-xs text-gray-500 mt-0.5">{hint}</div> : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenAll(true)}
            className="text-xs px-3 py-1.5 rounded-xl border hover:bg-gray-50"
          >
            Xem tất cả
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="text-xs px-3 py-1.5 rounded-xl border hover:bg-gray-50"
          >
            Xóa chọn
          </button>
        </div>
      </div>

      {/*  Search ngoài + dropdown gợi ý */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpenSuggest(true);
          }}
          onFocus={() => {
            if (q) setOpenSuggest(true);
          }}
          onBlur={() => {
            // delay nhẹ để click được item trong dropdown
            setTimeout(closeSuggest, 120);
          }}
          placeholder="Tìm theo tên / code..."
          className="w-full pl-10 pr-9 py-2 border rounded-xl outline-none focus:ring focus:border-blue-500"
        />

        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              closeSuggest();
            }}
            className="absolute right-2 top-2 rounded-lg p-1 hover:bg-gray-100"
            title="Clear"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        )}

        {/* dropdown chỉ hiện khi đang gõ */}
        {openSuggest && q && (
          <div className="absolute z-40 mt-2 w-full rounded-2xl border bg-white shadow-lg overflow-hidden">
            {suggestions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">Không tìm thấy tiện ích.</div>
            ) : (
              <div className="max-h-72 overflow-auto divide-y">
                {suggestions.map((a) => {
                  const k = String(getKey(a) ?? "");
                  const on = selectedKeys.has(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // tránh blur input trước khi click
                      onClick={() => toggle(a)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start justify-between gap-3 ${
                        on ? "bg-blue-50/60" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {labelOfAmenity(a)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {a?.code || k}
                          {a?.description ? ` • ${a.description}` : ""}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
                        }`}
                      >
                        {on ? "Đã chọn" : "Chọn"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* footer gợi ý */}
            <div className="px-3 py-2 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {filtered.length > suggestions.length
                  ? `Còn ${filtered.length - suggestions.length} kết quả khác…`
                  : `Tổng ${filtered.length} kết quả`}
              </div>
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  closeSuggest();
                  setOpenAll(true);
                }}
              >
                Mở danh sách
              </button>
            </div>
          </div>
        )}
      </div>

      {/*  chips đã chọn (hiển thị VI theo code) */}
      <div className="flex flex-wrap gap-2">
        {selectedList.length === 0 ? (
          <div className="text-xs text-gray-500">Chưa chọn tiện ích nào.</div>
        ) : (
          selectedList.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-xs border border-blue-100"
              title={k}
            >
              {resolveLabel(k)}
            </span>
          ))
        )}
      </div>

      {/*  Modal “Xem tất cả” (giữ nguyên phần bạn đang có) */}
      {openAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenAll(false);
          }}
        >
          <div className="w-full max-w-4xl rounded-3xl bg-white border shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-gray-900">Tất cả tiện ích</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Click để chọn/bỏ chọn • Đã chọn: <b>{selectedKeys.size}</b>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenAll(false)}
                className="rounded-xl p-2 hover:bg-gray-100"
                title="Đóng"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-5">
              <div className="max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(items || []).map((a) => {
                    const k = String(getKey(a) ?? "");
                    const on = selectedKeys.has(k);

                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggle(a)}
                        className={`group w-full text-left rounded-2xl border p-3 hover:bg-gray-50 transition ${
                          on ? "border-blue-500 bg-blue-50/60" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {labelOfAmenity(a)}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {a?.code || k}
                              {a?.description ? ` • ${a.description}` : ""}
                            </div>
                          </div>

                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                              on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500"
                            }`}
                            aria-hidden="true"
                          >
                            ✓
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between">
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 text-sm rounded-xl border bg-white hover:bg-gray-50"
              >
                Xóa hết
              </button>

              <button
                type="button"
                onClick={() => setOpenAll(false)}
                className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}