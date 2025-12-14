import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useMyPlans } from "../hooks/useMyPlans";
import PlanPostCard from "../../planFeed/components/PlanPostCard";
import PostSkeleton from "../../planFeed/components/PostSkeleton"

export default function MyPlansPanel() {
  const { user } = useSelector((s) => s.auth);
  const { items, loading, hasMore, fetchNext, reload } = useMyPlans();

  const loadMoreRef = useRef();

  // load lần đầu
  useEffect(() => {
    if (user?.id) reload();
  }, [user?.id]);

  // lazy load
  useEffect(() => {
    if (!hasMore) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) fetchNext();
      },
      { rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  if (!loading && items.length === 0)
    return <p className="text-gray-500">Bạn chưa có lịch trình nào.</p>;

  return (
    <div className="space-y-5">
      {items.map((p) => (
        <PlanPostCard key={p.id} plan={p} me={user}
          onOpenDetail={() => (window.location.href = `/plans/${p.id}`)}
        />
      ))}

      {loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {hasMore && <div ref={loadMoreRef} className="h-10" />}
    </div>
  );
}
