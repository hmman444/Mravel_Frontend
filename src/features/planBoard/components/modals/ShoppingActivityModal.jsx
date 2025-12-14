// src/features/planBoard/components/modals/ShoppingActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
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
  { value: "SHIPPING", label: "Phí ship" },
  { value: "BAG", label: "Túi / bao bì" },
  { value: "SERVICE_FEE", label: "Phụ thu / dịch vụ" },
  { value: "OTHER", label: "Khác" },
];

export default function ShoppingActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  readOnly 
}) {
  const [title, setTitle] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);

  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalShoppingLocation, setInternalShoppingLocation] =
    useState(null);
  const effectiveShoppingLocation = internalShoppingLocation || null;

  // ===== LOAD DỮ LIỆU =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = editingCard.activityDataJson
        ? JSON.parse(editingCard.activityDataJson)
        : {};
      const cost = editingCard.cost || {};

      const split = editingCard.split || {};

      setTitle(editingCard.text || "");
      setStoreName(data.storeName || "");
      setAddress(data.address || "");

      setItems(
        Array.isArray(data.items)
          ? data.items.map((it) => ({
              name: it.name || "",
              price:
                it.price !== undefined && it.price !== null
                  ? String(it.price)
                  : "",
            }))
          : []
      );
      setNote(editingCard.description || "");

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
      setDurationMinutes(null); // để ActivityTimeRangeSection tính lại

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

      // extraCosts: dùng helper chung
      setExtraCosts(buildInitialExtraCosts(data, cost));

      if (data.shoppingLocation) {
        setInternalShoppingLocation(data.shoppingLocation);
      } else {
        setInternalShoppingLocation(null);
      }
    } else {
      // reset new
      setTitle("");
      setStoreName("");
      setAddress("");
      setItems([]);
      setNote("");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setBudgetAmount("");
      setActualCost("");
      setExtraCosts([]);

      setInternalShoppingLocation(null);
    }
  }, [open, editingCard]);

  // SYNC location từ PlacePicker vào tên + địa chỉ
  useEffect(() => {
    if (!effectiveShoppingLocation) return;

    if (effectiveShoppingLocation.label || effectiveShoppingLocation.name) {
      setStoreName(
        effectiveShoppingLocation.label ||
          effectiveShoppingLocation.name ||
          ""
      );
    }

    if (
      effectiveShoppingLocation.address ||
      effectiveShoppingLocation.fullAddress
    ) {
      setAddress(
        effectiveShoppingLocation.address ||
          effectiveShoppingLocation.fullAddress ||
          ""
      );
    }
  }, [effectiveShoppingLocation]);

  // ===== DANH SÁCH MÓN HÀNG =====
  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: "", price: "" }]);
  };

  const handleChangeItem = (idx, key, value) => {
    setItems((prev) => {
      const clone = [...prev];
      clone[idx][key] = value;
      return clone;
    });
  };

  const handleRemoveItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

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

  // ===== TÍNH CHI PHÍ =====
  const totalItemCost = useMemo(
    () =>
      items.reduce((sum, it) => {
        const price = Number(it.price || 0);
        return sum + (Number.isNaN(price) ? 0 : price);
      }, 0),
    [items]
  );

  const extraTotal = useMemo(
    () => calcExtraTotal(extraCosts),
    [extraCosts]
  );

  const estimatedCost = useMemo(
    () => totalItemCost + extraTotal,
    [totalItemCost, extraTotal]
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

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const extraTotalNormalized = calcExtraTotal(normalizedExtraCosts);

    const filteredItems = items
      .filter((it) => it.name.trim() || it.price)
      .map((it) => ({
        name: it.name.trim(),
        price: it.price ? Number(it.price) : 0,
      }));

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
      filteredItems,
    };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!storeName.trim()) {
      newErrors.storeName =
        "Vui lòng nhập hoặc chọn cửa hàng / địa điểm mua sắm.";
    }

    if (startTime && endTime && durationMinutes == null) {
      newErrors.time = "Giờ kết thúc phải muộn hơn giờ bắt đầu.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const {
      cost,
      split,
      participants,
      normalizedExtraCosts,
      extraTotal,
      filteredItems,
    } = buildPayload();

    onSubmit?.({
      type: "SHOPPING",
      title: title || `Mua sắm tại ${storeName}`,
      text: title || `Mua sắm tại ${storeName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount:
        splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,
      activityData: {
        storeName,
        address,
        shoppingLocation: effectiveShoppingLocation || null,
        time: startTime || "",
        startTime,
        endTime,
        items: filteredItems,
        totalItemCost,
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
      accentClass="text-pink-600 dark:text-pink-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Mua sắm tại"
      name={storeName}
      emptyLabelText="Điền/chọn tên cửa hàng / khu mua sắm để lưu hoạt động."
      locationText={
        (effectiveShoppingLocation || address)
          ? `Địa điểm: ${
              effectiveShoppingLocation?.address ||
              effectiveShoppingLocation?.fullAddress ||
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
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động mua sắm"}
      submitClassName="bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaShoppingBag />,
          close: <FaTimes size={14} />,
          bg: "from-pink-500 to-rose-500",
        }}
        title="Hoạt động mua sắm"
        typeLabel="Shopping"
        subtitle="Ghi lại những gì bạn mua và chi phí."
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
              Cửa hàng + địa chỉ + thời gian
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
                placeholder="Ví dụ: Mua đặc sản Đà Nẵng..."
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            {/* ĐỊA CHỈ + MAP PICKER */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Cửa hàng / địa chỉ trên bản đồ
              </label>

              <button
                type="button"
                onClick={() => setPlacePickerOpen(true)}
                className={`
                  group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-pink-400 hover:shadow-md hover:bg-pink-50/70
                  dark:hover:border-pink-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.storeName
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }
                `}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                                bg-pink-50 text-pink-500 border border-pink-100
                                dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveShoppingLocation || address || storeName ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveShoppingLocation?.label ||
                          effectiveShoppingLocation?.name ||
                          storeName ||
                          "Địa điểm đã chọn"}
                      </p>
                      {(effectiveShoppingLocation?.address ||
                        effectiveShoppingLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveShoppingLocation?.address ||
                            effectiveShoppingLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                          Đã chọn trên bản đồ
                        </span>
                        {effectiveShoppingLocation?.lat != null &&
                          effectiveShoppingLocation?.lng != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200">
                              {effectiveShoppingLocation.lat.toFixed(4)},{" "}
                              {effectiveShoppingLocation.lng.toFixed(4)}
                            </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn địa điểm mua sắm trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, chọn chợ / mall / cửa hàng bạn sẽ tới.
                      </p>
                    </>
                  )}
                </div>

                <span className="hidden md:inline-flex items-center text-[11px] font-medium
                                text-pink-500 group-hover:text-pink-600 dark:text-pink-300
                                dark:group-hover:text-pink-200">
                  Mở bản đồ
                </span>
              </button>
              {errors.storeName && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.storeName}
                </p>
              )}
            </div>

            {/* Thời gian mua sắm: dùng ActivityTimeRangeSection */}
            <div className="mt-3">
              <ActivityTimeRangeSection
                sectionLabel="Thời gian mua sắm"
                startLabel="Bắt đầu"
                endLabel="Kết thúc"
                color="pink"
                iconClassName="text-pink-500"
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

        {/* DANH SÁCH MÓN HÀNG + CHI PHÍ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Danh sách món hàng & chi phí
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-[11px] text-pink-600 dark:text-pink-300 hover:text-pink-500"
            >
              <FaPlus className="text-[10px]" /> Thêm món
            </button>
          </div>

          <div className={sectionCard + " space-y-4"}>
            {/* Danh sách món hàng */}
            <div>
              {items.length === 0 && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Nhập từng món đã mua và giá tiền.
                </p>
              )}

              <div className="space-y-2 mt-1">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <input
                      value={it.name}
                      onChange={(e) =>
                        handleChangeItem(idx, "name", e.target.value)
                      }
                      placeholder={`Món hàng ${idx + 1}`}
                      className={`${inputBase} flex-1`}
                    />

                    <div className="flex items-center gap-1">
                      <FaMoneyBillWave className="text-emerald-500" />
                      <input
                        type="number"
                        min="0"
                        value={it.price}
                        onChange={(e) =>
                          handleChangeItem(idx, "price", e.target.value)
                        }
                        placeholder="Giá"
                        className={`${inputBase} w-28`}
                      />
                      <span className="text-xs text-slate-500">đ</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                    dark:hover:bg-rose-950/40 transition"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi phí phụ – dùng ExtraCostsSection */}
            <ExtraCostsSection
              extraCosts={extraCosts}
              addExtraCost={addExtraCost}
              updateExtraCost={updateExtraCost}
              removeExtraCost={removeExtraCost}
              extraTypes={EXTRA_TYPES}
              label="Chi phí phụ (ship, túi, phụ thu...)"
            />

            {/* Thực tế + Ngân sách */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Tổng chi phí thực tế cho lần mua sắm (nếu có)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" />
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="Điền sau khi thanh toán hóa đơn"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho lần mua sắm (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-pink-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="VD: 2.000.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Nếu để trống <b>chi phí thực tế</b>, hệ thống sẽ dùng{" "}
              <b>tổng giá món + chi phí phụ</b> để chia tiền.
            </p>

            {/* CARD TÓM TẮT */}
            <div className="mt-2 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 px-4 py-3 text-[11px] leading-relaxed text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Tổng giá món:{" "}
                <span className="font-semibold">
                  {totalItemCost.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Chi phí phụ:{" "}
                <span className="font-semibold">
                  {extraTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                Tổng dự kiến (món + phụ):{" "}
                <span className="font-semibold text-pink-600 dark:text-pink-400">
                  {estimatedCost.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-pink-600 dark:text-pink-400">
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
            placeholder="Ví dụ: Mua làm quà cho gia đình..."
            className={`${inputBase} w-full`}
          />
        </section>
      </ActivityModalShell>

      {/* PLACE PICKER CHO SHOPPING */}
      <PlacePickerModal
        open={placePickerOpen}
        onClose={() => setPlacePickerOpen(false)}
        onSelect={(loc) => {
          const next = loc || null;
          setInternalShoppingLocation(next);

          if (next?.label || next?.name) {
            setStoreName(next.label || next.name);
            setErrors((prev) => ({ ...prev, storeName: "" }));
          }
          if (next?.address || next?.fullAddress) {
            setAddress(next.address || next.fullAddress);
          }
        }}
        initialTab="SHOPPING"
        activityType="SHOPPING"
        field="shopping"
        initialLocation={effectiveShoppingLocation}
      />
    </>
  );
}
