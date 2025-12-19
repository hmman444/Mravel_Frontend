import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPartnerHotelBookings,
  fetchPartnerRestaurantBookings,
  fetchPartnerBookingDetail,
  cancelPartnerBooking,
  clearBookingDetail,
} from "../slices/partnerSlice";

export const usePartnerBookings = () => {
  const dispatch = useDispatch();
  const hotelBookings = useSelector((s) => s.partner.hotelBookings);
  const restaurantBookings = useSelector((s) => s.partner.restaurantBookings);
  const detail = useSelector((s) => s.partner.bookingDetail);
  const action = useSelector((s) => s.partner.action);

  const fetchHotels = useCallback((params) => dispatch(fetchPartnerHotelBookings(params)), [dispatch]);
  const fetchRestaurants = useCallback((params) => dispatch(fetchPartnerRestaurantBookings(params)), [dispatch]);

  const fetchDetail = useCallback(
    ({ type, code }) => dispatch(fetchPartnerBookingDetail({ type, code })),
    [dispatch]
  );

  const cancel = useCallback(
    ({ type, code, reason }) => dispatch(cancelPartnerBooking({ type, code, reason })),
    [dispatch]
  );

  const clearDetail = useCallback(() => dispatch(clearBookingDetail()), [dispatch]);

  return {
    hotelBookings,
    restaurantBookings,
    detail,
    action,
    fetchHotels,
    fetchRestaurants,
    fetchDetail,
    cancel,
    clearDetail,
  };
};