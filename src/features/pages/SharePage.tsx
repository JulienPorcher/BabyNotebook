import { useBaby } from "../../context/BabyContext";
import ShareQr from "../../components/ShareQr";
import ShareEmail from "../../components/ShareEmail";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const { currentBabyId } = useBaby();
  const navigate = useNavigate();

  if (!currentBabyId) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-gray-600">Aucun carnet sélectionné</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-500 text-white rounded-xl px-4 py-2"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Partager ce carnet</h1>
      </div>

      {/* Share options */}
      <div className="space-y-4">
        {/* QR Code sharing */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Partager par QR Code</h2>
          <p className="text-gray-600 text-sm mb-4">
            Générez un QR code que d'autres personnes peuvent scanner pour accéder à ce carnet.
          </p>
          <ShareQr babyId={currentBabyId} />
        </div>

        {/* Email sharing */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Partager par email</h2>
          <p className="text-gray-600 text-sm mb-4">
            Envoyez un lien par email pour partager ce carnet avec d'autres personnes.
          </p>
          <ShareEmail babyId={currentBabyId} />
        </div>
      </div>
    </div>
  );
}