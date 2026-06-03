"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "../../../i18n";
import {
  UserPlus, UserCheck, Users, Map as MapIcon,
  MessageCircle, CornerUpLeft, Heart,
  CalendarCheck, XCircle, Clock, CreditCard, Wallet, ClipboardList,
  Lock, Unlock, KeyRound, AlertTriangle,
  BadgeCheck, Ban, Star, Store, ShieldAlert, Bell,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const safeJson = (s) => {
  if (!s) return null;
  try { return typeof s === "string" ? JSON.parse(s) : s; }
  catch { return null; }
};

/** Colored badge styles per visual tone. */
const TONES = {
  sky:    "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
  green:  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
  red:    "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
  amber:  "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
  slate:  "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
};

/** type → [lucide icon, tone]. Falls back to a bell. */
const VISUALS = {
  FRIEND_REQUEST: [UserPlus, "sky"],
  FRIEND_ACCEPTED: [UserCheck, "sky"],
  PLAN_INVITE: [MapIcon, "violet"],
  PLAN_MEMBER_JOINED: [Users, "violet"],
  COMMENT: [MessageCircle, "sky"],
  REPLY_COMMENT: [CornerUpLeft, "sky"],
  REACT: [Heart, "red"],
  COMMENT_REACT: [Heart, "red"],
  BOOKING_CONFIRMED: [CalendarCheck, "green"],
  BOOKING_CANCELLED: [XCircle, "red"],
  BOOKING_CANCELLED_BY_PARTNER: [XCircle, "red"],
  BOOKING_EXPIRED: [Clock, "amber"],
  PAYMENT_SUCCESS: [CreditCard, "green"],
  REFUND_PROCESSED: [Wallet, "green"],
  BOOKING_NEW_FOR_PARTNER: [ClipboardList, "green"],
  BOOKING_CANCELLED_FOR_PARTNER: [XCircle, "red"],
  ACCOUNT_LOCKED: [Lock, "red"],
  ACCOUNT_UNLOCKED: [Unlock, "green"],
  PASSWORD_CHANGED: [KeyRound, "amber"],
  LOGIN_ALERT: [AlertTriangle, "amber"],
  PARTNER_APPROVED: [BadgeCheck, "green"],
  PARTNER_REJECTED: [Ban, "red"],
  REVIEW_NEW_FOR_PARTNER: [Star, "amber"],
  ADMIN_NEW_PARTNER: [Store, "indigo"],
  ADMIN_NEW_REVIEW: [ShieldAlert, "amber"],
};

const visualOf = (type) => VISUALS[type] || [Bell, "slate"];

/** Display verb for REACT (override generic message). */
const reactVerb = (k) => {
  const key = (k || "").toLowerCase();
  if (["like", "love", "haha", "wow", "sad", "angry"].includes(key))
    return i18n.t(`notification.react.${key}`);
  return i18n.t("notification.react.default");
};

/** System notifications (no human actor name prefix); shown as title + message. */
const SYSTEM_TYPES = new Set([
  "BOOKING_CONFIRMED", "BOOKING_CANCELLED", "BOOKING_CANCELLED_BY_PARTNER",
  "BOOKING_EXPIRED", "PAYMENT_SUCCESS", "REFUND_PROCESSED",
  "BOOKING_NEW_FOR_PARTNER", "BOOKING_CANCELLED_FOR_PARTNER",
  "ACCOUNT_LOCKED", "ACCOUNT_UNLOCKED", "PASSWORD_CHANGED", "LOGIN_ALERT",
  "PARTNER_APPROVED", "PARTNER_REJECTED",
  "REVIEW_NEW_FOR_PARTNER", "ADMIN_NEW_PARTNER", "ADMIN_NEW_REVIEW",
]);
const isSystemType = (type) => SYSTEM_TYPES.has(type);

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationItem({ n, onRead, onClose }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const data = useMemo(() => safeJson(n?.dataJson), [n?.dataJson]);
  const [Icon, tone] = useMemo(() => visualOf(n?.type), [n?.type]);

  const go = async () => {
    await onRead?.();
    onClose?.();
    // Always navigate somewhere relevant; fall back to the full inbox.
    navigate(n?.deepLink || "/notifications");
  };

  // Headline + optional sub-line.
  const { headline, sub } = useMemo(() => {
    if (isSystemType(n?.type)) {
      const h = n?.title || n?.message || "";
      return { headline: h, sub: n?.message && n.message !== h ? n.message : null };
    }
    const verb = n?.type === "REACT" ? reactVerb(data?.reactionKey) : n?.message || "";
    const name = n?.actor?.fullname;
    return { headline: name ? `${name} ${verb}`.trim() : verb, sub: null };
  }, [n?.type, n?.title, n?.message, n?.actor?.fullname, data?.reactionKey]);

  const showImage = n?.image && !imgError;

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
      {/* Avatar / thumbnail with a colored type-icon overlay */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-slate-900 grid place-items-center">
          {showImage ? (
            <img
              src={n.image}
              alt=""
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`w-full h-full grid place-items-center ${TONES[tone]}`}>
              <Icon className="w-5 h-5" />
            </span>
          )}
        </div>
        {showImage && (
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full grid place-items-center
                        ring-2 ring-white dark:ring-gray-900 ${TONES[tone]}`}
          >
            <Icon className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-sm line-clamp-2">{headline}</p>
          {!n?.read && <span className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0" />}
        </div>

        {sub && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {sub}
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
