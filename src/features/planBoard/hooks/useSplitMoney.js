import { useState, useEffect, useMemo } from "react";

/**
 * Hook dùng chung cho tất cả ActivityModal để xử lý CHIA TIỀN
 *
 * @param {object} params
 *  - editingCard: card đang edit (hoặc null)
 *  - planMembers: danh sách member trong plan (để map userId -> displayName)
 *  - parsedActual: tổng số tiền dùng để chia (đã tính ở modal: actualCost || estimatedTotal)
 */
export function useSplitMoney({ editingCard, planMembers = [], parsedActual }) {
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitType, setSplitType] = useState("EVEN");
  const [participantCount, setParticipantCount] = useState("2");
  const [splitNames, setSplitNames] = useState([]);
  const [exactAmounts, setExactAmounts] = useState([]);
  const [payerChoice, setPayerChoice] = useState("");
  const [payerExternalName, setPayerExternalName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // ===== LOAD TỪ editingCard (khi mở modal sửa) =====
  useEffect(() => {
    // tạo mới → reset
    if (!editingCard) {
      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");
      setSelectedMemberIds([]);
      return;
    }

    const cost = editingCard.cost || {};
    const split = editingCard.split || {};

    // Ai đang chia tiền
    let initialSelectedIds = [];
    if (Array.isArray(cost.participants) && cost.participants.length > 0) {
      initialSelectedIds = cost.participants.filter((id) => id != null);
    } else if (
      Array.isArray(split.splitMembers) &&
      split.splitMembers.length > 0
    ) {
      initialSelectedIds = split.splitMembers.filter((id) => id != null);
    }
    setSelectedMemberIds(initialSelectedIds);

    // Có đang bật chia tiền không
    if (split.splitType && split.splitType !== "NONE") {
      setSplitEnabled(true);
      setSplitType(split.splitType);

      const pc =
        cost.participantCount ||
        (Array.isArray(initialSelectedIds) && initialSelectedIds.length) ||
        (Array.isArray(split.splitDetails) && split.splitDetails.length) ||
        editingCard.participantCount ||
        2;

      setParticipantCount(String(pc));

      // Tên sẽ sync từ SplitMoneySection dựa trên planMembers + selectedMemberIds
      setSplitNames([]);

      // EXACT thì load số tiền từng người
      if (split.splitType === "EXACT" && split.splitDetails) {
        setExactAmounts(
          split.splitDetails.map((d) =>
            d.amount != null ? String(d.amount) : ""
          )
        );
      } else {
        setExactAmounts([]);
      }

      // Người trả chính
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
      // card cũ chưa từng chia → tắt chia
      setSplitEnabled(false);
      setSplitType("EVEN");
      setParticipantCount("2");
      setSplitNames([]);
      setExactAmounts([]);
      setPayerChoice("");
      setPayerExternalName("");
    }
  }, [editingCard]);

  // vẫn giữ participantCount để BE có thể dự phòng, nhưng số thực tế sẽ sync theo selectedMemberIds
  const handleParticipantCount = (value) => {
    setParticipantCount(value);
  };

  // Tính toán chia tiền chung bằng buildSplitBase
  const splitBase = useMemo(
    () =>
      buildSplitBase({
        splitEnabled,
        splitType,
        exactAmounts,
        payerChoice,
        planMembers,
        parsedActual,
        selectedMemberIds,
      }),
    [
      splitEnabled,
      splitType,
      exactAmounts,
      payerChoice,
      planMembers,
      parsedActual,
      selectedMemberIds,
    ]
  );

  return {
    // state + setter cho modal + SplitMoneySection
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

    // từ buildSplitBase
    ...splitBase,
  };
}

// splitUtils
export function buildSplitBase({
  splitEnabled,
  splitType,             
  exactAmounts = [],     
  payerChoice,            
  planMembers = [],     
  parsedActual,           
  selectedMemberIds = [], 
}) {
  if (!splitEnabled) {
    return {
      parsedParticipants: 0,
      participants: [],
      split: {
        splitType: "NONE",
        payerId: null,
        includePayerInSplit: true,
        splitMembers: [],
        splitDetails: [],
        payments: [],
      },
      splitDetails: [],
      evenShare: 0,
      evenRemainder: 0,
      totalExact: 0,
    };
  }

  const participants = selectedMemberIds.map((id) => {
    const m = planMembers.find((x) => x.userId === id);
    return {
      memberId: id,
      displayName: m?.displayName || m?.name || `Thành viên ${id}`,
      external: false,
    };
  });

  const parsedParticipants = participants.length;

  let evenShare = 0;
  let evenRemainder = 0;

  if (
    splitType === "EVEN" &&
    parsedParticipants > 0 &&
    parsedActual > 0
  ) {
    evenShare = Math.floor(parsedActual / parsedParticipants);
    evenRemainder = parsedActual % parsedParticipants;
  }

  const totalExact = exactAmounts
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  let rawSplitDetails = [];

  if (splitType === "EVEN") {
    rawSplitDetails = participants.map((p, idx) => ({
      person: p,
      amount: evenShare + (idx < evenRemainder ? 1 : 0),
    }));
  } else if (splitType === "EXACT") {
    rawSplitDetails = participants.map((p, idx) => ({
      person: p,
      amount: Number(exactAmounts[idx]) || 0,
    }));
  }

  let payerId = null;
  let paymentsRaw = [];

  const selectedMemberId = payerChoice?.startsWith("member:")
    ? Number(payerChoice.split(":")[1])
    : null;

  const payer = selectedMemberId
    ? planMembers.find((m) => m.userId === selectedMemberId)
    : null;

  if (payer && parsedActual > 0) {
    payerId = payer.userId;

    paymentsRaw.push({
      payer: {
        memberId: payer.userId,
        displayName: payer.displayName || payer.name,
        external: false,
      },
      amount: parsedActual,
      note: null,
    });
  }

  const splitMembersForBE = participants.map((p) => p.memberId);

  const splitDetailsForBE = rawSplitDetails.map((d) => ({
    userId: d.person.memberId,
    amount: d.amount,
  }));

  const paymentsForBE = paymentsRaw.map((p) => ({
    payerUserId: p.payer.memberId,
    amount: p.amount,
    note: p.note,
  }));

  const split = {
    splitType,
    payerId,
    includePayerInSplit: true,
    splitMembers: splitMembersForBE,
    splitDetails: splitDetailsForBE,
    payments: paymentsForBE,
  };

  return {
    parsedParticipants,
    participants,
    split,
    splitDetails: rawSplitDetails,
    evenShare,
    evenRemainder,
    totalExact,
  };
}
