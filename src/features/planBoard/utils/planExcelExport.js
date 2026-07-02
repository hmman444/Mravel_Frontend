// planExcelExport.js
// Xuất lịch trình (board) ra file Excel .xlsx đầy đủ field + màu sắc, KHÔNG dùng thư viện ngoài.
// Kỹ thuật: tự sinh các phần XML theo chuẩn OOXML (SpreadsheetML) rồi đóng gói thành .xlsx
// bằng một bộ ghi ZIP tối giản (store, không nén) viết tay — nên không cần cài thêm dependency.
import i18n from "../../../i18n";
import { formatTimeForDisplay } from "./timeUtils";

// Chọn chuỗi theo ngôn ngữ hiện tại (vi mặc định).
const isVi = () => !i18n.language || String(i18n.language).toLowerCase().startsWith("vi");
const L = (vi, en) => (isVi() ? vi : en);

// Escape ký tự đặc biệt của XML (giữ nguyên ký tự xuống dòng \n — hợp lệ trong <t>).
function escXml(v) {
  if (v == null) return "";
  const s = String(v);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    // bo ky tu dieu khien khong hop le trong XML (giu tab=9, LF=10, CR=13)
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) continue;
    const ch = s[i];
    if (ch === "&") out += "&amp;";
    else if (ch === "<") out += "&lt;";
    else if (ch === ">") out += "&gt;";
    else if (ch === String.fromCharCode(34)) out += "&quot;";
    else out += ch;
  }
  return out;
}

// Chuyển màu #RRGGBB -> ARGB "FFRRGGBB" cho OOXML.
const argb = (hex) => "FF" + String(hex).replace("#", "").toUpperCase();

// Định dạng số tiền theo vi-VN, kèm đơn vị nếu có.
function fmtMoney(n, currency) {
  if (n == null || n === "" || Number.isNaN(Number(n))) return "";
  const s = Number(n).toLocaleString("vi-VN");
  return currency ? `${s} ${currency}` : `${s} đ`;
}

// Màu nền + chữ theo loại hoạt động (không dùng icon).
const TYPE_HEX = {
  TRANSPORT:   { bg: "#e0f2fe", fg: "#075985" },
  FOOD:        { bg: "#ffedd5", fg: "#9a3412" },
  STAY:        { bg: "#ede9fe", fg: "#5b21b6" },
  ENTERTAIN:   { bg: "#d1fae5", fg: "#065f46" },
  SIGHTSEEING: { bg: "#fef3c7", fg: "#92400e" },
  SHOPPING:    { bg: "#fce7f3", fg: "#9d174d" },
  CINEMA:      { bg: "#ffe4e6", fg: "#9f1239" },
  EVENT:       { bg: "#e0e7ff", fg: "#3730a3" },
  OTHER:       { bg: "#f1f5f9", fg: "#334155" },
};

// Nhãn cho các field đặc thù nằm trong activityDataJson.
const FIELD_LABELS = {
  cinemaName:     ["Rạp chiếu phim", "Cinema"],
  movieName:      ["Phim", "Movie"],
  format:         ["Định dạng", "Format"],
  seats:          ["Ghế", "Seats"],
  ticketPrice:    ["Giá vé", "Ticket price"],
  comboPrice:     ["Giá combo", "Combo price"],
  address:        ["Địa chỉ", "Address"],
  placeName:      ["Địa điểm", "Place"],
  ticketCount:    ["Số vé", "Ticket count"],
  eventName:      ["Tên sự kiện", "Event name"],
  venue:          ["Nơi tổ chức", "Venue"],
  restaurantName: ["Nhà hàng", "Restaurant"],
  pricePerPerson: ["Giá mỗi người", "Price / person"],
  peopleCount:    ["Số người", "People"],
  locationText:   ["Vị trí", "Location"],
  customFields:   ["Thông tin thêm", "Extra info"],
  storeName:      ["Cửa hàng", "Store"],
  items:          ["Danh sách", "Items"],
  nights:         ["Số đêm", "Nights"],
  pricePerNight:  ["Giá mỗi đêm", "Price / night"],
  hotelName:      ["Khách sạn / Nơi ở", "Accommodation"],
  fromPlace:      ["Điểm đi", "From"],
  toPlace:        ["Điểm đến", "To"],
  stops:          ["Điểm dừng", "Stops"],
  method:         ["Phương tiện", "Method"],
};

const fieldLabel = (key) => {
  const pair = FIELD_LABELS[key];
  if (pair) return L(pair[0], pair[1]);
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
};

function safeParse(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Chuyển 1 value bất kỳ trong activityData thành chuỗi người đọc được.
function formatValue(val) {
  if (val == null || val === "") return "";
  if (Array.isArray(val)) {
    return val
      .map((it) => {
        if (it == null) return "";
        if (typeof it === "object") {
          if ("key" in it || "value" in it) {
            const k = (it.key || "").toString().trim();
            const v = (it.value || "").toString().trim();
            return k && v ? `${k}: ${v}` : k || v;
          }
          return it.name || it.label || it.title || "";
        }
        return String(it);
      })
      .filter(Boolean)
      .join(", ");
  }
  if (typeof val === "object") {
    return val.fullAddress || val.address || val.name || "";
  }
  if (typeof val === "number") return val.toLocaleString("vi-VN");
  return String(val);
}

// Gom toàn bộ field đặc thù của hoạt động thành các dòng "Nhãn: Giá trị".
function buildDetailLines(activityData) {
  if (!activityData || typeof activityData !== "object") return [];
  const lines = [];
  for (const [key, raw] of Object.entries(activityData)) {
    if (key.endsWith("Location")) continue; // đối tượng vị trí thô — đã có Địa chỉ
    const text = formatValue(raw);
    if (!text) continue;
    lines.push(`${fieldLabel(key)}: ${text}`);
  }
  return lines;
}

// Tiêu đề phụ (địa điểm chính) suy ra từ activityData theo loại.
function deriveSubtitle(type, d) {
  if (!d) return "";
  switch (type) {
    case "TRANSPORT": {
      const from = d.fromPlace || "";
      const to = d.toPlace || "";
      return from && to ? `${from} → ${to}` : from || to || "";
    }
    case "FOOD": return d.restaurantName || d.placeName || "";
    case "STAY": return d.hotelName || d.stayName || d.placeName || "";
    case "CINEMA": return d.cinemaName || d.placeName || "";
    case "EVENT": return d.eventName || d.venue || d.placeName || "";
    case "SHOPPING": return d.storeName || d.placeName || "";
    case "OTHER": return d.locationText || d.location || "";
    default: return d.placeName || "";
  }
}

// Tên hoạt động hiển thị (ưu tiên tiêu đề người dùng nhập).
function activityName(card, typeLabel, subtitle) {
  const custom = (card.text || "").trim();
  if (custom) return custom;
  return subtitle ? `${typeLabel} · ${subtitle}` : typeLabel;
}

// Chi phí đại diện: ưu tiên thực tế, sau đó ước tính.
function costFields(card) {
  const c = card.cost || {};
  const currency = c.currencyCode || "";
  const num = (v) => (v != null && Number(v) > 0 ? Number(v) : null);
  return {
    estimated: fmtMoney(num(c.estimatedCost), currency),
    actual: fmtMoney(num(c.actualCost), currency),
    budget: fmtMoney(num(c.budgetAmount), currency),
    currency,
  };
}

// Ước lượng số dòng một đoạn text chiếm khi tự xuống dòng trong ô rộng ~cpl ký tự.
// Cần để đặt chiều cao hàng đủ lớn — cột "Ngày" gộp ô nên Excel không tự co giãn được.
function estimateLines(text, charsPerLine) {
  if (!text) return 0;
  return String(text)
    .split("\n")
    .reduce((sum, seg) => sum + Math.max(1, Math.ceil(seg.length / charsPerLine)), 0);
}

// Cột: [key, nhãn, bề rộng px]. Cột 1 = Ngày (gộp), cột 2 = Hoạt động, còn lại = thông tin.
function columns() {
  return [
    { label: L("Ngày", "Day"), px: 150 },
    { label: L("Hoạt động", "Activity"), px: 240 },
    { label: L("Loại", "Type"), px: 110 },
    { label: L("Bắt đầu", "Start"), px: 70 },
    { label: L("Kết thúc", "End"), px: 70 },
    { label: L("Trạng thái", "Status"), px: 95 },
    { label: L("Số người", "People"), px: 70 },
    { label: L("Ước tính", "Estimated"), px: 110 },
    { label: L("Thực tế", "Actual"), px: 110 },
    { label: L("Ngân sách", "Budget"), px: 110 },
    { label: L("Mô tả", "Description"), px: 230 },
    { label: L("Chi tiết hoạt động", "Details"), px: 330 },
  ];
}

// ───────────────────────── Style registry (styles.xml) ─────────────────────────
function createStyles() {
  const fonts = [];
  const fills = [
    '<fill><patternFill patternType="none"/></fill>',
    '<fill><patternFill patternType="gray125"/></fill>',
  ];
  const borders = [
    "<border><left/><right/><top/><bottom/><diagonal/></border>",
    '<border><left style="thin"><color rgb="FFCBD5E1"/></left>' +
      '<right style="thin"><color rgb="FFCBD5E1"/></right>' +
      '<top style="thin"><color rgb="FFCBD5E1"/></top>' +
      '<bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>',
  ];
  const xfs = [];
  const fontMap = new Map();
  const fillMap = new Map();
  const xfMap = new Map();

  function addFont({ b = false, color = "FF000000", sz = 12, name = "Times New Roman" } = {}) {
    const key = `${b}|${color}|${sz}|${name}`;
    if (fontMap.has(key)) return fontMap.get(key);
    const xml = `<font>${b ? "<b/>" : ""}<sz val="${sz}"/><color rgb="${color}"/><name val="${name}"/></font>`;
    fonts.push(xml);
    const idx = fonts.length - 1;
    fontMap.set(key, idx);
    return idx;
  }

  function addFill(rgb) {
    if (!rgb) return 0;
    if (fillMap.has(rgb)) return fillMap.get(rgb);
    const xml = `<fill><patternFill patternType="solid"><fgColor rgb="${rgb}"/><bgColor indexed="64"/></patternFill></fill>`;
    fills.push(xml);
    const idx = fills.length - 1;
    fillMap.set(rgb, idx);
    return idx;
  }

  function addXf({ fontId = 0, fillId = 0, borderId = 0, h = "general", v = "top", wrap = true } = {}) {
    const key = `${fontId}|${fillId}|${borderId}|${h}|${v}|${wrap}`;
    if (xfMap.has(key)) return xfMap.get(key);
    const align = `<alignment horizontal="${h}" vertical="${v}"${wrap ? ' wrapText="1"' : ""}/>`;
    const xml =
      `<xf numFmtId="0" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0" ` +
      `applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${align}</xf>`;
    xfs.push(xml);
    const idx = xfs.length - 1;
    xfMap.set(key, idx);
    return idx;
  }

  addFont(); // font 0 mặc định
  addXf({ h: "general", v: "top", wrap: false }); // xf 0 mặc định

  function build() {
    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      `<fonts count="${fonts.length}">${fonts.join("")}</fonts>` +
      `<fills count="${fills.length}">${fills.join("")}</fills>` +
      `<borders count="${borders.length}">${borders.join("")}</borders>` +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      `<cellXfs count="${xfs.length}">${xfs.join("")}</cellXfs>` +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      "</styleSheet>"
    );
  }

  return { addFont, addFill, addXf, build, THIN: 1 };
}

// Số cột (1-based) -> chữ cái cột (A, B, ... AA).
function colLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Ô inline-string; giữ style ngay cả khi rỗng để không mất viền/màu.
function cell(ref, s, value) {
  if (value == null || value === "") return `<c r="${ref}" s="${s}"/>`;
  return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${escXml(value)}</t></is></c>`;
}

// ───────────────────────── Sinh worksheet + styles ─────────────────────────
function buildSheetAndStyles(board) {
  const cols = columns();
  const nCols = cols.length;
  const lastCol = colLetter(nCols);
  const dayLists = (board?.lists || []).filter((l) => l.type !== "TRASH");

  const st = createStyles();
  const B = st.THIN;

  // Fonts — Times New Roman; tiêu đề 13–14 (lớn nhất 14), nội dung 12, nhỏ nhất 11.
  const fTitle = st.addFont({ b: true, color: "FF1E3A8A", sz: 14 });
  const fMeta = st.addFont({ color: "FF64748B", sz: 11 });
  const fHeader = st.addFont({ b: true, color: "FFFFFFFF", sz: 13 });
  const fDay = st.addFont({ b: true, color: "FF1E3A8A", sz: 12 });
  const fName = st.addFont({ b: true, color: "FF0F172A" });
  const fGray = st.addFont({ color: "FF64748B" });
  const fDone = st.addFont({ b: true, color: "FF059669" });
  const fPending = st.addFont({ b: true, color: "FF64748B" });
  const fActual = st.addFont({ b: true, color: "FF059669" });
  const fEst = st.addFont({ color: "FF334155" });
  const fBudget = st.addFont({ color: "FF94A3B8" });
  const fDesc = st.addFont({ color: "FF475569" });
  const fPlain = st.addFont();

  // XFs
  const xTitle = st.addXf({ fontId: fTitle, h: "left", v: "center", wrap: false });
  const xMeta = st.addXf({ fontId: fMeta, h: "left", v: "center", wrap: false });
  const xHeader = st.addXf({ fontId: fHeader, fillId: st.addFill(argb("#1E3A8A")), borderId: B, h: "center", v: "center", wrap: true });
  const xDay = [argb("#DBEAFE"), argb("#EFF6FF")].map((bg) =>
    st.addXf({ fontId: fDay, fillId: st.addFill(bg), borderId: B, h: "center", v: "top", wrap: true })
  );
  const xName = st.addXf({ fontId: fName, borderId: B, h: "left", v: "top", wrap: true });
  const xTime = st.addXf({ fontId: fPlain, borderId: B, h: "center", v: "top", wrap: false });
  const xDone = st.addXf({ fontId: fDone, borderId: B, h: "center", v: "top", wrap: false });
  const xPending = st.addXf({ fontId: fPending, borderId: B, h: "center", v: "top", wrap: false });
  const xNum = st.addXf({ fontId: fPlain, borderId: B, h: "center", v: "top", wrap: false });
  const xEst = st.addXf({ fontId: fEst, borderId: B, h: "right", v: "top", wrap: false });
  const xActual = st.addXf({ fontId: fActual, borderId: B, h: "right", v: "top", wrap: false });
  const xBudget = st.addXf({ fontId: fBudget, borderId: B, h: "right", v: "top", wrap: false });
  const xDesc = st.addXf({ fontId: fDesc, borderId: B, h: "left", v: "top", wrap: true });
  const xEmpty = st.addXf({ fontId: fGray, borderId: B, h: "left", v: "top", wrap: true });
  const typeXf = {};
  for (const [type, c] of Object.entries(TYPE_HEX)) {
    const ft = st.addFont({ b: true, color: argb(c.fg) });
    typeXf[type] = st.addXf({ fontId: ft, fillId: st.addFill(argb(c.bg)), borderId: B, h: "center", v: "top", wrap: true });
  }

  // Header/meta text
  const title = board?.planTitle || L("Lịch trình", "Itinerary");
  const range =
    board?.startDate && board?.endDate
      ? `${board.startDate} → ${board.endDate}`
      : board?.startDate || board?.endDate || "";
  const metaBits = [];
  if (range) metaBits.push(`${L("Thời gian", "Dates")}: ${range}`);
  metaBits.push(`${L("Xuất lúc", "Exported")}: ${new Date().toLocaleString("vi-VN")}`);
  const metaText = metaBits.join("   •   ");

  const rows = [];
  const merges = [];
  let r = 1;

  // Hàng tiêu đề
  rows.push(`<row r="${r}" ht="26" customHeight="1">${cell(`A${r}`, xTitle, title)}</row>`);
  merges.push(`A${r}:${lastCol}${r}`);
  r++;

  // Hàng meta
  rows.push(`<row r="${r}" ht="16" customHeight="1">${cell(`A${r}`, xMeta, metaText)}</row>`);
  merges.push(`A${r}:${lastCol}${r}`);
  r++;

  // Hàng tiêu đề cột
  const headerRow = cols.map((c, i) => cell(`${colLetter(i + 1)}${r}`, xHeader, c.label)).join("");
  rows.push(`<row r="${r}" ht="24" customHeight="1">${headerRow}</row>`);
  r++;

  // Dữ liệu theo ngày
  dayLists.forEach((list, dayIdx) => {
    const cards = list.cards || [];
    const dayLabel = list.title?.trim() ? list.title.trim() : L(`Ngày ${dayIdx + 1}`, `Day ${dayIdx + 1}`);
    const dayText = list.dayDate ? `${dayLabel}\n${list.dayDate}` : dayLabel;
    const dayStyle = xDay[dayIdx % xDay.length];

    if (cards.length === 0) {
      const cells =
        cell(`A${r}`, dayStyle, dayText) +
        cell(`B${r}`, xEmpty, L("(Chưa có hoạt động)", "(No activities)")) +
        // Các ô còn lại rỗng nhưng giữ style trống có viền
        Array.from({ length: nCols - 2 }, (_, i) => cell(`${colLetter(i + 3)}${r}`, xEmpty, "")).join("");
      rows.push(`<row r="${r}" ht="22" customHeight="1">${cells}</row>`);
      merges.push(`B${r}:${lastCol}${r}`);
      r++;
      return;
    }

    const startRow = r;
    cards.forEach((card, cardIdx) => {
      const type = card.activityType || "OTHER";
      const typeLabel = i18n.t(`enum.activityType.${type}`);
      const data = safeParse(card.activityDataJson);
      const subtitle = deriveSubtitle(type, data);
      const name = activityName(card, typeLabel, subtitle);
      const nameCell = subtitle && card.text ? `${name}\n${subtitle}` : name;
      const cost = costFields(card);
      const participants = card.participantCount ?? card.cost?.participantCount ?? "";
      const done = !!card.done;
      const status = done ? L("Hoàn thành", "Done") : L("Chưa xong", "Pending");
      const detailLines = buildDetailLines(data);
      const detailText = detailLines.join("\n");
      const descText = card.description || "";

      // Chiều cao hàng theo số dòng nhiều nhất (points; ~16pt/dòng cho cỡ chữ 12).
      const nameLines = estimateLines(name, 31) + (subtitle && card.text ? 1 : 0);
      const descLines = estimateLines(descText, 31);
      const detailWrapped = detailLines.reduce((s, l) => s + Math.max(1, Math.ceil(l.length / 44)), 0);
      const rowLines = Math.max(nameLines, descLines, detailWrapped, 1);
      const ht = rowLines * 16 + 8;

      let cells = "";
      // Cột Ngày: chỉ ô đầu của ngày (còn lại nằm trong vùng merge).
      if (cardIdx === 0) cells += cell(`A${r}`, dayStyle, dayText);
      cells += cell(`B${r}`, xName, nameCell);
      cells += cell(`C${r}`, typeXf[type] || typeXf.OTHER, typeLabel);
      cells += cell(`D${r}`, xTime, formatTimeForDisplay(card.startTime));
      cells += cell(`E${r}`, xTime, formatTimeForDisplay(card.endTime));
      cells += cell(`F${r}`, done ? xDone : xPending, status);
      cells += cell(`G${r}`, xNum, participants === "" ? "" : String(participants));
      cells += cell(`H${r}`, xEst, cost.estimated);
      cells += cell(`I${r}`, xActual, cost.actual);
      cells += cell(`J${r}`, xBudget, cost.budget);
      cells += cell(`K${r}`, xDesc, descText);
      cells += cell(`L${r}`, xDesc, detailText);

      rows.push(`<row r="${r}" ht="${ht}" customHeight="1">${cells}</row>`);
      r++;
    });

    if (cards.length > 1) merges.push(`A${startRow}:A${r - 1}`);
  });

  const lastRow = r - 1;

  // <cols> — bề rộng theo ký tự (~px/7).
  const colsXml =
    "<cols>" +
    cols
      .map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${Math.max(6, Math.round(c.px / 7))}" customWidth="1"/>`)
      .join("") +
    "</cols>";

  const mergeXml = merges.length
    ? `<mergeCells count="${merges.length}">${merges.map((m) => `<mergeCell ref="${m}"/>`).join("")}</mergeCells>`
    : "";

  const sheet =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    `<dimension ref="A1:${lastCol}${Math.max(1, lastRow)}"/>` +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="16"/>' +
    colsXml +
    `<sheetData>${rows.join("")}</sheetData>` +
    mergeXml +
    "</worksheet>";

  return { sheet, styles: st.build() };
}

// ───────────────────────── ZIP writer (store, không nén) ─────────────────────────
function crc32(bytes) {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (~crc) >>> 0;
}

function zipStore(files) {
  const enc = new TextEncoder();
  const local = [];
  const central = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const data = enc.encode(f.content);
    const crc = crc32(data);
    const size = data.length;

    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(6, 0x0800, true); // cờ UTF-8
    lh.setUint16(8, 0, true); // method = store
    lh.setUint16(10, 0, true);
    lh.setUint16(12, 0, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, size, true);
    lh.setUint32(22, size, true);
    lh.setUint16(26, nameBytes.length, true);
    lh.setUint16(28, 0, true);
    local.push(new Uint8Array(lh.buffer), nameBytes, data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0x0800, true);
    cd.setUint16(10, 0, true);
    cd.setUint16(12, 0, true);
    cd.setUint16(14, 0, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, size, true);
    cd.setUint32(24, size, true);
    cd.setUint16(28, nameBytes.length, true);
    cd.setUint16(30, 0, true);
    cd.setUint16(32, 0, true);
    cd.setUint16(34, 0, true);
    cd.setUint16(36, 0, true);
    cd.setUint32(38, 0, true);
    cd.setUint32(42, offset, true);
    central.push(new Uint8Array(cd.buffer), nameBytes);

    offset += 30 + nameBytes.length + size;
  }

  const cdStart = offset;
  const cdSize = central.reduce((s, u) => s + u.length, 0);

  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, cdSize, true);
  eocd.setUint32(16, cdStart, true);
  eocd.setUint16(20, 0, true);

  return new Blob([...local, ...central, new Uint8Array(eocd.buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// Bỏ ký tự không hợp lệ trong tên file.
function safeFileName(name) {
  return (name || "lich-trinh")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * Xuất board ra file .xlsx và kích hoạt tải xuống.
 * @param {object} board - BoardResponse (đã normalize) gồm planTitle, startDate, endDate, lists[]
 */
export function exportPlanToExcel(board) {
  if (!board) return;

  const { sheet, styles } = buildSheetAndStyles(board);
  const sheetName = L("Lịch trình", "Itinerary").slice(0, 31);

  const files = [
    {
      name: "[Content_Types].xml",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        "</Types>",
    },
    {
      name: "_rels/.rels",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>",
    },
    {
      name: "xl/workbook.xml",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets><sheet name="${escXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>` +
        "</workbook>",
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        "</Relationships>",
    },
    { name: "xl/styles.xml", content: styles },
    { name: "xl/worksheets/sheet1.xml", content: sheet },
  ];

  const blob = zipStore(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${safeFileName(board.planTitle)} - ${stamp}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
