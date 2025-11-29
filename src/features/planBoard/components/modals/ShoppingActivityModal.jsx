"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
  FaClock,
} from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";

import ActivityModalShell from "../ActivityModalShell";
import SplitMoneySection from "../SplitMoneySection";
import { inputBase, sectionCard } from "../activityStyles";

export default function ShoppingActivityModal({
  open,
  onClose,
  onSubmit,
  editingCard,
  planMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [budgetAmount, setBudgetAmount] = useState("");
  const [actualCost, setActualCost] = useState("");

  // nhiều dòng chi phí phát sinh (ship, túi, phụ thu...)
  const [extraItems, setExtraItems] = useState([{ note: "", amount: "" }]);

  // ==== CHIA TIỀN ====
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);

  // payer: "", "member:<id>", "external"
  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");

  // ==== LOAD DATA ====
  useEffect(() => {
    if (!open) return;

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

      setStartTime(
        editingCard.startTime || data.startTime || data.time || ""
      );
      setEndTime(
        editingCard.endTime ||
          data.endTime ||
          editingCard.startTime ||
          data.time ||
          ""
      );

      // LOAD BUDGET
      if (cost.budgetAmount != null) {
        setBudgetAmount(String(cost.budgetAmount));
      } else {
        setBudgetAmount("");
      }

      // LOAD actualCost: ưu tiên activityData, rồi cost.actualCost
      if (data.actualCost != null) {
        setActualCost(String(data.actualCost));
      } else if (cost.actualCost != null) {
        setActualCost(String(cost.actualCost));
      } else {
        setActualCost("");
      }

      // LOAD extraItems từ activityData / cost.extraCosts / extraSpend cũ
      let extras = [];
      if (
        data.extraItems &&
        Array.isArray(data.extraItems) &&
        data.extraItems.length > 0
      ) {
        extras = data.extraItems.map((it) => ({
          note: it.note || it.reason || "",
          amount:
            it.amount != null
              ? String(it.amount)
              : it.actualAmount != null
              ? String(it.actualAmount)
              : "",
        }));
      } else if (cost.extraCosts && cost.extraCosts.length > 0) {
        extras = cost.extraCosts.map((e) => ({
          note: e.reason || "",
          amount: e.actualAmount != null ? String(e.actualAmount) : "",
        }));
      } else if (data.extraSpend != null) {
        extras = [
          {
            note: "Chi phí phụ",
            amount: String(data.extraSpend),
          },
        ];
      }
      setExtraItems(extras.length ? extras : [{ note: "", amount: "" }]);

      // ===== LOAD SPLIT =====
      if (split.splitType && split.splitType !== "NONE") {
        setSplitEnabled(true);
        setSplitType(split.splitType);

        const pc =
          cost.participantCount ||
          split.splitMembers?.length ||
          split.splitDetails?.length ||
          editingCard.participantCount ||
          2;

        setParticipantCount(String(pc));

        let names = [];
        if (split.splitMembers?.length) {
          names = split.splitMembers.map((m) => m.displayName || "");
        }
        if (names.length < pc) {
          names = [...names, ...Array(pc - names.length).fill("")];
        }
        setSplitNames(names);

        if (split.splitType === "EXACT" && split.splitDetails) {
          setExactAmounts(
            split.splitDetails.map((d) =>
              d.amount != null ? String(d.amount) : ""
            )
          );
        } else {
          setExactAmounts([]);
        }

        setPayerChoice("");
        setPayerExternalName("");
        if (split.payerId) {
          setPayerChoice(`member:${split.payerId}`);
        } else if (split.payments && split.payments.length > 0) {
          const first = split.payments[0];
          const payer = first?.payer;
          if (payer) {
            if (payer.external || !payer.memberId) {
              setPayerChoice("external");
              setPayerExternalName(payer.displayName || "");
            } else if (payer.memberId) {
              setPayerChoice(`member:${payer.memberId}`);
            }
          }
        }
      } else {
        setSplitEnabled(false);
        setSplitType("EVEN");
        setParticipantCount("2");
        setSplitNames([]);
        setExactAmounts([]);
        setPayerChoice("");
        setPayerExternalName("");
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

      setBudgetAmount("");
      setActualCost("");
      setExtraItems([{ note: "", amount: "" }]);

      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");
    }
  }, [open, editingCard]);

  // ==== ITEMS UTILS ====
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

  // ==== EXTRA COST ROWS ====
  const handleAddExtraRow = () => {
    setExtraItems((prev) => [...prev, { note: "", amount: "" }]);
  };

  const handleChangeExtraRow = (index, field, value) => {
    setExtraItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveExtraRow = (index) => {
    setExtraItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ==== COST LOGIC ====
  const totalItemCost = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.price || 0);
      return sum + (Number.isNaN(price) ? 0 : price);
    }, 0);
  }, [items]);

  const extraTotal = useMemo(
    () =>
      extraItems
        .map((it) => Number(it.amount) || 0)
        .reduce((a, b) => a + b, 0),
    [extraItems]
  );

  const estimatedCost = useMemo(
    () => totalItemCost + extraTotal,
    [totalItemCost, extraTotal]
  );

  // Số tiền dùng để chia: ưu tiên actualCost, fallback estimatedCost
  const parsedActual = useMemo(() => {
    const a = Number(actualCost || 0);
    if (a > 0) return a;
    return estimatedCost;
  }, [actualCost, estimatedCost]);

  // ==== SPLIT UTILS ====
  const handleParticipantCount = (value) => {
    setParticipantCount(value);
    const n = Math.max(1, Number(value) || 1);

    setSplitNames((prev) => {
      const arr = [...prev];
      if (arr.length < n) return [...arr, ...Array(n - arr.length).fill("")];
      if (arr.length > n) return arr.slice(0, n);
      return arr;
    });

    setExactAmounts((prev) => {
      const arr = [...prev];
      if (arr.length < n) return [...arr, ...Array(n - arr.length).fill("")];
      if (arr.length > n) return arr.slice(0, n);
      return arr;
    });
  };

  const parsedParticipants = splitEnabled
    ? Math.max(1, Number(participantCount) || 1)
    : 0;

  const evenShare =
    splitEnabled && parsedParticipants > 0 && parsedActual > 0
      ? Math.floor(parsedActual / parsedParticipants)
      : null;

  const evenRemainder =
    splitEnabled && parsedParticipants > 0 && parsedActual > 0
      ? parsedActual % parsedParticipants
      : 0;

  const totalExact = exactAmounts
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  const selectedMemberId = payerChoice.startsWith("member:")
    ? Number(payerChoice.split(":")[1])
    : null;

  const selectedMember = selectedMemberId
    ? planMembers.find((m) => m.userId === selectedMemberId)
    : null;

  // ==== THỜI LƯỢNG (OPTIONAL) ====
  const computeDurationMinutes = () => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (
      Number.isNaN(sh) ||
      Number.isNaN(sm) ||
      Number.isNaN(eh) ||
      Number.isNaN(em)
    ) {
      return null;
    }
    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return null;
    return diff;
  };

  const durationMinutes = computeDurationMinutes();

  // ==== BUILD PAYLOAD: cost + split + participants ====
  const buildPayload = () => {
    const participants = splitEnabled
      ? Array.from({ length: parsedParticipants }).map((_, i) => ({
          memberId: null,
          displayName:
            splitNames[i] && splitNames[i].trim()
              ? splitNames[i].trim()
              : `Người ${i + 1}`,
          external: true,
        }))
      : [];

    let splitDetails = [];
    if (splitEnabled) {
      if (splitType === "EVEN") {
        const baseEven = evenShare || 0;
        const rem = evenRemainder || 0;
        splitDetails = Array.from({ length: parsedParticipants }).map(
          (_, i) => ({
            person: participants[i],
            amount: baseEven + (i < rem ? 1 : 0),
          })
        );
      } else if (splitType === "EXACT") {
        splitDetails = Array.from({ length: parsedParticipants }).map(
          (_, i) => ({
            person: participants[i],
            amount: Number(exactAmounts[i]) || 0,
          })
        );
      }
    }

    const extraCosts = extraItems
      .map((row) => ({
        reason: row.note?.trim() || "Chi phí phụ",
        type: "OTHER",
        estimatedAmount: null,
        actualAmount: row.amount ? Number(row.amount) : 0,
      }))
      .filter(
        (e) =>
          (e.actualAmount && e.actualAmount > 0) ||
          (e.reason && e.reason.trim() !== "")
      );

    const cost = {
      currencyCode: "VND",
      estimatedCost: estimatedCost || null,
      budgetAmount: budgetAmount ? Number(budgetAmount) : null,
      actualCost: actualCost ? Number(actualCost) : null,
      participantCount: splitEnabled ? parsedParticipants : null,
      participants,
      extraCosts,
    };

    let payerId = null;
    const payments = [];

    if (splitEnabled && parsedActual > 0) {
      if (selectedMember) {
        payerId = selectedMember.userId;
        payments.push({
          payer: {
            memberId: selectedMember.userId,
            displayName:
              selectedMember.displayName ||
              selectedMember.name ||
              `Thành viên ${selectedMember.userId}`,
            external: false,
          },
          amount: parsedActual,
          note: null,
        });
      } else if (payerChoice === "external") {
        const name =
          payerExternalName && payerExternalName.trim()
            ? payerExternalName.trim()
            : "Người trả";
        payments.push({
          payer: {
            memberId: null,
            displayName: name,
            external: true,
          },
          amount: parsedActual,
          note: null,
        });
      }
    }

    const split = splitEnabled
      ? {
          splitType,
          payerId,
          includePayerInSplit: true,
          splitMembers: participants,
          splitDetails,
          payments,
        }
      : {
          splitType: "NONE",
          payerId: null,
          includePayerInSplit: true,
          splitMembers: [],
          splitDetails: [],
          payments: [],
        };

    return { cost, split, participants, extraTotal };
  };

  // ==== SUBMIT ====
  const handleSubmit = () => {
    if (!storeName.trim()) return;

    const filteredItems = items
      .filter((it) => it.name.trim() || it.price)
      .map((it) => ({
        name: it.name.trim(),
        price: it.price ? Number(it.price) : 0,
      }));

    const { cost, split, participants, extraTotal } = buildPayload();

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
        items: filteredItems,
        totalItemCost,
        actualCost: actualCost ? Number(actualCost) : null,
        extraSpend: extraTotal || null,
        extraItems: cost.extraCosts,
        estimatedCost: estimatedCost || null,
      },
      cost,
      split,
    });

    onClose?.();
  };

  // ==== HEADER / FOOTER ====
  const headerRight =
    parsedActual > 0 || (budgetAmount && Number(budgetAmount) > 0) ? (
      <div className="hidden sm:flex flex-col items-end text-xs">
        {parsedActual > 0 && (
          <>
            <span className="text-slate-500 dark:text-slate-400">
              Tổng chi đùng để chia
            </span>
            <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
              {parsedActual.toLocaleString("vi-VN")}đ
            </span>
          </>
        )}
        {budgetAmount && Number(budgetAmount) > 0 && (
          <span className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Ngân sách:{" "}
            <b className="text-slate-700 dark:text-slate-100">
              {Number(budgetAmount).toLocaleString("vi-VN")}đ
            </b>
          </span>
        )}
      </div>
    ) : null;

  const footerLeft = (
    <div className="hidden sm:flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
      <span>
        {storeName
          ? `Mua sắm tại: ${storeName}`
          : "Điền tên cửa hàng / khu mua sắm để lưu hoạt động."}
      </span>
      {startTime && endTime && durationMinutes != null && (
        <span>
          Thời gian:{" "}
          <b>
            {startTime} - {endTime} ({durationMinutes} phút)
          </b>
        </span>
      )}
    </div>
  );

  const footerRight = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium 
        border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-slate-600
        dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        Hủy
      </button>
      <button
        onClick={handleSubmit}
        type="button"
        className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 
        text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl
        hover:brightness-105 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!storeName.trim()}
      >
        {editingCard ? "Lưu chỉnh sửa" : "Lưu hoạt động mua sắm"}
      </button>
    </div>
  );

  return (
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

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Tên cửa hàng / khu mua sắm{" "}
              <span className="text-red-500 align-middle">*</span>
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaShoppingBag className="text-pink-500" />
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Chợ, mall, cửa hàng..."
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Địa chỉ
            </label>
            <div className="flex items-center gap-2 mt-1">
              <FaMapMarkerAlt className="text-red-400" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ nơi mua..."
                className={`${inputBase} flex-1`}
              />
            </div>
          </div>

          {/* Thời gian bắt đầu / kết thúc */}
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Thời gian mua sắm
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-pink-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Bắt đầu
                </span>
                <div className="flex-1 flex justify-end">
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm">
                <FaClock className="text-pink-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Kết thúc
                </span>
                <div className="flex-1 flex justify-end">
                  <TimePicker value={endTime} onChange={setEndTime} />
                </div>
              </div>
            </div>

            {durationMinutes != null && (
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Thời lượng ước tính:{" "}
                <span className="font-semibold">{durationMinutes} phút</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* DANH SÁCH MÓN HÀNG + CHI PHÍ PHỤ + THỰC TẾ + NGÂN SÁCH + TÓM TẮT */}
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

          {/* Chi phí phụ nhiều dòng */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Chi phí phụ (ship, túi, phụ thu...)
              </label>
              <button
                type="button"
                onClick={handleAddExtraRow}
                className="text-[11px] font-medium text-indigo-500 hover:text-indigo-600 hover:underline"
              >
                + Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {extraItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={item.note}
                    onChange={(e) =>
                      handleChangeExtraRow(idx, "note", e.target.value)
                    }
                    placeholder="Ví dụ: phí ship, túi, gói quà..."
                    className={`${inputBase} flex-1`}
                  />
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" />
                    <input
                      type="number"
                      min="0"
                      value={item.amount}
                      onChange={(e) =>
                        handleChangeExtraRow(idx, "amount", e.target.value)
                      }
                      placeholder="0"
                      className={`${inputBase} w-24 sm:w-28`}
                    />
                    <span className="text-xs text-slate-500">đ</span>
                  </div>
                  {extraItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraRow(idx)}
                      className="text-xs text-slate-400 hover:text-red-500 px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Thực tế + Ngân sách chung một hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Chi phí thực tế */}
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

            {/* Ngân sách */}
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

          {/* CARD TÓM TẮT DỌC */}
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
  );
}
