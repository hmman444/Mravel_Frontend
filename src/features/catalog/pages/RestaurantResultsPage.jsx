import { useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCatalogRestaurants } from "../hooks/useCatalogRestaurants";

const useQuery = () => new URLSearchParams(useLocation().search);

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mt-6">
      <button
        className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
        onClick={() => onChange(page - 1)}
        disabled={page <= 0}
      >
        ← Trước
      </button>
      <span className="text-sm text-gray-600">
        Trang {page + 1} / {totalPages}
      </span>
      <button
        className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
        onClick={() => onChange(page + 1)}
        disabled={page + 1 >= totalPages}
      >
        Sau →
      </button>
    </div>
  );
};

export default function RestaurantResultsPage() {
  const q = useQuery();
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    fetchRestaurants,
    page,
    totalPages,
    lastQuery,
  } = useCatalogRestaurants();

  const params = useMemo(() => {
    const raw = q.get("cuisineSlugs");
    const cuisineSlugs = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
    return {
      location: q.get("location") || undefined,
      cuisineSlugs,
      page: Number(q.get("page") || 0),
      size: Number(q.get("size") || 9),
    };
  }, [q]);

  const paramsStr = useMemo(() => JSON.stringify(params), [params]);
  const lastQueryStr = useMemo(() => JSON.stringify(lastQuery ?? {}), [lastQuery]);

  useEffect(() => {
    if (paramsStr !== lastQueryStr) {
      fetchRestaurants(params);
    }
    // tránh đưa fetchRestaurants vào deps
  }, [paramsStr, lastQueryStr]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePage = useCallback(
    (nextPage) => {
      const next = new URLSearchParams(q.toString());
      next.set("page", String(nextPage));
      navigate(`/search/restaurants?${next.toString()}`, { replace: false });
    },
    [q, navigate]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Kết quả quán ăn</h1>
      <p className="text-sm text-gray-500 mb-6">
        {params.location ? (
          <>
            Khu vực: <b>{params.location}</b>.{" "}
          </>
        ) : null}
        {params.cuisineSlugs?.length ? (
          <>
            Ẩm thực: <b>{params.cuisineSlugs.join(", ")}</b>
          </>
        ) : (
          "Tất cả ẩm thực"
        )}
      </p>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((p) => (
              <Link
                to={`/place/${p.slug}`}
                key={p.slug}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {p.coverImageUrl ? (
                  <img src={p.coverImageUrl} alt={p.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-gray-100" />
                )}
                <div className="p-4">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.addressLine || p.provinceName}</div>
                  <div className="text-sm mt-1">
                    ⭐ {p.avgRating} ({p.reviewsCount})
                  </div>
                </div>
              </Link>
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-gray-500">Không có kết quả phù hợp.</div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={updatePage} />
        </>
      )}
    </div>
  );
}