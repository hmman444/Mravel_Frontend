// src/features/partner/components/restaurant/form/sections/ContactLocationSection.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useVnAdminDivisions } from "../../../../hooks/useVnAdminDivisions";

const digitsOnly = (s) => String(s || "").replace(/\D/g, "");
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
  const { t } = useTranslation();
  const [touched, setTouched] = useState({});

  const provinceCode = form.cityCode || "";
  const districtCode = form.districtCode || "";
  const { provinces, districts, wards, loading } = useVnAdminDivisions(provinceCode, districtCode);

  const errors = useMemo(() => {
    const e = {};
    const phone = String(form.phone || "");
    if (phone && (phone.length < 8 || phone.length > 15)) e.phone = t("partner.contact.phone_length");
    if (!isValidEmail(form.email)) e.email = t("partner.contact.email_invalid");
    if (String(form.addressLine || "").length > 160) e.addressLine = t("partner.contact.address_max");
    return e;
  }, [form, t]);

  const showError = (k) => touched[k] && errors[k];

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

  // nếu edit raw chỉ có *Name*, tự map name->code cho dropdown
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
      <summary className="cursor-pointer select-none font-semibold">{t("partner.contact.section_title")}</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Row 1: phone / email / addressLine */}
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.contact.phone_label")}</div>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", digitsOnly(e.target.value).slice(0, 15))}
            onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
            className="w-full border rounded-xl px-3 py-2"
            inputMode="numeric"
            placeholder="0901234567"
            disabled={disabled}
          />
          <FieldError msg={showError("phone")} />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("common.email")}</div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="name@example.com"
            disabled={disabled}
          />
          <FieldError msg={showError("email")} />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.contact.address_label")}</div>
          <input
            value={form.addressLine}
            onChange={(e) => setField("addressLine", e.target.value.slice(0, 160))}
            onBlur={() => setTouched((p) => ({ ...p, addressLine: true }))}
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("partner.contact.address_placeholder")}
            disabled={disabled}
          />
          <FieldError msg={showError("addressLine")} />
        </label>

        {/* Row 2: city / district / ward
            Khi disabled (admin readonly): render text từ *Name vì reverse-map effect bị skip,
            cityCode/districtCode/wardCode sẽ trống và dropdown không hiển thị giá trị thực. */}
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.contact.province_label")}</div>
          {disabled ? (
            <div className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              {form.cityName || "—"}
            </div>
          ) : (
            <select
              value={form.cityCode || ""}
              onChange={(e) => onPickProvince(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="">{loading.p ? t("common.loading") : t("partner.contact.province_select")}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.contact.district_label")}</div>
          {disabled ? (
            <div className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              {form.districtName || "—"}
            </div>
          ) : (
            <select
              value={form.districtCode || ""}
              onChange={(e) => onPickDistrict(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              disabled={!form.cityCode}
            >
              <option value="">
                {!form.cityCode
                  ? t("partner.contact.district_pick_province_first")
                  : loading.d
                  ? t("common.loading")
                  : t("partner.contact.district_select")}
              </option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.contact.ward_label")}</div>
          {disabled ? (
            <div className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              {form.wardName || "—"}
            </div>
          ) : (
            <select
              value={form.wardCode || ""}
              onChange={(e) => onPickWard(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              disabled={!form.districtCode}
            >
              <option value="">
                {!form.districtCode
                  ? t("partner.contact.ward_pick_district_first")
                  : loading.w
                  ? t("common.loading")
                  : t("partner.contact.ward_select")}
              </option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>
    </details>
  );
}