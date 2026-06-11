import { useMemo, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SearchBar from "../../../components/SearchBar";
import SearchResultCard from "../components/SearchResultCard";
import ServiceDetailModal from "../components/ServiceDetailModal";
import FilterSidebar from "../components/FilterSidebar";

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({});

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      if (filters.maxPrice != null && item.price > filters.maxPrice) {
        return false;
      }
      if (Array.isArray(filters.stars) && filters.stars.length > 0) {
        const minStar = Math.min(...filters.stars);
        if (Math.floor(item.rating) < minStar) {
          return false;
        }
      }
      return true;
    });
  }, [results, filters]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral dark:bg-gray-950">
      <Navbar fixedWhite />

      <main className="flex-1 max-w-7xl mx-auto mt-24 px-6 pt-12 ">
        {/* Thanh tìm kiếm nằm trên cùng */}
        <div className="mb-8">
          <SearchBar onSearch={(data) => setResults(data)} />
        </div>

        {/* Chia 2 cột: Sidebar + Kết quả */}
        <div className="flex gap-6">
          {/* Sidebar filter bên trái */}
          <FilterSidebar onFilter={setFilters} />

          {/* Kết quả bên phải */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((item) => (
                <SearchResultCard
                  key={item.id}
                  data={item}
                  onClick={() => setSelected(item)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {selected && (
        <ServiceDetailModal
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <Footer />
    </div>
  );
}
