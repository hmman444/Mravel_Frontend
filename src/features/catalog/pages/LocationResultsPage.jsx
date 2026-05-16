import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import { makePlaceDisplay } from "../../../utils/makePlaceDisplay";
import { usePlaceDetail } from "../hooks/usePlaceDetail";
import { getPlacesFaceted } from "../services/catalogService";

/* components */
import FadeInSection from "../../../components/FadeInSection";
import ControlBar from "../components/place/ControlBar";
import FilterSidebar from "../components/place/FilterSidebar";
import SuggestedDestinations from "../components/place/SuggestedDestinations";
import TopSearchBar from "../components/place/TopSearchBar";
import ResultGrid from "../components/ResultGrid";
import ResultList from "../components/ResultList";

const EMPTY_FILTERS = { categorySlugs: [], priceLevel: null };

export default function LocationResultsPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const spec = sp.get("spec");
  const q = sp.get("q");

  const { data: dest } = usePlaceDetail(spec || "");

  /* UI state */
  const [label, setLabel] = useState(q || "");
  const [items, setItems] = useState([]);
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* sort & view */
  const [sortBy, setSortBy] = useState("popular");
  const [view, setView] = useState("list");

  /* filters */
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  /* build label */
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

  /* fetch via ES faceted endpoint — scoped to parentSlug */
  useEffect(() => {
    if (!spec) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await getPlacesFaceted({
          parentSlug: spec,
          page,
          size: PAGE_SIZE,
          categorySlugs: appliedFilters.categorySlugs,
          priceLevel: appliedFilters.priceLevel,
        });
        if (cancelled) return;
        setItems(res.data?.results ?? []);
        setFacets(res.data?.facets ?? null);
        setTotalPages(res.data?.totalPages ?? 0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [spec, page, appliedFilters]);

  /* submit từ search bar */
  const onSubmitSearch = ({ text, slug }) => {
    if (slug)
      navigate(`/locations/search?spec=${encodeURIComponent(slug)}`);
    else navigate(`/locations/search?q=${encodeURIComponent(text || "")}`);
    setPage(0);
    setAppliedFilters(EMPTY_FILTERS);
    setFacets(null);
  };

  /* nhận filters đã áp dụng từ sidebar */
  const onApplyFilters = (filters) => {
    setAppliedFilters(filters || EMPTY_FILTERS);
    setPage(0);
  };

  /* sort only — all filtering is server-side via ES */
  const displayed = [...items].sort((a, b) => {
    if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
    return 0;
  });

  const noDataOnFirstPage = !loading && displayed.length === 0 && page === 0;
  const endOfList = !loading && items.length === 0 && page > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="h-16 md:h-20" aria-hidden />

      <FadeInSection>
        <TopSearchBar initialLabel={label} onSubmit={onSubmitSearch} />
      </FadeInSection>

      <main className="flex-1 w-full">
        <FadeInSection delay={80}>
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <div className="mb-4">
              <ControlBar
                title={dest?.name ? makePlaceDisplay(dest) : q || "Kết quả"}
                count={displayed.length}
                sortBy={sortBy}
                setSortBy={setSortBy}
                view={view}
                setView={setView}
              />
            </div>

            <div className="grid grid-cols-12 gap-6">
              <FilterSidebar onApply={onApplyFilters} facets={facets} />

              <section className="col-span-12 lg:col-span-9">
                {loading && (
                  <div className="text-gray-500 dark:text-gray-400 mb-3">Đang tải…</div>
                )}

                {noDataOnFirstPage && (
                  <div className="text-gray-500 dark:text-gray-400 mb-3">
                    Không tìm thấy địa điểm phù hợp.
                  </div>
                )}

                {endOfList && (
                  <div className="mb-4 text-gray-500 dark:text-gray-400">
                    Bạn đã ở cuối danh sách.
                  </div>
                )}

                {view === "list" ? (
                  <ResultList items={displayed} />
                ) : (
                  <ResultGrid items={displayed} />
                )}

                <div className="flex justify-center gap-3 mt-6">
                  <button
                    className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Trang trước
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primaryHover disabled:opacity-50"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page + 1 >= totalPages}
                  >
                    Trang sau
                  </button>
                </div>
              </section>
            </div>
          </div>
        </FadeInSection>
      </main>

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
