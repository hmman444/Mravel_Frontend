// src/features/planBoard/components/modals/StayActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes, FaBed, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

import ActivityModalShell from "./ActivityModalShell";
import SplitMoneySection from "./SplitMoneySection";
import ExtraCostsSection from "./ExtraCostsSection";
import PlacePickerModal from "./PlacePickerModal";

import ActivityTimeRangeSection from "./ActivityTimeRangeSection";
import ActivityHeaderCostSummary from "./ActivityHeaderCostSummary";
import ActivityFooterSummary from "./ActivityFooterSummary";
import ActivityFooterButtons from "./ActivityFooterButtons";

import { inputBase, sectionCard } from "../../utils/activityStyles";
import { useSplitMoney } from "../../hooks/useSplitMoney";
import {
  buildInitialExtraCosts,
  normalizeExtraCosts,
  calcExtraTotal,
} from "../../utils/costUtils";

import {
  getLocDisplayLabel,
  slimLocationForStorage,
  normalizeLocationFromStored,
} from "../../utils/locationUtils";

import { pickStartEndFromCard } from "../../utils/activityTimeUtils";

function safeJsonParse(str) {
  try {
    if (!str) return {};
    return JSON.parse(str);
  } catch {
    return {};
  }
}

/**
 * FE policy (match BE logic):
 * - cost.estimatedCost: base (KHÔNG gồm extra)
 * - extraCosts: gửi riêng qua cost.extraCosts
 * - cost.actualCost:
 *    + user nhập -> gửi number (manual)
 *    + user xoá -> gửi null (auto)
 *
 * Display policy:
 * - estimatedTotal (tổng dự kiến để xem): base + extraTotal
 * - parsedActual (tổng để chia trên FE): userActual nếu có, else estimatedTotal
 */
export default function StayActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  stayLocation: stayLocationProp,
  readOnly,
}) {
  const { t } = useTranslation();

  const EXTRA_TYPES = [
    { value: "SERVICE_FEE", label: t("plan.extra_type.service_fee") },
    { value: "SURCHARGE", label: t("plan.extra_type.surcharge") },
    { value: "TAX", label: t("plan.extra_type.tax") },
    { value: "OTHER", label: t("plan.extra_type.other") },
  ];

  const [title, setTitle] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [address, setAddress] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  // đây là "base" (chi phí cơ bản), KHÔNG gồm extra
  const [pricePerNight, setPricePerNight] = useState("");

  const [nights, setNights] = useState("1");

  // actualCost manual input
  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);
  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalStayLocation, setInternalStayLocation] = useState(null);

  const normalizedPropLocation = useMemo(
    () => normalizeLocationFromStored(stayLocationProp) || null,
    [stayLocationProp]
  );

  const effectiveStayLocation =
    internalStayLocation || normalizedPropLocation || null;

  //  LOAD WHEN OPEN 
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = safeJsonParse(editingCard.activityDataJson);
      const cost = editingCard.cost || {};

      setTitle(editingCard.text || "");

      setHotelName(data.hotelName || "");
      setAddress(data.address || "");

      const { start, end } = pickStartEndFromCard(editingCard, data);
      setCheckIn(start);
      setCheckOut(end);
      setDurationMinutes(null);

      // 1) Load extra from cost (nguồn chuẩn), fallback activityData
      const loadedExtra = buildInitialExtraCosts(data, cost);
      setExtraCosts(loadedExtra);

      const extraTotalFromLoaded = calcExtraTotal(loadedExtra);

      // 2) Load base estimated (pricePerNight) - QUAN TRỌNG:
      // BE expects estimatedCost = BASE, extraCosts separate.
      // Nhưng dữ liệu cũ có thể đã lưu estimatedCost = (base + extra).
      // => nếu có cost.estimatedCost thì tách base = estimatedCost - extraTotalLoaded.
      let base = null;

      if (cost.estimatedCost != null) {
        const est = Number(cost.estimatedCost);
        const maybe = est - Number(extraTotalFromLoaded || 0);

        // Nếu dữ liệu cũ đúng chuẩn (estimatedCost là base),
        // maybe = base - extra (<= 0) -> fallback về est.
        base = maybe > 0 ? maybe : est;
      } else {
        // fallback legacy from activityData
        const ppn =
          data.pricePerNight != null
            ? data.pricePerNight
            : data.pricePerTime != null
            ? data.pricePerTime
            : null;

        base = ppn != null ? Number(ppn) : null;
      }

      setPricePerNight(
        base != null && !Number.isNaN(base) ? String(base) : ""
      );

      setNights(data.nights != null ? String(data.nights) : "1");

      // 3) actualCost manual
      setActualCost(
        cost.actualCost != null && cost.actualCost !== undefined
          ? String(cost.actualCost)
          : ""
      );

      setBudgetAmount(
        cost.budgetAmount != null && cost.budgetAmount !== undefined
          ? String(cost.budgetAmount)
          : ""
      );

      setNote(editingCard.description || "");

      // 4) location normalize
      setInternalStayLocation(
        normalizeLocationFromStored(data.hotelLocation) || null
      );
    } else {
      // NEW
      setTitle("");
      setHotelName("");
      setAddress("");

      setCheckIn("");
      setCheckOut("");
      setDurationMinutes(null);

      setPricePerNight("");
      setNights("1");

      setActualCost("");
      setBudgetAmount("");
      setNote("");
      setExtraCosts([]);

      setInternalStayLocation(normalizedPropLocation || null);
    }
  }, [open, editingCard, normalizedPropLocation]);

  // nếu parent đổi prop lúc đang tạo mới
  useEffect(() => {
    if (!editingCard) {
      setInternalStayLocation(normalizedPropLocation || null);
    }
  }, [normalizedPropLocation, editingCard]);

  // sync location -> name/address
  useEffect(() => {
    if (!effectiveStayLocation) return;

    const name = getLocDisplayLabel(effectiveStayLocation, "");
    const full =
      effectiveStayLocation.fullAddress || effectiveStayLocation.address || "";

    if (name) setHotelName(name);
    if (full) setAddress(full);
  }, [effectiveStayLocation]);

  //  COST CALC (UI) 
  const baseEstimated = useMemo(
    () => Number(pricePerNight || 0),
    [pricePerNight]
  );

  const extraTotal = useMemo(() => calcExtraTotal(extraCosts), [extraCosts]);

  // tổng dự kiến hiển thị (base + extra)
  const estimatedTotal = useMemo(
    () => baseEstimated + extraTotal,
    [baseEstimated, extraTotal]
  );

  // tổng để chia (manual actual nếu có, không thì dùng estimatedTotal)
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    return a > 0 ? a : estimatedTotal;
  }, [actualCost, estimatedTotal]);

  //  SPLIT HOOK 
  const splitHook = useSplitMoney({ editingCard, planMembers, parsedActual });

  const {
    splitEnabled,
    setSplitEnabled,
    splitType,
    setSplitType,
    participantCount,
    handleParticipantCount,
    splitNames,
    setSplitNames,
    exactAmounts,
    setExactAmounts,
    payerChoice,
    setPayerChoice,
    payerExternalName,
    setPayerExternalName,
    selectedMemberIds,
    setSelectedMemberIds,
    parsedParticipants,
    participants,
    split: splitPayload,
    evenShare,
    evenRemainder,
    totalExact,
  } = splitHook;

  //  EXTRA COSTS 
  const addExtraCost = () =>
    setExtraCosts((prev) => [
      ...prev,
      { reason: "", type: "OTHER", estimatedAmount: null, actualAmount: "" },
    ]);

  const updateExtraCost = (idx, key, value) => {
    setExtraCosts((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [key]: value };
      return arr;
    });
  };

  const removeExtraCost = (idx) =>
    setExtraCosts((prev) => prev.filter((_, i) => i !== idx));

  //  BUILD PAYLOAD 
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const normalizedParticipants = participants.map((p) =>
      typeof p === "number" ? p : p?.memberId
    );

    //  QUAN TRỌNG: estimatedCost = base (KHÔNG gồm extra)
    const estimatedBase = baseEstimated > 0 ? baseEstimated : null;

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedBase,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      //  user xoá => "" => null -> BE auto mode
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? Number(parsedParticipants || 0) : null,
      participants: normalizedParticipants,
      extraCosts: normalizedExtraCosts,
    };

    return { cost, split: splitPayload, participants: normalizedParticipants };
  };

  //  SUBMIT 
  const handleSubmit = () => {
    const newErrors = {};

    if (!hotelName.trim())
      newErrors.hotelName = t("plan.stay.error_name_required");

    if (checkIn && checkOut && durationMinutes == null) {
      newErrors.time = t("plan.activity.error_end_before_start");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants } = buildPayload();

    onSubmit?.({
      type: "STAY",
      title: title || t("plan.stay.default_title", { name: hotelName }),
      text: title || t("plan.stay.default_title", { name: hotelName }),
      description: note || "",
      startTime: checkIn || null,
      endTime: checkOut || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,

      activityData: {
        hotelName: hotelName.trim(),
        address: address?.trim() || null,
        hotelLocation: slimLocationForStorage(effectiveStayLocation),
        nights: nights ? Number(nights) : null,
        // giữ base cho UI (không phải “tổng để chia”)
        pricePerNight: pricePerNight ? Number(pricePerNight) : null,
      },

      cost,
      split,
    });

    onClose?.();
  };

  //  HEADER / FOOTER 
  const headerRight = (
    <ActivityHeaderCostSummary
      parsedActual={parsedActual}
      budgetAmount={budgetAmount}
      accentClass="text-violet-600 dark:text-violet-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix={t("plan.stay.label_prefix")}
      name={hotelName}
      emptyLabelText={t("plan.stay.empty_label")}
      locationText={effectiveStayLocation?.fullAddress || address || ""}
      timeText={
        checkIn && checkOut && durationMinutes != null && !errors.time
          ? t("plan.activity.time_range_minutes", {
              start: checkIn,
              end: checkOut,
              minutes: durationMinutes,
            })
          : ""
      }
    />
  );

  const footerRight = readOnly ? (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
          border border-slate-200 dark:border-slate-700
          bg-white/80 dark:bg-slate-900/70
          text-slate-700 dark:text-slate-100
          hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        {t("common.close")}
      </button>
    </div>
  ) : (
    <ActivityFooterButtons
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitLabel={
        editingCard
          ? t("plan.activity.save_edit")
          : t("plan.stay.submit_create")
      }
      submitClassName="bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaBed />,
          close: <FaTimes size={14} />,
          bg: "from-violet-500 to-purple-500",
        }}
        title={t("plan.stay.modal_title")}
        typeLabel="Stay"
        subtitle={t("plan.stay.modal_subtitle")}
        headerRight={headerRight}
        footerLeft={footerLeft}
        footerRight={footerRight}
      >
        {/* THÔNG TIN CHUNG */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.activity.general_info")}
            </label>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {t("plan.stay.general_info_hint")}
            </span>
          </div>

          <div className={sectionCard}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("plan.activity.activity_name_optional")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("plan.stay.title_placeholder")}
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            {/* PICK STAY LOCATION */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("plan.activity.address_location_label")}
              </label>

              <button
                type="button"
                onClick={() => setPlacePickerOpen(true)}
                className={`group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-violet-400 hover:shadow-md hover:bg-violet-50/70
                  dark:hover:border-violet-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.hotelName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }`}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                    bg-violet-50 text-violet-500 border border-violet-100
                    dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveStayLocation || address ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {getLocDisplayLabel(
                          effectiveStayLocation,
                          hotelName || t("plan.stay.selected_place")
                        )}
                      </p>

                      {(effectiveStayLocation?.fullAddress || address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveStayLocation?.fullAddress || address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          {t("plan.activity.picked_on_map")}
                        </span>
                        {effectiveStayLocation?.lat != null &&
                          effectiveStayLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                              {effectiveStayLocation.lat.toFixed(4)},{" "}
                              {effectiveStayLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {t("plan.stay.pick_place_title")}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {t("plan.stay.pick_place_hint")}
                      </p>
                    </>
                  )}
                </div>

                <span
                  className="hidden md:inline-flex items-center text-[11px] font-medium
                    text-violet-500 group-hover:text-violet-600 dark:text-violet-300
                    dark:group-hover:text-violet-200"
                >
                  {t("plan.activity.open_map")}
                </span>
              </button>

              {errors.hotelName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.hotelName}
                </p>
              )}
            </div>

            <ActivityTimeRangeSection
              sectionLabel={t("plan.stay.time_section")}
              startLabel={t("plan.stay.start_label")}
              endLabel={t("plan.stay.end_label")}
              color="violet"
              iconClassName="text-violet-500"
              startTime={checkIn}
              endTime={checkOut}
              onStartTimeChange={(val) => setCheckIn(val)}
              onEndTimeChange={(val) => setCheckOut(val)}
              error={errors.time}
              onErrorChange={(msg) =>
                setErrors((prev) => ({ ...prev, time: msg }))
              }
              onDurationChange={(mins) => setDurationMinutes(mins)}
              durationHintPrefix={t("plan.activity.duration_hint_prefix")}
            />
          </div>
        </section>

        {/* CHI PHÍ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.stay.cost_section")}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.activity.cost_section_hint")}
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.activity.base_cost_label")}
                </label>

                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    placeholder={t("plan.stay.base_cost_placeholder")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.stay.nights_label")}
                </label>

                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className={`${inputBase} w-full`}
                />
              </div>
            </div>

            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.activity.actual_cost_label")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder={t("plan.activity.actual_cost_placeholder")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {t("plan.activity.actual_cost_empty_prefix")}{" "}
                  <b>{t("plan.activity.ticket_cost")}</b> +{" "}
                  <b>{t("plan.activity.extra_cost")}</b>{" "}
                  {t("plan.activity.actual_cost_empty_suffix")}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.activity.budget_label")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder={t("plan.activity.budget_placeholder")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                {t("plan.activity.summary_base_cost")}:{" "}
                <span className="font-semibold">
                  {baseEstimated.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                {t("plan.activity.summary_extra")}:{" "}
                <span className="font-semibold">
                  {extraTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                {t("plan.activity.summary_estimated_total")}:{" "}
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  {t("plan.activity.summary_using_prefix")}{" "}
                  <b>{t("plan.activity.summary_actual_cost")}</b>:{" "}
                  <span className="font-semibold text-violet-600 dark:text-violet-400">
                    {Number(actualCost).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CHIA TIỀN */}
        <section className="space-y-4">
          <SplitMoneySection
            planMembers={planMembers}
            splitEnabled={splitEnabled}
            setSplitEnabled={setSplitEnabled}
            splitType={splitType}
            setSplitType={setSplitType}
            participantCount={participantCount}
            handleParticipantCount={handleParticipantCount}
            splitNames={splitNames}
            setSplitNames={setSplitNames}
            exactAmounts={exactAmounts}
            setExactAmounts={setExactAmounts}
            payerChoice={payerChoice}
            setPayerChoice={setPayerChoice}
            payerExternalName={payerExternalName}
            setPayerExternalName={setPayerExternalName}
            parsedParticipants={parsedParticipants}
            parsedActual={parsedActual}
            evenShare={evenShare}
            evenRemainder={evenRemainder}
            totalExact={totalExact}
            selectedMemberIds={selectedMemberIds}
            setSelectedMemberIds={setSelectedMemberIds}
          />
        </section>

        {/* GHI CHÚ */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.activity.note")}
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.activity.note_hint")}
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("plan.stay.note_placeholder")}
            className={`${inputBase} w-full`}
          />
        </section>
      </ActivityModalShell>

      {/* PLACE PICKER */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          if (!loc) {
            setPlacePickerOpen(false);
            return;
          }

          const slim = normalizeLocationFromStored(slimLocationForStorage(loc));
          setInternalStayLocation(slim || null);

          const name = getLocDisplayLabel(slim, "");
          const full = slim?.fullAddress || slim?.address || "";

          if (name) {
            setHotelName(name);
            setErrors((prev) => ({ ...prev, hotelName: "" }));
          }
          if (full) setAddress(full);

          setPlacePickerOpen(false);
        }}
        initialTab="HOTEL"
        activityType="STAY"
        field="stay"
        initialLocation={effectiveStayLocation}
      />
    </>
  );
}
