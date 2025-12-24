export const asString = (v) => (v == null ? "" : String(v));

const asArray = (v) => (Array.isArray(v) ? v : []);
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toIntOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const toDecOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const upper = (s) => asString(s).trim().toUpperCase();

const pickAmenityCode = (x) => {
  if (typeof x === "string") return upper(x);
  if (isObj(x)) return upper(x.code ?? x.id ?? "");
  return "";
};

const toHHmm = (v) => {
  const s = asString(v).trim();
  if (!s) return "";

  // "08:00" or "08:00:00" -> "08:00"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0, 5);

  // ISO datetime -> convert to local time HH:mm
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return s;
};

const mapImages = (images) =>
  asArray(images)
    .map((img, idx) => {
      if (typeof img === "string") {
        return { url: img, caption: "", cover: idx === 0, sortOrder: idx };
      }
      const url = asString(img?.url ?? img?.previewUrl ?? "");
      if (!url) return null;
      return {
        url,
        caption: asString(img?.caption ?? ""),
        cover: !!(img?.cover ?? img?.isCover),
        sortOrder: toIntOrNull(img?.sortOrder) ?? idx,
      };
    })
    .filter(Boolean)
    .map((x, i, arr) => {
      // ensure one cover
      if (!arr.some((a) => a.cover) && i === 0) return { ...x, cover: true };
      return x;
    });

const inferBedType = (beds) => {
  const list = asArray(beds).map((b) => ({
    type: upper(b?.type || ""),
    count: Math.max(1, toIntOrNull(b?.count) ?? 1),
  }));
  if (!list.length) return "DOUBLE";
  const uniqueTypes = Array.from(new Set(list.map((x) => x.type).filter(Boolean)));
  if (uniqueTypes.length > 1) return "MULTIPLE";
  return uniqueTypes[0] || "DOUBLE";
};

const bedsCount = (beds) =>
  asArray(beds).reduce((sum, b) => sum + Math.max(1, toIntOrNull(b?.count) ?? 1), 0);

export function createInitialHotelForm() {
  return {
    // core
    name: "",
    slug: "",
    hotelType: "HOTEL",
    starRating: 1,
    shortDescription: "",
    description: "",

    phone: "",
    email: "",
    website: "",

    // ✅ policy (FE fields)
    defaultCheckInTime: "",   // "14:00"
    defaultCheckOutTime: "",  // "12:00"
    policies: "",
    extraInfo: "",

    // location group
    destinationSlug: "",
    cityName: "",
    districtName: "",
    wardName: "",
    addressLine: "",

    // FE helper for provinces picker (nếu bạn dùng cityCode/districtCode/wardCode)
    cityCode: "",
    districtCode: "",
    wardCode: "",

    // 2dsphere
    locationLon: "",
    locationLat: "",

    // media/content
    images: [],
    content: [],

    // amenities (objects or codes)
    amenities: [],

    // configs
    taxConfig: {
      defaultVatPercent: "8",
      defaultServiceFeePercent: "7",
      showPricePreTax: false,
    },
    bookingConfig: {
      allowFullPayment: true,
      allowDeposit: false,
      depositPercent: "",
      freeCancelMinutes: "",
    },

    // room types (FE model)
    roomTypes: [],

    // moderation & active
    moderation: {
      status: "DRAFT",
      pendingReason: "CREATE",
      rejectionReason: "",
      blockedReason: "",
      unlockRequestReason: "",
    },
    active: true,
  };
}

export function mapHotelDocToForm(raw) {
  const f = createInitialHotelForm();

  const loc = raw?.location; // usually [lon, lat]
  const lon = Array.isArray(loc) ? loc[0] : raw?.locationLon ?? raw?.lon;
  const lat = Array.isArray(loc) ? loc[1] : raw?.locationLat ?? raw?.lat;

  // ✅ policy reverse-map
  const policyItems = asArray(raw?.policy?.items ?? []);
  const findByTitle = (t) => asString(policyItems.find((x) => x?.title === t)?.content ?? "");

  return {
    ...f,

    name: asString(raw?.name ?? raw?.title),
    slug: asString(raw?.slug),
    hotelType: asString(raw?.hotelType ?? "HOTEL"),
    starRating: Number(raw?.starRating ?? 1),

    shortDescription: asString(raw?.shortDescription),
    description: asString(raw?.description),

    phone: asString(raw?.phone),
    email: asString(raw?.email),
    website: asString(raw?.website),

    // ✅ times: ưu tiên field root, fallback policy.*
    defaultCheckInTime: toHHmm(raw?.defaultCheckInTime ?? raw?.policy?.checkInFrom),
    defaultCheckOutTime: toHHmm(raw?.defaultCheckOutTime ?? raw?.policy?.checkOutUntil),
    policies: findByTitle("Chính sách"),
    extraInfo: findByTitle("Thông tin thêm"),

    destinationSlug: asString(raw?.destinationSlug),
    cityName: asString(raw?.cityName),
    districtName: asString(raw?.districtName),
    wardName: asString(raw?.wardName),
    addressLine: asString(raw?.addressLine),

    locationLon: lon == null ? "" : String(lon),
    locationLat: lat == null ? "" : String(lat),

    images: mapImages(raw?.images),
    content: asArray(raw?.content).map((b) => ({
      section: asString(b?.section ?? "OVERVIEW"),
      type: asString(b?.type ?? "PARAGRAPH"),
      sortOrder: toIntOrNull(b?.sortOrder) ?? 0,
      text: asString(b?.text ?? ""),
      imageUrl: asString(b?.imageUrl ?? b?.image ?? ""),
      imageCaption: asString(b?.imageCaption ?? ""),
      mapLon: b?.mapLon ?? (Array.isArray(b?.map) ? b.map[0] : ""),
      mapLat: b?.mapLat ?? (Array.isArray(b?.map) ? b.map[1] : ""),
    })),

    amenities: asArray(raw?.amenityCodes ?? raw?.amenities ?? []),

    taxConfig: {
      defaultVatPercent: asString(raw?.taxConfig?.defaultVatPercent ?? f.taxConfig.defaultVatPercent),
      defaultServiceFeePercent: asString(
        raw?.taxConfig?.defaultServiceFeePercent ?? f.taxConfig.defaultServiceFeePercent
      ),
      showPricePreTax: !!raw?.taxConfig?.showPricePreTax,
    },

    bookingConfig: {
      allowFullPayment: raw?.bookingConfig?.allowFullPayment !== false,
      allowDeposit: !!raw?.bookingConfig?.allowDeposit,
      depositPercent: asString(raw?.bookingConfig?.depositPercent ?? ""),
      freeCancelMinutes: asString(raw?.bookingConfig?.freeCancelMinutes ?? ""),
    },

    roomTypes: asArray(raw?.roomTypes ?? []).map((r) => ({
      // giữ lại theo FE model tối thiểu, buildPayload sẽ map sang BE model
      id: asString(r?.id ?? ""),
      name: asString(r?.name),
      code: asString(r?.code ?? ""),
      codeManual: true,
      description: asString(r?.description ?? ""),
      areaM2: r?.areaSqm == null ? "" : String(r.areaSqm),
      maxAdults: Number(r?.maxAdults ?? 2),
      maxChildren: Number(r?.maxChildren ?? 0),
      quantity: Number(r?.totalRooms ?? 1),
      beds: asArray(r?.bedOptions ?? []).map((b) => ({
        type: asString(b?.type ?? "DOUBLE"),
        count: Number(b?.count ?? 1),
      })),
      images: mapImages(r?.images ?? []),
      amenities: asArray(r?.amenityCodes ?? []),
      ratePlans: asArray(r?.ratePlans ?? []).map((p) => ({
        id: asString(p?.id ?? ""),
        name: asString(p?.name),
        code: asString(p?.code ?? ""),
        boardType: asString(p?.boardType ?? "ROOM_ONLY"),
        paymentType: asString(p?.paymentType ?? "PREPAID"),
        refundable: !!p?.refundable,
        cancellationPolicy: asString(p?.cancellationPolicy ?? ""),
        pricePerNight: p?.pricePerNight == null ? "" : String(p.pricePerNight),
        referencePricePerNight: p?.referencePricePerNight == null ? "" : String(p.referencePricePerNight),
        discountPercent: p?.discountPercent == null ? "" : String(p.discountPercent),
        taxPercent: p?.taxPercent == null ? "" : String(p.taxPercent),
        serviceFeePercent: p?.serviceFeePercent == null ? "" : String(p.serviceFeePercent),
        priceIncludesTax: p?.priceIncludesTax !== false,
        priceIncludesServiceFee: p?.priceIncludesServiceFee !== false,
        promoLabel: asString(p?.promoLabel ?? ""),
        showLowAvailability: !!p?.showLowAvailability,
        lengthOfStayDiscounts: asArray(p?.lengthOfStayDiscounts ?? []),
      })),
    })),

    moderation: {
      status: asString(raw?.moderation?.status ?? f.moderation.status),
      pendingReason: asString(raw?.moderation?.pendingReason ?? f.moderation.pendingReason),
      rejectionReason: asString(raw?.moderation?.rejectionReason ?? ""),
      blockedReason: asString(raw?.moderation?.blockedReason ?? ""),
      unlockRequestReason: asString(raw?.moderation?.unlockRequestReason ?? ""),
    },
    active: raw?.active !== false,
  };
}

// mode: "create" | "edit"
export function buildHotelPayload(form, { mode = "create" } = {}) {
  const lon = toNum(form.locationLon);
  const lat = toNum(form.locationLat);

  const ci = toHHmm(form.defaultCheckInTime);
  const co = toHHmm(form.defaultCheckOutTime);

  const tax = form.taxConfig || {};
  const booking = form.bookingConfig || {};

  // ✅ policy items from textarea
  const policyItems = [];
  if (asString(form.policies).trim()) {
    policyItems.push({
      section: "OTHER",
      title: "Chính sách",
      content: asString(form.policies).trim(),
    });
  }
  if (asString(form.extraInfo).trim()) {
    policyItems.push({
      section: "OTHER",
      title: "Thông tin thêm",
      content: asString(form.extraInfo).trim(),
    });
  }

  const payload = {
    name: asString(form.name).trim(),
    slug: asString(form.slug).trim(),
    hotelType: asString(form.hotelType || "HOTEL"),
    starRating: toIntOrNull(form.starRating) ?? 1,

    shortDescription: asString(form.shortDescription),
    description: asString(form.description),

    phone: asString(form.phone),
    email: asString(form.email),
    website: asString(form.website),

    // ✅ times root (DTO có)
    defaultCheckInTime: ci || null,
    defaultCheckOutTime: co || null,

    destinationSlug: asString(form.destinationSlug).trim(),
    cityName: asString(form.cityName),
    districtName: asString(form.districtName),
    wardName: asString(form.wardName),
    addressLine: asString(form.addressLine),

    location: lon != null && lat != null ? [lon, lat] : null,

    images: mapImages(form.images),

    content: asArray(form.content).map((b, idx) => ({
      section: asString(b?.section ?? "OVERVIEW"),
      type: asString(b?.type ?? "PARAGRAPH"),
      sortOrder: toIntOrNull(b?.sortOrder) ?? idx,
      text: asString(b?.text ?? ""),
      imageUrl: asString(b?.imageUrl ?? ""),
      imageCaption: asString(b?.imageCaption ?? ""),
      mapLon: b?.mapLon ?? "",
      mapLat: b?.mapLat ?? "",
    })),

    amenityCodes: asArray(form.amenities).map(pickAmenityCode).filter(Boolean),

    taxConfig: {
      defaultVatPercent: toDecOrNull(tax.defaultVatPercent),
      defaultServiceFeePercent: toDecOrNull(tax.defaultServiceFeePercent),
      showPricePreTax: !!tax.showPricePreTax,
    },

    bookingConfig: {
      allowFullPayment: booking.allowFullPayment !== false,
      allowDeposit: !!booking.allowDeposit,
      depositPercent: toDecOrNull(booking.depositPercent),
      freeCancelMinutes: toIntOrNull(booking.freeCancelMinutes),
    },

    // ✅ policy DTO
    policy: {
      checkInFrom: ci || null,
      checkOutUntil: co || null,
      items: policyItems,
    },

    roomTypes: asArray(form.roomTypes).map((r) => {
      const beds = asArray(r?.beds);
      const bedType = inferBedType(beds);
      const bCount = bedsCount(beds);

      const maxAdults = toIntOrNull(r?.maxAdults) ?? 2;
      const maxChildren = toIntOrNull(r?.maxChildren) ?? 0;
      const maxGuests = maxAdults + maxChildren;

      const desc = asString(r?.description ?? "").trim();

      return {
        id: asString(r?.id).trim() || null,
        name: asString(r?.name).trim(),

        // ✅ NEW: map mô tả phòng
        shortDescription: desc ? desc.slice(0, 120) : null, // hoặc để null nếu bạn không dùng
        description: desc || null,

        areaSqm: toDecOrNull(r?.areaM2),
        bedType,
        bedsCount: bCount,
        bedOptions: beds.map((b) => ({
          type: upper(b?.type || "DOUBLE"),
          count: Math.max(1, toIntOrNull(b?.count) ?? 1),
        })),
        maxAdults,
        maxChildren,
        maxGuests,
        totalRooms: Math.max(0, toIntOrNull(r?.quantity) ?? 0),

        images: mapImages(r?.images ?? []),
        amenityCodes: asArray(r?.amenities).map(pickAmenityCode).filter(Boolean),

        ratePlans: asArray(r?.ratePlans).map((p) => ({
          id: asString(p?.id).trim() || null,
          name: asString(p?.name).trim(),
          boardType: asString(p?.boardType ?? "ROOM_ONLY"),
          paymentType: asString(p?.paymentType ?? "PREPAID"),
          refundable: !!p?.refundable,
          cancellationPolicy: asString(p?.cancellationPolicy ?? ""),

          pricePerNight: toDecOrNull(p?.pricePerNight),
          referencePricePerNight: toDecOrNull(p?.referencePricePerNight),
          discountPercent: toIntOrNull(p?.discountPercent),

          taxPercent: toDecOrNull(p?.taxPercent),
          serviceFeePercent: toDecOrNull(p?.serviceFeePercent),

          priceIncludesTax: p?.priceIncludesTax !== false,
          priceIncludesServiceFee: p?.priceIncludesServiceFee !== false,

          promoLabel: asString(p?.promoLabel ?? ""),
          showLowAvailability: !!p?.showLowAvailability,

          lengthOfStayDiscounts: asArray(p?.lengthOfStayDiscounts ?? []).map((x) => ({
            minNights: Math.max(0, toIntOrNull(x?.minNights) ?? 0),
            discountPercent: toIntOrNull(x?.discountPercent ?? x?.percent),
          })),
        })),
      };
    }),

    moderation: {
      status: asString(form?.moderation?.status || "PENDING_REVIEW"),
      pendingReason: asString(
        form?.moderation?.pendingReason || (mode === "edit" ? "UPDATE" : "CREATE")
      ),
      rejectionReason: asString(form?.moderation?.rejectionReason ?? ""),
      blockedReason: asString(form?.moderation?.blockedReason ?? ""),
      unlockRequestReason: asString(form?.moderation?.unlockRequestReason ?? ""),
    },

    active: form?.active !== false,
  };

  return payload;
}