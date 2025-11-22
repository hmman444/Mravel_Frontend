import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import { makePlaceDisplay } from "../../../utils/makePlaceDisplay";
import { usePlaceDetail } from "../hooks/usePlaceDetail";
import { getChildren } from "../services/catalogService";

/* components */
import FadeInSection from "../../../components/FadeInSection"; // <-- thêm
import ControlBar from "../components/place/ControlBar";
import FilterSidebar from "../components/place/FilterSidebar";
import SuggestedDestinations from "../components/place/SuggestedDestinations";
import TopSearchBar from "../components/place/TopSearchBar";
import ResultGrid from "../components/ResultGrid";
import ResultList from "../components/ResultList";

export default function LocationResultsPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const spec = sp.get("spec"); // slug đích
  const q = sp.get("q"); // text fallback

  const { data: dest } = usePlaceDetail(spec || "");

  /* UI state */
  const [label, setLabel] = useState(q || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  /* sort & view */
  const [sortBy, setSortBy] = useState("popular"); // popular | name_asc | name_desc
  const [view, setView] = useState("list"); // list | grid

  /* filters */
  const [appliedFilters, setAppliedFilters] = useState({
    types: [],
    popular: {},
  });

  /* build label hiển thị */
  useEffect(() => {
    if (dest?.name) {
      const tail = dest?.provinceName
        ? `, ${dest.provinceName}`
        : dest?.countryCode === "VN"
        ? ", Việt Nam"
        : "";
      setLabel(`${dest.name}${tail}`);
    } else {
      setLabel(q || "");
    }
  }, [dest, q]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [spec, q, page]);

  /* fetch children theo trang */
  useEffect(() => {
    const run = async () => {
      if (!spec) return;
      setLoading(true);
      try {
        const res = await getChildren(spec, {
          kind: "POI",
          page,
          size: PAGE_SIZE,
        });
        const arr = res?.data?.items || [];
        setItems(arr);
        setHasNext(arr.length === PAGE_SIZE); // nếu < size: hết
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [spec, page]);

  /* submit từ search bar */
  const onSubmitSearch = ({ text, slug }) => {
    if (slug)
      navigate(`/locations/search?spec=${encodeURIComponent(slug)}`);
    else navigate(`/locations/search?q=${encodeURIComponent(text || "")}`);
    setPage(0);
  };

  /* nhận filters đã áp dụng từ sidebar */
  const onApplyFilters = (filters) => {
    setAppliedFilters(filters || { types: [], popular: {} });
    setPage(0);
  };

  /* filter & sort CLIENT-SIDE (demo) */
  const displayed = useMemo(() => {
    let arr = [...items];

    if (appliedFilters.types?.length) {
      arr = arr.filter((p) => {
        const text = `${p.shortDescription || ""} ${
          p.name || ""
        }`.toLowerCase();
        return appliedFilters.types.some((t) =>
          text.includes(t.toLowerCase())
        );
      });
    }

    if (sortBy === "name_asc")
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sortBy === "name_desc")
      arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    // popular: giữ nguyên

    return arr;
  }, [items, appliedFilters, sortBy]);

  const noDataOnFirstPage =
    !loading && displayed.length === 0 && page === 0;
  const endOfList = !loading && items.length === 0 && page > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* né fixed navbar */}
      <div className="h-16 md:h-20" aria-hidden />

      {/* Top search bar có hiệu ứng xuất hiện nhẹ */}
      <FadeInSection>
        <TopSearchBar initialLabel={label} onSubmit={onSubmitSearch} />
      </FadeInSection>

      <main className="flex-1 w-full">
        {/* khu nội dung chính: control bar + sidebar + results */}
        <FadeInSection delay={80}>
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <div className="mb-4">
              <ControlBar
                title={
                  dest?.name ? makePlaceDisplay(dest) : q || "Kết quả"
                }
                count={displayed.length}
                sortBy={sortBy}
                setSortBy={setSortBy}
                view={view}
                setView={setView}
              />
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar (bấm Áp dụng mới lọc) */}
              <FilterSidebar onApply={onApplyFilters} />

              <section className="col-span-12 lg:col-span-9">
                {loading && (
                  <div className="text-gray-500 mb-3">Đang tải…</div>
                )}

                {noDataOnFirstPage && (
                  <div className="text-gray-500 mb-3">
                    Không tìm thấy địa điểm phù hợp.
                  </div>
                )}

                {endOfList && (
                  <div className="mb-4 text-gray-500">
                    Bạn đã ở cuối danh sách.
                  </div>
                )}

                {/* Results */}
                {view === "list" ? (
                  <ResultList items={displayed} />
                ) : (
                  <ResultGrid items={displayed} />
                )}

                {/* Pagination */}
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Trang trước
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primaryHover disabled:opacity-50"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNext}
                  >
                    Trang sau
                  </button>
                </div>
              </section>
            </div>
          </div>
        </FadeInSection>
      </main>

      {/* Gợi ý Destination khác – fade-in riêng */}
      <section className="w-full border-t border-gray-200 dark:border-white/10">
        <FadeInSection delay={120}>
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
            <h2 className="text-xl font-semibold mb-4">
              Các địa điểm khác có thể bạn sẽ thích
            </h2>
            <SuggestedDestinations currentSlug={spec || ""} size={6} />
          </div>
        </FadeInSection>
      </section>

      <Footer />
    </div>
  );
}