// src/features/planBoard/utils/costUtils.js

// EXTRA COSTS 

/**
 * Build extraCosts state khi LOAD CARD (edit) từ activityData + cost
 * Dùng chung cho các modal: FOOD / TRANSPORT / STAY / ...
 */
export function buildInitialExtraCosts(activityData = {}, cost = {}) {
  // 1) Ưu tiên extraItems trong activityData (format mới)
  if (
    Array.isArray(activityData.extraItems) &&
    activityData.extraItems.length > 0
  ) {
    return activityData.extraItems.map((it) => ({
      reason: it.reason || it.note || "Chi phí phụ",
      type: it.type || "OTHER",
      estimatedAmount: null,
      actualAmount:
        it.actualAmount != null
          ? Number(it.actualAmount)
          : it.amount != null
          ? Number(it.amount)
          : 0,
    }));
  }

  // 2) Nếu không có, dùng cost.extraCosts (format chuẩn cost)
  if (Array.isArray(cost.extraCosts) && cost.extraCosts.length > 0) {
    return cost.extraCosts.map((e) => ({
      reason: e.reason || "Chi phí phụ",
      type: e.type || "OTHER",
      estimatedAmount: null,
      actualAmount:
        e.actualAmount != null && e.actualAmount !== ""
          ? Number(e.actualAmount)
          : 0,
    }));
  }

  // 3) Legacy: activityData.extraSpend (tổng lẻ)
  if (activityData.extraSpend != null) {
    return [
      {
        reason: "Chi phí phụ",
        type: "OTHER",
        estimatedAmount: null,
        actualAmount: Number(activityData.extraSpend) || 0,
      },
    ];
  }

  return [];
}

/**
 * Normalize extraCosts trước khi gửi BE
 */
export function normalizeExtraCosts(extraCosts = []) {
  return extraCosts
    .map((e) => ({
      reason: e.reason || "Chi phí phụ",
      type: e.type || "OTHER",
      estimatedAmount: null,
      actualAmount:
        e.actualAmount !== undefined &&
        e.actualAmount !== null &&
        e.actualAmount !== ""
          ? Number(e.actualAmount)
          : 0,
    }))
    .filter(
      (e) =>
        (e.actualAmount && e.actualAmount > 0) ||
        (e.reason && e.reason.trim() !== "")
    );
}

/**
 * Tính tổng actualAmount từ extraCosts
 */
export function calcExtraTotal(extraCosts = []) {
  return extraCosts
    .map((e) => Number(e.actualAmount) || 0)
    .reduce((a, b) => a + b, 0);
}

// THỜI GIAN / DURATION

/**
 * Tính số phút giữa startTime và endTime (format "HH:mm")
 * - Nếu không hợp lệ hoặc end <= start → trả null
 */
export function computeDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const [sh, sm] = String(startTime).split(":").map(Number);
  const [eh, em] = String(endTime).split(":").map(Number);
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
}
