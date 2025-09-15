import { Utensils, Baby, Activity, Bath, Ruler, Scale, Heart, HeartPlus, Milk } from "lucide-react";
import type { JSX } from "react";
import type { FormPage } from "../forms/UnifiedForm";

interface ActionButtonsSectionProps {
  onActionButtonClick: (page: FormPage) => void;
}

export default function ActionButtonsSection({ onActionButtonClick }: ActionButtonsSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Ajouter</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        <ActionButton icon={<Milk />} label="Biberon" onClick={() => onActionButtonClick("bottle")} />
        <ActionButton icon={<Utensils />} label="Solide" onClick={() => onActionButtonClick("meal")} />
        <ActionButton icon={<Heart />} label="Allaitement" onClick={() => onActionButtonClick("breast")} />
        <ActionButton icon={<HeartPlus />} label="Expression" onClick={() => onActionButtonClick("pump")} />
        <ActionButton icon={<Baby />} label="Couche" onClick={() => onActionButtonClick("diaper")} />
        <ActionButton icon={<Activity />} label="Activité" onClick={() => onActionButtonClick("activity")} />
        <ActionButton icon={<Bath />} label="Bain" onClick={() => onActionButtonClick("bath")} />
        <ActionButton icon={<Ruler />} label="Mesure" onClick={() => onActionButtonClick("measure")} />
        <ActionButton icon={<Scale />} label="Pesée" onClick={() => onActionButtonClick("weight")} />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: JSX.Element; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center min-w-[80px] bg-gray-100 rounded-xl p-3 hover:bg-gray-200"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
