// src/features/catalog/services/favoriteService.js
import api from "../../../utils/axiosInstance";

const FAVORITES_PREFIX = "/catalog/favorites";

/**
 * Toggle favorite: thêm/bỏ yêu thích.
 * POST /api/catalog/favorites/toggle
 * @param {string} targetType - HOTEL, RESTAURANT, PLACE
 * @param {string} targetId - ID của đối tượng
 */
export const toggleFavorite = async (targetType, targetId) => {
  try {
    const res = await api.post(`${FAVORITES_PREFIX}/toggle`, {
      targetType,
      targetId,
    });
    return res.data; // { success: true, message: "...", data: { favorited, favoriteCount } }
  } catch (error) {
    if (error?.response?.data) return error.response.data;
    return { success: false, message: "Không thể thực hiện yêu thích" };
  }
};

/**
 * Lấy summary (count + status) cho 1 đối tượng.
 * GET /api/catalog/favorites/summary
 */
export const getFavoriteSummary = async (targetType, targetId) => {
  try {
    const res = await api.get(`${FAVORITES_PREFIX}/summary`, {
      params: { targetType, targetId },
    });
    return res.data; // { success: true, data: { count, favorited } }
  } catch (error) {
    if (error?.response?.data) return error.response.data;
    return { success: false, message: "Lỗi tải thông tin yêu thích" };
  }
};

/**
 * Lấy số lượng favorite.
 * GET /api/catalog/favorites/count
 */
export const getFavoriteCount = async (targetType, targetId) => {
  try {
    const res = await api.get(`${FAVORITES_PREFIX}/count`, {
      params: { targetType, targetId },
    });
    return res.data;
  } catch (error) {
    return { success: false, message: "Lỗi tải số lượt yêu thích" };
  }
};

/**
 * Lấy danh sách favorites của tôi.
 * GET /api/catalog/favorites/me
 */
export const getMyFavorites = async (params = {}) => {
  try {
    const res = await api.get(`${FAVORITES_PREFIX}/me`, { params });
    return res.data;
  } catch (error) {
    if (error?.response?.data) return error.response.data;
    return { success: false, message: "Lỗi tải danh sách yêu thích" };
  }
};
