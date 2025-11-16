import { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import Button from "../../../components/Button";
import { usePlaceTypeahead } from "../hooks/usePlaceTypeahead";
import { makePlaceDisplay } from "../../../utils/makePlaceDisplay";

export default function TopSearchBar({ initialLabel, onSubmit }) {
  const [q, setQ] = useState(initialLabel || "");
  const [open, setOpen] = useState(false);
  const [pickedSlug, setPickedSlug] = useState(null);
  const skipNextFetch = useRef(false);          // NEW
  const ref = useRef(null);
  const { items, loading, fetchSuggest, resetSuggest } = usePlaceTypeahead();

  useEffect(() => { setQ(initialLabel || ""); setPickedSlug(null); }, [initialLabel]);

  useEffect(() => {
    // chặn 1 lần fetch ngay sau khi pick
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (!q?.trim()) { resetSuggest(); setOpen(false); return; }
    const t = setTimeout(() => { 
      // chỉ fetch khi chưa có item được chọn
      if (!pickedSlug) {
        fetchSuggest(q, 8);
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, pickedSlug]); // include pickedSlug để ngăn mở lại dropdown

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = (items || []).filter(it => (it.kind === "DESTINATION" || it.kind === 0));

  const pick = (it) => {
    const display = makePlaceDisplay(it);
    setQ(display);
    setPickedSlug(it.slug);
    setOpen(false);
    resetSuggest();                 // NEW: xoá kết quả cũ để không còn “Đang tìm…”
    skipNextFetch.current = true;   // NEW: chặn effect kế tiếp
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ text: q, slug: pickedSlug });
  };

  return (
    <div className="relative z-40 w-full bg-white/70 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur border-b border-gray-200/60 dark:border-white/10">
      <form onSubmit={submit} className="max-w-6xl mx-auto px-4 md:px-6 py-3">
        <div className="relative" ref={ref}>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm px-3 md:px-4 h-14">
            <div className="flex-1 flex items-center">
              <FaMapMarkerAlt className="text-gray-400 mr-2 shrink-0" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPickedSlug(null); }}
                onFocus={() => setOpen(Boolean(q) && !pickedSlug)}  // NEW
                placeholder="Nhập địa điểm (Hà Nội, Đà Nẵng...)"
                className="w-full outline-none bg-transparent text-gray-900 dark:text-gray-100"
              />
            </div>
            <Button type="submit" className="h-10 px-4 md:px-5 rounded-lg bg-primary hover:bg-primaryHover whitespace-nowrap">
              Tìm địa điểm
            </Button>
          </div>

          {open && (
            <div className="absolute left-0 right-0 mt-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50">
              {loading && <div className="px-3 py-2 text-sm text-gray-500">Đang tìm…</div>}
              {!loading && !suggestions.length && <div className="px-3 py-2 text-sm text-gray-500">Không có gợi ý</div>}
              {suggestions.map(it => (
                <button
                  key={it.slug}
                  type="button"
                  onMouseDown={() => pick(it)}
                  className="w-full text-left px-3 py-2 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {it.coverImageUrl
                    ? <img src={it.coverImageUrl} alt={it.name} className="w-10 h-10 object-cover rounded" />
                    : <div className="w-10 h-10 bg-gray-200 rounded" />}
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
      </form>
    </div>
  );
}