import AdminLayout from "../components/AdminLayout";
import AdminTable from "../components/AdminTable";

export default function ManageLocationsPage() {
    const columns = ["ID", "Tên địa điểm", "Thành phố", "Mô tả"];
    const data = [
        [1, "Hồ Xuân Hương", "Đà Lạt", "Danh lam nổi tiếng"],
        [2, "Nhà thờ Đức Bà", "TP.HCM", "Điểm tham quan văn hóa"],
    ];

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Quản lý địa điểm</h1>
        <AdminTable columns={columns} data={data} />
        </AdminLayout>
    );
}