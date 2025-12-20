// src/features/planBoard/components/modals/EventActivityModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

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
  slimLocationForStorage,
  normalizeLocationFromStored,
  getLocDisplayLabel,
} from "../../utils/locationUtils";

import { pickStartEndFromCard } from "../../utils/activityTimeUtils";

const EXTRA_TYPES = [
  { value: "SERVICE_FEE", label: "Phí dịch vụ" },
  { value: "SURCHARGE", label: "Phụ thu" },
  { value: "TAX", label: "Thuế" },
  { value: "OTHER", label: "Khác" },
];

const safeJsonParse = (str) => {
  try {
    return str ? JSON.parse(str) : {};
  } catch {
    return {};
  }
};

export default function EventActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
  readOnly = false,
}) {
  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(null);

  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketCount, setTicketCount] = useState("1");

  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");

  const [extraCosts, setExtraCosts] = useState([]);
  const [errors, setErrors] = useState({});

  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [internalEventLocation, setInternalEventLocation] = useState(null);
  const effectiveEventLocation = internalEventLocation || null;

  // ===== LOAD WHEN OPEN =====
  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (editingCard) {
      const data = safeJsonParse(editingCard.activityDataJson);
      const cost = editingCard.cost || {};

      setTitle(editingCard.text || "");
      setEventName(data.eventName || "");
      setVenue(data.venue || "");
      setAddress(data.address || "");

      const { start, end } = pickStartEndFromCard(editingCard, data);
      setStartTime(start);
      setEndTime(end);
      setDurationMinutes(null);

      setTicketPrice(data.ticketPrice != null ? String(data.ticketPrice) : "");
      setTicketCount(data.ticketCount != null ? String(data.ticketCount) : "1");

      setBudgetAmount(cost.budgetAmount != null ? String(cost.budgetAmount) : "");
      setActualCost(cost.actualCost != null ? String(cost.actualCost) : "");

      setExtraCosts(buildInitialExtraCosts(data, cost));
      setNote(editingCard.description || "");

      const nLoc = normalizeLocationFromStored(data.eventLocation) || null;
      setInternalEventLocation(nLoc);

      // nếu có fullAddress từ loc mới -> sync text cho UI
      if (nLoc?.fullAddress) {
        const label = getLocDisplayLabel(nLoc, data.venue || "");
        if (label) setVenue(label);
        setAddress(nLoc.fullAddress || nLoc.address || data.address || "");
      }
    } else {
      // reset new
      setTitle("");
      setEventName("");
      setVenue("");
      setAddress("");

      setStartTime("");
      setEndTime("");
      setDurationMinutes(null);

      setTicketPrice("");
      setTicketCount("1");
      setBudgetAmount("");
      setActualCost("");
      setExtraCosts([]);
      setNote("");

      setInternalEventLocation(null);
      setPlacePickerOpen(false);
    }
  }, [open, editingCard]);

  // ===== SYNC label from location -> venue/address =====
  useEffect(() => {
    if (!effectiveEventLocation) return;

    const label = getLocDisplayLabel(effectiveEventLocation, "");
    if (label) setVenue(label);

    if (effectiveEventLocation.fullAddress || effectiveEventLocation.address) {
      setAddress(effectiveEventLocation.fullAddress || effectiveEventLocation.address || "");
    }
  }, [effectiveEventLocation]);

  // ===== EXTRA COSTS CRUD =====
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

  // ===== COST (FIX ESTIMATED COST LIKE OTHER MODALS) =====
  // baseEstimated = vé (không bao gồm extra). Extra tách riêng trong extraCosts.
  const baseEstimated = useMemo(() => {
    const p = Number(ticketPrice || 0);
    const c = Number(ticketCount || 0);
    return p * c;
  }, [ticketPrice, ticketCount]);

  const extraTotal = useMemo(() => calcExtraTotal(extraCosts), [extraCosts]);

  // tổng dự kiến để hiển thị & fallback chia tiền (base + extra)
  const estimatedTotal = useMemo(() => baseEstimated + extraTotal, [baseEstimated, extraTotal]);

  // dùng để chia tiền: nếu có actual thì dùng actual, không thì dùng estimatedTotal
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

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const normalizedExtraCosts = normalizeExtraCosts(extraCosts);
    const normalizedParticipants = participants.map((p) => (typeof p === "number" ? p : p?.memberId));

    const cost = {
      currencyCode: "VND",
      // ✅ estimatedCost chỉ là base (vé) giống các modal khác
      estimatedCost: baseEstimated > 0 ? baseEstimated : null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? Number(parsedParticipants || 0) : null,
      participants: normalizedParticipants,
      extraCosts: normalizedExtraCosts,
    };

    return { cost, split: splitPayload, participants: normalizedParticipants, normalizedExtraCosts };
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const newErrors = {};

    if (!eventName.trim()) newErrors.eventName = "Vui lòng nhập tên sự kiện.";

    // bắt buộc có địa điểm: chọn map hoặc nhập venue/address
    if (!effectiveEventLocation && !venue.trim() && !address.trim()) {
      newErrors.venue = "Vui lòng chọn địa điểm sự kiện trên bản đồ hoặc nhập venue / địa chỉ.";
    }

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
      type: "EVENT",
      title: title || `Sự kiện: ${eventName}`,
      text: title || `Sự kiện: ${eventName}`,
      description: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes ?? null,
      participantCount: splitEnabled && parsedParticipants > 0 ? parsedParticipants : null,
      participants,

      // ✅ activityData GỌN: chỉ đặc thù EVENT (KHÔNG nhét tiền/extra/time vào)
      activityData: {
        eventName: eventName.trim(),
        venue: venue.trim(),
        address: address?.trim() || "",
        eventLocation: slimLocationForStorage(effectiveEventLocation),
        ticketPrice: ticketPrice ? Number(ticketPrice) : null,
        ticketCount: ticketCount ? Number(ticketCount) : null,
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
      accentClass="text-indigo-600 dark:text-indigo-400"
    />
  );

  const footerLeft = (
    <ActivityFooterSummary
      labelPrefix="Sự kiện"
      name={eventName}
      emptyLabelText="Điền tên sự kiện để lưu hoạt động."
      locationText={
        effectiveEventLocation?.fullAddress || effectiveEventLocation?.address || address || venue
          ? `${
              effectiveEventLocation?.fullAddress ||
              effectiveEventLocation?.address ||
              address ||
              venue
            }`
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
      submitLabel={editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động sự kiện"}
      submitClassName="bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30"
    />
  );

  return (
    <>
      <ActivityModalShell
        open={open}
        onClose={onClose}
        icon={{
          main: <FaCalendarAlt />,
          close: <FaTimes size={14} />,
          bg: "from-indigo-500 to-purple-500",
        }}
        title="Hoạt động sự kiện"
        typeLabel="Event"
        subtitle="Concert, lễ hội, workshop, show..."
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
              Tên sự kiện + địa điểm + thời gian
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
                placeholder="Ví dụ: Concert Đen Vâu, lễ hội ánh sáng..."
                className={`${inputBase} w-full mt-1`}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Tên sự kiện <span className="text-red-500 align-middle">*</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <FaCalendarAlt className="text-indigo-500" />
                <input
                  value={eventName}
                  onChange={(e) => {
                    setEventName(e.target.value);
                    setErrors((prev) => ({ ...prev, eventName: "" }));
                  }}
                  placeholder="Tên concert, show, workshop..."
                  className={`${inputBase} flex-1 ${
                    errors.eventName
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30"
                      : ""
                  }`}
                />
              </div>
              {errors.eventName && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.eventName}</p>
              )}
            </div>

            {/* ĐỊA ĐIỂM - chọn trên bản đồ */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Địa điểm tổ chức / venue{" "}
                <span className="text-red-500 align-middle">*</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setPlacePickerOpen(true);
                  setErrors((prev) => ({ ...prev, venue: "" }));
                }}
                className={`group mt-1 w-full rounded-2xl border bg-white/90 dark:bg-slate-900/80
                  border-slate-200/80 dark:border-slate-700 px-3 py-2.5
                  flex items-start gap-3 text-left
                  hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/70
                  dark:hover:border-indigo-500 dark:hover:bg-slate-900
                  transition
                  ${
                    errors.venue
                      ? "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40"
                      : ""
                  }`}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl
                    bg-indigo-50 text-indigo-500 border border-indigo-100
                    dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
                >
                  <FaMapMarkerAlt />
                </div>

                <div className="flex-1 min-w-0">
                  {effectiveEventLocation || venue || address ? (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {effectiveEventLocation?.label ||
                          effectiveEventLocation?.name ||
                          venue ||
                          "Địa điểm đã chọn"}
                      </p>

                      {(effectiveEventLocation?.address ||
                        effectiveEventLocation?.fullAddress ||
                        address) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {effectiveEventLocation?.address ||
                            effectiveEventLocation?.fullAddress ||
                            address}
                        </p>
                      )}

                      {effectiveEventLocation?.lat != null &&
                        effectiveEventLocation?.lng != null && (
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80">
                              Đã chọn trên bản đồ
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                              {effectiveEventLocation.lat.toFixed(4)},{" "}
                              {effectiveEventLocation.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-100">
                        Chọn địa điểm sự kiện trên bản đồ
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhấn để mở bản đồ, tìm sân vận động, hội trường, venue tổ chức...
                      </p>
                    </>
                  )}
                </div>

                <span
                  className="hidden md:inline-flex items-center text-[11px] font-medium
                    text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-300
                    dark:group-hover:text-indigo-200"
                >
                  Mở bản đồ
                </span>
              </button>

              {errors.venue && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.venue}</p>
              )}
            </div>

            {/* Thời gian sự kiện */}
            <div className="mt-3">
              <ActivityTimeRangeSection
                sectionLabel="Thời gian sự kiện"
                startLabel="Bắt đầu"
                endLabel="Kết thúc"
                color="indigo"
                iconClassName="text-indigo-500"
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

        {/* CHI PHÍ SỰ KIỆN */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Chi phí sự kiện
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Vé + phát sinh (gửi xe, đồ ăn, merch...) + ngân sách + thực tế
            </span>
          </div>

          <div className={sectionCard + " space-y-4"}>
            {/* Vé / số vé */}
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
                    placeholder="VD: 500.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Số vé (ước tính)
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
              label="Chi phí phát sinh (gửi xe, đồ ăn, merch...)"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Thực tế */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Tổng chi phí thực tế cho sự kiện (nếu có)
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
                  Nếu để trống, hệ thống sẽ dùng <b>vé + phát sinh</b> để chia tiền.
                </p>
              </div>

              {/* Ngân sách */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                  Ngân sách cho sự kiện (tuỳ chọn)
                </label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-indigo-500" />
                  <input
                    type="number"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="VD: 1.500.000"
                    className={`${inputBase} flex-1`}
                  />
                  <span className="text-xs text-slate-500">đ</span>
                </div>
              </div>
            </div>

            {/* Tóm tắt */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 space-y-0.5">
              <div>
                Vé (ước tính): <span className="font-semibold">{baseEstimated.toLocaleString("vi-VN")}đ</span>
              </div>
              <div>
                Phát sinh: <span className="font-semibold">{extraTotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div>
                Tổng dự kiến (vé + phát sinh):{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {estimatedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {actualCost && Number(actualCost) > 0 && (
                <div>
                  Đang dùng <b>chi phí thực tế</b> để chia tiền:{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
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

        {/* NOTE */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ghi chú</label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Thêm lưu ý nhỏ cho cả nhóm</span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: đến sớm 30 phút, mang áo mưa nhẹ, hẹn nhau cổng số 3..."
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
            setInternalEventLocation(null);
            setPlacePickerOpen(false);
            return;
          }

          const slim = normalizeLocationFromStored(slimLocationForStorage(loc));
          const label = getLocDisplayLabel(slim, "");

          setInternalEventLocation(slim || null);
          setErrors((prev) => ({ ...prev, venue: "" }));

          if (label) setVenue(label);
          if (slim?.fullAddress || slim?.address) setAddress(slim.fullAddress || slim.address || "");

          setPlacePickerOpen(false);
        }}
        initialTab="PLACE"
        activityType="EVENT"
        field="event"
        initialLocation={effectiveEventLocation}
      />
    </>
  );
}
