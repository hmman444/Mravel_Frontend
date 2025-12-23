// src/features/planBoard/components/stats/utils/planStatsUtils.js
"use client";


export function buildPlanStats(board) {
  const currency = board?.budgetCurrency || board?.costSummary?.budgetCurrency || "VND";

  // Flatten cards
  const lists = Array.isArray(board?.lists) ? board.lists : [];
  const allCards = [];

  for (const l of lists) {
    if (!l || l.type === "TRASH") continue;
    const cards = Array.isArray(l.cards) ? l.cards : [];
    for (const c of cards) {
      allCards.push({
        ...c,
        __listId: l.id,
        __dayDate: l.dayDate || null,
        __listType: l.type,
      });
    }
  }

  const activities = allCards.length;

  // Totals (computed)
  let sumBudget = 0;
  let sumEstimated = 0;
  let sumActual = 0;
  let sumExtraActual = 0;

  // Coverage
  let doneCount = 0;
  let hasTimeCount = 0;
  let hasCostCount = 0;
  let hasParticipantsCount = 0;

  const issues = [];
  const spendItems = [];

  for (const c of allCards) {
    const cost = c?.cost || {};
    const split = c?.split || {};
    const extras = Array.isArray(cost?.extraCosts) ? cost.extraCosts : [];

    const estimated = num(cost?.estimatedCost);
    const actual = num(cost?.actualCost);
    const budget = num(cost?.budgetAmount);

    const extraActual = extras.reduce((acc, x) => acc + num(x?.actualAmount), 0);
    const actualTotal = actual + extraActual;

    sumBudget += budget;
    sumEstimated += estimated;
    sumActual += actual;
    sumExtraActual += extraActual;

    if (c?.done) doneCount++;

    const hasTime = isValidTime(c?.startTime) && isValidTime(c?.endTime);
    if (hasTime) hasTimeCount++;

    const hasCost =
      isFiniteNumber(cost?.estimatedCost) ||
      isFiniteNumber(cost?.actualCost) ||
      isFiniteNumber(cost?.budgetAmount) ||
      extras.length > 0;
    if (hasCost) hasCostCount++;

    const participants = Array.isArray(cost?.participants) ? cost.participants : [];
    const participantCount = cost?.participantCount ?? c?.participantCount ?? null;
    const hasParticipants =
      (Array.isArray(participants) && participants.length > 0) ||
      (isFiniteNumber(participantCount) && participantCount > 0);
    if (hasParticipants) hasParticipantsCount++;

    const cardTitle = (c?.text || "Hoạt động").trim() || "Hoạt động";
    const activityType = String(c?.activityType || "OTHER");
    const dayDate = c?.__dayDate;

    // Issues rules
    const cardIssues = [];

    if (isValidTime(c?.startTime) && isValidTime(c?.endTime)) {
      if (!isEndAfterStart(c.startTime, c.endTime)) {
        cardIssues.push(
          issue("TIME_INVALID", "ERROR", "Thời gian chưa hợp lệ", "Giờ kết thúc phải lớn hơn giờ bắt đầu.")
        );
      }
    } else {
      cardIssues.push(
        issue("TIME_MISSING", "WARN", "Thiếu thời gian", "Hoạt động chưa có giờ bắt đầu/kết thúc.")
      );
    }

    if (
      isFiniteNumber(participantCount) &&
      Array.isArray(participants) &&
      participantCount !== participants.length
    ) {
      cardIssues.push(
        issue(
          "PARTICIPANTS_MISMATCH",
          "WARN",
          "Người tham gia chưa khớp",
          `Số người tham gia (${participantCount}) khác với danh sách (${participants.length}).`
        )
      );
    }

    // Actual too small vs estimated (heuristic giống yêu cầu ví dụ)
    if (estimated >= 50000 && actual > 0 && actual <= 10) {
      cardIssues.push(
        issue(
          "ACTUAL_SUSPICIOUS",
          "WARN",
          "Chi phí thực tế bất thường",
          `Thực tế ${fmtMoney(actual, currency)} quá nhỏ so với dự toán ${fmtMoney(estimated, currency)}.`
        )
      );
    }

    // Split checks
    const splitType = String(split?.splitType || "NONE");
    const splitMembers = Array.isArray(split?.splitMembers) ? split.splitMembers : [];
    const splitDetails = Array.isArray(split?.splitDetails) ? split.splitDetails : [];
    const payments = Array.isArray(split?.payments) ? split.payments : [];

    if (splitType !== "NONE") {
      if (splitMembers.length === 0) {
        cardIssues.push(
          issue(
            "SPLIT_MEMBERS_EMPTY",
            "ERROR",
            "Chia tiền thiếu thành viên",
            "Đang bật chia tiền nhưng chưa chọn ai tham gia chia."
          )
        );
      }
      if (splitDetails.length === 0) {
        cardIssues.push(
          issue(
            "SPLIT_DETAILS_EMPTY",
            "WARN",
            "Thiếu chi tiết chia tiền",
            "Chưa có chi tiết mỗi người trả bao nhiêu."
          )
        );
      } else {
        const sumDetails = splitDetails.reduce((acc, x) => acc + num(x?.amount), 0);
        if (actualTotal > 0 && !almostEqual(sumDetails, actualTotal, 2)) {
          cardIssues.push(
            issue(
              "SPLIT_NOT_MATCH_TOTAL",
              "WARN",
              "Chia tiền chưa khớp tổng",
              `Tổng chia ${fmtMoney(sumDetails, currency)} nhưng tổng thực chi là ${fmtMoney(actualTotal, currency)}.`
            )
          );
        }
      }

      const payerId = split?.payerId ?? null;
      if (payerId == null && payments.length === 0) {
        cardIssues.push(
          issue(
            "PAYER_MISSING",
            "WARN",
            "Chưa chọn người trả",
            "Bạn đang bật chia tiền nhưng chưa chọn người trả và chưa có thanh toán."
          )
        );
      }
    }

    if (cardIssues.length) {
      for (const it of cardIssues) {
        issues.push({ ...it, dayDate, activityType, cardTitle });
      }
    }

    if (actualTotal > 0) {
      const badge =
        cardIssues.length === 0
          ? null
          : cardIssues.some((x) => x.severity === "ERROR")
          ? `${cardIssues.length} vấn đề`
          : `${cardIssues.length} cảnh báo`;

      spendItems.push({
        dayDate,
        activityType,
        cardTitle,
        actualTotal,
        issueBadge: badge,
      });
    }
  }

  // Prefer BE totals if exist
  const costSummary = board?.costSummary || null;
  const totals = {
    activities,
    budget: num(board?.budgetTotal) || num(costSummary?.budgetTotal) || sumBudget,
    estimated: num(board?.totalEstimatedCost) || num(costSummary?.totalEstimatedCost) || sumEstimated,
    actual: num(board?.totalActualCost) || num(costSummary?.totalActualCost) || sumActual,
    extraActual: sumExtraActual,
  };

  // By day
  const byDayRaw = Array.isArray(costSummary?.byDay) ? costSummary.byDay : [];
  let days = byDayRaw.map((d) => ({
    date: d?.date,
    estimated: num(d?.estimatedCost),
    actual: num(d?.actualCost),
  }));

  // By type
  const byTypeRaw = Array.isArray(costSummary?.byActivityType) ? costSummary.byActivityType : [];
  let byType = byTypeRaw.map((t) => ({
    activityType: t?.activityType,
    estimated: num(t?.estimatedCost),
    actual: num(t?.actualCost),
  }));

  const maxDayActual = days.reduce((m, d) => Math.max(m, d.actual), 0);
  const maxTypeActual = byType.reduce((m, t) => Math.max(m, t.actual), 0);

  const coverage = {
    donePct: calcPct(doneCount, activities),
    timePct: calcPct(hasTimeCount, activities),
    costPct: calcPct(hasCostCount, activities),
    participantsPct: calcPct(hasParticipantsCount, activities),
  };

  const costAccuracy = computeCostAccuracyPct(totals.estimated, totals.actual);
  const dataIntegrity = computeDataIntegrityPct(issues);
  const progress = coverage.donePct;

  const score = clampInt(
    Math.round(costAccuracy * 0.45 + dataIntegrity * 0.35 + progress * 0.2),
    0,
    100
  );

  const summary = buildHealthSummary({ score, issueCount: issues.length });

  const sortedIssues = issues
    .slice()
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  const topSpends = spendItems.slice().sort((a, b) => b.actualTotal - a.actualTotal);

  return {
    currency,
    totals,
    coverage,
    health: {
      score,
      costAccuracy: clampInt(costAccuracy, 0, 100),
      dataIntegrity: clampInt(dataIntegrity, 0, 100),
      progress: clampInt(progress, 0, 100),
      summary,
    },
    issues: sortedIssues,
    days,
    byType,
    maxDayActual,
    maxTypeActual,
    topSpends,

    // expose helpers for UI components
    fmtMoney: (v) => fmtMoney(v, currency),
    fmtSignedMoney: (v) => fmtSignedMoney(v, currency),
    labelActivityType,
    labelRole,
    typeEmoji,
  };
}

/* ===========================
   Badges
=========================== */
export function getAccuracyBadge(pct) {
  if (pct >= 90)
    return {
      label: "Chuẩn",
      tone: "good", // key để component tự render icon
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
    };

  if (pct >= 75)
    return {
      label: "Tạm ổn",
      tone: "ok",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    };

  return {
    label: "Lệch",
    tone: "bad",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
  };
}

export function getHealthBadge(score) {
  if (score >= 85)
    return {
      label: "Rất tốt",
      tone: "good",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
    };
  if (score >= 70)
    return {
      label: "Ổn",
      tone: "ok",
      className:
        "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
    };
  if (score >= 50)
    return {
      label: "Tạm",
      tone: "warn",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    };
  return {
    label: "Cần chỉnh",
    tone: "bad",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
  };
}

/* ===========================
   Labels
=========================== */

export function labelActivityType(type) {
  const t = String(type || "OTHER").toUpperCase();
  const map = {
    TRANSPORT: "Di chuyển",
    FOOD: "Ăn uống",
    STAY: "Lưu trú",
    ENTERTAIN: "Giải trí",
    SIGHTSEEING: "Tham quan",
    EVENT: "Sự kiện",
    SHOPPING: "Mua sắm",
    CINEMA: "Xem phim",
    OTHER: "Khác",
  };
  return map[t] || "Khác";
}

export function labelRole(role) {
  const r = String(role || "").toUpperCase();
  if (r === "OWNER") return "Chủ kế hoạch";
  if (r === "EDITOR") return "Chỉnh sửa";
  if (r === "VIEWER") return "Xem";
  return "Thành viên";
}

export function typeEmoji(type) {
  const t = String(type || "").toUpperCase();
  const map = {
    TRANSPORT: "🚌",
    FOOD: "🍜",
    STAY: "🏨",
    ENTERTAIN: "🎉",
    SIGHTSEEING: "🗺️",
    EVENT: "🎫",
    SHOPPING: "🛍️",
    CINEMA: "🎬",
    OTHER: "✨",
  };
  return map[t] || "📌";
}

/* ===========================
   Internals
=========================== */

function issue(code, severity, title, message) {
  return { code, severity, title, message };
}

function severityRank(s) {
  return s === "ERROR" ? 2 : 1;
}

function computeCostAccuracyPct(estimated, actual) {
  const est = num(estimated);
  const act = num(actual);
  const denom = Math.max(act, est, 1);
  const diff = Math.abs(act - est);
  const acc = 1 - diff / denom;
  return Math.round(clamp(acc, 0, 1) * 100);
}

function computeDataIntegrityPct(issues) {
  const errs = issues.filter((x) => x.severity === "ERROR").length;
  const warns = issues.filter((x) => x.severity === "WARN").length;
  return clampInt(100 - errs * 12 - warns * 4, 0, 100);
}

function buildHealthSummary({ score, issueCount }) {
  if (score >= 85) return "Rất ổn: kế hoạch khá chuẩn và dễ theo dõi.";
  if (score >= 70) return `Ổn: còn ${issueCount} cảnh báo/lỗi nhỏ nên chỉnh để “chuẩn” hơn.`;
  if (score >= 50) return "Tạm ổn: nên bổ sung thời gian/chi phí/chia tiền để dễ quản lý.";
  return "Cần chỉnh nhiều: dữ liệu đang thiếu hoặc lệch khá lớn.";
}

function calcPct(a, b) {
  const denom = Math.max(num(b), 1);
  return clampInt(Math.round((num(a) / denom) * 100), 0, 100);
}

function fmtMoney(v, currency) {
  const n = num(v);
  try {
    const opts =
      String(currency).toUpperCase() === "VND"
        ? { maximumFractionDigits: 0 }
        : { maximumFractionDigits: 2 };
    return new Intl.NumberFormat("vi-VN", opts).format(n) + ` ${currency}`;
  } catch {
    return `${n} ${currency}`;
  }
}

function fmtSignedMoney(v, currency) {
  const n = num(v);
  const sign = n > 0 ? "+" : "";
  return sign + fmtMoney(n, currency);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isFiniteNumber(v) {
  return Number.isFinite(Number(v));
}

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function clampInt(x, a, b) {
  const n = Math.round(Number(x));
  if (!Number.isFinite(n)) return a;
  return Math.max(a, Math.min(b, n));
}

function almostEqual(a, b, tol = 1) {
  return Math.abs(num(a) - num(b)) <= tol;
}

function isValidTime(t) {
  if (!t) return false;
  const s = String(t);
  return /^\d{2}:\d{2}:\d{2}$/.test(s) || s.includes("T");
}

function isEndAfterStart(start, end) {
  if (
    /^\d{2}:\d{2}:\d{2}$/.test(String(start)) &&
    /^\d{2}:\d{2}:\d{2}$/.test(String(end))
  ) {
    const [sh, sm, ss] = String(start).split(":").map((x) => parseInt(x, 10));
    const [eh, em, es] = String(end).split(":").map((x) => parseInt(x, 10));
    const a = sh * 3600 + sm * 60 + ss;
    const b = eh * 3600 + em * 60 + es;
    return b > a;
  }

  try {
    const a = new Date(start).getTime();
    const b = new Date(end).getTime();
    if (!Number.isFinite(a) || !Number.isFinite(b)) return true;
    return b > a;
  } catch {
    return true;
  }
}
