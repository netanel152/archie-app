import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, RotateCcw, Check } from "lucide-react";

export default function CameraCapture({ onImageCapture }) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUseImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    // Convert data URL to blob
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
    
    onImageCapture(file);
    setIsProcessing(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Camera className="w-5 h-5" />
          Capture Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!capturedImage ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Take a Photo
              </h3>
              <p className="text-slate-600 mb-4">
                Position your receipt clearly in frame
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                <Camera className="w-4 h-4 mr-2" />
                Open Camera
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">or</span>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Upload from Library
              </h3>
              <p className="text-slate-600 mb-4">
                Select an existing photo from your device
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="upload-input"
              />
              <Button
                onClick={() => document.getElementById('upload-input')?.click()}
                variant="outline"
                className="border-slate-300 hover:bg-slate-50 rounded-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full max-h-96 object-contain rounded-xl border border-slate-200"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleRetake}
                variant="outline"
                className="flex-1 border-slate-300 hover:bg-slate-50 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleUseImage}
                disabled={isProcessing}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Use This Image
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}