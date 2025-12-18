// src/features/planBoard/components/modals/SightseeingActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FaTimes, FaLandmark, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

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
import { buildInitialExtraCosts, normalizeExtraCosts, calcExtraTotal } from "../../utils/costUtils";

import {
  getLocDisplayLabel,
  slimLocationForStorage,
  normalizeLocationFromStored,
} from "../../utils/locationUtils";

import { pickStartEndFromCard } from "../../utils/activityTimeUtils";

const EXTRA_TYPES = [
  { value: "PARKING", label: "Gửi xe" },
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ phí" },
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

export default function SightseeingActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  readOnly,
}) {
  const [title, setTitle] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  // BASE = tiền vé (không gồm phát sinh)
  const [ticketPrice, setTicketPrice] = useState("");
  const [peopleCount, setPeopleCount] = useState("2");

  // manual actual
  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);
  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalSightLocation, setInternalSightLocation] = useState(null);
  const effectiveSightLocation = internalSightLocation || null;

  // ===== LOAD =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = safeJsonParse(editingCard.activityDataJson);
      const cost = editingCard.cost || {};

      setTitle(editingCard.text || "");
      setPlaceName(data.placeName || "");
      setAddress(data.address || "");

      const { start, end } = pickStartEndFromCard(editingCard, data);
      setStartTime(start);
      setEndTime(end);
      setDurationMinutes(null);

      // 1) Load extra from cost (chuẩn) / fallback activityData
      const loadedExtra = buildInitialExtraCosts(data, cost);
      setExtraCosts(loadedExtra);

      const extraTotalFromLoaded = calcExtraTotal(loadedExtra);

      // 2) Load BASE ticket total
      // Nếu dữ liệu cũ đã lưu cost.estimatedCost = (vé + extra) thì tách lại base = est - extra
      // Nếu cost.estimatedCost đã là base đúng chuẩn thì est - extra <= 0 -> fallback est.
      let baseTicketTotal = null;

      if (cost.estimatedCost != null) {
        const est = Number(cost.estimatedCost);
        const maybe = est - Number(extraTotalFromLoaded || 0);
        baseTicketTotal = maybe > 0 ? maybe : est;
      } else {
        // fallback: tính từ data.ticketPrice * peopleCount
        const tp = data.ticketPrice != null ? Number(data.ticketPrice) : 0;
        const pc = data.peopleCount != null ? Number(data.peopleCount) : 0;
        const computed = tp * pc;
        baseTicketTotal = computed > 0 ? computed : null;
      }

      // 3) Đưa baseTicketTotal về dạng ticketPrice & peopleCount cho UI
      // Ưu tiên giữ đúng các field cũ nếu có để user thấy đúng input
      const loadedTicketPrice =
        data.ticketPrice != null ? Number(data.ticketPrice) : null;
      const loadedPeopleCount =
        data.peopleCount != null ? Number(data.peopleCount) : null;

      if (loadedTicketPrice != null && loadedPeopleCount != null) {
        setTicketPrice(String(loadedTicketPrice));
        setPeopleCount(String(loadedPeopleCount));
      } else {
        // nếu thiếu 1 trong 2, fallback: set peopleCount=1 và ticketPrice=base
        setPeopleCount("1");
        setTicketPrice(baseTicketTotal != null ? String(baseTicketTotal) : "");
      }

      setActualCost(cost.actualCost != null ? String(cost.actualCost) : "");
      setBudgetAmount(cost.budgetAmount != null ? String(cost.budgetAmount) : "");
      setNote(editingCard.description || "");

      setInternalSightLocation(normalizeLocationFromStored(data.sightLocation) || null);
    } else {
      // NEW
      setTitle("");
      setPlaceName("");
      setAddress("");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setTicketPrice("");
      setPeopleCount("2");

      setActualCost("");
      setBudgetAmount("");
      setNote("");
      setExtraCosts([]);

      setInternalSightLocation(null);
      setPlacePickerOpen(false);
    }
  }, [open, editingCard]);

  // SYNC map -> name/address
  useEffect(() => {
    if (!effectiveSightLocation) return;

    const name = getLocDisplayLabel(effectiveSightLocation, "");
    const full = effectiveSightLocation.fullAddress || effectiveSightLocation.address || "";

    if (name) setPlaceName(name);
    if (full) setAddress(full);
  }, [effectiveSightLocation]);

  // ===== COST CALC =====
  const baseEstimated = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(peopleCount || 0);
    return p * c;
  }, [ticketPrice, peopleCount]);

  const extraTotal = useMemo(() => calcExtraTotal(extraCosts), [extraCosts]);

  // tổng dự kiến (vé + phát sinh) chỉ để hiển thị & fallback chia tiền
  const estimatedTotal = useMemo(() => baseEstimated + extraTotal, [baseEstimated, extraTotal]);

  // tổng để chia: manual actual nếu có, không thì vé + phát sinh
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    return a > 0 ? a : estimatedTotal;
  }, [actualCost, estimatedTotal]);

  // ===== SPLIT =====
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

  // ===== EXTRA CRUD =====
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

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const normalizedParticipants = participants.map((p) =>
      typeof p === "number" ? p : p?.memberId
    );

    // ✅ estimatedCost = BASE (tiền vé), không gồm phát sinh
    const estimatedBase = baseEstimated > 0 ? baseEstimated : null;

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedBase,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      // ✅ xoá => "" => null
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

    if (!placeName.trim()) newErrors.placeName = "Vui lòng nhập hoặc chọn địa điểm tham quan.";

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
      type: "SIGHTSEEING",
      title: title || `Tham quan: ${placeName}`,
      text: title || `Tham quan: ${placeName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount: splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,

      activityData: {
        placeName: placeName.trim(),
        address: address?.trim() || null,
        sightLocation: slimLocationForStorage(effectiveSightLocation),
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        peopleCount: peopleCount ? Number(peopleCount) : null,
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
      accentClass="text-amber-600 dark:text-amber-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Tham quan"
      name={placeName}
      emptyLabelText="Điền/chọn địa điểm tham quan để lưu hoạt động."
      locationText={effectiveSightLocation?.fullAddress || address || ""}
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
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động tham quan"}
      submitClassName="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaLandmark />,
          close: <FaTimes size={14} />,
          bg: "from-amber-500 to-orange-500",
        }}
        title="Hoạt động tham quan"
        typeLabel="Sightseeing"
        subtitle="Vé tham quan, chụp ảnh, địa điểm du lịch."
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
              Địa điểm + địa chỉ + thời gian
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
                placeholder="Ví dụ: VinWonders, Nhà thờ Đức Bà..."
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            {/* MAP PICKER */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Địa chỉ / vị trí trên bản đồ
              </label>

              <button
                type="button"
                onClick={() => setPlacePickerOpen(true)}
                className={`group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-amber-400 hover:shadow-md hover:bg-amber-50/70
                  dark:hover:border-amber-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.placeName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }`}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                    bg-amber-50 text-amber-500 border border-amber-100
                    dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveSightLocation || address ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {getLocDisplayLabel(effectiveSightLocation, placeName || "Địa điểm đã chọn")}
                      </p>

                      {(effectiveSightLocation?.fullAddress || address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveSightLocation?.fullAddress || address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveSightLocation?.lat != null && effectiveSightLocation?.lng != null && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                            {effectiveSightLocation.lat.toFixed(4)}, {effectiveSightLocation.lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn địa điểm tham quan trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, chọn điểm du lịch / thắng cảnh / bảo tàng.
                      </p>
                    </>
                  )}
                </div>

                <span
                  className="hidden md:inline-flex items-center text-[11px] font-medium
                    text-amber-500 group-hover:text-amber-600 dark:text-amber-300
                    dark:group-hover:text-amber-200"
                >
                  Mở bản đồ
                </span>
              </button>

              {errors.placeName && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.placeName}</p>
              )}
            </div>

            <div className="mt-3">
              <ActivityTimeRangeSection
                sectionLabel="Thời gian tham quan"
                startLabel="Bắt đầu"
                endLabel="Kết thúc"
                color="amber"
                iconClassName="text-amber-500"
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={(val) => setStartTime(val)}
                onEndTimeChange={(val) => setEndTime(val)}
                error={errors.time}
                onErrorChange={(msg) => setErrors((prev) => ({ ...prev, time: msg }))}
                onDurationChange={(mins) => setDurationMinutes(mins)}
                durationHintPrefix="Thời lượng ước tính"
              />
            </div>
          </div>
        </section>

        {/* CHI PHÍ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Chi phí tham quan
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Vé vào cổng + phụ phí + ngân sách + chi phí thực tế
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giá vé / người
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="VD: 120000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Số người
                </label>
                <input
                  type="number"
                  min="1"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
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
                  Tổng chi phí thực tế cho hoạt động này (nếu có)
                </label>

                <div className="flex items-center gap-2">
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
                  Nếu để trống, hệ thống sẽ dùng <b>chi phí vé</b> + <b>phát sinh</b> để chia tiền.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho hoạt động (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-amber-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="VD: 800000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Tiền vé:{" "}
                <span className="font-semibold">{baseEstimated.toLocaleString("vi-VN")}đ</span>
              </div>
              <div>
                Phát sinh:{" "}
                <span className="font-semibold">{extraTotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div>
                Tổng dự kiến:{" "}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b>:{" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
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
              Thêm lưu ý nhỏ cho cả nhóm
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: nên đến sớm, có show nước 19h..."
            className={`${inputBase} w-full`}
          />
        </section>
      </ActivityModalShell>

      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          if (!loc) {
            setPlacePickerOpen(false);
            return;
          }

          const slim = normalizeLocationFromStored(slimLocationForStorage(loc));
          setInternalSightLocation(slim || null);

          const name = getLocDisplayLabel(slim, "");
          const full = slim?.fullAddress || slim?.address || "";

          if (name) {
            setPlaceName(name);
            setErrors((prev) => ({ ...prev, placeName: "" }));
          }
          if (full) setAddress(full);

          setPlacePickerOpen(false);
        }}
        initialTab="SIGHTSEEING"
        activityType="SIGHTSEEING"
        field="sight"
        initialLocation={effectiveSightLocation}
      />
    </>
  );
}
