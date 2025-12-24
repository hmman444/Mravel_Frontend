// utils/normalize + safe helpers

export const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

export const asString = (v, fallback = "") => {
  try {
    if (v == null) return fallback;
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    if (typeof v === "object") {
      if ("vi" in v || "en" in v) return String(v.vi ?? v.en ?? fallback);
      return JSON.stringify(v);
    }
    return String(v);
  } catch {
    return fallback;
  }
};

export const asArray = (v) => (Array.isArray(v) ? v : []);

export const asInt = (v, fallback = 0) => {
  try {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  } catch {
    return fallback;
  }
};

export const asPosInt = (v, fallback = 0) => {
  const n = asInt(v, fallback);
  return n < 0 ? 0 : n;
};

export const capLen = (s, max = 200) => {
  const str = asString(s, "");
  return str.length > max ? str.slice(0, max) : str;
};

// chỉ cho phép số + 1 dấu chấm (area, price...)
export const sanitizeNumberStr = (v) => {
  const s = asString(v, "");
  let out = s.replace(/[^\d.]/g, "");
  const firstDot = out.indexOf(".");
  if (firstDot !== -1) {
    out = out.slice(0, firstDot + 1) + out.slice(firstDot + 1).replace(/\./g, "");
  }
  if (out.startsWith(".")) out = "0" + out;
  return out;
};

// gen code từ tên phòng (UPPER_SNAKE, bỏ dấu)
export const genRoomCodeFromName = (name) => {
  try {
    const s = asString(name, "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    return s ? s.toUpperCase() : "";
  } catch {
    return "";
  }
};

export const normalizeBed = (b) => {
  const bb = isObj(b) ? b : {};
  return {
    type: asString(bb.type, "SINGLE"),
    count: asPosInt(bb.count, 1) || 1,
  };
};

export const normalizeRatePlan = (rp) => {
  const rpp = isObj(rp) ? rp : {};
  return {
    id: asString(rpp.id, ""),
    name: asString(rpp.name, ""),
    code: asString(rpp.code, ""),

    boardType: asString(rpp.boardType, "ROOM_ONLY"),
    paymentType: asString(rpp.paymentType, "PREPAID"),

    refundable: !!rpp.refundable,
    cancellationPolicy: asString(rpp.cancellationPolicy, ""),

    pricePerNight: sanitizeNumberStr(rpp.pricePerNight),
    referencePricePerNight: sanitizeNumberStr(rpp.referencePricePerNight),

    discountPercent: sanitizeNumberStr(rpp.discountPercent),
    taxPercent: sanitizeNumberStr(rpp.taxPercent),
    serviceFeePercent: sanitizeNumberStr(rpp.serviceFeePercent),

    priceIncludesTax: rpp.priceIncludesTax !== false,
    priceIncludesServiceFee: rpp.priceIncludesServiceFee !== false,

    promoLabel: asString(rpp.promoLabel, ""),
    showLowAvailability: !!rpp.showLowAvailability,

    lengthOfStayDiscounts: asArray(rpp.lengthOfStayDiscounts).map((x) => ({
      minNights: asPosInt(x?.minNights, 0),
      percent: sanitizeNumberStr(x?.percent),
    })),
  };
};

export const normalizeImage = (img) => {
  if (typeof img === "string") return { url: img, isCover: false };
  const o = isObj(img) ? img : {};
  return {
    url: asString(o.url ?? o.previewUrl ?? "", ""),
    isCover: !!o.isCover,
    file: o.file,
  };
};

export const normalizeRoom = (r) => {
  const rr = isObj(r) ? r : {};
  const beds = asArray(rr.beds).map(normalizeBed);
  const ratePlans = asArray(rr.ratePlans).map(normalizeRatePlan);
  const images = asArray(rr.images).map(normalizeImage).filter((x) => x.url);
  const codeManual = !!rr.codeManual;

  return {
    name: asString(rr.name, ""),
    code: asString(rr.code, ""),
    codeManual,
    description: capLen(rr.description, 200),
    areaM2: sanitizeNumberStr(rr.areaM2),

    maxAdults: asPosInt(rr.maxAdults, 2),
    maxChildren: asPosInt(rr.maxChildren, 0),
    beds: beds.length ? beds : [{ type: "DOUBLE", count: 1 }],
    quantity: asPosInt(rr.quantity, 1),

    basePrice: sanitizeNumberStr(rr.basePrice),
    currency: asString(rr.currency, "VND"),

    images,
    amenities: asArray(rr.amenities),

    ratePlans: ratePlans.length
      ? ratePlans
      : [{ name: "Standard", code: "STANDARD", refundable: true, pricePerNight: "" }],
  };
};