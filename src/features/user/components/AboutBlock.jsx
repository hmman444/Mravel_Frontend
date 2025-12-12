"use client";

import {
  MapPin,
  Calendar,
  Users,
  Home,
  Briefcase,
  Phone,
  Mail,
  Globe,
  User as UserIcon,
  Baby,
} from "lucide-react";

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

  const p = profile || {};
  const isDefaultBio = !p.bio;

  return (
    <div className="space-y-3">
      {/* BIO */}
      <p
        className={
          isDefaultBio
            ? "text-xs text-slate-400 italic mb-3"
            : "text-sm text-slate-700 dark:text-slate-200 mb-3"
        }
      >
        {userView?.bio || "Người dùng chưa thêm giới thiệu."}
      </p>

      {/* DETAIL INFO */}
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">

        {/* Thành phố đang sống */}
        {userView?.city && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>Sống tại {userView.city}</span>
          </div>
        )}

        {/* Quốc gia */}
        {p.country && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>Quốc gia: {p.country}</span>
          </div>
        )}

        {/* Quê quán */}
        {p.hometown && (
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-pink-500" />
            <span>Đến từ {p.hometown}</span>
          </div>
        )}

        {/* Nghề nghiệp */}
        {p.occupation && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-600" />
            <span>{p.occupation}</span>
          </div>
        )}

        {/* Giới tính */}
        {p.gender && (
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-violet-500" />
            <span>Giới tính: {p.gender}</span>
          </div>
        )}

        {/* Ngày sinh */}
        {p.dateOfBirth && (
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-rose-500" />
            <span>Sinh ngày: {p.dateOfBirth}</span>
          </div>
        )}

        {/* Phone */}
        {p.phone1 && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-600" />
            <span>Số điện thoại: {p.phone1}</span>
          </div>
        )}

        {/* Email phụ */}
        {p.secondaryEmail && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-500" />
            <span>Email phụ: {p.secondaryEmail}</span>
          </div>
        )}

        {/* Địa chỉ chi tiết */}
        {p.addressLine && (
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-teal-500" />
            <span>Địa chỉ: {p.addressLine}</span>
          </div>
        )}

        {/* Năm tham gia */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Tham gia Mravel từ năm {userView?.joinedAt || "2024"}</span>
        </div>

      </div>
    </div>
  );
}
