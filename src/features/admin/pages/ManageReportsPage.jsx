import AdminLayout from "../components/AdminLayout";
import AdminTable from "../components/AdminTable";

export default function ManageReportsPage() {
    const columns = ["ID", "Người báo cáo", "Nội dung", "Ngày tạo", "Trạng thái"];
    const data = [
        [1, "Nguyễn An", "Dịch vụ không đúng mô tả", "01/10/2025", "Chưa xử lý"],
        [2, "Trần Bình", "Địa điểm đóng cửa", "28/09/2025", "Đã xử lý"],
    ];

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Quản lý báo cáo</h1>
        <AdminTable columns={columns} data={data} />
        </AdminLayout>
    );
}