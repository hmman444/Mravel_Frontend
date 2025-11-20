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
import { useMemo } from "react";
import PlanDateInputs from "./PlanDateInputs";

export default function PlanSummary({
  plan,
  images,
  setImages,
  description,
  setDescription,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  const lists = plan?.lists || [];

  const statusData = useMemo(() => {
    let done = 0;
    let active = 0;
    lists.forEach((l) => {
      const cards = l.cards || [];
      const total = cards.length;
      const finished = cards.filter((c) => c.done).length;
      if (total > 0 && finished === total) done++;
      else if (finished > 0) active++;
    });
    return [
      { name: "Hoàn thành", value: done },
      { name: "Đang diễn ra", value: active },
    ];
  }, [lists]);

  const priorityData = useMemo(() => {
    const map = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    lists.forEach((l) => {
      l.cards?.forEach((c) => {
        if (c.priority === "HIGH") map.HIGH++;
        else if (c.priority === "MEDIUM") map.MEDIUM++;
        else map.LOW++;
      });
    });

    return [
      { name: "Cao", value: map.HIGH },
      { name: "Trung bình", value: map.MEDIUM },
      { name: "Thấp", value: map.LOW },
    ];
  }, [lists]);

  const typeData = useMemo(() => {
    const map = {};
    lists.forEach((l) => {
      l.cards?.forEach((c) => {
        const t = c.type || "Khác";
        map[t] = (map[t] || 0) + 1;
      });
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([type, count]) => ({
      type,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    }));
  }, [lists]);

  const teamWork = useMemo(() => {
    const map = {};
    lists.forEach((l) => {
      l.cards?.forEach((c) => {
        const name = c.assigneeName || "Chưa gán";
        map[name] = (map[name] || 0) + 1;
      });
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([name, count]) => ({
      name,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    }));
  }, [lists]);

  const COLORS = ["#6366F1", "#22C55E", "#FACC15", "#F97316"];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setImages([...images, ...urls]);
  };

  const removeImage = (url) => {
    setImages(images.filter((img) => img !== url));
  };

  return (
    <div className="flex flex-col gap-8 p-6 bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg border border-gray-200/60 dark:border-gray-800 transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Status overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tổng quan trạng thái các ngày trong kế hoạch.
          </p>

          <div className="h-60 mt-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={55}
                  label
                >
                  {statusData.map((e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
            Tổng số ngày: {statusData.reduce((a, b) => a + b.value, 0)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg border border-gray-200/60 dark:border-gray-800 transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plan information</h3>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn gọn về kế hoạch..."
            className="w-full mt-3 p-3 rounded-lg border bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 shadow-inner text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            rows={4}
          />

          <PlanDateInputs
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg border border-gray-200/60 dark:border-gray-800 transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Priority breakdown</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Phân tích mức độ ưu tiên.</p>

          <div className="h-60 mt-4">
            <ResponsiveContainer>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg border border-gray-200/60 dark:border-gray-800 transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Types of activities</h3>

          <div className="space-y-4 mt-4">
            {typeData.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span>{item.type}</span>
                  <span>{item.percent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg border border-gray-200/60 dark:border-gray-800 transition hover:shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team workload</h3>

        <div className="mt-4 space-y-4">
          {teamWork.map((m, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm">
                <span>{m.name}</span>
                <span>{m.percent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${m.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg border border-gray-200/60 dark:border-gray-800 transition hover:shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Media</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {images?.length ? (
            images.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  className="h-32 w-full rounded-lg object-cover shadow transition group-hover:scale-105"
                />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Chưa có nội dung.</p>
          )}
        </div>

        <label className="inline-block px-4 py-2 mt-4 border rounded-xl bg-white/50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm">
          + Thêm ảnh / video
          <input hidden type="file" multiple onChange={handleImageUpload} />
        </label>
      </div>
    </div>
  );
}
