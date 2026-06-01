// src/features/planBoard/utils/roadRouting.js
//
// Lấy ĐƯỜNG ĐI THẬT (bám theo đường, gấp khúc) giữa 2 toạ độ bằng OSRM
// (Open Source Routing Machine) - dịch vụ công khai, miễn phí, không cần API key.
//
// Trả về danh sách điểm [lat, lng] để vẽ Polyline trên Leaflet.
// Nếu lỗi mạng / không định tuyến được -> trả null để caller fallback đường thẳng.

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// cache trong phiên để không gọi lại OSRM cho cùng 1 chặng (tránh rate-limit)
const routeCache = new Map();

function keyOf(from, to) {
  return `${from.lat.toFixed(5)},${from.lng.toFixed(5)};${to.lat.toFixed(
    5
  )},${to.lng.toFixed(5)}`;
}

/**
 * @param {{lat:number, lng:number}} from
 * @param {{lat:number, lng:number}} to
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<{path:[number,number][], distanceKm:number, durationMin:number}|null>}
 */
export async function fetchRoadRoute(from, to, { signal } = {}) {
  if (
    !from ||
    !to ||
    from.lat == null ||
    from.lng == null ||
    to.lat == null ||
    to.lng == null
  ) {
    return null;
  }

  const key = keyOf(from, to);
  if (routeCache.has(key)) return routeCache.get(key);

  // OSRM nhận thứ tự lng,lat
  const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;

    const json = await res.json();
    if (json.code !== "Ok" || !Array.isArray(json.routes) || !json.routes.length) {
      return null;
    }

    const route = json.routes[0];
    const coords = route.geometry?.coordinates || [];
    if (coords.length < 2) return null;

    // GeoJSON trả [lng, lat] -> Leaflet cần [lat, lng]
    const path = coords.map(([lng, lat]) => [lat, lng]);

    const result = {
      path,
      distanceKm: (route.distance || 0) / 1000,
      durationMin: (route.duration || 0) / 60,
    };

    routeCache.set(key, result);
    return result;
  } catch (err) {
    // AbortError (component unmount) hoặc lỗi mạng -> để caller fallback
    if (err?.name === "AbortError") return null;
    return null;
  }
}
