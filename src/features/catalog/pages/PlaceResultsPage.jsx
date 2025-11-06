import { useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useCatalogPlaces } from "../hooks/useCatalogPlaces";

const useQuery = () => new URLSearchParams(useLocation().search);

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mt-8">
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

export default function PlaceResultsPage() {
  const q = useQuery();
  const navigate = useNavigate();
  const { items, loading, error, fetchPlaces, page, totalPages, lastQuery } =
    useCatalogPlaces();

  const params = useMemo(
    () => ({
      q: q.get("q") || undefined,
      page: Number(q.get("page") || 0),
      size: Number(q.get("size") || 9),
    }),
    [q]
  );

  const paramsStr = useMemo(() => JSON.stringify(params), [params]);
  const lastQueryStr = useMemo(() => JSON.stringify(lastQuery ?? {}), [lastQuery]);

  useEffect(() => {
    if (paramsStr !== lastQueryStr) fetchPlaces(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsStr, lastQueryStr]);

  const updatePage = useCallback(
    (nextPage) => {
      const next = new URLSearchParams(q.toString());
      next.set("page", String(nextPage));
      navigate(`/search/places?${next.toString()}`, { replace: false });
    },
    [q, navigate]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <header className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-1">Kết quả địa điểm</h1>
          <p className="text-sm text-gray-600">
            Từ khoá: <b>{params.q || "Tất cả"}</b>
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <>
            {/* Lưới kiểu Traveloka: ảnh + overlay + tên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((p) => {
                const bg = p.coverImageUrl || p.images?.[0]?.url;
                return (
                  <Link
                    to={`/place/${p.slug}`}
                    key={p.slug}
                    className="relative overflow-hidden rounded-2xl group shadow-md"
                  >
                    {bg ? (
                      <img
                        src={bg}
                        alt={p.name}
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-100" />
                    )}

                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-3">
                        <h3 className="text-white text-2xl font-semibold drop-shadow">
                          {p.name}
                        </h3>
                        <p className="mt-1 text-white/85 text-sm">
                          {p.addressLine || p.provinceName}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {items.length === 0 && (
                <div className="col-span-full text-gray-500">
                  Không có kết quả phù hợp.
                </div>
              )}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={updatePage} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}