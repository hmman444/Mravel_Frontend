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
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-900">
          {data.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-600 mb-2">
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
