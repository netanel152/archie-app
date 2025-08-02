import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Item } from "../../domain/entities/Item";
import { UploadFile, InvokeLLM } from "../../infrastructure/integrations/Core";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ArrowLeft, Mail, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { useTranslation } from "../components/providers/LanguageContext";
import { useUser } from "../components/providers/UserProvider";
import CameraCapture from "../components/upload/CameraCapture";

export default function Upload() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const userEmail = user?.email || "your-unique-address@archie.vault";

  const calculateWarrantyExpiration = (purchaseDateStr: string, warrantyPeriodStr: string): string | null => {
    try {
      const purchaseDate = new Date(purchaseDateStr);
      if (isNaN(purchaseDate.getTime())) return null;
      const period = warrantyPeriodStr.toLowerCase();
      const numberMatch = period.match(/\d+/);
      if (!numberMatch) return null;
      const amount = parseInt(numberMatch[0], 10);
      let expirationDate = new Date(purchaseDate);
      if (period.includes("year")) {
        expirationDate.setFullYear(expirationDate.getFullYear() + amount);
      } else if (period.includes("month")) {
        expirationDate.setMonth(expirationDate.getMonth() + amount);
      } else if (period.includes("day")) {
        expirationDate.setDate(expirationDate.getDate() + amount);
      } else { return null; }
      return expirationDate.toISOString().split('T')[0];
    } catch (e) {
      console.error("Error calculating warranty:", e);
      return null;
    }
  };

  const handleImageCapture = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(false);

    let file_url = '';
    let itemId: string | null = null;

    try {
      // Step 1: Upload the file and create a placeholder item immediately.
      file_url = (await UploadFile({ file })).file_url;
      itemId = await Item.create({
        product_name: "Processing Receipt...",
        receipt_image_url: file_url,
        processing_status: "processing",
      });

      // Step 2: Navigate away immediately to provide the optimistic UI experience.
      navigate(createPageUrl(""));

      // Step 3: Start the AI processing in the background (fire-and-forget).
      // We don't `await` this promise chain on the upload page.
      processItemInBackground(itemId, file_url);

    } catch (err) {
      // This catch block now handles errors from the initial upload/create steps.
      setError(t('error_upload_failed'));
      console.error("Initial upload error:", err);
      setProcessing(false); // Make sure to stop processing indicator on initial error
    }
  };

  const processItemInBackground = async (itemId: string, fileUrl: string) => {
    try {
      const result = await InvokeLLM({
        fileUrl: fileUrl,
        schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            store_name: { type: "string" },
            purchase_date: { type: "string" },
            total_price: { type: "number" },
            currency: { type: "string" },
            warranty_period: { type: "string" },
            category: { type: "string", enum: ["Electronics", "Appliances", "Furniture", "Clothing", "Tools", "Other"] }
          }
        }
      });

      const extractedData = result.data;

      const warranty_expiration_date = (extractedData.warranty_period && extractedData.purchase_date)
        ? calculateWarrantyExpiration(extractedData.purchase_date, extractedData.warranty_period)
        : null;

      await Item.update(itemId, {
        product_name: extractedData.product_name || "Untitled Item",
        store_name: extractedData.store_name,
        purchase_date: extractedData.purchase_date,
        total_price: extractedData.total_price,
        currency: extractedData.currency,
        warranty_period: extractedData.warranty_period,
        warranty_expiration_date: warranty_expiration_date || undefined,
        category: extractedData.category || "Other",
        processing_status: "completed"
      });
    } catch (err) {
      console.error("Background processing error:", err);
      if (itemId) {
        await Item.update(itemId, {
          product_name: "Processing Failed",
          user_notes: "AI data extraction failed. Please add details manually.",
          processing_status: "failed",
        });
      }
    }
  };


  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(userEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("")}>
            <Button variant="outline" size="icon" className="rounded-full border-gray-300">
              <ArrowLeft className={`w-5 h-5 ${language === 'he' ? 'transform scale-x-[-1]' : ''}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('upload_title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('upload_subtitle')}</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {t('success_added')} {t('redirecting')}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {processing && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Alert className="border-blue-200 bg-blue-50 text-blue-800 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="ml-2">
              {t('processing_image')}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <CameraCapture onImageCapture={handleImageCapture} disabled={processing} />
        </div>
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Mail className="w-5 h-5" /> {t('email_integration_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{t('email_integration_subtitle')}</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{userEmail}</code>
                  <Button onClick={copyEmailToClipboard} variant="outline" size="sm" className="ml-2 rounded-md">
                    {emailCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <CardHeader><CardTitle className="text-yellow-800 dark:text-yellow-200">{t('pro_tips_title')}</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                <li className="flex items-start">{t('tip1')}</li>
                <li className="flex items-start">{t('tip2')}</li>
                <li className="flex items-start">{t('tip3')}</li>
                <li className="flex items-start">{t('tip4')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}