import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

export default function PlanDateInputs({ startDate, endDate, setStartDate, setEndDate }) {
  return (
    <div className="flex flex-wrap gap-4 mt-4">

      {/* TỪ */}
      <div className="
        flex items-center gap-3
        bg-white/90 dark:bg-gray-800/80
        border border-gray-300 dark:border-gray-700
        rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md
        transition cursor-pointer w-[240px]
      ">
        <div className="
          w-8 h-8 flex items-center justify-center
          rounded-lg bg-blue-100 text-blue-600
          dark:bg-blue-900/30 dark:text-blue-300
        ">
          <FaCalendarAlt size={14} />
        </div>

        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          dateFormat="dd/MM/yyyy"
          placeholderText="Chọn ngày..."
          locale="vi"
          className="
            bg-transparent outline-none flex-1 text-sm text-gray-700 dark:text-gray-200
          "
          calendarClassName="
            rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 
            overflow-hidden bg-white dark:bg-gray-800 animate-fadeIn
          "
          dayClassName={(date) =>
            `w-9 h-9 flex items-center justify-center rounded-lg text-sm transition
             ${date.getTime() === startDate?.getTime()
              ? "bg-blue-500 text-white"
              : "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300"
             }`
          }
          weekDayClassName={() =>
            "text-xs text-gray-500 dark:text-gray-400"
          }
          popperClassName="z-[9999]"
          popperPlacement="bottom-start"
          portalId="portal-root"
          renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
            <div className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-t-xl border-b dark:border-gray-700">
              <button
                onClick={decreaseMonth}
                className="px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                ←
              </button>
              <span className="font-medium text-gray-800 dark:text-gray-200 text-sm capitalize">
                {date.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={increaseMonth}
                className="px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                →
              </button>
            </div>
          )}
        />
      </div>

      {/* ĐẾN */}
      <div className="
        flex items-center gap-3
        bg-white/90 dark:bg-gray-800/80
        border border-gray-300 dark:border-gray-700
        rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md
        transition cursor-pointer w-[240px]
      ">
        <div className="
          w-8 h-8 flex items-center justify-center
          rounded-lg bg-blue-100 text-blue-600
          dark:bg-blue-900/30 dark:text-blue-300
        ">
          <FaCalendarAlt size={14} />
        </div>

        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          minDate={startDate}
          dateFormat="dd/MM/yyyy"
          placeholderText="Chọn ngày..."
          locale="vi"
          className="
            bg-transparent outline-none flex-1 text-sm text-gray-700 dark:text-gray-200
          "
          calendarClassName="
            rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 
            overflow-hidden bg-white dark:bg-gray-800 animate-fadeIn
          "
          dayClassName={(date) =>
            `w-9 h-9 flex items-center justify-center rounded-lg text-sm transition
             ${date.getTime() === endDate?.getTime()
              ? "bg-blue-500 text-white"
              : "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300"
             }`
          }
          weekDayClassName={() =>
            "text-xs text-gray-500 dark:text-gray-400"
          }
          popperClassName="z-[9999]"
          popperPlacement="bottom-start"
          portalId="portal-root"
          renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
            <div className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-t-xl border-b dark:border-gray-700">
              <button
                onClick={decreaseMonth}
                className="px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                ←
              </button>
              <span className="font-medium text-gray-800 dark:text-gray-200 text-sm capitalize">
                {date.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={increaseMonth}
                className="px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                →
              </button>
            </div>
          )}
        />
      </div>

    </div>
  );
}
