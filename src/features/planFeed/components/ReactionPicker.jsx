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
        return "text-blue-500";
      case "love":
        return "text-red-500";
      case "haha":
      case "wow":
        return "text-yellow-500";
      case "sad":
        return "text-yellow-400";
      case "angry":
        return "text-orange-600";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const handleEnter = () => {
    clearTimeout(hoverTimeout.current);
    setOpen(true);
  };
  const handleLeave = () => {
    hoverTimeout.current = setTimeout(() => setOpen(false), 120);
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
        onClick={() => handleClick(current ? current.key : "like")}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
          current
            ? getColor(current.key)
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
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
        className={`absolute -top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-3 py-2 flex gap-2 border dark:border-gray-700 z-20 transition-all duration-200 ease-out transform ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => handleClick(r.key)}
            className="text-2xl hover:scale-125 transition-transform"
            title={r.label}
          >
            {r.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
