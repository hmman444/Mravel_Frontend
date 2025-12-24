// src/features/partner/services/geocodeService.js
import axios from "axios";

function buildQueryAddress({ addressLine, wardName, districtName, cityName }) {
  const parts = [addressLine, wardName, districtName, cityName, "Việt Nam"]
    .map((x) => String(x || "").trim())
    .filter(Boolean);
  return parts.join(", ");
}

export async function geocodeByAddress(form) {
  const q = buildQueryAddress(form);
  if (!q || q.length < 8) return null;

  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      format: "json",
      q,
      limit: 1,
      addressdetails: 1,
    },
    // Nominatim khuyến nghị có User-Agent/Referer; browser hạn chế set UA,
    // nhưng vẫn thường chạy được trong đồ án.
    headers: { "Accept-Language": "vi" },
  });

  const item = Array.isArray(res.data) ? res.data[0] : null;
  if (!item) return null;

  const lat = Number(item.lat);
  const lng = Number(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat,
    lng,
    displayName: item.display_name,
  };
}