import { Baby } from "lucide-react";

interface BabyData {
    id: string;
    name: string;
    birth_date: string;
    gender: string;
    user_id: string;
    role: string;
    nickname: string;
  }

interface BabySelectorProps {
  babies: BabyData[];
  currentBabyId: string | null;
  onSelectBaby: (babyId: string) => void;
  loading?: boolean;
}

export default function BabySelector({ babies, currentBabyId, onSelectBaby, loading = false }: BabySelectorProps) {
  // Debug logging
  console.log('BabySelector received babies:', babies);
  console.log('BabySelector currentBabyId:', currentBabyId);
  console.log('BabySelector loading:', loading);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Carnet de bébé</h2>
        <div className="text-center text-gray-500 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Chargement des carnets...</p>
        </div>
      </div>
    );
  }

  if (babies.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Carnet de bébé</h2>
        <div className="text-center text-gray-500 py-8">
          <Baby className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Aucun carnet de bébé</p>
          <p className="text-sm">Créez votre premier carnet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {babies.map((baby) => (
          <button
            key={baby.id}
            onClick={() => onSelectBaby(baby.id)}
            className={`flex flex-col items-center min-w-[80px] p-3 rounded-xl transition-colors ${
              currentBabyId === baby.id
                ? 'bg-blue-100 border-2 border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              baby.gender === 'M' ? 'bg-blue-200' : 'bg-pink-200'
            }`}>
              <Baby className={`w-6 h-6 ${
                baby.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
              }`} />
            </div>
            <span className="text-xs text-center font-medium">{baby.name}</span>
            <span className="text-xs text-gray-500">
              {new Date(baby.birth_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
