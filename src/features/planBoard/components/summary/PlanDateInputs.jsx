import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { showError } from "../../../../utils/toastUtils";

export default function PlanDateInputs({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  const handleStartChange = (date) => {
    if (endDate && date > endDate) {
      showError("Ngày bắt đầu không thể sau ngày kết thúc!");
      return;
    }
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    if (startDate && date < startDate) {
      showError("Ngày kết thúc không thể trước ngày bắt đầu!");
      return;
    }
    setEndDate(date);
  };

  return (
    <div className="flex gap-4 flex-wrap md:flex-nowrap">
      {/* TỪ NGÀY */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-1">
          Từ ngày
        </label>

        <div
          className="
            flex items-center gap-2
            bg-white/90 dark:bg-gray-800/80
            border border-gray-300 dark:border-gray-700
            rounded-xl px-3 py-2 shadow-sm
            transition cursor-pointer
            w-52
          "
        >
          <div
            className="
              px-1 py-1 flex items-center justify-center
              rounded-lg bg-blue-100 text-blue-600
              dark:bg-blue-900/30 dark:text-blue-300
            "
          >
            <FaCalendarAlt size={13} />
          </div>

          <DatePicker
            selected={startDate}
            onChange={handleStartChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày..."
            locale="vi"
            className="
              bg-transparent outline-none flex-1 text-sm
              text-gray-700 dark:text-gray-200
            "
            calendarClassName="
              rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 
              overflow-hidden bg-white dark:bg-gray-800 animate-fadeIn
            "
            dayClassName={(date) =>
              `w-9 h-8 flex items-center justify-center rounded-lg text-sm transition
               ${
                 date.getTime() === startDate?.getTime()
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
          />
        </div>
      </div>

      {/* ĐẾN NGÀY */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-1">
          Đến ngày
        </label>

        <div
          className="
            flex items-center gap-2
            bg-white/90 dark:bg-gray-800/80
            border border-gray-300 dark:border-gray-700
            rounded-xl px-3 py-2 shadow-sm
            transition cursor-pointer
            w-52
          "
        >
          <div
            className="
              px-1 py-1 flex items-center justify-center
              rounded-lg bg-blue-100 text-blue-600
              dark:bg-blue-900/30 dark:text-blue-300
            "
          >
            <FaCalendarAlt size={13} />
          </div>

          <DatePicker
            selected={endDate}
            onChange={handleEndChange}
            minDate={startDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày..."
            locale="vi"
            className="
              bg-transparent outline-none flex-1 text-sm
              text-gray-700 dark:text-gray-200
            "
            calendarClassName="
              rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 
              overflow-hidden bg-white dark:bg-gray-800 animate-fadeIn
            "
            dayClassName={(date) =>
              `w-9 h-8 flex items-center justify-center rounded-lg text-sm transition
               ${
                 date.getTime() === endDate?.getTime()
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
          />
        </div>
      </div>
    </div>
  );
}
