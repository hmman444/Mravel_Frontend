import api from "../../../utils/partnerAxiosInstance";
import i18n from "../../../i18n";

const unwrap = (res) => {
  const body = res?.data;
  if (body?.success === false) throw new Error(body?.message || i18n.t("common.error_occurred"));
  return body?.data; // ApiResponse của bạn bọc ở data
};

export async function fetchGroupedAmenitiesForPartner(scope) {
  const res = await api.get(`/catalog/amenities`, {
    params: { grouped: true, scope },
  });
  return unwrap(res);
}