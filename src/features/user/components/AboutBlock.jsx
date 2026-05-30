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
import { useTranslation } from "react-i18next";

export default function AboutBlock({ userView, profile, loading }) {
  const { t } = useTranslation();
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

  const genderLabelMap = {
    MALE: t("user.gender_male"),
    FEMALE: t("user.gender_female"),
    OTHER: t("user.gender_other"),
    UNKNOWN: t("user.gender_other"),
  };

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
        {userView?.bio || t("user.no_bio_yet")}
      </p>

      {/* DETAIL INFO */}
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">

        {/* Thành phố đang sống */}
        {userView?.city && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>{t("user.living_in", { city: userView.city })}</span>
          </div>
        )}

        {/* Quốc gia */}
        {p.country && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>{t("user.country_label", { country: p.country })}</span>
          </div>
        )}

        {/* Quê quán */}
        {p.hometown && (
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-pink-500" />
            <span>{t("user.from_hometown", { hometown: p.hometown })}</span>
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
            <span>
              {t("user.gender_label", { gender: genderLabelMap[p.gender] || p.gender })}
            </span>
          </div>
        )}

        {/* Ngày sinh */}
        {p.dateOfBirth && (
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-rose-500" />
            <span>{t("user.date_of_birth_label", { date: p.dateOfBirth })}</span>
          </div>
        )}

        {/* Phone */}
        {p.phone1 && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-600" />
            <span>{t("user.phone_label", { phone: p.phone1 })}</span>
          </div>
        )}

        {/* Email phụ */}
        {p.secondaryEmail && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-500" />
            <span>{t("user.secondary_email_label", { email: p.secondaryEmail })}</span>
          </div>
        )}

        {/* Địa chỉ chi tiết */}
        {p.addressLine && (
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-teal-500" />
            <span>{t("user.address_label", { address: p.addressLine })}</span>
          </div>
        )}

        {/* Năm tham gia */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>{t("user.joined_mravel_since", { year: userView?.joinedAt || "2024" })}</span>
        </div>

      </div>
    </div>
  );
}
