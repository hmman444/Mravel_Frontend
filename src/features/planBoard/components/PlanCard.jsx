import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaCalendarAlt,
  FaCheck,
  FaEllipsisV,
  FaCopy,
  FaTimes,
} from "react-icons/fa";

export default function PlanCard({
  card,
  listId,
  toggleDone,
  setEditCard,
  duplicateCard,
  activeMenu,
  setActiveMenu,
  setConfirmDeleteCard,
  canEdit = true,
}) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  /* -------------------------------------------------------------
   * TÍNH VỊ TRÍ DROPDOWN MENU
   * ------------------------------------------------------------- */
  useEffect(() => {
    if (activeMenu === card.id && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const width = 150;

      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - width + window.scrollX,
      });
    }
  }, [activeMenu, card.id]);

  /* -------------------------------------------------------------
   * CLICK OUTSIDE ĐỂ ĐÓNG MENU
   * ------------------------------------------------------------- */
  useEffect(() => {
    if (activeMenu !== card.id) return;

    const handle = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [activeMenu, card.id, setActiveMenu]);

  /* -------------------------------------------------------------
   * UI: CARD
   * ------------------------------------------------------------- */
  return (
    <div
      className="p-3 rounded-lg mb-2 bg-gray-100 dark:bg-gray-700 
      shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => setEditCard({ ...card, listId })}
    >
      {/* Labels */}
      {card.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 4).map((lbl) => (
            <span
              key={lbl.id}
              className={`${lbl.color} text-[10px] text-white px-2 py-[2px] rounded-md`}
            >
              {lbl.text}
            </span>
          ))}
          {card.labels.length > 4 && (
            <span className="text-[10px] text-gray-400">
              +{card.labels.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Main row */}
      <div className="flex items-center gap-2">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canEdit) toggleDone(listId, card.id);
          }}
          className={`w-5 h-5 p-[2px] rounded-full border flex items-center justify-center flex-shrink-0 transition ${
            card.done
              ? "bg-green-500 text-white border-green-600"
              : "bg-white border-gray-400"
          }`}
        >
          {card.done && <FaCheck className="text-xs" />}
        </button>

        {/* Title */}
        <span
          className={`flex-1 text-sm ${
            card.done
              ? "text-gray-400 line-through"
              : "text-gray-800 dark:text-gray-100"
          }`}
        >
          {card.text}
        </span>

        {/* Menu button */}
        {canEdit && (
          <button
            ref={btnRef}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === card.id ? null : card.id);
            }}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaEllipsisV size={13} />
          </button>
        )}
      </div>

      {/* Time */}
      {card.start && card.end && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300">
          <FaCalendarAlt /> {card.start} → {card.end}
        </div>
      )}

      {/* Priority */}
      {card.priority && (
        <div
          className={`mt-2 inline-block text-xs px-2 py-[1px] rounded font-semibold ${
            card.priority === "high"
              ? "bg-red-500 text-white"
              : card.priority === "medium"
              ? "bg-yellow-400 text-black"
              : "bg-green-500 text-white"
          }`}
        >
          Ưu tiên:{" "}
          {card.priority === "high"
            ? "Cao"
            : card.priority === "medium"
            ? "Trung bình"
            : "Thấp"}
        </div>
      )}

      {/* Dropdown menu */}
      {activeMenu === card.id &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-36 rounded-lg shadow-lg border
            bg-white dark:bg-gray-800 animate-dropdown-slide"
            style={{
              top: menuPos.top,
              left: menuPos.left,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()} // chặn bubble lên card
          >
            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateCard(card, listId);
                setActiveMenu(null);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm
                text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaCopy className="text-gray-500" /> Tạo bản sao
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteCard({
                  listId,
                  cardId: card.id,
                  card,
                });
                setActiveMenu(null);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm
                text-red-600 hover:bg-red-50 dark:hover:bg-red-800"
            >
              <FaTimes className="text-red-500" /> Xóa
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
