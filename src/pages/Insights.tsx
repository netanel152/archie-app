
import { useState, useEffect } from "react";
import { Item, type ItemData } from "@/entities/Item";
import { useTranslation } from "../components/providers/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, PieChart, ShieldAlert } from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, differenceInDays } from "date-fns";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#ff4d4d",
];

export default function Insights() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    const loadItems = async () => {
      try {
        const fetchedItems = await Item.list();
        setItems(fetchedItems);
      } catch (error) {
        console.error("Error loading items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const filteredItems = items.filter((item: ItemData) => {
    if (timeFilter === "all") return true;
    const purchaseDate = new Date(item.purchase_date || 0);
    const now = new Date();
    if (timeFilter === "this_year") {
      return purchaseDate.getFullYear() === now.getFullYear();
    }
    if (timeFilter === "last_year") {
      return purchaseDate.getFullYear() === now.getFullYear() - 1;
    }
    return true;
  });

  const totalValue = filteredItems.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );

  const spendingByCategory = filteredItems.reduce((acc: { [key: string]: number }, item) => {
    const category = item.category || "Other";
    acc[category] = (acc[category] || 0) + (item.total_price || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(spendingByCategory)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  const upcomingExpirations = items
    .filter((item) => {
      if (!item.warranty_expiration_date) return false;
      const daysLeft = differenceInDays(
        new Date(item.warranty_expiration_date),
        new Date()
      );
      return daysLeft >= 0 && daysLeft <= 60;
    })
    .sort((a: ItemData, b: ItemData) =>
      new Date(a.warranty_expiration_date || 0).getTime() -
      new Date(b.warranty_expiration_date || 0).getTime()
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("insights_title")}
          </h1>
          <p className="text-gray-600">{t("insights_subtitle")}</p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full md:w-48 bg-white border-gray-300 rounded-lg">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
            <SelectItem value="last_year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t("total_value")}
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Value at Risk</CardTitle>
            <ShieldAlert className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              $
              {upcomingExpirations
                .reduce((sum, item) => sum + (item.total_price || 0), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Items with Warranty</CardTitle>
            <ShieldAlert className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {upcomingExpirations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 bg-white border border-gray-200 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <PieChart className="w-5 h-5" />
              {t("spending_by_category")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ left: 20, top: 20, right: 20, bottom: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  formatter={(value) => `${value}`}
                />
                <Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ShieldAlert className="w-5 h-5" />
              {t("upcoming_expirations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {upcomingExpirations.length > 0 ? (
                upcomingExpirations.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {format(
                          new Date(item.warranty_expiration_date || 0),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-yellow-700 border-yellow-300 bg-yellow-50"
                    >
                      {t("expires_in_days", {
                        count: differenceInDays(
                          new Date(item.warranty_expiration_date || 0),
                          new Date()
                        ),
                      })}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-10">
                  {t("no_expirations")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
