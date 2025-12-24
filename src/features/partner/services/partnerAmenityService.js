import api from "../../../utils/partnerAxiosInstance";

const unwrap = (res) => {
  const body = res?.data;
  if (body?.success === false) throw new Error(body?.message || "Có lỗi xảy ra");
  return body?.data; // ApiResponse của bạn bọc ở data
};

export async function fetchGroupedAmenitiesForPartner(scope) {
  const res = await api.get(`/catalog/amenities`, {
    params: { grouped: true, scope },
  });
  return unwrap(res);
}