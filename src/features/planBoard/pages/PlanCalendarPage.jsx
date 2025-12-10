  // src/features/planBoard/pages/PlanCalendarPage.jsx

  "use client";

  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import PlanLayout from "../components/PlanLayout";
  import {
    FaChevronLeft,
    FaChevronRight,
    FaUserCircle,
    FaCalendarAlt,
  } from "react-icons/fa";
  
  export default function PlanCalendarPage() {
    const navigate = useNavigate();

    const plans = [
      {
        id: 1,
        name: "Đà Lạt 3N2Đ",
        start: "2025-03-10",
        end: "2025-03-12",
        members: 3,
      },
      {
        id: 2,
        name: "Hà Nội cuối tuần",
        start: "2025-03-21",
        end: "2025-03-22",
        members: 2,
      },
    ];

    /* ----------------------------- CALENDAR LOGIC ----------------------------- */
    const today = new Date();

    const [currentMonth, setCurrentMonth] = useState(
      today.getMonth()
    );
    const [currentYear, setCurrentYear] = useState(
      today.getFullYear()
    );

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0-6

    // Danh sách ngày trong tháng (42 ô: 7x6)
    const calendarDays = Array.from({ length: 42 }, (_, i) => {
      const dayNumber = i - firstDayOfWeek + 1;
      const valid = dayNumber > 0 && dayNumber <= daysInMonth;

      const dateObj = valid
        ? new Date(currentYear, currentMonth, dayNumber)
        : null;

      return {
        dayNumber: valid ? dayNumber : null,
        date: dateObj,
      };
    });

    /* ----------------------------- PLAN EVENTS ----------------------------- */
    function getPlansForDate(date) {
      if (!date) return [];

      return plans.filter((p) => {
        const s = new Date(p.start);
        const e = new Date(p.end);

        return (
          date.getTime() >= s.getTime() &&
          date.getTime() <= e.getTime()
        );
      });
    }

    /* ----------------------------- MONTH CONTROL ----------------------------- */
    const changeMonth = (dir) => {
      let newMonth = currentMonth + dir;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    };

    return (
      <PlanLayout
        activePlanId={null}
        plans={plans}
        onOpenPlanList={() => navigate("/plans/my-plans")}
        onOpenCalendar={() => navigate("/plans/calendar")}
        onOpenPlanDashboard={(plan) => navigate(`/plans/${plan.id}/dashboard`)}
      >
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FaCalendarAlt /> Lịch tổng quan kế hoạch
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="
                p-2 rounded-xl bg-gray-100 dark:bg-gray-800
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-all shadow-sm
              "
            >
              <FaChevronLeft />
            </button>

            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentMonth + 1}/{currentYear}
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="
                p-2 rounded-xl bg-gray-100 dark:bg-gray-800
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-all shadow-sm
              "
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* DAY LABELS */}
        <div className="grid grid-cols-7 text-center font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, i) => {
            const events = getPlansForDate(cell.date);

            return (
              <div
                key={i}
                className={`
                  min-h-[110px] rounded-xl p-2 flex flex-col
                  bg-white/60 dark:bg-gray-800/60 backdrop-blur
                  border border-gray-200/60 dark:border-gray-700/60
                  shadow-sm transition-all
                  ${cell.dayNumber ? "hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-700/80" : "opacity-40"}
                `}
              >
                {/* DAY NUMBER */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {cell.dayNumber || ""}
                </div>

                {/* EVENTS */}
                <div className="space-y-1">
                  {events.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/plans/${p.id}/dashboard`)}
                      className="
                        text-xs px-2 py-1 rounded-lg cursor-pointer
                        bg-gradient-to-r from-blue-500/80 to-indigo-500/80
                        text-white shadow-sm
                        hover:shadow-md hover:scale-[1.02]
                        transition-all duration-200 truncate
                      "
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PlanLayout>
    );
  }
