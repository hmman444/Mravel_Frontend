// src/features/admin/components/user/userTerms.js
import i18n from "../../../../i18n";

export const ROLE_LABEL = {
  USER: i18n.t("admin.user_role_user"),
  PARTNER: i18n.t("admin.user_role_partner"),
  ADMIN: i18n.t("admin.user_role_admin"),
};

export const STATUS_LABEL = {
  ACTIVE: i18n.t("admin.user_status_active"),
  LOCKED: i18n.t("admin.user_status_locked"),
};

export const STATUS_BADGE = (status) => {
  if (status === "LOCKED") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
};
