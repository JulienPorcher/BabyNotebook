import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Info } from "lucide-react";
import { mediaDeliveryService, MediaQuality } from "../../../services/mediaDeliveryService";
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
  const [currentQuality, setCurrentQuality] = useState<MediaQuality>(MediaQuality.PREVIEW);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [preloadingNext, setPreloadingNext] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    const loadPhoto = async () => {
      if (!currentPhoto) return;
      
      setLoading(true);
      setZoom(1);
      setRotation(0);
      
      try {
        // Start with medium quality for viewer
        const mediumUrl = await mediaDeliveryService.getMediaUrl(
          currentPhoto.id, 
          MediaQuality.MEDIUM
        );
        setCurrentPhotoUrl(mediumUrl);
        setCurrentQuality(MediaQuality.MEDIUM);

        // Preload full quality in background
        setTimeout(async () => {
          try {
            const fullUrl = await mediaDeliveryService.getMediaUrl(
              currentPhoto.id, 
              MediaQuality.FULL
            );
            setCurrentPhotoUrl(fullUrl);
            setCurrentQuality(MediaQuality.FULL);
          } catch (error) {
            console.error('Error loading full quality:', error);
          }
        }, 500);

        // Preload adjacent photos
        preloadAdjacentPhotos();
      } catch (error) {
        console.error("Error loading photo:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [currentPhoto]);

  const preloadAdjacentPhotos = async () => {
    const adjacentIndices = [
      currentIndex - 1,
      currentIndex + 1
    ].filter(index => index >= 0 && index < photos.length);

    setPreloadingNext(true);
    
    try {
      await Promise.allSettled(
        adjacentIndices.map(async (index) => {
          const photo = photos[index];
          if (photo) {
            await mediaDeliveryService.getMediaUrl(photo.id, MediaQuality.MEDIUM);
          }
        })
      );
    } catch (error) {
      console.error('Error preloading adjacent photos:', error);
    } finally {
      setPreloadingNext(false);
    }
  };

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
    if (e.key === 'i' || e.key === 'I') setShowInfo(!showInfo);
  };

  const handleDownload = async () => {
    if (!currentPhoto) return;
    
    try {
      const fullQualityUrl = await mediaDeliveryService.getMediaUrl(
        currentPhoto.id, 
        MediaQuality.FULL
      );
      
      const link = document.createElement('a');
      link.href = fullQualityUrl;
      link.download = `${currentPhoto.title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      setZoom(Math.max(0.5, zoom - 0.1));
    } else {
      setZoom(Math.min(3, zoom + 0.1));
    }
  };

  if (!currentPhoto) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
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
              ref={imgRef}
              src={currentPhotoUrl}
              alt="Photo"
              className="max-w-full max-h-full object-contain transition-all duration-300"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
              onLoad={() => {
                console.log(`Photo loaded (${currentQuality}):`, currentPhotoUrl);
              }}
            />
            
            {/* Quality indicator */}
            {currentQuality !== MediaQuality.FULL && (
              <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentQuality === MediaQuality.MEDIUM ? 'Medium' : 'Preview'} Quality
              </div>
            )}
            
            {/* Preloading indicator */}
            {preloadingNext && (
              <div className="absolute top-4 right-16 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Preloading...
              </div>
            )}
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
        <div className="w-px h-6 bg-white/30 mx-2"></div>
        <button
          onClick={handleDownload}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Download"
        >
          <Download size={20} />
        </button>
        <div className="w-px h-6 bg-white/30 mx-2"></div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Info"
        >
          <Info size={20} />
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

      {/* Detailed info panel */}
      {showInfo && (
        <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
          <h3 className="font-semibold mb-2">Photo Details</h3>
          <div className="space-y-1 text-sm">
            {currentPhoto.title && (
              <div><span className="text-gray-300">Title:</span> {currentPhoto.title}</div>
            )}
            {currentPhoto.description && (
              <div><span className="text-gray-300">Description:</span> {currentPhoto.description}</div>
            )}
            {currentPhoto.category && (
              <div><span className="text-gray-300">Category:</span> {currentPhoto.category}</div>
            )}
            {currentPhoto.file_size && (
              <div><span className="text-gray-300">Size:</span> {(currentPhoto.file_size / 1024 / 1024).toFixed(1)} MB</div>
            )}
            {currentPhoto.dimensions && (
              <div><span className="text-gray-300">Dimensions:</span> {currentPhoto.dimensions.width} × {currentPhoto.dimensions.height}</div>
            )}
            {currentPhoto.mime_type && (
              <div><span className="text-gray-300">Type:</span> {currentPhoto.mime_type}</div>
            )}
            <div><span className="text-gray-300">Created:</span> {new Date(currentPhoto.created_at).toLocaleDateString()}</div>
            {currentPhoto.last_accessed && (
              <div><span className="text-gray-300">Last viewed:</span> {new Date(currentPhoto.last_accessed).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
