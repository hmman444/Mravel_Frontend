"use client";

import { useMemo, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaRoute,
  FaCalendarAlt,
} from "react-icons/fa";

const TYPE_STYLES = {
  TRANSPORT: {
    icon: "🚕",
    label: "Di chuyển",
  },
  FOOD: {
    icon: "🥘",
    label: "Ăn uống",
  },
  STAY: {
    icon: "🛏️",
    label: "Nghỉ ngơi",
  },
  ENTERTAIN: {
    icon: "🎡",
    label: "Vui chơi",
  },
  SIGHTSEEING: {
    icon: "🏛️",
    label: "Tham quan",
  },
  SHOPPING: {
    icon: "🛍️",
    label: "Mua sắm",
  },
  CINEMA: {
    icon: "🎬",
    label: "Xem phim",
  },
  EVENT: {
    icon: "🎤",
    label: "Sự kiện",
  },
  OTHER: {
    icon: "📝",
    label: "Hoạt động",
  },
};

const addressIcon = L.divIcon({
  className: "mravel-map-pin",
  html: `
    <div class="mravel-map-pin-inner">
      <svg viewBox="0 0 24 24" class="mravel-map-pin-svg">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5
             c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5
             s2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z"
          fill="currentColor"
        />
      </svg>
    </div>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 30],
});

function AutoFitBounds({ bounds, fallbackCenter }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (fallbackCenter) {
      map.setView([fallbackCenter.lat, fallbackCenter.lng], 13);
    }
  }, [map, bounds, fallbackCenter]);

  return null;
}

function parseActivityData(card) {
  if (!card?.activityDataJson) return {};
  try {
    return JSON.parse(card.activityDataJson);
  } catch {
    return {};
  }
}

/**
 * Chuẩn hoá location cho các loại activity KHÁC TRANSPORT
 */
function extractLocationForMap(card) {
  const data = parseActivityData(card);
  let loc = null;

  switch (card.activityType) {
    case "FOOD":
      loc = data.restaurantLocation || data.placeLocation || null;
      break;
    case "STAY":
      loc = data.hotelLocation || data.stayLocation || data.placeLocation || null;
      break;
    case "SHOPPING":
      loc = data.shoppingLocation || data.placeLocation || null;
      break;
    case "SIGHTSEEING":
      loc = data.sightseeingLocation || data.placeLocation || null;
      break;
    case "ENTERTAIN":
      loc = data.entertainLocation || data.placeLocation || null;
      break;
    case "CINEMA":
      loc = data.cinemaLocation || data.placeLocation || null;
      break;
    case "EVENT":
      loc = data.eventLocation || data.placeLocation || null;
      break;
    default:
      break;
  }

  // fallback quét object
  if (!loc || loc.lat == null || loc.lng == null) {
    const values = Object.values(data || {});
    loc =
      values.find(
        (v) =>
          v &&
          typeof v === "object" &&
          v.lat != null &&
          v.lng != null
      ) || null;
  }

  if (!loc || loc.lat == null || loc.lng == null) {
    return { data, location: null };
  }

  const name =
    loc.label ||
    loc.name ||
    data.hotelName ||
    data.restaurantName ||
    data.storeName ||
    data.placeName ||
    card.text ||
    card.title ||
    "Hoạt động";

  const address =
    loc.address ||
    loc.fullAddress ||
    data.address ||
    data.locationAddress ||
    (typeof data.location === "string" ? data.location : "") ||
    "";

  return {
    data,
    location: {
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      name,
      address,
    },
  };
}

export default function PlanDayMapModal({ open, onClose, list, dayIndex }) {
  const [hoverId, setHoverId] = useState(null);

  const { points, segments, sequentialSegments, center, bounds } = useMemo(() => {
    if (!list) {
      return {
        points: [],
        segments: [],
        sequentialSegments: [],
        center: { lat: 16.047079, lng: 108.20623 },
        bounds: null,
      };
    }

    const pts = [];
    const segs = [];

    list.cards?.forEach((card) => {
      const data = parseActivityData(card);

      // transport riêng: chia 2 địa điểm thành 2 node
      if (card.activityType === "TRANSPORT") {
        const fromLoc = data.fromLocation;
        const toLoc = data.toLocation;

        // chuẩn hoá tên và địa chỉ để dùng chung
        const fromName =
          data.fromPlace ||
          (fromLoc && (fromLoc.label || fromLoc.name)) ||
          card.text ||
          card.title ||
          "Điểm đi";

        const toName =
          data.toPlace ||
          (toLoc && (toLoc.label || toLoc.name)) ||
          card.text ||
          card.title ||
          "Điểm đến";

        const fromAddress =
          (fromLoc &&
            (fromLoc.address ||
              fromLoc.fullAddress ||
              fromLoc.displayName)) ||
          "";

        const toAddress =
          (toLoc &&
            (toLoc.address ||
              toLoc.fullAddress ||
              toLoc.displayName)) ||
          "";

        const routeTitle = `${fromName} → ${toName}`;

        // node FROM
        if (
          fromLoc &&
          fromLoc.lat != null &&
          fromLoc.lng != null
        ) {
          pts.push({
            id: `${card.id}-from`,
            parentId: card.id, // để hover theo card
            lat: Number(fromLoc.lat),
            lng: Number(fromLoc.lng),
            title: fromName,
            label: fromAddress,
            routeTitle,
            type: "TRANSPORT_FROM",
            startTime: card.startTime,
            endTime: card.endTime,
          });
        }

        // node TO
        if (
          toLoc &&
          toLoc.lat != null &&
          toLoc.lng != null
        ) {
          pts.push({
            id: `${card.id}-to`,
            parentId: card.id,
            lat: Number(toLoc.lat),
            lng: Number(toLoc.lng),
            title: toName,
            label: toAddress,
            routeTitle,
            type: "TRANSPORT_TO",
            startTime: card.startTime,
            endTime: card.endTime,
          });
        }

        // đường đi
        let positions = null;

        if (
          Array.isArray(data.routePath) &&
          data.routePath.length >= 2
        ) {
          positions = data.routePath.map((pt) => [Number(pt.lat), Number(pt.lng)]);
        } else if (
          fromLoc &&
          toLoc &&
          fromLoc.lat != null &&
          fromLoc.lng != null &&
          toLoc.lat != null &&
          toLoc.lng != null
        ) {
          // fallback: nối thẳng A → B (đường chim bay)
          positions = [
            [Number(fromLoc.lat), Number(fromLoc.lng)],
            [Number(toLoc.lat), Number(toLoc.lng)],
          ];
        }

        if (positions) {
          segs.push({
            id: card.id,
            positions,
          });
        }

        return; // xong TRANSPORT, không chạy tiếp phần dưới
      }

      // các hoạt động khác
      const { location } = extractLocationForMap(card);

      if (location) {
        const label = (() => {
          if (card.activityType === "FOOD") {
            return (
              data.restaurantName ||
              data.placeName ||
              location.name ||
              ""
            );
          }
          if (card.activityType === "STAY") {
            return (
              data.stayName ||
              data.hotelName ||
              data.placeName ||
              location.name ||
              ""
            );
          }
          if (card.activityType === "SHOPPING") {
            return data.storeName || data.placeName || location.name || "";
          }
          if (
            card.activityType === "SIGHTSEEING" ||
            card.activityType === "ENTERTAIN" ||
            card.activityType === "CINEMA" ||
            card.activityType === "EVENT"
          ) {
            return data.placeName || location.name || "";
          }
          return location.name || "";
        })();

        pts.push({
          id: card.id,
          parentId: card.id,
          lat: location.lat,
          lng: location.lng,
          title: card.text || card.title || location.name || "Hoạt động",
          label,
          address: location.address || "",
          type: card.activityType || "OTHER",
          startTime: card.startTime,
          endTime: card.endTime,
        });
      }
    });

    // nét đứt giữa các activity 
    const seqSegs = [];
    if (pts.length > 1) {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];

        const diff =
          Math.abs(a.lat - b.lat) + Math.abs(a.lng - b.lng);
        if (diff < 1e-6) continue;

        seqSegs.push({
          id: `${a.id}-${b.id}`,
          positions: [
            [a.lat, a.lng],
            [b.lat, b.lng],
          ],
        });
      }
    }

    // Tính center tạm
    const center =
      pts.length > 0
        ? {
            lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
            lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
          }
        : { lat: 16.047079, lng: 108.20623 };

    // Tính bounds
    const allLatLngs = [];
    pts.forEach((p) => allLatLngs.push([p.lat, p.lng]));
    [...segs, ...seqSegs].forEach((seg) => {
      seg.positions.forEach(([lat, lng]) => allLatLngs.push([lat, lng]));
    });

    let bounds = null;
    if (allLatLngs.length > 0) {
      let minLat = allLatLngs[0][0];
      let maxLat = allLatLngs[0][0];
      let minLng = allLatLngs[0][1];
      let maxLng = allLatLngs[0][1];

      for (const [lat, lng] of allLatLngs) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }

      bounds = [
        [minLat, minLng],
        [maxLat, maxLng],
      ];
    }

    return { points: pts, segments: segs, sequentialSegments: seqSegs, center, bounds };
  }, [list]);

  // Số hoạt động có vị trí (gộp from/to của 1 transport thành 1)
  const locationActivityCount = useMemo(() => {
    const s = new Set(points.map((p) => p.parentId));
    return s.size;
  }, [points]);

  if (!open || !list) return null;

  const title = list.title || `Ngày ${dayIndex + 1}`;
  const formatTime = (t) =>
    t ? String(t).split(":").slice(0, 2).join(":") : "";

  const getBaseType = (type) => {
    if (!type) return "OTHER";
    if (type.startsWith("TRANSPORT")) return "TRANSPORT";
    return TYPE_STYLES[type] ? type : "OTHER";
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-3 sm:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden"
          initial={{ y: 20, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-9 w-9 rounded-2xl bg-sky-500/90 text-white flex items-center justify-center shadow-md shadow-sky-500/40">
                <FaMapMarkerAlt />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 truncate">
                  Bản đồ trong ngày
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                    <FaCalendarAlt size={10} />
                    {title}
                  </span>
                  <span>
                    Có <b>{locationActivityCount} hoạt động</b> có vị trí trên bản đồ.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:bg-rose-500 hover:text-white shadow-md transition"
            >
              <FaTimes size={13} />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col md:flex-row">
            {/* MAP */}
            <div
              className="
                md:w-2/3 
                h-[260px] md:h-[480px]
                border-b md:border-b-0 md:border-r 
                border-slate-200 dark:border-slate-800
              "
            >
              <MapContainer
                key={list.id}
                center={[center.lat, center.lng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <AutoFitBounds bounds={bounds} fallbackCenter={center} />

                {/* Đường TRANSPORT (A → B) */}
                {segments.map((seg) => (
                  <Polyline
                    key={seg.id}
                    positions={seg.positions}
                    pathOptions={{
                      color: "#0ea5e9",
                      weight: hoverId && hoverId === seg.id ? 5 : 4,
                      opacity: hoverId && hoverId !== seg.id ? 0.3 : 0.9,
                    }}
                  />
                ))}

                {/* Đường tuần tự giữa các node */}
                {sequentialSegments.map((seg) => (
                  <Polyline
                    key={`seq-${seg.id}`}
                    positions={seg.positions}
                    pathOptions={{
                      color: "#64748b",
                      weight: 2.5,
                      opacity: 0.7,
                      dashArray: "6 8",
                    }}
                  />
                ))}

                {/* Marker đỏ cho từng node (kể cả from/to) */}
                {points.map((p) => {
                  // Ưu tiên tooltip của TRANSPORT nếu trùng toạ độ
                  const relatedTransport =
                    !p.type?.startsWith("TRANSPORT")
                      ? points.find(
                          (q) =>
                            q.parentId !== p.parentId &&
                            q.type &&
                            q.type.startsWith("TRANSPORT") &&
                            Math.abs(q.lat - p.lat) < 1e-6 &&
                            Math.abs(q.lng - p.lng) < 1e-6
                        )
                      : null;

                  const displayPoint = relatedTransport || p;
                  const baseType = getBaseType(displayPoint.type);
                  const typeStyle = TYPE_STYLES[baseType] || TYPE_STYLES.OTHER;

                  return (
                    <Marker
                      key={p.id}
                      position={[p.lat, p.lng]}
                      icon={addressIcon}
                      opacity={hoverId && hoverId !== p.parentId ? 0.7 : 1}
                      zIndexOffset={hoverId === p.parentId ? 500 : 0}
                    >
                      <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                        <div className="text-[11px]">
                          <div className="flex items-center gap-1 font-semibold">
                            <span>{typeStyle.icon}</span>
                            <span>
                              {displayPoint.routeTitle || displayPoint.title}
                            </span>
                          </div>

                          {/* Nếu là transport thì ghi rõ điểm đi/đến */}
                          {displayPoint.routeTitle &&
                            (displayPoint.type === "TRANSPORT_FROM" ||
                              displayPoint.type === "TRANSPORT_TO") && (
                              <div className="mt-0.5 text-[10px] text-slate-500">
                                {displayPoint.type === "TRANSPORT_FROM"
                                  ? `Điểm đi: ${displayPoint.title}`
                                  : `Điểm đến: ${displayPoint.title}`}
                              </div>
                            )}

                          {displayPoint.label && (
                            <div className="mt-0.5">
                              {displayPoint.label}
                            </div>
                          )}

                          {displayPoint.address && (
                            <div className="mt-0.5 text-[10px] text-slate-500">
                              {displayPoint.address}
                            </div>
                          )}

                          {(displayPoint.startTime || displayPoint.endTime) && (
                            <div className="mt-0.5 text-slate-500">
                              {displayPoint.startTime &&
                                formatTime(displayPoint.startTime)}{" "}
                              {displayPoint.endTime &&
                                `- ${formatTime(displayPoint.endTime)}`}
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* LIST ACTIVITIES */}
            <div className="flex-1 flex flex-col bg-slate-50/60 dark:bg-slate-950/80">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Chạm vào từng hoạt động để làm nổi bật trên bản đồ. Đường xanh: chặng di chuyển, đường xám nét đứt: nối tuần tự
                    giữa các hoạt động.</span>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {list.cards?.map((card) => {
                  const data = parseActivityData(card);
                  const { location: loc } =
                    card.activityType === "TRANSPORT"
                      ? { location: null }
                      : extractLocationForMap(card);

                  const hasLoc =
                    card.activityType === "TRANSPORT"
                      ? !!(data.fromLocation || data.toLocation)
                      : !!loc;

                  const p = points.find((pt) => pt.parentId === card.id);

                  // Tiêu đề card: nếu là TRANSPORT thì A → B
                  let mainTitle = card.text || card.title || "Hoạt động";
                  let routeLabel = null;

                  if (card.activityType === "TRANSPORT") {
                    const fromLoc = data.fromLocation;
                    const toLoc = data.toLocation;

                    const fromName =
                      data.fromPlace ||
                      (fromLoc && (fromLoc.label || fromLoc.name)) ||
                      "Điểm A";

                    const toName =
                      data.toPlace ||
                      (toLoc && (toLoc.label || toLoc.name)) ||
                      "Điểm B";

                    routeLabel = `${fromName} → ${toName}`;
                  }

                  const baseType = getBaseType(card.activityType);
                  const typeStyle = TYPE_STYLES[baseType] || TYPE_STYLES.OTHER;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onMouseEnter={() => setHoverId(card.id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`w-full text-left rounded-2xl border px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 text-xs flex items-start gap-2 transition shadow-sm hover:shadow-md ${
                        hoverId === card.id
                          ? "border-sky-500 ring-1 ring-sky-500/40"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[13px]">
                        {typeStyle.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-slate-900 dark:text-slate-50 truncate">
                          {mainTitle}
                        </div>

                        {routeLabel && (
                          <div className="mt-0.5 text-[11px] text-slate-900 dark:text-slate-300 truncate">
                            {routeLabel}
                          </div>
                        )}

                        {p?.label && (
                          <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 truncate">
                            {p.label}
                          </div>
                        )}

                        {(card.startTime || card.endTime) && (
                          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <FaCalendarAlt size={10} />
                            <span>
                              {card.startTime && formatTime(card.startTime)}
                              {card.endTime && ` - ${formatTime(card.endTime)}`}
                            </span>
                          </div>
                        )}

                        {!hasLoc && (
                          <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                            Hoạt động này chưa có toạ độ — sẽ không hiển thị trên
                            bản đồ.
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
