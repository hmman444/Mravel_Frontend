import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { usePlaceDetail } from "../hooks/usePlaceDetail";
import PlaceContentRenderer from "../components/PlaceContentRenderer";
import DetailThumbStripPeek from "../components/DetailThumbStripPeek";

export default function PlaceDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = usePlaceDetail(slug);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10">Đang tải...</div>
        <Footer />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10 text-red-500">
          {String(error)}
        </div>
        <Footer />
      </div>
    );
  }
  if (!data) return null;

  const coverImg =
    data.images?.find((i) => i.cover)?.url ||
    data.coverImageUrl ||
    data.images?.[0]?.url ||
    "";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* HERO giữ nguyên */}
      {coverImg && (
        <section
          className="relative h-[520px] md:h-[600px] bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImg})` }}
        >
          <div className="absolute inset-0 bg-black/35"></div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow">
              {data.name}
            </h1>
            <p className="mt-3 text-white/90">
              {data.addressLine || data.provinceName}
            </p>
          </div>
        </section>
      )}

      {/* STRIP ảnh con (cover=false) — kiểu peek, cách hero một đoạn ngắn */}
      <DetailThumbStripPeek
        images={data.images || []}
        interval={1600}
        visible={3}
        gap={10}
        edgePadding={8}
        aspect={4/3}             // cao hơn, nhìn “đã” hơn
        edgeFade={40}
        minThumbWidth={360}      // ép mỗi ảnh >= 360px (tăng nữa nếu thích)
        containerClass="max-w-screen-xl" // rộng hơn 7xl nếu màn hình lớn
      />

      {/* Nội dung bài viết */}
      <main className="max-w-6xl mx-auto px-6 pt-6 pb-10">
        {!coverImg && (
          <header className="mb-6">
            <h1 className="text-3xl font-bold">{data.name}</h1>
            <p className="text-gray-500">
              {data.addressLine || data.provinceName}
            </p>
          </header>
        )}

        <PlaceContentRenderer content={data.content} />
      </main>

      <Footer />
    </div>
  );
}