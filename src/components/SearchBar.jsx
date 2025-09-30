import { useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaUtensils, FaHotel } from "react-icons/fa";
import Button from "./Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Sub-form: Khách sạn
function HotelSearchForm() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  return (
    <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Địa điểm */}
      <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
        <FaMapMarkerAlt className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Bạn muốn ở đâu?"
          className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
        />
      </div>

      {/* Ngày nhận phòng */}
      <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
        <FaCalendarAlt className="text-gray-400 mr-2" />
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          placeholderText="Nhận phòng"
          className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-200"
          dateFormat="dd/MM/yyyy"
        />
      </div>

      {/* Ngày trả phòng */}
      <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
        <FaCalendarAlt className="text-gray-400 mr-2" />
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date)}
          selectsEnd
          startDate={checkIn}
          endDate={checkOut}
          minDate={checkIn}
          placeholderText="Trả phòng"
          className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-200"
          dateFormat="dd/MM/yyyy"
        />
      </div>

      {/* Số khách & phòng */}
      <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
        <FaHotel className="text-gray-400 mr-2" />
        <select className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200">
          <option>1 người lớn, 1 phòng</option>
          <option>2 người lớn, 1 phòng</option>
          <option>2 người lớn, 2 phòng</option>
          <option>Gia đình</option>
        </select>
      </div>

      {/* Button */}
      <Button type="submit" className="bg-primary hover:bg-primaryHover">
        Tìm khách sạn
      </Button>
    </form>
  );
}

// Sub-form: Quán ăn
function RestaurantSearchForm() {
  return (
    <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Địa điểm */}
      <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
        <FaMapMarkerAlt className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Nhập địa điểm (TP.HCM, Hà Nội...)"
          className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
        />
      </div>

      {/* Loại món ăn */}
      <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
        <FaUtensils className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Loại ẩm thực (Việt, Nhật, BBQ...)"
          className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
        />
      </div>

      {/* Button */}
      <Button type="submit" className="bg-primary hover:bg-primaryHover">
        Tìm quán ăn
      </Button>
    </form>
  );
}

export default function SearchBar() {
  const [activeTab, setActiveTab] = useState("services");
  const [serviceTab, setServiceTab] = useState("hotel"); // hotel | restaurant

  const tabClass = (tab) =>
    `pb-2 font-semibold transition-colors ${
      activeTab === tab
        ? "border-b-2 border-primary text-primary"
        : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-secondary"
    }`;

  const subTabClass = (tab) =>
    `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      serviceTab === tab
        ? "bg-primary text-white"
        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
    }`;

  return (
    <div className="max-w-8xl -mt-16 mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-xl p-6 relative z-20">
      {/* Tabs chính */}
      <div className="flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab("services")} className={tabClass("services")}>
          Dịch vụ
        </button>
        <button onClick={() => setActiveTab("locations")} className={tabClass("locations")}>
          Địa điểm
        </button>
        <button onClick={() => setActiveTab("plans")} className={tabClass("plans")}>
          Lịch trình
        </button>
      </div>

      {/* Tab Dịch vụ có thêm sub-tab: Khách sạn / Quán ăn */}
      {activeTab === "services" && (
        <div>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setServiceTab("hotel")} className={subTabClass("hotel")}>
              Khách sạn
            </button>
            <button onClick={() => setServiceTab("restaurant")} className={subTabClass("restaurant")}>
              Quán ăn
            </button>
          </div>

          {serviceTab === "hotel" ? <HotelSearchForm /> : <RestaurantSearchForm />}
        </div>
      )}

      {/* Tab Địa điểm */}
      {activeTab === "locations" && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Nhập địa điểm cần tìm"
              className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primaryHover">
            Tìm địa điểm
          </Button>
        </form>
      )}

      {/* Tab Lịch trình */}
      {activeTab === "plans" && (
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Điểm đến chính"
              className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <input type="date" className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200" />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primaryHover">
            Tạo lịch trình
          </Button>
        </form>
      )}
    </div>
  );
}
