import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlanGridCard from "../../planFeed/components/PlanGridCard";
import { fetchPlans } from "../../planFeed/services/planService";

function PlanSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-video animate-pulse bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export default function PlanSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchPlans(1, 3);
        if (cancelled) return;
        setPlans(data?.items || []);
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Khong tai duoc goi y lich trinh."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlanSkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      );
    }

    if (!plans.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-gray-900/70 dark:text-slate-400">
          Hien chua co lich trinh goi y de hien thi.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanGridCard key={plan.id} plan={plan} />
        ))}
      </div>
    );
  };

  return (
    <section className="border-y border-slate-200/70 bg-gradient-to-br from-sky-50 via-blue-50/40 to-emerald-50/30 py-14 dark:border-white/5 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 md:text-3xl">
              Goi y lich trinh
            </h2>
            <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              Kham pha nhung lich trinh that tu cong dong Mravel va tai su dung
              chung nhu diem bat dau cho chuyen di cua ban.
            </p>
          </div>

          <Link
            to="/plans"
            className="hidden items-center gap-1 text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200 sm:inline-flex"
          >
            Xem tat ca lich trinh →
          </Link>
        </div>

        {renderContent()}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/plans"
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-sky-900/60 dark:bg-gray-900/80 dark:text-sky-300"
          >
            Xem bang tin lich trinh
          </Link>
          <Link
            to="/plans/my-plans"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Tao lich trinh cua ban
          </Link>
        </div>
      </div>
    </section>
  );
}
