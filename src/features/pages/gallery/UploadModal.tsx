import { Upload } from "lucide-react";
import { useClickOutside } from "../../../lib/modalUtils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  previewUrl: string;
  description: string;
  onDescriptionChange: (description: string) => void;
  onUpload: () => void;
  uploading: boolean;
}

export default function UploadModal({
  isOpen,
  onClose,
  onFileSelect,
  previewUrl,
  description,
  onDescriptionChange,
  onUpload,
  uploading
}: UploadModalProps) {
  const handleBackdropClick = useClickOutside(onClose);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Ajouter une photo</h3>
        <div className="space-y-4">
          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Sélectionnez une photo</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
              >
                Choisir un fichier
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnelle)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Ajouter une description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
            {previewUrl && (
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
