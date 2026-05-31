import api from "../../../utils/axiosInstance";
import i18n from "../../../i18n";

const REVIEW_PREFIX = "/reviews";

const toError = (error, fallback) => {
  fallback = fallback || i18n.t("review.error.connection");
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
    return toError(error, i18n.t("review.error.load_reviews"));
  }
};

export const getReviewSummary = async ({ targetType, targetId }) => {
  try {
    const res = await api.get(`${REVIEW_PREFIX}/summary`, {
      params: { targetType, targetId },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("review.error.load_summary"));
  }
};

export const getMyReview = async ({ targetType, targetId }) => {
  try {
    const res = await api.get(`${REVIEW_PREFIX}/my`, {
      params: { targetType, targetId },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("review.error.load_my_review"));
  }
};

export const createReview = async (payload) => {
  try {
    const res = await api.post(REVIEW_PREFIX, payload);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("review.error.create"));
  }
};

export const updateReview = async (reviewId, payload) => {
  try {
    const res = await api.put(`${REVIEW_PREFIX}/${reviewId}`, payload);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("review.error.update"));
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const res = await api.delete(`${REVIEW_PREFIX}/${reviewId}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("review.error.delete"));
  }
};

export const canReview = async ({ targetType, targetId, slug, name }) => {
  try {
    const res = await api.get(`${REVIEW_PREFIX}/can-review`, {
      params: { targetType, targetId, slug, name },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("review.error.connection"));
  }
};

export const getAspectDefinitions = async (category) => {
  try {
    const res = await api.get(`${REVIEW_PREFIX}/aspects`, { params: { category } });
    return { success: true, data: res.data?.data ?? [] };
  } catch (error) {
    return toError(error, i18n.t("review.error.load_aspects"));
  }
};
