// src/features/admin/components/amenity/amenityTerms.js
import i18n from "../../../../i18n";

export const SCOPE_OPTIONS = ["ALL", "HOTEL", "ROOM", "RESTAURANT"];
export const GROUP_OPTIONS = ["ALL", "ROOM", "HOTEL_SERVICE", "PUBLIC_AREA", "NEARBY", "INTERNET", "OTHER"];
export const SECTION_OPTIONS = [
  "ALL",
  "HIGHLIGHT_FEATURES",
  "BASIC_FACILITIES",
  "ROOM_FACILITIES",
  "BATHROOM",
  "FOOD_AND_DRINK",
  "TRANSPORT",
  "INTERNET",
  "ENTERTAINMENT",
  "OTHER",
];

export const SORT_OPTIONS = [
  { value: "NAME_ASC", label: i18n.t("admin.amenity_sort_name_asc") },
  { value: "NAME_DESC", label: i18n.t("admin.amenity_sort_name_desc") },
  { value: "CODE_ASC", label: i18n.t("admin.amenity_sort_code_asc") },
  { value: "CODE_DESC", label: i18n.t("admin.amenity_sort_code_desc") },
];

// nhãn dễ hiểu (VN). Bạn có thể đưa qua i18n sau.
export const SCOPE_LABEL = {
  ALL: i18n.t("common.all"),
  HOTEL: i18n.t("admin.amenity_scope_hotel"),
  ROOM: i18n.t("admin.amenity_scope_room"),
  RESTAURANT: i18n.t("admin.amenity_scope_restaurant"),
};

export const GROUP_LABEL = {
  ALL: i18n.t("common.all"),
  ROOM: i18n.t("admin.amenity_group_room"),
  HOTEL_SERVICE: i18n.t("admin.amenity_group_hotel_service"),
  PUBLIC_AREA: i18n.t("admin.amenity_group_public_area"),
  NEARBY: i18n.t("admin.amenity_group_nearby"),
  INTERNET: i18n.t("admin.amenity_group_internet"),
  OTHER: i18n.t("admin.amenity_group_other"),
};

export const SECTION_LABEL = {
  ALL: i18n.t("common.all"),
  HIGHLIGHT_FEATURES: i18n.t("admin.amenity_section_highlight_features"),
  BASIC_FACILITIES: i18n.t("admin.amenity_section_basic_facilities"),
  ROOM_FACILITIES: i18n.t("admin.amenity_section_room_facilities"),
  BATHROOM: i18n.t("admin.amenity_section_bathroom"),
  FOOD_AND_DRINK: i18n.t("admin.amenity_section_food_and_drink"),
  TRANSPORT: i18n.t("admin.amenity_section_transport"),
  INTERNET: i18n.t("admin.amenity_section_internet"),
  ENTERTAINMENT: i18n.t("admin.amenity_section_entertainment"),
  OTHER: i18n.t("admin.amenity_section_other"),
};

// helper: hiển thị label fallback
export const labelOf = (map, key) => map?.[key] || key;
