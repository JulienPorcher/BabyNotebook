import { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Image as ImageIcon, Heart, Star } from "lucide-react";
import { useBaby } from "../../context/BabyContext";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import PhotoItem from "./gallery/PhotoItem";
import PhotoViewer from "./gallery/PhotoViewer";
import UploadModal from "./gallery/UploadModal";
import SouvenirModal from "./gallery/SouvenirModal";
import EtapesPage from "./gallery/EtapesPage";
import GalleryFilters, { type SortOption, type FilterOption } from "./gallery/GalleryFilters";
import type { Photo } from "../../context/BabyTypes";
import SquareButton from "../../components/ui/SquareButton";

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showSouvenir, setShowSouvenir] = useState(false);
  const [showEtapes, setShowEtapes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const { currentBabyId, babyData, addData, deleteData, refreshBabyData } = useBaby();
  const { user } = useAuth();

  // Get photos from context
  const photos = babyData?.photos || [];

  // Filter and sort photos
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = photos;

    // Apply filter
    if (filterBy !== 'all') {
      filtered = photos.filter(photo => photo.category === filterBy);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title-asc':
          const titleA = (a.title || a.description || '').toLowerCase();
          const titleB = (b.title || b.description || '').toLowerCase();
          return titleA.localeCompare(titleB);
        case 'title-desc':
          const titleA2 = (a.title || a.description || '').toLowerCase();
          const titleB2 = (b.title || b.description || '').toLowerCase();
          return titleB2.localeCompare(titleA2);
        default:
          return 0;
      }
    });

    return sorted;
  }, [photos, filterBy, sortBy]);

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

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
    }
  };

  const handleUpload = async (category: string = 'general') => {
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
        description: description,
        category: category,
        title: title || undefined
      } as any);

      console.log("Photo saved to database successfully");
      // Clean up and refresh
      URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl("");
      setDescription("");
      setTitle("");
      setDate(new Date().toISOString().split('T')[0]);
      setShowUpload(false);
      setShowSouvenir(false);
      setShowEtapes(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur: " + error);
    } finally {
      setUploading(false);
    }
  };

  const handleSouvenirUpload = () => {
    handleUpload('memorie');
  };

  const handleEtapesUpload = () => {
    handleUpload('first step');
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setDescription("");
    setTitle("");
    setDate(new Date().toISOString().split('T')[0]);
    setShowUpload(false);
    setShowSouvenir(false);
    setShowEtapes(false);
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
    const index = filteredAndSortedPhotos.findIndex(p => p.id === photo.id);
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

  // Show Etapes page if selected
  if (showEtapes) {
    return (
      <EtapesPage
        onBack={() => setShowEtapes(false)}
        onFileSelect={handleFileSelect}
        previewUrl={previewUrl}
        title={title}
        onTitleChange={setTitle}
        date={date}
        onDateChange={setDate}
        description={description}
        onDescriptionChange={setDescription}
        onUpload={handleEtapesUpload}
        uploading={uploading}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pb-2">
          <SquareButton
            icon={<Heart size={18} />}
            label="Souvenir"
            onClick={() => setShowSouvenir(true)}
            variant="default"
            layout="vertical"
          />
          <SquareButton
            icon={<Star size={18} />}
            label="Étapes"
            onClick={() => setShowEtapes(true)}
            variant="default"
            layout="vertical"
          />
        </div>
      </div>

      {/* Filters and Sort */}
      <GalleryFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={handleCancel}
        onFileSelect={handleFileSelect}
        previewUrl={previewUrl}
        description={description}
        onDescriptionChange={setDescription}
        onUpload={() => handleUpload('general')}
        uploading={uploading}
      />

      {/* Souvenir Modal */}
      <SouvenirModal
        isOpen={showSouvenir}
        onClose={handleCancel}
        onFileSelect={handleFileSelect}
        previewUrl={previewUrl}
        title={title}
        onTitleChange={setTitle}
        date={date}
        onDateChange={setDate}
        description={description}
        onDescriptionChange={setDescription}
        onUpload={handleSouvenirUpload}
        uploading={uploading}
      />

      {/* Photos Grid */}
      {filteredAndSortedPhotos.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {filterBy === 'all' ? 'Aucune photo pour le moment' : `Aucune photo dans la catégorie "${filterBy}"`}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {filterBy === 'all' ? 'Ajoutez des photos pour créer votre galerie' : 'Essayez une autre catégorie ou ajoutez des photos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAndSortedPhotos.map((photo) => (
            <div key={photo.id} className="aspect-square">
              <PhotoItem photo={photo} onDelete={handlePhotoDelete} onOpen={handlePhotoOpen} />
            </div>
          ))}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {viewerOpen && (
        <PhotoViewer
          photos={filteredAndSortedPhotos}
          currentIndex={currentPhotoIndex}
          onClose={handleViewerClose}
          onNavigate={handleViewerNavigate}
        />
      )}
    </div>
  );
}