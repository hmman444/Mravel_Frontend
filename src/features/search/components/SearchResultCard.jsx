import { useTranslation } from "react-i18next";
import Card from "../../../components/Card";
import Button from "../../../components/Button";

export default function SearchResultCard({ data, onClick }) {
  const { t } = useTranslation();
  return (
    <Card>
      <img
        src={data.img}
        alt={data.name}
        className="h-40 w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
        }}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
          {data.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {data.location} •{" "}
          {data.type === "hotel"
            ? t("search.type_hotel")
            : data.type === "restaurant"
            ? t("search.type_restaurant")
            : t("search.type_plan")}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-primary font-semibold">
            {data.price.toLocaleString()} đ
          </span>
          <span className="text-yellow-500">★ {data.rating}</span>
        </div>
        <Button className="mt-3 w-full" onClick={onClick}>
          {t("search.see_detail")}
        </Button>
      </div>
    </Card>
  );
}
