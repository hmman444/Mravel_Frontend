export function normalizePlaceToForm(place) {
  // Ưu tiên location nếu có, fallback qua longitude/latitude
  let lon = "";
  let lat = "";

  if (Array.isArray(place?.location) && place.location.length >= 2) {
    lon = place.location?.[0] ?? "";
    lat = place.location?.[1] ?? "";
  } else {
    // API admin của bạn trả về longitude/latitude
    const lon2 = place?.longitude;
    const lat2 = place?.latitude;
    lon = lon2 === undefined || lon2 === null ? "" : String(lon2);
    lat = lat2 === undefined || lat2 === null ? "" : String(lat2);
  }

  return {
    id: place?.id ?? null,
    active: place?.active ?? true,
    kind: place?.kind ?? "DESTINATION",
    venueType: place?.venueType ?? null,
    parentSlug: place?.parentSlug ?? "",
    ancestors: Array.isArray(place?.ancestors) ? place.ancestors : [],
    childrenCount: place?.childrenCount ?? 0,

    name: place?.name ?? "",
    slug: place?.slug ?? "",
    shortDescription: place?.shortDescription ?? "",
    description: place?.description ?? "",

    phone: place?.phone ?? "",
    email: place?.email ?? "",
    website: place?.website ?? "",

    addressLine: place?.addressLine ?? "",
    countryCode: place?.countryCode ?? "VN",
    provinceName: place?.provinceName ?? "",
    districtName: place?.districtName ?? "",
    wardName: place?.wardName ?? "",

    lon,
    lat,

    images: Array.isArray(place?.images)
      ? place.images.map((im, idx) => ({
          url: im?.url ?? "",
          caption: im?.caption ?? "",
          cover: !!im?.cover,
          sortOrder: typeof im?.sortOrder === "number" ? im.sortOrder : idx,
        }))
      : [],

    content: Array.isArray(place?.content)
      ? place.content.map((b) => {
          const t = (b?.type || b?.blockType || "").toString().toUpperCase();

          // hỗ trợ INFOBOX => INFO
          if (t.includes("INFOBOX")) return { type: "INFO", text: b?.text ?? "" };

          if (t.includes("HEADING")) return { type: "HEADING", text: b?.text ?? "" };
          if (t.includes("PARAGRAPH")) return { type: "PARAGRAPH", text: b?.text ?? "" };
          if (t.includes("QUOTE")) return { type: "QUOTE", text: b?.text ?? "" };
          if (t.includes("INFO")) return { type: "INFO", text: b?.text ?? "" };
          if (t.includes("DIVIDER")) return { type: "DIVIDER" };

          if (t.includes("MAP")) {
            // hỗ trợ nhiều dạng map field
            // 1) mapLocation: [lon,lat] hoặc {lon,lat}
            // 2) mapLon/mapLat (như API bạn trả)
            const ml = b?.mapLocation || b?.map || b?.location || b?.coords;
            const lonA = Array.isArray(ml) ? ml[0] : ml?.lon;
            const latA = Array.isArray(ml) ? ml[1] : ml?.lat;

            const lonB = b?.mapLon ?? b?.lon ?? b?.longitude;
            const latB = b?.mapLat ?? b?.lat ?? b?.latitude;

            const lon2 = lonA ?? lonB;
            const lat2 = latA ?? latB;

            return {
              type: "MAP",
              mapLocation: {
                lon: lon2 === undefined || lon2 === null ? "" : String(lon2),
                lat: lat2 === undefined || lat2 === null ? "" : String(lat2),
              },
            };
          }

          if (t.includes("GALLERY")) {
            const g = b?.gallery || b?.images || [];
            return {
              type: "GALLERY",
              gallery: Array.isArray(g)
                ? g.map((x, idx) => ({
                    url: x?.url ?? "",
                    caption: x?.caption ?? "",
                    sortOrder: typeof x?.sortOrder === "number" ? x.sortOrder : idx,
                  }))
                : [{ url: "", caption: "", sortOrder: 0 }],
            };
          }

          if (t.includes("IMAGE")) {
            const im = b?.image || b?.img || b;
            return {
              type: "IMAGE",
              image: { url: im?.url ?? "", caption: im?.caption ?? "" },
            };
          }

          return { type: "PARAGRAPH", text: b?.text ?? "" };
        })
      : [],
  };
}


export function buildPayloadFromForm(form) {
  const lon = form.lon === "" ? null : Number(form.lon);
  const lat = form.lat === "" ? null : Number(form.lat);
  const location =
    lon === null || lat === null || Number.isNaN(lon) || Number.isNaN(lat) ? null : [lon, lat];

  const images = (form.images || [])
    .filter((im) => (im?.url || "").trim() !== "")
    .map((im, idx) => ({
      url: im.url.trim(),
      caption: (im.caption || "").trim(),
      cover: !!im.cover,
      sortOrder: typeof im.sortOrder === "number" ? im.sortOrder : idx,
    }));

  if (images.length > 0 && !images.some((x) => x.cover)) images[0].cover = true;

  const content = (form.content || []).map((b) => {
    const t = (b?.type || "").toUpperCase();
    if (t === "HEADING") return { type: "HEADING", text: b.text || "" };
    if (t === "PARAGRAPH") return { type: "PARAGRAPH", text: b.text || "" };
    if (t === "QUOTE") return { type: "QUOTE", text: b.text || "" };
    if (t === "INFO") return { type: "INFO", text: b.text || "" };
    if (t === "DIVIDER") return { type: "DIVIDER" };

    if (t === "MAP") {
      const lon2 = b?.mapLocation?.lon === "" ? null : Number(b?.mapLocation?.lon);
      const lat2 = b?.mapLocation?.lat === "" ? null : Number(b?.mapLocation?.lat);
      return {
        type: "MAP",
        mapLocation:
          lon2 === null || lat2 === null || Number.isNaN(lon2) || Number.isNaN(lat2)
            ? null
            : [lon2, lat2],
      };
    }

    if (t === "IMAGE") {
      const url = (b?.image?.url || "").trim();
      const caption = (b?.image?.caption || "").trim();
      return { type: "IMAGE", image: { url, caption } };
    }

    if (t === "GALLERY") {
      const g = (b?.gallery || [])
        .filter((x) => (x?.url || "").trim() !== "")
        .map((x, idx) => ({
          url: x.url.trim(),
          caption: (x.caption || "").trim(),
          sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : idx,
        }));
      return { type: "GALLERY", gallery: g };
    }

    return { type: "PARAGRAPH", text: b?.text || "" };
  });

  return {
    active: !!form.active,
    kind: form.kind,
    venueType: form.venueType ?? null,
    parentSlug: form.kind === "DESTINATION" ? null : (form.parentSlug || null),

    name: (form.name || "").trim(),
    slug: (form.slug || "").trim(),

    shortDescription: (form.shortDescription || "").trim(),
    description: (form.description || "").trim(),

    phone: (form.phone || "").trim() || null,
    email: (form.email || "").trim() || null,
    website: (form.website || "").trim() || null,

    addressLine: (form.addressLine || "").trim() || null,
    countryCode: (form.countryCode || "VN").trim(),
    provinceName: (form.provinceName || "").trim() || null,
    districtName: (form.districtName || "").trim() || null,
    wardName: (form.wardName || "").trim() || null,

    location,
    images,
    content,
  };
}
