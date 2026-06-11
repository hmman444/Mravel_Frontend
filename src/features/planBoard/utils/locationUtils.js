// src/features/planBoard/utils/locationUtils.js

export const getLocDisplayLabel = (loc, fallback = "") => {
  if (!loc) return fallback;
  return (
    loc.name ||
    loc.label ||
    loc.fullAddress ||
    loc.formattedAddress ||
    loc.address ||
    fallback
  );
};

export const slimLocationForStorage = (loc) => {
  if (!loc) return null;

  const placeId = loc.placeId || loc.id || null;

  const name =
    loc.name ||
    loc.label ||
    ""; // tên hiển thị

  // 1 trường địa chỉ đầy đủ
  const fullAddress =
    loc.fullAddress ||
    loc.formattedAddress ||
    loc.address ||
    "";

  return {
    type: loc.type || "PLACE",
    placeId,
    name,
    fullAddress,
    lat: loc.lat ?? null,
    lng: loc.lng ?? null,
  };
};

// Picker tabs = catalog kinds the picker can focus.
const PICKER_TYPES = ["HOTEL", "RESTAURANT", "PLACE"];

/**
 * Build a focusable location from an AI card's `recommendation` block.
 * Used as a fallback for cards created before the backend started writing the
 * type-specific location key (hotelLocation/restaurantLocation/sightLocation):
 * the recommendation already carries the catalog id/slug/name/coords, which is
 * everything the place picker needs to pre-select and scroll to the right row.
 *
 * @param {object|null} rec - activityData.recommendation
 * @param {{ fallbackType?: string, address?: string }} opts
 */
export const locationFromRecommendation = (rec, opts = {}) => {
  if (!rec) return null;
  const { fallbackType = "PLACE", address = "" } = opts;

  const placeId =
    rec.id || rec.catalog_id || rec.slug || rec.catalog_slug || null;
  const name = rec.name || "";
  if (!placeId && !name) return null;

  const kind = String(rec.kind || rec.catalog_kind || "").toUpperCase();
  const type = PICKER_TYPES.includes(kind) ? kind : fallbackType;

  return normalizeLocationFromStored({
    type,
    placeId,
    name,
    fullAddress: address || rec.address || rec.fullAddress || "",
    lat: rec.latitude ?? rec.lat ?? null,
    lng: rec.longitude ?? rec.lng ?? null,
  });
};

export const normalizeLocationFromStored = (loc) => {
  if (!loc) return null;

  // data mới (slim)
  if (
    loc.placeId !== undefined ||
    loc.lat !== undefined ||
    loc.lng !== undefined
  ) {
    const name = loc.name || loc.label || "";
    const fullAddress =
      loc.fullAddress ||
      loc.formattedAddress ||
      loc.address ||
      "";

    return {
      type: loc.type || "PLACE",
      id: loc.placeId || loc.id || null,       
      placeId: loc.placeId || loc.id || null,
      name,
      label: loc.label || name,
      fullAddress,
      address: fullAddress,                   
      lat: loc.lat ?? null,
      lng: loc.lng ?? null,
    };
  }

  const name = getLocDisplayLabel(loc, "");
  const fullAddress =
    loc.fullAddress ||
    loc.formattedAddress ||
    loc.address ||
    "";

  return {
    type: loc.type || "PLACE",
    id: loc.id || null,
    placeId: loc.id || null,
    name,
    label: name,
    fullAddress,
    address: fullAddress,
    lat: loc.lat ?? null,
    lng: loc.lng ?? null,
  };
};
