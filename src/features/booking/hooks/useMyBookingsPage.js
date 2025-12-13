import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

import { useNavigate } from "react-router-dom";

export function useMyBookingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ====== AUTH ======
  const { user, accessToken } = useSelector((s) => s.auth || {});
  const isLoggedIn = !!accessToken && !!user?.id;

  // ====== PUBLIC (DEVICE + LOOKUP) ======
  const my = useSelector((s) => s.bookingPublic?.my);
  const lookup = useSelector((s) => s.bookingPublic?.lookup);

  // ====== PRIVATE (ACCOUNT) ======
  const myAcc = useSelector((s) => s.bookingPrivate?.my);
  const claim = useSelector((s) => s.bookingPrivate?.claim);

  // ✅ 3 tabs: DEVICE | ACCOUNT | LOOKUP
  const [tab, setTab] = useState("DEVICE");

  // lookup form state
  const [bookingCode, setBookingCode] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [email, setEmail] = useState("");

  // ✅ luôn load guest bookings (tab thiết bị)
  useEffect(() => {
    dispatch(fetchGuestMyBookings());
  }, [dispatch]);

  // ✅ khi chuyển sang ACCOUNT và đã login => load user bookings
  useEffect(() => {
    if (tab !== "ACCOUNT") return;
    if (!isLoggedIn) return;
    dispatch(fetchMyUserBookings(user.id));
  }, [dispatch, tab, isLoggedIn, user?.id]);

  // ====== Actions ======
  const onRefreshDevice = useCallback(() => {
    dispatch(fetchGuestMyBookings());
  }, [dispatch]);

  const onClearDevice = useCallback(async () => {
    await dispatch(clearGuestDevice()).unwrap();
    dispatch(fetchGuestMyBookings());
  }, [dispatch]);

  const onRefreshAccount = useCallback(() => {
    if (!isLoggedIn) return;
    dispatch(fetchMyUserBookings(user.id));
  }, [dispatch, isLoggedIn, user?.id]);

  const onClaimToAccount = useCallback(async () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent("/my-bookings")}`);
      return;
    }
    await dispatch(claimMyGuestBookings(user.id)).unwrap();

    // reload cả 2 bên để UI thấy “chuyển” ngay
    dispatch(fetchMyUserBookings(user.id));
    dispatch(fetchGuestMyBookings());
  }, [dispatch, isLoggedIn, user?.id, navigate]);

  const onSubmitLookup = useCallback(async () => {
    const payload = {
      bookingCode: bookingCode.trim(),
      phoneLast4: phoneLast4.trim(),
      email: email?.trim() || null,
    };
    await dispatch(lookupBookingPublic(payload)).unwrap();
  }, [dispatch, bookingCode, phoneLast4, email]);

  const onClearLookupResult = useCallback(() => {
    dispatch(clearLookup());
  }, [dispatch]);

  // ====== Counts ======
  const deviceCount = useMemo(
    () => (my?.items?.length ? my.items.length : 0),
    [my?.items]
  );

  const accountCount = useMemo(
    () => (myAcc?.items?.length ? myAcc.items.length : 0),
    [myAcc?.items]
  );

  return {
    // tabs
    tab,
    setTab,

    // auth
    isLoggedIn,
    user,

    // DEVICE tab
    deviceCount,
    deviceLoading: !!my?.loading,
    deviceError: my?.error,
    deviceItems: my?.items || [],
    onRefreshDevice,
    onClearDevice,

    // ACCOUNT tab
    accountCount,
    accountLoading: !!myAcc?.loading,
    accountError: myAcc?.error,
    accountItems: myAcc?.items || [],
    onRefreshAccount,

    // claim button
    claimLoading: !!claim?.loading,
    claimError: claim?.error,
    claimClaimed: claim?.claimed ?? 0,
    onClaimToAccount,

    // LOOKUP tab
    bookingCode,
    phoneLast4,
    email,
    setBookingCode,
    setPhoneLast4,
    setEmail,
    lookupLoading: !!lookup?.loading,
    lookupError: lookup?.error,
    lookupResult: lookup?.result,
    onSubmitLookup,
    onClearLookupResult,
  };
}