
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Shield, ShieldCheck, ShieldAlert, ShieldX, CheckSquare, Square, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useTranslation } from "../providers/LanguageProvider";
import { he } from "date-fns/locale";

export default function ItemCard({ item, onClick, selectMode, isSelected }) {
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
        color: "bg-red-100 text-red-800 border-red-200",
        icon: ShieldX
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        label: t('warranty_days_left', {count: daysUntilExpiration}),
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: ShieldAlert
      };
    } else {
      return {
        label: t('warranty_active'),
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: ShieldCheck
      };
    }
  };

  const warrantyStatus = getWarrantyStatus();

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -2, transition: { duration: 0.2 } },
    selected: { 
      y: -2,
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      borderColor: "var(--accent-gold)"
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate={isSelected ? "selected" : "animate"}
      whileHover={!selectMode ? "hover" : ""}
    >
      <Card 
        className={`bg-white/80 backdrop-blur-sm border-2 hover:border-slate-300 transition-all duration-300 cursor-pointer group ${isSelected ? 'border-amber-500' : 'border-slate-200'}`}
        onClick={() => onClick(item)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 rtl:gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 flex-shrink-0">
                  <Shield className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate text-lg">
                    {item.product_name}
                  </h3>
                  {item.product_model && (
                    <p className="text-sm text-slate-500 truncate">
                      {item.product_model}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {item.store_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{item.store_name}</span>
                  </div>
                )}
                
                {item.purchase_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{format(new Date(item.purchase_date), "MMM d, yyyy", {locale: dateLocale})}</span>
                  </div>
                )}

                {item.created_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Created: {format(new Date(item.created_date), "MMM d, yyyy 'at' hh:mm a", {locale: dateLocale})}</span>
                  </div>
                )}
                
                {item.total_price && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="font-semibold text-slate-900 text-lg">
                      {item.currency || "₪"}{item.total_price}
                    </span>
                    {item.category && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="ms-4 flex flex-col items-end">
              {selectMode && (
                <div className="mb-2">
                  {isSelected ? <CheckSquare className="w-5 h-5 text-amber-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
              )}
              {warrantyStatus && (
                <Badge 
                  variant="outline" 
                  className={`${warrantyStatus.color} border mb-2`}
                >
                  <warrantyStatus.icon className="w-3 h-3 me-1" />
                  {warrantyStatus.label}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
