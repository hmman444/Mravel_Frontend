// ContactLocationSection.jsx
import { useEffect, useMemo, useState } from "react";
import { useVnAdminDivisions } from "../../../../hooks/useVnAdminDivisions";

const digitsOnly = (s) => String(s || "").replace(/\D/g, "");

// so sánh tên “mềm” để tránh lệch dấu/khoảng trắng
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function isValidEmail(v) {
  const s = String(v || "").trim();
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1 text-xs text-red-600">{msg}</div>;
}

export default function ContactLocationSection({ form, setField, disabled }) {
  const [touched, setTouched] = useState({});

  const provinceCode = form.cityCode || "";
  const districtCode = form.districtCode || "";
  const { provinces, districts, wards, loading } =
    useVnAdminDivisions(provinceCode, districtCode);

  const errors = useMemo(() => {
    const e = {};
    const phone = String(form.phone || "");
    if (phone && (phone.length < 8 || phone.length > 15)) e.phone = "SĐT nên dài 8–15 chữ số.";
    if (!isValidEmail(form.email)) e.email = "Email không đúng định dạng.";
    if (String(form.addressLine || "").length > 160) e.addressLine = "Địa chỉ tối đa 160 ký tự.";
    return e;
  }, [form]);

  const showError = (key) => touched[key] && errors[key];

  const onPickProvince = (code) => {
    const c = code ? Number(code) : "";
    const p = provinces.find((x) => x.code === c);
    setField("cityCode", c || "");
    setField("cityName", p?.name || "");
    setField("districtCode", "");
    setField("districtName", "");
    setField("wardCode", "");
    setField("wardName", "");
  };

  const onPickDistrict = (code) => {
    const c = code ? Number(code) : "";
    const d = districts.find((x) => x.code === c);
    setField("districtCode", c || "");
    setField("districtName", d?.name || "");
    setField("wardCode", "");
    setField("wardName", "");
  };

  const onPickWard = (code) => {
    const c = code ? Number(code) : "";
    const w = wards.find((x) => x.code === c);
    setField("wardCode", c || "");
    setField("wardName", w?.name || "");
  };

  useEffect(() => {
    if (disabled) return;
    if (form.cityCode) return;
    if (!form.cityName) return;
    if (!provinces.length) return;

    const p = provinces.find((x) => norm(x.name) === norm(form.cityName));
    if (p) setField("cityCode", p.code);
  }, [disabled, form.cityCode, form.cityName, provinces, setField]);

  useEffect(() => {
    if (disabled) return;
    if (!form.cityCode) return;
    if (form.districtCode) return;
    if (!form.districtName) return;
    if (!districts.length) return;

    const d = districts.find((x) => norm(x.name) === norm(form.districtName));
    if (d) setField("districtCode", d.code);
  }, [disabled, form.cityCode, form.districtCode, form.districtName, districts, setField]);

  useEffect(() => {
    if (disabled) return;
    if (!form.districtCode) return;
    if (form.wardCode) return;
    if (!form.wardName) return;
    if (!wards.length) return;

    const w = wards.find((x) => norm(x.name) === norm(form.wardName));
    if (w) setField("wardCode", w.code);
  }, [disabled, form.districtCode, form.wardCode, form.wardName, wards, setField]);

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">Liên hệ & vị trí</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phone */}
        <label className="text-sm">
          <div className="font-medium mb-1">Số điện thoại</div>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", digitsOnly(e.target.value).slice(0, 15))}
            onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
            className="w-full border rounded-xl px-3 py-2"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="0901234567"
            disabled={disabled}
          />
          <FieldError msg={showError("phone")} />
        </label>

        {/* Email */}
        <label className="text-sm">
          <div className="font-medium mb-1">Email</div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            className="w-full border rounded-xl px-3 py-2"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={disabled}
          />
          <FieldError msg={showError("email")} />
        </label>

        {/* Address (same row with phone & email) */}
        <label className="text-sm">
          <div className="font-medium mb-1">Địa chỉ</div>
          <input
            value={form.addressLine}
            onChange={(e) => setField("addressLine", e.target.value.slice(0, 160))}
            onBlur={() => setTouched((p) => ({ ...p, addressLine: true }))}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Số nhà, đường..."
            disabled={disabled}
          />
          <FieldError msg={showError("addressLine")} />
        </label>

        {/* Province */}
        <label className="text-sm">
          <div className="font-medium mb-1">Tỉnh/Thành phố</div>
          <select
            value={form.cityCode || ""}
            onChange={(e) => onPickProvince(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled}
          >
            <option value="">{loading.p ? "Đang tải..." : "-- Chọn tỉnh/thành --"}</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </label>

        {/* District */}
        <label className="text-sm">
          <div className="font-medium mb-1">Quận/Huyện</div>
          <select
            value={form.districtCode || ""}
            onChange={(e) => onPickDistrict(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled || !form.cityCode}
          >
            <option value="">
              {!form.cityCode ? "-- Chọn tỉnh trước --" : loading.d ? "Đang tải..." : "-- Chọn quận/huyện --"}
            </option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </label>

        {/* Ward */}
        <label className="text-sm">
          <div className="font-medium mb-1">Phường/Xã</div>
          <select
            value={form.wardCode || ""}
            onChange={(e) => onPickWard(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled || !form.districtCode}
          >
            <option value="">
              {!form.districtCode ? "-- Chọn quận/huyện trước --" : loading.w ? "Đang tải..." : "-- Chọn phường/xã --"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </label>
      </div>
    </details>
  );
}