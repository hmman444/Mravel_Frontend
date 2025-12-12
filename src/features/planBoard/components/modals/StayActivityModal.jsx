// src/features/planBoard/components/modals/StayActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaBed,
  FaMapMarkerAlt,
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

import { inputBase, sectionCard } from "../../utils/activityStyles";
import { useSplitMoney } from "../../hooks/useSplitMoney";
import {
  buildInitialExtraCosts,
  normalizeExtraCosts,
  calcExtraTotal,
} from "../../utils/costUtils";

// Có thể tái sử dụng chung cho các modal khác nếu muốn
const EXTRA_TYPES = [
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "TAX", label: "Thuế" },
  { value: "OTHER", label: "Khác" },
];

export default function StayActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  stayLocation: stayLocationProp,
  readOnly 
}) {
  const [title, setTitle] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [address, setAddress] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  const [pricePerTime, setPricePerTime] = useState("");
  const [nights, setNights] = useState("1");

  const [actualCost, setActualCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [note, setNote] = useState("");

  // dùng chung format với Transport: { reason, type, estimatedAmount, actualAmount }
  const [extraCosts, setExtraCosts] = useState([]);

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalStayLocation, setInternalStayLocation] = useState(null);
  const effectiveStayLocation = internalStayLocation || stayLocationProp || null;

  // ===== LOAD DỮ LIỆU KHI MỞ MODAL =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};
      const cost = editingCard.cost || {};
      const split = editingCard.split || {}; // useSplitMoney sẽ xử lý phần này

      setTitle(editingCard.text || "");
      setHotelName(data.hotelName || "");
      setAddress(data.address || "");

      setCheckIn(editingCard.startTime || data.checkIn || "");
      setCheckOut(editingCard.endTime || data.checkOut || "");
      setDurationMinutes(null); // sẽ được tính lại bởi ActivityTimeRangeSection

      setPricePerTime(
        data.pricePerNight != null
          ? String(data.pricePerNight)
          : data.pricePerTime != null
          ? String(data.pricePerTime)
          : ""
      );

      setNights(data.nights != null ? String(data.nights) : "1");

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      setExtraCosts(buildInitialExtraCosts(data, cost));

      if (cost.budgetAmount != null) {
        setBudgetAmount(String(cost.budgetAmount));
      } else {
        setBudgetAmount("");
      }

      setNote(editingCard.description || "");

      // stay location từ activityData cũ (nếu có)
      if (data.hotelLocation) {
        setInternalStayLocation(data.hotelLocation);
      } else {
        setInternalStayLocation(null);
      }
    } else {
      // reset new
      setTitle("");
      setHotelName("");
      setAddress("");

      setCheckIn("");
      setCheckOut("");
      setDurationMinutes(null);

      setPricePerTime("");
      setNights("1");
      setActualCost("");
      setBudgetAmount("");
      setNote("");
      setExtraCosts([]);

      setInternalStayLocation(stayLocationProp || null);
    }
  }, [open, editingCard, stayLocationProp]);

  // Nếu parent thay đổi stayLocationProp bên ngoài (rare) thì sync
  useEffect(() => {
    if (!editingCard && stayLocationProp) {
      setInternalStayLocation(stayLocationProp);
    }
  }, [stayLocationProp, editingCard]);

  // SYNC từ effectiveStayLocation vào tên + địa chỉ
  useEffect(() => {
    if (!effectiveStayLocation) return;

    if (effectiveStayLocation.label || effectiveStayLocation.name) {
      setHotelName(
        effectiveStayLocation.label || effectiveStayLocation.name || ""
      );
    }

    if (effectiveStayLocation.address || effectiveStayLocation.fullAddress) {
      setAddress(
        effectiveStayLocation.address ||
          effectiveStayLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveStayLocation]);

  // ===== TÍNH TOÁN CHI PHÍ =====
  const baseEstimated = useMemo(
    () => Number(pricePerTime || 0),
    [pricePerTime]
  );

  const extraTotal = useMemo(
    () => calcExtraTotal(extraCosts),
    [extraCosts]
  );

  const estimatedTotal = useMemo(
    () => baseEstimated + extraTotal,
    [baseEstimated, extraTotal]
  );

  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedTotal;
  }, [actualCost, estimatedTotal]);

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

  // ===== EXTRA COSTS HANDLERS =====
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

  // ===== BUILD PAYLOAD ĐỂ GỬI LÊN BE =====
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const extraTotalNormalized = calcExtraTotal(normalizedExtraCosts);

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedTotal || null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? Number(parsedParticipants || 0) : null,
      participants: participants.map((p) =>
        typeof p === "number" ? p : p.memberId
      ),
      extraCosts: normalizedExtraCosts,
    };

    return {
      cost,
      split: splitPayload,
      participants,
      normalizedExtraCosts,
      extraTotal: extraTotalNormalized,
    };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!hotelName.trim()) {
      newErrors.hotelName = "Vui lòng nhập hoặc chọn chỗ nghỉ.";
    }

    if (checkIn && checkOut && durationMinutes == null) {
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
      type: "STAY",
      title: title || `Nghỉ tại ${hotelName}`,
      text: title || `Nghỉ tại ${hotelName}`,
      description: note || "",
      startTime: checkIn || null,
      endTime: checkOut || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants: participants.map((p) =>
        typeof p === "number" ? p : p.memberId
      ),
      activityData: {
        hotelName,
        address,
        hotelLocation: effectiveStayLocation || null,
        checkIn,
        checkOut,
        pricePerTime: pricePerTime ? Number(pricePerTime) : null,
        pricePerNight: pricePerTime ? Number(pricePerTime) : null,
        nights: nights ? Number(nights) : null,
        actualCost: actualCost ? Number(actualCost) : null,
        extraSpend: extraTotal || null,
        extraItems: normalizedExtraCosts,
        estimatedCost: estimatedTotal || null,
      },
      cost,
      split,
    });

    onClose?.();
  };

  // ===== HEADER / FOOTER (DÙNG COMPONENT CHUNG) =====
  const headerRight = (
    <ActivityHeaderCostSummary
      parsedActual={parsedActual}
      budgetAmount={budgetAmount}
      accentClass="text-violet-600 dark:text-violet-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Nghỉ tại"
      name={hotelName}
      emptyLabelText="Điền/chọn tên chỗ nghỉ để lưu hoạt động nghỉ ngơi."
      locationText={
        effectiveStayLocation?.address ||
        effectiveStayLocation?.fullAddress ||
        address ||
        ""
      }
      timeText={
        checkIn &&
        checkOut &&
        durationMinutes != null &&
        !errors.time
          ? `${checkIn} - ${checkOut} (${durationMinutes} phút)`
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
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động nghỉ ngơi"}
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
        title="Hoạt động nghỉ ngơi"
        typeLabel="Stay"
        subtitle="Chỗ nghỉ cho một phần trong ngày (trưa, tối, qua đêm...)."
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
              Chỗ nghỉ + địa chỉ + thời gian nghỉ
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
                placeholder="Ví dụ: Nghỉ trưa homestay A, ngủ đêm khách sạn B..."
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
                        {effectiveStayLocation?.label ||
                          effectiveStayLocation?.name ||
                          hotelName ||
                          "Chỗ nghỉ đã chọn"}
                      </p>
                      {(effectiveStayLocation?.address ||
                        effectiveStayLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveStayLocation?.address ||
                            effectiveStayLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
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
                        Chọn chỗ nghỉ trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, chọn khách sạn/homestay làm chỗ nghỉ.
                      </p>
                    </>
                  )}
                </div>

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-violet-500 group-hover:text-violet-600 dark:text-violet-300
                                dark:group-hover:text-violet-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.hotelName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.hotelName}
                </p>
              )}
            </div>

            {/* Thời gian nghỉ: dùng ActivityTimeRangeSection */}
            <ActivityTimeRangeSection
              sectionLabel="Thời gian nghỉ"
              startLabel="Bắt đầu nghỉ"
              endLabel="Kết thúc nghỉ"
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
              durationHintPrefix="Thời lượng dự kiến"
            />
          </div>
        </section>

        {/* CHI PHÍ NGHỈ NGƠI */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Chi phí nghỉ ngơi
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Chi phí cho một lần nghỉ trong ngày + phát sinh + ngân sách + thực tế
            </span>
          </div>
          
          <div className={sectionCard + " space-y-4"}>
            <div className="flex gap-4">
              {/* Cột 1 */}
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Chi phí dự kiến cho lần nghỉ này
                </label>

                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={pricePerTime}
                    onChange={(e) => setPricePerTime(e.target.value)}
                    placeholder="VD: 450.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Số đêm của cả booking (thông tin thêm)
                </label>

                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className={`${inputBase} w-full`}
                />

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Dùng để ghi chú tổng thời gian lưu trú, nhưng chi phí chia cho ngày này chỉ
                  lấy <b>một phần tương ứng với lần nghỉ này</b>.
                </p>
              </div>
            </div>
            

            {/* CHI PHÍ PHÁT SINH – dùng chung ExtraCostsSection */}
            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
            />

            {/* CHI PHÍ THỰC TẾ & NGÂN SÁCH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Tổng chi phí thực tế cho lần nghỉ này (nếu có)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="Điền sau khi thanh toán"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Nếu để trống, hệ thống sẽ dùng{" "}
                  <b>chi phí dự kiến + phát sinh</b> để chia tiền.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho lần nghỉ này (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="VD: 1.000.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            {/* TÓM TẮT CHI PHÍ */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Chi phí cơ bản:{" "}
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
                Tổng dự kiến (cơ bản + phát sinh):{" "}
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-violet-600 dark:text-violet-400">
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
            placeholder="Ví dụ: yêu cầu phòng yên tĩnh, gần thang máy, có hồ bơi..."
            className={`${inputBase} w-full`}
          />
        </section>
      </ActivityModalShell>

      {/* PLACE PICKER CHO STAY */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          setInternalStayLocation(loc || null);
          if (loc?.label || loc?.name) {
            setHotelName(loc.label || loc.name);
            setErrors((prev) => ({ ...prev, hotelName: "" }));
          }
          if (loc?.address || loc?.fullAddress) {
            setAddress(loc.address || loc.fullAddress);
          }
        }}
        initialTab="HOTEL"
        activityType="STAY"
        field="stay"
        initialLocation={effectiveStayLocation}
      />
    </>
  );
}
