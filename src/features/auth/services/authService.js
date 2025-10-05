// src/features/auth/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: "Lỗi kết nối đến server", data: null };
  }
};
