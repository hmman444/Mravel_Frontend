"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import PlanPostCard from "../../../planFeed/components/PlanPostCard"; 
import PostSkeleton from "../../../planFeed/components/PostSkeleton"; 
import { usePlans } from "../../../planFeed/hooks/usePlans";

export default function PlanFeedTab({ planId, active }) {
  const { user } = useSelector((s) => s.auth);
  const { current, currentLoading, currentError, loadFeedDetail } = usePlans();

  const loadedKeyRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    if (!planId) return;

    const key = String(planId);
    if (loadedKeyRef.current === key) return;

    loadedKeyRef.current = key;
    loadFeedDetail(Number(planId));
  }, [active, planId, loadFeedDetail]);

  const plan = useMemo(() => {
    if (!current) return null;
    if (String(current.id) !== String(planId)) return null;
    return current;
  }, [current, planId]);

  if (!active) return null;

  return (
    <div className="flex justify-center py-4">
      {/* container khống chế độ rộng */}
      <div className="w-full max-w-[720px] px-2">
        {currentLoading && !current && (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {currentError && !current && (
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50 p-4">
            <div className="text-sm font-semibold text-rose-700">
              Không tải được bài viết
            </div>
            <div className="mt-1 text-xs text-rose-600">
              {currentError}
            </div>
          </div>
        )}

        {current && (
          <PlanPostCard
            plan={current}
            me={user}
            onOpenDetail={() => {}}
          />
        )}
      </div>
    </div>
  );
}