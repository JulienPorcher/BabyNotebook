import { Upload, Calendar, FileText, Tag, Camera } from "lucide-react";
import { useClickOutside } from "../../../lib/modalUtils";

interface SouvenirModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File | null) => void;
  previewUrl: string;
  title: string;
  onTitleChange: (title: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  onUpload: () => void;
  uploading: boolean;
}

export default function SouvenirModal({
  isOpen,
  onClose,
  onFileSelect,
  previewUrl,
  title,
  onTitleChange,
  date,
  onDateChange,
  description,
  onDescriptionChange,
  onUpload,
  uploading
}: SouvenirModalProps) {
  const handleBackdropClick = useClickOutside(onClose);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onFileSelect(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag size={20} />
          Nouveau Souvenir
        </h3>
        <div className="space-y-4">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Upload size={16} />
              Photo *
            </label>
            
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => onFileSelect(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex gap-3">
                  {/* Upload from device */}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="souvenir-upload"
                    />
                    <label
                      htmlFor="souvenir-upload"
                      className="cursor-pointer flex flex-col items-center justify-center py-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Upload size={24} className="text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">Galerie</span>
                    </label>
                  </div>
                  
                  {/* Take photo */}
                  <div className="flex-1">
                    <button
                      onClick={handleCameraCapture}
                      className="w-full flex flex-col items-center justify-center py-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Camera size={24} className="text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">Appareil</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText size={16} />
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Titre du souvenir..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar size={16} />
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Ajouter une description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
            {previewUrl && title && date && (
              <button
                onClick={onUpload}
                disabled={uploading}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {uploading ? "Enregistrement..." : "Enregistrer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
