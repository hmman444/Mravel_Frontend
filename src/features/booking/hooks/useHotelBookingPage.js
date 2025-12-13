// src/features/booking/hooks/useHotelBookingPage.js
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchHotelDetail } from "../../catalog/slices/catalogSlice";
import { useHotelPricing } from "./useHotelPricing";
import { fetchHotelAvailability } from "../slices/bookingSlice";

export function useHotelBookingPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();

  const hotelSlug = params.get("hotelSlug") || "";
  const roomTypeId = params.get("roomTypeId") || "";
  const ratePlanId = params.get("ratePlanId") || "";
  const { hotelAvailability } = useSelector((s) => s.booking);

  // state ngày / đêm / số phòng
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  });

  const [nights, setNights] = useState(1);
  const [roomsCount, setRoomsCount] = useState(1);

  const { data: hotel, loading } = useSelector((s) => s.catalog.hotelDetail);

  // load detail khách sạn
  useEffect(() => {
    if (hotelSlug) {
      dispatch(fetchHotelDetail(hotelSlug));
    }
  }, [dispatch, hotelSlug]);

  // chọn roomType theo id/slug
  const roomType = useMemo(
    () =>
      hotel?.roomTypes?.find((rt) => rt.id === roomTypeId) ||
      hotel?.roomTypes?.find((rt) => rt.slug === roomTypeId),
    [hotel, roomTypeId]
  );

  // chọn ratePlan theo id/code
  const ratePlan = useMemo(
    () =>
      roomType?.ratePlans?.find((rp) => rp.id === ratePlanId) ||
      roomType?.ratePlans?.find((rp) => rp.code === ratePlanId),
    [roomType, ratePlanId]
  );

  const guests = roomType?.maxGuests || 2;

  // Logic giá: nhân theo NGÀY (nights + 1)
  const daysCount = nights + 1;
  const { pricingAllRooms } = useHotelPricing(
    ratePlan,
    checkIn,
    checkOut,
    roomsCount
    );

  // Tên khách sạn / phòng fallback
  const hotelName =
    hotel?.name ||
    (hotelSlug
      ? hotelSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Khách sạn của bạn");

  const roomName = roomType?.name || roomTypeId || "Loại phòng đã chọn";

  const handleStayChange = ({ checkIn: ci, checkOut: co, nights: n }) => {
    setCheckIn(ci);
    setCheckOut(co);
    setNights(n);
  };

  const handleRoomsChange = (value) => {
    setRoomsCount(value);
  };

  // gọi availability mỗi lần đổi ngày / số phòng / roomType
  useEffect(() => {
    if (!hotelSlug || !roomTypeId || !checkIn || !checkOut) return;

    // optional: hotel?.id nếu backend cần
    dispatch(
      fetchHotelAvailability({
        hotelId: hotel?.id,
        hotelSlug,
        roomTypeId,
        checkIn,
        checkOut,
        rooms: roomsCount,
      })
    );
  }, [dispatch, hotel?.id, hotelSlug, roomTypeId, checkIn, checkOut, roomsCount]);

  // text hiển thị
  const remainingRoomsText = useMemo(() => {
    const rem = hotelAvailability?.data?.remainingRooms;
    if (rem == null) return "Đang kiểm tra phòng trống...";
    if (rem <= 0) return "Hết phòng";
    return `Chỉ còn ${rem} phòng`;
  }, [hotelAvailability?.data]);

  const isEnoughRooms = hotelAvailability?.data?.isEnough ?? true;

  return {
    // loading
    loading,

    // info phòng
    hotelName,
    roomName,
    guests,
    ratePlan,

    // state ngày / đêm / phòng
    checkIn,
    checkOut,
    nights,
    roomsCount,

    // giá
    pricingAllRooms,
    daysCount,

    remainingRoomsText,
    isEnoughRooms,
    availabilityLoading: hotelAvailability.loading,
    availabilityError: hotelAvailability.error,

    // handler
    handleStayChange,
    handleRoomsChange,
  };
}