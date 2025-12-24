import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function CodeNameListEditor({ title, hint, value = [], onChange, disabled }) {
  const list = Array.isArray(value) ? value : [];
  const emit = (next) => onChange?.(next);

  const add = () => emit([...list, { code: "", name: "" }]);
  const remove = (i) => emit(list.filter((_, idx) => idx !== i));
  const patch = (i, p) => emit(list.map((x, idx) => (idx === i ? { ...(x || {}), ...(p || {}) } : x)));

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {hint ? <div className="text-xs text-gray-500 mt-0.5">{hint}</div> : null}
        </div>
        <button type="button" onClick={add} disabled={disabled} className="px-3 py-2 rounded-xl border hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50">
          <PlusIcon className="h-4 w-4" />
          Thêm
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có.</div>
      ) : (
        <div className="space-y-2">
          {list.map((x, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
              <input
                value={x?.code || ""}
                onChange={(e) => patch(i, { code: e.target.value })}
                className="md:col-span-4 border rounded-xl px-3 py-2 text-sm"
                placeholder="CODE"
                disabled={disabled}
              />
              <input
                value={x?.name || ""}
                onChange={(e) => patch(i, { name: e.target.value })}
                className="md:col-span-7 border rounded-xl px-3 py-2 text-sm"
                placeholder="Tên hiển thị"
                disabled={disabled}
              />
              <button type="button" onClick={() => remove(i)} disabled={disabled} className="md:col-span-1 p-2 rounded-xl hover:bg-red-50 justify-self-end">
                <TrashIcon className="h-5 w-5 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}