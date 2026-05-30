import { useTranslation } from "react-i18next";

export default function PartnerCard({ partner }) {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4 hover:shadow-md transition">
        <img
            src={partner.logo}
            alt={partner.name}
            className="w-16 h-16 rounded-full border object-cover"
        />
        <div className="flex-1">
            <h3 className="font-semibold text-lg">{partner.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{partner.email}</p>
            <p className="text-sm text-gray-400 italic">{partner.serviceType}</p>
        </div>
        <span
            className={`px-3 py-1 text-xs rounded-full ${
            partner.status === "active"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
        >
            {partner.status === "active" ? t('admin.partner_status_active') : t('admin.partner_status_inactive')}
        </span>
        </div>
    );
}