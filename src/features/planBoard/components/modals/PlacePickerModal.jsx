"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  FaTimes,
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaChevronRight,
} from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCatalogPlaces } from "../../../../features/catalog/hooks/useCatalogPlaces";
import { useCatalogHotels } from "../../../../features/catalog/hooks/useCatalogHotels";
import { useCatalogRestaurants } from "../../../../features/catalog/hooks/useCatalogRestaurants";
import {
  suggestGeoLocationsThunk,
  clearGeoSuggest,
} from "../../../../features/catalog/slices/catalogSlice";

const TABS = [
  { key: "HOTEL", labelKey: "plan.place_picker.tab_hotel" },
  { key: "PLACE", labelKey: "plan.place_picker.tab_place" },
  { key: "RESTAURANT", labelKey: "plan.place_picker.tab_restaurant" },
];

const DEFAULT_CENTER = { lat: 16.047079, lon: 108.20623 };
const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb2108a?w=800&q=80&auto=format&fit=crop";

// key chung cho mọi loại item (hotel/place/restaurant), tránh phụ thuộc chỉ id/slug
const getItemKey = (item) =>
  item?.id ??
  item?.slug ??
  item?.code ??
  item?.placeId ??
  item?.hotelId ??
  item?.restaurantId ??
  item?.name ??
  null;

// chuẩn hoá tên để so khớp (bỏ hoa/thường + khoảng trắng thừa)
const normalizeName = (s) =>
  (s ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ");

// item trong list có khớp với location đã chọn trước đó không (theo id/slug HOẶC tên).
// AI lưu id dạng slug còn list lại key theo id số → phải khớp cả hai, kèm fallback theo tên.
const matchesInitialFocus = (item, focus) => {
  if (!item || !focus) return false;
  const ids = [
    item.id,
    item.slug,
    item.code,
    item.placeId,
    item.hotelId,
    item.restaurantId,
  ]
    .filter((v) => v != null)
    .map(String);
  if (focus.id != null && ids.includes(String(focus.id))) return true;
  if (focus.name && normalizeName(item.name) === normalizeName(focus.name)) {
    return true;
  }
  return false;
};

export default function PlacePickerModal({
  open,
  onClose,
  onSelect,
  initialTab = "HOTEL",
  activityType = "TRANSPORT",
  field, // 'from' | 'to' | 'stay' | 'other'...
  anchorPoint, // { lat, lng, label? }
  initialLocation, // payload đã chọn trước đó (api/custom)
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listRef = useRef(null);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [initializedFromInitial, setInitializedFromInitial] = useState(false);
  const [hasSelectionSource, setHasSelectionSource] = useState(false);
  const [initialLatLon, setInitialLatLon] = useState(null);
  // chỉ đồng bộ selectedId về dòng khớp initialLocation MỘT LẦN lúc mở; sau đó để user tự chọn
  const [reconciledInitial, setReconciledInitial] = useState(false);
  // chỉ tự seed ô tìm kiếm theo tên địa điểm đã chọn MỘT LẦN (khi list mặc định không có nó)
  const [seededInitialQuery, setSeededInitialQuery] = useState(false);

  const [customMode, setCustomMode] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [debouncedCustomAddress, setDebouncedCustomAddress] = useState("");

  const {
    items: hotelItems,
    loading: hotelsLoading,
    error: hotelsError,
    fetchPlaces: UNUSED_HOTEL_PLACES,
    fetchHotels,
  } = useCatalogHotels();

  const {
    items: placeItems,
    loading: placesLoading,
    error: placesError,
    fetchPlaces,
  } = useCatalogPlaces();

  const {
    items: restaurantItems,
    loading: restaurantsLoading,
    error: restaurantsError,
    fetchRestaurants,
  } = useCatalogRestaurants();

  const isLoading =
    activeTab === "HOTEL"
      ? hotelsLoading
      : activeTab === "PLACE"
      ? placesLoading
      : restaurantsLoading;

  const error =
    activeTab === "HOTEL"
      ? hotelsError
      : activeTab === "PLACE"
      ? placesError
      : restaurantsError;

  // suggest vị trí tự nhập
  const geoSuggestState = useSelector((s) => s.catalog.geoSuggest);
  const suggestItems = geoSuggestState?.items || [];
  const suggestLoading = geoSuggestState?.loading;

  // reset khi mở/đóng
  useEffect(() => {
    if (!open) {
      // đóng modal → chuẩn bị cho lần mở tiếp theo
      setInitializedFromInitial(false);
      setHasSelectionSource(false);
      setInitialLatLon(null);

      return;
    }

    // mở modal → reset input
    setActiveTab(initialTab);
    setQuery("");
    setDebouncedQuery("");
    setSelectedId(null);
    setReconciledInitial(false);
    setSeededInitialQuery(false);

    setCustomMode(false);
    setCustomLabel("");
    setCustomAddress("");
    setCustomLat("");
    setCustomLng("");
    setDebouncedCustomAddress("");
    dispatch(clearGeoSuggest());
  }, [open, initialTab, dispatch]);

  // debounce query cho list HOTEL/PLACE/RESTAURANT
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // debounce cho ô địa chỉ custom (dùng để call geo suggest)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCustomAddress(customAddress.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [customAddress]);

  // gọi API search list theo tab + debouncedQuery khi mở (HOTEL / PLACE / RESTAURANT)
  useEffect(() => {
    if (!open) return;

    if (activeTab === "HOTEL") {
      fetchHotels({
        page: 0,
        size: 10,
        location: debouncedQuery || undefined,
      });
    } else if (activeTab === "PLACE") {
      fetchPlaces({
        page: 0,
        size: 10,
        q: debouncedQuery || undefined,
      });
    } else if (activeTab === "RESTAURANT") {
      fetchRestaurants({
        page: 0,
        size: 10,
        q: debouncedQuery || undefined,
      });
    }
  }, [
    open,
    activeTab,
    debouncedQuery,
    fetchHotels,
    fetchPlaces,
    fetchRestaurants,
  ]);

  // gọi API geoSuggest khi đang ở customMode (nhập vị trí tự do)
  useEffect(() => {
    if (!open || !customMode) return;
    if (!debouncedCustomAddress || debouncedCustomAddress.length < 3) {
      dispatch(clearGeoSuggest());
      return;
    }
    dispatch(
      suggestGeoLocationsThunk({ q: debouncedCustomAddress, limit: 6 })
    );
  }, [open, customMode, debouncedCustomAddress, dispatch]);

  // ÁP DỤNG initialLocation khi mở lại modal
  useEffect(() => {
    if (!open) return;
    if (!initialLocation || initializedFromInitial) return;

    // toạ độ cũ
    if (initialLocation.lat != null && initialLocation.lng != null) {
      setInitialLatLon({
        lat: initialLocation.lat,
        lon: initialLocation.lng,
      });
    }

    if (initialLocation.type === "CUSTOM") {
      // bật custom mode + đổ dữ liệu
      setCustomMode(true);
      setCustomLabel(initialLocation.label || initialLocation.name || "");
      setCustomAddress(
        initialLocation.address || initialLocation.fullAddress || ""
      );
      setCustomLat(
        initialLocation.lat != null ? String(initialLocation.lat) : ""
      );
      setCustomLng(
        initialLocation.lng != null ? String(initialLocation.lng) : ""
      );
      setInitializedFromInitial(true);
      setHasSelectionSource(true);
      return;
    }

    // HOTEL / PLACE / RESTAURANT từ catalog
    const tab =
      initialLocation.type === "HOTEL"
        ? "HOTEL"
        : initialLocation.type === "PLACE"
        ? "PLACE"
        : initialLocation.type === "RESTAURANT"
        ? "RESTAURANT"
        : initialTab;
    setActiveTab(tab);
    setCustomMode(false);

    const idFromInitial =
      initialLocation.id ??
      initialLocation.placeId ??
      initialLocation.raw?.id ??
      initialLocation.raw?.slug ??
      null;
    const nameFromInitial =
      initialLocation.name || initialLocation.label || "";

    if (idFromInitial) setSelectedId(idFromInitial);
    // có id HAY chỉ có tên đều coi là đã có nguồn chọn → không để auto-chọn item đầu đè lên
    if (idFromInitial || nameFromInitial) setHasSelectionSource(true);

    setInitializedFromInitial(true);
  }, [open, initialLocation, initializedFromInitial, initialTab]);

  // header title / subtitle
  const headerTitle = useMemo(() => {
    if (activityType === "TRANSPORT") {
      if (field === "from") return t("plan.place_picker.title_from");
      if (field === "to") return t("plan.place_picker.title_to");
      return t("plan.place_picker.title_transport");
    }
    if (activityType === "STAY") return t("plan.place_picker.title_stay");
    if (activityType === "FOOD") return t("plan.place_picker.title_food");
    return t("plan.place_picker.title_default");
  }, [activityType, field, t]);

  const headerSubtitle = useMemo(() => {
    if (activityType === "TRANSPORT") {
      if (field === "from")
        return t("plan.place_picker.subtitle_from");
      if (field === "to")
        return t("plan.place_picker.subtitle_to");
      return t("plan.place_picker.subtitle_transport");
    }
    if (activityType === "STAY")
      return t("plan.place_picker.subtitle_stay");
    if (activityType === "FOOD")
      return t("plan.place_picker.subtitle_food");
    return t("plan.place_picker.subtitle_default");
  }, [activityType, field, t]);

  // base list theo tab
  const baseItems = useMemo(() => {
    if (activeTab === "HOTEL") return hotelItems || [];
    if (activeTab === "PLACE") return placeItems || [];
    return restaurantItems || []; // RESTAURANT
  }, [activeTab, hotelItems, placeItems, restaurantItems]);

  // filter FE
  const effectiveItems = useMemo(() => {
    if (!debouncedQuery) return baseItems;
    const q = debouncedQuery.toLowerCase();
    return baseItems.filter((x) => {
      const name = (x.name || "").toLowerCase();
      const addr = (
        x.addressLine ||
        x.fullAddress ||
        x.address ||
        ""
      ).toLowerCase();
      const city = (x.cityName || "").toLowerCase();
      const prov = (x.provinceName || "").toLowerCase();
      return (
        name.includes(q) || addr.includes(q) || city.includes(q) || prov.includes(q)
      );
    });
  }, [baseItems, debouncedQuery]);

  // auto chọn item đầu (khi không ở customMode và chưa có nguồn selection)
  useEffect(() => {
    if (!open || customMode || hasSelectionSource) return;

    if (!effectiveItems.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId) {
      setSelectedId(getItemKey(effectiveItems[0]));
      return;
    }
    const stillExists = effectiveItems.some(
      (x) => getItemKey(x) === selectedId
    );
    if (!stillExists) {
      setSelectedId(getItemKey(effectiveItems[0]));
    }
  }, [open, effectiveItems, selectedId, customMode, hasSelectionSource]);

  // location catalog đã chọn trước đó (id/slug + tên) — để pre-select + cuộn tới đúng dòng
  const initialFocus = useMemo(() => {
    if (!initialLocation || initialLocation.type === "CUSTOM") return null;
    const id =
      initialLocation.id ??
      initialLocation.placeId ??
      initialLocation.raw?.id ??
      initialLocation.raw?.slug ??
      null;
    const name = initialLocation.name || initialLocation.label || "";
    if (id == null && !name) return null;
    return { id, name };
  }, [initialLocation]);

  // Nếu list MẶC ĐỊNH (chưa gõ từ khoá) KHÔNG chứa địa điểm đã chọn → tự seed ô tìm kiếm
  // bằng tên để catalog trả về nó (địa điểm AI gợi ý thường không nằm trong top mặc định).
  // Chỉ seed khi cần: card tự bấm có sẵn trong list thì giữ nguyên list đầy đủ như cũ.
  useEffect(() => {
    if (!open || customMode || !initialFocus) return;
    if (seededInitialQuery || reconciledInitial) return;
    if (isLoading || debouncedQuery) return; // đã có từ khoá hoặc đang tải → bỏ qua
    if (!initialFocus.name) return; // không có tên để search

    const present = effectiveItems.some((x) =>
      matchesInitialFocus(x, initialFocus)
    );
    if (present) return; // đã nằm trong list mặc định → reconcile sẽ cuộn tới, khỏi search

    setQuery(initialFocus.name);
    setDebouncedQuery(initialFocus.name);
    setSeededInitialQuery(true);
  }, [
    open,
    customMode,
    initialFocus,
    seededInitialQuery,
    reconciledInitial,
    isLoading,
    debouncedQuery,
    effectiveItems,
  ]);

  // Khi mở lại với location đã chọn: sau khi list load xong, đồng bộ selectedId về ĐÚNG
  // key của item trong list (khớp id/slug HOẶC tên). Cần thiết vì AI lưu id dạng slug và
  // địa điểm thường không nằm trong list mặc định → nếu không reconcile sẽ không cuộn được
  // và preview/map hiển thị sai (rơi về item đầu danh sách).
  useEffect(() => {
    if (!open || customMode || !initialFocus || reconciledInitial) return;
    if (isLoading || !effectiveItems.length) return;

    const match = effectiveItems.find((x) => matchesInitialFocus(x, initialFocus));
    if (!match) return;

    const key = getItemKey(match);
    if (key && key !== selectedId) setSelectedId(key);
    setReconciledInitial(true); // chốt 1 lần — không đè lên lựa chọn người dùng bấm sau đó
  }, [
    open,
    customMode,
    initialFocus,
    effectiveItems,
    isLoading,
    selectedId,
    reconciledInitial,
  ]);

  const selectedItem = useMemo(() => {
    if (customMode) return null;
    if (!effectiveItems.length) return null;
    if (!selectedId) return effectiveItems[0];
    return (
      effectiveItems.find((x) => getItemKey(x) === selectedId) ||
      effectiveItems[0]
    );
  }, [effectiveItems, selectedId, customMode]);

  // scroll to selected item khi mở modal
  useEffect(() => {
    if (!open || customMode || !listRef.current || !selectedId) return;
    if (isLoading) return; // đợi load xong

    // chờ 1 frame để DOM render đầy đủ rồi mới query
    requestAnimationFrame(() => {
      const container = listRef.current;
      const el = container.querySelector(
        `[data-picker-item-id="${selectedId}"]`
      );

      if (el) {
        el.scrollIntoView({
          block: "center",
          behavior: initializedFromInitial ? "auto" : "smooth",
        });
      }
    });
  }, [
    open,
    customMode,
    selectedId,
    activeTab,
    initializedFromInitial,
    isLoading,
    effectiveItems.length,
  ]);

  // toạ độ cho map
  const selectedLatLon = useMemo(() => {
    if (customMode && customLat && customLng) {
      const lat = parseFloat(customLat);
      const lng = parseFloat(customLng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lon: lng };
      }
    }

    if (
      selectedItem &&
      selectedItem.latitude != null &&
      selectedItem.longitude != null
    ) {
      return { lat: selectedItem.latitude, lon: selectedItem.longitude };
    }

    if (initialLatLon) {
      return initialLatLon;
    }

    if (anchorPoint && anchorPoint.lat != null && anchorPoint.lng != null) {
      return { lat: anchorPoint.lat, lon: anchorPoint.lng };
    }
    return DEFAULT_CENTER;
  }, [selectedItem, anchorPoint, customMode, customLat, customLng, initialLatLon]);

  const buildLocationPayloadFromApiItem = (item) => {
    if (!item) return null;

    const lat =
      item.latitude != null
        ? item.latitude
        : anchorPoint?.lat != null
        ? anchorPoint.lat
        : null;
    const lng =
      item.longitude != null
        ? item.longitude
        : anchorPoint?.lng != null
        ? anchorPoint.lng
        : null;

    const address =
      item.addressLine || item.fullAddress || item.address || null;

    const payload = {
      activityType,
      field,

      type: activeTab, // HOTEL / PLACE / RESTAURANT
      id:
        item.id ??
        item.slug ??
        item.code ??
        item.placeId ??
        item.hotelId ??
        item.restaurantId ??
        null,

      label: item.name,
      name: item.name,
      address,
      fullAddress: address,
      cityName: item.cityName || null,
      districtName: item.districtName || null,
      provinceName: item.provinceName || item.cityName || null,

      lat,
      lng,

      hotelMeta:
        activeTab === "HOTEL"
          ? {
              avgRating: item.avgRating ?? item.reviewScore ?? null,
              ratingLabel: item.ratingLabel ?? item.reviewLabel ?? null,
              reviewsCount: item.reviewsCount ?? item.reviewCount ?? null,
              minNightlyPrice:
                item.minNightlyPrice ??
                item.lowestPrice ??
                item.priceFrom ??
                null,
              referenceNightlyPrice:
                item.referenceNightlyPrice ?? item.originalPrice ?? null,
              currencyCode: item.currencyCode ?? item.currency ?? null,
              highlightTags: item.highlightTags ?? item.tags ?? [],
            }
          : null,

      placeMeta:
        activeTab === "PLACE" || activeTab === "RESTAURANT"
          ? {
              avgRating: item.avgRating ?? item.rating ?? null,
              reviewsCount: item.reviewsCount ?? item.reviewCount ?? null,
              tags: item.tags ?? [],
            }
          : null,

      coverImageUrl:
        item.coverImageUrl || item.thumbnailUrl || item.imageUrl || null,

      raw: item,
    };

    return payload;
  };

  // payload cho vị trí custom
  const buildLocationPayloadFromCustom = () => {
    const label = customLabel.trim() || customAddress.trim() || t("plan.place_picker.custom_default_label");
    const address = customAddress.trim() || null;

    let lat = null;
    let lng = null;

    if (customLat && customLng) {
      const parsedLat = parseFloat(customLat);
      const parsedLng = parseFloat(customLng);
      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
        lat = parsedLat;
        lng = parsedLng;
      }
    }

    if (lat == null && anchorPoint?.lat != null) lat = anchorPoint.lat;
    if (lng == null && anchorPoint?.lng != null) lng = anchorPoint.lng;

    return {
      activityType,
      field,
      type: "CUSTOM",

      id: null,
      label,
      name: label,
      address,
      fullAddress: address,

      cityName: null,
      districtName: null,
      provinceName: null,

      lat,
      lng,

      hotelMeta: null,
      placeMeta: null,
      coverImageUrl: null,
      raw: {
        custom: true,
        label,
        address,
        lat,
        lng,
      },
    };
  };

  const customValid =
    customLabel.trim().length > 0 || customAddress.trim().length > 0;

  // tóm tắt hotel
  const hotelSummary = useMemo(() => {
    if (!selectedItem || activeTab !== "HOTEL" || customMode) return "";
    const parts = [];

    const avg = selectedItem.avgRating ?? selectedItem.reviewScore ?? null;
    const label = selectedItem.ratingLabel ?? selectedItem.reviewLabel ?? "";
    const count =
      selectedItem.reviewsCount ?? selectedItem.reviewCount ?? null;

    if (avg) {
      const score = avg.toFixed ? avg.toFixed(1) : avg;
      parts.push(
        t("plan.place_picker.hotel_summary_rating", {
          score,
          label: label ? ` - ${label}` : "",
          count: count
            ? t("plan.place_picker.hotel_summary_reviews", {
                count: Number(count).toLocaleString("vi-VN"),
              })
            : "",
        })
      );
    }

    const locBits = [selectedItem.districtName, selectedItem.cityName].filter(
      Boolean
    );
    if (locBits.length) {
      parts.push(
        t("plan.place_picker.hotel_summary_location", {
          location: locBits.join(", "),
        })
      );
    }

    const tags = selectedItem.highlightTags || selectedItem.tags || [];
    if (tags.length) {
      parts.push(
        t("plan.place_picker.hotel_summary_tags", {
          tags: tags.slice(0, 3).join(", ").toLowerCase(),
        })
      );
    }

    const minPrice =
      selectedItem.minNightlyPrice ??
      selectedItem.lowestPrice ??
      selectedItem.priceFrom ??
      null;
    const currency = selectedItem.currencyCode ?? selectedItem.currency ?? "VND";

    if (minPrice) {
      parts.push(
        t("plan.place_picker.hotel_summary_price", {
          price: Number(minPrice).toLocaleString("vi-VN"),
          currency,
        })
      );
    }

    if (!parts.length) return "";
    return parts.join(". ") + ".";
  }, [selectedItem, activeTab, customMode, t]);

  // tóm tắt place
  const placeSummary = useMemo(() => {
    if (!selectedItem || activeTab !== "PLACE" || customMode) return "";
    const parts = [];

    const avg = selectedItem.avgRating ?? selectedItem.rating ?? null;
    const count =
      selectedItem.reviewsCount ?? selectedItem.reviewCount ?? null;

    if (avg) {
      parts.push(
        t("plan.place_picker.place_summary_rating", {
          avg: avg.toFixed ? avg.toFixed(1) : avg,
          count: count
            ? Number(count).toLocaleString("vi-VN")
            : t("plan.place_picker.summary_many"),
        })
      );
    }

    if (selectedItem.provinceName) {
      parts.push(
        t("plan.place_picker.place_summary_location", {
          location: selectedItem.provinceName,
        })
      );
    }

    const tags = selectedItem.tags || [];
    if (tags.length) {
      parts.push(
        t("plan.place_picker.place_summary_tags", {
          tags: tags.slice(0, 3).join(", ").toLowerCase(),
        })
      );
    }

    parts.push(t("plan.place_picker.place_summary_footer"));

    return parts.join(". ");
  }, [selectedItem, activeTab, customMode, t]);

  // tóm tắt restaurant
  const restaurantSummary = useMemo(() => {
    if (!selectedItem || activeTab !== "RESTAURANT" || customMode) return "";
    const parts = [];

    const avg = selectedItem.avgRating ?? selectedItem.rating ?? null;
    const count =
      selectedItem.reviewsCount ?? selectedItem.reviewCount ?? null;

    if (avg) {
      parts.push(
        t("plan.place_picker.restaurant_summary_rating", {
          avg: avg.toFixed ? avg.toFixed(1) : avg,
          count: count
            ? Number(count).toLocaleString("vi-VN")
            : t("plan.place_picker.summary_many"),
        })
      );
    }

    if (selectedItem.provinceName || selectedItem.cityName) {
      parts.push(
        t("plan.place_picker.restaurant_summary_location", {
          location: `${
            selectedItem.districtName
              ? `${selectedItem.districtName}, `
              : ""
          }${selectedItem.cityName || selectedItem.provinceName}`,
        })
      );
    }

    const tags = selectedItem.tags || [];
    if (tags.length) {
      parts.push(
        t("plan.place_picker.restaurant_summary_tags", {
          tags: tags.slice(0, 3).join(", ").toLowerCase(),
        })
      );
    }

    parts.push(t("plan.place_picker.restaurant_summary_footer"));

    return parts.join(". ");
  }, [selectedItem, activeTab, customMode, t]);

  const canSubmit = customMode ? customValid : !!selectedItem;

  const handleSubmit = () => {
    let payload = null;
    if (customMode) {
      if (!customValid) return;
      payload = buildLocationPayloadFromCustom();
    } else {
      if (!selectedItem) return;
      payload = buildLocationPayloadFromApiItem(selectedItem);
    }
    if (!payload) return;
    onSelect && onSelect(payload);
    onClose && onClose();
  };

  // nút xem chi tiết
  const canOpenDetail =
    !customMode &&
    selectedItem &&
    (selectedItem.slug ||
      selectedItem.id ||
      selectedItem.code ||
      selectedItem.placeId ||
      selectedItem.hotelId ||
      selectedItem.restaurantId);

  const handleOpenDetail = () => {
    if (!canOpenDetail || !selectedItem) return;

    const slugOrId =
      selectedItem.slug ||
      selectedItem.id ||
      selectedItem.code ||
      selectedItem.placeId ||
      selectedItem.hotelId ||
      selectedItem.restaurantId;

    if (!slugOrId) return;

    const url =
      activeTab === "HOTEL"
        ? `/hotels/${encodeURIComponent(slugOrId)}`
        : activeTab === "PLACE"
        ? `/place/${encodeURIComponent(slugOrId)}`
        : `/restaurants/${encodeURIComponent(slugOrId)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1300] flex items-center justify-center px-3 sm:px-6 bg-slate-950/55 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div onClick={onClose} className="absolute inset-0" />

          <motion.div
            className="relative z-[1301] w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white text-lg shadow-md shadow-sky-500/40">
                    <FiMapPin />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 truncate">
                      {headerTitle}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {headerSubtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-500 hover:text-white hover:bg-rose-500 shadow-md transition-all"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* TABS + custom toggle */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.key);
                        setSelectedId(null);
                        setCustomMode(false);
                        setHasSelectionSource(false);
                        dispatch(clearGeoSuggest());
                      }}
                      className={[
                        "px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1 transition",
                        activeTab === tab.key && !customMode
                          ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/40"
                          : "bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900",
                      ].join(" ")}
                    >
                      {tab.key === "HOTEL" && "🏨"}
                      {tab.key === "PLACE" && "📍"}
                      {tab.key === "RESTAURANT" && "🍽️"}
                      <span>{t(tab.labelKey)}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCustomMode((v) => {
                      const next = !v;
                      if (!next) {
                        // tắt custom mode → clear gợi ý google
                        dispatch(clearGeoSuggest());
                      }
                      return next;
                    })
                  }
                  className={[
                    "ml-1 px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1 transition",
                    customMode
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/40"
                      : "bg-white/80 dark:bg-slate-950/80 border-dashed border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50/70 dark:hover:bg-amber-900/30",
                  ].join(" ")}
                >
                  ✏️
                  <span>{t("plan.place_picker.custom_mode_btn")}</span>
                </button>

                <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {customMode
                    ? t("plan.place_picker.hint_custom")
                    : activeTab === "HOTEL"
                    ? t("plan.place_picker.hint_hotel")
                    : activeTab === "PLACE"
                    ? t("plan.place_picker.hint_place")
                    : t("plan.place_picker.hint_restaurant")}
                </span>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 flex flex-col md:flex-row min-h-[420px]">
              {/* LEFT */}
              <div className="w-full md:w-[40%] border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex flex-col">
                {/* SEARCH / CUSTOM FORM */}
                <div className="px-4 pt-3 pb-2 border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70">
                  {!customMode ? (
                    <>
                      <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 px-2.5 py-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                        <FaSearch className="text-slate-400" size={13} />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                          placeholder={
                            activeTab === "HOTEL"
                              ? t("plan.place_picker.search_placeholder_hotel")
                              : activeTab === "RESTAURANT"
                              ? t("plan.place_picker.search_placeholder_restaurant")
                              : t("plan.place_picker.search_placeholder_place")
                          }
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                        {t("plan.place_picker.search_hint")}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-200">
                          {t("plan.place_picker.label_name")}
                        </label>
                        <input
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                          placeholder={t("plan.place_picker.placeholder_name")}
                          className="mt-1 w-full rounded-xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700 px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-200">
                          {t("plan.place_picker.label_address")}
                        </label>
                        <textarea
                          rows={2}
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          placeholder={t("plan.place_picker.placeholder_address")}
                          className="mt-1 w-full rounded-xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700 px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-slate-50 placeholder:text-slate-400 resize-none"
                        />

                        {/* GỢI Ý ĐỊA CHỈ (GIỐNG GG MAP) — CHỈ KHI customMode = true */}
                        {!!debouncedCustomAddress && (
                          <div className="mt-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-md max-h-44 overflow-y-auto">
                            {suggestLoading && (
                              <div className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                                {t("plan.place_picker.suggest_loading")}
                              </div>
                            )}

                            {!suggestLoading && suggestItems.length === 0 && (
                              <div className="px-3 py-2 text-[11px] text-slate-400">
                                {t("plan.place_picker.suggest_empty")}
                              </div>
                            )}

                            {!suggestLoading &&
                              suggestItems.map((sugg) => (
                                <button
                                  key={
                                    getItemKey(sugg) ||
                                    `${sugg.name}-${sugg.addressLine}-${sugg.fullAddress}`
                                  }
                                  type="button"
                                  onClick={() => {
                                    const label =
                                      sugg.name ||
                                      sugg.label ||
                                      sugg.formattedAddress ||
                                      sugg.addressLine ||
                                      sugg.address ||
                                      "";
                                    const addr =
                                      sugg.fullAddress ||
                                      sugg.addressLine ||
                                      sugg.formattedAddress ||
                                      sugg.address ||
                                      "";
                                    const lat =
                                      sugg.latitude ??
                                      sugg.lat ??
                                      null;
                                    const lng =
                                      sugg.longitude ??
                                      sugg.lng ??
                                      sugg.lon ??
                                      null;

                                    setCustomMode(true);
                                    setCustomLabel(label);
                                    setCustomAddress(addr);
                                    setCustomLat(
                                      lat != null ? String(lat) : ""
                                    );
                                    setCustomLng(
                                      lng != null ? String(lng) : ""
                                    );
                                    setHasSelectionSource(true);
                                    dispatch(clearGeoSuggest());
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-sky-50 dark:hover:bg-sky-900/30 flex flex-col gap-0.5"
                                >
                                  <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100">
                                    {sugg.name || sugg.label}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {sugg.fullAddress ||
                                      sugg.addressLine ||
                                      sugg.formattedAddress ||
                                      sugg.address}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-200">
                            {t("plan.place_picker.label_lat")}{" "}
                            <span className="text-slate-400">(optional)</span>
                          </label>
                          <input
                            value={customLat}
                            onChange={(e) => setCustomLat(e.target.value)}
                            placeholder={t("plan.place_picker.placeholder_lat")}
                            className="mt-1 w-full rounded-xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700 px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-200">
                            {t("plan.place_picker.label_lng")}{" "}
                            <span className="text-slate-400">(optional)</span>
                          </label>
                          <input
                            value={customLng}
                            onChange={(e) => setCustomLng(e.target.value)}
                            placeholder={t("plan.place_picker.placeholder_lng")}
                            className="mt-1 w-full rounded-xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700 px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                        {t("plan.place_picker.coord_optional_hint")}
                      </p>
                    </div>
                  )}
                </div>

                {/* DANH SÁCH API */}
                {!customMode && (
                  <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
                  >
                    {isLoading && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-3">
                        {t("plan.place_picker.list_loading")}
                      </div>
                    )}

                    {!isLoading && error && (
                      <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 rounded-xl">
                        {error}
                      </div>
                    )}

                    {!isLoading &&
                      !error &&
                      effectiveItems.map((item) =>
                        activeTab === "HOTEL" ? (
                          <HotelListItem
                            key={getItemKey(item)}
                            hotel={item}
                            active={
                              !customMode &&
                              selectedId &&
                              selectedId === getItemKey(item)
                            }
                            onClick={() => {
                              setCustomMode(false);
                              setHasSelectionSource(true);
                              setSelectedId(getItemKey(item));
                            }}
                            dataId={getItemKey(item)}
                          />
                        ) : activeTab === "PLACE" ? (
                          <PlaceListItem
                            key={getItemKey(item)}
                            place={item}
                            active={
                              !customMode &&
                              selectedId &&
                              selectedId === getItemKey(item)
                            }
                            onClick={() => {
                              setCustomMode(false);
                              setHasSelectionSource(true);
                              setSelectedId(getItemKey(item));
                            }}
                            dataId={getItemKey(item)}
                          />
                        ) : (
                          <RestaurantListItem
                            key={getItemKey(item)}
                            restaurant={item}
                            active={
                              !customMode &&
                              selectedId &&
                              selectedId === getItemKey(item)
                            }
                            onClick={() => {
                              setCustomMode(false);
                              setHasSelectionSource(true);
                              setSelectedId(getItemKey(item));
                            }}
                            dataId={getItemKey(item)}
                          />
                        )
                      )}

                    {!isLoading && !error && !effectiveItems.length && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-dashed border-slate-200 dark:border-slate-700">
                        {t("plan.place_picker.list_empty")}
                      </div>
                    )}
                  </div>
                )}

                {customMode && (
                  <div className="flex-1 px-3 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="rounded-xl border border-dashed border-amber-300/70 bg-amber-50/60 dark:bg-amber-900/10 px-3 py-2">
                      <p>{t("plan.place_picker.custom_info_1")}</p>
                      <p className="mt-1">
                        {t("plan.place_picker.custom_info_2")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: map + preview */}
              <div className="flex-1 flex flex-col bg-white/95 dark:bg-slate-950/95">
                {/* MAP */}
                <div className="relative h-56 sm:h-64 bg-slate-100 dark:bg-slate-900">
                  {selectedLatLon ? (
                    <iframe
                      title="place-picker-map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        `${selectedLatLon.lat},${selectedLatLon.lon}`
                      )}&z=15&output=embed&hl=vi`}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                      <span>{t("plan.place_picker.map_no_coord")}</span>
                      <span className="mt-1">
                        {t("plan.place_picker.map_no_coord_hint")}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 max-w-xs sm:max-w-sm pointer-events-none">
                    <div className="px-3 py-1.5 rounded-full bg-slate-950/70 text-[11px] text-slate-50 flex items-center gap-2 shadow-md shadow-black/30">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                        <FiMapPin size={11} />
                      </span>
                      <span className="leading-snug">
                        {t("plan.place_picker.map_badge")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DETAIL PREVIEW */}
                <div className="flex-1 px-4 sm:px-5 py-3 overflow-y-auto">
                  {customMode ? (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {t("plan.place_picker.preview_custom_title")}
                      </h4>
                      <p>
                        <b>{t("plan.place_picker.preview_name")}</b>{" "}
                        {customLabel.trim() || (
                          <span className="text-slate-400">
                            {t("plan.place_picker.preview_name_empty")}
                          </span>
                        )}
                      </p>
                      <p>
                        <b>{t("plan.place_picker.preview_address")}</b>{" "}
                        {customAddress.trim() || (
                          <span className="text-slate-400">
                            {t("plan.place_picker.preview_address_empty")}
                          </span>
                        )}
                      </p>
                      <p>
                        <b>{t("plan.place_picker.preview_coord")}</b>{" "}
                        {customLat && customLng
                          ? `${customLat}, ${customLng}`
                          : anchorPoint
                          ? t("plan.place_picker.preview_coord_anchor", {
                              lat: anchorPoint.lat,
                              lng: anchorPoint.lng,
                            })
                          : t("plan.place_picker.preview_coord_empty")}
                      </p>
                    </div>
                  ) : selectedItem ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
                            {selectedItem.name}
                          </h4>
                          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                            <FaMapMarkerAlt className="mt-[2px] text-rose-400" />
                            <span className="line-clamp-2">
                              {selectedItem.addressLine ||
                                selectedItem.fullAddress ||
                                selectedItem.address}
                            </span>
                          </div>

                          {activeTab === "HOTEL" && (
                            <HotelPreviewMeta hotel={selectedItem} />
                          )}

                          {(activeTab === "PLACE" ||
                            activeTab === "RESTAURANT") &&
                            selectedItem.tags &&
                            selectedItem.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {selectedItem.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-[11px] text-slate-600 dark:text-slate-400 dark:bg-slate-800 dark:text-slate-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>

                        {activeTab === "HOTEL" && (
                          <HotelPriceBlock hotel={selectedItem} />
                        )}
                      </div>

                      <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        {activeTab === "HOTEL" && hotelSummary && <p>{hotelSummary}</p>}
                        {activeTab === "PLACE" && placeSummary && <p>{placeSummary}</p>}
                        {activeTab === "RESTAURANT" && restaurantSummary && (
                          <p>{restaurantSummary}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                      {t("plan.place_picker.preview_empty")}
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="px-4 sm:px-5 py-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/80">
                  <div className="hidden sm:flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {customMode
                        ? t("plan.place_picker.footer_custom")
                        : t("plan.place_picker.footer_map")}
                    </span>
                    <span>{t("plan.place_picker.footer_save")}</span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      {t("common.close")}
                    </button>

                    {/* NÚT XEM CHI TIẾT */}
                    <button
                      type="button"
                      disabled={!canOpenDetail}
                      onClick={handleOpenDetail}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-sky-200 dark:border-sky-700 bg-sky-50/80 dark:bg-sky-900/30 text-sky-700 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-800/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("plan.place_picker.view_detail")}
                    </button>

                    <button
                      type="button"
                      disabled={!canSubmit}
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-500 to-indigo-500 text-white text-xs font-semibold shadow-md shadow-sky-500/40 hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span>
                        {customMode
                          ? t("plan.place_picker.submit_custom")
                          : t("plan.place_picker.submit_select")}
                      </span>
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/*  SUB COMPONENTS  */

function HotelPreviewMeta({ hotel }) {
  const { t } = useTranslation();
  const avg = hotel.avgRating ?? hotel.reviewScore ?? null;
  const label = hotel.ratingLabel ?? hotel.reviewLabel ?? "";
  const count = hotel.reviewsCount ?? hotel.reviewCount ?? null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
      {avg && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          <FaStar className="text-amber-400" size={11} />
          <span className="font-semibold">
            {avg.toFixed ? avg.toFixed(1) : avg}
          </span>
          <span>/10</span>
        </span>
      )}
      {label && (
        <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
          {label}
        </span>
      )}
      {count != null && (
        <span className="text-slate-500 dark:text-slate-400">
          ({t("plan.place_picker.reviews_count", { count: Number(count).toLocaleString("vi-VN") })})
        </span>
      )}
    </div>
  );
}

function HotelPriceBlock({ hotel }) {
  const { t } = useTranslation();
  const minPrice =
    hotel.minNightlyPrice ?? hotel.lowestPrice ?? hotel.priceFrom ?? null;
  const refPrice = hotel.referenceNightlyPrice ?? hotel.originalPrice ?? null;
  const currency = hotel.currencyCode ?? hotel.currency ?? "VND";

  if (!minPrice && !refPrice) return null;

  return (
    <div className="text-right">
      {refPrice && (
        <div className="text-[11px] text-slate-400 line-through">
          {Number(refPrice).toLocaleString("vi-VN")} {currency}
        </div>
      )}
      {minPrice && (
        <>
          <div className="text-sm font-bold text-[#ff5a00]">
            {Number(minPrice).toLocaleString("vi-VN")} {currency}
          </div>
          <div className="text-[10px] text-slate-500">{t("plan.place_picker.per_night")}</div>
        </>
      )}
    </div>
  );
}

function HotelListItem({ hotel, active, onClick, dataId }) {
  const minPrice =
    hotel.minNightlyPrice ?? hotel.lowestPrice ?? hotel.priceFrom ?? null;
  const refPrice = hotel.referenceNightlyPrice ?? hotel.originalPrice ?? null;
  const currency = hotel.currencyCode ?? hotel.currency ?? "VND";

  const price = minPrice
    ? `${Number(minPrice).toLocaleString("vi-VN")} ${currency}`
    : null;
  const oldPrice = refPrice
    ? `${Number(refPrice).toLocaleString("vi-VN")} ${currency}`
    : null;

  const avg = hotel.avgRating ?? hotel.reviewScore ?? null;
  const count = hotel.reviewsCount ?? hotel.reviewCount ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      data-picker-item-id={dataId}
      className={[
        "w-full flex items-start gap-3 rounded-2xl border bg-white dark:bg-slate-900/90 overflow-hidden text-left transition shadow-sm hover:shadow-md",
        active
          ? "border-sky-500 ring-1 ring-sky-500/50"
          : "border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500",
      ].join(" ")}
    >
      <div className="w-24 h-24 shrink-0 overflow-hidden rounded-2xl">
        <img
          src={
            hotel.coverImageUrl ||
            hotel.thumbnailUrl ||
            hotel.imageUrl ||
            PLACEHOLDER_IMG
          }
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 py-2 pr-3 min-w-0">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-50 truncate">
          {hotel.name}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
          {hotel.addressLine || hotel.fullAddress || hotel.address}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[11px]">
          {avg && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200">
              <FaStar className="text-amber-400" size={10} />
              <span className="font-semibold">
                {avg.toFixed ? avg.toFixed(1) : avg}
              </span>
            </span>
          )}
          {count != null && (
            <span className="text-slate-500 dark:text-slate-400">
              ({Number(count).toLocaleString("vi-VN")})
            </span>
          )}
        </div>

        {price && (
          <div className="mt-1 text-[11px] flex items-center gap-2">
            <span className="font-semibold text-[#ff5a00]">{price}</span>
            {oldPrice && (
              <span className="block text-slate-400 line-through">
                {oldPrice}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function PlaceListItem({ place, active, onClick, dataId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-picker-item-id={dataId}
      className={[
        "w-full flex items-start gap-3 rounded-2xl border bg-white dark:bg-slate-900/90 overflow-hidden text-left transition shadow-sm hover:shadow-md",
        active
          ? "border-sky-500 ring-1 ring-sky-500/50"
          : "border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500",
      ].join(" ")}
    >
      <div className="w-20 h-20 shrink-0 overflow-hidden rounded-2xl">
        <img
          src={
            place.coverImageUrl ||
            place.thumbnailUrl ||
            place.imageUrl ||
            PLACEHOLDER_IMG
          }
          alt={place.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 py-2 pr-3 min-w-0">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-50 truncate">
          {place.name}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
          {place.addressLine || place.fullAddress || place.address}
        </div>
        <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
          {place.provinceName && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 dark:bg-slate-800 dark:text-slate-200">
              {place.provinceName}
            </span>
          )}
          {place.tags &&
            place.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
    </button>
  );
}

function RestaurantListItem({ restaurant, active, onClick, dataId }) {
  const avg = restaurant.avgRating ?? restaurant.rating ?? null;
  const count =
    restaurant.reviewsCount ?? restaurant.reviewCount ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      data-picker-item-id={dataId}
      className={[
        "w-full flex items-start gap-3 rounded-2xl border bg-white dark:bg-slate-900/90 overflow-hidden text-left transition shadow-sm hover:shadow-md",
        active
          ? "border-sky-500 ring-1 ring-sky-500/50"
          : "border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500",
      ].join(" ")}
    >
      <div className="w-20 h-20 shrink-0 overflow-hidden rounded-2xl">
        <img
          src={
            restaurant.coverImageUrl ||
            restaurant.thumbnailUrl ||
            restaurant.imageUrl ||
            PLACEHOLDER_IMG
          }
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 py-2 pr-3 min-w-0">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-50 truncate">
          {restaurant.name}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
          {restaurant.addressLine ||
            restaurant.fullAddress ||
            restaurant.address}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[10px]">
          {avg && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200">
              <FaStar className="text-amber-400" size={10} />
              <span className="font-semibold">
                {avg.toFixed ? avg.toFixed(1) : avg}
              </span>
            </span>
          )}
          {count != null && (
            <span className="text-slate-500 dark:text-slate-400">
              ({Number(count).toLocaleString("vi-VN")})
            </span>
          )}
        </div>

        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
            {restaurant.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
