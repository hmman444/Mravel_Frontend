// src/features/planBoard/services/planListService.js
import api from "../../../utils/axiosInstance";

const BASE = "/plans";

export async function fetchMyPlans() {
  const res = await api.get(`${BASE}/my`);
  return res.data.data; // List<MyPlanDto>
}
