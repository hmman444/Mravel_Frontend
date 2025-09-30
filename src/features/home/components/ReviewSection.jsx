export default function ReviewSection() {
  const reviews = [
    { id: 1, user: "Nguyễn An", comment: "Dịch vụ khách sạn tuyệt vời!", rating: 5 },
    { id: 2, user: "Trần Bình", comment: "Tour du lịch chuyên nghiệp, hướng dẫn viên nhiệt tình.", rating: 4 },
  ];

  return (
    <section className="py-12 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Đánh giá từ khách hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{r.user}</span>
              <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
            </div>
            <p className="text-gray-600 text-sm">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
