// src/features/partner/hooks/usePartnerBookingManager.js
import { useEffect, useMemo, useState } from "react";
import { usePartnerBookings } from "./usePartnerBookings";
import {
  STATUS_TABS,
  TYPE_OPTIONS,
  pickCreatedAt,
  pickCode,
  pickCustomer,
  pickService,
  pickBookingStatus,
  pickUsedStart,
  isFuture,
  CANCELLED_SET,

  //  ADD
  isUsedTimePassed,
  isConfirmedLike,
} from "../utils/partnerBookingUtils";

export function usePartnerBookingManager() {
  const [tab, setTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [detailModal, setDetailModal] = useState({
    open: false,
    type: null,
    code: null,
    seed: null,
  });

  const [cancelModal, setCancelModal] = useState({
    open: false,
    type: null,
    code: null,
    serviceName: "",
    reason: "",
  });

  const {
    hotelBookings,
    restaurantBookings,
    detail,
    action,
    fetchHotels,
    fetchRestaurants,
    fetchDetail,
    cancel,
    clearDetail,
  } = usePartnerBookings();

  // ===== Fetch list theo filter =====
  useEffect(() => {
    //  COMPLETED là tab suy ra từ thời gian => không gửi status=COMPLETED lên BE
    //  CONFIRMED cũng có thể bao gồm PAID => tốt nhất fetch rộng rồi FE tự filter
    const shouldFetchAllStatus = tab === "all" || tab === "COMPLETED" || tab === "CONFIRMED";
    const status = shouldFetchAllStatus ? undefined : tab;

    const common = { status, page: 0, size: 50 };

    if (typeFilter === "HOTEL") return void fetchHotels(common);
    if (typeFilter === "RESTAURANT") return void fetchRestaurants(common);

    fetchHotels(common);
    fetchRestaurants(common);
  }, [tab, typeFilter, fetchHotels, fetchRestaurants]);

  const loadingList =
    typeFilter === "HOTEL"
      ? !!hotelBookings.loading
      : typeFilter === "RESTAURANT"
      ? !!restaurantBookings.loading
      : !!hotelBookings.loading || !!restaurantBookings.loading;

  const listError =
    typeFilter === "HOTEL"
      ? hotelBookings.error
      : typeFilter === "RESTAURANT"
      ? restaurantBookings.error
      : hotelBookings.error || restaurantBookings.error;

  // ===== Merge + Search + TAB filter =====
  const filtered = useMemo(() => {
    const hotels = (hotelBookings.items || []).map((x) => ({ ...x, __type: "HOTEL" }));
    const restaurants = (restaurantBookings.items || []).map((x) => ({ ...x, __type: "RESTAURANT" }));

    let list =
      typeFilter === "HOTEL"
        ? hotels
        : typeFilter === "RESTAURANT"
        ? restaurants
        : [...hotels, ...restaurants];

    // newest first
    list = list.sort((a, b) => {
      const ta = new Date(pickCreatedAt(a) || 0).getTime();
      const tb = new Date(pickCreatedAt(b) || 0).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });

    //  TAB filter (COMPLETED/CONFIRMED là derived)
    if (tab !== "all") {
      if (tab === "COMPLETED") {
        //  Hoàn tất: đã xác nhận (CONFIRMED/PAID) + đã qua thời gian sử dụng
        list = list.filter((b) => isConfirmedLike(b) && isUsedTimePassed(b));
      } else if (tab === "CONFIRMED") {
        //  Đã xác nhận: CONFIRMED/PAID + CHƯA qua thời gian sử dụng
        list = list.filter((b) => isConfirmedLike(b) && !isUsedTimePassed(b));
      } else {
        // các tab khác giữ theo status thật từ BE
        list = list.filter((b) => String(pickBookingStatus(b) || "") === tab);
      }
    }

    // search filter
    const kw = search.trim().toLowerCase();
    if (!kw) return list;

    return list.filter((b) => {
      const code = String(pickCode(b) || "").toLowerCase();
      const customer = pickCustomer(b);
      const service = pickService(b);
      const name = String(customer?.name || "").toLowerCase();
      const svName = String(service?.name || "").toLowerCase();
      return code.includes(kw) || name.includes(kw) || svName.includes(kw);
    });
  }, [hotelBookings.items, restaurantBookings.items, typeFilter, search, tab]);

  //  Bonus: không cho hủy nếu đã qua thời gian sử dụng
  const canCancel = (b) => {
    if (!b) return false;
    const type = b?.__type;
    const st = String(pickBookingStatus(b) || "");

    if (CANCELLED_SET.has(st)) return false;

    //  đã qua thời gian sử dụng => không cho hủy
    if (isUsedTimePassed(b)) return false;

    // chỉ hủy khi chưa tới thời điểm bắt đầu dịch vụ
    return isFuture(pickUsedStart(b, type));
  };

  const openDetail = (b) => {
    const type = b?.__type;
    const code = pickCode(b);
    setDetailModal({ open: true, type, code, seed: b });
    fetchDetail({ type, code });
  };

  const closeDetail = () => {
    setDetailModal({ open: false, type: null, code: null, seed: null });
    clearDetail();
  };

  const openCancel = (b) => {
    const type = b?.__type;
    const code = pickCode(b);
    const service = pickService(b);
    setCancelModal({
      open: true,
      type,
      code,
      serviceName: service?.name || "",
      reason: "",
    });
  };

  const closeCancel = () => {
    setCancelModal({ open: false, type: null, code: null, serviceName: "", reason: "" });
  };

  const onCancelSubmit = async () => {
    const { type, code, reason } = cancelModal;
    if (!type || !code) return;

    try {
      const res = await cancel({ type, code, reason });
      if (res?.meta?.requestStatus === "fulfilled") {
        //  giống logic fetch ở useEffect: nếu tab là COMPLETED/CONFIRMED thì status undefined
        const shouldFetchAllStatus = tab === "all" || tab === "COMPLETED" || tab === "CONFIRMED";
        const status = shouldFetchAllStatus ? undefined : tab;

        const common = { status, page: 0, size: 50 };

        if (typeFilter === "HOTEL") fetchHotels(common);
        else if (typeFilter === "RESTAURANT") fetchRestaurants(common);
        else {
          fetchHotels(common);
          fetchRestaurants(common);
        }

        closeCancel();
        closeDetail();
      }
    } catch {
      // error đã nằm trong action.error
    }
  };

  const detailData = detail?.data || detailModal.seed;
  const detailType = detailModal.type || detailModal.seed?.__type;

  return {
    // options
    STATUS_TABS,
    TYPE_OPTIONS,

    // filters
    tab,
    setTab,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,

    // list
    loadingList,
    listError,
    filtered,

    // modals + actions
    detailModal,
    detailData,
    detailType,
    cancelModal,
    action,
    detail,

    canCancel,
    openDetail,
    closeDetail,
    openCancel,
    closeCancel,
    setCancelModal,
    onCancelSubmit,
  };
}