// src/features/partner/utils/hotelCreateUtils.js
export const asString = (v) => (v == null ? "" : String(v));

export function normalizeImages(rawImages) {
  const arr = Array.isArray(rawImages) ? rawImages : [];
  return arr.map((x, idx) => ({
    url: asString(x?.url),
    caption: asString(x?.caption),
    cover: !!x?.cover,
    sortOrder: Number.isFinite(Number(x?.sortOrder)) ? Number(x?.sortOrder) : idx,
  }));
}

export function normalizeContent(rawContent) {
  const arr = Array.isArray(rawContent) ? rawContent : [];
  return arr.map((b, idx) => ({
    type: asString(b?.type || "PARAGRAPH"),
    section: asString(b?.section || "OVERVIEW"),
    text: asString(b?.text),
    imageUrl: asString(b?.image?.url),
    imageCaption: asString(b?.image?.caption),
    sortOrder: Number.isFinite(Number(b?.sortOrder)) ? Number(b?.sortOrder) : idx,
  }));
}

const pickCode = (v) => {
  if (v == null) return "";
  if (typeof v === "object") return v.code ?? v.value ?? v.id ?? "";
  return v;
};

const trimOrNull = (v) => {
  const s = asString(pickCode(v)).trim();
  return s ? s : null;
};

export const isHttpUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s);

export function createInitialHotelForm() {
  return {
    // core
    name: "",
    slug: "",
    shortDescription: "",
    description: "",

    // contact
    phone: "",
    email: "",
    website: "",

    // address
    addressLine: "",
    cityName: "",
    districtName: "",
    wardName: "",

    // location
    latitude: "",
    longitude: "",

    // hotel-specific
    starRating: 0,
    hotelType: "HOTEL",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    policies: "",
    extraInfo: "",

    // images & content
    images: normalizeImages([]),
    content: normalizeContent([]),

    // amenities & rooms
    amenities: [],
    roomTypes: [],
  };
}

export function buildHotelCreatePayload(form) {
  const latitude = form.latitude === "" ? null : Number(form.latitude);
  const longitude = form.longitude === "" ? null : Number(form.longitude);

  const mapAmenityKey = (a) => (typeof a === "string" ? a : a?.code ?? a?.id);

  const provinceName = (form.provinceName ?? form.cityName ?? "").trim() || null;

  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    shortDescription: form.shortDescription.trim() || null,
    description: form.description.trim() || null,

    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    website: form.website.trim() || null,

    addressLine: form.addressLine.trim() || null,
    provinceCode: trimOrNull(form.provinceCode),
    provinceName: trimOrNull(form.provinceName ?? form.cityName),
    districtCode: trimOrNull(form.districtCode),
    districtName: trimOrNull(form.districtName),
    wardCode: trimOrNull(form.wardCode),
    wardName: trimOrNull(form.wardName),

    latitude,
    longitude,

    minPrice: form.minPrice === "" ? null : form.minPrice ?? null,
    maxPrice: form.maxPrice === "" ? null : form.maxPrice ?? null,

    starRating: Number(form.starRating || 0),
    hotelType: form.hotelType || null,
    checkInTime: form.checkInTime || null,
    checkOutTime: form.checkOutTime || null,
    policies: form.policies.trim() || null,
    extraInfo: form.extraInfo.trim() || null,

    images: (form.images || [])
      .filter((x) => x.url && x.url.trim() && isHttpUrl(x.url))
      .map((x, idx) => ({
        url: x.url.trim(),
        caption: x.caption?.trim() || null,
        cover: !!x.cover,
        sortOrder: Number.isFinite(Number(x.sortOrder)) ? Number(x.sortOrder) : idx,
      })),

    content: (form.content || []).map((b, idx) => ({
      type: b.type,
      section: b.section,
      text: b.text || null,
      image: b.imageUrl
        ? { url: b.imageUrl, caption: b.imageCaption || null, cover: false, sortOrder: 0 }
        : null,
      sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : idx,
    })),

    amenityCodes: (form.amenities || form.amenityCodes || [])
      .map(mapAmenityKey)
      .filter(Boolean),

    roomTypes: (form.roomTypes || []).map((r) => ({
      name: r.name?.trim() || null,
      code: r.code?.trim() || null,
      description: r.description?.trim() || null,
      areaM2: r.areaM2 === "" ? null : Number(r.areaM2),
      quantity: Number(r.quantity ?? 0),
      maxAdults: Number(r.maxAdults ?? 0),
      maxChildren: Number(r.maxChildren ?? 0),
      beds: (r.beds || []).map((b) => ({ type: b.type, count: Number(b.count ?? 1) })),
      currency: r.currency || "VND",
      basePrice: r.basePrice === "" ? null : Number(r.basePrice),

      amenities: (r.amenities || []).map(mapAmenityKey).filter(Boolean),

      ratePlans: (r.ratePlans || []).map((rp) => ({
        name: rp.name?.trim() || null,
        code: rp.code?.trim() || null,
        refundable: !!rp.refundable,
        pricePerNight: rp.pricePerNight === "" ? null : Number(rp.pricePerNight),
      })),
    })),
    bookingConfig: form.bookingConfig || null,
  };
}