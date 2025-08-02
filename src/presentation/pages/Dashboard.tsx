
import { useState, useEffect, useCallback } from "react";
import { Item, type ItemData } from "../../domain/entities/Item";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Plus, Package, Loader2, ListChecks, X, RefreshCw } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "../components/providers/LanguageContext";
import ItemCard from "../components/dashboard/ItemCard";
import SearchAndFilter from "../components/dashboard/SearchAndFilter";

export default function Dashboard() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("purchase_date_desc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set<string>());

  const loadItems = useCallback(async () => {
    if (!isRefreshing) setLoading(true);
    try {
      const fetchedItems = await Item.list("-created_date");
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadItems();
  };

  const handleItemClick = (item: ItemData) => {
    if (selectMode) {
      const newSelectedItems = new Set(selectedItems);
      if (newSelectedItems.has(item.id)) {
        newSelectedItems.delete(item.id);
      } else {
        newSelectedItems.add(item.id);
      }
      setSelectedItems(newSelectedItems);
    } else {
      window.location.href = createPageUrl(`item-detail?id=${item.id}`);
    }
  };

  const filteredAndSortedItems = items
    .filter((item: ItemData) => {
      const matchesSearch =
        !searchTerm ||
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a: ItemData, b: ItemData) => {
      switch (sortBy) {
        case "purchase_date_desc":
          return (
            new Date(b.purchase_date || 0).getTime() -
            new Date(a.purchase_date || 0).getTime()
          );
        case "purchase_date_asc":
          return (
            new Date(a.purchase_date || 0).getTime() -
            new Date(b.purchase_date || 0).getTime()
          );
        case "warranty_expiration_asc":
          return (
            new Date(a.warranty_expiration_date || "9999-12-31").getTime() -
            new Date(b.warranty_expiration_date || "9999-12-31").getTime()
          );
        case "price_desc":
          return (b.total_price || 0) - (a.total_price || 0);
        case "price_asc":
          return (a.total_price || 0) - (b.total_price || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500 dark:text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t("processing_image")}</p>
        </div>
      </div>
    );
  }

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItems(new Set());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("dashboard_title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length === 1
              ? t("dashboard_subtitle", { count: items.length })
              : t("dashboard_subtitle_plural", { count: items.length })}
          </p>
        </div>
        <div className="flex items-center gap-2 justify-start md:justify-end">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="rounded-lg"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {t("retake")}
          </Button>
          <Button
            variant="outline"
            onClick={toggleSelectMode}
            className="rounded-lg"
          >
            {selectMode ? (
              <X className="w-4 h-4" />
            ) : (
              <ListChecks className="w-4 h-4 mr-2" />
            )}
            {selectMode ? t("cancel") : t("select_items")}
          </Button>
          <Link to={createPageUrl("upload")}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              {t("add_new_item")}
            </Button>
          </Link>
        </div>
      </div>

      {selectMode && (
        <div className="mb-8 flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <span className="text-gray-800 dark:text-white">{selectedItems.size} items selected</span>
          <Button disabled={selectedItems.size === 0}>
            <Plus className="w-4 h-4 mr-2" />
            {t("export")}
          </Button>
        </div>
      )}

      <div className="mb-8">
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {items.length === 0
              ? t("no_items_title")
              : t("no_items_found_title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {items.length === 0
              ? t("no_items_subtitle")
              : t("no_items_found_subtitle")}
          </p>
          {items.length === 0 && (
            <Link to={createPageUrl("upload")}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                {t("add_first_item")}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAndSortedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={handleItemClick}
                selectMode={selectMode}
                isSelected={selectedItems.has(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
