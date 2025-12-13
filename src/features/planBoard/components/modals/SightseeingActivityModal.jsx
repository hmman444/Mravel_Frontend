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
import {
  buildInitialExtraCosts,
  normalizeExtraCosts,
  calcExtraTotal,
} from "../../utils/costUtils";

const EXTRA_TYPES = [
  { value: "PARKING", label: "Gửi xe" },
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ phí" },
  { value: "OTHER", label: "Khác" },
];

export default function SightseeingActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  const [ticketPrice, setTicketPrice] = useState("");
  const [peopleCount, setPeopleCount] = useState("2");

  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalSightLocation, setInternalSightLocation] = useState(null);
  const effectiveSightLocation = internalSightLocation || null;

  // ===== LOAD DỮ LIỆU =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};
      const cost = editingCard.cost || {};

      setTitle(editingCard.text || "");
      setPlaceName(data.placeName || "");
      setAddress(data.address || "");

      const loadedStart =
        editingCard.startTime || data.startTime || data.time || "";
      const loadedEnd =
        editingCard.endTime ||
        data.endTime ||
        editingCard.startTime ||
        data.time ||
        "";

      setStartTime(loadedStart);
      setEndTime(loadedEnd);
      setDurationMinutes(null); // để ActivityTimeRangeSection tự tính lại

      setTicketPrice(
        data.ticketPrice != null ? String(data.ticketPrice) : ""
      );
      setPeopleCount(
        data.peopleCount != null ? String(data.peopleCount) : "2"
      );

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      // extraCosts dùng helper chung
      setExtraCosts(buildInitialExtraCosts(data, cost));

      setBudgetAmount(
        cost.budgetAmount !== undefined && cost.budgetAmount !== null
          ? String(cost.budgetAmount)
          : ""
      );

      setNote(editingCard.description || "");

      if (data.sightLocation) {
        setInternalSightLocation(data.sightLocation);
      } else {
        setInternalSightLocation(null);
      }
    } else {
      // reset new
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
    }
  }, [open, editingCard]);

  // SYNC từ địa điểm map vào tên + địa chỉ
  useEffect(() => {
    if (!effectiveSightLocation) return;

    if (effectiveSightLocation.label || effectiveSightLocation.name) {
      setPlaceName(
        effectiveSightLocation.label || effectiveSightLocation.name || ""
      );
    }

    if (effectiveSightLocation.address || effectiveSightLocation.fullAddress) {
      setAddress(
        effectiveSightLocation.address ||
          effectiveSightLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveSightLocation]);

  // ===== TÍNH CHI PHÍ =====
  const baseEstimated = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(peopleCount || 0);
    return p * c;
  }, [ticketPrice, peopleCount]);

  const extraTotal = useMemo(
    () => calcExtraTotal(extraCosts),
    [extraCosts]
  );

  const estimatedCost = useMemo(
    () => baseEstimated + extraTotal,
    [baseEstimated, extraTotal]
  );

  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedCost;
  }, [actualCost, estimatedCost]);

  // ===== HOOK CHIA TIỀN CHUNG =====
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

  // ===== EXTRA COSTS CRUD =====
  const addExtraCost = () =>
    setExtraCosts((prev) => [
      ...prev,
      { reason: "", type: "OTHER", estimatedAmount: null, actualAmount: "" },
    ]);

  const updateExtraCost = (idx, key, value) => {
    const arr = [...extraCosts];
    arr[idx] = { ...arr[idx], [key]: value };
    setExtraCosts(arr);
  };

  const removeExtraCost = (idx) =>
    setExtraCosts((prev) => prev.filter((_, i) => i !== idx));

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const extraTotalNormalized = calcExtraTotal(normalizedExtraCosts);

    const normalizedParticipants = participants.map((p) =>
      typeof p === "number" ? p : p?.memberId
    );

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedCost > 0 ? estimatedCost : null,
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
      extraTotal: extraTotalNormalized,
    };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!placeName.trim()) {
      newErrors.placeName = "Vui lòng nhập hoặc chọn địa điểm tham quan.";
    }

    if (startTime && endTime && durationMinutes == null) {
      newErrors.time = "Giờ kết thúc phải muộn hơn giờ bắt đầu.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const { cost, split, participants, normalizedExtraCosts, extraTotal } =
      buildPayload();

    onSubmit?.({
      type: "SIGHTSEEING",
      title: title || `Tham quan: ${placeName}`,
      text: title || `Tham quan: ${placeName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        placeName,
        address,
        sightLocation: effectiveSightLocation || null,
        time: startTime || "",
        startTime,
        endTime,
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        peopleCount: peopleCount ? Number(peopleCount) : null,
        actualCost: actualCost ? Number(actualCost) : null,
        extraSpend: extraTotal || null,
        extraItems: normalizedExtraCosts,
        estimatedCost: estimatedCost || null,
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
      locationText={
        (effectiveSightLocation || address)
          ? `Địa điểm: ${
              effectiveSightLocation?.address ||
              effectiveSightLocation?.fullAddress ||
              address
            }`
          : ""
      }
      timeText={
        startTime &&
        endTime &&
        durationMinutes != null &&
        !errors.time
          ? `${startTime} - ${endTime} (${durationMinutes} phút)`
          : ""
      }
    />
  );

  const footerRight = (
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

            {/* ĐỊA CHỈ - chọn trên bản đồ */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Địa chỉ / vị trí trên bản đồ
              </label>

              <button
                type="button"
                onClick={() => setPlacePickerOpen(true)}
                className={`
                  group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-amber-400 hover:shadow-md hover:bg-amber-50/70
                  dark:hover:border-amber-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.placeName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }
                `}
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
                        {effectiveSightLocation?.label ||
                          effectiveSightLocation?.name ||
                          placeName ||
                          "Địa điểm đã chọn"}
                      </p>
                      {(effectiveSightLocation?.address ||
                        effectiveSightLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveSightLocation?.address ||
                            effectiveSightLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveSightLocation?.lat != null &&
                          effectiveSightLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                              {effectiveSightLocation.lat.toFixed(4)},{" "}
                              {effectiveSightLocation.lng.toFixed(4)}
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

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-amber-500 group-hover:text-amber-600 dark:text-amber-300
                                dark:group-hover:text-amber-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.placeName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.placeName}
                </p>
              )}
            </div>

            {/* Thời gian tham quan: dùng ActivityTimeRangeSection */}
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
                onErrorChange={(msg) =>
                  setErrors((prev) => ({ ...prev, time: msg }))
                }
                onDurationChange={(mins) => setDurationMinutes(mins)}
                durationHintPrefix="Thời lượng ước tính"
              />
            </div>
          </div>
        </section>

        {/* CHI PHÍ THAM QUAN */}
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
            {/* Giá vé + số người */}
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
                    placeholder="VD: 120.000"
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

            {/* Chi phí phát sinh */}
            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Chi phí thực tế */}
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
                    placeholder="Điền sau khi tham quan và thanh toán"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Nếu để trống, hệ thống sẽ dùng <b>tiền vé + phát sinh</b> để chia
                  tiền.
                </p>
              </div>

              {/* Ngân sách */}
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
                    placeholder="VD: 800.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            {/* Tóm tắt chi phí */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Tiền vé dự kiến:{" "}
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
                Tổng dự kiến (vé + phát sinh):{" "}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {estimatedCost.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
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

    {/* PLACE PICKER CHO SIGHTSEEING */}
    <PlacePickerModal
      open={placePickerOpen}
      onClose={() => setPlacePickerOpen(false)}
      onSelect={(loc) => {
        setInternalSightLocation(loc || null);
        if (loc?.label || loc?.name) {
          setPlaceName(loc.label || loc.name);
          setErrors((prev) => ({ ...prev, placeName: "" }));
        }
        if (loc?.address || loc?.fullAddress) {
          setAddress(loc.address || loc.fullAddress);
        }
      }}
      initialTab="SIGHTSEEING"
      activityType="SIGHTSEEING"
      field="sight"
      initialLocation={effectiveSightLocation}
    />
  </>
  );
}
