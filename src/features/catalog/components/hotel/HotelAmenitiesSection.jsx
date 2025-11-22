// src/features/hotels/components/hotel/HotelAmenitiesSection.jsx
import {
  BedDouble,
  Building2,
  BusFront,
  HandHeart,
  MapPin,
  PartyPopper,
  Utensils,
  Wifi,
  ShipWheel,
  Trees,
} from "lucide-react";

export default function HotelAmenitiesSection({ hotel }) {
  if (!hotel) return null;

  const hotelAmenitiesRaw = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const roomAmenitiesRaw = Array.isArray(hotel.roomTypes)
    ? hotel.roomTypes.flatMap((rt) =>
        Array.isArray(rt.amenities) ? rt.amenities : []
      )
    : [];

  const buckets = {
    hotelService: new Map(),
    nearby: new Map(),
    publicFacilities: new Map(),
    roomFacilities: new Map(),
    generalFacilities: new Map(),
    transport: new Map(),
    shuttle: new Map(),
    foodDrink: new Map(),
    activities: new Map(),
    internet: new Map(),
    sports: new Map(),
  };

  const pushAmenity = (bucketKey, amenity) => {
    if (!bucketKey || !amenity) return;
    const map = buckets[bucketKey];
    if (!map) return;
    const key = amenity.code || amenity.name;
    if (!key) return;
    if (!map.has(key)) map.set(key, amenity);
  };

  for (const a of hotelAmenitiesRaw) {
    const bucketKey = classifyAmenity(a, false);
    pushAmenity(bucketKey, a);
  }

  for (const a of roomAmenitiesRaw) {
    const bucketKey = classifyAmenity(a, true);
    pushAmenity(bucketKey, a);
  }

  const categoriesConfig = [
    { key: "hotelService", title: "Dịch vụ khách sạn", icon: <HandHeart className="h-4 w-4" /> },
    { key: "nearby", title: "Các tiện ích lân cận", icon: <MapPin className="h-4 w-4" /> },
    { key: "publicFacilities", title: "Tiện nghi công cộng", icon: <Building2 className="h-4 w-4" /> },
    { key: "roomFacilities", title: "Tiện nghi phòng", icon: <BedDouble className="h-4 w-4" /> },
    { key: "generalFacilities", title: "Tiện nghi chung", icon: <Building2 className="h-4 w-4" /> },
    { key: "transport", title: "Vận chuyển", icon: <BusFront className="h-4 w-4" /> },
    { key: "shuttle", title: "Đưa đón", icon: <ShipWheel className="h-4 w-4" /> },
    { key: "foodDrink", title: "Ẩm thực", icon: <Utensils className="h-4 w-4" /> },
    { key: "activities", title: "Các hoạt động", icon: <Trees className="h-4 w-4" /> },
    { key: "internet", title: "Kết nối mạng", icon: <Wifi className="h-4 w-4" /> },
    { key: "sports", title: "Thể thao & Giải trí", icon: <PartyPopper className="h-4 w-4" /> },
  ];

  const categories = categoriesConfig
    .map((cfg) => ({
      ...cfg,
      items: Array.from(buckets[cfg.key].values()),
    }))
    .filter((c) => c.items.length > 0);

  const images = Array.isArray(hotel.images) ? hotel.images.slice(0, 4) : [];
  const imageLabels = [
    "Phương tiện giải trí",
    "Trung tâm thể thao",
    "Khu vực công cộng",
    "Dịch vụ khách sạn",
  ];

  if (!categories.length && !images.length) return null;

  return (
    <section id="hotel-amenities-section" className="mt-6 border border-gray-200 bg-white">
      {/* HEADER + GALLERY */}
      <div className="px-6 pt-5 pb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Tất cả những tiện ích tại {hotel.name}
        </h2>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            {images.map((img, idx) => (
              <div
                key={img.url || idx}
                className="relative h-32 overflow-hidden bg-gray-200"
              >
                {img.url && (
                  <img
                    src={img.url}
                    alt={img.caption || imageLabels[idx] || "Tiện ích"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2 pt-6">
                  <p className="text-xs font-semibold text-white">
                    {imageLabels[idx] || img.caption || "Tiện ích"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRID 3 CỘT – TỰ XUỐNG HÀNG */}
      <div className="border-t border-gray-100 px-6 py-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {categories.map((cat) => (
            <AmenityColumn
              key={cat.key}
              title={cat.title}
              icon={cat.icon}
              items={cat.items}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- SUB COMPONENT --------

function AmenityColumn({ title, icon, items }) {
  if (!items || !items.length) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f2ff] text-[#0064d2] shadow-sm ring-1 ring-[#c6ddff]">
          {icon}
        </div>
        <h3 className="text-[14px] font-bold leading-snug text-gray-900">
          {title}
        </h3>
      </div>

      <ul className="ml-8 space-y-1.5 text-sm text-gray-700">
        {items.map((a) => (
          <li
            key={a.code || a.name}
            className="flex items-start gap-2 leading-snug"
          >
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400" />
            <span>{a.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------- CLASSIFY FUNCTION – GIỐNG TRAVELOKA STYLE --------

function classifyAmenity(a, isRoomLevel) {
  if (!a) return null;
  const code = (a.code || "").toLowerCase();
  const group = (a.group || "").toString().toUpperCase();
  const section =
    typeof a.section === "string" ? a.section.toUpperCase() : "";

  if (code === "dart") return "sports";
  if (code === "garden") return "activities";

  if (group === "INTERNET" || section === "INTERNET") {
    return "internet";
  }

  if (group === "NEARBY") {
    return "nearby";
  }

  if (isRoomLevel) {
    if (code === "ac") {
      return "generalFacilities";
    }

    if (
      section === "ROOM_FACILITIES" ||
      section === "BATHROOM" ||
      section === "HIGHLIGHT_FEATURES"
    ) {
      return "roomFacilities";
    }
  }

  const publicFacilitiesCodes = new Set([
    "public_parking",
    "parking",
    "lobby_coffee_tea",
    "public_restaurant",
    "public_wifi",
    "early_checkin",
    "late_checkout",
    "room_service_limited",
  ]);
  if (publicFacilitiesCodes.has(code)) {
    return "publicFacilities";
  }

  if (section === "FOOD_AND_DRINK") {
    return "foodDrink";
  }

  if (section === "TRANSPORT") {
    if (code === "airport_transfer") {
      return "shuttle";
    }
    return "transport";
  }

  if (section === "ENTERTAINMENT") {
    return "activities";
  }

  const generalCodes = new Set([
    "ac",
    "family_room",
    "non_smoking_room",
    "smoking_area",
    "terrace",
    "luggage_storage",
  ]);
  if (generalCodes.has(code)) {
    return "generalFacilities";
  }

  if (group === "HOTEL_SERVICE") {
    return "hotelService";
  }

  if (!isRoomLevel && group === "ROOM") {
    return "generalFacilities";
  }
  if (group === "PUBLIC_AREA") {
    return "publicFacilities";
  }

  if (isRoomLevel) return "roomFacilities";

  return "hotelService";
}
