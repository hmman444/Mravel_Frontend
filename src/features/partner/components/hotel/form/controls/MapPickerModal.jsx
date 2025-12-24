// src/features/partner/components/hotel/create/MapPickerModal.jsx
import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

function ClickToPick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function MapPickerModal({ open, initial, onClose, onConfirm }) {
  const center = useMemo(() => {
    const lat = Number(initial?.lat);
    const lng = Number(initial?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return [10.8231, 106.6297]; // default HCM
  }, [initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">Chọn vị trí trên bản đồ</div>
            <div className="text-xs text-gray-500">Click vào bản đồ để chọn tọa độ.</div>
          </div>
          <button className="px-3 py-2 rounded-xl border hover:bg-gray-50" onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className="h-[420px]">
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              // OSM tiles (demo); production nên cân nhắc tile provider riêng
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <ClickToPick onPick={onConfirm} />
            {initial?.lat && initial?.lng ? (
              <Marker position={[Number(initial.lat), Number(initial.lng)]} />
            ) : null}
          </MapContainer>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button className="px-3 py-2 rounded-xl border hover:bg-gray-50" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}