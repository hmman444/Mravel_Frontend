// src/features/booking/hooks/useRestaurantBookingPage.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { fetchCurrentUser } from "../../auth/slices/authSlice";
import { fetchRestaurantDetail } from "../../catalog/slices/catalogSlice";

import { fmtDate, normalizeTimeHHmm } from "../services/restaurantBookingService";
import {
  fetchRestaurantAvailability,
  createRestaurantPayment,
} from "../slices/bookingRestaurantSlice";
import { showError } from "../../../utils/toastUtils";

const pickBestTableType = (tableTypes, people) => {
  const list = Array.isArray(tableTypes) ? tableTypes : [];
  if (!list.length) return null;

  const p = Math.max(1, Number(people || 1));
  const sorted = [...list].sort((a, b) => Number(a.seats || 0) - Number(b.seats || 0));
  const fit = sorted.find((t) => Number(t.seats || 0) >= p);
  return fit || sorted[sorted.length - 1];
};

// thêm helper ở đầu file useRestaurantBookingPage.js
const calcMinTables = (people, seats) => {
  const p = Math.max(1, Number(people || 1));
  const s = Number(seats || 0);
  if (!s || s <= 0) return 1;
  return Math.max(1, Math.ceil(p / s));
};


export function useRestaurantBookingPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const dispatch = useDispatch();

  //  query from RestaurantBookingBox 
  const restaurantSlug = params.get("restaurantSlug") || "";
  const qpDate = params.get("date") || ""; // YYYY-MM-DD
  const qpTime = params.get("time") || ""; // HH:mm
  const qpAdults = Number(params.get("adults") || 2);
  const qpChildren = Number(params.get("children") || 0);
  const qpTableTypeId = params.get("tableTypeId") || "";
  const qpTables = Number(params.get("tables") || 1);

  //  state from store 
  const { data: restaurant, loading } = useSelector((s) => s.catalog.restaurantDetail || {});
  const { availability, payment } = useSelector((s) => s.bookingRestaurant);
  const openingHours = restaurant?.openingHours || restaurant?.opening_hours || [];

  //  auth 
  const { accessToken, user } = useSelector((s) => s.auth);
  const isLoggedIn = !!accessToken;
  const userId = isLoggedIn ? (user?.id ?? null) : null;

  useEffect(() => {
    if (isLoggedIn && !user) dispatch(fetchCurrentUser());
  }, [dispatch, isLoggedIn, user]);

  //  contact (FIX: có setter đầy đủ) 
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [note, setNote] = useState("");

  // chỉ auto-fill 1 lần khi có user, và CHỈ fill nếu field đang rỗng
  useEffect(() => {
    if (!user) return;

    setContactName((prev) => prev || user.fullname || user.name || "");
    setContactEmail((prev) => prev || user.email || "");
    // phone tuỳ bạn lưu field nào (nếu có)
    setContactPhone((prev) => prev || user.phone || "");
  }, [user]);

  //  booking inputs 
  const [adults, setAdults] = useState(Number.isFinite(qpAdults) ? qpAdults : 2);
  const [children, setChildren] = useState(Number.isFinite(qpChildren) ? qpChildren : 0);

  const [date, setDate] = useState(() => {
    if (qpDate) {
      const d = new Date(qpDate);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(0, 0, 0, 0);
        return d;
      }
    }
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [time, setTime] = useState(() => normalizeTimeHHmm(qpTime) || "");

  const [tablesCount, setTablesCount] = useState(
    Number.isFinite(qpTables) ? Math.max(1, qpTables) : 1
  );

  //  load restaurant detail 
  useEffect(() => {
    if (restaurantSlug) dispatch(fetchRestaurantDetail(restaurantSlug));
  }, [dispatch, restaurantSlug]);

  const tableTypes = useMemo(() => restaurant?.tableTypes || [], [restaurant?.tableTypes]);

  const people = useMemo(
    () => Number(adults || 0) + Number(children || 0),
    [adults, children]
  );

  const [tableTypeId, setTableTypeId] = useState(qpTableTypeId);

  // auto pick tableType if not specified
  useEffect(() => {
    if (tableTypeId) return;
    const best = pickBestTableType(tableTypes, people);
    if (best?.id) setTableTypeId(best.id);
  }, [tableTypes, people, tableTypeId]);

  const tableType = useMemo(
    () => tableTypes.find((t) => t.id === tableTypeId) || null,
    [tableTypes, tableTypeId]
  );

  const depositPerTable = useMemo(() => Number(tableType?.depositPrice || 0), [tableType]);

  const holdMinutes = useMemo(() => {
    const byType = tableType?.holdMinutes;
    if (byType != null) return Number(byType);
    const byRes = restaurant?.holdMinutes;
    return byRes != null ? Number(byRes) : null;
  }, [tableType?.holdMinutes, restaurant?.holdMinutes]);

  const handleDateTimeChange = useCallback(
    ({ date: d, time: t }) => {
      if (d) {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        setDate(x);
      }
      if (t != null) setTime(normalizeTimeHHmm(t) || "");
    },
    [setDate, setTime]
  );

  //  availability check 
  useEffect(() => {
    if (!restaurant?.id || !tableTypeId || !date || !time) return;

    dispatch(
      fetchRestaurantAvailability({
        restaurantId: restaurant.id,
        tableTypeId,
        reservationDate: fmtDate(date),
        reservationTime: time,
        tables: tablesCount,
        // durationMinutes: ... (tuỳ bạn)
      })
    );
  }, [dispatch, restaurant?.id, tableTypeId, date, time, tablesCount]);

  const remainingText = useMemo(() => {
    if (availability?.loading) return t("booking.checking_table_availability");
    if (availability?.error) return availability.error;
    const rem = availability?.data?.remainingTablesMin;
    if (rem == null) return t("booking.checking_table_availability");
    if (rem <= 0) return t("booking.no_tables_left");
    return t("booking.tables_remaining", { count: rem });
  }, [availability?.loading, availability?.error, availability?.data, t]);

  const isEnough = availability?.data?.isEnough ?? true;
  const DEFAULT_DURATION_MINUTES = 90;

  //  thời điểm đặt (date + time) & cờ "đã ở quá khứ"
  // /availability KHÔNG validate lead-time nên có thể báo "còn bàn" cho 1 URL cũ
  // (ví dụ link sinh hôm qua) -> chặn sớm ở client để tránh 409 khó hiểu.
  const reservationAt = useMemo(() => {
    if (!date || !time) return null;
    const m = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (!m) return null;
    const dt = new Date(date);
    dt.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }, [date, time]);

  const isPastDateTime = useMemo(() => {
    if (!reservationAt) return false;
    return reservationAt.getTime() <= Date.now();
  }, [reservationAt]);

  //  pay
  const onPay = useCallback(async () => {
    if (!restaurant || !tableTypeId || !date || !time) return;

    // Chặn sớm thời điểm đặt đã ở quá khứ (thường do mở lại link cũ).
    if (isPastDateTime) {
      showError(t("booking.error_reservation_in_past"));
      return;
    }

    // Validate contact fields (mirrors hotel hook rules) before paying.
    const name = (contactName || "").trim();
    const phone = (contactPhone || "").trim();
    const email = (contactEmail || "").trim();
    const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      showError(t("booking.error_name_required"));
      return;
    }
    if (!nameRegex.test(name)) {
      showError(t("booking.error_name_letters_only"));
      return;
    }
    if (!phone) {
      showError(t("booking.error_phone_required"));
      return;
    }
    if (!/^\d+$/.test(phone)) {
      showError(t("booking.error_phone_digits_only"));
      return;
    }
    if (phone.length !== 10) {
      showError(t("booking.error_phone_exact_10"));
      return;
    }
    if (!emailRegex.test(email)) {
      showError(t("booking.error_email_invalid"));
      return;
    }

    // optional: chặn sớm để khỏi “Uncaught”
    if (!tableTypeId) throw new Error(t("booking.no_table_type_selected"));
    if (!tablesCount || tablesCount <= 0) throw new Error(t("booking.invalid_table_count"));

    const payload = {
      userId, // null nếu guest

      contactName,
      contactPhone,
      contactEmail,
      note,

      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,

      reservationDate: fmtDate(date),       // YYYY-MM-DD
      reservationTime: time,                // HH:mm
      durationMinutes: DEFAULT_DURATION_MINUTES,
      people,                               // adults+children

      //  BE cần tables[]
      tables: [
        {
          tableTypeId,
          tableTypeName: tableType?.name,
          seats: Number(tableType?.seats || 0),
          quantity: Number(tablesCount || 1),
          depositPrice: BigDecimalFix(Number(tableType?.depositPrice || 0)), // hoặc cứ Number
        },
      ],
    };

    try {
      const res = await dispatch(createRestaurantPayment(payload)).unwrap();
      const url = res?.paymentUrl || res?.payUrl;
      if (url) window.location.href = url;
    } catch (e) {
      // unwrap() của rejectWithValue(message) ném ra CHUỖI string, không phải Error
      // -> e?.message luôn undefined. Phải lấy trực tiếp chuỗi để hiện lý do thật
      // (vd "Phải đặt trước tối thiểu 60 phút", "Hết bàn ...").
      const msg = typeof e === "string" ? e : (e?.message || e?.error);
      showError(msg || t("booking.create_payment_failed"));
    }
  }, [
    dispatch, restaurant, tableTypeId, date, time, people, tablesCount, isPastDateTime,
    userId, contactName, contactPhone, contactEmail, note, tableType?.name, tableType?.seats, tableType?.depositPrice, t
  ]);

  // helper nếu bạn sợ float
  function BigDecimalFix(n) {
    const x = Number(n || 0);
    return Math.round(x); // VND
  }

  const restaurantName = restaurant?.name || restaurantSlug || t("booking.your_restaurant");

    const seatsPerTable = useMemo(
    () => Number(tableType?.seats || 0),
    [tableType?.seats]
  );

  const minTables = useMemo(() => {
    if (!tableTypeId) return 1;
    return calcMinTables(people, seatsPerTable);
  }, [people, seatsPerTable, tableTypeId]);

  //  AUTO-INCREASE: chỉ chạy khi people/seats đổi (KHÔNG phụ thuộc tablesCount)
  useEffect(() => {
    if (!tableTypeId) return;
    if (!seatsPerTable || seatsPerTable <= 0) return;

    setTablesCount((prev) => {
      const cur = Math.max(1, Number(prev || 1));
      return cur < minTables ? minTables : cur; // chỉ tăng, không tự giảm
    });
  }, [minTables, seatsPerTable, tableTypeId]);

  const totalSeats = useMemo(() => {
    const n = Math.max(1, Number(tablesCount || 1));
    const s = Number(seatsPerTable || 0);
    return s > 0 ? n * s : 0;
  }, [tablesCount, seatsPerTable]);

  const isSeatEnough = useMemo(() => {
    if (!tableTypeId) return false; // chưa chọn loại bàn thì chưa cho pay
    if (!seatsPerTable || seatsPerTable <= 0) return true; // thiếu dữ liệu seats thì đừng block
    return totalSeats >= people;
  }, [tableTypeId, seatsPerTable, totalSeats, people]);

  const seatErrorText = useMemo(() => {
    if (!tableTypeId) return "";
    if (!seatsPerTable || seatsPerTable <= 0) return "";
    if (totalSeats >= people) return "";
    return t("booking.not_enough_seats_detail", { people, tables: tablesCount, seats: totalSeats });
  }, [tableTypeId, seatsPerTable, totalSeats, people, tablesCount, t]);

  return {
    loading,
    restaurantName,
    restaurantSlug,

    // inputs
    adults,
    children,
    date,
    time,

    tableTypes,
    tableTypeId,
    tableType,
    tablesCount,

    // availability
    remainingText,
    isEnough,

    // contact
    contactName,
    contactPhone,
    contactEmail,
    note,

    // handlers inputs
    onAdultsChange: setAdults,
    onChildrenChange: setChildren,
    onDateTimeChange: handleDateTimeChange,
    onTableTypeChange: setTableTypeId,
    onTablesCountChange: setTablesCount,

    // handlers contact (FIX: để Form nhập được)
    onContactNameChange: setContactName,
    onContactPhoneChange: setContactPhone,
    onContactEmailChange: setContactEmail,
    onNoteChange: setNote,

    openingHours,

    // pay
    depositPerTable,
    holdMinutes,
    onPay,
    payLoading: payment?.loading,
    payError: payment?.error,

    people,
    seatsPerTable,
    minTables,
    totalSeats,
    isSeatEnough,
    seatErrorText,
    isPastDateTime,
  };
}