import { useState, useEffect } from "react";
import { Item, type ItemData } from "../../domain/entities/Item";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Trash2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { InvokeLLM } from "../../infrastructure/integrations/Core";
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
import { createPageUrl } from "../../utils";
import { format, differenceInDays } from "date-fns";
import { useTranslation } from "../components/providers/LanguageContext";
import { he } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "../components/ui/alert-dialog";

export default function ItemDetail() {
  const { t, language } = useTranslation();
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [marketValue, setMarketValue] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dateLocale = language === 'he' ? he : undefined;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (itemId) {
      loadItem(itemId);
    }
  }, []);

  const loadItem = async (itemId: string) => {
    try {
      const items = await Item.list();
      const foundItem = items.find((i: ItemData) => i.id === itemId);
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
      }) as any;
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
        color: "bg-red-100 text-red-800",
        description: `Expired ${Math.abs(daysUntilExpiration)} days ago`
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        label: "Expires Soon",
        color: "bg-yellow-100 text-yellow-800",
        description: `${daysUntilExpiration} days remaining`
      };
    } else {
      return {
        label: "Active Warranty",
        color: "bg-green-100 text-green-800",
        description: `${daysUntilExpiration} days remaining`
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>Item not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!item?.id) return;
    setIsDeleting(true);
    try {
      await Item.delete(item.id);
      // Navigate back to dashboard after deletion
      window.location.href = createPageUrl("");
    } catch (error) {
      console.error("Failed to delete item:", error);
      // Here you would show a toast notification to the user
    } finally {
      setIsDeleting(false);
    }
  };

  const warrantyStatus = getWarrantyStatus();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="rounded-full border-gray-300">
              <ArrowLeft className={`w-5 h-5 ${language === 'he' ? 'transform scale-x-[-1]' : ''}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item.product_name}</h1>
            {item.product_model && (
              <p className="text-gray-600">{item.product_model}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="w-5 h-5" />
                {t('item_detail_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={MapPin} label="Store" value={item.store_name} />
              <InfoRow icon={Calendar} label="Purchase Date" value={item.purchase_date ? format(new Date(item.purchase_date), "MMMM d, yyyy", { locale: dateLocale }) : null} />
              <InfoRow icon={DollarSign} label="Price" value={item.total_price ? `${item.currency}${item.total_price}` : null} />
              <InfoRow icon={FileText} label="Category" value={item.category} />
            </CardContent>
          </Card>

          {warrantyStatus && (
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Shield className="w-5 h-5" />
                  {t('warranty_info_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${warrantyStatus.color} border-0 font-medium`}>
                    {warrantyStatus.label}
                  </Badge>
                  <span className="text-sm text-gray-600">{warrantyStatus.description}</span>
                </div>

                {item.warranty_expiration_date && (
                  <InfoRow icon={Calendar} label="Expires on" value={format(new Date(item.warranty_expiration_date), "MMMM d, yyyy", { locale: dateLocale })} />
                )}

                {item.warranty_period && (
                  <InfoRow icon={Shield} label="Warranty Period" value={item.warranty_period} />
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <TrendingUp className="w-5 h-5" />
                {t('market_value_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {isEstimating ? (
                <div className="flex flex-col items-center justify-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                  <p className="text-sm text-gray-600 mt-2">{t('estimating')}</p>
                </div>
              ) : marketValue ? (
                <div className="flex flex-col items-center justify-center h-24">
                  <p className="text-sm text-gray-600">{t('estimated_value')}</p>
                  <p className="text-3xl font-bold text-gray-800">{marketValue}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24">
                  <Button onClick={getMarketValue} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{t('get_market_value')}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800">
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
                    <Edit3 className="w-4 h-4 mr-1" />
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
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
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
                  className="min-h-32 resize-none bg-gray-50 border-gray-300 focus:border-blue-500 rounded-lg"
                />
              ) : (
                <div className="min-h-32 text-gray-700 whitespace-pre-wrap">
                  {notes ? (
                    <p>{notes}</p>
                  ) : (
                    <p className="text-gray-400 italic">No notes added yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="w-5 h-5" />
                {t('documents_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.receipt_image_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-gray-300 hover:bg-gray-50"
                  onClick={() => window.open(item.receipt_image_url, '_blank')}
                >
                  <ExternalLink className={`w-4 h-4 mr-2 ${language === 'he' ? 'transform scale-x-[-1]' : ''}`} />
                  {t('view_receipt')}
                </Button>
              )}

              {item.manual_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-gray-300 hover:bg-gray-50"
                  onClick={() => window.open(item.manual_url, '_blank')}
                >
                  <ExternalLink className={`w-4 h-4 mr-2 ${language === 'he' ? 'transform scale-x-[-1]' : ''}`} />
                  {t('download_manual')}
                </Button>
              )}

              {!item.receipt_image_url && !item.manual_url && (
                <p className="text-gray-400 italic text-sm text-center py-4">No documents available</p>
              )}
            </CardContent>
          </Card>
                <div className="flex justify-end mb-4">
        <AlertDialog>
          <AlertDialogTrigger >
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Item
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete this item
                and remove its data from our servers.
              </AlertDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-400 mt-1" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
};