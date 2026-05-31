import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCompactVnd, formatVnd } from "../../utils/money";

export default function RevenueChart({ data = [] }) {
  const { t } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="gHotel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gResto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tickFormatter={formatCompactVnd} tick={{ fontSize: 12 }} stroke="#94a3b8" width={58} />
        <Tooltip
          formatter={(v, name) => [formatVnd(v), name]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="hotelRevenue"
          name={t("partner.dashboard.hotel_revenue")}
          stackId="1"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#gHotel)"
        />
        <Area
          type="monotone"
          dataKey="restaurantRevenue"
          name={t("partner.dashboard.restaurant_revenue")}
          stackId="1"
          stroke="#F97316"
          strokeWidth={2}
          fill="url(#gResto)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
