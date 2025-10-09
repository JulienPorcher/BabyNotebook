import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { useClickOutside } from "../../../lib/modalUtils";
import type { Photo } from "../../../context/BabyTypes";

interface PhotoViewerProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoViewer({ 
  photos, 
  currentIndex, 
  onClose, 
  onNavigate 
}: PhotoViewerProps) {
  const handleBackdropClick = useClickOutside(onClose);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    const loadPhoto = async () => {
      if (!currentPhoto) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from("photos")
          .createSignedUrl(currentPhoto.path, 3600);
        
        if (error) {
          console.error("Error creating signed URL:", error);
          return;
        }
        
        setCurrentPhotoUrl(data.signedUrl);
      } catch (error) {
        console.error("Error loading photo:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
    setZoom(1);
    setRotation(0);
  }, [currentPhoto]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  if (!currentPhoto) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < photos.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Photo container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {loading ? (
          <div className="text-white text-lg">Chargement...</div>
        ) : currentPhotoUrl ? (
          <div className="relative max-w-full max-h-full">
            <img
              src={currentPhotoUrl}
              alt="Photo"
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        ) : (
          <div className="text-white text-lg">Erreur de chargement</div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
        <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <div className="w-px h-6 bg-white/30 mx-2"></div>
        <button
          onClick={() => setRotation(rotation + 90)}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Rotate"
        >
          <RotateCw size={20} />
        </button>
      </div>

      {/* Photo info */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
        <div className="text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
        {currentPhoto.description && (
          <div className="text-xs text-gray-300 mt-1 max-w-xs truncate">
            {currentPhoto.description}
          </div>
        )}
      </div>
    </div>
  );
}
