import React, { useState } from "react";
import { Item } from "@/entities/Item";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { useTranslation } from "../components/providers/LanguageProvider";

import CameraCapture from "../components/upload/CameraCapture";

export default function Upload() {
  const { t, language } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const userEmail = "user@archie.vault";

  const handleImageCapture = async (file) => {
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
      });
        
      const extractedData = extractResult;
      
      let warrantyExpirationDate = null;
      if (extractedData.warranty_period && extractedData.purchase_date) {
        // ... (warranty calculation logic)
      }

      await Item.create({
        product_name: extractedData.product_name || "Unknown Product",
        product_model: extractedData.product_model || null,
        store_name: extractedData.store_name || null,
        purchase_date: extractedData.purchase_date || null,
        total_price: extractedData.total_price || null,
        currency: extractedData.currency || "$",
        warranty_period: extractedData.warranty_period || null,
        warranty_expiration_date: warrantyExpirationDate?.toISOString().split('T')[0] || null,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="rounded-xl border-slate-300 hover:bg-slate-50">
              <ArrowLeft className={`w-4 h-4 ${language === 'he' ? 'lucide-rtl' : ''}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t('upload_title')}</h1>
            <p className="text-slate-600">{t('upload_subtitle')}</p>
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
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              {t('success_added')} {t('redirecting')}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {processing && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
           <Alert className="border-blue-200 bg-blue-50 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800 ms-2">
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
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Mail className="w-5 h-5" /> {t('email_integration_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">{t('email_integration_subtitle')}</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-slate-800 bg-white px-2 py-1 rounded">{userEmail}</code>
                  <Button onClick={copyEmailToClipboard} variant="outline" size="sm" className="ml-2 rounded-lg">
                    {emailCopied ? <><CheckCircle className="w-4 h-4 me-1 text-emerald-600" />{t('copied')}</> : <><Copy className="w-4 h-4 me-1" />{t('copy')}</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-xl">
            <CardHeader><CardTitle>{t('pro_tips_title')}</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>{t('tip1')}</li>
                <li>{t('tip2')}</li>
                <li>{t('tip3')}</li>
                <li>{t('tip4')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}