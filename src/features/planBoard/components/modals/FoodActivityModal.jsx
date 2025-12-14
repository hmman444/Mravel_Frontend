// src/features/planBoard/components/modals/FoodActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaUtensils,
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

const EXTRA_TYPES = [
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "TAX", label: "Thuế" },
  { value: "OTHER", label: "Khác" },
];

export default function FoodActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  readOnly 
}) {
  const [title, setTitle] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  const [pricePerPerson, setPricePerPerson] = useState("");
  const [peopleCount, setPeopleCount] = useState("2");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalFoodLocation, setInternalFoodLocation] = useState(null);
  const effectiveFoodLocation = internalFoodLocation || null;

  // ===== LOAD DỮ LIỆU KHI MỞ MODAL =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};
      const cost = editingCard.cost || {};
      const split = editingCard.split || {}; // hiện tại useSplitMoney tự xử lý

      setTitle(editingCard.text || "");
      setRestaurantName(data.restaurantName || "");
      setLocation(data.location || "");

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
      setDurationMinutes(null); // sẽ được tính lại bởi ActivityTimeRangeSection

      setPricePerPerson(
        data.pricePerPerson != null ? String(data.pricePerPerson) : ""
      );

      setPeopleCount(
        data.peopleCount != null ? String(data.peopleCount) : "2"
      );

      setExtraCosts(buildInitialExtraCosts(data, cost));

      if (cost.budgetAmount != null) {
        setBudgetAmount(String(cost.budgetAmount));
      } else {
        setBudgetAmount("");
      }

      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      setNote(editingCard.description || "");

      if (data.restaurantLocation) {
        setInternalFoodLocation(data.restaurantLocation);
      } else {
        setInternalFoodLocation(null);
      }
    } else {
      // RESET khi mở modal mới
      setTitle("");
      setRestaurantName("");
      setLocation("");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setPricePerPerson("");
      setPeopleCount("2");
      setBudgetAmount("");
      setActualCost("");
      setNote("");
      setExtraCosts([]);

      setInternalFoodLocation(null);
    }
  }, [open, editingCard]);

  // SYNC từ effectiveFoodLocation vào tên + địa chỉ
  useEffect(() => {
    if (!effectiveFoodLocation) return;

    if (effectiveFoodLocation.label || effectiveFoodLocation.name) {
      setRestaurantName(
        effectiveFoodLocation.label || effectiveFoodLocation.name || ""
      );
    }

    if (effectiveFoodLocation.address || effectiveFoodLocation.fullAddress) {
      setLocation(
        effectiveFoodLocation.address ||
          effectiveFoodLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveFoodLocation]);

  // ===== TÍNH TOÁN CHI PHÍ CƠ BẢN =====
  const totalEstimated = useMemo(() => {
    const p = Number(pricePerPerson || 0);
    const c = Number(peopleCount || 0);
    return p * c;
  }, [pricePerPerson, peopleCount]);

  const extraTotal = useMemo(
    () => calcExtraTotal(extraCosts),
    [extraCosts]
  );

  const estimatedTotal = useMemo(
    () => totalEstimated + extraTotal,
    [totalEstimated, extraTotal]
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

    if (!restaurantName.trim()) {
      newErrors.restaurantName = "Vui lòng nhập hoặc chọn quán ăn.";
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
      type: "FOOD",
      title: title || `Ăn uống: ${restaurantName}`,
      text: title || `Ăn uống: ${restaurantName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants: participants.map((p) =>
        typeof p === "number" ? p : p.memberId
      ),
      activityData: {
        restaurantName,
        location,
        restaurantLocation: effectiveFoodLocation || null,
        time: startTime || "",
        startTime,
        endTime,
        pricePerPerson: pricePerPerson ? Number(pricePerPerson) : null,
        peopleCount: peopleCount ? Number(peopleCount) : null,
        extraSpend: extraTotal || null,
        extraItems: normalizedExtraCosts,
        estimatedCost: estimatedTotal || null,
        actualCost: actualCost ? Number(actualCost) : null,
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
      accentClass="text-orange-600 dark:text-orange-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Ăn uống"
      name={restaurantName}
      emptyLabelText="Điền/chọn tên quán để lưu hoạt động ăn uống."
      locationText={
        effectiveFoodLocation?.address ||
        effectiveFoodLocation?.fullAddress ||
        location ||
        ""
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
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động ăn uống"}
      submitClassName="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaUtensils />,
          close: <FaTimes size={14} />,
          bg: "from-orange-500 to-amber-500",
        }}
        title="Hoạt động ăn uống"
        typeLabel="Food"
        subtitle="Lên kế hoạch quán ăn, cafe và chi phí bữa ăn."
        headerRight={headerRight}
        footerLeft={footerLeft}
        footerRight={footerRight}
      >
        {/* THÔNG TIN CHUNG */}
        <section className="space-y-3">
          <div className="flex flex_wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Thông tin chung
            </label>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Tên quán + địa chỉ + thời gian
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
                placeholder="Ví dụ: Ăn tối bún bò, uống cafe..."
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
                  hover:border-orange-400 hover:shadow-md hover:bg-orange-50/70
                  dark:hover:border-orange-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.restaurantName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }`}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                                bg-orange-50 text-orange-500 border border-orange-100
                                dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveFoodLocation || location ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveFoodLocation?.label ||
                          effectiveFoodLocation?.name ||
                          restaurantName ||
                          "Địa điểm đã chọn"}
                      </p>
                      {(effectiveFoodLocation?.address ||
                        effectiveFoodLocation?.fullAddress ||
                        location) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveFoodLocation?.address ||
                            effectiveFoodLocation?.fullAddress ||
                            location}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveFoodLocation?.lat != null &&
                          effectiveFoodLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                              {effectiveFoodLocation.lat.toFixed(4)},{" "}
                              {effectiveFoodLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn quán trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, tìm quán ăn/cafe và chọn làm địa
                        điểm.
                      </p>
                    </>
                  )}
                </div>

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-orange-500 group-hover:text-orange-600 dark:text-orange-300
                                dark:group-hover:text-orange-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.restaurantName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.restaurantName}
                </p>
              )}
            </div>

            {/* Thời gian ăn: dùng ActivityTimeRangeSection */}
            <ActivityTimeRangeSection
              sectionLabel="Thời gian ăn uống"
              startLabel="Bắt đầu"
              endLabel="Kết thúc"
              color="orange"
              iconClassName="text-orange-500"
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
        </section>

        {/* CHI PHÍ BỮA ĂN */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Chi phí bữa ăn
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Ước lượng theo đầu người + phát sinh + ngân sách + thực tế
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            {/* Giá / số người */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Chi phí dự tính / 1 người
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(e.target.value)}
                    placeholder="VD: 70.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Số người (ước tính)
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
                  Tổng chi phí thực tế cho bữa này (nếu có)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="Điền sau khi thanh toán xong"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Nếu để trống, hệ thống sẽ dùng{" "}
                  <b>chi phí dự kiến (theo đầu người + phát sinh)</b> để chia
                  tiền.
                </p>
              </div>

              {/* Ngân sách */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho bữa này (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
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
                Dự kiến theo đầu người:{" "}
                <span className="font-semibold">
                  {totalEstimated.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Phát sinh:{" "}
                <span className="font-semibold">
                  {extraTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Tổng dự kiến:{" "}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
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
            className={`${inputBase} w-full`}
            placeholder="Ví dụ: Nên đặt bàn, thử món đặc sản..."
          />
        </section>
      </ActivityModalShell>

      {/* PLACE PICKER CHO FOOD */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          setInternalFoodLocation(loc || null);
          if (loc?.label || loc?.name) {
            setRestaurantName(loc.label || loc.name);
            setErrors((prev) => ({ ...prev, restaurantName: "" }));
          }
          if (loc?.address || loc?.fullAddress) {
            setLocation(loc.address || loc.fullAddress);
          }
        }}
        initialTab="FOOD"
        activityType="FOOD"
        field="food"
        initialLocation={effectiveFoodLocation}
      />
    </>
  );
}
