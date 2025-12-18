// src/features/planBoard/components/modals/CinemaActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
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

const EXTRA_TYPES = [
  { value: "PARKING", label: "Gửi xe" },
  { value: "FOOD", label: "Đồ ăn / nước" },
  { value: "OTHER", label: "Khác" },
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

  // ===== LOAD WHEN OPEN =====
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

  // ===== SYNC MAP -> CINEMA NAME + ADDRESS =====
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

  // ===== EXTRA COST CRUD =====
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

  // ===== COST LOGIC (MATCH NEW STANDARD) =====
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

  // ===== SPLIT HOOK =====
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

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const normalizedParticipants = participants.map((p) =>
      typeof p === "number" ? p : p?.memberId
    );

    const cost = {
      currencyCode: "VND",
      // ✅ estimatedCost chỉ là base (vé + combo)
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

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!cinemaName.trim() && !effectiveCinemaLocation) {
      newErrors.cinemaName = "Vui lòng nhập hoặc chọn rạp xem phim.";
    }

    if (!movieName.trim()) {
      newErrors.movieName = "Vui lòng nhập tên phim.";
    }

    if (startTime && endTime && durationMinutes == null) {
      newErrors.time = "Giờ kết thúc phải muộn hơn giờ bắt đầu.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants, normalizedExtraCosts } = buildPayload();

    onSubmit?.({
      type: "CINEMA",
      title: title || `Xem phim: ${movieName}`,
      text: title || `Xem phim: ${movieName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,

      // ✅ activityData gọn: chỉ field đặc thù CINEMA
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

  // ===== HEADER / FOOTER =====
  const headerRight = (
    <ActivityHeaderCostSummary
      parsedActual={parsedActual}
      budgetAmount={budgetAmount}
      accentClass="text-rose-600 dark:text-rose-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Xem phim"
      name={movieName}
      emptyLabelText="Điền tên phim và rạp để lưu hoạt động xem phim."
      locationText={
        effectiveCinemaLocation || cinemaName || address
          ? `Rạp: ${
              effectiveCinemaLocation?.label ||
              effectiveCinemaLocation?.name ||
              cinemaName ||
              "Chưa rõ rạp"
            }${
              effectiveCinemaLocation?.address ||
              effectiveCinemaLocation?.fullAddress ||
              address
                ? ` – Địa chỉ: ${
                    effectiveCinemaLocation?.address ||
                    effectiveCinemaLocation?.fullAddress ||
                    address
                  }`
                : ""
            }`
          : ""
      }
      timeText={
        startTime && endTime && durationMinutes != null && !errors.time
          ? `Suất: ${startTime} - ${endTime} (${durationMinutes} phút)`
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
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động xem phim"}
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
        title="Hoạt động xem phim"
        typeLabel="Cinema"
        subtitle="Chọn rạp, phim, giờ chiếu và chi phí đi xem phim."
        headerRight={headerRight}
        footerLeft={footerLeft}
        footerRight={footerRight}
      >
        {/* THÔNG TIN CHUNG */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Thông tin chung
            </label>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Rạp + phim + thời gian
            </span>
          </div>

          <div className={sectionCard}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Tên hoạt động (tuỳ chọn)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Xem phim tối tại CGV..."
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            {/* TÊN PHIM */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Tên phim
              </label>
              <input
                value={movieName}
                onChange={(e) => {
                  setMovieName(e.target.value);
                  setErrors((prev) => ({ ...prev, movieName: "" }));
                }}
                placeholder="Ví dụ: Inside Out 2..."
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
                Địa chỉ rạp / vị trí trên bản đồ
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
                          "Địa điểm đã chọn"}
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
                          Đã chọn trên bản đồ
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
                        Chọn rạp trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, chọn rạp / trung tâm thương mại bạn sẽ xem.
                      </p>
                    </>
                  )}
                </div>

                <span
                  className="hidden md:inline-flex items-center text-[11px] font-medium
                    text-rose-500 group-hover:text-rose-600 dark:text-rose-300
                    dark:group-hover:text-rose-200"
                >
                  Mở bản đồ
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
                sectionLabel="Thời gian chiếu"
                startLabel="Bắt đầu"
                endLabel="Kết thúc"
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
                durationHintPrefix="Thời lượng ước tính"
              />
            </div>
          </div>
        </section>

        {/* ĐỊNH DẠNG + GHẾ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Định dạng & ghế ngồi
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Chọn format phim & ghế (nếu muốn)
            </span>
          </div>

          <div className={sectionCard + " space-y-3"}>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Định dạng phim
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
                Ghế ngồi (tuỳ chọn)
              </label>
              <div className="flex items-center gap-2">
                <FaChair className="text-indigo-500" />
                <input
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  placeholder="VD: H8, H9"
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
              Chi phí xem phim
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Vé + combo + phát sinh + ngân sách
            </span>
          </div>

          <div className={sectionCard + " space-y-3"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giá vé
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="VD: 90.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giá combo bắp nước (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={comboPrice}
                    onChange={(e) => setComboPrice(e.target.value)}
                    placeholder="VD: 50.000"
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
              label="Chi phí phát sinh (gửi xe, đồ ăn thêm...)"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho lần xem phim (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-rose-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="VD: 300.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Tổng chi phí thực tế cho lần xem phim (nếu có)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="Điền sau khi thanh toán hoá đơn"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Nếu để trống <b>chi phí thực tế</b>, hệ thống sẽ dùng{" "}
                  <b>vé + combo + phát sinh</b> để chia tiền.
                </p>
              </div>
            </div>

            {/* TÓM TẮT */}
            <div className="mt-1 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 px-4 py-3 text-[11px] leading-relaxed text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Vé + combo (dự kiến):{" "}
                <span className="font-semibold">
                  {baseEstimated.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Phát sinh:{" "}
                <span className="font-semibold">
                  {extraTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Tổng dự kiến (vé + combo + phát sinh):{" "}
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {Number(actualCost).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              {budgetAmount && Number(budgetAmount) > 0 && (
                <div>
                  Ngân sách:{" "}
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
              Ghi chú
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Thêm cảm nhận / lưu ý sau khi xem phim
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Phim hay, nên đi sớm 10 phút..."
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
