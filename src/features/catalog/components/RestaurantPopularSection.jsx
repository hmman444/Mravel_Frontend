// src/features/restaurants/components/RestaurantPopularSection.jsx
export default function RestaurantPopularSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-10 pb-10 w-full">
      <h2 className="mt-4 mb-4 text-xl font-semibold">Quán ăn phổ biến</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden border dark:border-white/10 bg-white dark:bg-gray-900"
          >
            <div className="h-44 bg-gray-200" />
            <div className="p-4">
              <div className="font-semibold line-clamp-1">
                Quán ăn Demo {idx + 1}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Quận 1, TP.HCM
              </div>
              <div className="mt-2 text-orange-600 font-semibold">
                từ 79.000 VND/món
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}