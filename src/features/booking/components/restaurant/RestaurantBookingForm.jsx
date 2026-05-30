// src/features/booking/components/restaurant/RestaurantBookingForm.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, Users } from "lucide-react";
import RestaurantBookingDateTimePicker from "./RestaurantBookingDateTimePicker";

const EMAIL_FULL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  

// Chỉ cho phép các ký tự thường gặp trong email
const EMAIL_ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9@._+-]/g;

// Cho phép gõ "từng phần" (để không quá khó nhập), nhưng vẫn chặn input vô lý
const isEmailPartiallyValid = (s) => {
  if (s === "") return true;
  if (s.includes(" ")) return false;

  // không cho bắt đầu bằng @
  if (s.startsWith("@")) return false;

  // chỉ 1 dấu @
  const atCount = (s.match(/@/g) || []).length;
  if (atCount > 1) return false;

  // không cho có ".."
  if (s.includes("..")) return false;

  // không cho "@." hoặc ".@"
  if (s.includes("@.") || s.includes(".@")) return false;

  return true;
};

const sanitizeName = (raw) => {
  // chỉ chữ + khoảng trắng (có dấu)
  let v = String(raw ?? "");
  v = v.replace(/[^A-Za-zÀ-ỹ\s]/g, ""); // chặn số + ký tự đặc biệt
  v = v.replace(/\s+/g, " "); // gom khoảng trắng
  v = v.trimStart(); // cho phép user gõ cuối vẫn ok
  // optional: giới hạn độ dài
  if (v.length > 60) v = v.slice(0, 60);
  return v;
};

const sanitizePhone = (raw) => {
  let v = String(raw ?? "");
  v = v.replace(/\D/g, ""); // chỉ số
  if (v.length > 10) v = v.slice(0, 10); // chặn quá 10 số
  return v;
};

const sanitizeEmail = (raw) => {
  let v = String(raw ?? "");
  v = v.replace(EMAIL_ALLOWED_CHARS_REGEX, ""); // chặn ký tự lạ
  v = v.replace(/\s+/g, ""); // không cho space

  // chỉ giữ 1 dấu @
  const firstAt = v.indexOf("@");
  if (firstAt !== -1) {
    const before = v.slice(0, firstAt + 1);
    const after = v.slice(firstAt + 1).replace(/@/g, "");
    v = before + after;
  }

  // optional: giới hạn độ dài
  if (v.length > 120) v = v.slice(0, 120);

  return v;
};

export default function RestaurantBookingForm({
  // contact
  contactName,
  contactPhone,
  contactEmail,
  note,
  onContactNameChange,
  onContactPhoneChange,
  onContactEmailChange,
  onNoteChange,

  // booking inputs
  adults,
  children,
  onAdultsChange,
  onChildrenChange,

  date,
  time,
  onDateTimeChange,

  tableTypeId,
  tableTypes = [],
  onTableTypeChange,

  tablesCount,
  onTablesCountChange,

  openingHours = [],

  tableType,
  people = 1,
  minTables = 1,
  totalSeats = 0,
  seatErrorText = "",
}) {
  const { t } = useTranslation();
  const NOTE_MAX = 200;

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  //  realtime validate (khi value thay đổi) 
  useEffect(() => {
    const v = (contactName || "").trim();
    if (!v) setNameError(t("booking.error_name_required"));
    else if (!/^[A-Za-zÀ-ỹ\s]+$/.test(v)) setNameError(t("booking.error_name_letters_only"));
    else setNameError("");
  }, [contactName]);

  useEffect(() => {
    const v = String(contactPhone || "");
    if (!v) setPhoneError(t("booking.error_phone_required"));
    else if (!/^\d+$/.test(v)) setPhoneError(t("booking.error_phone_digits_only"));
    else if (v.length !== 10) setPhoneError(t("booking.error_phone_exact_10"));
    else setPhoneError("");
  }, [contactPhone]);

  useEffect(() => {
    const v = String(contactEmail || "");
    if (!v) {
      setEmailError(""); // email có thể optional
      return;
    }
    setEmailError(EMAIL_FULL_REGEX.test(v) ? "" : t("booking.error_email_invalid"));
  }, [contactEmail]);

  //  handlers: chặn sai ngay lúc nhập 
  const handleNameChange = (e) => {
    const next = sanitizeName(e.target.value);
    onContactNameChange?.(next);
  };

  const handlePhoneChange = (e) => {
    const next = sanitizePhone(e.target.value);
    onContactPhoneChange?.(next);
  };

  const handleEmailChange = (e) => {
    const raw = e.target.value;
    const next = sanitizeEmail(raw);

    // chặn các trạng thái "vô lý" khi đang gõ
    if (!isEmailPartiallyValid(next)) return;

    onContactEmailChange?.(next);
  };

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm md:p-5 space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
            {t("booking.reservation_info_title")}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">
            {t("booking.reservation_info_subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Họ tên */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-800 dark:text-gray-200 md:text-sm">
            {t("booking.full_name_label")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={contactName || ""}
            onChange={handleNameChange}
            className={[
              "w-full rounded-lg border px-3 py-2 text-sm md:text-base outline-none",
              nameError ? "border-red-400 focus:border-red-500" : "border-gray-300 dark:border-gray-700 focus:border-blue-500",
              "transition",
            ].join(" ")}
            placeholder={t("booking.full_name_placeholder")}
            autoComplete="name"
          />
          {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-800 dark:text-gray-200 md:text-sm">
              {t("booking.phone_label")} <span className="text-red-500">*</span>
            </label>
            <div
              className={[
                "flex items-center rounded-lg border bg-white dark:bg-gray-800 px-3 focus-within:border-blue-500",
                phoneError ? "border-red-400" : "border-gray-300 dark:border-gray-700",
              ].join(" ")}
            >
              <Phone className="mr-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                value={contactPhone || ""}
                onChange={handlePhoneChange}
                className="h-9 w-full border-none bg-transparent text-sm outline-none md:h-10"
                placeholder={t("booking.phone_placeholder")}
                autoComplete="tel"
              />
            </div>
            {phoneError ? (
              <p className="mt-1 text-xs text-red-500">{phoneError}</p>
            ) : (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t("booking.phone_hint_exact_10")}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-800 dark:text-gray-200 md:text-sm">
              {t("booking.email_label")}
            </label>
            <div
              className={[
                "flex items-center rounded-lg border bg-white dark:bg-gray-800 px-3 focus-within:border-blue-500",
                emailError ? "border-red-400" : "border-gray-300 dark:border-gray-700",
              ].join(" ")}
            >
              <Mail className="mr-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="email"
                value={contactEmail || ""}
                onChange={handleEmailChange}
                className="h-9 w-full border-none bg-transparent text-sm outline-none md:h-10"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>
            {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
          </div>
        </div>

        {/* Guests */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("booking.guests_label")}</div>
            <div className="ml-auto text-[11px] text-gray-500 dark:text-gray-400">
              {t("common.total")}: <span className="font-semibold">{people}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">{t("booking.adults_label")}</div>
              <input
                type="number"
                min={1}
                max={50}
                value={adults}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isNaN(v)) return;
                  onAdultsChange?.(Math.min(50, Math.max(1, v)));
                }}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">{t("booking.children_label")}</div>
              <input
                type="number"
                min={0}
                max={50}
                value={children}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isNaN(v)) return;
                  onChildrenChange?.(Math.min(50, Math.max(0, v)));
                }}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            {t("booking.table_suggestion_hint")}
          </p>
        </div>

        {/* Date & time */}
        <RestaurantBookingDateTimePicker
          date={date}
          time={time}
          onChange={onDateTimeChange}
          openingHours={openingHours}
          stepMinutes={30}
        />

        {/* Table type + tables count */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <div>
              <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t("booking.table_type_label")} <span className="text-red-500">*</span>
              </div>

              <select
                value={tableTypeId || ""}
                onChange={(e) => onTableTypeChange?.(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="" disabled>
                  {t("booking.select_table_type")}
                </option>
                {tableTypes.map((tt) => (
                  <option key={tt.id} value={tt.id}>
                    {tt.name} • {t("booking.seats_count", { n: tt.seats })} • {t("booking.deposit_per_table", { amount: Number(tt.depositPrice || 0).toLocaleString("vi-VN") })}
                  </option>
                ))}
              </select>

              {/* info sức chứa */}
              {tableTypeId && tableType?.seats ? (
                <div className="mt-2 text-[12px]">
                  <div className="text-gray-600 dark:text-gray-400">
                    {t("booking.min_tables_suggestion_prefix")} <span className="font-semibold">{minTables}</span> {t("booking.min_tables_suggestion_mid")}{" "}
                    <span className="font-semibold">{people}</span> {t("booking.min_tables_suggestion_suffix")}
                  </div>

                  <div className={["mt-0.5 font-semibold", seatErrorText ? "text-red-600" : "text-emerald-700"].join(" ")}>
                    {t("booking.capacity_label")}: {tablesCount} × {tableType.seats} = {t("booking.seats_count", { n: totalSeats })}
                    {seatErrorText ? ` • ${t("booking.not_enough_seats")}` : ` • ${t("booking.enough_seats")}`}
                  </div>

                  {seatErrorText ? (
                    <div className="mt-1 text-[11px] text-red-600">{seatErrorText}</div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* stepper số bàn */}
            <div>
              <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">{t("booking.tables_count_label")}</div>

              <div className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 flex items-center justify-between">
                <button
                  type="button"
                  className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  onClick={() => onTablesCountChange?.(Math.max(1, Number(tablesCount || 1) - 1))}
                  disabled={!tableTypeId}
                >
                  −
                </button>

                <div className="min-w-[48px] text-center font-semibold text-gray-900 dark:text-gray-100">
                  {tablesCount}
                </div>

                <button
                  type="button"
                  className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  onClick={() => onTablesCountChange?.(Math.min(10, Number(tablesCount || 1) + 1))}
                  disabled={!tableTypeId}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-800 dark:text-gray-200 md:text-sm">
            {t("booking.note_label", { max: NOTE_MAX })}
          </label>

          <textarea
            value={note || ""}
            maxLength={NOTE_MAX}
            onChange={(e) => onNoteChange?.(e.target.value)}
            rows={4}
            className={[
              "w-full resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2",
              "text-sm md:text-base outline-none focus:border-blue-500",
              "transition",
              (note || "").length >= NOTE_MAX ? "border-orange-400 focus:border-orange-500" : "",
            ].join(" ")}
            placeholder={t("booking.note_placeholder_restaurant")}
          />

          <div className="mt-1 flex items-center justify-between">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("booking.note_disclaimer")}
            </p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {(note || "").length}/{NOTE_MAX}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}