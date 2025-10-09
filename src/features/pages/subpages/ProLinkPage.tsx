import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useBaby } from "../../../context/BabyContext";

export default function ProLinkPage() {
  const [isSharedWithPro, setIsSharedWithPro] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentBaby } = useBaby();

  useEffect(() => {
    checkProAccountSharing();
  }, [currentBaby]);

  const checkProAccountSharing = async () => {
    if (!currentBaby?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check if the current baby is shared with any pro accounts
      // For now, we'll check if there are any shared users with role 'pro'
      // This is a placeholder implementation - you may need to adjust based on your actual pro account logic
      const { data: shares, error } = await supabase
        .from('baby_shares')
        .select('role')
        .eq('baby_id', currentBaby.id);

      if (error) {
        console.error('Error checking pro account sharing:', error);
        setIsSharedWithPro(false);
      } else {
        // Check if any of the shares have a 'pro' role
        // This assumes you have a 'pro' role in your baby_shares table
        const hasProShare = shares?.some(share => share.role === 'pro');
        setIsSharedWithPro(hasProShare || false);
      }
    } catch (error) {
      console.error('Error checking pro account sharing:', error);
      setIsSharedWithPro(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du partage...</p>
        </div>
      </div>
    );
  }

  if (isSharedWithPro) {
    // If shared with pro account, show the evolution content
    return (
      <div className="p-4 space-y-6">
        {/* Section Mesures */}
        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold">Mesures</h2>
          <div className="flex justify-between">
            <p className="text-sm text-gray-600">
              Dernière taille : 65 cm (12/08/2025)
            </p>
            <button className="bg-green-500 text-white px-3 py-2 rounded-xl">
              Ajouter
            </button>
          </div>

          <button className="flex items-center gap-2 text-green-600 mt-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>

          <div className="mt-4">
            <h3 className="text-sm text-gray-500">Évolution de la taille</h3>
            <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
              📊 Graphique taille (à faire)
            </div>
          </div>
        </section>

        {/* Section Poids */}
        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold">Pesée</h2>
          <div className="flex justify-between">
            <p className="text-sm text-gray-600">
              Dernier poids : 7,2 kg (12/08/2025)
            </p>
            <button className="bg-purple-500 text-white px-3 py-2 rounded-xl">
              Ajouter
            </button>
          </div>

          <button className="flex items-center gap-2 text-purple-600 mt-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>

          <div className="mt-4">
            <h3 className="text-sm text-gray-500">Évolution du poids</h3>
            <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
              📊 Graphique poids (à faire)
            </div>
          </div>
        </section>
      </div>
    );
  }

  // If not shared with pro account, show the sharing message
  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Partagez ce carnet avec un compte Pro
          </h2>
        </div>
        
        <div className="text-gray-600 space-y-4">
          <p className="text-base leading-relaxed">
            Les comptes Pro sont destinés aux professionnels de garde de la petite enfance.
          </p>
          
          <p className="text-sm">
            Pour plus de renseignements sur les comptes Pro, suivez le lien suivant : 
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-800 underline ml-1"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add actual link when available
                alert('Lien à créer - Fonctionnalité en cours de développement');
              }}
            >
              lien_a_creer
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
