"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GlobeAltIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const langs = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "en", label: "English" },
  ];

  const current = langs.find((l) => i18n.language?.startsWith(l.code)) || langs[0];

  const handlePick = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    setOpen(false);
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          inline-flex items-center gap-2
          h-9 px-3
          rounded-xl
          text-slate-700 dark:text-slate-200
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition
        "
        aria-haspopup="listbox"
        aria-expanded={open}
        title={current.label}
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="text-sm font-medium max-w-[84px] truncate">{current.label}</span>
        <ChevronDownIcon className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-44 z-50 overflow-hidden
            rounded-2xl border border-slate-200
            bg-white shadow-lg
            dark:border-slate-800 dark:bg-slate-900
          "
          role="listbox"
        >
          <div className="py-1">
            {langs.map((l) => {
              const active = current.code === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => handlePick(l.code)}
                  role="option"
                  aria-selected={active}
                  className={[
                    "w-full flex items-center justify-between gap-2",
                    "px-3 py-2 text-sm",
                    "text-slate-700 dark:text-slate-200",
                    "hover:bg-slate-100 dark:hover:bg-slate-800 transition",
                    active ? "font-semibold" : "font-medium",
                  ].join(" ")}
                >
                  <span className="truncate">{l.label}</span>
                  {active && <CheckIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
