// src/features/admin/components/amenity/amenityTerms.js

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
  { value: "NAME_ASC", label: "Tên A→Z" },
  { value: "NAME_DESC", label: "Tên Z→A" },
  { value: "CODE_ASC", label: "Code A→Z" },
  { value: "CODE_DESC", label: "Code Z→A" },
];

// nhãn dễ hiểu (VN). Bạn có thể đưa qua i18n sau.
export const SCOPE_LABEL = {
  ALL: "Tất cả",
  HOTEL: "Khách sạn",
  ROOM: "Phòng",
  RESTAURANT: "Nhà hàng",
};

export const GROUP_LABEL = {
  ALL: "Tất cả",
  ROOM: "Thuộc phòng",
  HOTEL_SERVICE: "Dịch vụ khách sạn",
  PUBLIC_AREA: "Khu vực chung",
  NEARBY: "Gần kề",
  INTERNET: "Internet",
  OTHER: "Khác",
};

export const SECTION_LABEL = {
  ALL: "Tất cả",
  HIGHLIGHT_FEATURES: "Nổi bật",
  BASIC_FACILITIES: "Tiện ích cơ bản",
  ROOM_FACILITIES: "Tiện nghi phòng",
  BATHROOM: "Phòng tắm",
  FOOD_AND_DRINK: "Ăn uống",
  TRANSPORT: "Di chuyển",
  INTERNET: "Internet",
  ENTERTAINMENT: "Giải trí",
  OTHER: "Khác",
};

// helper: hiển thị label fallback
export const labelOf = (map, key) => map?.[key] || key;
