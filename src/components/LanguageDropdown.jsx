// src/components/LanguageDropdown.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GlobeAltIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function LanguageDropdown({ scrolled = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const langs = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "en", label: "English" },
  ];

  const current = langs.find(l => i18n.language?.startsWith(l.code)) || langs[0];

  const handlePick = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    setOpen(false);
  };

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const tone = scrolled ? "text-gray-700 dark:text-gray-200" : "text-white";

  return (
    <div className="relative" ref={ref}>
      {/* Nút mở dropdown (gọn hơn) */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={[
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md",
          "bg-transparent hover:bg-white/10 dark:hover:bg-white/10",
          "transition-colors",
          tone
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <GlobeAltIcon className={`w-5 h-5 ${tone}`} />
        <span className="text-sm max-w-[80px] truncate">{current.label}</span>
        <ChevronDownIcon className={`w-4 h-4 ${tone}`} />
      </button>

      {/* Menu nhỏ gọn + không lấn: w-36, z-50, max-h + scroll */}
      {open && (
        <div
          className={[
            "absolute right-0 mt-2 w-36 z-50 rounded-xl overflow-hidden shadow-md border",
            "bg-white/10 dark:bg-gray-900/20 backdrop-blur-md",
            "border-white/20 dark:border-white/10",
            "max-h-60 overflow-auto"
          ].join(" ")}
          role="listbox"
        >
          {langs.map(l => {
            const active = current.code === l.code;
            return (
              <button
                key={l.code}
                onClick={() => handlePick(l.code)}
                role="option"
                aria-selected={active}
                className={[
                  "w-full text-left px-3 py-2 text-sm",
                  scrolled ? "text-gray-900 dark:text-gray-100" : "text-white",
                  "hover:bg-white/20 dark:hover:bg-white/10",
                  active ? "font-semibold" : "font-normal",
                  "truncate"
                ].join(" ")}
                title={l.label}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}