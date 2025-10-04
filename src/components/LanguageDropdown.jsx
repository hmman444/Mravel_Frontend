import { useTranslation } from "react-i18next";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

export default function LanguageDropdown() {
    const { i18n } = useTranslation();

    const handleChange = (e) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
    };

    return (
        <div className="relative">
        <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            <select
            value={i18n.language}
            onChange={handleChange}
            className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            </select>
        </div>
        </div>
    );
}