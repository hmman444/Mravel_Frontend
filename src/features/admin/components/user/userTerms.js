// src/features/admin/components/user/userTerms.js
export const ROLE_LABEL = {
  USER: "Khách hàng",
  PARTNER: "Đối tác",
  ADMIN: "Quản trị",
};

export const STATUS_LABEL = {
  ACTIVE: "Hoạt động",
  LOCKED: "Bị khóa",
};

export const STATUS_BADGE = (status) => {
  if (status === "LOCKED") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
};
