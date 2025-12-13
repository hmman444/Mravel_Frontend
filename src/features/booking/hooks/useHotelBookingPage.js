// src/features/booking/hooks/useHotelBookingPage.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotelDetail } from "../../catalog/slices/catalogSlice";
import { useHotelPricing } from "./useHotelPricing";
import { fetchHotelAvailability, createHotelPayment } from "../slices/bookingSlice";
import { fmt } from "../services/bookingService";

export function useHotelBookingPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();

  const hotelSlug = params.get("hotelSlug") || "";
  const roomTypeId = params.get("roomTypeId") || "";
  const ratePlanId = params.get("ratePlanId") || "";

  const { hotelAvailability, payment } = useSelector((s) => s.booking);
  const { data: hotel, loading } = useSelector((s) => s.catalog.hotelDetail);

  // ✅ form state
  const [contactName, setContactName] = useState("Mẫn Huỳnh Minh");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("nsndman0404@gmail.com");
  const [note, setNote] = useState("");

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

  // ✅ onPay: build payload + call thunk + redirect
  const onPay = useCallback(async ({ paymentOption }) => {
    if (!hotel || !roomType || !ratePlan) return;

    const payOption = paymentOption === "DEPOSIT" ? "DEPOSIT" : "FULL";

    const payload = {
      userId: 1, // tạm
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
    console.log("payment result:", result);
    console.log("redirect url:", url);

    if (url) window.location.href = url;
    else console.warn("Missing pay url:", result);
  }, [
    dispatch,
    hotel, roomType, ratePlan,
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

    payLoading: payment.loading,
    payError: payment.error,

    // form values
    contactName,
    contactPhone,
    contactEmail,
    note,

    // handlers
    handleStayChange,
    handleRoomsChange,
    onContactNameChange: setContactName,
    onContactPhoneChange: setContactPhone,
    onContactEmailChange: setContactEmail,
    onNoteChange: setNote,

    onPay, // ✅ expose
  };
}