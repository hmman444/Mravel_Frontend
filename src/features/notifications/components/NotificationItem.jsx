"use client";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const typeIcon = (type) => {
  if (type === "FRIEND_REQUEST") return "👋";
  if (type === "FRIEND_ACCEPTED") return "✅";
  if (type === "PLAN_INVITE") return "🗺️";
  if (type === "COMMENT") return "💬";
  return "🔔";
};

export default function NotificationItem({ n, onRead, onClose }) {
  const icon = useMemo(() => typeIcon(n?.type), [n?.type]);
  const navigate = useNavigate();

  const go = async () => {
    await onRead?.();
    onClose?.(); 
    if (n?.deepLink) navigate(n.deepLink);
  };

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
      <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-slate-900 grid place-items-center">
        {n?.image ? (
          <img src={n.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg">{icon}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-sm line-clamp-2">
            {n?.actor?.fullname
            ? `${n.actor.fullname} ${n.message}`
            : n?.message}
          </p>
          {!n?.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
        </div>

        {n?.createdAt && (
          <p className="text-[11px] text-gray-400 mt-1">
            {new Date(n.createdAt).toLocaleString("vi-VN")}
          </p>
        )}
      </div>
    </button>
  );
}
