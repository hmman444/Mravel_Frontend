// src/features/catalog/components/restaurant/RestaurantAmenitiesSection.jsx
import React, { useMemo } from "react";



function CheckIcon({ ok }) {
  return ok ? (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <circle cx="12" cy="12" r="12" className="fill-green-500/20" />
      <path
        d="M6 12.5l3.5 3.5L18 8.5"
        className="stroke-green-600"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <circle cx="12" cy="12" r="12" className="fill-red-500/20" />
      <path
        d="M7 7l10 10M17 7L7 17"
        className="stroke-red-600"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RestaurantAmenitiesSection({ restaurant }) {
  const amenityCodes = Array.isArray(restaurant?.amenityCodes) ? restaurant.amenityCodes : [];
  const amenitiesFromBe = Array.isArray(restaurant?.amenities) ? restaurant.amenities : [];

  const computed = useMemo(() => {
    // 1) Base list: ưu tiên amenities BE
    const base =
      amenitiesFromBe.length > 0
        ? amenitiesFromBe.map((a) => ({
            key: a.code,
            label: a.name || a.code,
            ok: true,
            icon: a.icon || null,
          }))
        : amenityCodes.map((code) => ({
            key: code,
            label: code,
            ok: true,
            icon: null,
          }));

    // 2) Extra derived (policy/parking/capacity + default false)


    // 3) Gộp + dedupe theo key
    const map = new Map();
    for (const it of [...base]) {
      if (!map.has(it.key)) map.set(it.key, it);
    }
    return Array.from(map.values());
  }, [amenitiesFromBe, amenityCodes, restaurant]);

  if (!computed.length) return null;

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900">Tiện ích</h2>

      <div className="mt-4 rounded-2xl bg-white shadow-sm p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          {computed.map((it) => (
            <div key={it.key} className="flex items-center gap-3 text-gray-900">
              <CheckIcon ok={it.ok} />
              <span className={it.ok ? "" : "text-gray-700"}>{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
