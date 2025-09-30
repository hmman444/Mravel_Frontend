import Card from "../../../components/Card";

export default function ServiceList() {
  const services = [
    { id: 1, name: "Dịch vụ", img: "https://image.vietgoing.com/hotel/01/62/vietgoing_sdo2202244107.webp" },
    { id: 2, name: "Địa điểm", img: "https://static.cand.com.vn/Files/Image/nguyenbinh/2020/12/02/thumb_660_31fd51ee-e30c-4b1c-95fd-1a6322111002.jpg" },
    { id: 3, name: "Lịch trình", img: "https://luanvanviet.com/wp-content/uploads/2020/11/hinh-anh-cac-loai-hinh-du-lich-3.jpg" },
  ];

  return (
    <section className="py-12 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-black">
        Dịch vụ phổ biến
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map(s => (
          <Card key={s.id}>
            <img src={s.img} alt={s.name} className="h-40 w-full object-cover" />
            <div className="p-4 font-semibold text-black dark:text-black">
              {s.name}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
