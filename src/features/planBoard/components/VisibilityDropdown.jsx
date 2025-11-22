import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown } from "react-icons/fa";

const OPTIONS = [
  { value: "PRIVATE", label: "Riêng tư" },
  { value: "FRIENDS", label: "Bạn bè" },
  { value: "PUBLIC", label: "Công khai" },
];

export default function VisibilityDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [posReady, setPosReady] = useState(false);

  const buttonRef = useRef(null);

  /* -----------------------------------
     TÍNH VỊ TRÍ DROPDOWN
  -------------------------------------*/
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 180;

      setPos({
        top: rect.bottom + 6,
        left: rect.right - dropdownWidth,
      });

      requestAnimationFrame(() => setPosReady(true));
    } else {
      setPosReady(false);
    }
  }, [open]);

  /* -----------------------------------
     CLICK OUTSIDE
  -------------------------------------*/
  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  /* -----------------------------------
     PORTAL DROPDOWN
  -------------------------------------*/
  const dropdown =
    open && posReady
      ? createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="
              fixed z-[99999] w-44
              bg-white dark:bg-gray-900 
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-lg
              origin-top-right
              opacity-100 scale-100
              transition-all duration-150 ease-out
            "
            style={{ top: pos.top, left: pos.left }}
          >
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`
                  w-full text-left px-3 py-2 text-sm 
                  hover:bg-gray-100 dark:hover:bg-gray-800 
                  transition
                  ${
                    value === opt.value
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 dark:text-gray-200"
                  }
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
        onClick={toggle}
        className="
          flex items-center gap-2
          px-3 py-1.5 rounded-md
          border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-900
          text-sm text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition
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
