
import { useRef, useState } from "react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Camera, Upload, RotateCcw, Check } from "lucide-react";

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
  disabled: boolean;
}

export default function CameraCapture({ onImageCapture, disabled }: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === 'string') {
          setCapturedImage(e.target.result);
        }
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
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Camera className="w-5 h-5" />
          Capture Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!capturedImage ? (
          <div className="space-y-4">
            <UploadBox
              icon={Camera}
              title="Take a Photo"
              description="Position your receipt clearly in frame"
              buttonText="Open Camera"
              onButtonClick={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <UploadBox
              icon={Upload}
              title="Upload from Library"
              description="Select an existing photo from your device"
              buttonText="Choose Photo"
              onButtonClick={() => document.getElementById('upload-input')?.click()}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="upload-input"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRetake}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 rounded-lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleUseImage}
                disabled={isProcessing || disabled}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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

const UploadBox = ({ icon: Icon, title, description, buttonText, onButtonClick }: any) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <Icon className="w-8 h-8 text-gray-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 mb-4">
      {description}
    </p>
    <Button
      onClick={onButtonClick}
      variant="outline"
      className="border-gray-300 hover:bg-gray-50 rounded-lg"
    >
      <Icon className="w-4 h-4 mr-2" />
      {buttonText}
    </Button>
  </div>
);