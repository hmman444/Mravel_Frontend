import { useState } from "react";
import { REACTIONS } from "../../utils/reactionsMeta";

export default function ReactionPicker({ onPick }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
        Thích
      </button>

      {open && (
        <div className="absolute -top-14 left-0 bg-white dark:bg-gray-800 rounded-full shadow-lg px-2 py-1 flex gap-2 border dark:border-gray-700">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => onPick(r.key)}
              className="text-xl hover:scale-110 transition"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
