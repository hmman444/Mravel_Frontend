import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button";

export default function ServiceDetailModal({ data, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400"
        >
          ✕
        </button>
        <img
          src={data.img}
          alt={data.name}
          className="h-60 w-full object-cover rounded"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
          }}
        />
        <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-neutral">
          {data.name}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{data.location}</p>
        <div className="mt-3 flex justify-between">
          <span className="text-primary font-semibold">
            {data.price.toLocaleString()} đ
          </span>
          <span className="text-yellow-500">★ {data.rating}</span>
        </div>
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
          {t("search.detail_desc")}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200"
          >
            {t("common.close")}
          </Button>
          {data.type === "restaurant" && (
            <Button
              onClick={() => {
                onClose?.();
                navigate("/restaurants");
              }}
            >
              {t("search.book_table")}
            </Button>
          )}
          {data.type === "hotel" && (
            <Button
              onClick={() => {
                onClose?.();
                navigate("/hotels");
              }}
            >
              {t("search.book_room")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
