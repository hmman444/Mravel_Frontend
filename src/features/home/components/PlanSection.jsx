export default function PlanSection() {
  const plans = [
    { id: 1, name: "Hành trình Đà Lạt 3N2Đ", desc: "Khám phá thành phố ngàn hoa", img: "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg" },
    { id: 2, name: "Tour Hà Nội - Sapa", desc: "Trải nghiệm vùng núi Tây Bắc", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6Zj-MzfrcsirNx_6em61KGqPd5VaEUm57w&s" },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Lịch trình gợi ý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(p => (
            <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden">
              <img src={p.img} alt={p.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-gray-500 text-sm">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <a href="/plan" className="px-6 py-3 bg-blue-600 text-white rounded-full">
            Tạo lịch trình mới
          </a>
        </div>
      </div>
    </section>
  );
}
