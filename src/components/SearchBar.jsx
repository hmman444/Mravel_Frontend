// src/components/SearchBar.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUtensils,
  FaHotel,
  FaUsers,
  FaMinus,
  FaPlus,
  FaSearch,
  FaClock,
} from "react-icons/fa";
import MravelDatePicker from "../components/MravelDatePicker";
import { formatLocalDate, addDaysLocal } from "../features/catalog/utils/dateLocal";

import Button from "./Button";
import DestinationTypeahead from "../components/DestinationTypeahead";

/* ───────── Small helpers ───────── */
function RowField({ label, children, onClick, refBox, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="text-xs md:text-sm font-semibold text-white/90">
          {label}
        </div>
      )}
      <div
        ref={refBox}
        onClick={onClick}
        className="
          relative flex items-center h-12
          rounded-xl border border-white/40 md:border-slate-200
          bg-white/95 md:bg-white
          dark:bg-gray-900/85 dark:border-white/10
          shadow-sm md:shadow
          cursor-text
          px-3 md:px-3.5
          transition-all duration-150
          hover:border-primary/70 hover:shadow-md
        "
      >
        {children}
      </div>
    </div>
  );
}

function TextInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  onKeyDown,
  onFocus,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 text-xs md:text-sm font-semibold text-white/90">
          {label}
        </div>
      )}
      <div
        className="
          flex items-center
          rounded-xl border border-white/40 md:border-slate-200
          px-3 md:px-3.5 py-2.5
          bg-white/95 dark:bg-gray-900/85 dark:border-white/10
          shadow-sm md:shadow
          transition-all duration-150
          hover:border-primary/70 hover:shadow-md
        "
      >
        <span className="text-gray-400 mr-2 flex items-center justify-center">
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
}

/* helper VN_DATE cho popup Số đêm */
const VN_DATE = (d) =>
  d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ───────── Hotel Search Form ───────── */
function HotelSearchForm() {
  const navigate = useNavigate();

  const destRef = useRef({ text: "", slug: null });
  const [, setDest] = useState({ text: "", slug: null });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [checkIn, setCheckIn] = useState(today);

  const [nights, setNights] = useState(1);
  const [openNights, setOpenNights] = useState(false);
  const nightsBoxRef = useRef(null);
  const nightList = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

  useEffect(() => {
    const onDoc = (e) => {
      if (nightsBoxRef.current && !nightsBoxRef.current.contains(e.target)) {
        setOpenNights(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const [openGuests, setOpenGuests] = useState(false);
  const guestsBoxRef = useRef(null);
  const [adults, setAdults] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState([]);

  useEffect(() => {
    setChildrenAges((prev) => {
      const next = [...prev];
      if (children > next.length) {
        while (next.length < children) next.push(8);
      } else if (children < next.length) {
        next.length = children;
      }
      return next;
    });
  }, [children]);

  useEffect(() => {
    const onDoc = (e) => {
      if (guestsBoxRef.current && !guestsBoxRef.current.contains(e.target)) {
        setOpenGuests(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const ageOptions = [
    { label: "<1", value: 0 },
    ...Array.from({ length: 8 }, (_, i) => ({ label: String(i + 1), value: i + 1 })),
  ];

  const handleDestUpdate = (payload) => {
    const next = { text: (payload?.text || "").trim(), slug: payload?.slug || null };
    destRef.current = next;
    setDest(next);
  };

  const submit = (e) => {
    e.preventDefault();

    const locationVal = (destRef.current.slug || destRef.current.text || "").trim();
    if (!locationVal) {
      alert("Vui lòng nhập hoặc chọn Điểm đến.");
      return;
    }

    const nightsInt = Math.max(1, Math.min(30, Number(nights) || 1));
    const checkInDate = checkIn || new Date();
    const checkOutDate = addDaysLocal(checkInDate, nightsInt);

    const qs = new URLSearchParams({
      location: locationVal,
      checkIn: formatLocalDate(checkInDate),
      nights: String(nightsInt),

      // NEW: đẩy luôn checkOut lên URL để trang hotel khỏi đoán
      checkOut: formatLocalDate(checkOutDate),

      adults: String(adults),
      children: String(children),
      rooms: String(rooms),
      page: "0",
      size: "9",
    });

    if (Array.isArray(childrenAges) && childrenAges.length) {
      // bạn đang append nhiều key childrenAges -> ok, BE không dùng thì FE dùng cũng được
      childrenAges.forEach((age) => qs.append("childrenAges", String(age)));
    }

    navigate(`/hotels/search?${qs.toString()}`);
  };

  return (
    <form onSubmit={submit} className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        <div className="col-span-12 md:col-span-5">
          <RowField label="Điểm đến:">
            <DestinationTypeahead
              label={null}
              placeholder="Thành phố, khách sạn, điểm đến"
              className="flex-1 min-w-0 w-full !max-w-none !mx-0"
              buttonSlot={null}
              /* BẮT ĐỦ CÁC CASE: gõ, chọn suggestion, nhấn enter */
              onSubmit={handleDestUpdate}
              onPick={handleDestUpdate}
              onChangeText={(text) => handleDestUpdate({ text, slug: null })}
            />
          </RowField>
        </div>

        <div className="col-span-12 md:col-span-3">
          <RowField label="Ngày nhận phòng:">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <MravelDatePicker selected={checkIn} onChange={setCheckIn} />
          </RowField>
        </div>

        <div className="col-span-12 md:col-span-4">
          <RowField
            label="Số đêm:"
            onClick={() => !openNights && setOpenNights(true)}
            refBox={nightsBoxRef}
          >
            <FaClock className="text-gray-400 mr-2" />
            <input
              readOnly
              value={`${nights} đêm`}
              className="w-full bg-transparent outline-none cursor-pointer text-sm text-gray-800 dark:text-gray-100"
            />
            <span className="ml-auto text-gray-400 text-xs">▾</span>

            {openNights && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-slate-200 bg-white shadow-xl max-h-72 overflow-auto"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {nightList.map((n) => {
                  const d = new Date(checkIn);
                  d.setDate(d.getDate() + n);
                  const isActive = n === nights;
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-sm transition ${
                        isActive ? "bg-sky-50 text-sky-700" : "hover:bg-gray-50"
                      }`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setNights(n);
                        setOpenNights(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isActive ? "bg-sky-500" : "bg-gray-300"
                          }`}
                        />
                        <span className="font-medium">{n} đêm</span>
                      </div>
                      <div className="text-xs text-gray-500">{VN_DATE(d)}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </RowField>
        </div>
      </div>

      {/* Hàng 2: Khách & phòng + nút tìm kiếm */}
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {/* Khách & phòng */}
        <div className="col-span-12 md:col-span-8">
          <RowField
            label="Khách & phòng:"
            onClick={() => !openGuests && setOpenGuests(true)}
            refBox={guestsBoxRef}
          >
            <FaUsers className="text-gray-400 mr-2" />
            <span className="text-gray-800 dark:text-gray-100 text-sm select-none truncate">
              {adults} người lớn, {children} trẻ em, {rooms} phòng
            </span>
            <span className="ml-auto text-gray-400 text-xs">▾</span>

            {openGuests && (
              <div
                className="
                  absolute left-0 right-0 top-[calc(100%+6px)] z-50
                  rounded-xl border border-slate-200 bg-white shadow-xl p-4
                  text-sm
                "
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Người lớn */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 grid place-items-center rounded-lg bg-gray-100">
                      <FaUsers className="text-gray-600 text-xs" />
                    </span>
                    <span className="font-medium text-gray-800">Người lớn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setAdults((v) => Math.max(1, v - 1));
                      }}
                    >
                      <FaMinus className="text-[10px]" />
                    </button>
                    <span className="w-6 text-center font-medium">{adults}</span>
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setAdults((v) => v + 1);
                      }}
                    >
                      <FaPlus className="text-[10px]" />
                    </button>
                  </div>
                </div>

                {/* Trẻ em */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 grid place-items-center rounded-lg bg-gray-100">
                      👶
                    </span>
                    <span className="font-medium text-gray-800">Trẻ em</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setChildren((v) => Math.max(0, v - 1));
                      }}
                    >
                      <FaMinus className="text-[10px]" />
                    </button>
                    <span className="w-6 text-center font-medium">{children}</span>
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setChildren((v) => Math.min(6, v + 1));
                      }}
                    >
                      <FaPlus className="text-[10px]" />
                    </button>
                  </div>
                </div>

                {/* Phòng */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 grid place-items-center rounded-lg bg-gray-100">
                      🏠
                    </span>
                    <span className="font-medium text-gray-800">Phòng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setRooms((v) => Math.max(1, v - 1));
                      }}
                    >
                      <FaMinus className="text-[10px]" />
                    </button>
                    <span className="w-6 text-center font-medium">{rooms}</span>
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setRooms((v) => v + 1);
                      }}
                    >
                      <FaPlus className="text-[10px]" />
                    </button>
                  </div>
                </div>

                {/* Độ tuổi trẻ em */}
                {children > 0 && (
                  <>
                    <div className="mt-3 text-xs text-gray-600">
                      Điền tuổi của trẻ để giúp chúng tôi gợi ý phòng phù hợp.
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {childrenAges.map((age, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            Trẻ em {idx + 1}
                          </span>
                          <select
                            className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                            value={age}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              setChildrenAges((arr) => {
                                const nx = [...arr];
                                nx[idx] = Number.isFinite(v) ? v : 0;
                                return nx;
                              });
                            }}
                          >
                            {ageOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="
                      px-4 py-2 rounded-full text-xs font-semibold
                      bg-primary text-white hover:bg-primaryHover
                      transition
                    "
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenGuests(false);
                    }}
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </RowField>
        </div>

        {/* Nút tìm kiếm */}
        <div className="col-span-12 md:col-span-4 flex items-end">
          <Button type="submit" className="w-full h-12 rounded-xl text-sm">
            <FaSearch />
            Tìm khách sạn
          </Button>
        </div>
      </div>
    </form>
  );
}

const CUISINE_OPTIONS = [
  { value: "", label: "Tất cả ẩm thực" },
  { value: "VIETNAMESE", label: "Việt Nam" },
  { value: "ASIAN", label: "Châu Á" },
  { value: "BUFFET_VIET_ASIAN", label: "Buffet & Việt - Á" },
  { value: "EUROPEAN", label: "Âu" },
  { value: "FRENCH", label: "Pháp" },
  { value: "ITALIAN", label: "Ý" },
];

/* ───────── Restaurant Search Form ───────── */
// trong SearchBar.jsx — giữ nguyên phần khác, chỉ thay RestaurantSearchForm
function RestaurantSearchForm() {
  const navigate = useNavigate();

  const destRef = useRef({ text: "", slug: null });
  const [, setDest] = useState({ text: "", slug: null });

  const [date, setDate] = useState(() => new Date());

  // cuisine
  const [cuisineCode, setCuisineCode] = useState("");
  const [openCuisine, setOpenCuisine] = useState(false);
  const cuisineBoxRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (cuisineBoxRef.current && !cuisineBoxRef.current.contains(e.target)) {
        setOpenCuisine(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleDestUpdate = (payload) => {
    const next = { text: (payload?.text || "").trim(), slug: payload?.slug || null };
    destRef.current = next;
    setDest(next);
  };

  const submit = (e) => {
    e.preventDefault();

    const locationVal = (destRef.current.slug || destRef.current.text || "").trim();
    if (!locationVal) {
      alert("Vui lòng nhập hoặc chọn Khu vực / Thành phố.");
      return;
    }

    const qs = new URLSearchParams({
      location: locationVal,
      date: formatLocalDate(date),
      ...(cuisineCode ? { cuisine: cuisineCode } : {}),
      page: "0",
      size: "9",
    });

    navigate(`/restaurants/search?${qs.toString()}`);
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-12 gap-3 md:gap-4 items-end">
      <div className="col-span-12 md:col-span-4">
        <RowField label="Khu vực / Thành phố">
          <DestinationTypeahead
            label={null}
            placeholder="TP.HCM, Hà Nội, Đà Nẵng…"
            className="flex-1 min-w-0 w-full !max-w-none !mx-0"
            buttonSlot={null}
            onSubmit={handleDestUpdate}
            onPick={handleDestUpdate}
            onChangeText={(text) => handleDestUpdate({ text, slug: null })}
          />
        </RowField>
      </div>

      <div className="col-span-12 md:col-span-3">
        <RowField label="Ngày dùng bữa">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <MravelDatePicker
            selected={date}
            onChange={setDate}
            popperClassName="mravel-calendar-popper--restaurant"
          />
        </RowField>
      </div>

      <div className="col-span-12 md:col-span-3">
        <RowField
          label="Loại ẩm thực"
          refBox={cuisineBoxRef}
          onClick={() => !openCuisine && setOpenCuisine(true)}
        >
          <FaUtensils className="text-gray-400 mr-2" />
          <span className={`text-sm ${cuisineCode ? "text-gray-800" : "text-gray-400"}`}>
            {CUISINE_OPTIONS.find((o) => o.value === cuisineCode)?.label || "Chọn loại ẩm thực"}
          </span>
          <span className="ml-auto text-gray-400 text-xs">▾</span>

          {openCuisine && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-slate-200 bg-white shadow-xl max-h-64 overflow-auto py-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {CUISINE_OPTIONS.map((opt) => (
                <button
                  key={opt.value || "_all_"}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm ${
                    opt.value === cuisineCode
                      ? "bg-sky-50 text-sky-700 font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setCuisineCode(opt.value);
                    setOpenCuisine(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </RowField>
      </div>

      <div className="col-span-12 md:col-span-2 flex items-end">
        <Button type="submit" className="w-full h-12 rounded-xl text-sm">
          <FaSearch />
          Tìm quán ăn
        </Button>
      </div>
    </form>
  );
}

/* ───────── Main SearchBar ───────── */
export default function SearchBar() {
  const [activeTab, setActiveTab] = useState("hotel");
  const navigate = useNavigate();
  const locationSubmitRef = useRef(null);

  const [planQuery, setPlanQuery] = useState("");

  const submitPlanSearch = () => {
    const q = (planQuery || "").trim();
    if (!q) return;

    // Điều hướng sang trang feed lịch trình và đưa query lên URL
    navigate(`/plans?query=${encodeURIComponent(q)}&mode=search`);
  };
  const tabs = [
    {
      key: "hotel",
      label: "Khách sạn",
      icon: <FaHotel className="w-4 h-4 md:w-5 md:h-5" />,
    },
    {
      key: "restaurant",
      label: "Quán ăn",
      icon: <FaUtensils className="w-4 h-4 md:w-5 md:h-5" />,
    },
    {
      key: "locations",
      label: "Địa điểm",
      icon: <FaMapMarkerAlt className="w-4 h-4 md:w-5 md:h-5" />,
    },
    {
      key: "plans",
      label: "Lịch trình",
      icon: <FaCalendarAlt className="w-4 h-4 md:w-5 md:h-5" />,
    },
  ];

  const goLocations = ({ text, slug }) => {
    if (slug) navigate(`/locations/search?spec=${encodeURIComponent(slug)}`);
    else if (text?.trim())
      navigate(`/locations/search?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative z-30">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;

          // màu gradient theo từng loại tab
          const gradientMap = {
            hotel: "from-sky-500 to-blue-600",
            restaurant: "from-sky-500 to-blue-600",
            locations: "from-sky-500 to-blue-600",
            plans: "from-sky-500 to-blue-600",
          };

          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                "group inline-flex items-center gap-2 select-none",
                "px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm md:text-base font-semibold",
                "transition-all duration-300 ease-out",
                isActive
                  ? `
                  text-white shadow-md
                  bg-gradient-to-r ${gradientMap[t.key]}
                  hover:shadow-lg hover:-translate-y-0.5
                  ring-1 ring-black/5
                `
                  : `
                  text-white/90
                  hover:text-white
                  hover:ring-2 hover:ring-white/70
                  bg-white/10 backdrop-blur
                  hover:bg-white/20
                  transition-all
                `,
              ].join(" ")}
            >
              <span
                className={`${
                  isActive ? "text-white" : "text-white/80"
                } transition-colors duration-300`}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mt-3 md:mt-4 mb-4 md:mb-5 h-[2px] bg-white/40 rounded-full" />

      {/* Content */}
      <div
        key={activeTab}
        className="
          transition-all duration-300
          opacity-100 translate-y-0
          animate-[fadeSlide_.35s_ease-out]
        "
      >
        {activeTab === "hotel" && <HotelSearchForm />}
        {activeTab === "restaurant" && <RestaurantSearchForm />}

        {activeTab === "locations" && (
          <form
            className="grid grid-cols-12 gap-3 md:gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Ô nhập địa điểm */}
            <div className="col-span-12 md:col-span-10">
              <RowField label="Địa điểm">
                <DestinationTypeahead
                  label={null}
                  placeholder="Nhập địa điểm muốn tham quan (TP. Hồ Chí Minh, Phú Quốc, Hội An…)"
                  className="flex-1 min-w-0 w-full !max-w-none !mx-0"
                  onSubmit={goLocations}
                  buttonSlot={({ submit }) => {
                    locationSubmitRef.current = submit;
                    return null;
                  }}
                />
              </RowField>
            </div>

            {/* Nút tìm kiếm địa điểm */}
            <div className="col-span-12 md:col-span-2 flex items-end">
              <Button
                type="button"
                className="w-full h-12 rounded-xl text-sm"
                onClick={() => {
                  if (locationSubmitRef.current) locationSubmitRef.current();
                }}
              >
                <FaSearch />
                Tìm địa điểm
              </Button>
            </div>
          </form>
        )}

        {activeTab === "plans" && (
          <form
            className="grid grid-cols-12 gap-3 md:gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              submitPlanSearch();
            }}
          >
            <div className="col-span-12 md:col-span-10">
              <TextInput
                label="Tìm lịch trình hoặc người dùng"
                icon={<FaSearch />}
                placeholder='Ví dụ: "Đà Nẵng", "Hội An", "@luan", "Luân Đỗ"...'
                value={planQuery}
                onChange={setPlanQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitPlanSearch();
                  }
                }}
                className=""
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <Button type="submit" className="w-full h-12 rounded-xl text-sm">
                <FaSearch />
                Tìm kiếm
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}