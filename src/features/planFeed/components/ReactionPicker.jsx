import { useState, useRef } from "react";
import { REACTIONS } from "../utils/reactionsMeta";
import { HandThumbUpIcon } from "@heroicons/react/24/outline";

export default function ReactionPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const hoverTimeout = useRef(null);

  const current = REACTIONS.find((r) => r.key === value) || null;

  const getColor = (t) => {
    switch (t) {
      case "like":
        return "text-sky-600";
      case "love":
        return "text-rose-500";
      case "haha":
      case "wow":
        return "text-amber-500";
      case "sad":
        return "text-amber-400";
      case "angry":
        return "text-orange-600";
      default:
        return "text-gray-500 dark:text-gray-300";
    }
  };

  const handleEnter = () => {
    clearTimeout(hoverTimeout.current);
    setOpen(true);
  };

  const handleLeave = () => {
    hoverTimeout.current = setTimeout(() => setOpen(false), 140);
  };

  const handleClick = (type) => {
    if (value === type) onChange(null);
    else onChange(type);
    setOpen(false);
  };

  return (
    <div
      className="relative inline-block select-none"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => handleClick(current ? current.key : "like")}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-150
          ${
            current
              ? `${getColor(current.key)} bg-sky-50 dark:bg-sky-900/30 shadow-sm`
              : "text-gray-600 dark:text-gray-400 hover:text-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-gray-300"
          }
        `}
      >
        {!current ? (
          <>
            <HandThumbUpIcon className="w-4 h-4 stroke-[2]" />
            <span>Thích</span>
          </>
        ) : (
          <>
            <span className="text-lg">{current.emoji}</span>
            <span>{current.label}</span>
          </>
        )}
      </button>

      <div
        className={`
          absolute -top-16 left-1/2 -translate-x-1/2
          bg-white dark:bg-gray-900
          rounded-lg shadow-lg dark:shadow-black/60 border border-gray-200/80 dark:border-gray-700
          px-3 py-2 flex gap-2 z-20 backdrop-blur-sm
          transition-all duration-200 ease-out
          ${
            open
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }
        `}
      >
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => handleClick(r.key)}
            className="text-2xl hover:scale-125 active:scale-95 transition-transform duration-150"
            title={r.label}
          >
            {r.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
