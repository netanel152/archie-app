import React, { useState, useEffect } from "react";
import { Item } from "@/entities/Item";
import { useTranslation } from "../components/providers/LanguageProvider";
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
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
  const [items, setItems] = useState([]);
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

  const filteredItems = items.filter((item) => {
    if (timeFilter === "all") return true;
    const purchaseDate = new Date(item.purchase_date);
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

  const spendingByCategory = filteredItems.reduce((acc, item) => {
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
    .sort(
      (a, b) =>
        new Date(a.warranty_expiration_date) -
        new Date(b.warranty_expiration_date)
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t("insights_title")}
          </h1>
          <p className="text-slate-600">{t("insights_subtitle")}</p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
            <SelectItem value="last_year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_value")}
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Value at Risk</CardTitle>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {upcomingExpirations
                .reduce((sum, item) => sum + (item.total_price || 0), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {t("spending_by_category")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  formatter={(value) => `$${value}`}
                />
                <Bar dataKey="value" barSize={30}>
                  {categoryData.map((entry, index) => (
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

        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-slate-500">
                        {format(
                          new Date(item.warranty_expiration_date),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-amber-700 border-amber-300"
                    >
                      {t("expires_in_days", {
                        count: differenceInDays(
                          new Date(item.warranty_expiration_date),
                          new Date()
                        ),
                      })}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-10">
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
