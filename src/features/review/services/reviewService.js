import api from "../../../utils/axiosInstance";

const REVIEW_PREFIX = "/reviews";

const toError = (error, fallback = "Lỗi kết nối đến server") => {
  if (error?.response?.data) {
    const msg =
      error.response.data.message || error.response.data.error || fallback;
    return { success: false, message: msg };
  }
  return { success: false, message: fallback };
};

export const getReviews = async ({ targetType, targetId, page = 0, size = 5 }) => {
  try {
    const res = await api.get(REVIEW_PREFIX, {
      params: { targetType, targetId, page, size },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được danh sách đánh giá");
  }
};

export const getReviewSummary = async ({ targetType, targetId }) => {
  try {
    const res = await api.get(`${REVIEW_PREFIX}/summary`, {
      params: { targetType, targetId },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được thống kê đánh giá");
  }
};

export const getMyReview = async ({ targetType, targetId }) => {
  try {
    const res = await api.get(`${REVIEW_PREFIX}/my`, {
      params: { targetType, targetId },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được đánh giá của bạn");
  }
};

export const createReview = async (payload) => {
  try {
    const res = await api.post(REVIEW_PREFIX, payload);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không gửi được đánh giá");
  }
};

export const updateReview = async (reviewId, payload) => {
  try {
    const res = await api.put(`${REVIEW_PREFIX}/${reviewId}`, payload);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không cập nhật được đánh giá");
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const res = await api.delete(`${REVIEW_PREFIX}/${reviewId}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không xóa được đánh giá");
  }
};

export const getAspectDefinitions = async (category) => {
  try {
    const res = await api.get(`${REVIEW_PREFIX}/aspects`, { params: { category } });
    return { success: true, data: res.data?.data ?? [] };
  } catch (error) {
    return toError(error, "Không tải được danh sách tiêu chí");
  }
};
