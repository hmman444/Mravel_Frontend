// src/features/catalog/components/restaurant/RestaurantAmenitiesSection.jsx
import React, { useMemo } from "react";

const ALL_AMENITIES = [
  { key: "PROJECTOR", label: "Máy chiếu" },
  { key: "SOUND_LIGHT", label: "Âm thanh - ánh sáng" },
  { key: "KIDS_CHAIR", label: "Ghế trẻ em" },
  { key: "SMOKING_AREA", label: "Chỗ hút thuốc" },
  { key: "MC_SERVICE", label: "MC dẫn chương trình" },
  { key: "FREE_CAR_PARKING", label: "Chỗ để ô tô miễn phí" },
  { key: "OUTDOOR_TABLE", label: "Bàn ngoài trời" },
  { key: "FREE_MOTORBIKE_PARKING", label: "Chỗ để xe máy miễn phí" },
  { key: "SET_LUNCH", label: "Set lunch" },
  { key: "AIR_CONDITIONING", label: "Điều hòa" },
  { key: "EVENT_DECOR", label: "Trang trí sự kiện" },
  { key: "VISA_MASTER", label: "Visa / Master card" },
  { key: "VAT_INVOICE", label: "Hóa đơn VAT" },
  { key: "WIFI", label: "Wifi" },

  { key: "DIRECT_INVOICE", label: "HĐ trực tiếp", from: "policy" },
  { key: "CASH", label: "Thanh toán tiền mặt", defaultFalse: true },
  { key: "CAR_PARKING", label: "Chỗ để ô tô", from: "parking" },
  { key: "K_PLUS", label: "Bóng đá K+", defaultFalse: true },
  { key: "PRIVATE_ROOM", label: "Phòng riêng", from: "capacity" },
  { key: "KARAOKE", label: "Karaoke", defaultFalse: true },
  { key: "PAYMENT_MOMO_ZALO", label: "Momo / Zalo Pay", defaultFalse: true },
  { key: "LED_SCREEN", label: "Màn LED", defaultFalse: true },
  { key: "KIDS_PLAYGROUND", label: "Chỗ chơi trẻ em", defaultFalse: true },
];

function CheckIcon({ ok }) {
  return ok ? (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <circle cx="12" cy="12" r="12" className="fill-green-500/20" />
      <path d="M6 12.5l3.5 3.5L18 8.5" className="stroke-green-600" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <circle cx="12" cy="12" r="12" className="fill-red-500/20" />
      <path d="M7 7l10 10M17 7L7 17" className="stroke-red-600" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RestaurantAmenitiesSection({ restaurant }) {
  const amenityCodes = Array.isArray(restaurant?.amenityCodes) ? restaurant.amenityCodes : [];

  const computed = useMemo(() => {
    return ALL_AMENITIES.map((a) => {
      if (a.from === "policy") {
        const ok = a.key === "DIRECT_INVOICE" ? restaurant?.policy?.directInvoiceAvailable === true : false;
        return { label: a.label, ok };
      }
      if (a.from === "parking") {
        const ok = restaurant?.parking?.hasCarParking === true;
        return { label: a.label, ok };
      }
      if (a.from === "capacity") {
        const ok = restaurant?.capacity?.hasPrivateRooms === true;
        return { label: a.label, ok };
      }
      const ok = amenityCodes.includes(a.key);
      return { label: a.label, ok: ok && ok !== undefined ? ok : !a.defaultFalse };
    });
  }, [amenityCodes, restaurant]);

  if (computed.length === 0) return null;

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900">Tiện ích</h2>

      <div className="mt-4 rounded-2xl bg-white shadow-sm p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          {computed.map((it, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-900">
              <CheckIcon ok={it.ok} />
              <span className={it.ok ? "" : "text-gray-700"}>{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}