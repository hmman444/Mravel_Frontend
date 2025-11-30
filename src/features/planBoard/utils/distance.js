// src/utils/distance.js
export function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Tính khoảng cách đường chim bay giữa 2 điểm (lat/lng) theo km
 * a = { lat: number, lng: number }
 * b = { lat: number, lng: number }
 */
export function haversineDistanceKm(a, b) {
  if (
    !a ||
    !b ||
    a.lat == null ||
    a.lng == null ||
    b.lat == null ||
    b.lng == null
  ) {
    return null;
  }

  const R = 6371; // bán kính Trái đất (km)
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lng - a.lng);

  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinLat * sinLat +
          Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon
      )
    );

  const distance = R * c;
  return distance; // km
}
