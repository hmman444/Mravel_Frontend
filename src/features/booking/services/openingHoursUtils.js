// src/features/booking/services/openingHoursUtils.js

/* DayOfWeek -> 1..7 */
const DAY_INDEX = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

const VN_DAYS = {
  1: "Thứ hai",
  2: "Thứ ba",
  3: "Thứ tư",
  4: "Thứ năm",
  5: "Thứ sáu",
  6: "Thứ bảy",
  7: "Chủ nhật",
};

const z = (n) => String(n).padStart(2, "0");
const hhmm = (h, m) => `${z(h)}:${z(m)}`;

const parseHHMM = (s) => {
  if (typeof s !== "string") return null;
  // hỗ trợ "11:00", "11:00:00", "11:00:00.000"
  const m = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.\d{1,9})?)?$/);
  if (!m) return null;
  return { h: +m[1], m: +m[2] };
};

const pickNum = (obj, keys) => {
  for (const k of keys) if (obj?.[k] != null) return Number(obj[k]);
  return null;
};

const pickPathNum = (obj, paths) => {
  for (const p of paths) {
    const v = p
      .split(".")
      .reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
    if (v != null) return Number(v);
  }
  return null;
};

const getDayIdx = (raw) => {
  if (raw == null) return null;

  // number: hỗ trợ 1..7 hoặc 0..6 (JS)
  if (typeof raw === "number") {
    if (raw >= 1 && raw <= 7) return raw;
    if (raw >= 0 && raw <= 6) return raw === 0 ? 7 : raw;
  }

  // string: "MONDAY" / "Mon" / "mon"
  if (typeof raw === "string") {
    const up = raw.toUpperCase();
    if (DAY_INDEX[up]) return DAY_INDEX[up];
    const map3 = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 7 };
    const short = up.slice(0, 3);
    if (map3[short]) return map3[short];
  }

  // object: {name:"MONDAY"}...
  if (typeof raw === "object") return getDayIdx(raw.name ?? raw.value);

  return null;
};

/** Lấy range -> { text, start (phút), end (phút) } */
function getRange(oh = {}) {
  if (oh.closed === true) return null;

  // open24h
  if (oh.open24h === true || oh.open24Hours === true) {
    return { text: "00:00 - 24:00", start: 0, end: 24 * 60 };
  }

  // 1) số rời
  const h1 = pickNum(oh, ["openHour", "startHour", "fromHour"]);
  const m1 = pickNum(oh, ["openMinute", "startMinute", "fromMinute"]);
  const h2 = pickNum(oh, ["closeHour", "endHour", "toHour"]);
  const m2 = pickNum(oh, ["closeMinute", "endMinute", "toMinute"]);

  // 2) nested open.hour / close.hour
  const nh1 = pickPathNum(oh, ["open.hour", "start.hour", "from.hour"]);
  const nm1 = pickPathNum(oh, ["open.minute", "start.minute", "from.minute"]);
  const nh2 = pickPathNum(oh, ["close.hour", "end.hour", "to.hour"]);
  const nm2 = pickPathNum(oh, ["close.minute", "end.minute", "to.minute"]);

  // 3) string time
  const p1 = parseHHMM(oh?.openTime ?? oh?.startTime ?? oh?.fromTime);
  const p2 = parseHHMM(oh?.closeTime ?? oh?.endTime ?? oh?.toTime);

  const sh = h1 ?? nh1 ?? p1?.h;
  const sm = m1 ?? nm1 ?? p1?.m;
  const eh = h2 ?? nh2 ?? p2?.h;
  const em = m2 ?? nm2 ?? p2?.m;

  if ([sh, sm, eh, em].some((v) => v == null)) return null;

  const start = sh * 60 + sm;
  let end = eh * 60 + em;

  // nếu đóng qua đêm (ví dụ 18:00 - 02:00)
  if (end <= start) end += 24 * 60;

  return {
    text: `${hhmm(sh, sm)} - ${hhmm(eh, em)}`,
    start,
    end,
  };
}

function buildByDay(openingHours = []) {
  const byDay = new Map(); // dayIdx -> [{text,start,end}]
  for (const oh of openingHours || []) {
    const dayIdx = getDayIdx(oh?.dayOfWeek ?? oh?.day ?? oh?.dow ?? oh?.weekday);
    if (!dayIdx || dayIdx < 1 || dayIdx > 7) continue;

    const rng = getRange(oh);
    if (!rng) continue;

    if (!byDay.has(dayIdx)) byDay.set(dayIdx, []);
    byDay.get(dayIdx).push(rng);
  }

  // sort theo start
  for (const arr of byDay.values()) arr.sort((a, b) => a.start - b.start);

  return byDay;
}

function dayIdxFromDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const js = d.getDay(); // 0..6
  return js === 0 ? 7 : js; // 1..7
}

function isSameDate(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Build list time slot "HH:mm" dựa trên openingHours của NGÀY đó.
 * stepMinutes mặc định 30.
 */
export function buildTimeOptionsFromOpeningHours(openingHours, date, stepMinutes = 30) {
  const d = date instanceof Date ? date : new Date(date);
  const dayIdx = dayIdxFromDate(d);

  const byDay = buildByDay(openingHours);
  const ranges = byDay.get(dayIdx) ?? [];
  if (!ranges.length) return [];

  const slots = [];
  const step = Math.max(5, Number(stepMinutes || 30));

  for (const r of ranges) {
    // tạo slot từ start đến < end
    for (let t = r.start; t < r.end; t += step) {
      const mins = t % (24 * 60); // nếu qua 24h vẫn wrap về HH:mm
      const hh = Math.floor(mins / 60);
      const mm = mins % 60;
      slots.push(hhmm(hh, mm));
    }
  }

  // unique + sort
  return Array.from(new Set(slots)).sort();
}

/**
 * Label nhỏ dưới "Thời gian đến" (vd: "Hôm nay: 11:00 - 22:00")
 */
export function getOpeningLabelForDate(openingHours, date) {
  const d = date instanceof Date ? date : new Date(date);
  const dayIdx = dayIdxFromDate(d);

  const byDay = buildByDay(openingHours);
  const ranges = byDay.get(dayIdx) ?? [];

  const today = new Date();
  const prefix = isSameDate(d, today) ? "Hôm nay" : VN_DAYS[dayIdx] || "Ngày chọn";

  if (!ranges.length) return `${prefix}: Đóng cửa`;
  return `${prefix}: ${ranges.map((r) => r.text).join(", ")}`;
}