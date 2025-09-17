import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedForm, { type FormPage } from "../forms/UnifiedForm";
import { useBaby } from "../../context/BabyContext";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import BabySelector from "../components/BabySelector";
import RecentInfoSection from "../components/RecentInfoSection";
import ActionButtonsSection from "../components/ActionButtonsSection";
import BabyManagementSection from "../components/BabyManagementSection";
import ScanQr from "../../components/ScanQr";
import { convertToSupabaseDateTime } from "../forms/formHelpers";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";


export default function HomePage() {
  const { currentBabyId, babies, loading, setCurrentBabyId, refreshBabies, clearCache } = useBaby();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [currentFormPage, setCurrentFormPage] = useState<FormPage | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map form pages to their corresponding database tables
  const getTableName = (page: FormPage): string => {
    const tableMap: Record<FormPage, string> = {
      meal: 'meals',
      bottle: 'bottles',
      pump: 'pumps',
      diaper: 'diapers',
      activity: 'activities',
      bath: 'baths',
      weight: 'weights',
      measure: 'measures',
      breast: 'breast_feeding',
      baby: 'babies'
    };
    return tableMap[page];
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentFormPage || !user?.id) return;

    try {
      const tableName = getTableName(currentFormPage);
      
      // Convert datetime fields to proper format for Supabase
      const processedFormData = { ...formData };
      if (processedFormData.date_time) {
        processedFormData.date_time = convertToSupabaseDateTime(processedFormData.date_time);
      }

      // For baby creation, add user_id and don't add baby_id (it's the baby being created)
      const insertData = currentFormPage === 'baby' 
        ? { ...processedFormData, owner_id: user.id }
        : { ...processedFormData, baby_id: currentBabyId, user_id: user.id };

      console.log("Submitting to table:", tableName);
      console.log("Data being inserted:", insertData);

      const { error } = await supabase
        .from(tableName)
        .insert([insertData]);

      if (error) {
        console.error("Error adding entry:", error);
        alert(`Erreur lors de l'ajout: ${error.message}`);
      } else {
        console.log("Entry added successfully");
        // If it's a baby creation, force refresh the baby list
        if (currentFormPage === 'baby') {
          console.log("Baby created successfully!");
          await refreshBabies(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Erreur: ${error}`);
    }
  };

  const handleActionButtonClick = (page: FormPage) => {
    setCurrentFormPage(page);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentFormPage(null);
  };

  const handleCloseQrScanner = () => {
    setShowQrScanner(false);
  };

  const handleQrScanSuccess = () => {
    // Force refresh babies list after successful QR scan
    refreshBabies(true);
    setShowQrScanner(false);
  };

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    // Clear cache and force refresh
    clearCache();
    await refreshBabies(true);
    setIsRefreshing(false);
  };

  // Pull-to-refresh hook
  const { pullDistance, containerRef, bind, pullToRefreshIndicator, refreshingIndicator } = usePullToRefresh({
    onRefresh: handleGlobalRefresh,
    isRefreshing
  });

  const handleSelectBaby = (babyId: string) => {
    setCurrentBabyId(babyId);
  };

  const handleShareCarnet = () => {
    if (!currentBabyId) {
      alert("Veuillez sélectionner un carnet avant de le partager");
      return;
    }
    navigate("/share");
  };

  // Debug logging
  console.log('HomePage - babies:', babies);
  console.log('HomePage - loading:', loading);
  console.log('HomePage - user:', user);

  return (
    <div 
      ref={containerRef}
      {...bind()}
      className="p-4 space-y-4 overflow-y-auto"
      style={{ 
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull-to-refresh indicators */}
      {pullToRefreshIndicator}
      {refreshingIndicator}
      
      {/* Baby Selector */}
      <BabySelector
        babies={babies}
        currentBabyId={currentBabyId}
        onSelectBaby={handleSelectBaby}
        loading={loading}
      />

      {/* Recent Info Section */}
      <RecentInfoSection 
        currentBabyId={currentBabyId}
        onBabyChange={() => {
          // Clear cache when baby changes
          clearCache();
        }}
      />

      {/* Action Buttons Section */}
      <ActionButtonsSection 
        onActionButtonClick={handleActionButtonClick}
      />

      {/* Bloc 3 : Infos pratiques */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Infos pratiques</h2>
        <p className="text-gray-600 text-sm">
          Ici vous retrouverez bientôt des liens utiles, conseils, et ressources pour vous accompagner 📚.
        </p>
      </div>
      {/* Baby Management Section */}
      <BabyManagementSection 
        onActionButtonClick={handleActionButtonClick}
        onShowQrScanner={() => setShowQrScanner(true)}
        onShareCarnet={handleShareCarnet}
      />
      {/* Form Modal */}
      {showForm && currentFormPage && (
        <UnifiedForm
          page={currentFormPage}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Scanner un QR Code</h2>
              <button
                onClick={handleCloseQrScanner}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ScanQr onSuccess={handleQrScanSuccess} />
            <div className="mt-4 text-center">
              <button
                onClick={handleCloseQrScanner}
                className="bg-gray-500 text-white rounded-xl px-4 py-2"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

