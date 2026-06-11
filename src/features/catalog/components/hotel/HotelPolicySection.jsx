// src/features/hotels/components/hotel/HotelPolicySection.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  FileText,
  Info,
  ShieldCheck,
  Cigarette,
  Dog,
  PlaneTakeoff,
  ChevronRight,
} from "lucide-react";

export default function HotelPolicySection({ hotel }) {
    const { t } = useTranslation();
    // state show / hide extra policies
    const [showAll, setShowAll] = useState(false);
    if (!hotel || !hotel.policy) return null;

  const { policy, generalInfo } = hotel;

  const items = Array.isArray(policy.items) ? policy.items : [];

  const bySection = items.reduce((acc, item) => {
    const key = item.section || "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const firstOf = (section) =>
    (bySection[section] && bySection[section][0]) || null;

  const checkinItem = firstOf("CHECKIN_CHECKOUT");
  const requiredDocs = firstOf("REQUIRED_DOCUMENTS");
  const guide = firstOf("GENERAL_CHECKIN_GUIDE");
  const minAge = firstOf("MIN_AGE");
  const earlyCheckin = firstOf("EARLY_CHECKIN");
  const lateCheckout = firstOf("LATE_CHECKOUT");
  const smoking = firstOf("SMOKING");
  const pets = firstOf("PETS");
  const airportTransfer = firstOf("AIRPORT_TRANSFER");

  const formatHHmm = (value) => {
    if (!value) return "";
    const str = String(value);
    const m = str.match(/(\d{1,2}):(\d{2})/);
    if (!m) return str;
    const h = m[1].padStart(2, "0");
    const mm = m[2];
    return `${h}:${mm}`;
  };

  const checkInTime = formatHHmm(policy.checkInFrom);
  const checkOutTime = formatHHmm(policy.checkOutUntil);

  const hasBreakfast = hotel.filterFacets?.hasBreakfastIncluded;

  const extraPolicies = [
    minAge && {
      key: "MIN_AGE",
      icon: <ShieldCheck className="h-4 w-4" />,
      item: minAge,
    },
    earlyCheckin && {
      key: "EARLY_CHECKIN",
      icon: <Clock className="h-4 w-4" />,
      item: earlyCheckin,
    },
    lateCheckout && {
      key: "LATE_CHECKOUT",
      icon: <Clock className="h-4 w-4" />,
      item: lateCheckout,
    },
    smoking && {
      key: "SMOKING",
      icon: <Cigarette className="h-4 w-4" />,
      item: smoking,
    },
    pets && {
      key: "PETS",
      icon: <Dog className="h-4 w-4" />,
      item: pets,
    },
    airportTransfer && {
      key: "AIRPORT_TRANSFER",
      icon: <PlaneTakeoff className="h-4 w-4" />,
      item: airportTransfer,
    },
  ].filter(Boolean);

  return (
    <section className="mt-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="grid gap-0 md:grid-cols-[270px,1fr]">
        {/* LEFT PANEL */}
        <div className="bg-gradient-to-b from-[#dbeeff] to-[#f4f9ff] dark:from-slate-900 dark:to-slate-800 px-6 py-6 md:py-8">
          <h2 className="text-base font-semibold leading-relaxed text-gray-900 dark:text-gray-100 md:text-lg">
            {t("hotel.policy_section_title")}{" "}
            <span className="block md:inline">{hotel.name}</span>
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="border-l border-gray-100 dark:border-gray-700 px-6 py-6 space-y-5">
          {/*  Chính sách lưu trú (thẻ trên cùng)  */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f2ff] dark:bg-sky-950/50 text-[#0064d2] dark:text-sky-300">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t("hotel.stay_policy")}
                </p>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                  {t("hotel.stay_policy_desc")}
                </p>
              </div>
            </div>
          </div>

          {/*  Thời gian nhận / trả phòng  */}
          <PolicyCard
            icon={<Clock className="h-4 w-4" />}
            title={checkinItem?.title || t("hotel.checkin_checkout_time")}
          >
            <div className="grid gap-y-1 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2">
              <div className="flex gap-1.5">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("hotel.checkin_time_label")}
                </span>
                <span>{checkInTime ? t("hotel.from_time", { time: checkInTime }) : t("hotel.as_per_regulation")}</span>
              </div>
              <div className="flex gap-1.5">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("hotel.checkout_time_label")}
                </span>
                <span>
                  {checkOutTime ? t("hotel.before_time", { time: checkOutTime }) : t("hotel.as_per_regulation")}
                </span>
              </div>
            </div>
          </PolicyCard>

          {/*  Giấy tờ bắt buộc  */}
          {requiredDocs && (
            <PolicyCard
              icon={<FileText className="h-4 w-4" />}
              title={requiredDocs.title}
            >
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {requiredDocs.content}
              </p>
            </PolicyCard>
          )}

          {/*  Hướng dẫn nhận phòng chung  */}
          {guide && (
            <PolicyCard icon={<Info className="h-4 w-4" />} title={guide.title}>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {guide.content}
              </p>
            </PolicyCard>
          )}

          {/*  Nút Đọc tất cả / Thu gọn  */}
          {extraPolicies.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0064d2] dark:text-sky-300 hover:underline"
            >
              {showAll ? t("common.collapse") : t("hotel.read_all")}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}

          {/*  Các policy khác, chỉ hiện khi showAll === true  */}
          {showAll && extraPolicies.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {extraPolicies.map(({ key, icon, item }) => (
                <PolicyCard key={key} icon={icon} title={item.title}>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {item.content}
                  </p>
                </PolicyCard>
              ))}
            </div>
          )}

          {/*  Thông tin chung (bảng như Traveloka)  */}
          {generalInfo && (
            <div className="mt-4 border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-[#f4f7ff] dark:bg-slate-900 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t("hotel.general_info")}
                </h3>
              </div>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700 text-sm bg-white dark:bg-slate-800">
                {generalInfo.mainFacilitiesSummary && (
                  <InfoRow
                    label={t("hotel.main_facilities")}
                    value={generalInfo.mainFacilitiesSummary}
                  />
                )}

                <InfoRow
                  label={t("hotel.checkin_checkout_short")}
                  value={
                    checkInTime && checkOutTime
                      ? t("hotel.from_to_time", { from: checkInTime, to: checkOutTime })
                      : checkinItem?.content
                  }
                />

                {generalInfo.distanceToCityCenterKm != null && (
                  <InfoRow
                    label={t("hotel.distance_to_city_center")}
                    value={`${generalInfo.distanceToCityCenterKm} km`}
                  />
                )}

                {generalInfo.popularAreaSummary && (
                  <InfoRow
                    label={t("hotel.popular_area")}
                    value={generalInfo.popularAreaSummary}
                  />
                )}

                {typeof hasBreakfast === "boolean" && (
                  <InfoRow
                    label={t("hotel.has_breakfast")}
                    value={
                      hasBreakfast
                        ? t("hotel.breakfast_available")
                        : t("hotel.breakfast_no_info")
                    }
                  />
                )}

                {generalInfo.totalRooms != null && (
                  <InfoRow
                    label={t("hotel.available_rooms_at", { name: hotel.name })}
                    value={String(generalInfo.totalRooms)}
                  />
                )}

                {generalInfo.totalFloors != null && (
                  <InfoRow
                    label={t("hotel.total_floors_at", { name: hotel.name })}
                    value={String(generalInfo.totalFloors)}
                  />
                )}

                {generalInfo.otherHighlightFacilities && (
                  <InfoRow
                    label={t("hotel.other_facilities_at", { name: hotel.name })}
                    value={generalInfo.otherHighlightFacilities}
                  />
                )}

                {generalInfo.interestingPlacesSummary && (
                  <InfoRow
                    label={t("hotel.interesting_places_nearby")}
                    value={generalInfo.interestingPlacesSummary}
                  />
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

//  Sub components 

function PolicyCard({ icon, title, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#e6f2ff] text-[#0064d2]">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[40%_60%] gap-x-3 bg-white dark:bg-gray-800 odd:bg-[#f9fafb]">
      <dt className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
        {label}
      </dt>
      <dd className="px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200">{value}</dd>
    </div>
  );
}