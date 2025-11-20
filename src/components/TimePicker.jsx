import { useState, useRef, useEffect } from "react";
import { FaClock } from "react-icons/fa";

export default function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative w-full select-none" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          w-full px-3 py-1.5 rounded-lg 
          bg-transparent text-sm flex items-center justify-between 
          text-gray-900 dark:text-gray-100
          hover:bg-gray-100/70 dark:hover:bg-gray-700/70
          transition
          whitespace-nowrap
        "
      >
        {value || "--:--"}
        <FaClock className="ml-2 text-gray-500" />
      </button>

      {open && (
        <div
          className="
            absolute right-0 z-[300] mt-2 w-64
            rounded-xl border border-gray-200 dark:border-gray-700
            bg-white/95 dark:bg-gray-900/95 
            shadow-xl
            p-4 flex gap-4
            transition-all duration-150
          "
        >
          <div className="flex-1 max-h-60 overflow-y-auto pr-1 space-y-1">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => onChange(`${h}:${value?.split(":")[1] || "00"}`)}
                className={`
                  w-full rounded-lg py-2.5 text-sm
                  ${
                    value?.startsWith(h)
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                {h}
              </button>
            ))}
          </div>

          <div className="flex-1 max-h-60 overflow-y-auto pl-1 space-y-1">
            {minutes.map((m) => (
              <button
                key={m}
                onClick={() => onChange(`${value?.split(":")[0] || "00"}:${m}`)}
                className={`
                  w-full rounded-lg py-2.5 text-sm
                  ${
                    value?.endsWith(m)
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
