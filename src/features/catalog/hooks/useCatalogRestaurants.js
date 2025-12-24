import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchRestaurants } from "../slices/catalogSlice";
import { showError } from "../../../utils/toastUtils";

export const useCatalogRestaurants = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const state = useSelector((s) => s.catalog.restaurants);

  const fetchRestaurants = useCallback(
    (params) => dispatch(searchRestaurants(params)),
    [dispatch]
  );

  //  gộp luôn handleBookingSubmit ở đây
  const handleBookingSubmit = useCallback(
    (payload) => {
      const slug = payload?.restaurantSlug;
      if (!slug) return;

      const date = payload?.date || "";
      const time = payload?.time || "";
      const adults = payload?.adults ?? 2;
      const children = payload?.children ?? 0;

      // nếu bạn muốn bắt buộc chọn giờ/ngày
      if (!date || !time) {
        showError("Vui lòng chọn ngày và giờ trước khi đặt bàn.");
        return;
      }

      const qs = new URLSearchParams({
        restaurantSlug: slug,
        date,
        time,
        adults: String(adults),
        children: String(children),
      });

      navigate(`/booking/restaurant?${qs.toString()}`);
    },
    [navigate]
  );

  return { ...state, fetchRestaurants, handleBookingSubmit };
};