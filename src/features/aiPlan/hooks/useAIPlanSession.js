import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyEdits as applyEditsApi,
  approveSession,
  createSession,
  getSession,
  listSessions,
  regenerateDraft,
  sendMessage as sendMessageApi,
  streamMessage,
  streamRegenerate,
} from "../services/aiPlanApi";
import {
  showError,
  showInfo,
  showSuccess,
  showWarning,
} from "../../../utils/toastUtils";

const PHASES = {
  IDLE: "idle",
  STARTING: "starting",
  CHATTING: "chatting",
  THINKING: "thinking",
  APPROVING: "approving",
  APPROVED: "approved",
  ERROR: "error",
};

// Persist the active session id so the conversation survives drawer toggles and
// route changes. Scoped by planId so each plan page keeps its own edit chat and the
// generic "new plan" chat keeps its own. We store only the id and rehydrate from
// the backend on mount.
const SESSION_STORAGE_PREFIX = "mravel_ai_plan_session_id";

const storageKey = (planId) =>
  planId != null ? `${SESSION_STORAGE_PREFIX}:${planId}` : SESSION_STORAGE_PREFIX;

const loadStoredSessionId = (planId) => {
  try {
    return window.localStorage.getItem(storageKey(planId)) || null;
  } catch {
    return null;
  }
};

const persistSessionId = (planId, id) => {
  try {
    if (id) window.localStorage.setItem(storageKey(planId), id);
    else window.localStorage.removeItem(storageKey(planId));
  } catch {
    // storage unavailable (private mode / quota) — non-fatal, session just won't persist
  }
};

// Stable unique id for chat messages. Used as the React key so optimistic
// messages keep their identity when the streamed/real message arrives, instead
// of React reusing DOM nodes by array index (which misaligns bubbles).
let __msgSeq = 0;
const newMessageId = () => `m_${Date.now()}_${++__msgSeq}`;

// Ensure a message object has a stable id (backend messages may not carry one).
const withId = (msg) =>
  msg && msg.id == null ? { ...msg, id: newMessageId() } : msg;

const TOOL_LABELS = {
  set_constraints: "Ghi nhận thông tin",
  search_hotels: "Tìm khách sạn",
  search_restaurants: "Tìm nhà hàng",
  search_places: "Tìm địa điểm",
  route_legs: "Tính lộ trình & quãng đường",
  web_search: "Tìm trên web",
  view_my_plans: "Xem các plan đã có",
  finalize_draft: "Tổng hợp bản nháp",
};

// Map English-ish backend warnings to Vietnamese sentences for toast display.
const humanizeWarning = (raw) => {
  if (!raw) return "";
  const s = String(raw);
  if (s.includes("No hotels found")) return "Không tìm thấy khách sạn trong catalog cho điểm đến này.";
  if (s.includes("No places found")) return "Không tìm thấy địa điểm tham quan trong catalog.";
  if (s.includes("No restaurants found")) return "Không tìm thấy nhà hàng trong catalog.";
  if (s.includes("exceeds budget")) {
    const m = s.match(/Estimated cost\s+([\d,]+)\s+VND exceeds budget\s+([\d,]+)/i);
    if (m) {
      return `Chi phí ước tính ${m[1]} VND vượt ngân sách ${m[2]} VND.`;
    }
    return "Chi phí ước tính vượt ngân sách bạn đặt ra.";
  }
  return s;
};

// Convert any error-ish into a human Vietnamese message + toast.
const messageFromError = (err, fallback = "Đã xảy ra lỗi không xác định") => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  const apiMsg = err?.response?.data?.message;
  if (apiMsg) return apiMsg;
  if (err?.message?.startsWith("Stream HTTP 401")) return "Phiên đăng nhập đã hết hạn — đăng nhập lại nhé.";
  if (err?.message?.startsWith("Stream HTTP 403")) return "Bạn không có quyền thực hiện thao tác này.";
  if (err?.message?.startsWith("Stream HTTP 404")) return "Không tìm thấy phiên trò chuyện.";
  if (err?.message?.startsWith("Stream HTTP 5")) return "Server đang gặp sự cố — thử lại sau ít phút nhé.";
  if (err?.message === "Failed to fetch") return "Mất kết nối tới server. Kiểm tra mạng rồi thử lại.";
  return err?.message || fallback;
};

const labelForTool = (name, args) => {
  const base = TOOL_LABELS[name] || name;
  if (name === "search_hotels") {
    const tags = [];
    if (args?.location) tags.push(args.location);
    if (args?.max_price_vnd) tags.push(`<= ${Math.round(args.max_price_vnd / 1000)}k/đêm`);
    if (args?.min_star_rating) tags.push(`${args.min_star_rating}*`);
    return tags.length ? `${base} (${tags.join(", ")})` : base;
  }
  if (name === "search_restaurants") {
    const tags = [];
    if (args?.location) tags.push(args.location);
    if (args?.cuisine) tags.push(args.cuisine);
    if (args?.max_price_per_person_vnd)
      tags.push(`<= ${Math.round(args.max_price_per_person_vnd / 1000)}k/người`);
    return tags.length ? `${base} (${tags.join(", ")})` : base;
  }
  if (name === "search_places") {
    return args?.query ? `${base} (${args.query})` : base;
  }
  if (name === "web_search") {
    return args?.query ? `${base}: "${args.query}"` : base;
  }
  if (name === "route_legs") {
    const n = Array.isArray(args?.stops) ? args.stops.length : 0;
    return n ? `${base} (${n} điểm)` : base;
  }
  return base;
};

export function useAIPlanSession(planId = null) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [constraints, setConstraints] = useState(null);
  const [draft, setDraft] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [approvedPlanId, setApprovedPlanId] = useState(null);
  const [pendingEdits, setPendingEdits] = useState([]);
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState([]);
  // A plan the chat got bound to mid-conversation (user referenced /plans/<id>).
  // The global MAI chat starts with planId=null; once it points at a plan, the
  // backend binds the session and streams plan_id back, flipping us into edit mode.
  const [boundPlanId, setBoundPlanId] = useState(null);
  // The user's past AI conversations (for the history list). Loaded on demand.
  const [sessions, setSessions] = useState([]);
  const startingRef = useRef(false);
  const abortRef = useRef(null);
  const prevDraftRef = useRef(null);
  const hydratedRef = useRef(null);
  const isEditMode = planId != null || boundPlanId != null;

  // Rehydrate a previously-active session on mount (per planId) so toggling the chat
  // box or navigating keeps the conversation instead of resetting.
  useEffect(() => {
    // Re-run when planId changes (e.g. navigating between plan pages).
    if (hydratedRef.current === planId) return;
    hydratedRef.current = planId;
    const stored = loadStoredSessionId(planId);
    if (!stored) {
      // No stored session for this plan — clear any in-memory state from another plan.
      setSessionId(null);
      setMessages([]);
      setPendingEdits([]);
      setDraft(null);
      setBoundPlanId(null);
      setPhase(PHASES.IDLE);
      return;
    }
    startingRef.current = true;
    (async () => {
      try {
        const data = await getSession(stored);
        setSessionId(data.session_id);
        setMessages((data.messages || []).map(withId));
        setConstraints(data.constraints || null);
        setPendingEdits(data.pending_edits || []);
        if (data.plan_id != null) setBoundPlanId(data.plan_id);
        if (data.draft) {
          setDraft(data.draft);
          prevDraftRef.current = data.draft;
        }
        if (data.approved_plan_id) setApprovedPlanId(data.approved_plan_id);
        setPhase(data.status === "APPROVED" ? PHASES.APPROVED : PHASES.CHATTING);
      } catch {
        // Session expired / not found — drop the stale id and start clean.
        persistSessionId(planId, null);
      } finally {
        startingRef.current = false;
      }
    })();
  }, [planId]);

  // Keep storage in sync with the active session id.
  useEffect(() => {
    persistSessionId(planId, sessionId);
  }, [planId, sessionId]);

  // Toast a quick success summary + any warnings whenever a NEW draft arrives.
  const announceDraft = (draft, prior) => {
    if (!draft) return;
    if (prior?.draft_id === draft.draft_id) return;
    showSuccess(
      `Đã tạo bản nháp ${draft.days?.length || 0} ngày — chi phí ước tính ${
        Number(draft.estimated_total_cost_vnd || 0).toLocaleString("vi-VN")
      }đ`
    );
    const warnings = Array.isArray(draft.warnings) ? draft.warnings : [];
    warnings.forEach((w) => showWarning(humanizeWarning(w)));
  };

  const reset = useCallback(() => {
    persistSessionId(planId, null);
    setSessionId(null);
    setMessages([]);
    setConstraints(null);
    setDraft(null);
    setMissingFields([]);
    setApprovedPlanId(null);
    setPendingEdits([]);
    setBoundPlanId(null);
    setPhase(PHASES.IDLE);
    setError(null);
    setActivity([]);
    startingRef.current = false;
    abortRef.current?.abort?.();
    abortRef.current = null;
  }, [planId]);

  const cancel = useCallback(() => {
    if (!abortRef.current) return;
    abortRef.current.abort?.();
    abortRef.current = null;
    setActivity([]);
    setPhase(PHASES.CHATTING);
    showInfo("Đã hủy AI đang xử lý.");
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionId || startingRef.current) return sessionId;
    startingRef.current = true;
    setPhase(PHASES.STARTING);
    setError(null);
    try {
      // In edit mode, bind the session to the plan being viewed (numeric id).
      const data = await createSession(null, planId != null ? Number(planId) : null);
      setSessionId(data.session_id);
      setMessages((data.messages || []).map(withId));
      setConstraints(data.constraints || null);
      setPhase(PHASES.CHATTING);
      return data.session_id;
    } catch (err) {
      const msg = messageFromError(err, "Không tạo được phiên trò chuyện AI.");
      setPhase(PHASES.ERROR);
      setError(msg);
      showError(msg);
      return null;
    } finally {
      startingRef.current = false;
    }
  }, [sessionId, planId]);

  const runStream = useCallback(
    async ({ streamFn, optimisticUserMsg, fallbackFn, fallbackArg }) => {
      setPhase(PHASES.THINKING);
      setError(null);
      setActivity([]);

      if (optimisticUserMsg) {
        setMessages((prev) => [...prev, optimisticUserMsg]);
      }

      const controller = new AbortController();
      abortRef.current = controller;

      let finalDraft = null;
      let assistantText = "";
      let nextConstraints = null;
      let streamFailed = null;
      let assistantMessageObj = null;

      try {
        await streamFn(
          ({ event, data }) => {
            if (event === "session") {
              if (data?.constraints) nextConstraints = data.constraints;
              // Backend bound this chat to a plan → flip into edit mode dynamically.
              if (data?.plan_id != null) setBoundPlanId(data.plan_id);
            } else if (event === "thinking") {
              setActivity((prev) => [
                ...prev,
                { kind: "thinking", text: `Đang suy nghĩ (lượt ${data?.iteration ?? 1})…` },
              ]);
            } else if (event === "tool_call") {
              setActivity((prev) => [
                ...prev,
                { kind: "tool", text: `→ ${labelForTool(data?.name, data?.arguments)}` },
              ]);
            } else if (event === "tool_result") {
              setActivity((prev) => [
                ...prev,
                { kind: "result", text: `   ✓ ${data?.summary || "ok"}` },
              ]);
            } else if (event === "draft_ready") {
              if (data?.draft) {
                finalDraft = data.draft;
                setDraft(data.draft);
              }
            } else if (event === "edit_proposal") {
              if (Array.isArray(data?.operations)) setPendingEdits(data.operations);
            } else if (event === "assistant_message") {
              if (data?.text) assistantText = data.text;
            } else if (event === "error") {
              streamFailed = data?.message || "stream error";
            } else if (event === "done") {
              if (data?.assistant_message) assistantMessageObj = data.assistant_message;
              if (data?.draft) {
                finalDraft = data.draft;
                setDraft(data.draft);
              }
              if (Array.isArray(data?.operations)) setPendingEdits(data.operations);
              if (data?.constraints) nextConstraints = data.constraints;
              if (data?.plan_id != null) setBoundPlanId(data.plan_id);
            }
          },
          { signal: controller.signal }
        );
      } catch (err) {
        if (err?.name === "AbortError") {
          setActivity([]);
          setPhase(PHASES.CHATTING);
          return;
        }
        if (fallbackFn) {
          try {
            const data = await fallbackFn(fallbackArg);
            setMessages((prev) => [...prev, withId(data.assistant_message)]);
            setConstraints(data.constraints || null);
            if (data.draft) {
              setDraft(data.draft);
              announceDraft(data.draft, prevDraftRef.current);
              prevDraftRef.current = data.draft;
            }
            setMissingFields(data.missing_fields || []);
            setActivity([]);
            setPhase(PHASES.CHATTING);
            return;
          } catch (fallbackErr) {
            const msg = messageFromError(fallbackErr, "AI không phản hồi được — thử lại nhé.");
            setPhase(PHASES.ERROR);
            setError(msg);
            showError(msg);
            return;
          }
        }
        const msg = messageFromError(err, "Stream bị lỗi.");
        setPhase(PHASES.ERROR);
        setError(msg);
        showError(msg);
        return;
      } finally {
        abortRef.current = null;
      }

      if (assistantMessageObj) {
        setMessages((prev) => [...prev, withId(assistantMessageObj)]);
      } else if (assistantText) {
        setMessages((prev) => [
          ...prev,
          { id: newMessageId(), role: "ASSISTANT", content: assistantText, created_at: new Date().toISOString() },
        ]);
      }
      if (nextConstraints) setConstraints(nextConstraints);
      setActivity([]);

      if (streamFailed && !finalDraft && !assistantText && !assistantMessageObj) {
        setPhase(PHASES.ERROR);
        setError(streamFailed);
        showError(streamFailed);
        return;
      }

      // Surface warnings + new-draft success.
      if (finalDraft) {
        announceDraft(finalDraft, prevDraftRef.current);
        prevDraftRef.current = finalDraft;
      }

      setPhase(PHASES.CHATTING);
    },
    []
  );

  // Load the user's AI chat history (for the conversation list). Declared before
  // sendMessage because sendMessage depends on it (avoids a TDZ ReferenceError).
  const refreshSessions = useCallback(async () => {
    try {
      setSessions(await listSessions());
    } catch {
      // Non-fatal: an empty/failed history list just hides past chats.
    }
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const id = await ensureSession();
      if (!id) return;
      await runStream({
        streamFn: (onEv, opts) => streamMessage(id, text, onEv, opts),
        optimisticUserMsg: {
          id: newMessageId(),
          role: "USER",
          content: text,
          created_at: new Date().toISOString(),
        },
        // Edit mode is streaming-only; the non-stream endpoint rejects plan_id
        // sessions, so don't fall back to it — surface the stream error instead.
        fallbackFn: isEditMode ? null : () => sendMessageApi(id, text),
      });
      // Keep the history list (titles/preview/order) current after each turn.
      refreshSessions();
    },
    [ensureSession, runStream, isEditMode, refreshSessions]
  );

  const regenerate = useCallback(
    async (instructions) => {
      if (!sessionId) return;
      const label = instructions ? `[regenerate] ${instructions}` : "[regenerate]";
      await runStream({
        streamFn: (onEv, opts) => streamRegenerate(sessionId, instructions, onEv, opts),
        optimisticUserMsg: {
          id: newMessageId(),
          role: "USER",
          content: label,
          created_at: new Date().toISOString(),
        },
        fallbackFn: () => regenerateDraft(sessionId, instructions),
      });
    },
    [runStream, sessionId]
  );

  const approve = useCallback(async () => {
    if (!sessionId) {
      showError("Chưa có phiên trò chuyện AI để duyệt.");
      return null;
    }
    if (!draft) {
      showError("Chưa có bản nháp để duyệt. Chat với AI để dựng plan trước nhé.");
      return null;
    }
    setPhase(PHASES.APPROVING);
    setError(null);
    try {
      const data = await approveSession(sessionId);
      setApprovedPlanId(data.plan_id);
      setPhase(PHASES.APPROVED);
      showSuccess(`Đã tạo plan #${data.plan_id} từ bản nháp.`);
      return data.plan_id;
    } catch (err) {
      const msg = messageFromError(err, "Không tạo được plan từ bản nháp.");
      setPhase(PHASES.ERROR);
      setError(msg);
      showError(msg);
      return null;
    }
  }, [draft, sessionId]);

  // Edit mode: apply the agent's proposed operations to the live plan. The board
  // (subscribed to realtime patches) updates itself once plan-service mutates.
  const applyProposedEdits = useCallback(async () => {
    if (!sessionId || pendingEdits.length === 0) {
      showError("Chưa có thay đổi nào để áp dụng.");
      return null;
    }
    setPhase(PHASES.APPROVING);
    setError(null);
    try {
      const data = await applyEditsApi(sessionId);
      setPendingEdits([]);
      setPhase(PHASES.CHATTING);
      if (data?.assistant_message) {
        setMessages((prev) => [...prev, withId(data.assistant_message)]);
      }
      const failed = data?.total ? data.total - data.applied : 0;
      if (failed > 0) {
        showWarning(`Đã áp dụng ${data.applied}/${data.total} thay đổi — ${failed} lỗi.`);
      } else {
        showSuccess(`Đã áp dụng ${data?.applied ?? 0} thay đổi vào kế hoạch.`);
      }
      return data;
    } catch (err) {
      const msg = messageFromError(err, "Không áp dụng được thay đổi.");
      setPhase(PHASES.ERROR);
      setError(msg);
      showError(msg);
      return null;
    }
  }, [sessionId, pendingEdits]);

  const discardEdits = useCallback(() => setPendingEdits([]), []);

  // Open a past conversation, replacing the active one. The backend session is the
  // source of truth; we rehydrate its messages/draft/edits and persist it as active.
  const switchSession = useCallback(
    async (id) => {
      if (!id || id === sessionId) return;
      abortRef.current?.abort?.();
      abortRef.current = null;
      setPhase(PHASES.STARTING);
      setError(null);
      setActivity([]);
      try {
        const data = await getSession(id);
        setSessionId(data.session_id);
        setMessages((data.messages || []).map(withId));
        setConstraints(data.constraints || null);
        setPendingEdits(data.pending_edits || []);
        setBoundPlanId(data.plan_id != null ? data.plan_id : null);
        setDraft(data.draft || null);
        prevDraftRef.current = data.draft || null;
        setApprovedPlanId(data.approved_plan_id || null);
        setMissingFields([]);
        persistSessionId(planId, data.session_id);
        setPhase(data.status === "APPROVED" ? PHASES.APPROVED : PHASES.CHATTING);
      } catch (err) {
        const msg = messageFromError(err, "Không mở được hội thoại này.");
        setPhase(PHASES.ERROR);
        setError(msg);
        showError(msg);
      }
    },
    [planId, sessionId]
  );

  return {
    sessionId,
    messages,
    constraints,
    draft,
    missingFields,
    approvedPlanId,
    pendingEdits,
    isEditMode,
    phase,
    error,
    activity,
    sessions,
    isBusy: phase === PHASES.STARTING || phase === PHASES.THINKING || phase === PHASES.APPROVING,
    isApproved: phase === PHASES.APPROVED,
    sendMessage,
    regenerate,
    approve,
    applyProposedEdits,
    discardEdits,
    cancel,
    reset,
    refreshSessions,
    switchSession,
  };
}

export { PHASES };
