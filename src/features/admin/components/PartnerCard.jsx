export default function PartnerCard({ partner }) {
    return (
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 hover:shadow-md transition">
        <img
            src={partner.logo}
            alt={partner.name}
            className="w-16 h-16 rounded-full border object-cover"
        />
        <div className="flex-1">
            <h3 className="font-semibold text-lg">{partner.name}</h3>
            <p className="text-sm text-gray-500">{partner.email}</p>
            <p className="text-sm text-gray-400 italic">{partner.serviceType}</p>
        </div>
        <span
            className={`px-3 py-1 text-xs rounded-full ${
            partner.status === "active"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
        >
            {partner.status === "active" ? "Hoạt động" : "Tạm ngưng"}
        </span>
        </div>
    );
}