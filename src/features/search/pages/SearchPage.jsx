import { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SearchBar from "../../../components/SearchBar";
import SearchResultCard from "../components/SearchResultCard";
import ServiceDetailModal from "../components/ServiceDetailModal";
import FilterSidebar from "../components/FilterSidebar";

export default function SearchPage() {
  const [results, setResults] = useState([
    {
      id: 1,
      name: "Khách sạn Đà Lạt",
      type: "hotel",
      price: 500000,
      rating: 4.5,
      location: "Đà Lạt",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjQKUAHSGtx8u6jLRldTvkZDxeiMgoqaNpLQ&s",
    },
    {
      id: 2,
      name: "Nhà hàng Sapa View",
      type: "restaurant",
      price: 200000,
      rating: 4.2,
      location: "Sapa",
      img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/3e/a9/4e/the-sapa-sky-view-restaurant.jpg?w=900&h=-1&s=1",
    },
  ]);
  const [selected, setSelected] = useState(null);

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
          <FilterSidebar onFilter={(filters) => console.log(filters)} />

          {/* Kết quả bên phải */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
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
