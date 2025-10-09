import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import type { Photo } from "../../../context/BabyTypes";

interface PhotoItemProps {
  photo: Photo;
  onDelete: (photoId: string) => void;
  onOpen: (photo: Photo) => void;
}

export default function PhotoItem({ photo, onDelete, onOpen }: PhotoItemProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadPhoto = async () => {
      try {
        console.log("Getting signed URL for path:", photo.path);
        const { data, error } = await supabase.storage
          .from("photos")
          .createSignedUrl(photo.path, 3600); // 1 hour expiry
        
        if (error) {
          console.error("Error creating signed URL:", error);
          setLoading(false);
          return;
        }
        
        console.log("Generated signed URL:", data.signedUrl);
        setPhotoUrl(data.signedUrl);
      } catch (error) {
        console.error("Error loading photo:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [photo.path]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) return;

    try {
      setDeleting(true);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("photos")
        .remove([photo.path]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
        alert("Erreur lors de la suppression du fichier: " + storageError.message);
        return;
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
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (deleting) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Suppression...</div>
      </div>
    );
  }

  if (!photoUrl) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <ImageIcon size={32} />
        <span className="text-xs mt-2">Erreur de chargement</span>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full">
      <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={photoUrl}
          alt="Photo"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            console.error("Error loading image:", photoUrl, e);
            const container = e.currentTarget.parentElement;
            if (container) {
              container.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-xs">Erreur de chargement</span>
                </div>
              `;
            }
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", photoUrl);
          }}
        />
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
        <button
          onClick={() => onOpen(photo)}
          className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 p-2 rounded-full transition-opacity"
          title="Ouvrir la photo"
        >
          <ImageIcon size={20} />
        </button>
      </div>

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
