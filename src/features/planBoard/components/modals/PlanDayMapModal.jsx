"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  Pane,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { fetchRoadRoute } from "../../utils/roadRouting";
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

// Chấm SỐ THỨ TỰ — TÂM chấm đặt ĐÚNG toạ độ (iconAnchor = giữa) nên không lệch điểm
// như pin nhọn cũ (mũi pin lệch khỏi toạ độ). Số = thứ tự đi để thấy rõ chiều lộ trình.
function makeOrderIcon(order, { active = false, color = "#0284c7" } = {}) {
  const size = active ? 32 : 26;
  const font = active ? 15 : 12;
  return L.divIcon({
    className: "mravel-order-pin",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};border:2.5px solid #fff;
      box-shadow:0 1px 5px rgba(2,8,23,.45);
      color:#fff;font-weight:700;font-size:${font}px;line-height:1;
      display:flex;align-items:center;justify-content:center;
    ">${order ?? ""}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2], // tâm chấm trùng toạ độ thật
  });
}

// Mũi tên chỉ CHIỀU đi, xoay theo hướng cung đường (SVG mặc định chỉ lên = hướng Bắc).
function makeArrowIcon(deg, color = "#0284c7") {
  return L.divIcon({
    className: "mravel-route-arrow",
    html: `<div style="transform:rotate(${deg}deg);width:18px;height:18px;display:flex;align-items:center;justify-content:center;">
      <svg width="15" height="15" viewBox="0 0 24 24" style="filter:drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1px #fff);">
        <path d="M12 2 L20 21 L12 16 L4 21 Z" fill="${color}"/>
      </svg>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Góc la bàn (độ, thuận chiều kim đồng hồ từ hướng Bắc) giữa 2 điểm [lat,lng].
function bearingDeg(a, b) {
  const dNorth = b[0] - a[0];
  const dEast = (b[1] - a[1]) * Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180));
  return (Math.atan2(dEast, dNorth) * 180) / Math.PI;
}

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
    i18n.t("plan.map.default_activity");

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
  const { t } = useTranslation();
  const [hoverId, setHoverId] = useState(null);
  // { [segId]: [[lat,lng], ...] } - đường đi thật lấy từ OSRM, bám theo đường
  const [routedSegments, setRoutedSegments] = useState({});

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
          i18n.t("plan.map.origin");

        const toName =
          data.toPlace ||
          (toLoc && (toLoc.label || toLoc.name)) ||
          card.text ||
          card.title ||
          i18n.t("plan.map.destination");

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

    // số thứ tự theo đúng trình tự đi (gồm cả điểm đi/đến của TRANSPORT)
    pts.forEach((p, i) => {
      p.order = i + 1;
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
          fromParentId: a.parentId, // card mà cung đường này XUẤT PHÁT
          toParentId: b.parentId,
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

  // Bám ĐƯỜNG ĐI THẬT (OSRM) cho CẢ hai loại đường: chặng TRANSPORT (xanh) và
  // đường nối tuần tự giữa các hoạt động (xám). Mỗi chặng đang là đường thẳng 2 điểm
  // sẽ được thay bằng lộ trình gấp khúc bám theo đường bộ. OSRM lỗi -> giữ đường thẳng.
  useEffect(() => {
    if (!open) return;

    setRoutedSegments({});

    // namespace key cho đường tuần tự (seq:) để không đụng id của chặng TRANSPORT
    const toRoute = [
      ...segments.map((s) => ({ key: s.id, positions: s.positions })),
      ...sequentialSegments.map((s) => ({
        key: `seq:${s.id}`,
        positions: s.positions,
      })),
    ].filter((s) => Array.isArray(s.positions) && s.positions.length === 2);

    if (!toRoute.length) return;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      for (const seg of toRoute) {
        const [from, to] = seg.positions;
        const route = await fetchRoadRoute(
          { lat: from[0], lng: from[1] },
          { lat: to[0], lng: to[1] },
          { signal: controller.signal }
        );
        if (cancelled) return;
        if (route?.path?.length >= 2) {
          setRoutedSegments((prev) => ({ ...prev, [seg.key]: route.path }));
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, segments, sequentialSegments]);

  if (!open || !list) return null;

  const title = list.title || t("plan.map.day", { n: dayIndex + 1 });
  const formatTime = (t) =>
    t ? String(t).split(":").slice(0, 2).join(":") : "";

  const getBaseType = (type) => {
    if (!type) return "OTHER";
    if (type.startsWith("TRANSPORT")) return "TRANSPORT";
    return TYPE_STYLES[type] ? type : "OTHER";
  };

  // Mũi tên chỉ chiều cho từng cung đường (đặt ở giữa mỗi chặng theo lộ trình thật).
  const routeArrows = [];
  const addArrow = (id, positions, color, owner) => {
    if (!Array.isArray(positions) || positions.length < 2) return;
    const mid = Math.floor((positions.length - 1) / 2);
    const a = positions[mid];
    const b = positions[mid + 1] || positions[positions.length - 1];
    if (!a || !b) return;
    routeArrows.push({
      id,
      pos: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
      deg: bearingDeg(a, b),
      color,
      owner, // card mà cung đường này xuất phát → để làm nổi khi rê chuột
    });
  };
  segments.forEach((s) =>
    addArrow(`ta-${s.id}`, routedSegments[s.id] || s.positions, "#0284c7", s.id)
  );
  sequentialSegments.forEach((s) => {
    const active = hoverId && s.fromParentId === hoverId;
    addArrow(
      `sa-${s.id}`,
      routedSegments[`seq:${s.id}`] || s.positions,
      active ? "#991b1b" : "#b91c1c",
      s.fromParentId
    );
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden"
          initial={{ y: 20, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-4 pb-3 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-9 w-9 rounded-2xl bg-sky-500/90 text-white flex items-center justify-center shadow-md shadow-sky-500/40">
                <FaMapMarkerAlt />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {t("plan.map.title")}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                    <FaCalendarAlt size={10} />
                    {title}
                  </span>
                  <span>
                    <b>
                      {t("plan.map.activity_count", {
                        count: locationActivityCount,
                      })}
                    </b>{" "}
                    {t("plan.map.activity_count_suffix")}
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

          {/* BODY — cao theo viewport (co giãn theo màn hình); xếp DỌC dưới lg để map
              full-width trên tablet/màn nhỏ; min-h-0 để danh sách cuộn được */}
          <div className="flex flex-col lg:flex-row h-[80vh] lg:h-[68vh] min-h-0">
            {/* MAP */}
            <div
              className="
                lg:w-2/3 shrink-0
                h-[44vh] lg:h-full
                border-b lg:border-b-0 lg:border-r
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

                {/* CASING (viền trắng) ở PANE z-index THẤP → LUÔN nằm dưới đường màu.
                    Tách pane để casing không bao giờ đè lên đường (gây nhạt/trắng). */}
                <Pane name="mravel-route-casing" style={{ zIndex: 404 }}>
                  {segments.map((seg) => (
                    <Polyline
                      key={`case-${seg.id}`}
                      positions={routedSegments[seg.id] || seg.positions}
                      pathOptions={{
                        color: "#ffffff",
                        weight: (hoverId === seg.id ? 5 : 4) + 4,
                        opacity: hoverId && hoverId !== seg.id ? 0.35 : 0.9,
                      }}
                    />
                  ))}
                  {sequentialSegments.map((seg) => {
                    const routed = routedSegments[`seq:${seg.id}`];
                    if (!routed) return null; // chỉ casing cho lộ trình thật (nét liền)
                    const active = hoverId && seg.fromParentId === hoverId;
                    const dimmed = hoverId && !active;
                    return (
                      <Polyline
                        key={`seqcase-${seg.id}`}
                        positions={routed}
                        pathOptions={{
                          color: "#ffffff",
                          weight: (active ? 8 : 5) + 2.5,
                          opacity: dimmed ? 0.35 : 0.9,
                        }}
                      />
                    );
                  })}
                </Pane>

                {/* ĐƯỜNG MÀU ở PANE z-index CAO hơn casing → luôn nổi rõ bên trên */}
                <Pane name="mravel-route-line" style={{ zIndex: 408 }}>
                  {/* Đường TRANSPORT (A → B) - ưu tiên đường đi thật bám theo đường */}
                  {segments.map((seg) => (
                    <Polyline
                      key={seg.id}
                      positions={routedSegments[seg.id] || seg.positions}
                      pathOptions={{
                        color: "#0ea5e9",
                        weight: hoverId && hoverId === seg.id ? 5 : 4,
                        opacity: hoverId && hoverId !== seg.id ? 0.3 : 0.95,
                      }}
                    />
                  ))}

                  {/* Đường tuần tự (đỏ) giữa các hoạt động — nét liền khi định tuyến
                      được; chưa được thì nét đứt (đường chim bay) */}
                  {sequentialSegments.map((seg) => {
                    const routed = routedSegments[`seq:${seg.id}`];
                    // cung đường XUẤT PHÁT từ hoạt động đang rê chuột → đậm hơn hẳn
                    const active = hoverId && seg.fromParentId === hoverId;
                    const dimmed = hoverId && !active;
                    const base = routed ? 5 : 4;
                    return (
                      <Polyline
                        key={`seq-${seg.id}`}
                        positions={routed || seg.positions}
                        pathOptions={{
                          // đỏ đậm rõ (red-700); đoạn đang hover đậm hơn nữa (red-800)
                          color: active ? "#991b1b" : "#b91c1c",
                          weight: active ? base + 3 : base,
                          opacity: dimmed ? 0.4 : 1,
                          dashArray: routed ? null : "6 8",
                        }}
                      />
                    );
                  })}
                </Pane>

                {/* Mũi tên chỉ chiều đi trên từng cung đường */}
                {routeArrows.map((ar) => {
                  const dimmed = hoverId && ar.owner !== hoverId;
                  return (
                    <Marker
                      key={ar.id}
                      position={ar.pos}
                      icon={makeArrowIcon(ar.deg, ar.color)}
                      interactive={false}
                      opacity={dimmed ? 0.25 : 1}
                      zIndexOffset={hoverId && ar.owner === hoverId ? 450 : 400}
                    />
                  );
                })}

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
                      icon={makeOrderIcon(p.order, {
                        active: hoverId === p.parentId,
                      })}
                      opacity={hoverId && hoverId !== p.parentId ? 0.55 : 1}
                      zIndexOffset={hoverId === p.parentId ? 600 : 0}
                    >
                      <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                        <div className="text-[11px]">
                          <div className="flex items-center gap-1 font-semibold">
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] text-white">
                              {p.order}
                            </span>
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
                                  ? t("plan.map.origin_label", {
                                      name: displayPoint.title,
                                    })
                                  : t("plan.map.destination_label", {
                                      name: displayPoint.title,
                                    })}
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

            {/* LIST ACTIVITIES — min-w-0 để khung co lại được, tránh card tràn ngang */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-slate-50/60 dark:bg-slate-950/80">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{t("plan.map.legend_hint")}</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-2">
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

                  const cardPoints = points.filter(
                    (pt) => pt.parentId === card.id
                  );
                  const p = cardPoints[0];
                  // số thứ tự trùng với chấm trên bản đồ (transport: "đi→đến")
                  const orderLabel = cardPoints.length
                    ? cardPoints.map((pt) => pt.order).join("→")
                    : null;

                  // Tiêu đề card: nếu là TRANSPORT thì A → B
                  let mainTitle =
                    card.text || card.title || t("plan.map.default_activity");
                  let routeLabel = null;

                  if (card.activityType === "TRANSPORT") {
                    const fromLoc = data.fromLocation;
                    const toLoc = data.toLocation;

                    const fromName =
                      data.fromPlace ||
                      (fromLoc && (fromLoc.label || fromLoc.name)) ||
                      t("plan.map.point_a");

                    const toName =
                      data.toPlace ||
                      (toLoc && (toLoc.label || toLoc.name)) ||
                      t("plan.map.point_b");

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
                      className={`w-full text-left rounded-xl border px-2.5 py-2 bg-white/90 dark:bg-slate-900/90 text-xs flex items-start gap-2 transition shadow-sm hover:shadow-md ${
                        hoverId === card.id
                          ? "border-sky-500 ring-1 ring-sky-500/40"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="mt-0.5 flex items-center gap-1 shrink-0">
                        {orderLabel && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white shadow-sm">
                            {orderLabel}
                          </span>
                        )}
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                          {typeStyle.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-slate-50 truncate">
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
                            {t("plan.map.no_coordinates")}
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
