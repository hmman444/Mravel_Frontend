import { useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Button from "../../../components/Button";
import PlanPostCard from "../components/PlanPostCard";
import PostSkeleton from "../components/PostSkeleton";
import { usePlans } from "../hooks/usePlans";
import { useSelector } from "react-redux";

export default function PlanListPage() {
  const { user } = useSelector((s) => s.auth);
  const { items, loading, hasMore, fetchNext, reload } = usePlans();

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar fixedWhite />
      <main className="flex-1 max-w-2xl w-full mx-auto pt-24 pb-12 px-3">
        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-5">
            <div className="flex items-center gap-3">
              <img src={user.avatar} className="w-10 h-10 rounded-full" />
              <button
                onClick={() => (window.location.href = "/plans/new")}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Tạo lịch trình của bạn…
              </button>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {items.map((p) => (
            <PlanPostCard
              key={p.id}
              plan={p}
              me={user}
              onOpenDetail={() => (window.location.href = `/plans/${p.id}`)}
            />
          ))}
          {loading && <PostSkeleton />}
          {hasMore && !loading && (
            <div className="flex justify-center">
              <Button className="bg-primary hover:bg-primaryHover" onClick={fetchNext}>
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
