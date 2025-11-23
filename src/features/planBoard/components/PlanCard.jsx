import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaCalendarAlt,
  FaCheck,
  FaEllipsisV,
  FaCopy,
  FaTimes,
} from "react-icons/fa";

const TYPE_STYLES = {
  TRANSPORT: {
    bg: "bg-sky-50",
    border: "border-sky-100",
    accent: "text-sky-600",
    pillBg: "bg-sky-100",
    pillText: "text-sky-800",
    icon: "🚕",
    label: "Di chuyển",
  },
  FOOD: {
    bg: "bg-orange-50",
    border: "border-orange-100",
    accent: "text-orange-600",
    pillBg: "bg-orange-100",
    pillText: "text-orange-800",
    icon: "🥘",
    label: "Ăn uống",
  },
  STAY: {
    bg: "bg-violet-50",
    border: "border-violet-100",
    accent: "text-violet-600",
    pillBg: "bg-violet-100",
    pillText: "text-violet-800",
    icon: "🛏️",
    label: "Nghỉ ngơi",
  },
  ENTERTAIN: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    accent: "text-emerald-600",
    pillBg: "bg-emerald-100",
    pillText: "text-emerald-800",
    icon: "🎡",
    label: "Vui chơi",
  },
  SIGHTSEEING: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    accent: "text-amber-600",
    pillBg: "bg-amber-100",
    pillText: "text-amber-800",
    icon: "🏛️",
    label: "Tham quan",
  },
  SHOPPING: {
    bg: "bg-pink-50",
    border: "border-pink-100",
    accent: "text-pink-600",
    pillBg: "bg-pink-100",
    pillText: "text-pink-800",
    icon: "🛍️",
    label: "Mua sắm",
  },
  CINEMA: {
    bg: "bg-rose-50",
    border: "border-rose-100",
    accent: "text-rose-600",
    pillBg: "bg-rose-100",
    pillText: "text-rose-800",
    icon: "🎬",
    label: "Xem phim",
  },
  EVENT: {
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    accent: "text-indigo-600",
    pillBg: "bg-indigo-100",
    pillText: "text-indigo-800",
    icon: "🎤",
    label: "Sự kiện",
  },
  OTHER: {
    bg: "bg-slate-50",
    border: "border-slate-100",
    accent: "text-slate-600",
    pillBg: "bg-slate-100",
    pillText: "text-slate-800",
    icon: "📝",
    label: "Hoạt động",
  },
};

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
  onOpenActivityModal
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

  const hasStart = !!card.startTime;
  const hasEnd = !!card.endTime;

  const typeStyle =
    card.activityType && TYPE_STYLES[card.activityType]
      ? TYPE_STYLES[card.activityType]
      : TYPE_STYLES.OTHER;

  const displayIcon = card.activityTypeIcon || typeStyle.icon;
  const displayLabel = card.activityTypeLabel || typeStyle.label;

  const showCost = card.estimatedCost != null || card.actualCost != null;
  const estimated = card.estimatedCost ?? null;
  const actual = card.actualCost ?? null;

  const hasDescription = card.description && card.description.trim().length > 0;

  return (
    <div
      onClick={() => {
        if (canEdit && onOpenActivityModal) {
          onOpenActivityModal(listId, card);
        }
      }}
      className={`
        group relative
        p-3 rounded-xl mb-2 
        border ${typeStyle.border} dark:border-gray-700/60
        shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]
        hover:-translate-y-[1px]
        transition-all duration-200 
        cursor-pointer
        animate-fadeIn
        ${typeStyle.bg} dark:bg-gray-800/90
      `}
    >
      {/* Accent line bên trái */}
      <div
        className={`
          absolute inset-y-2 left-0 w-[3px] rounded-full 
          ${typeStyle.accent} opacity-70
          bg-current
        `}
      />

      {/* Activity pill + cost */}
      <div className="pl-1.5 pr-0.5 mb-1.5 flex items-center justify-between gap-2">
        <div
          className={`
            inline-flex items-center gap-1.5 px-2 py-[2px] rounded-full border text-[10px] font-medium
            ${typeStyle.pillBg} ${typeStyle.pillText} border-white/60 shadow-sm
          `}
        >
          <span>{displayIcon}</span>
          <span className="truncate max-w-[120px]">{displayLabel}</span>
        </div>

        {showCost && (
          <div className="flex flex-col items-end gap-[2px]">
            {estimated != null && (
              <span className="text-[11px] font-semibold text-gray-700/80 dark:text-gray-100">
                💰 {estimated.toLocaleString("vi-VN")}đ
              </span>
            )}
            {actual != null && actual !== estimated && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Thực tế:{" "}
                <span className="font-semibold">
                  {actual.toLocaleString("vi-VN")}đ
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main row: checkbox + title + menu */}
      <div className="pl-1.5 flex items-start gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canEdit) toggleDone(listId, card.id);
          }}
          className={`
            mt-[2px]
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
          {card.done && <FaCheck className="text-[11px]" />}
        </button>

        <div className="flex-1 min-w-0">
          <div
            className={`
              text-sm font-medium 
              ${card.done ? "text-gray-400 line-through" : "text-gray-900 dark:text-gray-100"}
              transition-colors
            `}
          >
            {card.text}
          </div>

          {hasDescription && (
            <div
              className={`
                mt-0.5 text-[11px] text-gray-600 dark:text-gray-300 
                line-clamp-2 group-hover:text-gray-800 dark:group-hover:text-gray-100
              `}
            >
              {card.description}
            </div>
          )}

          {(hasStart || hasEnd) && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-300">
              <FaCalendarAlt className="opacity-70" />
              {hasStart && (
                <span className="px-1.5 py-[1px] rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-700/80">
                  {formatTime(card.startTime)}
                </span>
              )}
              {hasStart && hasEnd && <span className="mx-0.5">→</span>}
              {hasEnd && (
                <span className="px-1.5 py-[1px] rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-700/80">
                  {formatTime(card.endTime)}
                </span>
              )}
            </div>
          )}
        </div>

        {canEdit && (
          <button
            ref={btnRef}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === card.id ? null : card.id);
            }}
            className="
              ml-1 p-1.5 rounded-lg
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
