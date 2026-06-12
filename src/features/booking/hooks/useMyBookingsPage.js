import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showError } from "../../../utils/toastUtils";

//  HOTEL (cũ) 
import {
  fetchGuestMyBookings,
  lookupBookingPublic,
  clearGuestDevice,
  clearLookup,
} from "../slices/bookingPublicSlice";

import {
  fetchMyUserBookings,
  claimMyGuestBookings,
} from "../slices/bookingPrivateSlice";

//  RESTAURANT (mới) 
import {
  fetchGuestMyRestaurantBookings,
  lookupRestaurantBookingPublic,
  clearRestaurantGuestDevice,
  clearRestaurantLookup,
} from "../slices/bookingRestaurantPublicSlice";

import {
  fetchMyUserRestaurantBookings,
  claimMyGuestRestaurantBookings,
} from "../slices/bookingRestaurantPrivateSlice";

export function useMyBookingsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [type, setType] = useState("HOTEL");  // HOTEL | RESTAURANT

  // AUTH
  const { user, accessToken } = useSelector((s) => s.auth || {});
  const isLoggedIn = !!accessToken && !!user?.id;

  // Tab mặc định theo trạng thái đăng nhập: đã login -> ACCOUNT, chưa -> DEVICE.
  // tabTouched: một khi user tự bấm tab thì không tự đổi nữa.
  // useEffect xử lý auth hydrate trễ (accessToken khôi phục từ storage sau mount).
  const [tab, setTabRaw] = useState(isLoggedIn ? "ACCOUNT" : "DEVICE"); // ACCOUNT | DEVICE | LOOKUP
  const tabTouched = useRef(false);
  const setTab = useCallback((v) => {
    tabTouched.current = true;
    setTabRaw(v);
  }, []);
  useEffect(() => {
    if (tabTouched.current) return;
    setTabRaw(isLoggedIn ? "ACCOUNT" : "DEVICE");
  }, [isLoggedIn]);

  // HOTEL selectors
  const hotelMy = useSelector((s) => s.bookingPublic?.my);
  const hotelLookup = useSelector((s) => s.bookingPublic?.lookup);
  const hotelAcc = useSelector((s) => s.bookingPrivate?.my);
  const hotelClaim = useSelector((s) => s.bookingPrivate?.claim);

  // REST selectors
  const restMy = useSelector((s) => s.bookingRestaurantPublic?.my);
  const restLookup = useSelector((s) => s.bookingRestaurantPublic?.lookup);
  const restAcc = useSelector((s) => s.bookingRestaurantPrivate?.my);
  const restClaim = useSelector((s) => s.bookingRestaurantPrivate?.claim);

  //  LOOKUP FORM STATE tách theo type (HOTEL/RESTAURANT)
  const [lookupForm, setLookupForm] = useState({
    HOTEL: { bookingCode: "", phoneLast4: "", email: "" },
    RESTAURANT: { bookingCode: "", phoneLast4: "", email: "" },
  });

  const form = lookupForm[type];

  const setBookingCode = useCallback(
    (v) =>
      setLookupForm((s) => ({
        ...s,
        [type]: { ...s[type], bookingCode: v },
      })),
    [type]
  );

  const setPhoneLast4 = useCallback(
    (v) =>
      setLookupForm((s) => ({
        ...s,
        [type]: { ...s[type], phoneLast4: v },
      })),
    [type]
  );

  const setEmail = useCallback(
    (v) =>
      setLookupForm((s) => ({
        ...s,
        [type]: { ...s[type], email: v },
      })),
    [type]
  );

  //  luôn load DEVICE list cho CẢ 2 loại
  useEffect(() => {
    dispatch(fetchGuestMyBookings());
    dispatch(fetchGuestMyRestaurantBookings());
  }, [dispatch]);

  //  khi vào ACCOUNT và đã login => load CẢ 2 loại
  useEffect(() => {
    if (tab !== "ACCOUNT") return;
    if (!isLoggedIn) return;

    dispatch(fetchMyUserBookings(user.id));
    dispatch(fetchMyUserRestaurantBookings());
  }, [dispatch, tab, isLoggedIn, user?.id]);

  //  khi tab trình duyệt hiển thị lại (vd: quay về từ PaymentReturnPage)
  //  => refetch để thấy trạng thái booking mới nhất
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      dispatch(fetchGuestMyBookings());
      dispatch(fetchGuestMyRestaurantBookings());
      if (tab === "ACCOUNT" && isLoggedIn) {
        dispatch(fetchMyUserBookings(user.id));
        dispatch(fetchMyUserRestaurantBookings());
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [dispatch, tab, isLoggedIn, user?.id]);

  //  Actions (DEVICE) 
  const onRefreshDevice = useCallback(() => {
    if (type === "HOTEL") dispatch(fetchGuestMyBookings());
    else dispatch(fetchGuestMyRestaurantBookings());
  }, [dispatch, type]);

  const onClearDevice = useCallback(async () => {
    try {
      if (type === "HOTEL") {
        await dispatch(clearGuestDevice()).unwrap();
        dispatch(fetchGuestMyBookings());
      } else {
        await dispatch(clearRestaurantGuestDevice()).unwrap();
        dispatch(fetchGuestMyRestaurantBookings());
      }
    } catch (e) {
      // slice không có .rejected reducer cho clear => surface trực tiếp
      showError(typeof e === "string" ? e : (e?.message || e?.error) || t("booking.clear_failed"));
    }
  }, [dispatch, type, t]);

  //  Actions (ACCOUNT) 
  const onRefreshAccount = useCallback(() => {
    if (!isLoggedIn) return;

    if (type === "HOTEL") dispatch(fetchMyUserBookings(user.id));
    else dispatch(fetchMyUserRestaurantBookings());
  }, [dispatch, type, isLoggedIn, user?.id]);

  //  Claim (gộp guest -> account) 
  const onClaimToAccount = useCallback(async () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent("/my-bookings")}`);
      return;
    }

    try {
      if (type === "HOTEL") {
        await dispatch(claimMyGuestBookings(user.id)).unwrap();
        dispatch(fetchMyUserBookings(user.id));
        dispatch(fetchGuestMyBookings());
      } else {
        await dispatch(claimMyGuestRestaurantBookings()).unwrap();
        dispatch(fetchMyUserRestaurantBookings());
        dispatch(fetchGuestMyRestaurantBookings());
      }
    } catch {
      /* đã surface qua claimError (slice state) hiển thị trong MyBookingsPage */
    }
  }, [dispatch, type, isLoggedIn, user?.id, navigate]);

  //  Lookup submit ( theo type, không dựa prefix nữa) 
  const onSubmitLookup = useCallback(async () => {
    const payload = {
      bookingCode: (form.bookingCode || "").trim().toUpperCase(),
      phoneLast4: (form.phoneLast4 || "").trim(),
      email: form.email?.trim() || null,
    };

    try {
      if (type === "RESTAURANT") {
        await dispatch(lookupRestaurantBookingPublic(payload)).unwrap();
      } else {
        await dispatch(lookupBookingPublic(payload)).unwrap();
      }
    } catch {
      /* đã surface qua lookupError (slice state) hiển thị trong MyBookingsPage */
    }
  }, [dispatch, type, form]);

  const onClearLookupResult = useCallback(() => {
    if (type === "HOTEL") dispatch(clearLookup());
    else dispatch(clearRestaurantLookup());
  }, [dispatch, type]);

  //  Counts 
  const deviceHotelCount = useMemo(() => hotelMy?.items?.length || 0, [hotelMy?.items]);
  const deviceRestCount = useMemo(() => restMy?.items?.length || 0, [restMy?.items]);
  const accountHotelCount = useMemo(() => hotelAcc?.items?.length || 0, [hotelAcc?.items]);
  const accountRestCount = useMemo(() => restAcc?.items?.length || 0, [restAcc?.items]);

  //  Active list theo type 
  const deviceItems = type === "HOTEL" ? (hotelMy?.items || []) : (restMy?.items || []);
  const deviceLoading = type === "HOTEL" ? !!hotelMy?.loading : !!restMy?.loading;
  const deviceError = type === "HOTEL" ? hotelMy?.error : restMy?.error;

  const accountItems = type === "HOTEL" ? (hotelAcc?.items || []) : (restAcc?.items || []);
  const accountLoading = type === "HOTEL" ? !!hotelAcc?.loading : !!restAcc?.loading;
  const accountError = type === "HOTEL" ? hotelAcc?.error : restAcc?.error;

  const claimLoading = type === "HOTEL" ? !!hotelClaim?.loading : !!restClaim?.loading;
  const claimError = type === "HOTEL" ? hotelClaim?.error : restClaim?.error;

  //  LOOKUP state theo type (đúng UI: hotel/res độc lập)
  const lookupLoading = type === "HOTEL" ? !!hotelLookup?.loading : !!restLookup?.loading;
  const lookupError = type === "HOTEL" ? hotelLookup?.error : restLookup?.error;
  const lookupResult = type === "HOTEL" ? hotelLookup?.result : restLookup?.result;
  const lookupScope =
    type === "HOTEL"
      ? (hotelLookup?.scope || "PUBLIC")
      : (restLookup?.scope || "PUBLIC");

  return {
    // main tabs
    tab,
    setTab,

    // sub type
    type,
    setType,

    // auth
    isLoggedIn,
    user,

    // counts
    deviceHotelCount,
    deviceRestCount,
    accountHotelCount,
    accountRestCount,

    // DEVICE
    deviceLoading,
    deviceError,
    deviceItems,
    onRefreshDevice,
    onClearDevice,

    // ACCOUNT
    accountLoading,
    accountError,
    accountItems,
    onRefreshAccount,

    // claim
    claimLoading,
    claimError,
    onClaimToAccount,

    // LOOKUP (tách theo type)
    bookingCode: form.bookingCode,
    phoneLast4: form.phoneLast4,
    email: form.email,
    setBookingCode,
    setPhoneLast4,
    setEmail,
    lookupLoading,
    lookupError,
    lookupResult,
    onSubmitLookup,
    onClearLookupResult,
    lookupScope,
  };
}