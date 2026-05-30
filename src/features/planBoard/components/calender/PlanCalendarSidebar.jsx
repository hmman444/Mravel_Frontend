// src/features/planBoard/components/PlanCalendarSidebar.jsx
"use client";

import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toDateOnly } from "../../utils/calendarUtils";

export default function PlanCalendarSidebar({
  visibleMonth,
  monthDays,
  selectedDate,
  planStart,
  planEnd,
  weekLabel,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) {
  const { t } = useTranslation();
  return (
    <div className="w-64 flex-shrink-0 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-3 flex flex-col gap-3">
      {/* header mini calendar */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
            <FaCalendarAlt size={12} />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              {t("plan.calendar.month_title")}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.calendar.pick_week_or_day")}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FaChevronLeft size={10} />
          </button>
          <span className="px-1">
            {String(visibleMonth.month + 1).padStart(2, "0")}/
            {visibleMonth.year}
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* mini calendar grid */}
      <div className="rounded-xl bg-slate-50/80 dark:bg-slate-950/40 px-2 py-2">
        <div className="grid grid-cols-7 text-[10px] text-center mb-1 text-slate-500 dark:text-slate-400">
          {[
            t("plan.calendar.weekday_mon"),
            t("plan.calendar.weekday_tue"),
            t("plan.calendar.weekday_wed"),
            t("plan.calendar.weekday_thu"),
            t("plan.calendar.weekday_fri"),
            t("plan.calendar.weekday_sat"),
            t("plan.calendar.weekday_sun"),
          ].map((w) => (
            <div key={w} className="py-0.5">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[2px] text-[10px]">
          {monthDays.map((d, idx) => {
            const isCurrentMonth =
              d.getMonth() === visibleMonth.month &&
              d.getFullYear() === visibleMonth.year;
            const isToday =
              toDateOnly(d).getTime() === toDateOnly(new Date()).getTime();
            const isSelected =
              selectedDate &&
              toDateOnly(d).getTime() === toDateOnly(selectedDate).getTime();

            const inRange =
              planStart &&
              planEnd &&
              toDateOnly(d) >= toDateOnly(planStart) &&
              toDateOnly(d) <= toDateOnly(planEnd);

            let base =
              "h-7 flex items-center justify-center rounded-full cursor-pointer transition-all";
            let bg = "";
            let text = "";
            let ring = "";

            if (inRange) {
              bg = "bg-rose-50 dark:bg-rose-950/30";
              text = "text-rose-600 dark:text-rose-300";
            } else if (!isCurrentMonth) {
              text = "text-slate-400/70 dark:text-slate-500/70 opacity-70";
            } else {
              text = "text-slate-700 dark:text-slate-200";
            }

            if (isSelected) {
              bg = "bg-rose-500 text-white dark:bg-rose-500 dark:text-white";
              ring =
                "ring-2 ring-rose-300/70 dark:ring-rose-500/70 shadow-sm";
            } else if (isToday && !isSelected) {
              ring =
                "ring-1 ring-sky-400/70 dark:ring-sky-500/70 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectDate(d)}
                className={`${base} ${bg} ${text} ${ring}`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* legend */}
      <div className="mt-1 space-y-2">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {weekLabel}
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>🚕 {t("plan.legend.transport")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span>🥘 {t("plan.legend.food")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>🛏️ {t("plan.legend.stay")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>🏛️ {t("plan.legend.sightseeing")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>🎡 {t("plan.legend.entertainment")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-700">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span>🛍️ {t("plan.legend.shopping")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>🎬 {t("plan.legend.cinema")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>🎫 {t("plan.legend.event")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>✏️ {t("plan.legend.other")}</span>
          </span>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500">
          {t("plan.calendar.hint")}
        </div>
      </div>
    </div>
  );
}
