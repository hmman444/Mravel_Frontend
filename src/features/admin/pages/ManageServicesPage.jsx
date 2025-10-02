import AdminLayout from "../components/AdminLayout";
import AdminTable from "../components/AdminTable";

export default function ManageServicesPage() {
    const columns = ["ID", "Tên dịch vụ", "Loại", "Giá", "Trạng thái"];
    const data = [
        [1, "Tour Đà Lạt 3N2Đ", "Tour", "3.500.000đ", "Hoạt động"],
        [2, "Khách sạn Sunrise", "Khách sạn", "1.200.000đ/đêm", "Tạm dừng"],
    ];

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Quản lý dịch vụ</h1>
        <AdminTable columns={columns} data={data} />
        </AdminLayout>
    );
}