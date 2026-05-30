// src/features/planBoard/components/modals/CinemaActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaTimes,
  FaFilm,
  FaMapMarkerAlt,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";

import ActivityModalShell from "./ActivityModalShell";
import SplitMoneySection from "./SplitMoneySection";
import ExtraCostsSection from "./ExtraCostsSection";
import PlacePickerModal from "./PlacePickerModal";

import ActivityTimeRangeSection from "./ActivityTimeRangeSection";
import ActivityHeaderCostSummary from "./ActivityHeaderCostSummary";
import ActivityFooterSummary from "./ActivityFooterSummary";
import ActivityFooterButtons from "./ActivityFooterButtons";

import { inputBase, sectionCard, pillBtn } from "../../utils/activityStyles";
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

const FORMATS = [
  { value: "2D", label: "2D" },
  { value: "3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
  { value: "4DX", label: "4DX" },
];

const safeJsonParse = (str) => {
  try {
    return str ? JSON.parse(str) : {};
  } catch {
    return {};
  }
};

export default function CinemaActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  readOnly = false,
}) {
  const { t } = useTranslation();

  const EXTRA_TYPES = [
    { value: "PARKING", label: t("plan.cinema.extra_type.parking") },
    { value: "FOOD", label: t("plan.cinema.extra_type.food") },
    { value: "OTHER", label: t("plan.cinema.extra_type.other") },
  ];

  const [title, setTitle] = useState("");
  const [cinemaName, setCinemaName] = useState("");
  const [address, setAddress] = useState("");
  const [movieName, setMovieName] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  const [format, setFormat] = useState("2D");
  const [seats, setSeats] = useState("");

  const [ticketPrice, setTicketPrice] = useState("");
  const [comboPrice, setComboPrice] = useState("");

  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);
  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalCinemaLocation, setInternalCinemaLocation] = useState(null);
  const effectiveCinemaLocation = internalCinemaLocation || null;

  //  LOAD WHEN OPEN 
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = safeJsonParse(editingCard.activityDataJson);
      const cost = editingCard.cost || {};

      setTitle(editingCard.text || "");
      setCinemaName(data.cinemaName || "");
      setAddress(data.address || "");
      setMovieName(data.movieName || "");

      setFormat(data.format || "2D");
      setSeats(data.seats || "");

      const { start, end } = pickStartEndFromCard(editingCard, data);
      setStartTime(start);
      setEndTime(end);
      setDurationMinutes(null);

      setTicketPrice(data.ticketPrice != null ? String(data.ticketPrice) : "");
      setComboPrice(data.comboPrice != null ? String(data.comboPrice) : "");

      setBudgetAmount(cost.budgetAmount != null ? String(cost.budgetAmount) : "");
      setActualCost(cost.actualCost != null ? String(cost.actualCost) : "");

      setExtraCosts(buildInitialExtraCosts(data, cost));
      setNote(editingCard.description || "");

      const nLoc = normalizeLocationFromStored(data.cinemaLocation) || null;
      setInternalCinemaLocation(nLoc);

      // sync text from loc (nếu có)
      if (nLoc) {
        const label = getLocDisplayLabel(nLoc, data.cinemaName || "");
        if (label) setCinemaName(label);
        if (nLoc.fullAddress || nLoc.address) {
          setAddress(nLoc.fullAddress || nLoc.address || data.address || "");
        }
      }
    } else {
      // RESET new
      setTitle("");
      setCinemaName("");
      setAddress("");
      setMovieName("");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setFormat("2D");
      setSeats("");

      setTicketPrice("");
      setComboPrice("");

      setBudgetAmount("");
      setActualCost("");
      setNote("");

      setExtraCosts([]);
      setInternalCinemaLocation(null);
      setPlacePickerOpen(false);
    }
  }, [open, editingCard]);

  //  SYNC MAP -> CINEMA NAME + ADDRESS 
  useEffect(() => {
    if (!effectiveCinemaLocation) return;

    const label = getLocDisplayLabel(effectiveCinemaLocation, "");
    if (label) {
      setCinemaName(label);
      setErrors((prev) => ({ ...prev, cinemaName: "" }));
    }

    if (effectiveCinemaLocation.fullAddress || effectiveCinemaLocation.address) {
      setAddress(
        effectiveCinemaLocation.fullAddress ||
          effectiveCinemaLocation.address ||
          ""
      );
    }
  }, [effectiveCinemaLocation]);

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

  //  COST LOGIC (MATCH NEW STANDARD) 
  // baseEstimated = vé + combo (không bao gồm extra)
  const baseEstimated = useMemo(() => {
    const t = Number(ticketPrice || 0);
    const c = Number(comboPrice || 0);
    return t + c;
  }, [ticketPrice, comboPrice]);

  const extraTotal = useMemo(() => calcExtraTotal(extraCosts), [extraCosts]);

  // tổng dự kiến để hiển thị & fallback chia tiền
  const estimatedTotal = useMemo(
    () => baseEstimated + extraTotal,
    [baseEstimated, extraTotal]
  );

  // chi phí để chia tiền: actual nếu có, không thì estimatedTotal
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

  //  BUILD PAYLOAD 
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const normalizedParticipants = participants.map((p) =>
      typeof p === "number" ? p : p?.memberId
    );

    const cost = {
      currencyCode: "VND",
      //  estimatedCost chỉ là base (vé + combo)
      estimatedCost: baseEstimated > 0 ? baseEstimated : null,
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

    if (!cinemaName.trim() && !effectiveCinemaLocation) {
      newErrors.cinemaName = t("plan.cinema.error.cinema_required");
    }

    if (!movieName.trim()) {
      newErrors.movieName = t("plan.cinema.error.movie_required");
    }

    if (startTime && endTime && durationMinutes == null) {
      newErrors.time = t("plan.cinema.error.end_after_start");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants, normalizedExtraCosts } = buildPayload();

    onSubmit?.({
      type: "CINEMA",
      title: title || t("plan.cinema.default_title", { name: movieName }),
      text: title || t("plan.cinema.default_title", { name: movieName }),
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,

      //  activityData gọn: chỉ field đặc thù CINEMA
      activityData: {
        cinemaName: cinemaName.trim(),
        cinemaLocation: slimLocationForStorage(effectiveCinemaLocation),
        address: (address || "").trim(),
        movieName: movieName.trim(),
        format,
        seats: (seats || "").trim(),
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        comboPrice: comboPrice ? Number(comboPrice) : null,
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
      accentClass="text-rose-600 dark:text-rose-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix={t("plan.cinema.footer.label_prefix")}
      name={movieName}
      emptyLabelText={t("plan.cinema.footer.empty")}
      locationText={
        effectiveCinemaLocation || cinemaName || address
          ? `${t("plan.cinema.footer.cinema_label", {
              name:
                effectiveCinemaLocation?.label ||
                effectiveCinemaLocation?.name ||
                cinemaName ||
                t("plan.cinema.footer.unknown_cinema"),
            })}${
              effectiveCinemaLocation?.address ||
              effectiveCinemaLocation?.fullAddress ||
              address
                ? t("plan.cinema.footer.address_suffix", {
                    address:
                      effectiveCinemaLocation?.address ||
                      effectiveCinemaLocation?.fullAddress ||
                      address,
                  })
                : ""
            }`
          : ""
      }
      timeText={
        startTime && endTime && durationMinutes != null && !errors.time
          ? t("plan.cinema.footer.showtime", {
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
      submitLabel={
        editingCard
          ? t("common.save_changes")
          : t("plan.cinema.submit_create")
      }
      submitClassName="bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaFilm />,
          close: <FaTimes size={14} />,
          bg: "from-rose-500 to-pink-500",
        }}
        title={t("plan.cinema.modal_title")}
        typeLabel="Cinema"
        subtitle={t("plan.cinema.modal_subtitle")}
        headerRight={headerRight}
        footerLeft={footerLeft}
        footerRight={footerRight}
      >
        {/* THÔNG TIN CHUNG */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.cinema.general_info")}
            </label>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {t("plan.cinema.general_info_hint")}
            </span>
          </div>

          <div className={sectionCard}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("plan.cinema.activity_name")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("plan.cinema.activity_name_ph")}
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            {/* TÊN PHIM */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("plan.cinema.movie_name")}
              </label>
              <input
                value={movieName}
                onChange={(e) => {
                  setMovieName(e.target.value);
                  setErrors((prev) => ({ ...prev, movieName: "" }));
                }}
                placeholder={t("plan.cinema.movie_name_ph")}
                className={`${inputBase} w-full mt-1 ${
                  errors.movieName
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30"
                    : ""
                }`}
              />
              {errors.movieName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.movieName}
                </p>
              )}
            </div>

            {/* ĐỊA CHỈ + MAP PICKER */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("plan.cinema.address_label")}
              </label>

              <button
                type="button"
                onClick={() => setPlacePickerOpen(true)}
                className={`
                  group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-rose-400 hover:shadow-md hover:bg-rose-50/70
                  dark:hover:border-rose-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.cinemaName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }
                `}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                    bg-rose-50 text-rose-500 border border-rose-100
                    dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveCinemaLocation || address || cinemaName ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveCinemaLocation?.label ||
                          effectiveCinemaLocation?.name ||
                          cinemaName ||
                          t("plan.cinema.selected_place")}
                      </p>

                      {(effectiveCinemaLocation?.address ||
                        effectiveCinemaLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveCinemaLocation?.address ||
                            effectiveCinemaLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          {t("plan.cinema.picked_on_map")}
                        </span>
                        {effectiveCinemaLocation?.lat != null &&
                          effectiveCinemaLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                              {effectiveCinemaLocation.lat.toFixed(4)},{" "}
                              {effectiveCinemaLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {t("plan.cinema.pick_on_map_title")}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {t("plan.cinema.pick_on_map_desc")}
                      </p>
                    </>
                  )}
                </div>

                <span
                  className="hidden md:inline-flex items-center text-[11px] font-medium
                    text-rose-500 group-hover:text-rose-600 dark:text-rose-300
                    dark:group-hover:text-rose-200"
                >
                  {t("plan.cinema.open_map")}
                </span>
              </button>

              {errors.cinemaName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.cinemaName}
                </p>
              )}
            </div>

            {/* Thời gian chiếu */}
            <div className="mt-3">
              <ActivityTimeRangeSection
                sectionLabel={t("plan.cinema.showtime_section")}
                startLabel={t("plan.cinema.start_label")}
                endLabel={t("plan.cinema.end_label")}
                color="rose"
                iconClassName="text-rose-500"
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={(val) => setStartTime(val)}
                onEndTimeChange={(val) => setEndTime(val)}
                error={errors.time}
                onErrorChange={(msg) =>
                  setErrors((prev) => ({ ...prev, time: msg }))
                }
                onDurationChange={(mins) => setDurationMinutes(mins)}
                durationHintPrefix={t("plan.cinema.duration_hint_prefix")}
              />
            </div>
          </div>
        </section>

        {/* ĐỊNH DẠNG + GHẾ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.cinema.format_seats")}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.cinema.format_seats_hint")}
            </span>
          </div>

          <div className={sectionCard + " space-y-3"}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                {t("plan.cinema.movie_format")}
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => {
                  const active = f.value === format;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormat(f.value)}
                      className={`${pillBtn} ${
                        active
                          ? "bg-rose-500 text-white border-rose-500 shadow-md scale-[1.03]"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                {t("plan.cinema.seats")}
              </label>
              <div className="flex items-center gap-2">
                <FaChair className="text-indigo-500" />
                <input
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  placeholder={t("plan.cinema.seats_ph")}
                  className={`${inputBase} flex-1`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CHI PHÍ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("plan.cinema.cost_section")}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.cinema.cost_section_hint")}
            </span>
          </div>

          <div className={sectionCard + " space-y-3"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.cinema.ticket_price")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder={t("plan.cinema.ticket_price_ph")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.cinema.combo_price")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={comboPrice}
                    onChange={(e) => setComboPrice(e.target.value)}
                    placeholder={t("plan.cinema.combo_price_ph")}
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
              label={t("plan.cinema.extra_costs_label")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.cinema.budget")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-rose-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder={t("plan.cinema.budget_ph")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  {t("plan.cinema.actual_cost")}
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder={t("plan.cinema.actual_cost_ph")}
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {t("plan.cinema.actual_cost_hint_1")}{" "}
                  <b>{t("plan.cinema.actual_cost_hint_actual")}</b>
                  {t("plan.cinema.actual_cost_hint_2")}{" "}
                  <b>{t("plan.cinema.actual_cost_hint_base")}</b>{" "}
                  {t("plan.cinema.actual_cost_hint_3")}
                </p>
              </div>
            </div>

            {/* TÓM TẮT */}
            <div className="mt-1 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 px-4 py-3 text-[11px] leading-relaxed text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                {t("plan.cinema.summary.ticket_combo")}{" "}
                <span className="font-semibold">
                  {baseEstimated.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                {t("plan.cinema.summary.extra")}{" "}
                <span className="font-semibold">
                  {extraTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                {t("plan.cinema.summary.estimated_total")}{" "}
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  {t("plan.cinema.summary.using_actual_1")}{" "}
                  <b>{t("plan.cinema.summary.using_actual_bold")}</b>
                  {t("plan.cinema.summary.using_actual_2")}{" "}
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {Number(actualCost).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              {budgetAmount && Number(budgetAmount) > 0 && (
                <div>
                  {t("plan.cinema.summary.budget")}{" "}
                  <span className="font-semibold">
                    {Number(budgetAmount).toLocaleString("vi-VN")}đ
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
              {t("plan.cinema.note")}
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("plan.cinema.note_hint")}
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("plan.cinema.note_ph")}
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
            setInternalCinemaLocation(null);
            setPlacePickerOpen(false);
            return;
          }

          const slim = normalizeLocationFromStored(slimLocationForStorage(loc));
          const label = getLocDisplayLabel(slim, "");

          setInternalCinemaLocation(slim || null);
          setErrors((prev) => ({ ...prev, cinemaName: "" }));

          if (label) setCinemaName(label);
          if (slim?.fullAddress || slim?.address) {
            setAddress(slim.fullAddress || slim.address || "");
          }

          setPlacePickerOpen(false);
        }}
        initialTab="CINEMA"
        activityType="CINEMA"
        field="cinema"
        initialLocation={effectiveCinemaLocation}
      />
    </>
  );
}
