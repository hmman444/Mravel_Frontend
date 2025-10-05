import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Button from "../../../components/Button";
import PlanPostCard from "../components/PlanPostCard";
import PostSkeleton from "../components/PostSkeleton";

// mock “current user”
const ME = {
  id: "u_me",
  name: "Bạn",
  avatar: "https://i.pravatar.cc/80?img=5",
};

// mock dữ liệu
const MOCK_PLANS = [
  {
    id: "p1",
    title: "Trip Đà Lạt chill chill",
    description:
      "Lịch trình 3N2Đ: Dạo Hồ Xuân Hương – Cafe lưng chừng đồi – Săn mây Đồi Chè Cầu Đất – Food tour chợ đêm…",
    startDate: "12/11/2025",
    endDate: "14/11/2025",
    days: 3,
    visibility: "public", // public | friends | private
    views: 321,
    author: { id: "u1", name: "Lan Phạm", avatar: "https://i.pravatar.cc/80?img=11" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    destinations: [{ name: "Hồ Xuân Hương" }, { name: "Langbiang" }, { name: "Cầu Đất" }],
    images: [
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    ],
    reactions: { like: 4, love: 2 },
    comments: [
      {
        id: "c1",
        user: { id: "u2", name: "Minh Trần", avatar: "https://i.pravatar.cc/80?img=3" },
        text: "Đi vào tháng 11 có lạnh không bạn?",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "p2",
    title: "Huế – Nét trầm cổ kính",
    description:
      "2N1Đ tham quan Kinh Thành, Lăng Tự Đức, thưởng thức ẩm thực Huế về đêm, du thuyền sông Hương.",
    startDate: "18/12/2025",
    endDate: "19/12/2025",
    days: 2,
    visibility: "friends",
    views: 107,
    author: { id: "u3", name: "Khánh Dương", avatar: "https://i.pravatar.cc/80?img=9" },
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    destinations: [{ name: "Kinh thành Huế" }, { name: "Lăng Tự Đức" }],
    images: [
      "https://images.unsplash.com/photo-1558980664-10ea2927a93e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
    ],
    reactions: { like: 1 },
    comments: [],
  },
];

export default function PlanListPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [page, setPage] = useState(1);

  // giả lập gọi API + skeleton
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const pageSize = 1; // mỗi lần nạp 1 post cho dễ thấy skeleton
      const start = (page - 1) * pageSize;
      const next = MOCK_PLANS.slice(start, start + pageSize);
      setPlans(prev => [...prev, ...next]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, [page]);

  const loadMore = () => setPage((p) => p + 1);
  const hasMore = plans.length < MOCK_PLANS.length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />

      <main className="flex-1 max-w-2xl w-full mx-auto pt-24 pb-12 px-3">
        {/* Composer giả: tạo lịch trình */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-5">
          <div className="flex items-center gap-3">
            <img src={ME.avatar} className="w-10 h-10 rounded-full" />
            <button
              onClick={() => (window.location.href = "/plans/new")}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Tạo lịch trình của bạn…
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-5">
          {plans.map((p) => (
            <PlanPostCard
              key={p.id}
              plan={p}
              me={ME}
              onOpenDetail={() => (window.location.href = `/plans/${p.id}`)}
            />
          ))}

          {loading && <PostSkeleton />}

          {hasMore && !loading && (
            <div className="flex justify-center">
              <Button className="bg-primary hover:bg-primaryHover" onClick={loadMore}>
                Tải thêm
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
