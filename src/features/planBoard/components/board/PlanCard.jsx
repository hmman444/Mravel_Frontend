import { useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FaCalendarAlt,
  FaCheck,
  FaEllipsisV,
  FaCopy,
  FaTimes,
} from "react-icons/fa";
import { TYPE_STYLES } from "../../utils/activityStyles";
import { formatTimeForDisplay } from "../../utils/timeUtils";
export default function PlanCard({
  card,
  listId,
  toggleDone,
  duplicateCard,
  activeMenu,
  setActiveMenu,
  setConfirmDeleteCard,
  canEdit = true,
  onOpenActivityModal,
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


  const hasStart = !!card.startTime;
  const hasEnd = !!card.endTime;

  const typeStyle =
    card.activityType && TYPE_STYLES[card.activityType]
      ? TYPE_STYLES[card.activityType]
      : TYPE_STYLES.OTHER;

  const displayIcon = card.activityTypeIcon || typeStyle.icon;
  const displayLabel = card.activityTypeLabel || typeStyle.label;

  const activityData = useMemo(() => {
    if (!card.activityDataJson) return null;
    try {
      return JSON.parse(card.activityDataJson);
    } catch {
      return null;
    }
  }, [card.activityDataJson]);

  const subtitle = useMemo(() => {
    if (!activityData) return null;

    switch (card.activityType) {
      case "TRANSPORT": {
        const from = activityData.fromPlace || activityData.from || "";
        const to = activityData.toPlace || activityData.to || "";
        if (from && to) return `${from} → ${to}`;
        return from || to || null;
      }
      case "FOOD":
        return activityData.restaurantName || activityData.placeName || null;
      case "STAY":
        return (
          activityData.stayName ||
          activityData.hotelName ||
          activityData.placeName ||
          null
        );
      case "ENTERTAIN":
      case "SIGHTSEEING":
      case "SHOPPING":
        return activityData.placeName || activityData.storeName || null;
      case "CINEMA":
        return (
          activityData.cinemaName ||
          activityData.placeName ||
          null
        );
      case "EVENT":
        return activityData.placeName || activityData.venue || null;
      case "OTHER":
        return activityData.location || null;
      default:
        return activityData.placeName || activityData.location || null;
    }
  }, [activityData, card.activityType]);

  // ƯU TIÊN TUYỆT ĐỐI chi phí thực tế
  const actual =
    card.cost?.actualCost != null && card.cost.actualCost > 0
      ? card.cost.actualCost
      : null;

  // Chỉ dùng chi phí ước tính nếu CHƯA có actual
  const estimated =
    actual == null &&
    card.cost?.estimatedCost != null &&
    card.cost.estimatedCost > 0
      ? card.cost.estimatedCost
      : null;

  // Ngân sách giữ nguyên
  const budget =
    card.cost?.budgetAmount != null && card.cost.budgetAmount > 0
      ? card.cost.budgetAmount
      : null;

  const showCost = actual != null || estimated != null;

  const participantCount =
    card.participantCount ??
    (card.cost ? card.cost.participantCount ?? null : null);
  const showParticipants =
    participantCount != null && Number(participantCount) > 0;

  const hasCustomTitle = card.text && card.text.trim().length > 0;

  const displayTitle = hasCustomTitle
    ? card.text
    : (() => {
        if (subtitle) return `${displayLabel} · ${subtitle}`;
        return displayLabel;
      })();

  const showSubtitle = hasCustomTitle && subtitle;

  const handleCardClick = () => {
    onOpenActivityModal?.(listId, card, { readOnly: !canEdit });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative
        p-2 rounded-xl mb-1.5
        border ${typeStyle.border} dark:border-gray-700/60
        shadow-[0_1px_3px_rgba(0,0,0,0.05)]
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
        hover:-translate-y-[1px]
        transition-all duration-200 
        cursor-pointer
        ${typeStyle.bg} dark:bg-gray-800/90
      `}
    >
      <div
        className={`
          absolute inset-y-1.5 left-0 w-[3px] rounded-full 
          ${typeStyle.accent} opacity-80
          bg-current
        `}
      />

      <div className="pl-1.5 pr-0.5 mb-0.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="
              w-6 h-6 rounded-full flex items-center justify-center text-sm
              bg-white/80 dark:bg-gray-900/80 shadow-sm flex-shrink-0
            "
          >
            <span className="leading-none">{displayIcon}</span>
          </div>

          <span
            className={`
              text-[11px] font-medium truncate
              ${typeStyle.pillText}
            `}
          >
            {displayLabel}
          </span>
        </div>

        {showCost && (
          <div className="flex flex-col items-end leading-tight text-right">
            {actual != null ? (
              <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                {actual.toLocaleString("vi-VN")}đ
              </span>
            ) : (
              estimated != null && (
                <>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Ước tính
                  </span>
                  <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-50">
                    {estimated.toLocaleString("vi-VN")}đ
                  </span>
                </>
              )
            )}

            {budget != null && (
              <span className="mt-[1px] text-[10px] text-slate-400 dark:text-slate-500">
                Ngân sách {budget.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pl-1.5 flex items-start gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canEdit) toggleDone(listId, card.id);
          }}
          className={`
            mt-0.5
            w-5 h-5
            rounded-full border flex items-center justify-center
            transition-all duration-200 flex-shrink-0
            ${
              card.done
                ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_4px_10px_rgba(16,185,129,0.45)] scale-105"
                : "bg-white/95 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
            }
          `}
        >
          {card.done ? (
            <FaCheck className="text-[12px]" />
          ) : (
            <span className="w-2 h-2 rounded-full" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div
            className={`
              text-[13px] font-medium truncate
              ${
                card.done
                  ? "text-gray-400 line-through"
                  : "text-gray-900 dark:text-gray-100"
              }
              transition-colors
            `}
          >
            {displayTitle}
          </div>

          {showSubtitle && (
            <div className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-300 truncate">
              {subtitle}
            </div>
          )}

          {(hasStart || hasEnd || showParticipants) && (
            <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-300 flex flex-wrap items-center gap-x-2 gap-y-1">
              {(hasStart || hasEnd) && (
                <div className="flex items-center gap-1 min-w-0">
                  <FaCalendarAlt className="opacity-70 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {hasStart && formatTimeForDisplay(card.startTime)}
                    {hasEnd && ` - ${formatTimeForDisplay(card.endTime)}`}
                  </span>
                </div>
              )}

              {showParticipants && (
                <span className="px-1.5 py-[1px] rounded-lg bg-gray-900/5 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/80 text-[10px] whitespace-nowrap">
                  👥 {participantCount} người
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
              ml-1 p-1 rounded-lg
              text-gray-500 hover:text-gray-700 
              hover:bg-gray-200/50 
              dark:hover:bg-gray-700/50 
              transition-all duration-200 flex-shrink-0
            "
          >
            <FaEllipsisV size={12} />
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
                duplicateCard(listId, card.id);
                setActiveMenu(null);
              }}
              className="
                flex w-full items-center gap-2 
                px-3 py-2 text-sm
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
                px-3 py-2 text-sm
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
