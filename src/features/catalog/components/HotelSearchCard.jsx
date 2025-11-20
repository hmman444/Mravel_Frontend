// HotelSearchCard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaSearch,
  FaHistory,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import Button from "../../../components/Button";
import DestinationTypeahead from "../../../components/DestinationTypeahead";

/* ───────── Small helpers ───────── */
function RowField({ label, children, onClick, refBox, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="text-[13px] font-semibold text-gray-700">{label}</div>
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

const VN_DATE = (d) =>
  d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ───────── Main Component ───────── */
export default function HotelSearchCard({ onSubmit }) {
  /* ── Destination ── */
  const [dest, setDest] = useState({ text: "", slug: null });

  /* ── Dates & nights (default: hôm nay + 1 đêm) ── */
  const [checkIn, setCheckIn] = useState(() => new Date());
  const [nights, setNights] = useState(1);
  const checkOut = useMemo(() => {
    const d = new Date(checkIn ?? new Date());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (Number.isFinite(nights) ? nights : 1));
    return d;
  }, [checkIn, nights]);

  /* ── Nights dropdown ── */
  const [openNights, setOpenNights] = useState(false);
  const nightsBoxRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (nightsBoxRef.current && !nightsBoxRef.current.contains(e.target)) {
        setOpenNights(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const nightList = Array.from({ length: 30 }, (_, i) => i + 1);

  /* ── Guests & rooms dropdown ── */
  const [openGuests, setOpenGuests] = useState(false);
  const guestsBoxRef = useRef(null);
  const [adults, setAdults] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState([]); // numbers 0..8, where 0= "<1"

  useEffect(() => {
    // sync ages array length with children count
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

  /* ── Submit ── */
  const submit = () => {
    onSubmit?.({
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
    <div className="rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-200 overflow-visible">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-t-2xl">
        <FaHistory className="text-primary" />
        <span className="font-semibold text-gray-800">Khách sạn xem gần đây</span>
      </div>

      {/* Body */}
      <div className="px-5 pb-6 pt-4">
                {/* Địa điểm */}
        <div className="mb-4">
          <div className="text-[13px] font-semibold text-gray-700 mb-1">
            Thành phố, địa điểm hoặc tên khách sạn:
          </div>
          <div className="h-12 rounded-lg px-3 bg-white flex items-center border border-gray-300 w-full">
            <DestinationTypeahead
              label={null}
              placeholder="Thành phố, khách sạn, điểm đến"
              onSubmit={({ text, slug }) => setDest({ text, slug })}
              className="flex-1 min-w-0 w-full !max-w-none !mx-0"
              buttonSlot={null}
            />
          </div>
        </div>

        {/* Hàng: Nhận phòng / Số đêm / Trả phòng */}
        <div className="grid grid-cols-12 gap-4">
          {/* Nhận phòng */}
          <div className="col-span-12 md:col-span-4">
            <RowField label="Nhận phòng:">
              <FaCalendarAlt className="text-gray-400 mr-2" />
              <DatePicker
                selected={checkIn}
                onChange={(d) => setCheckIn(d || new Date())}
                minDate={new Date()}
                placeholderText="Chọn ngày"
                className="w-full outline-none bg-transparent"
                dateFormat="EEE, dd MMM yyyy"
              />
            </RowField>
          </div>

          {/* Số đêm (custom dropdown) */}
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

          {/* Trả phòng (read-only, auto from nights) */}
          <div className="col-span-12 md:col-span-4">
            <RowField label="Trả phòng:">
              <FaCalendarAlt className="text-gray-400 mr-2" />
              <input
                readOnly
                value={checkOut ? VN_DATE(checkOut) : ""}
                placeholder="—"
                className="w-full bg-transparent outline-none"
                title="Tự tính theo số đêm"
              />
            </RowField>
          </div>
        </div>

        {/* Hàng: Khách & Phòng + Nút tìm kiếm */}
        <div className="grid grid-cols-12 gap-4 mt-4">
          {/* Khách & Phòng (custom dropdown) */}
          <div className="col-span-12 md:col-span-8">
            <RowField
              label="Khách và Phòng:"
              onClick={() => !openGuests && setOpenGuests(true)}
              refBox={guestsBoxRef}
            >
              <FaUsers className="text-gray-400 mr-2" />
              <span className="text-gray-800 select-none">
                {adults} người lớn, {children} Trẻ em, {rooms} phòng
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
                        className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          setAdults((v) => Math.max(1, v - 1));
                        }}
                      >
                        <FaMinus />
                      </button>
                      <span className="w-6 text-center">{adults}</span>
                      <button
                        className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                        onMouseDown={(e) => e.stopPropagation()}
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
                        className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          setChildren((v) => Math.max(0, v - 1));
                        }}
                      >
                        <FaMinus />
                      </button>
                      <span className="w-6 text-center">{children}</span>
                      <button
                        className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                        onMouseDown={(e) => e.stopPropagation()}
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
                        className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          setRooms((v) => Math.max(1, v - 1));
                        }}
                      >
                        <FaMinus />
                      </button>
                      <span className="w-6 text-center">{rooms}</span>
                      <button
                        className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          setRooms((v) => v + 1);
                        }}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>

                  {/* Độ tuổi trẻ em (tối đa 3 select mỗi hàng) */}
                  {children > 0 && (
                    <>
                      <div className="mt-3 text-sm text-gray-600">
                        Điền tuổi của trẻ để giúp chúng tôi tìm được phòng phù hợp
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {childrenAges.map((age, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Trẻ em {idx + 1}</span>
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

          {/* Nút tìm kiếm */}
          <div className="col-span-12 md:col-span-4 flex items-end">
            <Button
              onClick={submit}
              className="w-full h-12 rounded-lg bg-[#ff6a00] hover:bg-[#ff5a00] text-white font-semibold inline-flex items-center justify-center gap-2"
            >
              <FaSearch />
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Link tuỳ chọn */}
        <div className="mt-4">
          <button className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:underline">
            <img
              src="https://img.icons8.com/?size=16&id=12634&format=png"
              alt=""
              className="inline-block"
            />
            Thanh Toán Tại Khách Sạn
          </button>
        </div>
      </div>
    </div>
  );
}