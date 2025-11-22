// src/components/MravelDatePicker.jsx
import { useMemo } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/hotel-datepicker.css";
import { addMonths } from "date-fns";

registerLocale("vi", vi);

export default function MravelDatePicker({ selected, onChange, ...rest }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <DatePicker
      {...rest}
      selected={selected}
      onChange={onChange}
      locale="vi"
      dateFormat="dd/MM/yyyy"
      minDate={today}
      monthsShown={2}
      calendarClassName="mravel-calendar"
      popperClassName="mravel-calendar-popper"
      popperPlacement="bottom"      // 1. Luôn mở bên dưới input
      popperModifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 0],             // lệch xuống 10px, không lệch ngang
          },
        },
      ]}
      openToDate={selected || today}
      focusSelectedMonth
      dayClassName={(date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);

        const isSunday = d.getDay() === 0;
        const isBeforeToday = d < today;

        let cls = "mravel-calendar__day";
        if (isSunday) cls += " mravel-calendar__day--sunday";
        if (isBeforeToday) cls += " mravel-calendar__day--before-today";
        return cls;
      }}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
        customHeaderCount,
      }) => {
        const shownDate = addMonths(date, customHeaderCount);
        // date ở mỗi cột tháng đã là đúng tháng tương ứng
        const month = shownDate.getMonth() + 1;
        const year = shownDate.getFullYear();

        const isFirst = customHeaderCount === 0; // cột trái
        const isLast = customHeaderCount === 1;  // cột phải (vì monthsShown = 2)

        return (
          <div className="mravel-calendar__header-row">
            {isFirst && (
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="mravel-calendar__nav-btn"
              >
                ‹
              </button>
            )}

            <span className="mravel-calendar__header-title">
              Tháng {month} {year}
            </span>

            {isLast && (
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="mravel-calendar__nav-btn"
              >
                ›
              </button>
            )}
          </div>
        );
      }}
    />
  );
}