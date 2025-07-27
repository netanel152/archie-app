import React, { useState, useEffect } from "react";
import { Item } from "@/entities/Item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InvokeLLM } from "@/integrations/Core";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Shield, 
  FileText, 
  ExternalLink, 
  Edit3,
  Save,
  X,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { useTranslation } from "../components/providers/LanguageProvider"; // Updated import path
import { he } from "date-fns/locale";

export default function ItemDetail() {
  const { t, language } = useTranslation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [marketValue, setMarketValue] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const dateLocale = language === 'he' ? he : undefined;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    
    if (itemId) {
      loadItem(itemId);
    }
  }, []);

  const loadItem = async (itemId) => {
    try {
      const items = await Item.list();
      const foundItem = items.find(i => i.id === itemId);
      if (foundItem) {
        setItem(foundItem);
        setNotes(foundItem.user_notes || "");
      }
    } catch (error) {
      console.error("Error loading item:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!item) return;
    
    setSaving(true);
    try {
      await Item.update(item.id, { user_notes: notes });
      setItem({ ...item, user_notes: notes });
      setEditingNotes(false);
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSaving(false);
    }
  };

  const getMarketValue = async () => {
    if (!item?.product_name) return;
    setIsEstimating(true);
    setMarketValue(null);
    try {
      const result = await InvokeLLM({
        prompt: `What is the estimated current resale value of a used "${item.product_name} ${item.product_model || ''}" in good condition on a popular marketplace like eBay? Provide a single estimated value.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_value: { type: "string", description: "A single estimated price, e.g., '$350' or '€400'" },
            currency: { type: "string", description: "The currency of the estimation" }
          }
        }
      });
      if (result && result.estimated_value) {
        setMarketValue(result.estimated_value);
      }
    } catch (e) {
      console.error("Error estimating market value:", e);
      setMarketValue("Could not estimate value");
    } finally {
      setIsEstimating(false);
    }
  }

  const getWarrantyStatus = () => {
    if (!item?.warranty_expiration_date) return null;
    
    const today = new Date();
    const expirationDate = new Date(item.warranty_expiration_date);
    const daysUntilExpiration = differenceInDays(expirationDate, today);
    
    if (daysUntilExpiration < 0) {
      return {
        label: "Warranty Expired",
        color: "bg-red-100 text-red-800 border-red-200",
        description: `Expired ${Math.abs(daysUntilExpiration)} days ago`
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        label: "Expires Soon",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        description: `${daysUntilExpiration} days remaining`
      };
    } else {
      return {
        label: "Active Warranty",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        description: `${daysUntilExpiration} days remaining`
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertDescription>Item not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const warrantyStatus = getWarrantyStatus();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="rounded-xl border-slate-300 hover:bg-slate-50">
              <ArrowLeft className={`w-4 h-4 ${language === 'he' ? 'lucide-rtl' : ''}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{item.product_name}</h1>
            {item.product_model && (
              <p className="text-slate-600">{item.product_model}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="w-5 h-5" />
                {t('item_detail_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.store_name && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Store</p>
                    <p className="font-medium text-slate-900">{item.store_name}</p>
                  </div>
                </div>
              )}
              
              {item.purchase_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Purchase Date</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(item.purchase_date), "MMMM d, yyyy", {locale: dateLocale})}
                    </p>
                  </div>
                </div>
              )}
              
              {item.total_price && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Price</p>
                    <p className="font-medium text-slate-900 text-lg">
                      {item.currency}{item.total_price}
                    </p>
                  </div>
                </div>
              )}
              
              {item.category && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {warrantyStatus && (
            <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Shield className="w-5 h-5" />
                  {t('warranty_info_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${warrantyStatus.color} border`}>
                      {warrantyStatus.label}
                    </Badge>
                    <span className="text-sm text-slate-600">{warrantyStatus.description}</span>
                  </div>
                  
                  {item.warranty_expiration_date && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Expires on</p>
                      <p className="font-medium text-slate-900">
                        {format(new Date(item.warranty_expiration_date), "MMMM d, yyyy", {locale: dateLocale})}
                      </p>
                    </div>
                  )}
                  
                  {item.warranty_period && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Warranty Period</p>
                      <p className="font-medium text-slate-900">{item.warranty_period}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

           <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <TrendingUp className="w-5 h-5" />
                {t('market_value_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                {isEstimating ? (
                     <div className="flex flex-col items-center justify-center h-24">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-500"/>
                        <p className="text-sm text-slate-600 mt-2">{t('estimating')}</p>
                     </div>
                ) : marketValue ? (
                    <div className="flex flex-col items-center justify-center h-24">
                        <p className="text-sm text-slate-600">{t('estimated_value')}</p>
                        <p className="text-3xl font-bold text-slate-800">{marketValue}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-24">
                        <Button onClick={getMarketValue}>{t('get_market_value')}</Button>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <Edit3 className="w-5 h-5" />
                  {t('personal_notes_title')}
                </div>
                {!editingNotes ? (
                  <Button
                    onClick={() => setEditingNotes(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    <Edit3 className="w-4 h-4 me-1" />
                    {t('edit')}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingNotes(false)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={saveNotes}
                      disabled={saving}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your personal notes about this item..."
                  className="min-h-32 resize-none"
                />
              ) : (
                <div className="min-h-32">
                  {notes ? (
                    <p className="text-slate-700 whitespace-pre-wrap">{notes}</p>
                  ) : (
                    <p className="text-slate-400 italic">No notes added yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="w-5 h-5" />
                {t('documents_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.receipt_image_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-slate-300 hover:bg-slate-50"
                  onClick={() => window.open(item.receipt_image_url, '_blank')}
                >
                  <ExternalLink className={`w-4 h-4 me-2 ${language === 'he' ? 'lucide-rtl' : ''}`} />
                  {t('view_receipt')}
                </Button>
              )}
              
              {item.manual_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-slate-300 hover:bg-slate-50"
                  onClick={() => window.open(item.manual_url, '_blank')}
                >
                  <ExternalLink className={`w-4 h-4 me-2 ${language === 'he' ? 'lucide-rtl' : ''}`} />
                  {t('download_manual')}
                </Button>
              )}
              
              {!item.receipt_image_url && !item.manual_url && (
                <p className="text-slate-400 italic text-sm">No documents available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}