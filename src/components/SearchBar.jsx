import { useState, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaUtensils, FaHotel } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Button from "./Button";
import DestinationTypeahead from "../components/DestinationTypeahead";
import { useSubmitFromSearchBar } from "../features/catalog/hooks/useSubmitFromSearchBar";

/* helpers */
const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
const slugify = (s) =>
  s.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-,]/g, "")
    .trim();

/* small input blocks */
function TextInput({ label, icon, placeholder, value, onChange, onKeyDown, onFocus, className = "" }) {
  return (
    <div className={className}>
      {label && <div className="mb-1.5 text-sm font-semibold text-white/90">{label}</div>}
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white/90 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur dark:border-white/10">
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

function DateInput({ label, icon, placeholder, selected, onChange, startDate, minDate, className = "" }) {
  return (
    <div className={className}>
      {label && <div className="mb-1.5 text-sm font-semibold text-white/90">{label}</div>}
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white/90 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur dark:border-white/10">
        <span className="text-gray-400 mr-2">{icon}</span>
        <DatePicker
          selected={selected}
          onChange={onChange}
          selectsStart={!!startDate}
          startDate={startDate}
          endDate={selected}
          minDate={minDate}
          placeholderText={placeholder}
          className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-200"
          dateFormat="dd/MM/yyyy"
        />
      </div>
    </div>
  );
}

/* sub-forms */
function HotelSearchForm() {
  const { goHotels } = useSubmitFromSearchBar();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [adultsRooms, setAdultsRooms] = useState("1-1");

  const submit = (e) => {
    e.preventDefault();
    const [adults, rooms] = adultsRooms.split("-").map((x) => parseInt(x || "0", 10));
    goHotels({
      location: location || undefined,
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      adults: adults || 1,
      rooms: rooms || 1,
      page: 0,
      size: 9,
    });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-12 gap-3 md:gap-4">
      <TextInput label="Điểm đến" icon={<FaMapMarkerAlt />} placeholder="Bạn muốn ở đâu?" value={location} onChange={setLocation} className="col-span-12 md:col-span-4" />
      <DateInput label="Nhận phòng" icon={<FaCalendarAlt />} placeholder="dd/mm/yyyy" selected={checkIn} onChange={setCheckIn} className="col-span-6 md:col-span-2" />
      <DateInput label="Trả phòng" icon={<FaCalendarAlt />} placeholder="dd/mm/yyyy" selected={checkOut} onChange={setCheckOut} startDate={checkIn} minDate={checkIn} className="col-span-6 md:col-span-2" />

      <div className="col-span-6 md:col-span-2">
        <div className="mb-1.5 text-sm font-semibold text-white/90">Khách & phòng</div>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white/90 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur dark:border-white/10">
          <FaHotel className="text-gray-400 mr-2" />
          <select className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200" value={adultsRooms} onChange={(e) => setAdultsRooms(e.target.value)}>
            <option value="1-1">1 người lớn, 1 phòng</option>
            <option value="2-1">2 người lớn, 1 phòng</option>
            <option value="2-2">2 người lớn, 2 phòng</option>
            <option value="3-2">Gia đình (3 người, 2 phòng)</option>
          </select>
        </div>
      </div>

      <div className="col-span-6 md:col-span-2 flex items-end">
        <Button type="submit" className="w-full bg-primary hover:bg-primaryHover">Tìm khách sạn</Button>
      </div>
    </form>
  );
}

function RestaurantSearchForm() {
  const { goRestaurants } = useSubmitFromSearchBar();
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState(""); // ✅ sửa 'the' -> 'const'

  const submit = (e) => {
    e.preventDefault();
    const cuisineSlugs = cuisine.split(",").map((x) => slugify(x.trim())).filter(Boolean);
    goRestaurants({ location: location || undefined, cuisineSlugs, page: 0, size: 9 });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-12 gap-3 md:gap-4">
      <TextInput label="Khu vực / Thành phố" icon={<FaMapMarkerAlt />} placeholder="TP.HCM, Hà Nội…" value={location} onChange={setLocation} className="col-span-12 md:col-span-6" />
      <TextInput label="Loại ẩm thực" icon={<FaUtensils />} placeholder="Việt, Nhật, BBQ…" value={cuisine} onChange={setCuisine} className="col-span-12 md:col-span-4" />
      <div className="col-span-12 md:col-span-2 flex items-end">
        <Button type="submit" className="w-full bg-primary hover:bg-primaryHover">Tìm quán ăn</Button>
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
    { key: "hotel", label: "Khách sạn", icon: <FaHotel className="w-4 h-4 md:w-5 md:h-5" /> },
    { key: "restaurant", label: "Quán ăn", icon: <FaUtensils className="w-4 h-4 md:w-5 md:h-5" /> },
    { key: "locations", label: "Địa điểm", icon: <FaMapMarkerAlt className="w-4 h-4 md:w-5 md:h-5" /> },
    { key: "plans", label: "Lịch trình", icon: <FaCalendarAlt className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  const goLocations = ({ text, slug }) => {
    if (slug) navigate(`/locations/search?spec=${encodeURIComponent(slug)}`);
    else if (text?.trim()) navigate(`/locations/search?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative z-20">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {tabs.map(t => {
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
                  : "text-white/90 hover:text-white hover:ring-2 hover:ring-white/90 rounded-full"
              ].join(" ")}
            >
              <span className={isActive ? "text-primary" : "text-white"}>{t.icon}</span>
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
            {/* Ô nhập địa điểm */}
            <div className="col-span-12 md:col-span-10">
              <div className="mb-1.5 text-sm font-semibold text-white/90">
                Địa điểm
              </div>

              <div className="flex items-center border rounded-lg px-3 py-2 bg-white/90 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur dark:border-white/10">
                <DestinationTypeahead
                  label={null}
                  className="flex-1"
                  onSubmit={goLocations}
                  buttonSlot={({ submit }) => {
                    // ❗ Không render nút, chỉ lưu hàm submit vào ref
                    locationSubmitRef.current = submit;
                    return null;
                  }}
                />
              </div>
            </div>

            {/* Nút riêng giống các tab khác */}
            <div className="col-span-12 md:col-span-2 flex items-end">
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primaryHover"
                onClick={() => {
                  // gọi submit nội bộ của DestinationTypeahead
                  if (locationSubmitRef.current) locationSubmitRef.current();
                }}
              >
                Tìm địa điểm
              </Button>
            </div>
          </form>
        )}

        {activeTab === "plans" && (
          <form className="grid grid-cols-12 gap-3 md:gap-4" onSubmit={(e) => e.preventDefault()}>
            <TextInput label="Điểm đến chính" icon={<FaMapMarkerAlt />} placeholder="Ví dụ: Đà Lạt" value={""} onChange={() => {}} className="col-span-12 md:col-span-8" />
            <div className="col-span-6 md:col-span-2">
              <div className="mb-1.5 text-sm font-semibold text-white/90">Ngày bắt đầu</div>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-white/90 dark:bg-gray-900/80 supports-[backdrop-filter]:backdrop-blur dark:border-white/10">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <input type="date" className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200" />
              </div>
            </div>
            <div className="col-span-6 md:col-span-2 flex items-end">
              <Button type="submit" className="w-full bg-primary hover:bg-primaryHover">Tạo lịch trình</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}