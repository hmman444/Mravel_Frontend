// src/features/partner/utils/restaurantFormUtils.js

export const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export const asArray = (v) => (Array.isArray(v) ? v : []);
export const asString = (v, fb = "") => (v == null ? fb : String(v));

export const sanitizeNumberStr = (v) => {
  const s = asString(v, "");
  let out = s.replace(/[^\d.]/g, "");
  const firstDot = out.indexOf(".");
  if (firstDot !== -1) out = out.slice(0, firstDot + 1) + out.slice(firstDot + 1).replace(/\./g, "");
  if (out.startsWith(".")) out = "0" + out;
  return out;
};
export const sanitizeIntStr = (v) => asString(v, "").replace(/[^\d]/g, "");

export const slugifyVN = (input) => {
  const s = (input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s;
};

export const normalizeImageReq = (img) => {
  const o = isObj(img) ? img : {};
  return {
    url: asString(o.url ?? o.previewUrl ?? "", "").trim(),
    caption: asString(o.caption ?? "", ""),
    cover: !!(o.cover ?? o.isCover),
    sortOrder: Number.isFinite(Number(o.sortOrder)) ? Math.trunc(Number(o.sortOrder)) : 0,
    file: o.file,
  };
};

export const parseIntList = (raw) => {
  // accept "30,60, 90" or [30,60]
  if (Array.isArray(raw)) return raw.map((x) => Number(x)).filter((n) => Number.isFinite(n)).map((n) => Math.trunc(n));
  const s = asString(raw, "");
  if (!s.trim()) return [];
  return s
    .split(/[,\s]+/g)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.trunc(n));
};

export const normalizeTableType = (t) => {
  const o = isObj(t) ? t : {};
  return {
    id: asString(o.id ?? "", ""), // FE giữ string; build payload sẽ null nếu rỗng
    name: asString(o.name ?? "", ""),
    seats: sanitizeIntStr(o.seats),
    minPeople: sanitizeIntStr(o.minPeople),
    maxPeople: sanitizeIntStr(o.maxPeople),
    totalTables: sanitizeIntStr(o.totalTables),

    depositPrice: sanitizeNumberStr(o.depositPrice),
    currencyCode: asString(o.currencyCode ?? "VND", "VND") || "VND",

    vip: !!o.vip,
    privateRoom: !!o.privateRoom,

    allowedDurationsMinutes: asArray(o.allowedDurationsMinutes),
    defaultDurationMinutes: sanitizeIntStr(o.defaultDurationMinutes),

    note: asString(o.note ?? "", ""),
  };
};

export const normalizeBookingConfig = (cfg) => {
  const o = isObj(cfg) ? cfg : {};
  return {
    slotMinutes: sanitizeIntStr(o.slotMinutes),
    allowedDurationsMinutes: asArray(o.allowedDurationsMinutes),
    defaultDurationMinutes: sanitizeIntStr(o.defaultDurationMinutes),

    minBookingLeadTimeMinutes: sanitizeIntStr(o.minBookingLeadTimeMinutes),
    graceArrivalMinutes: sanitizeIntStr(o.graceArrivalMinutes),
    freeCancelMinutes: sanitizeIntStr(o.freeCancelMinutes),
    pendingPaymentExpireMinutes: sanitizeIntStr(o.pendingPaymentExpireMinutes),

    depositOnly: !!o.depositOnly,
    maxTablesPerBooking: sanitizeIntStr(o.maxTablesPerBooking),
  };
};

export function createInitialRestaurantForm() {
  return {
    // required
    name: "",
    destinationSlug: "",

    // recommended
    slug: "",
    shortDescription: "",
    description: "",

    phone: "",
    email: "",
    website: "",

    cityName: "",
    districtName: "",
    wardName: "",
    addressLine: "",

    // optional codes for dropdown UX (payload chỉ lấy *Name*)
    cityCode: "",
    districtCode: "",
    wardCode: "",

    latitude: "",
    longitude: "",

    minPrice: "",
    maxPrice: "",

    images: [],

    // DTO wants amenityCodes: string[]
    amenityCodes: [],

    tableTypes: [],
    bookingConfig: normalizeBookingConfig({}),
  };
}

export function mapRestaurantDocToForm(raw) {
  const r = isObj(raw) ? raw : {};
  const imgs = asArray(r.images).map(normalizeImageReq).filter((x) => x.url);

  // location fallback: backend doc đôi khi có location [lon,lat]
  const loc = asArray(r.location);
  const lonFromLoc = loc.length >= 2 ? loc[0] : null;
  const latFromLoc = loc.length >= 2 ? loc[1] : null;

  return {
    ...createInitialRestaurantForm(),

    name: asString(r.name ?? r.title ?? "", ""),
    slug: asString(r.slug ?? "", ""),
    destinationSlug: asString(r.destinationSlug ?? "", ""),

    cityName: asString(r.cityName ?? r.provinceName ?? "", ""),
    districtName: asString(r.districtName ?? "", ""),
    wardName: asString(r.wardName ?? "", ""),
    addressLine: asString(r.addressLine ?? "", ""),

    latitude: sanitizeNumberStr(r.latitude ?? latFromLoc),
    longitude: sanitizeNumberStr(r.longitude ?? lonFromLoc),

    shortDescription: asString(r.shortDescription ?? "", ""),
    description: asString(r.description ?? "", ""),
    phone: asString(r.phone ?? "", ""),
    email: asString(r.email ?? "", ""),
    website: asString(r.website ?? "", ""),

    minPrice: sanitizeNumberStr(r.minPricePerPerson ?? r.minPrice),
    maxPrice: sanitizeNumberStr(r.maxPricePerPerson ?? r.maxPrice),

    images: imgs.length ? imgs.map((x, i) => ({ ...x, sortOrder: i, cover: x.cover || i === 0 })) : [],

    amenityCodes: asArray(r.amenityCodes ?? r.amenities ?? []).map((x) => asString(x, "")).filter(Boolean),

    tableTypes: asArray(r.tableTypes).map(normalizeTableType),
    bookingConfig: normalizeBookingConfig(r.bookingConfig),
  };
}

export function buildRestaurantPayload(formDraft) {

  const f = isObj(formDraft) ? formDraft : {};

  // IMPORTANT: update cũng phải gửi destinationSlug
  const payload = {
    name: asString(f.name, "").trim(),
    slug: asString(f.slug, "").trim(),
    destinationSlug: asString(f.destinationSlug, "").trim(),

    cityName: asString(f.cityName, "").trim(),
    districtName: asString(f.districtName, "").trim(),
    wardName: asString(f.wardName, "").trim(),
    addressLine: asString(f.addressLine, "").trim(),

    latitude: f.latitude === "" ? null : Number(sanitizeNumberStr(f.latitude)),
    longitude: f.longitude === "" ? null : Number(sanitizeNumberStr(f.longitude)),

    shortDescription: asString(f.shortDescription, "").trim(),
    description: asString(f.description, "").trim(),
    phone: asString(f.phone, "").trim(),
    email: asString(f.email, "").trim(),
    website: asString(f.website, "").trim(),

    minPricePerPerson: f.minPrice === "" ? null : Number(sanitizeNumberStr(f.minPrice)),
    maxPricePerPerson: f.maxPrice === "" ? null : Number(sanitizeNumberStr(f.maxPrice)),

    images: asArray(f.images)
      .map(normalizeImageReq)
      .filter((x) => x.url)
      .map(({ url, caption, cover, sortOrder }) => ({
        url,
        caption: caption || null,
        cover: !!cover,
        sortOrder: Number.isFinite(Number(sortOrder)) ? Math.trunc(Number(sortOrder)) : 0,
      })),

    amenityCodes: asArray(f.amenityCodes).map((x) => asString(x, "")).filter(Boolean),

    tableTypes: asArray(f.tableTypes)
      .map(normalizeTableType)
      .filter((x) => x.name.trim())
      .map((x) => ({
        id: x.id.trim() ? x.id.trim() : null,
        name: x.name.trim(),
        seats: x.seats === "" ? null : Number(sanitizeIntStr(x.seats)),
        minPeople: x.minPeople === "" ? null : Number(sanitizeIntStr(x.minPeople)),
        maxPeople: x.maxPeople === "" ? null : Number(sanitizeIntStr(x.maxPeople)),
        totalTables: x.totalTables === "" ? null : Number(sanitizeIntStr(x.totalTables)),

        depositPrice: x.depositPrice === "" ? null : Number(sanitizeNumberStr(x.depositPrice)),
        currencyCode: (x.currencyCode || "VND").trim() || "VND",

        vip: !!x.vip,
        privateRoom: !!x.privateRoom,

        allowedDurationsMinutes: parseIntList(x.allowedDurationsMinutes),
        defaultDurationMinutes: x.defaultDurationMinutes === "" ? null : Number(sanitizeIntStr(x.defaultDurationMinutes)),

        note: x.note?.trim() || null,
      })),

    bookingConfig: (() => {
      const cfg = normalizeBookingConfig(f.bookingConfig);
      return {
        slotMinutes: cfg.slotMinutes === "" ? null : Number(sanitizeIntStr(cfg.slotMinutes)),
        allowedDurationsMinutes: parseIntList(cfg.allowedDurationsMinutes),
        defaultDurationMinutes: cfg.defaultDurationMinutes === "" ? null : Number(sanitizeIntStr(cfg.defaultDurationMinutes)),

        minBookingLeadTimeMinutes:
          cfg.minBookingLeadTimeMinutes === "" ? null : Number(sanitizeIntStr(cfg.minBookingLeadTimeMinutes)),
        graceArrivalMinutes: cfg.graceArrivalMinutes === "" ? null : Number(sanitizeIntStr(cfg.graceArrivalMinutes)),
        freeCancelMinutes: cfg.freeCancelMinutes === "" ? null : Number(sanitizeIntStr(cfg.freeCancelMinutes)),
        pendingPaymentExpireMinutes:
          cfg.pendingPaymentExpireMinutes === "" ? null : Number(sanitizeIntStr(cfg.pendingPaymentExpireMinutes)),

        depositOnly: !!cfg.depositOnly,
        maxTablesPerBooking: cfg.maxTablesPerBooking === "" ? null : Number(sanitizeIntStr(cfg.maxTablesPerBooking)),
      };
    })(),
  };

  // optional: auto slug nếu bỏ trống
  if (!payload.slug && payload.name) payload.slug = slugifyVN(payload.name);

  // cleanup: nếu BE không thích null, bạn có thể bỏ field null (tuỳ bạn).
  // Mình giữ null để rõ ràng.

  return payload;
}