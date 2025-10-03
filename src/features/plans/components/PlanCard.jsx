import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaCalendarAlt, FaCheck, FaEllipsisV } from "react-icons/fa";

export default function PlanCard({
  card,
  listId,
  toggleDone,
  setActiveCard,
  setEditCard,
  duplicateCard,
  deleteCard,
  activeMenu,
  setActiveMenu,
}) {
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (activeMenu === card.id && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.top + window.scrollY - 10,
        left: rect.right + window.scrollX + 8,
      });
    }
  }, [activeMenu, card.id]);

  return (
    <div
      className="p-3 rounded-lg mb-2 shadow-sm bg-gray-100 dark:bg-gray-700 cursor-pointer"
      onClick={() => {
        setActiveCard(card);
        setEditCard({ ...card });
      }}
    >
      {card.label && (
        <span
          className={`px-2 py-1 text-xs text-white rounded ${card.label.color}`}
        >
          {card.label.text}
        </span>
      )}

      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleDone(listId, card.id);
          }}
          className={`w-5 h-5 p-1 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            card.done
              ? "bg-green-500 text-white border-green-600"
              : "bg-white border-gray-400"
          }`}
        >
          {card.done && <FaCheck />}
        </button>

        <span>{card.text}</span>

        <div className="ml-auto">
          <button
            ref={btnRef}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === card.id ? null : card.id);
            }}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {activeMenu === card.id &&
        createPortal(
          <div
            className="absolute bg-white dark:bg-gray-700 shadow-md rounded-md w-32 z-[9999]"
            style={{
              position: "absolute",
              top: menuPos.top,
              left: menuPos.left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateCard(card);
                setActiveMenu(null);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Tạo bản sao
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCard(card);
                setActiveMenu(null);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500"
            >
              Xóa
            </button>
          </div>,
          document.body
        )}

      {card.start && card.end && (
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <FaCalendarAlt /> {card.start} → {card.end}
        </div>
      )}
    </div>
  );
}
