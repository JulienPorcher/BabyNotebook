import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, Image as ImageIcon } from "lucide-react";
import { useBaby } from "../../context/BabyContext";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import PhotoItem from "./gallery/PhotoItem";
import PhotoViewer from "./gallery/PhotoViewer";
import UploadModal from "./gallery/UploadModal";
import type { Photo } from "../../context/BabyTypes";

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { currentBabyId, babyData, addData, deleteData, refreshBabyData } = useBaby();
  const { user } = useAuth();

  // Get photos from context
  const photos = babyData?.photos || [];

  // Load photos from context
  useEffect(() => {
    if (currentBabyId) {
      setLoading(true);
      refreshBabyData(currentBabyId).finally(() => {
        setLoading(false);
      });
      testStorageAccess();
      cleanupOrphanedPhotos();
    }
  }, [currentBabyId]);

  // Clean up photos that exist in database but not in storage
  const cleanupOrphanedPhotos = async () => {
    if (!currentBabyId || !photos.length) return;

    try {
      console.log("Cleaning up orphaned photos...");

      // Check each photo to see if it exists in storage
      const orphanedPhotos = [];
      for (const photo of photos) {
        const { data, error } = await supabase.storage
          .from("photos")
          .list(photo.path.split('/').slice(0, -1).join('/'), {
            search: photo.path.split('/').pop()
          });

        if (error || !data || data.length === 0) {
          console.log("Found orphaned photo:", photo.path);
          orphanedPhotos.push(photo.id);
        }
      }

      // Delete orphaned photos from database using context
      if (orphanedPhotos.length > 0) {
        for (const photoId of orphanedPhotos) {
          await deleteData('photos', photoId);
        }
        console.log(`Deleted ${orphanedPhotos.length} orphaned photos`);
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  // Test if storage bucket is accessible
  const testStorageAccess = async () => {
    try {
      console.log("Testing storage access...");
      const { data, error } = await supabase.storage
        .from("photos")
        .list("", { limit: 1 });
      
      if (error) {
        console.error("Storage access error:", error);
        alert("Erreur d'accès au stockage: " + error.message);
      } else {
        console.log("Storage access successful:", data);
      }
    } catch (error) {
      console.error("Storage test error:", error);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!currentBabyId || !selectedFile || !user) return;

    try {
      setUploading(true);
      console.log("Starting upload for baby:", currentBabyId, "user:", user.id);
      
      // Upload file to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${currentBabyId}/${fileName}`;

      console.log("Uploading file to path:", filePath);
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        alert("Erreur lors de l'upload: " + uploadError.message);
        return;
      }

      console.log("File uploaded successfully, saving to database...");
      // Save photo record using context with required fields
      await addData('photos', {
        id: uuidv4(),
        baby_id: currentBabyId,
        user_id: user.id,
        created_at: new Date().toISOString(),
        path: filePath,
        description: description
      } as any);

      console.log("Photo saved to database successfully");
      // Clean up and refresh
      URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl("");
      setDescription("");
      setShowUpload(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur: " + error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setDescription("");
    setShowUpload(false);
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      await deleteData('photos', photoId);
      console.log("Photo deleted successfully");
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Erreur lors de la suppression: " + error);
    }
  };

  const handlePhotoOpen = (photo: Photo) => {
    const index = photos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(index);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
  };

  const handleViewerNavigate = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des photos...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Galerie Photos</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl"
        >
          <PlusCircle size={18} />
          Ajouter
        </button>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={handleCancel}
        onFileSelect={handleFileSelect}
        previewUrl={previewUrl}
        description={description}
        onDescriptionChange={setDescription}
        onUpload={handleUpload}
        uploading={uploading}
      />

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Aucune photo pour le moment</p>
          <p className="text-gray-400 text-sm mt-2">
            Ajoutez des photos pour créer votre galerie
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square">
              <PhotoItem photo={photo} onDelete={handlePhotoDelete} onOpen={handlePhotoOpen} />
            </div>
          ))}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {viewerOpen && (
        <PhotoViewer
          photos={photos}
          currentIndex={currentPhotoIndex}
          onClose={handleViewerClose}
          onNavigate={handleViewerNavigate}
        />
      )}
    </div>
  );
}