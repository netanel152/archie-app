

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ShieldCheck, ShieldAlert, ShieldX, CheckSquare, Square } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useTranslation } from "../providers/LanguageContext";
import { he } from "date-fns/locale";

import type { ItemData } from "@/entities/Item";

interface ItemCardProps {
  item: ItemData;
  onClick: (item: ItemData) => void;
  selectMode: boolean;
  isSelected: boolean;
}

export default function ItemCard({ item, onClick, selectMode, isSelected }: ItemCardProps) {
  const { t, language } = useTranslation();
  const dateLocale = language === 'he' ? he : undefined;

  const getWarrantyStatus = () => {
    if (!item.warranty_expiration_date) return null;
    
    const today = new Date();
    const expirationDate = new Date(item.warranty_expiration_date);
    const daysUntilExpiration = differenceInDays(expirationDate, today);
    
    if (daysUntilExpiration < 0) {
      return {
        label: t('warranty_expired'),
        color: "text-red-600",
        icon: ShieldX
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        label: t('warranty_days_left', {count: daysUntilExpiration}),
        color: "text-yellow-600",
        icon: ShieldAlert
      };
    } else {
      return {
        label: t('warranty_active'),
        color: "text-green-600",
        icon: ShieldCheck
      };
    }
  };

  const warrantyStatus = getWarrantyStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 ${
          isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:shadow-md'
        }`}
        onClick={() => onClick(item)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {item.product_name}
              </h3>
              {item.product_model && (
                <p className="text-sm text-gray-500 truncate">
                  {item.product_model}
                </p>
              )}
            </div>
            {selectMode && (
              <div className="ml-4">
                {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            {item.store_name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{item.store_name}</span>
              </div>
            )}
            
            {item.purchase_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{format(new Date(item.purchase_date), "MMM d, yyyy", {locale: dateLocale})}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            {item.total_price && (
              <span className="font-semibold text-gray-800">
                {item.currency || "$"}{item.total_price}
              </span>
            )}
            {warrantyStatus && (
              <Badge 
                variant="outline" 
                className={`border-0 text-xs ${warrantyStatus.color}`}
              >
                <warrantyStatus.icon className="w-4 h-4 mr-1" />
                {warrantyStatus.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
