// src/components/DestinationTypeahead.jsx
import { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { usePlaceTypeahead } from "../features/catalog/hooks/usePlaceTypeahead";
import { makePlaceDisplay } from "../utils/makePlaceDisplay";

const slugToQuery = (slug) =>
  String(slug || "")
    .trim()
    .replace(/[-_]+/g, " ")       // hoi-an -> hoi an
    .replace(/\s+/g, " ");

export default function DestinationTypeahead({
  label = "Tìm địa điểm",
  placeholder = "Nhập địa điểm muốn tham quan (TP. Hồ Chí Minh, Phú Quốc, Hội An...)",
  onSubmit,
  onPick,
  onChangeText,
  className = "",
  buttonSlot = null,

  value,        // text hiển thị
  defaultSlug,  // slug đã lưu
}) {
  const [q, setQ] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [pickedSlug, setPickedSlug] = useState(defaultSlug ?? null);

  const boxRef = useRef(null);
  const skipNextFetch = useRef(false);

  const { items, loading, fetchSuggest, resetSuggest } = usePlaceTypeahead();

  // sync text từ parent nhưng không phá fetch khi gõ
  useEffect(() => {
    if (value == null) return;
    const next = String(value ?? "");
    if (next === q) return;

    setQ(next);
    skipNextFetch.current = true;

    if (!next.trim()) {
      setPickedSlug(null);
      setOpen(false);
      resetSuggest();
    }
  }, [value, q, resetSuggest]);

  // sync slug từ parent
  useEffect(() => {
    if (defaultSlug === undefined) return;
    setPickedSlug(defaultSlug || null);
  }, [defaultSlug]);

  // ✅ resolve hiển thị đẹp từ slug khi edit (value đang rỗng)
  const resolvedOnce = useRef(false);

  useEffect(() => {
    if (!defaultSlug) return;
    if (resolvedOnce.current) return;

    const currentText = String(value ?? "").trim();
    if (currentText) return; // đã có destinationName thì khỏi resolve

    // ⚠️ gọi suggest bằng query “hoi an” để backend match được
    fetchSuggest(slugToQuery(defaultSlug), 8);
  }, [defaultSlug, value, fetchSuggest]);

  useEffect(() => {
    if (!defaultSlug) return;
    if (resolvedOnce.current) return;

    const found = (items || []).find((it) => it?.slug === defaultSlug);
    if (!found) return;

    const text = makePlaceDisplay(found);

    setQ(text);
    setPickedSlug(defaultSlug);
    setOpen(false);
    resetSuggest();

    skipNextFetch.current = true;
    resolvedOnce.current = true;

    // ✅ đẩy ngược lên parent để set destinationName (lần edit sau khỏi resolve)
    if (typeof onPick === "function") onPick({ text, slug: defaultSlug });
  }, [items, defaultSlug, resetSuggest, onPick]);

  // logic fetch như cũ
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    if (!q?.trim()) {
      resetSuggest();
      setOpen(false);
      setPickedSlug(null);
      return;
    }

    const t = setTimeout(() => {
      if (!pickedSlug) {
        fetchSuggest(q, 8);
        setOpen(true);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q, pickedSlug, fetchSuggest, resetSuggest]);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = (items || []).filter(
    (it) => it.kind === "DESTINATION" || it.kind === 0
  );

  const pick = (it) => {
    const text = makePlaceDisplay(it);
    setQ(text);
    setPickedSlug(it.slug);
    setOpen(false);
    resetSuggest();
    skipNextFetch.current = true;

    if (typeof onPick === "function") onPick({ text, slug: it.slug });
  };

  const submit = (e) => {
    e?.preventDefault?.();
    if (typeof onSubmit === "function") onSubmit({ text: q, slug: pickedSlug });
  };

  return (
    <div className={["relative", className].join(" ")} ref={boxRef}>
      {label && <div className="mb-1.5 text-sm font-semibold text-white/90">{label}</div>}

      <div className="flex items-center w-full">
        <FaMapMarkerAlt className="text-gray-400 mr-2" />
        <input
          value={q}
          onChange={(e) => {
            const val = e.target.value;
            setQ(val);
            setPickedSlug(null);
            if (typeof onChangeText === "function") onChangeText(val);
          }}
          onFocus={() => setOpen(Boolean(q) && !pickedSlug)}
          onKeyDown={(e) => e.key === "Enter" && submit(e)}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
        />
        {typeof buttonSlot === "function"
          ? buttonSlot({ submit, text: q, slugPicked: pickedSlug })
          : null}
      </div>

      {open && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-20">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Đang tìm...</div>}
          {!loading && !suggestions.length && (
            <div className="px-3 py-2 text-sm text-gray-500">Không có gợi ý</div>
          )}
          {suggestions.map((it) => (
            <button
              key={it.slug}
              type="button"
              onMouseDown={() => pick(it)}
              className="w-full text-left px-3 py-2 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {it.coverImageUrl ? (
                <img src={it.coverImageUrl} alt={it.name} className="w-10 h-10 object-cover rounded" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{it.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {makePlaceDisplay(it).replace(`${it.name}, `, "")}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}