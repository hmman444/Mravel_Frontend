// src/features/planBoard/utils/calendarUtils.js

// parse "00:00:00" hoặc "00:00" → { hh, mm }
function parseTimeString(timeStr) {
  if (!timeStr) return { hh: 0, mm: 0 };

  const trimmed = String(timeStr).trim(); // "00:00:00" | "00:00"
  const parts = trimmed.split(":").map((p) => Number(p) || 0);

  const hh = parts[0] || 0;
  const mm = parts[1] || 0;

  return { hh, mm };
}

// để gán màu / tag theo activityType
export const ACTIVITY_COLORS = {
  TRANSPORT: "#0ea5e9",   // sky-500
  FOOD: "#f97316",        // orange-500
  STAY: "#6366f1",        // indigo-500
  ENTERTAIN: "#06b6d4",   // cyan-500
  SIGHTSEEING: "#22c55e", // green-500
  SHOPPING: "#eab308",    // yellow-500
  EVENT: "#ec4899",       // pink-500
  CINEMA: "#a855f7",      // purple-500
  OTHER: "#64748b",       // slate-500
};

export function buildCalendarEventsFromBoard(board) {
  if (!board?.lists) return [];

  const events = [];

  for (const list of board.lists) {
    // chỉ lấy list type = DAY và có dayDate
    if (list.type !== "DAY" || !list.dayDate) continue;

    const dayDate = list.dayDate; // "2025-12-12"

    (list.cards || []).forEach((card) => {
      if (!card.startTime && !card.endTime) return;

      const { hh: sh, mm: sm } = parseTimeString(card.startTime);
      const { hh: eh, mm: em } = parseTimeString(card.endTime);

      const start = new Date(`${dayDate}T00:00:00`);
      start.setHours(sh, sm, 0, 0);

      const end = new Date(`${dayDate}T00:00:00`);
      end.setHours(eh, em, 0, 0);

      const color =
        ACTIVITY_COLORS[card.activityType] || ACTIVITY_COLORS.OTHER;

      events.push({
        id: card.id,
        card,
        list,
        listId: list.id,
        activityType: card.activityType,
        title: card.text || "(Không có tiêu đề)",
        description: card.description || "",
        date: dayDate,
        start,
        end,
        color,
      });
    });
  }

  return events;
}

// calendarLayoutUtils.js
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

// date chỉ có ngày
export function toDateOnly(d) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

export function formatDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// anchorDate = ngày đầu tiên của khung 7 ngày
export function getWeekDays(anchorDate) {
  if (!anchorDate) return [];
  const base = new Date(anchorDate);
  base.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dateStr = formatDateStr(d);
    return {
      dateStr,
      label: `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`,
      weekday: d.toLocaleDateString("vi-VN", { weekday: "short" }),
      raw: d,
    };
  });
}

// Map dateStr -> listId (DAY list)
export function buildDayListMap(board) {
  const map = {};
  (board?.lists || []).forEach((l) => {
    if (l.type === "DAY" && l.dayDate) {
      map[l.dayDate] = l.id;
    }
  });
  return map;
}

// Build ma trận 6x7 ngày cho mini calendar (Th2-CN)
export function buildMonthMatrix(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const weekday = firstOfMonth.getDay();
  const mondayIndex = (weekday + 6) % 7;

  const start = new Date(year, month, 1 - mondayIndex);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

// Màu pastel cho block calendar - đồng bộ với activityStyles.js
export function getEventPalette(type) {
  switch (type) {
    case "TRANSPORT":
      return {
        bg: "#e0f2fe", // sky-100
        border: "#38bdf8", // sky-400
        text: "#0369a1", // sky-700
      };
    case "FOOD":
      return {
        bg: "#ffedd5", // orange-100
        border: "#fb923c", // orange-400
        text: "#c2410c", // orange-700
      };
    case "STAY":
      return {
        bg: "#ede9fe", // violet-100
        border: "#a78bfa", // violet-400
        text: "#6d28d9", // violet-700
      };
    case "ENTERTAIN":
      return {
        bg: "#d1fae5", // emerald-100
        border: "#34d399", // emerald-400
        text: "#047857", // emerald-700
      };
    case "SIGHTSEEING":
      return {
        bg: "#fef3c7", // amber-100
        border: "#fbbf24", // amber-400
        text: "#92400e", // amber-700
      };
    case "SHOPPING":
      return {
        bg: "#fce7f3", // pink-100
        border: "#f472b6", // pink-400
        text: "#be185d", // pink-700
      };
    case "CINEMA":
      return {
        bg: "#ffe4e6", // rose-100
        border: "#fb7185", // rose-400
        text: "#be123c", // rose-700
      };
    case "EVENT":
      return {
        bg: "#e0e7ff", // indigo-100
        border: "#818cf8", // indigo-400
        text: "#3730a3", // indigo-700
      };
    case "OTHER":
    default:
      return {
        bg: "#e2e8f0", // slate-200
        border: "#94a3b8", // slate-400
        text: "#0f172a", // slate-900
      };
  }
}

// Tính lane cho các event trong một ngày (để event trùng giờ không che nhau)
export function assignLanesForDay(events) {
  if (!events || !events.length) return [];

  const sorted = [...events].sort((a, b) => {
    const diff = a.start - b.start;
    if (diff !== 0) return diff;
    return String(a.id).localeCompare(String(b.id));
  });

  const laneEnds = [];
  sorted.forEach((ev) => {
    let lane = 0;
    while (lane < laneEnds.length && ev.start < laneEnds[lane]) {
      lane++;
    }
    laneEnds[lane] = ev.end;
    ev._lane = lane;
  });

  const totalLanes = Math.max(1, laneEnds.length);

  const isOverlap = (a, b) => a.start < b.end && b.start < a.end;

  sorted.forEach((ev, i) => {
    let hasOverlap = false;
    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;
      if (isOverlap(ev, sorted[j])) {
        hasOverlap = true;
        break;
      }
    }

    if (hasOverlap) {
      ev._lanes = totalLanes;
    } else {
      ev._lane = 0;
      ev._lanes = 1;
    }
  });

  return sorted;
}
