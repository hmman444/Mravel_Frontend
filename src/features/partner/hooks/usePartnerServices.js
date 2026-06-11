import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import i18n from "../../../i18n";
import {
  fetchPartnerHotels,
  fetchPartnerRestaurants,

  partnerDeleteHotel,
  partnerPauseHotel,
  partnerResumeHotel,
  partnerUnlockHotel,
  partnerUpdateHotel,
  partnerCreateHotel,

  partnerDeleteRestaurant,
  partnerPauseRestaurant,
  partnerResumeRestaurant,
  partnerUnlockRestaurant,
  partnerUpdateRestaurant,
  partnerCreateRestaurant,
} from "../slices/partnerSlice";

// .unwrap() trên thunk dùng rejectWithValue(stringMessage) sẽ THROW MỘT CHUỖI,
// nên e?.message của consumer luôn undefined và mất lý do thật. Chuẩn hoá tại ranh giới
// hook: rethrow Error thật để downstream (e?.message) lấy được lý do từ backend.
const rethrowReal = (e, fallbackKey) => {
  throw new Error(
    typeof e === "string" ? e : (e?.message || e?.error || i18n.t(fallbackKey))
  );
};

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

  const createRestaurant = useCallback(
    async (payload) => {
      try {
        return await dispatch(partnerCreateRestaurant(payload)).unwrap();
      } catch (e) {
        rethrowReal(e, "partner.error.create_restaurant");
      }
    },
    [dispatch]
  );

  const remove = useCallback(
    async ({ type, id }) => {
      try {
        return type === "HOTEL"
          ? await dispatch(partnerDeleteHotel(id)).unwrap()
          : await dispatch(partnerDeleteRestaurant(id)).unwrap();
      } catch (e) {
        rethrowReal(
          e,
          type === "HOTEL" ? "partner.error.delete_hotel" : "partner.error.delete_restaurant"
        );
      }
    },
    [dispatch]
  );

  const pause = useCallback(
    async ({ type, id }) => {
      try {
        return type === "HOTEL"
          ? await dispatch(partnerPauseHotel(id)).unwrap()
          : await dispatch(partnerPauseRestaurant(id)).unwrap();
      } catch (e) {
        rethrowReal(
          e,
          type === "HOTEL" ? "partner.error.pause_hotel" : "partner.error.pause_restaurant"
        );
      }
    },
    [dispatch]
  );

  const resume = useCallback(
    async ({ type, id }) => {
      try {
        return type === "HOTEL"
          ? await dispatch(partnerResumeHotel(id)).unwrap()
          : await dispatch(partnerResumeRestaurant(id)).unwrap();
      } catch (e) {
        rethrowReal(
          e,
          type === "HOTEL" ? "partner.error.resume_hotel" : "partner.error.resume_restaurant"
        );
      }
    },
    [dispatch]
  );

  const requestUnlock = useCallback(
    async ({ type, id, reason }) => {
      try {
        return type === "HOTEL"
          ? await dispatch(partnerUnlockHotel({ id, reason })).unwrap()
          : await dispatch(partnerUnlockRestaurant({ id, reason })).unwrap();
      } catch (e) {
        rethrowReal(e, "partner.error.unlock_request");
      }
    },
    [dispatch]
  );

  const updateHotel = useCallback(
    async ({ id, payload }) => {
      try {
        return await dispatch(partnerUpdateHotel({ id, payload })).unwrap();
      } catch (e) {
        rethrowReal(e, "partner.error.update_hotel");
      }
    },
    [dispatch]
  );


  const createHotel = useCallback(
    async (payload) => {
      try {
        return await dispatch(partnerCreateHotel(payload)).unwrap();
      } catch (e) {
        rethrowReal(e, "partner.error.create_hotel");
      }
    },
    [dispatch]
  );

  const updateRestaurant = useCallback(
    async ({ id, payload }) => {
      try {
        return await dispatch(partnerUpdateRestaurant({ id, payload })).unwrap();
      } catch (e) {
        rethrowReal(e, "partner.error.update_restaurant");
      }
    },
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
    createHotel,
    updateRestaurant,
    createRestaurant,
  };
};