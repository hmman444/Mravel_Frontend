import { useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaTasks } from "react-icons/fa";
import Button from "../../../components/Button";

export default function SearchBar() {
  const [activeTab, setActiveTab] = useState("services");

  const tabClass = (tab) =>
    `pb-2 font-semibold transition-colors ${
      activeTab === tab
        ? "border-b-2 border-primary text-primary"
        : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-secondary"
    }`;

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-xl -mt-16 p-6 relative z-20">
      {/* Tabs */}
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

      {/* Form: Dịch vụ */}
      {activeTab === "services" && (
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
            <FaTasks className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Nhập tên dịch vụ (khách sạn, tour...)"
              className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Địa điểm"
              className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <Button type="submit" className="bg-accent hover:bg-accent-light">
            Tìm dịch vụ
          </Button>
        </form>
      )}

      {/* Form: Địa điểm */}
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
          <Button type="submit" className="bg-accent hover:bg-accent-light">
            Tìm địa điểm
          </Button>
        </form>
      )}

      {/* Form: Lịch trình */}
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
            <input
              type="date"
              className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <Button type="submit" className="bg-accent hover:bg-accent-light">
            Tạo lịch trình
          </Button>
        </form>
      )}
    </div>
  );
}
