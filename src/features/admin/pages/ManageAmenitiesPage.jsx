import AdminLayout from "../components/AdminLayout";
import AdminTable from "../components/AdminTable";

export default function ManageAmenitiesPage() {
    const columns = ["ID", "Tên tiện ích", "Loại", "Trạng thái"];
    const data = [
        [1, "Wifi miễn phí", "Khách sạn", "Hoạt động"],
        [2, "Xe đưa đón sân bay", "Tour", "Hoạt động"],
        [3, "Buffet sáng", "Khách sạn", "Tạm dừng"],
    ];

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Quản lý tiện ích</h1>
        <AdminTable columns={columns} data={data} />
        </AdminLayout>
    );
}