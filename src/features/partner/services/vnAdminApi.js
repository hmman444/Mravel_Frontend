// src/features/partner/services/vnAdminApi.js
import axios from "axios";

// gợi ý: để env đổi v1/v2 tuỳ bạn
// v1: ổn định (pre 07/2025)
// v2: post 07/2025 (chưa chính thức theo homepage)
const BASE = import.meta.env.VITE_VN_ADMIN_API_BASE || "https://provinces.open-api.vn/api/v1";

export async function fetchProvinces() {
  // nhẹ nhất: lấy danh sách tỉnh
  const res = await axios.get(`${BASE}/p/`);
  return res.data || [];
}

export async function fetchDistricts(provinceCode) {
  if (!provinceCode) return [];
  // tránh depth=3; chỉ lấy districts
  const res = await axios.get(`${BASE}/p/${provinceCode}`, { params: { depth: 2 } });
  return res.data?.districts || [];
}

export async function fetchWards(districtCode) {
  if (!districtCode) return [];
  const res = await axios.get(`${BASE}/d/${districtCode}`, { params: { depth: 2 } });
  return res.data?.wards || [];
}