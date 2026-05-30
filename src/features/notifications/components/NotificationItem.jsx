"use client";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "../../../i18n";

// ── Helpers ───────────────────────────────────────────────────────────────────

const reactEmoji = (k) => {
  const key = (k || "").toLowerCase();
  if (key === "like")  return "👍";
  if (key === "love")  return "❤️";
  if (key === "haha")  return "😆";
  if (key === "wow")   return "😮";
  if (key === "sad")   return "😢";
  if (key === "angry") return "😡";
  return "❤️";
};

const safeJson = (s) => {
  if (!s) return null;
  try { return typeof s === "string" ? JSON.parse(s) : s; }
  catch { return null; }
};

/**
 * Returns an emoji icon for a notification type.
 * System notifications (no actor) use a distinct icon so they look different
 * from social notifications that already have an avatar in n.image.
 */
const typeIcon = (type, dataJson) => {
  switch (type) {
    // Social
    case "FRIEND_REQUEST":  return "👋";
    case "FRIEND_ACCEPTED": return "🤝";
    case "PLAN_INVITE":     return "🗺️";
    case "COMMENT":         return "💬";
    case "REPLY_COMMENT":   return "↩️";
    case "REACT": {
      const data = safeJson(dataJson);
      return reactEmoji(data?.reactionKey);
    }
    // Booking (customer)
    case "BOOKING_CONFIRMED":            return "🎉";
    case "BOOKING_CANCELLED":            return "❌";
    case "BOOKING_CANCELLED_BY_PARTNER": return "❌";
    case "BOOKING_EXPIRED":              return "⏰";
    case "PAYMENT_SUCCESS":              return "💳";
    case "REFUND_PROCESSED":             return "💰";
    // Booking (partner)
    case "BOOKING_NEW_FOR_PARTNER":       return "📋";
    case "BOOKING_CANCELLED_FOR_PARTNER": return "❌";
    // Account / Security
    case "ACCOUNT_LOCKED":   return "🔒";
    case "ACCOUNT_UNLOCKED": return "🔓";
    case "PASSWORD_CHANGED": return "🔑";
    case "LOGIN_ALERT":      return "⚠️";
    // Partner lifecycle
    case "PARTNER_APPROVED": return "✅";
    case "PARTNER_REJECTED": return "🚫";
    default: return "🔔";
  }
};

/** Display message for REACT (override generic message). */
const reactVerb = (k) => {
  const key = (k || "").toLowerCase();
  if (key === "like")  return i18n.t("notification.react.like");
  if (key === "love")  return i18n.t("notification.react.love");
  if (key === "haha")  return i18n.t("notification.react.haha");
  if (key === "wow")   return i18n.t("notification.react.wow");
  if (key === "sad")   return i18n.t("notification.react.sad");
  if (key === "angry") return i18n.t("notification.react.angry");
  return i18n.t("notification.react.default");
};

/**
 * Whether this type is a system notification (no human actor).
 * For these we show the message alone rather than "actorName message".
 */
const isSystemType = (type) => {
  const SYSTEM_TYPES = new Set([
    "BOOKING_CONFIRMED", "BOOKING_CANCELLED", "BOOKING_CANCELLED_BY_PARTNER",
    "BOOKING_EXPIRED", "PAYMENT_SUCCESS", "REFUND_PROCESSED",
    "BOOKING_NEW_FOR_PARTNER", "BOOKING_CANCELLED_FOR_PARTNER",
    "ACCOUNT_LOCKED", "ACCOUNT_UNLOCKED", "PASSWORD_CHANGED", "LOGIN_ALERT",
    "PARTNER_APPROVED", "PARTNER_REJECTED",
  ]);
  return SYSTEM_TYPES.has(type);
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationItem({ n, onRead, onClose }) {
  const icon = useMemo(() => typeIcon(n?.type, n?.dataJson), [n?.type, n?.dataJson]);
  const navigate = useNavigate();
  const data = useMemo(() => safeJson(n?.dataJson), [n?.dataJson]);

  const go = async () => {
    await onRead?.();
    onClose?.();
    if (n?.deepLink) navigate(n.deepLink);
  };

  const displayMessage = useMemo(() => {
    if (n?.type === "REACT") return reactVerb(data?.reactionKey);
    return n?.message;
  }, [n?.type, n?.message, data?.reactionKey]);

  // For system notifications we show the message alone; for social ones we
  // prefix with the actor's name.
  const fullMessage = useMemo(() => {
    if (!n?.actor?.fullname || isSystemType(n?.type)) return displayMessage;
    return `${n.actor.fullname} ${displayMessage}`;
  }, [n?.actor?.fullname, n?.type, displayMessage]);

  return (
    <button
      type="button"
      onClick={go}
      className={`
        w-full text-left px-4 py-3 flex gap-3
        hover:bg-sky-50 dark:hover:bg-slate-800/60 transition
        ${n?.read ? "opacity-80" : "bg-sky-50/60 dark:bg-slate-800/30"}
      `}
    >
      {/* Avatar or system icon */}
      <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-slate-900 grid place-items-center shrink-0">
        {n?.image ? (
          <img src={n.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg">{icon}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-sm line-clamp-2">{fullMessage}</p>
          {!n?.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
        </div>

        {n?.title && isSystemType(n?.type) && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {n.title}
          </p>
        )}

        {n?.createdAt && (
          <p className="text-[11px] text-gray-400 mt-1">
            {new Date(n.createdAt).toLocaleString("vi-VN")}
          </p>
        )}
      </div>
    </button>
  );
}
