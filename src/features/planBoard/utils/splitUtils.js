// splitUtils.js
export function buildSplitBase({
  splitEnabled,
  splitType,          // "EVEN" | "EXACT"
  participantCount,   // string hoặc number
  splitNames,         // ["A", "B", ...]
  exactAmounts,       // ["50000", "60000", ...]
  payerChoice,        // "", "member:<id>", "external"
  payerExternalName,  // string
  planMembers = [],   // [{ userId, displayName, name, ... }]
  parsedActual,       // số tiền dùng để chia
}) {
  // số người tham gia
  const parsedParticipants = splitEnabled
    ? Math.max(1, Number(participantCount) || 1)
    : 0;

  // danh sách person cho splitMembers
  const participants = splitEnabled
    ? Array.from({ length: parsedParticipants }).map((_, i) => ({
        memberId: null, // hiện tại đang coi tất cả là người ngoài
        displayName:
          splitNames[i] && splitNames[i].trim()
            ? splitNames[i].trim()
            : `Người ${i + 1}`,
        external: true,
      }))
    : [];

  // EVEN share
  let evenShare = null;
  let evenRemainder = 0;

  if (
    splitEnabled &&
    splitType === "EVEN" &&
    parsedParticipants > 0 &&
    parsedActual > 0
  ) {
    evenShare = Math.floor(parsedActual / parsedParticipants);
    evenRemainder = parsedActual % parsedParticipants;
  }

  // EXACT tổng
  const totalExact = exactAmounts
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  // splitDetails
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

  // chọn payer
  const selectedMemberId = payerChoice.startsWith("member:")
    ? Number(payerChoice.split(":")[1])
    : null;

  const selectedMember = selectedMemberId
    ? planMembers.find((m) => m.userId === selectedMemberId)
    : null;

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

  return {
    parsedParticipants,
    participants,
    split,
    splitDetails,
    evenShare,
    evenRemainder,
    totalExact,
  };
}
