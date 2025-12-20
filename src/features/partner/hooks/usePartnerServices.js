import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPartnerHotels,
  fetchPartnerRestaurants,

  partnerDeleteHotel,
  partnerPauseHotel,
  partnerResumeHotel,
  partnerUnlockHotel,
  partnerUpdateHotel,

  partnerDeleteRestaurant,
  partnerPauseRestaurant,
  partnerResumeRestaurant,
  partnerUnlockRestaurant,
  partnerUpdateRestaurant,
} from "../slices/partnerSlice";

export const usePartnerServices = () => {
  const dispatch = useDispatch();
  const hotels = useSelector((s) => s.partner.hotels);
  const restaurants = useSelector((s) => s.partner.restaurants);
  const action = useSelector((s) => s.partner.action);

  const fetchHotels = useCallback(
    (params) => dispatch(fetchPartnerHotels(params)),
    [dispatch]
  );

  const fetchRestaurants = useCallback(
    (params) => dispatch(fetchPartnerRestaurants(params)),
    [dispatch]
  );

  const remove = useCallback(
    ({ type, id }) =>
      type === "HOTEL"
        ? dispatch(partnerDeleteHotel(id)).unwrap()
        : dispatch(partnerDeleteRestaurant(id)).unwrap(),
    [dispatch]
  );

  const pause = useCallback(
    ({ type, id }) =>
      type === "HOTEL"
        ? dispatch(partnerPauseHotel(id)).unwrap()
        : dispatch(partnerPauseRestaurant(id)).unwrap(),
    [dispatch]
  );

  const resume = useCallback(
    ({ type, id }) =>
      type === "HOTEL"
        ? dispatch(partnerResumeHotel(id)).unwrap()
        : dispatch(partnerResumeRestaurant(id)).unwrap(),
    [dispatch]
  );

  const requestUnlock = useCallback(
    ({ type, id, reason }) =>
      type === "HOTEL"
        ? dispatch(partnerUnlockHotel({ id, reason })).unwrap()
        : dispatch(partnerUnlockRestaurant({ id, reason })).unwrap(),
    [dispatch]
  );

  const updateHotel = useCallback(
    ({ id, payload }) => dispatch(partnerUpdateHotel({ id, payload })).unwrap(),
    [dispatch]
  );

  const updateRestaurant = useCallback(
    ({ id, payload }) =>
      dispatch(partnerUpdateRestaurant({ id, payload })).unwrap(),
    [dispatch]
  );

  const combined = useMemo(() => {
    const hs = (hotels.items || []).map((x) => ({ ...x, type: "HOTEL" }));
    const rs = (restaurants.items || []).map((x) => ({ ...x, type: "RESTAURANT" }));
    return [...hs, ...rs];
  }, [hotels.items, restaurants.items]);

  return {
    hotels,
    restaurants,
    combined,
    action,
    fetchHotels,
    fetchRestaurants,
    remove,
    pause,
    resume,
    requestUnlock,
    updateHotel,
    updateRestaurant,
  };
};