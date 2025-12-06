import React, { useMemo } from "react";

/* DayOfWeek -> 1..7 */
const DAY_INDEX = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
  FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
};
const VN_DAYS = {
  1: "Thứ hai", 2: "Thứ ba", 3: "Thứ tư", 4: "Thứ năm",
  5: "Thứ sáu", 6: "Thứ bảy", 7: "Chủ nhật",
};

/* ========= helpers ========= */
const z = (n) => String(n).padStart(2, "0");
const hhmm = (h, m) => `${z(h)}:${z(m)}`;
const parseHHMM = (s) => {
  if (typeof s !== "string") return null;
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
    const v = p.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
    if (v != null) return Number(v);
  }
  return null;
};
const getDayIdx = (raw) => {
  if (raw == null) return null;
  if (typeof raw === "number") {
    if (raw >= 1 && raw <= 7) return raw;
    if (raw >= 0 && raw <= 6) return raw === 0 ? 7 : raw;
  }
  if (typeof raw === "string") {
    const up = raw.toUpperCase();
    if (DAY_INDEX[up]) return DAY_INDEX[up];
    const map3 = { MON:1, TUE:2, WED:3, THU:4, FRI:5, SAT:6, SUN:7 };
    const short = up.slice(0,3);
    if (map3[short]) return map3[short];
  }
  if (typeof raw === "object") return getDayIdx(raw.name ?? raw.value);
  return null;
};

/** Lấy range -> { text: "11:00 - 22:00", start: phút, end: phút } */
function getRange(oh = {}) {
  if (oh.closed === true) return null;
  if (oh.open24h === true) {
    return { text: "00:00 - 24:00", start: 0, end: 24 * 60 };
  }
  // 1) số rời
  const h1 = pickNum(oh, ["openHour", "startHour", "fromHour"]);
  const m1 = pickNum(oh, ["openMinute", "startMinute", "fromMinute"]);
  const h2 = pickNum(oh, ["closeHour", "endHour", "toHour"]);
  const m2 = pickNum(oh, ["closeMinute", "endMinute", "toMinute"]);

  // 2) nested
  const nh1 = pickPathNum(oh, ["open.hour", "start.hour", "from.hour"]);
  const nm1 = pickPathNum(oh, ["open.minute", "start.minute", "from.minute"]);
  const nh2 = pickPathNum(oh, ["close.hour", "end.hour", "to.hour"]);
  const nm2 = pickPathNum(oh, ["close.minute", "end.minute", "to.minute"]);

  // 3) chuỗi
  const p1 = parseHHMM(oh?.openTime ?? oh?.startTime ?? oh?.fromTime);
  const p2 = parseHHMM(oh?.closeTime ?? oh?.endTime ?? oh?.toTime);

  const sh = h1 ?? nh1 ?? p1?.h;
  const sm = m1 ?? nm1 ?? p1?.m;
  const eh = h2 ?? nh2 ?? p2?.h;
  const em = m2 ?? nm2 ?? p2?.m;

  if ([sh, sm, eh, em].some(v => v == null)) return null;
  return {
    text: `${hhmm(sh, sm)} - ${hhmm(eh, em)}`,
    start: sh * 60 + sm,
    end: eh * 60 + em,
  };
}

/** Chuẩn hoá ra map theo ngày + rows hiển thị */
function buildByDay(openingHours = []) {
  const byDay = new Map(); // dayIdx -> [{text,start,end}]
  for (const oh of openingHours) {
    const dayIdx = getDayIdx(oh?.dayOfWeek ?? oh?.day ?? oh?.dow ?? oh?.weekday);
    if (!dayIdx || dayIdx < 1 || dayIdx > 7) continue;
    const rng = getRange(oh);
    if (!rng) continue;
    if (!byDay.has(dayIdx)) byDay.set(dayIdx, []);
    byDay.get(dayIdx).push(rng);
  }
  // sort theo start
  for (const arr of byDay.values()) arr.sort((a,b)=>a.start-b.start);
  return byDay;
}

function makeRows(byDay) {
  const rows = [];
  for (let i = 1; i <= 7; i++) {
    const ranges = byDay.get(i);
    rows.push({
      dayIdx: i,
      label: VN_DAYS[i],
      text: ranges?.length ? ranges.map(r => r.text).join(", ") : "Đóng cửa",
      isClosed: !ranges?.length,
    });
  }
  return rows;
}

/** Tính trạng thái hiện tại dựa trên todayRanges */
function computeStatus(todayRanges, allByDay, today) {
  if (!todayRanges || todayRanges.length === 0) {
    return { label: "Hiện tại đang đóng cửa", tone: "bg-gray-100 text-gray-700" };
  }
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const current = todayRanges.find(r => r.start <= nowMin && nowMin < r.end);
  if (current) {
    return {
      label: `Đang mở • Đến ${current.text.split(" - ")[1]}`,
      tone: "bg-green-100 text-green-700",
    };
  }

  const next = todayRanges.find(r => r.start > nowMin);
  if (next) {
    return {
      label: `Đã đóng • Mở lại ${next.text.split(" - ")[0]}`,
      tone: "bg-amber-100 text-amber-700",
    };
  }

  // không còn ca hôm nay -> tìm ca sớm nhất của các ngày tới
  for (let step = 1; step <= 7; step++) {
    const d = ((today - 1 + step) % 7) + 1;
    const arr = allByDay.get(d);
    if (arr?.length) {
      return {
        label: `Đã đóng • Mở lại ${VN_DAYS[d]} ${arr[0].text.split(" - ")[0]}`,
        tone: "bg-amber-100 text-amber-700",
      };
    }
  }
  return { label: "Tạm ngưng phục vụ", tone: "bg-gray-100 text-gray-700" };
}

export default function RestaurantOpeningHoursSection({ restaurant }) {
  const hours = restaurant?.openingHours;

  const js = new Date().getDay();            // 0..6
  const today = js === 0 ? 7 : js;           // 1..7

  const { rows, status } = useMemo(() => {
    const byDay = buildByDay(hours);
    const rows = makeRows(byDay);
    const todayRanges = byDay.get(today) ?? [];
    const status = computeStatus(todayRanges, byDay, today);
    return { rows, status };
  }, [hours, today]);

  if (!Array.isArray(hours) || !hours.length) return null;
  return (
    <section className="px-4 md:px-5 pt-4 pb-5">
      {/* Title + status badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Giờ hoạt động</h2>
        <span className={`text-xs md:text-sm px-2.5 py-1 rounded-full font-semibold ${status.tone}`}>
          {status.label}
        </span>
      </div>

      {/* Card nhỏ gọn */}
      <div className="mt-3 rounded-xl bg-white shadow-sm p-4 md:p-5 text-gray-900">
        <div className="divide-y divide-gray-100">
          {rows.map((r) => {
            const isToday = r.dayIdx === today;
            return (
              <div
                key={r.dayIdx}
                className="py-2 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 items-center"
              >
                <div className={`text-[15px] font-semibold ${isToday ? "text-red-600" : "text-gray-900"}`}>
                  {r.label}
                </div>
                <div className={`col-span-1 sm:col-span-2 text-[15px] font-semibold ${isToday ? "text-red-600" : "text-gray-900"}`}>
                  {r.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}