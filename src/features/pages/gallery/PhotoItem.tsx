import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Download, Eye } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { mediaDeliveryService, MediaQuality } from "../../../services/mediaDeliveryService";
import type { Photo } from "../../../context/BabyTypes";

interface PhotoItemProps {
  photo: Photo;
  onDelete: (photoId: string) => void;
  onOpen: (photo: Photo) => void;
}

export default function PhotoItem({ photo, onDelete, onOpen }: PhotoItemProps) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<MediaQuality>(MediaQuality.THUMBNAIL);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Progressive loading effect
  useEffect(() => {
    if (!photo.id) return;

    const loadMedia = async () => {
      try {
        setLoading(true);
        setError(null);

        // Start with thumbnail for fast preview, fallback to original if needed
        let thumbnailUrl: string;
        try {
          thumbnailUrl = await mediaDeliveryService.getMediaUrl(
            photo.id, 
            MediaQuality.THUMBNAIL
          );
          setCurrentQuality(MediaQuality.THUMBNAIL);
        } catch (thumbnailError) {
          console.warn('Thumbnail not available, using original:', thumbnailError);
          thumbnailUrl = await mediaDeliveryService.getMediaUrl(
            photo.id, 
            MediaQuality.FULL
          );
          setCurrentQuality(MediaQuality.FULL);
        }
        setCurrentUrl(thumbnailUrl);

        // If image is visible and user hovers, upgrade to preview quality
        if (isHovered && imgRef.current) {
          try {
            const previewUrl = await mediaDeliveryService.getMediaUrl(
              photo.id, 
              MediaQuality.PREVIEW
            );
            setCurrentUrl(previewUrl);
            setCurrentQuality(MediaQuality.PREVIEW);
          } catch (previewError) {
            console.warn('Preview not available, keeping current quality:', previewError);
          }
        }
      } catch (err) {
        console.error('Error loading photo:', err);
        setError('Failed to load photo');
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [photo.id, isHovered]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is visible, start loading
            loadThumbnail();
          }
        });
      },
      { threshold: 0.1 }
    );

    intersectionObserver.current.observe(imgRef.current);

    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, []);

  const loadThumbnail = async () => {
    try {
      // Try to load thumbnail first, fallback to original if thumbnail doesn't exist
      let url: string;
      try {
        url = await mediaDeliveryService.getMediaUrl(photo.id, MediaQuality.THUMBNAIL);
      } catch (thumbnailError) {
        console.warn('Thumbnail not available, using original:', thumbnailError);
        // Fallback to original image if thumbnail doesn't exist
        url = await mediaDeliveryService.getMediaUrl(photo.id, MediaQuality.FULL);
      }
      
      setCurrentUrl(url);
      setCurrentQuality(MediaQuality.THUMBNAIL);
    } catch (err) {
      console.error('Error loading thumbnail:', err);
      setError('Failed to load thumbnail');
    }
  };

  const handleImageClick = async () => {
    try {
      // Preload full quality for viewer
      await mediaDeliveryService.getMediaUrl(photo.id, MediaQuality.FULL);
      onOpen(photo);
    } catch (err) {
      console.error('Error preloading full quality:', err);
      onOpen(photo); // Still open viewer even if preload fails
    }
  };

  const handleDownload = async () => {
    try {
      const fullQualityUrl = await mediaDeliveryService.getMediaUrl(
        photo.id, 
        MediaQuality.FULL
      );
      
      // Create download link
      const link = document.createElement('a');
      link.href = fullQualityUrl;
      link.download = `${photo.title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading photo:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) return;

    try {
      setDeleting(true);
      
      // Clear from cache
      mediaDeliveryService.clearCache(photo.id);
      
      // Delete from storage (all qualities)
      const pathsToDelete = [
        photo.path,
        photo.thumbnail_path,
        photo.preview_path,
        photo.medium_path
      ].filter((path): path is string => Boolean(path));

      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("photos")
          .remove(pathsToDelete);

        if (storageError) {
          console.error("Error deleting from storage:", storageError);
          alert("Erreur lors de la suppression du fichier: " + storageError.message);
          return;
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("photos")
        .delete()
        .eq("id", photo.id);

      if (dbError) {
        console.error("Error deleting from database:", dbError);
        alert("Erreur lors de la suppression de l'enregistrement: " + dbError.message);
        return;
      }

      console.log("Photo deleted successfully");
      onDelete(photo.id);
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Erreur: " + error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-sm">Chargement...</div>
      </div>
    );
  }

  if (deleting) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-sm">Suppression...</div>
      </div>
    );
  }

  if (error || !currentUrl) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <ImageIcon size={32} />
        <span className="text-xs mt-2">{error || 'Erreur de chargement'}</span>
      </div>
    );
  }

  return (
    <div 
      className="relative group w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
        <img
          ref={imgRef}
          src={currentUrl}
          alt="Photo"
          className="w-full h-full object-cover transition-all duration-300"
          loading="lazy"
          onError={(e) => {
            console.error("Error loading image:", currentUrl, e);
            setError('Erreur de chargement');
          }}
          onLoad={() => {
            console.log(`Image loaded successfully (${currentQuality}):`, currentUrl);
          }}
        />
      </div>
      
      {/* Quality indicator */}
      {currentQuality !== MediaQuality.FULL && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentQuality === MediaQuality.THUMBNAIL ? 'Thumb' : 
           currentQuality === MediaQuality.PREVIEW ? 'Preview' : 'Medium'}
        </div>
      )}
      
      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
          <button
            onClick={handleImageClick}
            className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-colors"
            title="Ouvrir la photo"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={handleDownload}
            className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-colors"
            title="Télécharger"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Title overlay at bottom */}
      {(photo.title || photo.description) && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b-lg">
          <div className="text-sm font-medium truncate">
            {photo.title || photo.description}
          </div>
          {photo.file_size && (
            <div className="text-xs text-gray-300 mt-1">
              {(photo.file_size / 1024 / 1024).toFixed(1)} MB
            </div>
          )}
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all"
        title="Supprimer la photo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
