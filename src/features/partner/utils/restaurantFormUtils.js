// src/features/partner/utils/restaurantFormUtils.js

// ==============================
// Helpers
// ==============================
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
  if (Array.isArray(raw))
    return raw
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n))
      .map((n) => Math.trunc(n));

  const s = asString(raw, "");
  if (!s.trim()) return [];
  return s
    .split(/[,\s]+/g)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.trunc(n));
};

// ==============================
// Existing (already in your FE)
// ==============================
export const normalizeTableType = (t) => {
  const o = isObj(t) ? t : {};
  return {
    id: asString(o.id ?? "", ""),
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

// ==============================
// ADD: UI enums (optional)
// ==============================
export const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

// ==============================
// ADD: Small object normalizers
// ==============================
export const normalizeCodeName = (x) => {
  const o = isObj(x) ? x : {};
  return {
    code: asString(o.code ?? "", "").trim(),
    name: asString(o.name ?? "", "").trim(),
  };
};

export const normalizeCuisine = (x) => {
  const o = isObj(x) ? x : {};
  return {
    code: asString(o.code ?? "", "").trim(),
    name: asString(o.name ?? "", "").trim(),
    region: asString(o.region ?? "", "").trim(),
  };
};

export const normalizeOpeningHour = (x) => {
  const o = isObj(x) ? x : {};
  return {
    dayOfWeek: asString(o.dayOfWeek ?? "", "").trim(),
    openTime: asString(o.openTime ?? o.open ?? "", "").trim(),
    closeTime: asString(o.closeTime ?? o.close ?? "", "").trim(),
  };
};

export const normalizeSignatureDish = (x) => {
  const o = isObj(x) ? x : {};
  return { name: asString(o.name ?? x ?? "", "").trim() };
};

export const normalizeCapacity = (x) => {
  const o = isObj(x) ? x : {};
  return {
    totalCapacity: sanitizeIntStr(o.totalCapacity),
    maxGroupSize: sanitizeIntStr(o.maxGroupSize),
    hasPrivateRooms: !!o.hasPrivateRooms,
    privateRoomCount: sanitizeIntStr(o.privateRoomCount),
    maxPrivateRoomCapacity: sanitizeIntStr(o.maxPrivateRoomCapacity),
    hasOutdoorSeating: !!o.hasOutdoorSeating,
  };
};

export const normalizeParking = (x) => {
  const o = isObj(x) ? x : {};
  return {
    hasCarParking: !!o.hasCarParking,
    carParkingLocation: asString(o.carParkingLocation ?? "", ""),
    carParkingFeeType: asString(o.carParkingFeeType ?? "", ""),
    carParkingFeeAmount: sanitizeNumberStr(o.carParkingFeeAmount),
    hasMotorbikeParking: !!o.hasMotorbikeParking,
    motorbikeParkingLocation: asString(o.motorbikeParkingLocation ?? "", ""),
    motorbikeParkingFeeType: asString(o.motorbikeParkingFeeType ?? "", ""),
    motorbikeParkingFeeAmount: sanitizeNumberStr(o.motorbikeParkingFeeAmount),
    notes: asString(o.notes ?? "", ""),
  };
};

export const normalizeBlackoutRule = (x) => {
  const o = isObj(x) ? x : {};
  return {
    month: sanitizeIntStr(o.month),
    day: sanitizeIntStr(o.day),
    reason: asString(o.reason ?? o.note ?? "", ""),
  };
};

export const normalizeOutsideDrinkFee = (x) => {
  const o = isObj(x) ? x : {};
  return {
    drinkType: asString(o.drinkType ?? "", ""),
    feeAmount: sanitizeNumberStr(o.feeAmount),
    currencyCode: asString(o.currencyCode ?? "VND", "VND") || "VND",
    note: asString(o.note ?? "", ""),
  };
};

export const normalizePolicy = (x) => {
  const o = isObj(x) ? x : {};
  return {
    depositRequired: !!o.depositRequired,
    depositMinGuests: sanitizeIntStr(o.depositMinGuests),
    depositAmount: sanitizeNumberStr(o.depositAmount),
    depositCurrencyCode: asString(o.depositCurrencyCode ?? "VND", "VND") || "VND",
    depositNotes: asString(o.depositNotes ?? "", ""),

    hasPromotion: !!o.hasPromotion,
    promotionSummary: asString(o.promotionSummary ?? "", ""),
    promotionMaxDiscountPercent: sanitizeIntStr(o.promotionMaxDiscountPercent),
    promotionNote: asString(o.promotionNote ?? "", ""),

    blackoutRules: asArray(o.blackoutRules).map(normalizeBlackoutRule),

    minBookingLeadTimeMinutes: sanitizeIntStr(o.minBookingLeadTimeMinutes),
    maxHoldTimeMinutes: sanitizeIntStr(o.maxHoldTimeMinutes),
    minGuestsPerBooking: sanitizeIntStr(o.minGuestsPerBooking),

    // tri-state boolean (true/false/null)
    vatInvoiceAvailable: o.vatInvoiceAvailable === true ? true : o.vatInvoiceAvailable === false ? false : null,
    vatPercent: sanitizeNumberStr(o.vatPercent),
    directInvoiceAvailable: o.directInvoiceAvailable === true ? true : o.directInvoiceAvailable === false ? false : null,
    invoiceNotes: asString(o.invoiceNotes ?? "", ""),

    serviceChargePercent: sanitizeNumberStr(o.serviceChargePercent),
    serviceChargeNotes: asString(o.serviceChargeNotes ?? "", ""),

    allowOutsideFood: !!o.allowOutsideFood,
    allowOutsideDrink: !!o.allowOutsideDrink,
    outsideFoodPolicy: asString(o.outsideFoodPolicy ?? "", ""),
    outsideDrinkPolicy: asString(o.outsideDrinkPolicy ?? "", ""),
    outsideDrinkFees: asArray(o.outsideDrinkFees).map(normalizeOutsideDrinkFee),
  };
};

// ==============================
// ADD: Menu sections (basic)
// ==============================
export const normalizeMenuItem = (x) => {
  const o = isObj(x) ? x : {};
  return {
    name: asString(o.name ?? "", ""),
    description: asString(o.description ?? "", ""),
    priceFrom: sanitizeNumberStr(o.priceFrom),
    priceTo: sanitizeNumberStr(o.priceTo),
    unit: asString(o.unit ?? "", ""),
    combo: !!o.combo,
    buffetItem: !!o.buffetItem,
    tags: asArray(o.tags).map((t) => asString(t, "")).filter(Boolean),
  };
};

export const normalizeMenuSection = (x) => {
  const o = isObj(x) ? x : {};
  return {
    code: asString(o.code ?? "", ""),
    name: asString(o.name ?? "", ""),
    items: asArray(o.items).map(normalizeMenuItem),
  };
};

// ==============================
// Form: initial
// ==============================
export function createInitialRestaurantForm() {
  return {
    // required
    name: "",
    destinationSlug: "",

    // recommended
    slug: "",
    shortDescription: "",
    description: "",

    // meta
    restaurantType: "",
    parentPlaceSlug: "",

    // contact
    phone: "",
    email: "",
    website: "",
    facebookPage: "",
    bookingHotline: "",

    // location text
    cityName: "",
    districtName: "",
    wardName: "",
    addressLine: "",

    // optional codes for dropdown UX
    cityCode: "",
    districtCode: "",
    wardCode: "",

    // geo
    latitude: "",
    longitude: "",

    // pricing
    minPrice: "",
    maxPrice: "",
    currencyCode: "VND",
    priceLevel: "",
    priceBucket: "",

    // tags + time
    cuisines: [],
    openingHours: [],
    suitableFor: [],
    ambience: [],
    signatureDishes: [],

    // menu
    menuImages: [],
    menuSections: [],

    // extra
    capacity: normalizeCapacity({}),
    parking: normalizeParking({}),
    policy: normalizePolicy({}),

    // existing sections you already have
    images: [],
    amenityCodes: [],
    tableTypes: [],
    bookingConfig: normalizeBookingConfig({}),

    // content blocks (optional - raw)
    content: [],
  };
}

// ==============================
// Map doc -> form
// ==============================
export function mapRestaurantDocToForm(raw) {
  const r = isObj(raw) ? raw : {};
  const imgs = asArray(r.images).map(normalizeImageReq).filter((x) => x.url);
  const menuImgs = asArray(r.menuImages).map(normalizeImageReq).filter((x) => x.url);

  // location fallback: backend doc đôi khi có location [lon,lat]
  const loc = asArray(r.location);
  const lonFromLoc = loc.length >= 2 ? loc[0] : null;
  const latFromLoc = loc.length >= 2 ? loc[1] : null;

  return {
    ...createInitialRestaurantForm(),

    name: asString(r.name ?? r.title ?? "", ""),
    slug: asString(r.slug ?? "", ""),
    destinationSlug: asString(r.destinationSlug ?? "", ""),

    restaurantType: asString(r.restaurantType ?? "", ""),
    parentPlaceSlug: asString(r.parentPlaceSlug ?? "", ""),

    phone: asString(r.phone ?? "", ""),
    email: asString(r.email ?? "", ""),
    website: asString(r.website ?? "", ""),
    facebookPage: asString(r.facebookPage ?? "", ""),
    bookingHotline: asString(r.bookingHotline ?? "", ""),

    cityName: asString(r.cityName ?? r.provinceName ?? "", ""),
    districtName: asString(r.districtName ?? "", ""),
    wardName: asString(r.wardName ?? "", ""),
    addressLine: asString(r.addressLine ?? "", ""),

    latitude: sanitizeNumberStr(r.latitude ?? latFromLoc),
    longitude: sanitizeNumberStr(r.longitude ?? lonFromLoc),

    shortDescription: asString(r.shortDescription ?? "", ""),
    description: asString(r.description ?? "", ""),

    minPrice: sanitizeNumberStr(r.minPricePerPerson ?? r.minPrice),
    maxPrice: sanitizeNumberStr(r.maxPricePerPerson ?? r.maxPrice),
    currencyCode: asString(r.currencyCode ?? "VND", "VND") || "VND",
    priceLevel: asString(r.priceLevel ?? "", ""),
    priceBucket: asString(r.priceBucket ?? "", ""),

    cuisines: asArray(r.cuisines).map(normalizeCuisine),
    openingHours: asArray(r.openingHours).map(normalizeOpeningHour),
    suitableFor: asArray(r.suitableFor).map(normalizeCodeName),
    ambience: asArray(r.ambience).map(normalizeCodeName),
    signatureDishes: asArray(r.signatureDishes).map(normalizeSignatureDish),

    menuImages: menuImgs.length ? menuImgs.map((x, i) => ({ ...x, sortOrder: i, cover: x.cover || i === 0 })) : [],
    menuSections: asArray(r.menuSections).map(normalizeMenuSection),

    capacity: normalizeCapacity(r.capacity),
    parking: normalizeParking(r.parking),
    policy: normalizePolicy(r.policy),

    content: asArray(r.content),

    images: imgs.length ? imgs.map((x, i) => ({ ...x, sortOrder: i, cover: x.cover || i === 0 })) : [],

    amenityCodes: asArray(r.amenityCodes ?? r.amenities ?? [])
      .map((x) => asString(x, ""))
      .filter(Boolean),

    tableTypes: asArray(r.tableTypes).map(normalizeTableType),
    bookingConfig: normalizeBookingConfig(r.bookingConfig),
  };
}

// ==============================
// Build payload (form -> API)
// ==============================
export function buildRestaurantPayload(formDraft = {}) {
  const f = isObj(formDraft) ? formDraft : {};

  const payload = {
    // required (update cũng phải gửi destinationSlug)
    name: asString(f.name, "").trim(),
    slug: asString(f.slug, "").trim(),
    destinationSlug: asString(f.destinationSlug, "").trim(),

    // meta
    restaurantType: asString(f.restaurantType, "").trim() || null,
    parentPlaceSlug: asString(f.parentPlaceSlug, "").trim() || null,

    // contact
    phone: asString(f.phone, "").trim(),
    email: asString(f.email, "").trim(),
    website: asString(f.website, "").trim(),
    facebookPage: asString(f.facebookPage, "").trim() || null,
    bookingHotline: asString(f.bookingHotline, "").trim() || null,

    // location text
    cityName: asString(f.cityName, "").trim(),
    districtName: asString(f.districtName, "").trim(),
    wardName: asString(f.wardName, "").trim(),
    addressLine: asString(f.addressLine, "").trim(),

    // geo
    latitude: f.latitude === "" ? null : Number(sanitizeNumberStr(f.latitude)),
    longitude: f.longitude === "" ? null : Number(sanitizeNumberStr(f.longitude)),

    // content text
    shortDescription: asString(f.shortDescription, "").trim(),
    description: asString(f.description, "").trim(),

    // pricing
    minPricePerPerson: f.minPrice === "" ? null : Number(sanitizeNumberStr(f.minPrice)),
    maxPricePerPerson: f.maxPrice === "" ? null : Number(sanitizeNumberStr(f.maxPrice)),
    currencyCode: asString(f.currencyCode ?? "VND", "VND").trim() || "VND",
    priceLevel: asString(f.priceLevel, "").trim() || null,
    priceBucket: asString(f.priceBucket, "").trim() || null,

    // tags + time
    cuisines: asArray(f.cuisines).map(normalizeCuisine).filter((x) => x.code || x.name),
    openingHours: asArray(f.openingHours)
      .map(normalizeOpeningHour)
      .filter((x) => x.dayOfWeek && (x.openTime || x.closeTime))
      .map((x) => ({
        dayOfWeek: x.dayOfWeek,
        openTime: x.openTime || null,
        closeTime: x.closeTime || null,
      })),
    suitableFor: asArray(f.suitableFor).map(normalizeCodeName).filter((x) => x.code || x.name),
    ambience: asArray(f.ambience).map(normalizeCodeName).filter((x) => x.code || x.name),
    signatureDishes: asArray(f.signatureDishes).map(normalizeSignatureDish).filter((x) => x.name),

    // menu
    menuImages: asArray(f.menuImages)
      .map(normalizeImageReq)
      .filter((x) => x.url)
      .map(({ url, caption, cover, sortOrder }) => ({
        url,
        caption: caption || null,
        cover: !!cover,
        sortOrder: Number.isFinite(Number(sortOrder)) ? Math.trunc(Number(sortOrder)) : 0,
      })),

    menuSections: asArray(f.menuSections)
      .map(normalizeMenuSection)
      .filter((s) => String(s.name || "").trim() || String(s.code || "").trim())
      .map((s) => ({
        code: String(s.code || "").trim() || null,
        name: String(s.name || "").trim(),
        items: asArray(s.items)
          .map(normalizeMenuItem)
          .filter((it) => String(it.name || "").trim())
          .map((it) => ({
            name: String(it.name || "").trim(),
            description: String(it.description || "").trim() || null,
            priceFrom: it.priceFrom === "" ? null : Number(sanitizeNumberStr(it.priceFrom)),
            priceTo: it.priceTo === "" ? null : Number(sanitizeNumberStr(it.priceTo)),
            unit: String(it.unit || "").trim() || null,
            combo: !!it.combo,
            buffetItem: !!it.buffetItem,
            tags: asArray(it.tags).map((t) => asString(t, "")).filter(Boolean),
          })),
      })),

    // extra
    capacity: (() => {
      const c = normalizeCapacity(f.capacity);
      return {
        totalCapacity: c.totalCapacity === "" ? null : Number(c.totalCapacity),
        maxGroupSize: c.maxGroupSize === "" ? null : Number(c.maxGroupSize),
        hasPrivateRooms: !!c.hasPrivateRooms,
        privateRoomCount: c.privateRoomCount === "" ? null : Number(c.privateRoomCount),
        maxPrivateRoomCapacity: c.maxPrivateRoomCapacity === "" ? null : Number(c.maxPrivateRoomCapacity),
        hasOutdoorSeating: !!c.hasOutdoorSeating,
      };
    })(),

    parking: (() => {
      const p = normalizeParking(f.parking);
      return {
        hasCarParking: !!p.hasCarParking,
        carParkingLocation: String(p.carParkingLocation || "").trim() || null,
        carParkingFeeType: String(p.carParkingFeeType || "").trim() || null,
        carParkingFeeAmount: p.carParkingFeeAmount === "" ? null : Number(sanitizeNumberStr(p.carParkingFeeAmount)),
        hasMotorbikeParking: !!p.hasMotorbikeParking,
        motorbikeParkingLocation: String(p.motorbikeParkingLocation || "").trim() || null,
        motorbikeParkingFeeType: String(p.motorbikeParkingFeeType || "").trim() || null,
        motorbikeParkingFeeAmount: p.motorbikeParkingFeeAmount === "" ? null : Number(sanitizeNumberStr(p.motorbikeParkingFeeAmount)),
        notes: String(p.notes || "").trim() || null,
      };
    })(),

    policy: (() => {
      const p = normalizePolicy(f.policy);
      return {
        depositRequired: !!p.depositRequired,
        depositMinGuests: p.depositMinGuests === "" ? null : Number(p.depositMinGuests),
        depositAmount: p.depositAmount === "" ? null : Number(sanitizeNumberStr(p.depositAmount)),
        depositCurrencyCode: (p.depositCurrencyCode || "VND").trim() || "VND",
        depositNotes: String(p.depositNotes || "").trim() || null,

        hasPromotion: !!p.hasPromotion,
        promotionSummary: String(p.promotionSummary || "").trim() || null,
        promotionMaxDiscountPercent: p.promotionMaxDiscountPercent === "" ? null : Number(p.promotionMaxDiscountPercent),
        promotionNote: String(p.promotionNote || "").trim() || null,

        blackoutRules: asArray(p.blackoutRules)
          .map(normalizeBlackoutRule)
          .filter((r) => r.month && r.day)
          .map((r) => ({
            month: Number(r.month),
            day: Number(r.day),
            reason: String(r.reason || "").trim() || null,
          })),

        minBookingLeadTimeMinutes: p.minBookingLeadTimeMinutes === "" ? null : Number(p.minBookingLeadTimeMinutes),
        maxHoldTimeMinutes: p.maxHoldTimeMinutes === "" ? null : Number(p.maxHoldTimeMinutes),
        minGuestsPerBooking: p.minGuestsPerBooking === "" ? null : Number(p.minGuestsPerBooking),

        vatInvoiceAvailable: p.vatInvoiceAvailable,
        vatPercent: p.vatPercent === "" ? null : Number(sanitizeNumberStr(p.vatPercent)),
        directInvoiceAvailable: p.directInvoiceAvailable,
        invoiceNotes: String(p.invoiceNotes || "").trim() || null,

        serviceChargePercent: p.serviceChargePercent === "" ? null : Number(sanitizeNumberStr(p.serviceChargePercent)),
        serviceChargeNotes: String(p.serviceChargeNotes || "").trim() || null,

        allowOutsideFood: !!p.allowOutsideFood,
        allowOutsideDrink: !!p.allowOutsideDrink,
        outsideFoodPolicy: String(p.outsideFoodPolicy || "").trim() || null,
        outsideDrinkPolicy: String(p.outsideDrinkPolicy || "").trim() || null,
        outsideDrinkFees: asArray(p.outsideDrinkFees)
          .map(normalizeOutsideDrinkFee)
          .filter((x) => x.drinkType && x.feeAmount !== "")
          .map((x) => ({
            drinkType: x.drinkType,
            feeAmount: Number(sanitizeNumberStr(x.feeAmount)),
            currencyCode: (x.currencyCode || "VND").trim() || "VND",
            note: String(x.note || "").trim() || null,
          })),
      };
    })(),

    // images (gallery)
    images: asArray(f.images)
      .map(normalizeImageReq)
      .filter((x) => x.url)
      .map(({ url, caption, cover, sortOrder }) => ({
        url,
        caption: caption || null,
        cover: !!cover,
        sortOrder: Number.isFinite(Number(sortOrder)) ? Math.trunc(Number(sortOrder)) : 0,
      })),

    // amenity codes
    amenityCodes: asArray(f.amenityCodes).map((x) => asString(x, "")).filter(Boolean),

    // table types
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

    // booking config
    bookingConfig: (() => {
      const cfg = normalizeBookingConfig(f.bookingConfig);
      return {
        slotMinutes: cfg.slotMinutes === "" ? null : Number(sanitizeIntStr(cfg.slotMinutes)),
        allowedDurationsMinutes: parseIntList(cfg.allowedDurationsMinutes),
        defaultDurationMinutes: cfg.defaultDurationMinutes === "" ? null : Number(sanitizeIntStr(cfg.defaultDurationMinutes)),
        minBookingLeadTimeMinutes: cfg.minBookingLeadTimeMinutes === "" ? null : Number(sanitizeIntStr(cfg.minBookingLeadTimeMinutes)),
        graceArrivalMinutes: cfg.graceArrivalMinutes === "" ? null : Number(sanitizeIntStr(cfg.graceArrivalMinutes)),
        freeCancelMinutes: cfg.freeCancelMinutes === "" ? null : Number(sanitizeIntStr(cfg.freeCancelMinutes)),
        pendingPaymentExpireMinutes: cfg.pendingPaymentExpireMinutes === "" ? null : Number(sanitizeIntStr(cfg.pendingPaymentExpireMinutes)),
        depositOnly: !!cfg.depositOnly,
        maxTablesPerBooking: cfg.maxTablesPerBooking === "" ? null : Number(sanitizeIntStr(cfg.maxTablesPerBooking)),
      };
    })(),

    // content blocks (raw passthrough)
    content: asArray(f.content),
  };

  // auto slug nếu bỏ trống
  if (!payload.slug && payload.name) payload.slug = slugifyVN(payload.name);

  return payload;
}