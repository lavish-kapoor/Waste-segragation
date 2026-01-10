import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  isAnalyzing: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onCapture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center animate-pulse">
        <div className="relative">
          {preview && (
            <img 
              src={preview} 
              alt="Analyzing" 
              className="w-32 h-32 object-cover rounded-full opacity-50 mb-6 border-4 border-emerald-200"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-emerald-800 mb-2">Analyzing Waste...</h3>
        <p className="text-emerald-600 text-sm">Identifying material composition and segregation rules.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      
      <div className="w-full aspect-[4/3] bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center mb-6 relative overflow-hidden group hover:bg-emerald-100 transition-colors cursor-pointer" onClick={triggerCamera}>
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain z-10" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
               <span className="text-white font-medium flex items-center"><Camera className="mr-2" /> Retake</span>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <div className="bg-emerald-100 p-4 rounded-full inline-flex mb-4">
              <Camera className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-900 mb-1">Take a Photo</h3>
            <p className="text-sm text-emerald-600">or upload an image of the waste</p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment" // Hints mobile browsers to use the rear camera
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="flex gap-4 w-full">
        <button
          onClick={triggerCamera}
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition-transform active:scale-95 flex items-center justify-center"
        >
          <Camera className="w-5 h-5 mr-2" />
          Camera
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium shadow-sm transition-transform active:scale-95 flex items-center justify-center"
        >
          <ImageIcon className="w-5 h-5 mr-2" />
          Gallery
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        Photos are processed securely using Google Gemini AI.
      </p>
    </div>
  );
};

export default CameraCapture;
