// trả về [ { lat, lng, role } ] cho 1 card
export function getPointsFromCard(card) {
  if (!card.activityDataJson) return [];

  let data;
  try {
    data = JSON.parse(card.activityDataJson);
  } catch {
    return [];
  }

  // PRIORITY: từ PlacePickerModal mình thấy đang dùng lat/lng
  const safe = (loc) => {
    if (!loc) return null;
    const lat =
      loc.lat ?? loc.latitude ?? loc.latLng?.lat ?? null;
    const lng =
      loc.lng ?? loc.lon ?? loc.longitude ?? loc.latLng?.lng ?? null;

    if (typeof lat === "number" && typeof lng === "number") {
      return { lat, lng };
    }
    return null;
  };

  if (card.activityType === "TRANSPORT") {
    const from = safe(data.fromLocation);
    const to = safe(data.toLocation);
    const pts = [];
    if (from) pts.push({ ...from, role: "FROM" });
    if (to) pts.push({ ...to, role: "TO" });
    return pts;
  }

  // Các loại khác 1 điểm
  const loc =
    safe(data.location) ||
    safe(data.placeLocation) ||
    safe(data.stayLocation) ||
    safe(data.hotelLocation) ||
    safe(data.place) ||
    null;

  if (loc) return [{ ...loc, role: "POINT" }];
  return [];
}

// cho LIST
export function buildMapItemsForList(list) {
  if (!list || !list.cards) return [];

  return list.cards
    .map((card) => {
      const points = getPointsFromCard(card);
      if (!points.length) return null;

      const timeLabel =
        card.startTime || card.endTime
          ? `${card.startTime?.slice(0, 5) || "?"} - ${
              card.endTime?.slice(0, 5) || "?"
            }`
          : "";

      return {
        cardId: card.id,
        listId: list.id,
        listLabel: list.title || "",
        activityType: card.activityType,
        title: card.text || "Hoạt động",
        subtitle: (() => {
          if (!dataSafe(card)) return "";
          const d = JSON.parse(card.activityDataJson || "{}");
          if (card.activityType === "TRANSPORT") {
            const from = d.fromPlace || d.from || "";
            const to = d.toPlace || d.to || "";
            if (from && to) return `${from} → ${to}`;
            return from || to || "";
          }
          return d.placeName || d.restaurantName || d.hotelName || d.location || "";
        })(),
        timeLabel,
        color: pickColor(card.activityType),
        points,
      };
    })
    .filter(Boolean);
}

function dataSafe(card) {
  return !!card.activityDataJson;
}

function pickColor(type) {
  switch (type) {
    case "TRANSPORT":
      return "#0ea5e9"; // sky
    case "FOOD":
      return "#f97316"; // orange
    case "STAY":
      return "#8b5cf6"; // violet
    case "ENTERTAIN":
      return "#10b981"; // emerald
    case "SIGHTSEEING":
      return "#f59e0b"; // amber
    case "SHOPPING":
      return "#ec4899"; // pink
    case "CINEMA":
      return "#fb7185"; // rose
    case "EVENT":
      return "#6366f1"; // indigo
    default:
      return "#64748b"; // slate
  }
}

// cho PLAN (gom tất cả list thường, bỏ TRASH)
export function buildMapItemsForPlan(lists) {
  return lists
    .filter((l) => l.type !== "TRASH")
    .flatMap((list) => buildMapItemsForList(list));
}
