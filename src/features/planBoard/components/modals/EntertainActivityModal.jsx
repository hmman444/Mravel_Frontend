// src/features/planBoard/components/modals/EntertainActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FaTimes, FaGamepad, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import ExtraCostsSection from "../ExtraCostsSection";
import PlacePickerModal from "../PlacePickerModal";

import ActivityTimeRangeSection from "../ActivityTimeRangeSection";
import ActivityHeaderCostSummary from "../ActivityHeaderCostSummary";
import ActivityFooterSummary from "../ActivityFooterSummary";
import ActivityFooterButtons from "../ActivityFooterButtons";

import { inputBase, sectionCard } from "../activityStyles";
import { useSplitMoney } from "../../hooks/useSplitMoney";
import {
  buildInitialExtraCosts,
  normalizeExtraCosts,
  calcExtraTotal,
} from "../../utils/costUtils";

const EXTRA_TYPES = [
  { value: "RENTAL", label: "Thuê đồ" },
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "OTHER", label: "Khác" },
];

export default function EntertainActivityModal({
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
  const [ticketCount, setTicketCount] = useState("1");

  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalEntertainLocation, setInternalEntertainLocation] = useState(null);
  const effectiveEntertainLocation = internalEntertainLocation || null;

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
      setDurationMinutes(null); // ActivityTimeRangeSection sẽ tính lại

      setTicketPrice(
        data.ticketPrice != null ? String(data.ticketPrice) : ""
      );
      setTicketCount(
        data.ticketCount != null ? String(data.ticketCount) : "1"
      );

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      setExtraCosts(buildInitialExtraCosts(data, cost));

      setBudgetAmount(
        cost.budgetAmount !== undefined && cost.budgetAmount !== null
          ? String(cost.budgetAmount)
          : ""
      );

      setNote(editingCard.description || "");

      if (data.entertainLocation) {
        setInternalEntertainLocation(data.entertainLocation);
      } else {
        setInternalEntertainLocation(null);
      }
    } else {
      // reset khi tạo mới
      setTitle("");
      setPlaceName("");
      setAddress("");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setTicketPrice("");
      setTicketCount("1");
      setActualCost("");
      setBudgetAmount("");
      setNote("");
      setExtraCosts([]);

      setInternalEntertainLocation(null);
    }
  }, [open, editingCard]);

  // SYNC location -> placeName + address
  useEffect(() => {
    if (!effectiveEntertainLocation) return;

    if (effectiveEntertainLocation.label || effectiveEntertainLocation.name) {
      setPlaceName(
        effectiveEntertainLocation.label ||
          effectiveEntertainLocation.name ||
          ""
      );
    }

    if (
      effectiveEntertainLocation.address ||
      effectiveEntertainLocation.fullAddress
    ) {
      setAddress(
        effectiveEntertainLocation.address ||
          effectiveEntertainLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveEntertainLocation]);

  // ===== TÍNH CHI PHÍ =====
  const baseEstimated = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(ticketCount || 0);
    return p * c;
  }, [ticketPrice, ticketCount]);

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

  // ===== HOOK CHIA TIỀN DÙNG CHUNG =====
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
      estimatedCost: estimatedCost || null,
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
      newErrors.placeName = "Vui lòng nhập hoặc chọn địa điểm vui chơi.";
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
      type: "ENTERTAIN",
      title: title || `Vui chơi: ${placeName}`,
      text: title || `Vui chơi: ${placeName}`,
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
        entertainLocation: effectiveEntertainLocation || null,
        time: startTime || "",
        startTime,
        endTime,
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        ticketCount: ticketCount ? Number(ticketCount) : null,
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
      accentClass="text-emerald-600 dark:text-emerald-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Vui chơi"
      name={placeName}
      emptyLabelText="Điền/chọn địa điểm vui chơi để lưu hoạt động."
      locationText={
        (effectiveEntertainLocation || address)
          ? `Địa điểm: ${
              effectiveEntertainLocation?.address ||
              effectiveEntertainLocation?.fullAddress ||
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
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động vui chơi"}
      submitClassName="bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaGamepad />,
          close: <FaTimes size={14} />,
          bg: "from-emerald-500 to-teal-500",
        }}
        title="Hoạt động vui chơi"
        typeLabel="Entertain"
        subtitle="Công viên, trò chơi, khu giải trí, thuê đồ chơi..."
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
                placeholder="Ví dụ: Chơi moto nước, công viên nước..."
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
                  hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/70
                  dark:hover:border-emerald-500 dark:hover:bg-slate-900
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
                                bg-emerald-50 text-emerald-500 border border-emerald-100
                                dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveEntertainLocation || address ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveEntertainLocation?.label ||
                          effectiveEntertainLocation?.name ||
                          placeName ||
                          "Địa điểm đã chọn"}
                      </p>
                      {(effectiveEntertainLocation?.address ||
                        effectiveEntertainLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveEntertainLocation?.address ||
                            effectiveEntertainLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveEntertainLocation?.lat != null &&
                          effectiveEntertainLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                              {effectiveEntertainLocation.lat.toFixed(4)},{" "}
                              {effectiveEntertainLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn địa điểm vui chơi trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, chọn khu vui chơi / công viên / bãi biển.
                      </p>
                    </>
                  )}
                </div>

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-emerald-500 group-hover:text-emerald-600 dark:text-emerald-300
                                dark:group-hover:text-emerald-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.placeName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.placeName}
                </p>
              )}
            </div>

            {/* Thời gian: dùng ActivityTimeRangeSection */}
            <div className="mt-3">
              <ActivityTimeRangeSection
                sectionLabel="Thời gian vui chơi"
                startLabel="Bắt đầu"
                endLabel="Kết thúc"
                color="emerald"
                iconClassName="text-emerald-500"
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

        {/* CHI PHÍ VUI CHƠI */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Chi phí vui chơi
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Giá vé / lượt + chi phí phát sinh + ngân sách + chi phí thực tế
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            {/* Giá vé & số lượt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Giá vé / lượt
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="VD: 150.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Số lượt / người tham gia
                </label>
                <input
                  type="number"
                  min="1"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(e.target.value)}
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
                    placeholder="Điền sau khi chơi và thanh toán xong"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Nếu để trống, hệ thống sẽ dùng{" "}
                  <b>chi phí vé + phát sinh</b> để chia tiền.
                </p>
              </div>

              {/* Ngân sách */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho hoạt động (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-teal-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="VD: 500.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            {/* Tóm tắt chi phí */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Chi phí vé:{" "}
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
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {estimatedCost.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
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
              Thêm thông tin nhỏ cho cả nhóm
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: nên thuê phao, đồ bảo hộ, tới sớm để xếp hàng..."
            className={`${inputBase} w-full`}
          />
        </section>
      </ActivityModalShell>

      {/* PLACE PICKER CHO ENTERTAIN */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          setInternalEntertainLocation(loc || null);
          if (loc?.label || loc?.name) {
            setPlaceName(loc.label || loc.name);
            setErrors((prev) => ({ ...prev, placeName: "" }));
          }
          if (loc?.address || loc?.fullAddress) {
            setAddress(loc.address || loc.fullAddress);
          }
        }}
        initialTab="ENTERTAIN"
        activityType="ENTERTAIN"
        field="entertain"
        initialLocation={effectiveEntertainLocation}
      />
    </>
  );
}
