// splitUtils.js
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
