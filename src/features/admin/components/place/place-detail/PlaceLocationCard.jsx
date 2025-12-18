import { ui } from "./uiTokens";
import { Label } from "./pills";

export default function PlaceLocationCard({ form, setField, isLockedReadOnly }) {
  return (
    <div className={ui.card}>
      <div className={ui.cardHeader}>
        <div>
          <div className={ui.title}>Địa chỉ & tọa độ</div>
          <div className={ui.sub}>location = [lon, lat]</div>
        </div>
      </div>

      <div className={ui.cardBody}>
        <div className="space-y-4">
          <div>
            <Label>Địa chỉ</Label>
            <input
              className={ui.input}
              disabled={isLockedReadOnly}
              value={form.addressLine}
              onChange={(e) => setField("addressLine", e.target.value)}
              placeholder="TP. Hội An, Quảng Nam, Việt Nam"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quốc gia</Label>
              <input
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.countryCode}
                onChange={(e) => setField("countryCode", e.target.value)}
                placeholder="VN"
              />
            </div>
            <div>
              <Label>Tỉnh/Thành phố</Label>
              <input
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.provinceName}
                onChange={(e) => setField("provinceName", e.target.value)}
                placeholder="Quảng Nam"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kinh độ (Longitude)</Label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.lon}
                onChange={(e) => setField("lon", e.target.value)}
                placeholder="108.3380"
              />
            </div>
            <div>
              <Label>Vĩ độ (Latitude)</Label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                className={ui.input}
                disabled={isLockedReadOnly}
                value={form.lat}
                onChange={(e) => setField("lat", e.target.value)}
                placeholder="15.8801"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
