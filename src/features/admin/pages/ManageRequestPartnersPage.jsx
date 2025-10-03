import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AdminLayout from "../components/AdminLayout";

// Dữ liệu demo đơn đăng ký
const partnerRequests = [
    {
        id: 101,
        name: "Adventure Life",
        email: "join@adlife.vn",
        serviceType: "Tour",
        logo: "https://i.pravatar.cc/80?img=21",
        status: "pending",
    },
    {
        id: 102,
        name: "Ocean Hotel",
        email: "contact@oceanhotel.vn",
        serviceType: "Khách sạn",
        logo: "https://i.pravatar.cc/80?img=25",
        status: "pending",
    },
    {
        id: 103,
        name: "Food House",
        email: "apply@foodhouse.vn",
        serviceType: "Ẩm thực",
        logo: "https://i.pravatar.cc/80?img=31",
        status: "pending",
    },
];

export default function ManageRequestPartnersPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Tất cả");

    const filteredRequests = partnerRequests.filter((req) => {
        const matchSearch =
        req.name.toLowerCase().includes(search.toLowerCase()) ||
        req.email.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "Tất cả" || req.serviceType === filter;
        return matchSearch && matchFilter;
    });

    return (
        <AdminLayout>
        {/* Header với nút quay lại */}
        <div className="flex items-center mb-6">
            <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
            >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold">Đơn đăng ký đối tác</h1>
        </div>

        {/* Toolbar: Search + Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Search box */}
            <div className="relative w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:border-blue-500"
            />
            </div>

            {/* Filter */}
            <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-md text-sm w-40"
            >
            <option>Tất cả</option>
            <option>Tour</option>
            <option>Khách sạn</option>
            <option>Ẩm thực</option>
            </select>
        </div>

        {/* Danh sách đơn đăng ký */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
                <div
                key={req.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-5 flex flex-col justify-between"
                >
                <div className="flex items-center gap-4">
                    <img
                    src={req.logo}
                    alt={req.name}
                    className="w-16 h-16 rounded-full border object-cover"
                    />
                    <div>
                    <h3 className="font-semibold text-lg">{req.name}</h3>
                    <p className="text-sm text-gray-500">{req.email}</p>
                    <p className="text-sm text-gray-400 italic">
                        {req.serviceType}
                    </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-5">
                    <button className="flex-1 px-3 py-2 text-sm rounded-md border border-green-500 text-green-600 hover:bg-green-50">
                    ✔ Chấp nhận
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm rounded-md border border-red-500 text-red-600 hover:bg-red-50">
                    ✖ Từ chối
                    </button>
                </div>
                </div>
            ))
            ) : (
            <p className="text-gray-500">Không có đơn đăng ký nào phù hợp.</p>
            )}
        </div>
        </AdminLayout>
    );
}