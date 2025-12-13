// src/features/booking/hooks/useHotelBookingPage.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotelDetail } from "../../catalog/slices/catalogSlice";
import { useHotelPricing } from "./useHotelPricing";
import { fetchHotelAvailability, createHotelPayment } from "../slices/bookingSlice";
import { fmt } from "../services/bookingService";
import { fetchCurrentUser } from "../../auth/slices/authSlice";

export function useHotelBookingPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();

  const hotelSlug = params.get("hotelSlug") || "";
  const roomTypeId = params.get("roomTypeId") || "";
  const ratePlanId = params.get("ratePlanId") || "";

  const { hotelAvailability, payment } = useSelector((s) => s.booking);
  const { data: hotel, loading } = useSelector((s) => s.catalog.hotelDetail);

  // ✅ auth state
  const { accessToken, user } = useSelector((s) => s.auth);
  const isLoggedIn = !!accessToken;
  const userId = isLoggedIn ? (user?.id ?? null) : null;

  // ✅ nếu có token mà chưa load user => gọi /auth/me
  useEffect(() => {
    if (isLoggedIn && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isLoggedIn, user]);

  // ✅ form state
  const [contactName, setContactName] = useState("Mẫn Huỳnh Minh");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("nsndman0404@gmail.com");
  const [note, setNote] = useState("");

  // ✅ optional: nếu logged-in và có user, autofill contact
  useEffect(() => {
    if (!user) return;
    // tùy field backend trả về. Bạn chỉnh lại cho đúng tên field user của bạn.
    if (!contactName) setContactName(user.fullname || user.name || "");
    if (!contactEmail) setContactEmail(user.email || "");
  }, [user]); // eslint-disable-line

  // dates
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+1); return d;
  });
  const [nights, setNights] = useState(1);
  const [roomsCount, setRoomsCount] = useState(1);

  useEffect(() => {
    if (hotelSlug) dispatch(fetchHotelDetail(hotelSlug));
  }, [dispatch, hotelSlug]);

  const roomType = useMemo(
    () => hotel?.roomTypes?.find((rt) => rt.id === roomTypeId) || hotel?.roomTypes?.find((rt) => rt.slug === roomTypeId),
    [hotel, roomTypeId]
  );

  const ratePlan = useMemo(
    () => roomType?.ratePlans?.find((rp) => rp.id === ratePlanId) || roomType?.ratePlans?.find((rp) => rp.code === ratePlanId),
    [roomType, ratePlanId]
  );

  const guests = roomType?.maxGuests || 2;

  const { pricingAllRooms } = useHotelPricing(ratePlan, checkIn, checkOut, roomsCount);

  const handleStayChange = ({ checkIn: ci, checkOut: co, nights: n }) => {
    setCheckIn(ci); setCheckOut(co); setNights(n);
  };

  const handleRoomsChange = (value) => setRoomsCount(value);

  useEffect(() => {
    if (!hotelSlug || !roomTypeId || !checkIn || !checkOut) return;
    dispatch(fetchHotelAvailability({
      hotelId: hotel?.id,
      hotelSlug,
      roomTypeId,
      checkIn,
      checkOut,
      rooms: roomsCount,
    }));
  }, [dispatch, hotel?.id, hotelSlug, roomTypeId, checkIn, checkOut, roomsCount]);

  const remainingRoomsText = useMemo(() => {
    const rem = hotelAvailability?.data?.remainingRooms;
    if (rem == null) return "Đang kiểm tra phòng trống...";
    if (rem <= 0) return "Hết phòng";
    return `Chỉ còn ${rem} phòng`;
  }, [hotelAvailability?.data]);

  const isEnoughRooms = hotelAvailability?.data?.isEnough ?? true;

  const onPay = useCallback(async ({ paymentOption }) => {
    if (!hotel || !roomType || !ratePlan) return;

    const payOption = paymentOption === "DEPOSIT" ? "DEPOSIT" : "FULL";

    const payload = {
      // ✅ đây là điểm bạn cần:
      userId, // logged-in => number, guest => null

      contactName,
      contactPhone,
      contactEmail,
      note,

      hotelId: hotel.id,
      hotelSlug: hotel.slug,
      hotelName: hotel.name,

      checkInDate: fmt(checkIn),
      checkOutDate: fmt(checkOut),

      payOption,

      rooms: [
        {
          roomTypeId: roomType.id,
          roomTypeName: roomType.name,
          ratePlanId: ratePlan.id,
          ratePlanName: ratePlan.name,
          quantity: roomsCount,
          pricePerNight: Number(ratePlan.pricePerNight),
        },
      ],
    };

    const result = await dispatch(createHotelPayment(payload)).unwrap();
    const url = result?.payUrl || result?.paymentUrl;
    if (url) window.location.href = url;
  }, [
    dispatch,
    hotel, roomType, ratePlan,
    userId,
    contactName, contactPhone, contactEmail, note,
    checkIn, checkOut,
    roomsCount,
  ]);

  const hotelName = hotel?.name || hotelSlug || "Khách sạn của bạn";
  const roomName = roomType?.name || roomTypeId || "Loại phòng đã chọn";

  return {
    loading,
    hotelName,
    roomName,
    guests,
    ratePlan,
    checkIn,
    checkOut,
    nights,
    roomsCount,
    pricingAllRooms,
    remainingRoomsText,
    isEnoughRooms,

    // ✅ expose thêm nếu bạn muốn show UI
    isLoggedIn,
    user,

    payLoading: payment.loading,
    payError: payment.error,

    contactName,
    contactPhone,
    contactEmail,
    note,

    handleStayChange,
    handleRoomsChange,
    onContactNameChange: setContactName,
    onContactPhoneChange: setContactPhone,
    onContactEmailChange: setContactEmail,
    onNoteChange: setNote,

    onPay,
  };
}