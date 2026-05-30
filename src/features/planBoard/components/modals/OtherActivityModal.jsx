// src/features/planBoard/components/modals/OtherActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes, FaPenFancy, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

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
  slimLocationForStorage,
  normalizeLocationFromStored,
  getLocDisplayLabel,
} from "../../utils/locationUtils";

import { pickStartEndFromCard } from "../../utils/activityTimeUtils";

const safeJsonParse = (str) => {
  try {
    return str ? JSON.parse(str) : {};
  } catch {
    return {};
  }
};

export default function OtherActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  readOnly = false,
}) {
  const { t } = useTranslation();

  const EXTRA_TYPES = useMemo(
    () => [
      { value: "SERVICE_FEE", label: t("plan.extra_cost.type_service_fee") },
      { value: "SURCHARGE", label: t("plan.extra_cost.type_surcharge") },
      { value: "TAX", label: t("plan.extra_cost.type_tax") },
      { value: "OTHER", label: t("plan.extra_cost.type_other") },
    ],
    [t]
  );

  const [title, setTitle] = useState("");
  const [locationText, setLocationText] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  // Chi phí chính (không cộng extra)
  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const [note, setNote] = useState("");
  const [customFields, setCustomFields] = useState([{ key: "", value: "" }]);

  const [extraCosts, setExtraCosts] = useState([]);

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalOtherLocation, setInternalOtherLocation] = useState(null);
  const effectiveOtherLocation = internalOtherLocation || null;

  const [errors, setErrors] = useState({});

  //  LOAD WHEN OPEN 
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = safeJsonParse(editingCard.activityDataJson);
      const cost = editingCard.cost || {};

      setTitle(editingCard.text || data?.title || t("plan.modal.other.default_title"));
      setLocationText(data.locationText || data.location || "");

      const { start, end } = pickStartEndFromCard(editingCard, data);
      setStartTime(start);
      setEndTime(end);
      setDurationMinutes(null);

      // estimatedCost = chi phí chính (không cộng extra)
      if (cost.estimatedCost != null) {
        setEstimatedCost(String(cost.estimatedCost));
      } else if (data.estimatedCost != null) {
        setEstimatedCost(String(data.estimatedCost));
      } else {
        setEstimatedCost("");
      }

      setActualCost(cost.actualCost != null ? String(cost.actualCost) : "");
      setBudgetAmount(cost.budgetAmount != null ? String(cost.budgetAmount) : "");

      setNote(editingCard.description || "");

      setCustomFields(
        Array.isArray(data.customFields) && data.customFields.length > 0
          ? data.customFields
          : [{ key: "", value: "" }]
      );

      setExtraCosts(buildInitialExtraCosts(data, cost));

      const nLoc = normalizeLocationFromStored(data.otherLocation) || null;
      setInternalOtherLocation(nLoc);

      // sync text from loc (nếu có)
      if (nLoc) {
        const label = getLocDisplayLabel(nLoc, "");
        if (label && !locationText) setLocationText(label);

        if (nLoc.fullAddress || nLoc.address) {
          // ưu tiên address dạng đầy đủ
          setLocationText((prev) => prev || (nLoc.fullAddress || nLoc.address || ""));
        }
      }
    } else {
      // RESET new
      setTitle("");
      setLocationText("");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setEstimatedCost("");
      setActualCost("");
      setBudgetAmount("");

      setNote("");
      setCustomFields([{ key: "", value: "" }]);

      setExtraCosts([]);
      setInternalOtherLocation(null);
      setPlacePickerOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingCard]);

  //  SYNC MAP -> locationText 
  useEffect(() => {
    if (!effectiveOtherLocation) return;

    const label = getLocDisplayLabel(effectiveOtherLocation, "");
    const addr = effectiveOtherLocation.fullAddress || effectiveOtherLocation.address;

    if (addr || label) {
      setLocationText(addr || label || "");
      setErrors((prev) => ({ ...prev, location: "" }));
    }
  }, [effectiveOtherLocation]);

  //  COST LOGIC 
  const estimatedValue = useMemo(() => Number(estimatedCost || 0), [estimatedCost]);

  const extraTotal = useMemo(() => calcExtraTotal(extraCosts), [extraCosts]);

  // tổng để hiển thị & fallback chia tiền
  const estimatedTotal = useMemo(
    () => estimatedValue + extraTotal,
    [estimatedValue, extraTotal]
  );

  // chia tiền dùng actual nếu có, không thì estimatedTotal
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    return a > 0 ? a : estimatedTotal;
  }, [actualCost, estimatedTotal]);

  //  SPLIT HOOK 
  const splitHook = useSplitMoney({
    editingCard,
    planMembers,
    parsedActual,
  });

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

  //  EXTRA COST CRUD 
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

  //  CUSTOM FIELDS CRUD 
  const handleAddField = () => setCustomFields((prev) => [...prev, { key: "", value: "" }]);

  const handleChangeField = (index, field, value) => {
    setCustomFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveField = (index) =>
    setCustomFields((prev) => prev.filter((_, i) => i !== index));

  //  BUILD PAYLOAD 
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const normalizedParticipants = participants.map((p) =>
      typeof p === "number" ? p : p?.memberId
    );

    const cost = {
      currencyCode: "VND",
      //  estimatedCost chỉ là chi phí chính
      estimatedCost: estimatedValue > 0 ? estimatedValue : null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? Number(parsedParticipants || 0) : null,
      participants: normalizedParticipants,
      extraCosts: normalizedExtraCosts,
    };

    return {
      cost,
      split: splitPayload,
      participants: normalizedParticipants,
      normalizedExtraCosts,
    };
  };

  //  SUBMIT 
  const handleSubmit = () => {
    const newErrors = {};

    if (!locationText.trim() && !effectiveOtherLocation) {
      newErrors.location = t("plan.validation.location_required");
    }

    if (startTime && endTime && durationMinutes == null) {
      newErrors.time = t("plan.validation.end_after_start");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants } = buildPayload();

    onSubmit?.({
      type: "OTHER",
      title: title || t("plan.modal.other.default_title"),
      text: title || t("plan.modal.other.default_title"),
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,

      //  activityData gọn
      activityData: {
        locationText: (locationText || "").trim(),
        otherLocation: slimLocationForStorage(effectiveOtherLocation),
        customFields: customFields.filter(
          (f) => (f.key || "").trim() !== "" || (f.value || "").trim() !== ""
        ),
      },

      cost,
      split,
    });

    onClose?.();
  };

  //  HEADER + FOOTER 
  const headerRight = (
    <ActivityHeaderCostSummary
      parsedActual={parsedActual}
      budgetAmount={budgetAmount}
      accentClass="text-slate-800 dark:text-slate-100"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix={t("plan.modal.other.footer_label_prefix")}
      name={title || t("plan.modal.other.default_title")}
      emptyLabelText={t("plan.modal.other.empty_name_hint")}
      locationText={
        effectiveOtherLocation || locationText
          ? t("plan.modal.other.footer_location", {
              location:
                effectiveOtherLocation?.label ||
                effectiveOtherLocation?.name ||
                effectiveOtherLocation?.address ||
                effectiveOtherLocation?.fullAddress ||
                locationText,
            })
          : ""
      }
      timeText={
        startTime && endTime && durationMinutes != null && !errors.time
          ? t("plan.modal.other.footer_time", {
              start: startTime,
              end: endTime,
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
      submitLabel={editingCard ? t("plan.modal.other.submit_edit") : t("plan.modal.other.submit_create")}
      submitClassName="bg-gradient-to-r from-slate-600 to-gray-700 shadow-lg shadow-slate-600/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaPenFancy />,
          close: <FaTimes size={14} />,
          bg: "from-slate-600 to-gray-700",
        }}
        title={t("plan.modal.other.title")}
        typeLabel="Other"
        subtitle={t("plan.modal.other.subtitle")}
        headerRight={headerRight}
        footerLeft={footerLeft}
        footerRight={footerRight}
      >
        {/* THÔNG TIN CHUNG */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.modal.other.general_info")}
            </label>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {t("plan.modal.other.general_info_hint")}
            </span>
          </div>

          <div className={sectionCard}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("plan.modal.other.activity_name")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("plan.modal.other.activity_name_placeholder")}
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            {/* ĐỊA ĐIỂM */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("plan.modal.other.location")}
              </label>

              <button
                type="button"
                onClick={() => setPlacePickerOpen(true)}
                className={`group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-slate-500 hover:shadow-md hover:bg-slate-50/80
                  dark:hover:border-slate-400 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.location
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }`}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                    bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700
                    dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveOtherLocation || locationText ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveOtherLocation?.label ||
                          effectiveOtherLocation?.name ||
                          t("plan.modal.other.selected_location")}
                      </p>
                      {(effectiveOtherLocation?.address ||
                        effectiveOtherLocation?.fullAddress ||
                        locationText) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveOtherLocation?.address ||
                            effectiveOtherLocation?.fullAddress ||
                            locationText}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          {t("plan.modal.other.picked_on_map")}
                        </span>
                        {effectiveOtherLocation?.lat != null &&
                          effectiveOtherLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300 dark:bg-slate-900/40 dark:text-slate-200">
                              {effectiveOtherLocation.lat.toFixed(4)},{" "}
                              {effectiveOtherLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {t("plan.modal.other.pick_location_title")}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {t("plan.modal.other.pick_location_hint")}
                      </p>
                    </>
                  )}
                </div>

                <span
                  className="hidden md:inline-flex items-center text-[11px] font-medium
                    text-slate-500 group-hover:text-slate-700 dark:text-slate-300
                    dark:group-hover:text-slate-100"
                >
                  {t("plan.modal.other.open_map")}
                </span>
              </button>

              {errors.location && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.location}</p>
              )}
            </div>

            {/* TIME */}
            <div className="mt-3">
              <ActivityTimeRangeSection
                sectionLabel={t("plan.modal.other.activity_time")}
                startLabel={t("plan.time.start")}
                endLabel={t("plan.time.end")}
                color="sky"
                iconClassName="text-sky-500"
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={(val) => setStartTime(val)}
                onEndTimeChange={(val) => setEndTime(val)}
                error={errors.time}
                onErrorChange={(msg) => setErrors((prev) => ({ ...prev, time: msg }))}
                onDurationChange={(mins) => setDurationMinutes(mins)}
                durationHintPrefix={t("plan.time.estimated_duration")}
              />
            </div>
          </div>
        </section>

        {/* CHI PHÍ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.cost.title")}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.cost.subtitle")}
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.cost.estimated_main")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder={t("plan.cost.placeholder_100k")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.cost.actual_main")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder={t("plan.cost.actual_placeholder")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {t("plan.cost.actual_empty_hint_1")}
                  <b>{t("plan.cost.estimated_word")}</b>
                  {t("plan.cost.actual_empty_hint_2")}
                  <b>{t("plan.cost.extra_word")}</b>
                  {t("plan.cost.actual_empty_hint_3")}
                </p>
              </div>
            </div>

            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
              label={t("plan.extra_cost.section_label")}
            />

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.cost.activity_budget")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-sky-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder={t("plan.cost.placeholder_500k")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
                <div>
                  {t("plan.cost.summary_initial_estimate")}{" "}
                  <span className="font-semibold">{estimatedValue.toLocaleString("vi-VN")}đ</span>
                </div>
                <div>
                  {t("plan.cost.summary_extra")}{" "}
                  <span className="font-semibold">{extraTotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div>
                  {t("plan.cost.summary_expected_total")}{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {estimatedTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {actualCost && Number(actualCost) > 0 && (
                  <div>
                    {t("plan.cost.summary_using_actual_1")}
                    <b>{t("plan.cost.actual_word")}</b>
                    {t("plan.cost.summary_using_actual_2")}{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {Number(actualCost).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                {budgetAmount && Number(budgetAmount) > 0 && (
                  <div>
                    {t("plan.cost.summary_budget")}{" "}
                    <span className="font-semibold">{Number(budgetAmount).toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
              </div>
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

        {/* CUSTOM FIELDS */}
        <section className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.modal.other.extra_info")}
            </label>
            <button
              type="button"
              onClick={handleAddField}
              className="text-[11px] text-sky-500 hover:text-sky-400"
            >
              {t("plan.modal.other.add_field")}
            </button>
          </div>

          <div className={sectionCard}>
            {customFields.map((f, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                <input
                  placeholder={t("plan.modal.other.field_key_placeholder")}
                  value={f.key}
                  onChange={(e) => handleChangeField(idx, "key", e.target.value)}
                  className={inputBase}
                />

                <div className="flex items-center gap-2">
                  <input
                    placeholder={t("plan.modal.other.field_value_placeholder")}
                    value={f.value}
                    onChange={(e) => handleChangeField(idx, "value", e.target.value)}
                    className={`${inputBase} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="text-red-500 hover:text-red-600 text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* NOTE */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.note.title")}
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.note.subtitle")}
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("plan.note.placeholder")}
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
            setInternalOtherLocation(null);
            setPlacePickerOpen(false);
            return;
          }

          const slim = normalizeLocationFromStored(slimLocationForStorage(loc));
          const label = getLocDisplayLabel(slim, "");

          setInternalOtherLocation(slim || null);
          setErrors((prev) => ({ ...prev, location: "" }));

          if (slim?.fullAddress || slim?.address) {
            setLocationText(slim.fullAddress || slim.address || "");
          } else if (label) {
            setLocationText(label);
          }

          setPlacePickerOpen(false);
        }}
        initialTab="PLACE"
        activityType="OTHER"
        field="other"
        initialLocation={effectiveOtherLocation}
      />
    </>
  );
}
