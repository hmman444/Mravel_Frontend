// src/features/planBoard/components/modals/TransportActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FaTimes, FaRoute, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

import { haversineDistanceKm } from "../../../planBoard/utils/distance";

import ActivityModalShell from "./ActivityModalShell";
import ExtraCostsSection from "./ExtraCostsSection";
import SplitMoneySection from "./SplitMoneySection";
import PlacePickerModal from "./PlacePickerModal";

import ActivityTimeRangeSection from "./ActivityTimeRangeSection";
import ActivityHeaderCostSummary from "./ActivityHeaderCostSummary";
import ActivityFooterSummary from "./ActivityFooterSummary";
import ActivityFooterButtons from "./ActivityFooterButtons";

import { inputBase, sectionCard, pillBtn } from "../../utils/activityStyles";
import { useSplitMoney } from "../../hooks/useSplitMoney";
import { buildInitialExtraCosts, normalizeExtraCosts, calcExtraTotal } from "../../utils/costUtils";

import {
  slimLocationForStorage,
  normalizeLocationFromStored,
  getLocDisplayLabel,
} from "../../utils/locationUtils";

import { pickStartEndFromCard } from "../../utils/activityTimeUtils";

const TRANSPORT_METHODS = [
  { value: "taxi", label: "Taxi" },
  { value: "motorbike taxi", label: "Xe ôm" },
  { value: "motorbike", label: "Xe máy" },
  { value: "car", label: "Ô tô riêng" },
  { value: "coach", label: "Xe khách" },
  { value: "plane", label: "Máy bay" },
  { value: "bus", label: "Xe buýt" },
  { value: "walk", label: "Đi bộ" },
  { value: "shift", label: "Tàu thuyền" },
  { value: "train", label: "Tàu điện" },
  { value: "other", label: "Khác" },

];

const EXTRA_TYPES = [
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "TAX", label: "Thuế" },
  { value: "OTHER", label: "Khác" },
];

function safeJsonParse(str) {
  try {
    if (!str) return {};
    return JSON.parse(str);
  } catch {
    return {};
  }
}

export default function TransportActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  readOnly = false,
}) {
  const [title, setTitle] = useState("");

  // Fallback text (data cũ / user gõ tay)
  const [fromPlaceText, setFromPlaceText] = useState("");
  const [toPlaceText, setToPlaceText] = useState("");

  const [stops, setStops] = useState([]);
  const [method, setMethod] = useState("taxi");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  // BASE = cước chính (không gồm phát sinh)
  const [estimatedCostInput, setEstimatedCostInput] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);
  const [note, setNote] = useState("");

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [placePickerField, setPlacePickerField] = useState(null); // "from" | "to"

  const [internalFromLocation, setInternalFromLocation] = useState(null);
  const [internalToLocation, setInternalToLocation] = useState(null);

  const effectiveFromLocation = internalFromLocation || null;
  const effectiveToLocation = internalToLocation || null;

  // ===== LOAD WHEN OPEN =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = safeJsonParse(editingCard.activityDataJson);
      const cost = editingCard.cost || {};

      setTitle(editingCard.text || "");

      // Fallback text (data cũ)
      setFromPlaceText(data.fromPlace || "");
      setToPlaceText(data.toPlace || "");

      setStops(Array.isArray(data.stops) ? data.stops : []);
      setMethod(data.method || "taxi");

      const { start, end } = pickStartEndFromCard(editingCard, data);
      setStartTime(start);
      setEndTime(end);
      setDurationMinutes(null);

      // 1) load extra trước để có extraTotal (phục vụ tách base nếu data cũ)
      const loadedExtra = buildInitialExtraCosts(data, cost);
      setExtraCosts(loadedExtra);
      const extraTotalFromLoaded = calcExtraTotal(loadedExtra);

      // 2) base estimated:
      // - ưu tiên data.estimatedBase / data.estimatedCost
      // - fallback cost.estimatedCost
      // - nếu cost.estimatedCost trước đây là (base+extra) -> tách base = est - extra
      const baseFromData =
        data.estimatedBase != null
          ? Number(data.estimatedBase)
          : data.estimatedCost != null
          ? Number(data.estimatedCost)
          : null;

      let base =
        baseFromData != null
          ? baseFromData
          : cost.estimatedCost != null
          ? Number(cost.estimatedCost)
          : null;

      if (base != null && cost.estimatedCost != null && baseFromData == null) {
        const est = Number(cost.estimatedCost);
        const maybe = est - Number(extraTotalFromLoaded || 0);
        // nếu data cũ từng lưu estimatedCost = base+extra, thì maybe sẽ là base hợp lý
        if (maybe > 0 && maybe < est) base = maybe;
      }

      setEstimatedCostInput(base != null && !Number.isNaN(base) ? String(base) : "");

      setBudgetAmount(cost.budgetAmount != null ? String(cost.budgetAmount) : "");
      setActualCost(cost.actualCost != null ? String(cost.actualCost) : "");

      setNote(editingCard.description || "");

      setInternalFromLocation(normalizeLocationFromStored(data.fromLocation) || null);
      setInternalToLocation(normalizeLocationFromStored(data.toLocation) || null);

      // nếu loc mới có label -> sync text
      if (data.fromLocation) {
        const n = normalizeLocationFromStored(data.fromLocation);
        if (n) setFromPlaceText(getLocDisplayLabel(n, data.fromPlace || ""));
      }
      if (data.toLocation) {
        const n = normalizeLocationFromStored(data.toLocation);
        if (n) setToPlaceText(getLocDisplayLabel(n, data.toPlace || ""));
      }
    } else {
      setTitle("");
      setFromPlaceText("");
      setToPlaceText("");
      setStops([]);
      setMethod("taxi");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setEstimatedCostInput("");
      setBudgetAmount("");
      setActualCost("");
      setExtraCosts([]);
      setNote("");

      setInternalFromLocation(null);
      setInternalToLocation(null);
      setPlacePickerField(null);
      setPlacePickerOpen(false);
    }
  }, [open, editingCard]);

  // ===== SYNC label from locations -> text =====
  useEffect(() => {
    if (!effectiveFromLocation) return;
    const label = getLocDisplayLabel(effectiveFromLocation, "");
    if (label) setFromPlaceText(label);
  }, [effectiveFromLocation]);

  useEffect(() => {
    if (!effectiveToLocation) return;
    const label = getLocDisplayLabel(effectiveToLocation, "");
    if (label) setToPlaceText(label);
  }, [effectiveToLocation]);

  // ===== STOPS =====
  const addStop = () => setStops((prev) => [...prev, ""]);

  const changeStop = (v, idx) => {
    setStops((prev) => {
      const arr = [...prev];
      arr[idx] = v;
      return arr;
    });
  };

  const removeStop = (idx) => setStops((prev) => prev.filter((_, i) => i !== idx));

  // ===== EXTRA COSTS =====
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

  const removeExtraCost = (idx) => setExtraCosts((prev) => prev.filter((_, i) => i !== idx));

  // ===== COST CALC =====
  const baseEstimated = useMemo(() => Number(estimatedCostInput || 0), [estimatedCostInput]);
  const extraTotal = useMemo(() => calcExtraTotal(extraCosts), [extraCosts]);
  const estimatedTotal = useMemo(() => baseEstimated + extraTotal, [baseEstimated, extraTotal]);

  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    return a > 0 ? a : estimatedTotal;
  }, [actualCost, estimatedTotal]);

  // ===== SPLIT HOOK =====
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

  // ===== DISTANCE / MAPS =====
  const distanceKm = useMemo(() => {
    if (effectiveFromLocation?.lat == null || effectiveFromLocation?.lng == null) return null;
    if (effectiveToLocation?.lat == null || effectiveToLocation?.lng == null) return null;

    return haversineDistanceKm(
      { lat: effectiveFromLocation.lat, lng: effectiveFromLocation.lng },
      { lat: effectiveToLocation.lat, lng: effectiveToLocation.lng }
    );
  }, [effectiveFromLocation, effectiveToLocation]);

  const mapsDirectionUrl =
    effectiveFromLocation?.lat != null &&
    effectiveFromLocation?.lng != null &&
    effectiveToLocation?.lat != null &&
    effectiveToLocation?.lng != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          `${effectiveFromLocation.lat},${effectiveFromLocation.lng}`
        )}&destination=${encodeURIComponent(
          `${effectiveToLocation.lat},${effectiveToLocation.lng}`
        )}&travelmode=driving`
      : null;

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const normalizedParticipants = participants.map((p) => (typeof p === "number" ? p : p.memberId));

    //  estimatedCost = BASE (không gồm extra)
    const estimatedBase = baseEstimated > 0 ? baseEstimated : null;

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedBase,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? Number(parsedParticipants || 0) : null,
      participants: normalizedParticipants,
      extraCosts: normalizedExtraCosts,
    };

    return { cost, split: splitPayload, participants: normalizedParticipants };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!fromPlaceText.trim()) newErrors.from = "Vui lòng chọn điểm đi.";
    if (!toPlaceText.trim()) newErrors.to = "Vui lòng chọn điểm đến.";

    if (startTime && endTime && durationMinutes == null) {
      newErrors.time = "Giờ kết thúc phải muộn hơn giờ bắt đầu.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants } = buildPayload();

    onSubmit?.({
      type: "TRANSPORT",
      title: title || `Di chuyển: ${fromPlaceText} → ${toPlaceText}`,
      text: title || `Di chuyển: ${fromPlaceText} → ${toPlaceText}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount: splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,

      //  activityData gọn: chỉ đặc thù TRANSPORT
      activityData: {
        fromPlace: fromPlaceText.trim(),
        toPlace: toPlaceText.trim(),
        fromLocation: slimLocationForStorage(effectiveFromLocation),
        toLocation: slimLocationForStorage(effectiveToLocation),
        stops: (stops || []).map((s) => s.trim()).filter(Boolean),
        method,
      },

      cost,
      split,
    });

    onClose?.();
  };

  // ===== HEADER / FOOTER =====
  const headerRight = (
    <ActivityHeaderCostSummary
      parsedActual={parsedActual}
      budgetAmount={budgetAmount}
      accentClass="text-sky-600 dark:text-sky-400"
    />
  );

  const footerName =
    fromPlaceText && toPlaceText
      ? `${fromPlaceText} → ${toPlaceText}${
          distanceKm != null ? ` (Khoảng cách ước tính: ${distanceKm.toFixed(1)} km)` : ""
        }`
      : "";

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Di chuyển"
      name={footerName}
      emptyLabelText="Điền đầy đủ điểm đi và điểm đến để lưu hoạt động."
      locationText={
        effectiveFromLocation?.fullAddress || effectiveToLocation?.fullAddress
          ? `${effectiveFromLocation?.fullAddress || ""} → ${effectiveToLocation?.fullAddress || ""}`
          : ""
      }
      timeText={
        startTime && endTime && durationMinutes != null && !errors.time
          ? `${startTime} - ${endTime} (${durationMinutes} phút)`
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
        Đóng
      </button>
    </div>
  ) : (
    <ActivityFooterButtons
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động di chuyển"}
      submitClassName="bg-gradient-to-r from-sky-500 via-sky-500 to-indigo-500 shadow-lg shadow-sky-500/30"
    />
  );

  // Anchor cho PlacePicker (gợi ý map focus)
  let anchorPoint = null;
  if (placePickerField === "from" && effectiveToLocation?.lat != null && effectiveToLocation?.lng != null) {
    anchorPoint = {
      lat: effectiveToLocation.lat,
      lng: effectiveToLocation.lng,
      label: getLocDisplayLabel(effectiveToLocation, ""),
    };
  }
  if (placePickerField === "to" && effectiveFromLocation?.lat != null && effectiveFromLocation?.lng != null) {
    anchorPoint = {
      lat: effectiveFromLocation.lat,
      lng: effectiveFromLocation.lng,
      label: getLocDisplayLabel(effectiveFromLocation, ""),
    };
  }

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{ main: <FaRoute />, close: <FaTimes size={14} />, bg: "from-sky-500 to-indigo-500" }}
        title="Hoạt động di chuyển"
        typeLabel="Transport"
        subtitle="Ghi lại quãng đường, thời gian, chi phí và chia tiền cho nhóm."
        headerRight={headerRight}
        footerLeft={footerLeft}
        footerRight={footerRight}
      >
        {/* THÔNG TIN CHUNG */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Thông tin chung</label>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Tên + điểm đi/đến + điểm ghé
            </span>
          </div>

          <div className={sectionCard}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Tên hoạt động (tuỳ chọn)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`${inputBase} w-full mt-1`}
                placeholder="VD: Taxi từ khách sạn về phố đi bộ"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {/* FROM */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Đi từ <span className="text-red-500 align-middle">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setPlacePickerField("from");
                    setPlacePickerOpen(true);
                  }}
                  className={`group mt-1 w-full rounded-2xl border px-3 py-2.5
                    flex items-start gap-3 text-left
                    bg-white/90 dark:bg-slate-900/80
                    border-slate-200/80 dark:border-slate-700
                    hover:border-sky-400 hover:shadow-md hover:bg-sky-50/70
                    dark:hover:border-sky-500 dark:hover:bg-slate-900
                    transition
                    ${
                      errors.from
                        ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                        : ""
                    }`}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                      bg-sky-50 text-sky-500 border border-sky-100
                      dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800"
                  >
                    <FaMapMarkerAlt />
                  </div>

                  <div className="flex-1 min-w-0">
                    {effectiveFromLocation || fromPlaceText ? (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {getLocDisplayLabel(effectiveFromLocation, fromPlaceText || "Điểm xuất phát")}
                        </p>

                        {effectiveFromLocation?.fullAddress && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {effectiveFromLocation.fullAddress}
                          </p>
                        )}

                        {!effectiveFromLocation && fromPlaceText && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {fromPlaceText}
                          </p>
                        )}

                        {effectiveFromLocation?.lat != null && effectiveFromLocation?.lng != null && (
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                              Đã chọn trên bản đồ
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                              {effectiveFromLocation.lat.toFixed(4)}, {effectiveFromLocation.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                          Chọn điểm xuất phát trên bản đồ
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Nhấn để mở Map, chọn địa điểm làm điểm đi.
                        </p>
                      </>
                    )}
                  </div>

                  <span
                    className="hidden md:inline-flex items-center text-[11px] font-medium
                      text-sky-500 group-hover:text-sky-600 dark:text-sky-300 dark:group-hover:text-sky-200"
                  >
                    Mở bản đồ
                  </span>
                </button>

                {errors.from && <p className="mt-1 text-[11px] text-rose-500">{errors.from}</p>}
              </div>

              {/* TO */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Đến <span className="text-red-500 align-middle">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setPlacePickerField("to");
                    setPlacePickerOpen(true);
                  }}
                  className={`group mt-1 w-full rounded-2xl border px-3 py-2.5
                    flex items-start gap-3 text-left
                    bg-white/90 dark:bg-slate-900/80
                    border-slate-200/80 dark:border-slate-700
                    hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/70
                    dark:hover:border-emerald-500 dark:hover:bg-slate-900
                    transition
                    ${
                      errors.to
                        ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                        : ""
                    }`}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                      bg-emerald-50 text-emerald-500 border border-emerald-100
                      dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                  >
                    <FaMapMarkerAlt />
                  </div>

                  <div className="flex-1 min-w-0">
                    {effectiveToLocation || toPlaceText ? (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {getLocDisplayLabel(effectiveToLocation, toPlaceText || "Điểm đến")}
                        </p>

                        {effectiveToLocation?.fullAddress && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {effectiveToLocation.fullAddress}
                          </p>
                        )}

                        {!effectiveToLocation && toPlaceText && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {toPlaceText}
                          </p>
                        )}

                        {effectiveToLocation?.lat != null && effectiveToLocation?.lng != null && (
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                              Đã chọn trên bản đồ
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                              {effectiveToLocation.lat.toFixed(4)}, {effectiveToLocation.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                          Chọn điểm đến trên bản đồ
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Nhấn để mở Map, chọn địa điểm làm điểm đến.
                        </p>
                      </>
                    )}
                  </div>

                  <span
                    className="hidden md:inline-flex items-center text-[11px] font-medium
                      text-emerald-500 group-hover:text-emerald-600 dark:text-emerald-300 dark:group-hover:text-emerald-200"
                  >
                    Mở bản đồ
                  </span>
                </button>

                {errors.to && <p className="mt-1 text-[11px] text-rose-500">{errors.to}</p>}
              </div>

              {mapsDirectionUrl && (
                <div className="mt-1 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => window.open(mapsDirectionUrl, "_blank")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl
                      bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-medium
                      hover:bg-sky-100 hover:border-sky-300
                      dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-800
                      dark:hover:bg-sky-900/60"
                  >
                    <FaRoute size={11} />
                    <span>Mở chỉ đường trên Google Maps</span>
                  </button>
                </div>
              )}
            </div>

            {/* STOPS */}
            <div className="pt-1 mt-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Ghé ngang</label>
                <button
                  onClick={addStop}
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-300 hover:text-sky-500"
                >
                  + Thêm điểm dừng
                </button>
              </div>

              {stops.length > 0 && (
                <div className="space-y-2 mt-2">
                  {stops.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={s}
                        onChange={(e) => changeStop(e.target.value, i)}
                        className={`${inputBase} flex-1`}
                        placeholder={`Điểm dừng ${i + 1}`}
                      />
                      <button
                        onClick={() => removeStop(i)}
                        type="button"
                        className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50
                          dark:hover:bg-rose-950/40 transition"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* METHOD & TIME */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Phương tiện & Thời gian</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Chọn cách đi + giờ đi/đến</span>
          </div>

          <div className={sectionCard + " space-y-3"}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Phương tiện</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {TRANSPORT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`${pillBtn} ${
                      m.value === method
                        ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/30"
                        : "bg-white/80 border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <ActivityTimeRangeSection
              sectionLabel="Thời gian di chuyển"
              startLabel="Bắt đầu"
              endLabel="Kết thúc"
              color="sky"
              iconClassName="text-sky-500"
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={(val) => setStartTime(val)}
              onEndTimeChange={(val) => setEndTime(val)}
              error={errors.time}
              onErrorChange={(msg) => setErrors((prev) => ({ ...prev, time: msg }))}
              onDurationChange={(mins) => setDurationMinutes(mins)}
              durationHintPrefix="Thời lượng dự kiến"
            />
          </div>
        </section>

        {/* COST */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ngân sách & chi phí</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Ước lượng + phát sinh + thực tế</span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Chi phí ước lượng (cước chính)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={estimatedCostInput}
                    onChange={(e) => setEstimatedCostInput(e.target.value)}
                    className={`${inputBase} flex-1`}
                    placeholder="VD: 50000"
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Ngân sách cho hoạt động (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <FaMoneyBillWave className="text-indigo-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Không bắt buộc"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
            />

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Tổng chi phí thực tế cho chuyến này (nếu có)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <FaMoneyBillWave className="text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="Điền lại sau khi thanh toán"
                  className={`${inputBase} flex-1`}
                />
                <span className="text-xs text-slate-500">đ</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Nếu để trống, hệ thống sẽ dùng <b>chi phí ước lượng</b> + <b>phát sinh</b> để chia tiền.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Cước chính ước lượng:{" "}
                <span className="font-semibold">{baseEstimated.toLocaleString("vi-VN")}đ</span>
              </div>
              <div>
                Phát sinh:{" "}
                <span className="font-semibold">{extraTotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div>
                Tổng dự kiến:{" "}
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b>:{" "}
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {Number(actualCost).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              {budgetAmount && Number(budgetAmount) > 0 && (
                <div>
                  Ngân sách:{" "}
                  <span className="font-semibold">{Number(budgetAmount).toLocaleString("vi-VN")}đ</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SPLIT */}
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

        {/* NOTE */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ghi chú</label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Thêm thông tin nhỏ cho cả nhóm</span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${inputBase} w-full`}
            placeholder="VD: Nhớ mang tiền lẻ, nhắn trước cho tài xế..."
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
          const label = getLocDisplayLabel(slim, "");

          if (placePickerField === "from") {
            setInternalFromLocation(slim);
            if (label) setFromPlaceText(label);
            setErrors((prev) => ({ ...prev, from: "" }));
          } else if (placePickerField === "to") {
            setInternalToLocation(slim);
            if (label) setToPlaceText(label);
            setErrors((prev) => ({ ...prev, to: "" }));
          }

          setPlacePickerOpen(false);
        }}
        initialTab="PLACE"
        activityType="TRANSPORT"
        field={placePickerField}
        initialLocation={
          placePickerField === "from"
            ? effectiveFromLocation
            : placePickerField === "to"
            ? effectiveToLocation
            : null
        }
        anchorPoint={anchorPoint}
      />
    </>
  );
}
