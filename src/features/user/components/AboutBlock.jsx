"use client";

import { MapPin, Calendar, Users } from "lucide-react";

export default function AboutBlock({ userView, profile, loading }) {
  if (loading && !userView) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-2/5 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  const isDefaultBio = !profile?.bio;

  return (
    <>
      <p
        className={
          isDefaultBio
            ? "text-xs text-slate-400 italic mb-3"
            : "text-sm text-slate-700 dark:text-slate-200 mb-3"
        }
      >
        {userView?.bio}
      </p>

      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-500" />
          <span>Sống tại {userView?.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Tham gia Mravel từ năm {userView?.joinedAt || "2024"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" />
          <span>Đã tạo {userView?.totalTrips ?? 0} lịch trình du lịch</span>
        </div>
      </div>
    </>
  );
}
