// src/features/planBoard/utils/timeUtils.js

/**
 * Chuẩn hóa thời gian về "HH:mm"
 * Hỗ trợ:
 * - null / undefined / "" → null
 * - Array [h, m] hoặc [h, m, s, ...] → "HH:mm"
 * - "h:m", "h:m:s" → "HH:mm"
 * - "h,m" → coi là giờ,phút → "HH:mm"
 * - "0.5" / "0,5" hoặc 0.5 (number) → decimal hours → "HH:mm"
 */
export function normalizeTime(raw) {
  if (raw == null) return null;

  // Array từ WebSocket: [hour, minute] hoặc [hour, minute, second, ...]
  if (Array.isArray(raw)) {
    if (raw.length >= 2) {
      const [h, m] = raw;
      if (typeof h === "number" && typeof m === "number") {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        return `${hh}:${mm}`;
      }
    }
    // fallback: join
    return String(raw.join(":"));
  }

  const s = String(raw).trim();
  if (!s) return null;

  // "h:m" hoặc "h:m:s" → lấy 2 phần đầu
  const colonMatch = s.match(/^(\d{1,2}):(\d{1,2})(?::\d+)?$/);
  if (colonMatch) {
    const hh = colonMatch[1].padStart(2, "0");
    const mm = colonMatch[2].padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // "h,m" → hiểu là giờ,phút (case nhập sai)
  const commaHMMatch = s.match(/^(\d{1,2}),(\d{1,2})$/);
  if (commaHMMatch) {
    const hh = commaHMMatch[1].padStart(2, "0");
    const mm = commaHMMatch[2].padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // Nếu KHÔNG có ":" và có "." hoặc "," → decimal hours
  if (!s.includes(":") && (s.includes(".") || s.includes(","))) {
    const hours = Number(s.replace(",", "."));
    if (!Number.isNaN(hours) && Number.isFinite(hours)) {
      const totalMinutes = Math.round(hours * 60);
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const mm = String(totalMinutes % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }

  // Nếu là number → decimal hours
  if (typeof raw === "number") {
    const hours = raw;
    if (!Number.isNaN(hours) && Number.isFinite(hours)) {
      const totalMinutes = Math.round(hours * 60);
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const mm = String(totalMinutes % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }

  // Fallback: trả về string gốc (đã trim)
  return s;
}

/**
 * Chuẩn hóa ngày về "YYYY-MM-DD"
 * Hỗ trợ:
 * - null / undefined / "" → null
 * - Array [year, month, day] (WS, Jackson) → "YYYY-MM-DD"
 * - "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss" → cắt tới 10 ký tự
 */
export function normalizeDate(raw) {
  if (raw == null) return null;

  // Array [year, month, day]
  if (Array.isArray(raw)) {
    if (raw.length >= 3) {
      const [y, m, d] = raw;
      if (
        typeof y === "number" &&
        typeof m === "number" &&
        typeof d === "number"
      ) {
        const mm = String(m).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd}`;
      }
    }
    return null;
  }

  const s = String(raw).trim();
  if (!s) return null;

  // "YYYY-MM-DD" hoặc "YYYY-MM-DDTHH:mm:ss"
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // Fallback: trả về string gốc
  return s;
}

/**
 * Chuẩn hóa 1 card (thời gian start/end)
 */
export function normalizeCardTimes(card) {
  if (!card) return card;
  return {
    ...card,
    startTime: normalizeTime(card.startTime),
    endTime: normalizeTime(card.endTime),
  };
}

/**
 * Chuẩn hóa toàn bộ BoardResponse từ server (API hoặc WebSocket)
 * - Thống nhất date: startDate, endDate, dayDate, costSummary.byDay.date → "YYYY-MM-DD"
 * - Thống nhất time: card.startTime, card.endTime → "HH:mm"
 */
export function normalizeBoardPayload(rawBoard) {
  if (!rawBoard) return rawBoard;

  return {
    ...rawBoard,
    startDate: normalizeDate(rawBoard.startDate),
    endDate: normalizeDate(rawBoard.endDate),

    lists: (rawBoard.lists || []).map((list) => ({
      ...list,
      dayDate: normalizeDate(list.dayDate),
      cards: (list.cards || []).map((card) => normalizeCardTimes(card)),
    })),

    costSummary: rawBoard.costSummary
      ? {
          ...rawBoard.costSummary,
          byDay: (rawBoard.costSummary.byDay || []).map((item) => ({
            ...item,
            date: normalizeDate(item.date),
          })),
        }
      : rawBoard.costSummary,
  };
}

/**
 * Helper cho UI: trả về "" thay vì null
 */
export function formatTimeForDisplay(raw) {
  const normalized = normalizeTime(raw);
  return normalized ?? "";
}
