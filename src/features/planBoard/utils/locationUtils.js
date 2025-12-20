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
