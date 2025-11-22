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

import Button from "./Button";
import DestinationTypeahead from "../components/DestinationTypeahead";
import { useSubmitFromSearchBar } from "../features/catalog/hooks/useSubmitFromSearchBar";

/* ───────── Small helpers ───────── */
function RowField({ label, children, onClick, refBox, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="text-sm font-semibold text-white/90">{label}</div>
      )}
      <div
        ref={refBox}
        onClick={onClick}
        className="relative flex items-center h-12 rounded-lg border border-gray-300 px-3 bg-white cursor-text"
      >
        {children}
      </div>
    </div>
  );
}

/* (TextInput vẫn để cho tab khác dùng nếu cần) */
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
        <div className="mb-1.5 text-sm font-semibold text-white/90">
          {label}
        </div>
      )}
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white dark:bg-gray-900/80 dark:border-white/10">
        <span className="text-gray-400 mr-2">{icon}</span>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
}

/* helper format date để gửi query */
const formatDate = (d) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

/* ===== helper VN_DATE cho popup Số đêm ===== */
const VN_DATE = (d) =>
  d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ───────── Hotel Search Form (giống HotelSearchCard) ───────── */
function HotelSearchForm() {
  const { goHotels } = useSubmitFromSearchBar();

  /* Địa điểm */
  const [dest, setDest] = useState({ text: "", slug: null });

  /* Ngày nhận phòng */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [checkIn, setCheckIn] = useState(today);

  /* Số đêm */
  const [nights, setNights] = useState(1);
  const [openNights, setOpenNights] = useState(false);
  const nightsBoxRef = useRef(null);
  const nightList = useMemo(
    () => Array.from({ length: 30 }, (_, i) => i + 1),
    []
  );

  useEffect(() => {
    const onDoc = (e) => {
      if (nightsBoxRef.current && !nightsBoxRef.current.contains(e.target)) {
        setOpenNights(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /* Guests & rooms + tuổi trẻ em */
  const [openGuests, setOpenGuests] = useState(false);
  const guestsBoxRef = useRef(null);
  const [adults, setAdults] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState([]); // 0..8 (0 = "<1")

  useEffect(() => {
    // sync length childrenAges với số lượng trẻ em
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
    ...Array.from({ length: 8 }, (_, i) => ({
      label: String(i + 1),
      value: i + 1,
    })),
  ];

  /* Submit */
  const submit = (e) => {
    e.preventDefault();
    goHotels({
      location: dest.slug || dest.text,
      checkIn: checkIn ? new Date(checkIn).toISOString().slice(0, 10) : "",
      nights,
      adults,
      children,
      childrenAges,
      rooms,
      page: 0,
      size: 9,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3 md:space-y-4">
      {/* Hàng 1: Điểm đến (40%) / Ngày nhận phòng / Số đêm */}
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {/* Điểm đến ~40% */}
        <div className="col-span-12 md:col-span-5">
          <RowField label="Điểm đến:">
            <DestinationTypeahead
              label={null}
              placeholder="Thành phố, khách sạn, điểm đến"
              onSubmit={({ text, slug }) => setDest({ text, slug })}
              className="flex-1 min-w-0 w-full !max-w-none !mx-0"
              buttonSlot={null}
            />
          </RowField>
        </div>

        {/* Ngày nhận phòng ~30% */}
        <div className="col-span-12 md:col-span-3">
          <RowField label="Ngày nhận phòng:">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <MravelDatePicker selected={checkIn} onChange={setCheckIn} />
          </RowField>
        </div>

        {/* Số đêm ~30% */}
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
              className="w-full bg-transparent outline-none cursor-pointer"
            />
            <span className="ml-auto text-gray-400">▾</span>

            {openNights && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-lg border border-gray-200 bg-white shadow-lg max-h-72 overflow-auto"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {nightList.map((n) => {
                  const d = new Date(checkIn);
                  d.setDate(d.getDate() + n);
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 ${
                        n === nights ? "bg-blue-50" : ""
                      }`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setNights(n);
                        setOpenNights(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
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

      {/* Hàng 2: Khách & phòng (70%) + nút tìm kiếm */}
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {/* Khách & phòng ~70% */}
        <div className="col-span-12 md:col-span-8">
          <RowField
            label="Khách & phòng:"
            onClick={() => !openGuests && setOpenGuests(true)}
            refBox={guestsBoxRef}
          >
            <FaUsers className="text-gray-400 mr-2" />
            <span className="text-gray-800 select-none">
              {adults} người lớn, {children} trẻ em, {rooms} phòng
            </span>
            <span className="ml-auto text-gray-400">▾</span>

            {openGuests && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-lg border border-gray-200 bg-white shadow-lg p-4"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Người lớn */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 grid place-items-center rounded bg-gray-100">
                      <FaUsers className="text-gray-600 text-xs" />
                    </span>
                    <span className="font-medium">Người lớn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setAdults((v) => Math.max(1, v - 1));
                      }}
                    >
                      <FaMinus />
                    </button>
                    <span className="w-6 text-center">{adults}</span>
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setAdults((v) => v + 1);
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Trẻ em */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 grid place-items-center rounded bg-gray-100">
                      👶
                    </span>
                    <span className="font-medium">Trẻ em</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setChildren((v) => Math.max(0, v - 1));
                      }}
                    >
                      <FaMinus />
                    </button>
                    <span className="w-6 text-center">{children}</span>
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setChildren((v) => Math.min(6, v + 1));
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Phòng */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 grid place-items-center rounded bg-gray-100">
                      🏠
                    </span>
                    <span className="font-medium">Phòng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setRooms((v) => Math.max(1, v - 1));
                      }}
                    >
                      <FaMinus />
                    </button>
                    <span className="w-6 text-center">{rooms}</span>
                    <button
                      type="button"
                      className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setRooms((v) => v + 1);
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Độ tuổi trẻ em */}
                {children > 0 && (
                  <>
                    <div className="mt-3 text-sm text-gray-600">
                      Điền tuổi của trẻ để giúp chúng tôi tìm được phòng phù hợp
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {childrenAges.map((age, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Trẻ em {idx + 1}
                          </span>
                          <select
                            className="flex-1 border rounded px-2 py-2"
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
                    className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
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

        {/* Nút tìm kiếm ~30% */}
        <div className="col-span-12 md:col-span-4 flex items-end">
          <Button
            type="submit"
            className="w-full h-12 rounded-lg bg-primary hover:bg-primaryHover text-white font-semibold inline-flex items-center justify-center gap-2"
          >
            <FaSearch />
            Tìm khách sạn
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ───────── Restaurant Search Form (Khu vực + Ngày + Loại ẩm thực) ───────── */
function RestaurantSearchForm() {
  const { goRestaurants } = useSubmitFromSearchBar();

  const [dest, setDest] = useState({ text: "", slug: null });
  const [date, setDate] = useState(() => new Date());
  const [cuisine, setCuisine] = useState("");

  const submit = (e) => {
    e.preventDefault();
    goRestaurants({
      location: dest.slug || dest.text,
      date: formatDate(date),
      cuisine: cuisine || undefined,
      page: 0,
      size: 9,
    });
  };

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-12 gap-3 md:gap-4 items-end"
    >
      {/* Khu vực / Thành phố – THU LẠI: 5 -> 4 */}
      <div className="col-span-12 md:col-span-4">
        <RowField label="Khu vực / Thành phố">
          <DestinationTypeahead
            label={null}
            placeholder="TP.HCM, Hà Nội, Đà Nẵng…"
            onSubmit={({ text, slug }) => setDest({ text, slug })}
            className="flex-1 min-w-0 w-full !max-w-none !mx-0"
            buttonSlot={null}
          />
        </RowField>
      </div>

      {/* Ngày dùng bữa – giữ nguyên 3 */}
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

      {/* Loại ẩm thực – TĂNG: 2 -> 3 */}
      <div className="col-span-12 md:col-span-3">
        <RowField label="Loại ẩm thực">
          <FaUtensils className="text-gray-400 mr-2" />
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="Việt, Nhật, BBQ…"
            className="w-full bg-transparent outline-none text-sm text-gray-800"
          />
        </RowField>
      </div>

      {/* Nút tìm kiếm – giữ 2 */}
      <div className="col-span-12 md:col-span-2 flex items-end">
        <Button
          type="submit"
          className="w-full h-12 rounded-lg bg-primary hover:bg-primaryHover text-white font-semibold inline-flex items-center justify-center gap-2"
        >
          <FaSearch />
          Tìm quán ăn
        </Button>
      </div>
    </form>
  );
}

/* main SearchBar */
export default function SearchBar() {
  const [activeTab, setActiveTab] = useState("hotel");
  const navigate = useNavigate();
  const locationSubmitRef = useRef(null);

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
    <div className="w-full max-w-6xl mx-auto relative z-20">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                "group inline-flex items-center gap-2",
                "px-4 md:px-5 py-2 md:py-2.5 rounded-full text-base font-semibold",
                "transition-all duration-150",
                isActive
                  ? "bg-white text-gray-900 shadow ring-1 ring-white/70"
                  : "text-white/90 hover:text-white hover:ring-2 hover:ring-white/90 rounded-full",
              ].join(" ")}
            >
              <span className={isActive ? "text-primary" : "text-white"}>
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 md:mt-4 mb-4 md:mb-5 h-[2px] bg-white/50 rounded-full"></div>

      {/* Content */}
      <div className="min-h-[168px] md:min-h-[152px]">
        {activeTab === "hotel" && <HotelSearchForm />}
        {activeTab === "restaurant" && <RestaurantSearchForm />}

        {activeTab === "locations" && (
          <form
            className="grid grid-cols-12 gap-3 md:gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Ô nhập địa điểm – dùng lại RowField cho đồng bộ style */}
            <div className="col-span-12 md:col-span-10">
              <RowField label="Địa điểm">
                <DestinationTypeahead
                  label={null}
                  placeholder="Nhập địa điểm muốn tham quan (TP. Hồ Chí Minh, Phú Quốc, Hội An…)"
                  className="flex-1 min-w-0 w-full !max-w-none !mx-0"
                  onSubmit={goLocations}
                  buttonSlot={({ submit }) => {
                    // lưu hàm submit nội bộ để nút bên phải gọi
                    locationSubmitRef.current = submit;
                    return null; // không render nút ở trong
                  }}
                />
              </RowField>
            </div>

            {/* Nút riêng giống các tab khác */}
            <div className="col-span-12 md:col-span-2 flex items-end">
              <Button
                type="button"
                className="w-full h-12 rounded-lg bg-primary hover:bg-primaryHover text-white font-semibold inline-flex items-center justify-center gap-2"
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
            className="grid grid-cols-12 gap-3 md:gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <TextInput
              label="Điểm đến chính"
              icon={<FaMapMarkerAlt />}
              placeholder="Ví dụ: Đà Lạt"
              value={""}
              onChange={() => {}}
              className="col-span-12 md:col-span-8"
            />
            <div className="col-span-6 md:col-span-2">
              <div className="mb-1.5 text-sm font-semibold text-white/90">
                Ngày bắt đầu
              </div>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-white/90 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur dark:border-white/10">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <input
                  type="date"
                  className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
            <div className="col-span-6 md:col-span-2 flex items-end">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primaryHover"
              >
                Tạo lịch trình
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}