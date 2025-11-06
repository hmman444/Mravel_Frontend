import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaUtensils, FaHotel } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Button from "./Button";
import { useSubmitFromSearchBar } from "../features/catalog/hooks/useSubmitFromSearchBar";
import { usePlaceTypeahead } from "../features/catalog/hooks/usePlaceTypeahead";
import { getChildren } from "../features/catalog/services/catalogService";

/* ----------------- helpers ----------------- */
const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined); // YYYY-MM-DD
const slugify = (s) =>
  s.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-,]/g, "")
    .trim();

/* ----------------- sub-forms: services ----------------- */
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
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <TextInput icon={<FaMapMarkerAlt />} placeholder="Bạn muốn ở đâu?" value={location} onChange={setLocation} />
      <DateInput icon={<FaCalendarAlt />} placeholder="Nhận phòng" selected={checkIn} onChange={setCheckIn} />
      <DateInput
        icon={<FaCalendarAlt />}
        placeholder="Trả phòng"
        selected={checkOut}
        onChange={setCheckOut}
        startDate={checkIn}
        minDate={checkIn}
      />
      <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
        <FaHotel className="text-gray-400 mr-2" />
        <select
          className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
          value={adultsRooms}
          onChange={(e) => setAdultsRooms(e.target.value)}
        >
          <option value="1-1">1 người lớn, 1 phòng</option>
          <option value="2-1">2 người lớn, 1 phòng</option>
          <option value="2-2">2 người lớn, 2 phòng</option>
          <option value="3-2">Gia đình (3 người, 2 phòng)</option>
        </select>
      </div>
      <Button type="submit" className="bg-primary hover:bg-primaryHover">Tìm khách sạn</Button>
    </form>
  );
}

function RestaurantSearchForm() {
  const { goRestaurants } = useSubmitFromSearchBar();
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const cuisineSlugs = cuisine.split(",").map((x) => slugify(x.trim())).filter(Boolean);
    goRestaurants({ location: location || undefined, cuisineSlugs, page: 0, size: 9 });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TextInput icon={<FaMapMarkerAlt />} placeholder="Nhập địa điểm (TP.HCM, Hà Nội...)" value={location} onChange={setLocation} />
      <TextInput icon={<FaUtensils />} placeholder="Loại ẩm thực (Việt, Nhật, BBQ...)" value={cuisine} onChange={setCuisine} />
      <Button type="submit" className="bg-primary hover:bg-primaryHover">Tìm quán ăn</Button>
    </form>
  );
}

/* ----------------- building blocks ----------------- */
function TextInput({ icon, placeholder, value, onChange, onKeyDown, onFocus }) {
  return (
    <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
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
  );
}

function DateInput({ icon, placeholder, selected, onChange, startDate, minDate }) {
  return (
    <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
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
  );
}

/* ----------------- main: SearchBar ----------------- */
export default function SearchBar() {
  const [activeTab, setActiveTab] = useState("services"); // services | locations | plans
  const [serviceTab, setServiceTab] = useState("hotel");  // hotel | restaurant

  const navigate = useNavigate();
  const { goPlaces } = useSubmitFromSearchBar();

  // typeahead for DESTINATIONS only
  const [poiQuery, setPoiQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const boxRef = useRef(null);

  const { items: rawSuggestions, loading: loadingSuggest, fetchSuggest, resetSuggest } = usePlaceTypeahead();

  // side panel: children POIs of a hovered DESTINATION
  const [activeDest, setActiveDest] = useState(null); // { slug, name }
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const childrenAbortRef = useRef(null);

  // debounce fetch 250ms
  useEffect(() => {
    if (!poiQuery?.trim()) { resetSuggest(); setOpen(false); return; }
    const t = setTimeout(() => { 
      // nếu hook hỗ trợ options thì dùng: fetchSuggest(poiQuery, 6, { kind: 'DESTINATION' })
      fetchSuggest(poiQuery, 8); 
      setOpen(true); 
    }, 250);
    return () => clearTimeout(t);
  }, [poiQuery]);

  // click outside
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // only DESTINATIONS
  const suggestions = (rawSuggestions || []).filter(it => (it.kind === "DESTINATION" || it.kind === 0 /* enum kiểu số */));

  const submitPoi = (e) => {
    e.preventDefault();
    if (hi >= 0 && suggestions[hi]) {
      navigate(`/place/${suggestions[hi].slug}`);
    } else {
      // tìm DESTINATION theo q
      goPlaces({ q: poiQuery || undefined, kind: "DESTINATION", page: 0, size: 9 });
    }
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((x) => Math.min((x < 0 ? -1 : x) + 1, (suggestions?.length ?? 1) - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((x) => Math.max(x - 1, 0)); }
    else if (e.key === "Enter") { submitPoi(e); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  // load children POIs of a destination
  const loadChildren = async (dest) => {
    setActiveDest(dest);
    setChildren([]);
    setLoadingChildren(true);
    try {
      // huỷ request trước (nếu có)
      if (childrenAbortRef.current) childrenAbortRef.current.abort();
      const controller = new AbortController();
      childrenAbortRef.current = controller;

      const res = await getChildren(dest.slug, { kind: "POI", page: 0, size: 8 }, { signal: controller.signal });
      if (res.success) {
        setChildren(res.data.items || []);
      } else {
        setChildren([]);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("loadChildren failed", e);
      setChildren([]);
    } finally {
      setLoadingChildren(false);
    }
  };

  const tabClass = (tab) =>
    `pb-2 font-semibold transition-colors ${
      activeTab === tab ? "border-b-2 border-primary text-primary"
                        : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-secondary"}`;

  const subTabClass = (tab) =>
    `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      serviceTab === tab ? "bg-primary text-white"
                         : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"}`;

  return (
    <div className="max-w-8xl -mt-16 mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-xl p-6 relative z-20">
      {/* Tabs */}
      <div className="flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab("services")} className={tabClass("services")}>Dịch vụ</button>
        <button onClick={() => setActiveTab("locations")} className={tabClass("locations")}>Địa điểm</button>
        <button onClick={() => setActiveTab("plans")} className={tabClass("plans")}>Lịch trình</button>
      </div>

      {/* Services */}
      {activeTab === "services" && (
        <div>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setServiceTab("hotel")} className={subTabClass("hotel")}>Khách sạn</button>
            <button onClick={() => setServiceTab("restaurant")} className={subTabClass("restaurant")}>Quán ăn</button>
          </div>
          {serviceTab === "hotel" ? <HotelSearchForm /> : <RestaurantSearchForm />}
        </div>
      )}

      {/* Locations with typeahead (DESTINATIONS + side panel) */}
      {activeTab === "locations" && (
        <form onSubmit={submitPoi} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div ref={boxRef} className="relative">
            <TextInput
              icon={<FaMapMarkerAlt />}
              placeholder="Nhập địa điểm (chỉ địa điểm lớn, ví dụ: Hà Nội, Đà Nẵng...)"
              value={poiQuery}
              onChange={(v) => { setPoiQuery(v); setHi(-1); }}
              onKeyDown={onKeyDown}
              onFocus={() => setOpen(Boolean(poiQuery))}
            />

            {open && (
              <div className="absolute mt-1 w-full md:w-[720px] lg:w-[820px] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <div className="flex">
                  {/* Cột gợi ý DESTINATION */}
                  <div className="w-full md:w-[55%] max-h-80 overflow-auto">
                    {loadingSuggest && <div className="px-3 py-2 text-sm text-gray-500">Đang tìm...</div>}
                    {!loadingSuggest && (!suggestions?.length) && (
                      <div className="px-3 py-2 text-sm text-gray-500">Không có gợi ý</div>
                    )}
                    {suggestions?.map((it, idx) => (
                      <button
                        type="button"
                        key={it.slug}
                        onMouseDown={() => navigate(`/place/${it.slug}`)}
                        onMouseEnter={() => { setHi(idx); loadChildren({ slug: it.slug, name: it.name }); }}
                        className={`w-full text-left px-3 py-2 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          idx === hi ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                      >
                        {it.coverImageUrl
                          ? <img src={it.coverImageUrl} alt={it.name} className="w-10 h-10 object-cover rounded" />
                          : <div className="w-10 h-10 bg-gray-200 rounded" />
                        }
                        <div>
                          <div className="text-sm font-medium">{it.name}</div>
                          <div className="text-xs text-gray-500">{it.addressLine || it.provinceName}</div>
                        </div>
                      </button>
                    ))}
                    {poiQuery?.trim() && (
                      <div className="border-t dark:border-gray-700">
                        <button
                          type="button"
                          onMouseDown={() => { goPlaces({ q: poiQuery, kind: "DESTINATION", page: 0, size: 9 }); setOpen(false); }}
                          className="w-full px-3 py-2 text-sm text-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Tìm “{poiQuery}”
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cột preview POIs */}
                  <div className="hidden md:block md:w-[45%] border-l dark:border-gray-700 max-h-80 overflow-auto">
                    <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-500">
                      {activeDest ? `Nổi bật ở ${activeDest.name}` : "Điểm tham quan"}
                    </div>
                    {loadingChildren && <div className="px-3 py-2 text-sm text-gray-500">Đang tải điểm tham quan…</div>}
                    {!loadingChildren && children.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">Chưa có dữ liệu</div>
                    )}
                    {!loadingChildren && children.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onMouseDown={() => navigate(`/place/${c.slug}`)}
                        className="w-full px-3 py-2 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {c.coverImageUrl
                          ? <img src={c.coverImageUrl} alt={c.name} className="w-10 h-10 object-cover rounded" />
                          : <div className="w-10 h-10 bg-gray-200 rounded" />
                        }
                        <div>
                          <div className="text-sm">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.shortDescription || c.addressLine}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="bg-primary hover:bg-primaryHover">Tìm địa điểm</Button>
        </form>
      )}

      {/* Plans – giữ chỗ */}
      {activeTab === "plans" && (
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={(e) => e.preventDefault()}>
          <TextInput icon={<FaMapMarkerAlt />} placeholder="Điểm đến chính" value={""} onChange={() => {}} />
          <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <input type="date" className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200" />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primaryHover">Tạo lịch trình</Button>
        </form>
      )}
    </div>
  );
}