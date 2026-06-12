import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { marked } from "marked";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { useAIPlanSession } from "../hooks/useAIPlanSession";
import DraftPreview from "./DraftPreview";

// Render an assistant message (Markdown) to HTML so catalog links are clickable.
// Every link opens in a new tab; relative Mravel links (e.g. /hotels/<slug>)
// resolve against the SPA origin, so they open the right detail page in-app.
// Falls back to null (→ plain text) if parsing ever throws.
function renderAssistantHtml(content) {
  try {
    const html = marked.parse(content || "", { breaks: true, gfm: true });
    return html.replace(
      /<a /g,
      '<a target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primaryHover" '
    );
  } catch {
    return null;
  }
}

const STARTER_EMOJIS = ["🌊", "🏔️", "🍜", "🏖️"];
const EDIT_STARTER_EMOJIS = ["🍜", "💰", "🔄", "🛏️"];

/**
 * Thin wrapper: owns the MAI session and renders the chrome-less panel. Used by the
 * full chat page (ChatPage) where the component lifecycle is stable. The floating
 * widget instead creates the session itself (so the stream survives closing the
 * popup) and renders <AIPlanPanelView/> directly.
 */
export default function AIPlanPanel({ planId = null, onClose = null, onApplied = null, autoFocus = true }) {
  const session = useAIPlanSession(planId);
  return (
    <AIPlanPanelView session={session} onClose={onClose} onApplied={onApplied} autoFocus={autoFocus} />
  );
}

/**
 * Chrome-less MAI (Mravel AI) body. Renders a given planner `session` (from
 * useAIPlanSession). Embedded in the floating chat widget and the full chat page as a
 * pinned virtual assistant. Supports multiple saved conversations: a history overlay
 * lists past chats to resume, and a "new conversation" button starts a fresh one.
 */
export function AIPlanPanelView({ session, onClose = null, onApplied = null, autoFocus = true }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [revisionInput, setRevisionInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const editMode = session.isEditMode;

  const starterPrompts = STARTER_EMOJIS.map((emoji, i) => ({
    emoji,
    text: t(`aiPlan.starter_${i + 1}`),
  }));
  const editStarterPrompts = EDIT_STARTER_EMOJIS.map((emoji, i) => ({
    emoji,
    text: t(`aiPlan.edit_starter_${i + 1}`),
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages.length, session.activity.length]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || session.isBusy) return;
    setInput("");
    await session.sendMessage(text);
  };

  const handleSendStarter = async (text) => {
    if (session.isBusy) return;
    setInput("");
    await session.sendMessage(text);
  };

  const handleRegenerate = async (e) => {
    e?.preventDefault?.();
    if (session.isBusy) return;
    const hint = revisionInput.trim();
    setRevisionInput("");
    await session.regenerate(hint);
  };

  const handleApprove = async () => {
    const newPlanId = await session.approve();
    if (newPlanId) {
      // Keep the session (persisted) so the conversation survives the navigation
      // and the chat box can be reopened on the new plan page without resetting.
      onClose?.();
      navigate(`/plans/${newPlanId}`);
    }
  };

  const handleNewChat = () => {
    if (session.isBusy) return;
    session.reset();
    setInput("");
    setRevisionInput("");
    setShowHistory(false);
    session.refreshSessions?.();
  };

  const handleOpenHistory = () => {
    session.refreshSessions?.();
    setShowHistory(true);
  };

  const handlePickSession = (id) => {
    setShowHistory(false);
    session.switchSession?.(id);
  };

  const handleApplyEdits = async () => {
    if (session.isBusy) return;
    const result = await session.applyProposedEdits();
    // Refresh the board so changes show immediately even if the realtime WS lags.
    if (result && (result.applied ?? 0) > 0) onApplied?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-neutral dark:bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primaryHover text-white shadow-md shadow-primary/25">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2L14.5 9L22 12L14.5 15L12 22L9.5 15L2 12L9.5 9L12 2Z" />
            </svg>
            {/* coral spark */}
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="font-heading text-[15px] font-bold tracking-tight text-slate-800 dark:text-slate-100">
              MAI (Mravel AI)
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {editMode ? t("aiPlan.subtitle_edit") : t("aiPlan.subtitle_new")}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenHistory}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
            aria-label={t("aiPlan.history")}
            title={t("aiPlan.history")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={handleNewChat}
            disabled={session.isBusy}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-primary disabled:opacity-50 dark:hover:bg-slate-800"
            aria-label={t("aiPlan.new_chat_title")}
            title={t("aiPlan.new_chat_title")}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            {t("aiPlan.new_chat")}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={t("aiPlan.close")}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* History overlay — list of past conversations to resume */}
      {showHistory && (
        <HistoryOverlay
          sessions={session.sessions}
          activeId={session.sessionId}
          onPick={handlePickSession}
          onNew={handleNewChat}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-6">
          {/* Empty state */}
          {session.messages.length === 0 && (
            <div className="mb-4">
              <h2 className="font-heading text-[26px] font-bold leading-tight text-slate-800 dark:text-slate-100">
                {editMode
                  ? t("aiPlan.empty_title_edit")
                  : t("aiPlan.empty_title_new")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {editMode
                  ? t("aiPlan.empty_desc_edit")
                  : t("aiPlan.empty_desc_new")}
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {(editMode ? editStarterPrompts : starterPrompts).map((p) => (
                  <button
                    key={p.text}
                    onClick={() => handleSendStarter(p.text)}
                    disabled={session.isBusy}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-primary/30 hover:bg-secondary/20 hover:shadow-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="text-base">{p.emoji}</span>
                    <span className="flex-1">{p.text}</span>
                    <svg className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-primary dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {session.messages.map((m, i) => (
              <MessageBubble key={m.id ?? i} role={m.role} content={m.content} />
            ))}

            {session.isBusy && (
              <ThinkingBlock
                activity={session.activity}
                canCancel={session.phase === "thinking"}
                onCancel={session.cancel}
              />
            )}
          </div>

          {/* Draft preview (new-plan mode only) */}
          {!editMode && session.draft && (
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-wider text-primary">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                </svg>
                {t("aiPlan.draft_label")}
              </div>
              <DraftPreview draft={session.draft} />
            </div>
          )}

          {/* Proposed edits (edit mode) */}
          {editMode && session.pendingEdits.length > 0 && (
            <EditProposal operations={session.pendingEdits} />
          )}

          {!editMode && session.missingFields.length > 0 && !session.draft && (
            <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50/70 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
              {t("aiPlan.need_more")} <b>{session.missingFields.join(", ")}</b>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Revision / approve toolbar (new-plan mode) */}
      {!editMode && session.draft && !session.isApproved && (
        <div className="border-t border-slate-200/70 bg-white/80 px-6 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleRegenerate} className="flex items-center gap-2">
              <input
                value={revisionInput}
                onChange={(e) => setRevisionInput(e.target.value)}
                placeholder={t("aiPlan.revision_placeholder")}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                disabled={session.isBusy}
              />
              <button
                type="submit"
                disabled={session.isBusy}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {t("aiPlan.regenerate")}
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={session.isBusy}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-light disabled:opacity-50"
              >
                {t("aiPlan.approve")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Apply-edits toolbar (edit mode) */}
      {editMode && session.pendingEdits.length > 0 && (
        <div className="border-t border-slate-200/70 bg-white/80 px-6 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              <b>{session.pendingEdits.length}</b> {t("aiPlan.pending_changes")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={session.discardEdits}
                disabled={session.isBusy}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {t("aiPlan.discard")}
              </button>
              <button
                type="button"
                onClick={handleApplyEdits}
                disabled={session.isBusy}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-light disabled:opacity-50"
              >
                {t("aiPlan.apply")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-slate-200/70 bg-neutral px-6 py-4 dark:border-slate-800/70 dark:bg-slate-900">
        <div className="mx-auto max-w-2xl">
          <form
            onSubmit={handleSend}
            className="relative rounded-2xl border border-slate-300 bg-white shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("aiPlan.composer_placeholder")}
              rows={2}
              className="w-full resize-none bg-transparent px-4 py-3 pr-14 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500"
              disabled={session.isBusy || session.isApproved}
              style={{ minHeight: 56, maxHeight: 160 }}
            />
            <button
              type="submit"
              disabled={session.isBusy || !input.trim() || session.isApproved}
              className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition hover:bg-primaryHover disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
              aria-label={t("aiPlan.send")}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l14-7-7 14-2-5-5-2z" />
              </svg>
            </button>
          </form>
          <div className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            {t("aiPlan.disclaimer")}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryOverlay({ sessions, activeId, onPick, onNew, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-neutral dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="font-heading text-[15px] font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {t("aiPlan.history")}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label={t("aiPlan.close_history")}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <button
          onClick={onNew}
          className="mb-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 py-2.5 text-left text-sm font-medium text-primary transition hover:bg-secondary/20"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          {t("aiPlan.start_new_chat")}
        </button>

        {(!sessions || sessions.length === 0) ? (
          <p className="px-2 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            {t("aiPlan.no_conversations")}
          </p>
        ) : (
          <ul className="space-y-1">
            {sessions.map((s) => (
              <li key={s.session_id}>
                <button
                  onClick={() => onPick(s.session_id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                    s.session_id === activeId
                      ? "bg-secondary/30 dark:bg-slate-700/60"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {s.title || t("aiPlan.conversation")}
                      {s.plan_id != null && (
                        <span className="ml-1.5 rounded bg-primary/10 px-1 py-0.5 text-[10px] font-semibold text-primary">
                          {t("aiPlan.edit_plan_badge", { id: s.plan_id })}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatRelative(s.updated_at)}
                    </span>
                  </div>
                  {s.preview && (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{s.preview}</p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatRelative(iso) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: false, locale: vi });
  } catch {
    return "";
  }
}

const OP_META = {
  create_card: { labelKey: "aiPlan.op_create_card", color: "text-emerald-700 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/40", icon: "＋" },
  update_card: { labelKey: "aiPlan.op_update_card", color: "text-sky-700 bg-sky-100 dark:text-sky-200 dark:bg-sky-900/40", icon: "✎" },
  delete_card: { labelKey: "aiPlan.op_delete_card", color: "text-rose-700 bg-rose-100 dark:text-rose-200 dark:bg-rose-900/40", icon: "✕" },
  move_card: { labelKey: "aiPlan.op_move_card", color: "text-violet-700 bg-violet-100 dark:text-violet-200 dark:bg-violet-900/40", icon: "⇄" },
  rename_list: { labelKey: "aiPlan.op_rename_list", color: "text-amber-700 bg-amber-100 dark:text-amber-200 dark:bg-amber-900/40", icon: "✎" },
  delete_list: { labelKey: "aiPlan.op_delete_list", color: "text-rose-700 bg-rose-100 dark:text-rose-200 dark:bg-rose-900/40", icon: "✕" },
  add_day: { labelKey: "aiPlan.op_add_day", color: "text-emerald-700 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/40", icon: "＋" },
  update_plan: { labelKey: "aiPlan.op_update_plan", color: "text-indigo-700 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/40", icon: "⚙" },
};

function EditProposal({ operations }) {
  const { t } = useTranslation();
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-wider text-accent">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.58z" />
        </svg>
        {t("aiPlan.proposed_changes", { count: operations.length })}
      </div>
      <ul className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        {operations.map((op, i) => {
          const meta = OP_META[op.op];
          const label = meta ? t(meta.labelKey) : op.op;
          const color = meta ? meta.color : "text-slate-700 bg-slate-200";
          const icon = meta ? meta.icon : "•";
          return (
            <li key={op.id ?? `${op.op}-${i}`} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
              <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${color}`}>
                <span>{icon}</span>
                {label}
              </span>
              <span>{op.summary || label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MessageBubble({ role, content }) {
  if (role === "USER") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-secondary/30 px-4 py-2.5 text-[15px] leading-relaxed text-slate-800 dark:bg-slate-700/60 dark:text-slate-100">
          {content}
        </div>
      </div>
    );
  }
  const html = renderAssistantHtml(content);
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primaryHover text-white shadow-sm">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M12 2L14.5 9L22 12L14.5 15L12 22L9.5 15L2 12L9.5 9L12 2Z" />
        </svg>
      </div>
      {html != null ? (
        <div
          className="flex-1 text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 [&_a]:break-words [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_strong]:font-semibold [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">
          {content}
        </div>
      )}
    </div>
  );
}

function ThinkingBlock({ activity, canCancel, onCancel }) {
  const { t } = useTranslation();
  const lastFew = activity.slice(-5);
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primaryHover text-white shadow-sm">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 animate-pulse">
          <path d="M12 2L14.5 9L22 12L14.5 15L12 22L9.5 15L2 12L9.5 9L12 2Z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-sm italic text-slate-500 dark:text-slate-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
            </span>
            {t("aiPlan.thinking")}
          </span>
          {canCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-2 py-0.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
            >
              {t("aiPlan.cancel")}
            </button>
          )}
        </div>
        {lastFew.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {lastFew.map((a, idx) => (
              <li key={a.id ?? `${activity.length - lastFew.length + idx}-${a.kind ?? ""}`} className="font-mono">
                {a.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
