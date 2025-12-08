import { useState, useRef, useEffect } from "react";
import { FaClock } from "react-icons/fa";

const COLOR_STYLES = {
  sky: { icon: "text-sky-500", selectedBg: "bg-sky-500" },
  violet: { icon: "text-violet-500", selectedBg: "bg-violet-500" },
  emerald: { icon: "text-emerald-500", selectedBg: "bg-emerald-500" },
  indigo: { icon: "text-indigo-500", selectedBg: "bg-indigo-500" },
  orange: { icon: "text-orange-500", selectedBg: "bg-orange-500" },
  amber: { icon: "text-amber-500", selectedBg: "bg-amber-500" },
  pink: { icon: "text-pink-500", selectedBg: "bg-pink-500" },
  rose: { icon: "text-rose-500", selectedBg: "bg-rose-500" },
  slate: { icon: "text-slate-500", selectedBg: "bg-slate-500" },
};

//  Chuẩn hóa HH:mm cả khi BE trả về HH:mm:ss
function normalizeHHmm(v) {
  if (!v) return "";
  return v.substring(0, 5); // luôn lấy HH:mm
}

export default function TimePicker({
  value,
  onChange,
  error = false,
  color = "sky",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const accent = COLOR_STYLES[color] || COLOR_STYLES.sky;

  // giá trị đã normalize (HH:mm)
  const normalized = normalizeHHmm(value);

  const selectedHour = normalized ? normalized.split(":")[0] : "00";
  const selectedMinute = normalized ? normalized.split(":")[1] : "00";

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Cập nhật giá trị theo HH:mm
  const updateTime = (h, m) => {
    const formatted = `${h}:${m}`;
    onChange(formatted);
  };

  return (
    <div className="relative w-full select-none" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          w-full px-3 py-1.5 rounded-lg border
          text-sm flex items-center justify-between 
          text-gray-900 dark:text-gray-100
          bg-transparent
          hover:bg-gray-100/70 dark:hover:bg-gray-700/70
          transition
          whitespace-nowrap
          ${
            error
              ? "border-rose-400 bg-rose-50/80 dark:border-rose-500 dark:bg-rose-950/40"
              : "border-transparent"
          }
        `}
      >
        {normalized || "--:--"}
        <FaClock className={`ml-2 ${error ? "text-rose-500" : accent.icon}`} />
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
          {/* HOURS */}
          <div className="flex-1 max-h-60 overflow-y-auto pr-1 space-y-1">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => updateTime(h, selectedMinute)}
                className={`
                  w-full rounded-lg py-2.5 text-sm
                  ${
                    h === selectedHour
                      ? `${accent.selectedBg} text-white shadow-md`
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                {h}
              </button>
            ))}
          </div>

          {/* MINUTES */}
          <div className="flex-1 max-h-60 overflow-y-auto pl-1 space-y-1">
            {minutes.map((m) => (
              <button
                key={m}
                onClick={() => updateTime(selectedHour, m)}
                className={`
                  w-full rounded-lg py-2.5 text-sm
                  ${
                    m === selectedMinute
                      ? `${accent.selectedBg} text-white shadow-md`
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
