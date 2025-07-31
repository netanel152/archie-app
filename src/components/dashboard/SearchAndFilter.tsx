
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
import { useTranslation } from "../providers/LanguageContext";

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
}

export default function SearchAndFilter({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy,
  categoryFilter,
  setCategoryFilter 
}: SearchAndFilterProps) {
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
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500 rounded-lg"
          />
        </div>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50 rounded-lg w-full md:w-auto">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {t('sort_by')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-gray-100" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white border-gray-300 hover:bg-gray-50 rounded-lg">
              <Filter className="w-4 h-4 mr-2" />
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