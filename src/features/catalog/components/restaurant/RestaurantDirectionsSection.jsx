// src/features/catalog/components/restaurant/RestaurantDirectionsSection.jsx
import React, { useMemo } from "react";
import { showSuccess } from "../../../../utils/toastUtils";

function makeLatLng(location) {
  if (Array.isArray(location) && location.length === 2) {
    return { lat: location[1], lng: location[0] };
  }
  return null;
}

export default function RestaurantDirectionsSection({ restaurant }) {
  const addr =
    restaurant?.addressLine ||
    [restaurant?.wardName, restaurant?.districtName, restaurant?.cityName]
      .filter(Boolean)
      .join(", ");

  const ll = useMemo(() => makeLatLng(restaurant?.location), [restaurant?.location]);

  const viewUrl = ll
    ? `https://maps.google.com/?q=${ll.lat},${ll.lng}`
    : addr
    ? `https://maps.google.com/?q=${encodeURIComponent(addr)}`
    : null;

  const dirUrl = ll
    ? `https://www.google.com/maps?daddr=${ll.lat},${ll.lng}`
    : addr
    ? `https://www.google.com/maps?daddr=${encodeURIComponent(addr)}`
    : null;

  const embedUrl = ll
    ? `https://maps.google.com/maps?q=${ll.lat},${ll.lng}&z=15&output=embed`
    : addr
    ? `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=15&output=embed`
    : null;

  if (!addr && !embedUrl) return null;

  const copyShare = async () => {
    const text = `${restaurant?.name || ""} - ${addr}${viewUrl ? `\n${viewUrl}` : ""}`;
    try {
        await navigator.clipboard.writeText(text);
        showSuccess("Đã sao chép địa chỉ & liên kết!");
    } catch (err) {
        console.error("Clipboard copy failed:", err);
        // Fallback: mở prompt để người dùng tự copy
        window.prompt("Sao chép thủ công nội dung sau:", text);
    }
    };

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      {/* TITLE + ACTIONS */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900">Chỉ đường</h2>

        <div className="flex gap-2">
          {viewUrl && (
            <a
              href={dirUrl || viewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Mở Google Maps
            </a>
          )}
          <button
            onClick={copyShare}
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200"
            title="Sao chép địa chỉ & liên kết"
          >
            Chia sẻ
          </button>
        </div>
      </div>

      {/* CARD */}
      <div className="mt-4 rounded-2xl bg-white shadow-sm p-5 md:p-6 leading-relaxed text-gray-900">
        <div className="flex flex-wrap items-start gap-3 text-gray-800">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-700">
              <path
                fill="currentColor"
                d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="font-medium">{addr}</div>
            <div className="text-sm text-gray-600">
              (Nhấn vào bản đồ để xem chỉ đường, hoặc dùng nút phía trên bên phải)
            </div>
          </div>
        </div>

        {embedUrl && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <div className="relative pt-[56.25%]">
              <iframe
                title="restaurant-map"
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}