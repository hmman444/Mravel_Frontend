import { useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCatalogHotels } from "../hooks/useCatalogHotels";

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mt-6">
      <button className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onChange(page - 1)} disabled={page <= 0}>← Trước</button>
      <span className="text-sm text-gray-600">Trang {page + 1} / {totalPages}</span>
      <button className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onChange(page + 1)} disabled={page + 1 >= totalPages}>Sau →</button>
    </div>
  );
};

export default function HotelResultsPage() {
  const { search } = useLocation();
  const q = useMemo(() => new URLSearchParams(search), [search]);

  const navigate = useNavigate();
  const { items, loading, error, fetchHotels, page, totalPages } = useCatalogHotels();

  // Lấy primitives từ q để render (không dùng làm deps)
  const locationQ = q.get("location") || undefined;
  const checkIn = q.get("checkIn") || undefined;
  const checkOut = q.get("checkOut") || undefined;
  const adults = Number(q.get("adults") || 1);
  const rooms = Number(q.get("rooms") || 1);
  const pageQ = Number(q.get("page") || 0);
  const sizeQ = Number(q.get("size") || 9);

  useEffect(() => {
    fetchHotels({
      location: locationQ,
      checkIn,
      checkOut,
      adults,
      rooms,
      page: pageQ,
      size: sizeQ,
    });
  }, [search]); // ❗ Chỉ theo dõi querystring

  const updatePage = useCallback((nextPage) => {
    const next = new URLSearchParams(q.toString());
    next.set("page", String(nextPage));
    navigate(`/search/hotels?${next.toString()}`, { replace: false });
  }, [q, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Kết quả khách sạn</h1>
      <p className="text-sm text-gray-500 mb-6">
        {locationQ ? <>Địa điểm: <b>{locationQ}</b>. </> : null}
        {checkIn ? <>Nhận phòng: <b>{checkIn}</b>. </> : null}
        {checkOut ? <>Trả phòng: <b>{checkOut}</b>. </> : null}
        Người lớn: <b>{adults}</b>, Phòng: <b>{rooms}</b>
      </p>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && <div className="text-red-500">{String(error)}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((p) => (
              <Link to={`/place/${p.slug}`}
                    key={p.id ?? p.slug}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="h-40 w-full bg-gray-100" />
                <div className="p-4">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.addressLine || p.provinceName}</div>
                  <div className="text-sm mt-1">⭐ {p.avgRating} ({p.reviewsCount})</div>
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