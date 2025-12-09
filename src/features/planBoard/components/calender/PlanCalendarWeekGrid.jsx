// src/features/planBoard/components/PlanCalendarWeekGrid.jsx
"use client";

import { FaClock, FaPlus } from "react-icons/fa";
import { HOURS, toDateOnly } from "../../utils/calendarUtils";

export default function PlanCalendarWeekGrid({
  weekDays,
  selectedDate,
  planStart,
  planEnd,
  dayListMap,
  canEdit,
  eventsByDate,
  getEventStyle,
  onDoubleClickSlot,
  onClickCreateSlot,
  onOpenEvent,
}) {
  const inRangeDay = (raw) =>
    planStart &&
    planEnd &&
    toDateOnly(raw) >= toDateOnly(planStart) &&
    toDateOnly(raw) <= toDateOnly(planEnd);

  return (
    <div className="flex flex-1 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      {/* cột giờ bên trái */}
      <div className="w-12 border-r border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="h-11 border-b border-slate-200 dark:border-slate-800" />
        {HOURS.map((h) => (
          <div
            key={h}
            className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-start justify-end pr-1 pt-0.5"
          >
            {h}:00
          </div>
        ))}
      </div>

      {/* 7 cột ngày */}
      <div className="flex-1 grid grid-cols-7">
        {weekDays.map((day) => {
          const dayEvents = eventsByDate[day.dateStr] || [];
          const isSelectedCol =
            selectedDate &&
            toDateOnly(day.raw).getTime() ===
              toDateOnly(selectedDate).getTime();
          const inRange = inRangeDay(day.raw);
          const canCreateInDay = inRange && !!dayListMap[day.dateStr];

          return (
            <div
              key={day.dateStr}
              className={`relative border-l border-slate-300 dark:border-slate-700 ${
                inRange
                  ? "bg-rose-50/40 dark:bg-rose-950/10"
                  : "bg-white dark:bg-slate-900/40"
              }`}
            >
              {/* header ngày */}
              <div
                className={`sticky top-0 z-10 backdrop-blur px-2 py-1.5 text-center text-[11px] border-b border-slate-300/80 dark:border-slate-700/80 h-11 flex flex-col justify-center ${
                  isSelectedCol
                    ? "bg-rose-500 text-white"
                    : "bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100"
                }`}
              >
                <div className="font-semibold">{day.weekday}</div>
                <div
                  className={`text-xs ${
                    isSelectedCol
                      ? "text-rose-50/90"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {day.label}
                </div>
              </div>

              {/* grid giờ + events */}
              <div className="absolute inset-x-0 top-11 bottom-0">
                {/* grid giờ */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="h-10 border-b border-dashed border-slate-200 dark:border-slate-700 relative group"
                    onDoubleClick={() =>
                      canEdit &&
                      canCreateInDay &&
                      onDoubleClickSlot(day.dateStr, h)
                    }
                  >
                    {canEdit && canCreateInDay && (
                      <button
                        type="button"
                        className="hidden group-hover:flex absolute right-1 top-1 text-[9px] items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickCreateSlot(day.dateStr, h);
                        }}
                      >
                        <FaPlus size={8} />
                        <span>Tạo</span>
                      </button>
                    )}
                  </div>
                ))}

                {/* events */}
                {dayEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => onOpenEvent(ev)}
                    className="absolute text-[10px] overflow-hidden hover:opacity-95 transition-transform active:scale-[0.98]"
                    style={getEventStyle(ev)}
                  >
                    <div className="px-1.5 py-0.5 text-left">
                      <div className="font-semibold truncate">{ev.title}</div>
                      <div className="flex items-center gap-1 opacity-90">
                        <FaClock className="inline-block" size={9} />
                        <span>
                          {ev.start.toTimeString().slice(0, 5)} -{" "}
                          {ev.end.toTimeString().slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
