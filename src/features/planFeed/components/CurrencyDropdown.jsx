import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown } from "react-icons/fa";

const OPTIONS = [
  { value: "VND", label: "VND (₫)" },
  { value: "USD", label: "USD ($)" },
];

export default function CurrencyDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [posReady, setPosReady] = useState(false);

  const buttonRef = useRef(null);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = 160;

      setPos({
        top: rect.bottom + 6,
        left: rect.right - width,
      });

      requestAnimationFrame(() => setPosReady(true));
    } else {
      setPosReady(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const dropdown =
    open && posReady
      ? createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="
              fixed z-[99999] w-40
              bg-white dark:bg-gray-900 
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-lg
              origin-top-right animate-[fadeDown_0.15s_ease-out]
            "
            style={{ top: pos.top, left: pos.left }}
          >
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition
                  ${value === opt.value ? "text-blue-600 font-semibold" : ""}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="
          flex items-center justify-between gap-2 w-full
          px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200
          shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition
        "
      >
        {OPTIONS.find((o) => o.value === value)?.label}
        <FaChevronDown
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {dropdown}
    </>
  );
}
