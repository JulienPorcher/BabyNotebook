import { QrCode } from "lucide-react";
import type { FormPage } from "../forms/UnifiedForm";

interface BabyManagementSectionProps {
  onActionButtonClick: (page: FormPage) => void;
  onShowQrScanner: () => void;
  onShareCarnet: () => void;
}

export default function BabyManagementSection({ 
  onActionButtonClick, 
  onShowQrScanner, 
  onShareCarnet 
}: BabyManagementSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Gestion des Carnets</h2>
      <div className="flex gap-2">
        <button 
          onClick={() => onActionButtonClick("baby")}
          className="flex-1 bg-blue-500 text-white rounded-xl p-3"
        >
          Créer un carnet
        </button>
        <button 
          onClick={onShowQrScanner}
          className="flex-1 bg-green-500 text-white rounded-xl p-3 flex items-center justify-center gap-2"
        >
          <QrCode size={16} />
          Ajouter un carnet
        </button>
        <button 
          onClick={onShareCarnet}
          className="flex-1 bg-purple-500 text-white rounded-xl p-3"
        >
          Partager ce carnet
        </button>
      </div>
    </div>
  );
}
