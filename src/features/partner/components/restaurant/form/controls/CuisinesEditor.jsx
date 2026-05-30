// src/features/partner/components/restaurants/editors/CuisinesEditor.jsx
import { useMemo, useRef, useState } from "react";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

//  TẠM THỜI: bạn có thể thay bằng options fetch từ API rồi truyền vào prop `options`
const CUISINE_SEED = [
  { code: "VIETNAMESE", name: "Việt Nam", region: "CENTRAL" },
  { code: "ASIAN", name: "Châu Á", region: "ASIA" },
  { code: "BUFFET_VIET_ASIAN", name: "Buffet & Gọi món Việt - Á", region: "ASIA" },
  { code: "EUROPEAN", name: "Âu", region: "EUROPE" },
  { code: "FRENCH", name: "Pháp", region: "EUROPE" },
  { code: "ITALIAN", name: "Ý", region: "EUROPE" },
];

// tạo code từ name: "Việt Nam" -> "VIET_NAM"
const toCuisineCode = (name) => {
  const s = String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return s ? s.toUpperCase() : "";
};

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function CuisinesEditor({
  value = [],
  onChange,
  disabled,
  options = CUISINE_SEED, //  sau này bạn fetch API xong truyền vào đây
}) {
  const { t } = useTranslation();
  const list = Array.isArray(value) ? value : [];
  const emit = (next) => onChange?.(next);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(() => new Set());
  const blurTimer = useRef(null);

  const selectedCodes = useMemo(() => {
    const set = new Set();
    list.forEach((x) => {
      const c = String(x?.code || "").trim().toUpperCase();
      if (c) set.add(c);
    });
    return set;
  }, [list]);

  const filtered = useMemo(() => {
    const nq = norm(q);
    const base = Array.isArray(options) ? options : [];
    if (!nq) return base.slice(0, 8);

    return base
      .filter((x) => {
        const name = norm(x?.name);
        const code = norm(x?.code);
        const region = norm(x?.region);
        return name.includes(nq) || code.includes(nq) || region.includes(nq);
      })
      .slice(0, 10);
  }, [q, options]);

  const addCuisine = (c) => {
    if (disabled) return;
    const code = String(c?.code || "").trim();
    const name = String(c?.name || "").trim();
    const region = String(c?.region || "").trim();

    if (!name && !code) return;

    const codeKey = code.toUpperCase();
    if (codeKey && selectedCodes.has(codeKey)) {
      setQ("");
      setOpen(false);
      return;
    }

    emit([
      ...list,
      {
        code: code || toCuisineCode(name),
        name: name || code,
        region: region || "",
      },
    ]);
    setQ("");
    setOpen(false);
  };

  const addCustomFromQuery = () => {
    const name = q.trim();
    if (!name) return;
    addCuisine({ code: toCuisineCode(name), name, region: "" });
  };

  const remove = (i) => emit(list.filter((_, idx) => idx !== i));
  const patch = (i, p) => emit(list.map((x, idx) => (idx === i ? { ...(x || {}), ...(p || {}) } : x)));

  const toggleEdit = (i) => {
    const next = new Set(editOpen);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setEditOpen(next);
  };

  const onFocus = () => {
    if (disabled) return;
    setOpen(true);
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  const onBlur = () => {
    // delay để click option không bị đóng trước
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Enter = chọn item đầu tiên nếu có, nếu không thì thêm custom
      if (filtered.length > 0) addCuisine(filtered[0]);
      else addCustomFromQuery();
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("partner.cuisines.title")}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {t("partner.cuisines.hint_prefix")} <span className="font-medium">Enter</span> {t("partner.cuisines.hint_suffix")}
        </div>
      </div>

      {/* Search box */}
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className="w-full border rounded-xl px-3 py-2 text-sm disabled:opacity-50"
          placeholder={t("partner.cuisines.search_placeholder")}
        />

        {/* Suggestions */}
        {open && !disabled && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={addCustomFromQuery}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {t("partner.cuisines.not_found")} —{" "}
                <span className="font-medium">{t("partner.cuisines.add_new_label")}</span> “{q.trim() || "…"}”
              </button>
            ) : (
              <>
                {filtered.map((c) => {
                  const codeKey = String(c?.code || "").trim().toUpperCase();
                  const picked = codeKey && selectedCodes.has(codeKey);
                  return (
                    <button
                      key={codeKey || `${c?.name}-${c?.region}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addCuisine(c)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        picked ? "opacity-50" : ""
                      }`}
                      title={picked ? t("partner.cuisines.picked") : t("partner.cuisines.pick")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {c?.name || t("partner.cuisines.no_name")}
                            {c?.region ? <span className="text-gray-500 dark:text-gray-400"> • {c.region}</span> : null}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t("partner.cuisines.code_label")} <span className="font-mono">{c?.code || "—"}</span>
                            {picked ? <span className="ml-2">{t("partner.cuisines.picked_paren")}</span> : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="border-t">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={addCustomFromQuery}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    disabled={!q.trim()}
                  >
                    {t("partner.cuisines.add_new_from_query")} <span className="font-medium">“{q.trim() || "…"}”</span>{" "}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({t("partner.cuisines.auto_code")} <span className="font-mono">{toCuisineCode(q.trim()) || "—"}</span>)
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {list.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">{t("partner.cuisines.empty")}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((x, i) => {
            const name = String(x?.name || "").trim();
            const code = String(x?.code || "").trim();
            const region = String(x?.region || "").trim();
            const isEdit = editOpen.has(i);

            return (
              <div key={`${code || name}-${i}`} className="w-full rounded-xl border">
                {/* chip header */}
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {name || <span className="text-gray-400">{t("partner.cuisines.no_name_entered")}</span>}
                      {region ? <span className="text-gray-500 dark:text-gray-400 font-normal"> • {region}</span> : null}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("partner.cuisines.code_label")} <span className="font-mono">{code || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleEdit(i)}
                      disabled={disabled}
                      className="px-2 py-2 rounded-xl border hover:bg-gray-50 text-sm disabled:opacity-50 flex items-center gap-2"
                      title={t("partner.cuisines.edit_detail_title")}
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      {isEdit ? t("common.close") : t("common.edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(i)}
                      disabled={disabled}
                      className="px-2 py-2 rounded-xl hover:bg-red-50 disabled:opacity-50"
                      title={t("common.delete")}
                    >
                      <XMarkIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* optional edit */}
                {isEdit && (
                  <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-5">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("partner.cuisines.name_field")}</div>
                      <input
                        value={x?.name || ""}
                        onChange={(e) => {
                          const newName = e.target.value;
                          const nextCode = (x?.code || "").trim() ? x.code : toCuisineCode(newName);
                          patch(i, { name: newName, code: nextCode });
                        }}
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        placeholder={t("partner.cuisines.name_placeholder")}
                        disabled={disabled}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("partner.cuisines.code_field")}</div>
                      <input
                        value={x?.code || ""}
                        onChange={(e) => patch(i, { code: e.target.value })}
                        className="w-full border rounded-xl px-3 py-2 text-sm font-mono"
                        placeholder="VIETNAMESE"
                        disabled={disabled}
                      />
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t("partner.cuisines.code_hint")}</div>
                    </div>

                    <div className="md:col-span-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t("partner.cuisines.region_field")}</div>
                      <input
                        value={x?.region || ""}
                        onChange={(e) => patch(i, { region: e.target.value })}
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        placeholder={t("partner.cuisines.region_placeholder")}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}