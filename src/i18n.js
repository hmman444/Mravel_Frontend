import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./locales/vi/translation.json";
import en from "./locales/en/translation.json";

// Khôi phục ngôn ngữ đã chọn (LanguageDropdown lưu vào "language")
const savedLang =
    (typeof localStorage !== "undefined" && localStorage.getItem("language")) || "vi";

i18n.use(initReactI18next).init({
    resources: {
        vi: { translation: vi },
        en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: "vi",
    // Thiếu key ở locale hiện tại -> dùng fallback (vi) thay vì hiện chuỗi rỗng
    returnEmptyString: false,
    interpolation: { escapeValue: false },
});

export default i18n;
