
import { useState } from "react";

import { Item } from "@/entities/Item";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { useTranslation } from "../components/providers/LanguageContext";

import CameraCapture from "../components/upload/CameraCapture";

export default function Upload() {
  const { t, language } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const userEmail = "user@archie.vault";

  const handleImageCapture = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(false);
    
    let file_url = '';
    try {
      const uploadResult = await UploadFile({ file });
      file_url = uploadResult.file_url;
      
      const prompt = `Analyze the following text from a receipt which may contain Hebrew and English. Extract the data according to the JSON schema. Do not invent data. If a field is not found, return null for it.`;

      const extractResult = await InvokeLLM({
        prompt: prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string", description: "The primary product name from the receipt" },
            product_model: { type: "string", description: "Product model or SKU if available" },
            store_name: { type: "string", description: "Name of the store or merchant" },
            purchase_date: { type: "string", description: "Date of purchase in YYYY-MM-DD format" },
            total_price: { type: "number", description: "Total amount paid" },
            currency: { type: "string", description: "Currency symbol or code (e.g., ILS, $, €)" },
            warranty_period: { type: "string", description: "Warranty duration if mentioned (e.g., '1 year', '24 months')" }
          }
        }
      }) as any;
        
      const extractedData = extractResult;
      
      if (extractedData.warranty_period && extractedData.purchase_date) {
        // ... (warranty calculation logic)
      }

      await Item.create({
        product_name: extractedData.product_name || "Unknown Product",
        product_model: extractedData.product_model || null,
        store_name: extractedData.store_name || null,
        purchase_date: extractedData.purchase_date || new Date().toISOString().split('T')[0],
        total_price: extractedData.total_price || null,
        currency: extractedData.currency || "$",
        warranty_period: extractedData.warranty_period || null,
        warranty_expiration_date: undefined,
        category: "Other", // Placeholder
        receipt_image_url: file_url,
        processing_status: "completed"
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = createPageUrl("Dashboard");
      }, 2000);

    } catch (err) {
      setError(t('error_upload_failed'));
      console.error("Upload error:", err);
      // Fallback: create an item with just the image
      if (file_url) {
        await Item.create({
          product_name: "Processing Failed",
          receipt_image_url: file_url,
          user_notes: "AI data extraction failed. Please add details manually.",
          processing_status: "failed",
        });
      }
    } finally {
      setProcessing(false);
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
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="rounded-full border-gray-300">
              <ArrowLeft className={`w-5 h-5 ${language === 'he' ? 'transform scale-x-[-1]' : ''}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('upload_title')}</h1>
            <p className="text-gray-600">{t('upload_subtitle')}</p>
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
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Mail className="w-5 h-5" /> {t('email_integration_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{t('email_integration_subtitle')}</p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800">{userEmail}</code>
                  <Button onClick={copyEmailToClipboard} variant="outline" size="sm" className="ml-2 rounded-md">
                    {emailCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border border-yellow-200 rounded-lg">
            <CardHeader><CardTitle className="text-yellow-800">{t('pro_tips_title')}</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li className="flex items-start"><span className="mr-2">-</span>{t('tip1')}</li>
                <li className="flex items-start"><span className="mr-2">-</span>{t('tip2')}</li>
                <li className="flex items-start"><span className="mr-2">-</span>{t('tip3')}</li>
                <li className="flex items-start"><span className="mr-2">-</span>{t('tip4')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}