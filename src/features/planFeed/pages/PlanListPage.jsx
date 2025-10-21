import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Button from "../../../components/Button";
import PlanPostCard from "../components/PlanPostCard";
import PostSkeleton from "../components/PostSkeleton";
import { fetchPlans } from "../services/planService"

const ME = {
  id: "u_me",
  name: "Bạn",
  avatar: "https://i.pravatar.cc/80?img=5",
};

export default function PlanListPage() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPlans(page, 3); // mỗi lần 3 plan
        if (page === 1) setPlans(data.items);
        else setPlans((prev) => [...prev, ...data.items]);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [page]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />

      <main className="flex-1 max-w-2xl w-full mx-auto pt-24 pb-12 px-3">
        {/* Composer giả */}
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
              <Button
                className="bg-primary hover:bg-primaryHover"
                onClick={() => setPage((p) => p + 1)}
              >
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
