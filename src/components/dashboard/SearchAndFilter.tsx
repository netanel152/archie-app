import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useTranslation } from "../providers/LanguageProvider";

export default function SearchAndFilter({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy,
  categoryFilter,
  setCategoryFilter 
}) {
  const { t } = useTranslation();

  const sortOptions = [
    { value: "purchase_date_desc", label: t('sort_newest') },
    { value: "purchase_date_asc", label: t('sort_oldest') },
    { value: "warranty_expiration_asc", label: t('sort_warranty') },
    { value: "price_desc", label: t('sort_price_high') },
    { value: "price_asc", label: t('sort_price_low') }
  ];

  const categories = ["Electronics", "Appliances", "Furniture", "Clothing", "Tools", "Other"];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 rtl:pe-10 rtl:ps-4 bg-white/80 border-slate-200 focus:border-slate-400 rounded-xl"
          />
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/80 border-slate-200 hover:bg-slate-50 rounded-xl">
                <ArrowUpDown className="w-4 h-4 me-2" />
                {t('sort_by')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-slate-100" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-white/80 border-slate-200 hover:bg-slate-50 rounded-xl">
              <Filter className="w-4 h-4 me-2" />
              <SelectValue placeholder={t('filter_by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter_all_items')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}