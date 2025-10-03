import { useState } from "react";
import CardDetailModal from "./CardDetailModal";

export default function PlanTaskCard({ card }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        {card.title}
      </div>
      {open && <CardDetailModal card={card} onClose={() => setOpen(false)} />}
    </>
  );
}
