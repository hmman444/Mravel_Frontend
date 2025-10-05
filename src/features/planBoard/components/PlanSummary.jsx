import {
  FaChartPie,
  FaCalendarAlt,
  FaWalking,
  FaUtensils,
  FaBed,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function PlanSummary({
  plan,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  images,
  setImages,
  description,
  setDescription,
}) {
  // Demo: thống kê trạng thái các ngày
  const statusData = [
    { name: "Hoàn thành", value: 2 },
    { name: "Đang diễn ra", value: 1 },
  ];

  // Demo: độ ưu tiên của các hoạt động trong ngày
  const priorityData = [
    { name: "Cao", value: 3 },
    { name: "Trung bình", value: 5 },
    { name: "Thấp", value: 2 },
  ];

  // Demo: loại hoạt động (types of work)
  const typeData = [
    { type: "Tham quan", percent: 40 },
    { type: "Ăn uống", percent: 30 },
    { type: "Nghỉ ngơi", percent: 30 },
  ];

  // Demo: workload của từng người
  const teamWork = [
    { name: "Luân Đỗ Phú", percent: 60 },
    { name: "Văn A", percent: 25 },
    { name: "Minh Mẫn", percent: 15 },
  ];

  const COLORS = ["#4F46E5", "#22C55E", "#FACC15", "#F97316"];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setImages([...images, ...urls]);
  };

  const removeImage = (url) => {
    setImages(images.filter((img) => img !== url));
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
      {/* === Hàng trên: Thống kê tổng quan === */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Biểu đồ trạng thái */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Status overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tổng quan trạng thái các ngày trong kế hoạch.
          </p>

          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  innerRadius={50}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-400">
            Tổng số ngày: {statusData.reduce((a, b) => a + b.value, 0)}
          </p>
        </div>

        {/* Thông tin mô tả */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Plan information
          </h3>
          <textarea
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn gọn về kế hoạch..."
            className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-300 mb-4 border rounded p-2 resize-y overflow-y-auto"
            rows={4}
          />
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              <span>Từ:</span>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                dateFormat="dd/MM/yyyy"
                className="ml-2 outline-none bg-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              <span>Đến:</span>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                className="ml-2 outline-none bg-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* === Hàng giữa: Priority breakdown & Type of work === */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Priority breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Phân tích mức độ ưu tiên trong kế hoạch.
          </p>

          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Types of work */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Types of activities
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Phân loại các hoạt động trong kế hoạch của bạn.
          </p>

          <div className="space-y-3">
            {typeData.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    {i === 0 ? (
                      <FaWalking className="text-pink-500" />
                    ) : i === 1 ? (
                      <FaUtensils className="text-amber-500" />
                    ) : (
                      <FaBed className="text-blue-500" />
                    )}
                    {item.type}
                  </span>
                  <span>{item.percent}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div
                    className="h-2 bg-gray-600 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === Hàng dưới: Team workload === */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Team workload
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Phân bố khối lượng công việc giữa các thành viên.
        </p>

        <div className="space-y-4">
          {teamWork.map((member, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {member.name}
                </span>
                <span>{member.percent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${member.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === Hình ảnh / video === */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Media
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          {images?.length > 0 ? (
            images.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  className="rounded-lg object-cover h-32 w-full transition-transform duration-200 group-hover:scale-105"
                  alt="plan-media"
                />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Chưa có ảnh hoặc video nào.
            </p>
          )}
        </div>
        <label className="inline-block px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          + Thêm ảnh / video
          <input type="file" multiple hidden onChange={handleImageUpload} />
        </label>
      </div>
    </div>
  );
}
