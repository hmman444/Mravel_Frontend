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

  useEffect(() => {
    if (activeMenu === card.id && btnRef.current && menuRef.current) {
      const btn = btnRef.current.getBoundingClientRect();
      const menu = menuRef.current.getBoundingClientRect();

      setMenuPos({
        top: btn.bottom + 6,
        left: btn.right - menu.width,
      });
    }
  }, [activeMenu, card.id]);

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
  }, [activeMenu, setActiveMenu]);

  const formatTime = (t) =>
    t ? String(t).split(":").slice(0, 2).join(":") : "";

  const hasStart = !!card.start;
  const hasEnd = !!card.end;

  return (
    <div
      onClick={() => setEditCard({ ...card, listId })}
      className="
        group
        p-3 rounded-xl mb-2 
        bg-[#f3f6fa] dark:bg-gray-800/90
        border border-gray-200/60 dark:border-gray-700/50
        shadow-[0_1px_3px_rgba(0,0,0,0.07)]
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
        transition-all duration-200 
        cursor-pointer
        animate-fadeIn
      "
    >
      {/* Labels */}
      {card.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 4).map((lbl) => (
            <span
              key={lbl.id}
              className={`
                ${lbl.color}
                text-[10px] text-white 
                px-2 py-[2px] rounded-md 
                shadow-sm
              `}
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
          className={`
            w-5 h-5 p-[2px]
            rounded-full border flex items-center justify-center
            shadow-sm transition-all duration-200
            ${
              card.done
                ? "bg-green-500 text-white border-green-600 shadow-md scale-110"
                : "bg-white border-gray-400 hover:border-gray-500"
            }
          `}
        >
          {card.done && <FaCheck className="text-xs" />}
        </button>

        {/* Title */}
        <span
          className={`
            flex-1 text-sm 
            transition 
            ${
              card.done
                ? "text-gray-400 line-through"
                : "text-gray-900 dark:text-gray-100"
            }
          `}
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
            className="
              p-1.5 rounded-lg
              text-gray-500 hover:text-gray-700 
              hover:bg-gray-200/50 
              dark:hover:bg-gray-700/50 
              transition-all duration-200
            "
          >
            <FaEllipsisV size={13} />
          </button>
        )}
      </div>

      {/* Time */}
      {(hasStart || hasEnd) && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300">
          <FaCalendarAlt className="opacity-70" />
          {hasStart && <span>{formatTime(card.start)}</span>}
          {hasStart && hasEnd && <span className="mx-1">→</span>}
          {hasEnd && <span>{formatTime(card.end)}</span>}
        </div>
      )}

      {/* Priority */}
      {card.priority && (
        <div
          className={`
            mt-2 inline-block text-[11px] px-2 py-[2px] rounded-md 
            font-medium shadow-sm
            ${
              card.priority === "high"
                ? "bg-red-500/90 text-white"
                : card.priority === "medium"
                ? "bg-yellow-400/90 text-gray-900"
                : "bg-green-500/90 text-white"
            }
          `}
        >
          Ưu tiên:{" "}
          {card.priority === "high"
            ? "Cao"
            : card.priority === "medium"
            ? "Trung bình"
            : "Thấp"}
        </div>
      )}

      {/* --- DROPDOWN MENU --- */}
      {activeMenu === card.id &&
        createPortal(
          <div
            ref={menuRef}
            className="
              fixed z-[9999]
              w-40 rounded-xl
              bg-white/95 dark:bg-gray-800/95
              border border-gray-200 dark:border-gray-700
              shadow-xl shadow-gray-300/40 dark:shadow-black/40
              backdrop-blur-md
              animate-dropdownSlide
            "
            style={{
              top: menuPos.top,
              left: menuPos.left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateCard(card, listId);
                setActiveMenu(null);
              }}
              className="
                flex w-full items-center gap-2 
                px-3 py-2.5 text-sm
                text-gray-700 dark:text-gray-200
                hover:bg-gray-100/70 dark:hover:bg-gray-700/50
                rounded-t-xl transition-all
              "
            >
              <FaCopy className="text-gray-500" /> Tạo bản sao
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteCard({ listId, cardId: card.id, card });
                setActiveMenu(null);
              }}
              className="
                flex w-full items-center gap-2 
                px-3 py-2.5 text-sm
                text-red-600 hover:bg-red-50/70 dark:hover:bg-red-900/30
                rounded-b-xl transition-all
              "
            >
              <FaTimes className="text-red-500" /> Xóa
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
