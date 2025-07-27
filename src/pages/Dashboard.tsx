import React, { useState, useEffect } from "react";
import { Item } from "@/entities/Item";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Package, Loader2, ListChecks, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../components/providers/LanguageProvider";

import ItemCard from "../components/dashboard/ItemCard";
import SearchAndFilter from "../components/dashboard/SearchAndFilter";

export default function Dashboard() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("purchase_date_desc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
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
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadItems();
  };

  const handleItemClick = (item) => {
    if (selectMode) {
      const newSelectedItems = new Set(selectedItems);
      if (newSelectedItems.has(item.id)) {
        newSelectedItems.delete(item.id);
      } else {
        newSelectedItems.add(item.id);
      }
      setSelectedItems(newSelectedItems);
    } else {
      window.location.href = createPageUrl(`ItemDetail?id=${item.id}`);
    }
  };

  const filteredAndSortedItems = items
    .filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "purchase_date_desc":
          return (
            new Date(b.purchase_date || 0) - new Date(a.purchase_date || 0)
          );
        case "purchase_date_asc":
          return (
            new Date(a.purchase_date || 0) - new Date(b.purchase_date || 0)
          );
        case "warranty_expiration_asc":
          return (
            new Date(a.warranty_expiration_date || "9999-12-31") -
            new Date(b.warranty_expiration_date || "9999-12-31")
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your items...</p>
        </div>
      </div>
    );
  }

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItems(new Set());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {t("dashboard_title")}
            </h1>
            <p className="text-slate-600">
              {items.length === 1
                ? t("dashboard_subtitle", { count: items.length })
                : t("dashboard_subtitle_plural", { count: items.length })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="rounded-xl"
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 me-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={toggleSelectMode}
              className="rounded-xl"
            >
              {selectMode ? (
                <X className="w-4 h-4" />
              ) : (
                <ListChecks className="w-4 h-4 me-2" />
              )}
              {selectMode ? t("cancel") : t("select_items")}
            </Button>
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 me-2" />
                {t("add_new_item")}
              </Button>
            </Link>
          </div>
        </div>
        {selectMode && (
          <div className="mt-4 flex justify-between items-center bg-slate-100 p-4 rounded-xl">
            <span>{selectedItems.size} items selected</span>
            <Button disabled={selectedItems.size === 0}>
              <Plus className="w-4 h-4 me-2" />
              {t("export")}
            </Button>
          </div>
        )}
      </div>

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
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {items.length === 0
              ? t("no_items_title")
              : t("no_items_found_title")}
          </h3>
          <p className="text-slate-600 mb-6">
            {items.length === 0
              ? t("no_items_subtitle")
              : t("no_items_found_subtitle")}
          </p>
          {items.length === 0 && (
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                <Plus className="w-4 h-4 me-2" />
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
