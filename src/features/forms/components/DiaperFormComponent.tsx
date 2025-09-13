import { useState } from "react";
import { Baby, Droplets, Clock } from "lucide-react";
import { getRoundedDateTime } from "../formHelpers";

interface DiaperFormComponentProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose?: () => void;
  initialValues?: Record<string, any>;
  babyId?: string;
}

const diaperTypes = [
  { id: 'urine', label: 'Urine', icon: <Droplets className="w-4 h-4" />, color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { id: 'selle', label: 'Selle', icon: <Baby className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { id: 'mixte', label: 'Mixte', icon: <Clock className="w-4 h-4" />, color: 'bg-red-50 text-red-700 hover:bg-red-100' }
];

const quantityOptions = [
  { id: 'petite', label: 'Petite', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { id: 'moyenne', label: 'Moyenne', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { id: 'grande', label: 'Grande', color: 'bg-red-50 text-red-700 hover:bg-red-100' }
];

export default function DiaperFormComponent({ onSubmit, onClose, initialValues, babyId }: DiaperFormComponentProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues || {});
  const [comment, setComment] = useState("");
  const [dateTime, setDateTime] = useState(getRoundedDateTime());

  const handleFormSubmit = async (data: Record<string, any>) => {
    localStorage.setItem(`lastDiaper_${babyId}`, JSON.stringify(data));
    await onSubmit(data);
    setFormValues({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold text-center">Ajouter une couche</h2>
      {/* Date/Time Field */}
      <div>
          <label className="block text-sm font-medium mb-1">Date et heure</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
      {/* Quick diaper type selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {diaperTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFormValues({ ...formValues, type: type.label })}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${type.color}`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick quantity selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quantité</h3>
        <div className="grid grid-cols-3 gap-2">
          {quantityOptions.map((qty) => (
            <button
              key={qty.id}
              onClick={() => setFormValues({ ...formValues, quantity: qty.label })}
              className={`p-3 rounded-lg transition-colors ${qty.color}`}
            >
              {qty.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment Field */}
      <div>
          <label className="block text-sm font-medium mb-1">Commentaire</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={3}
            placeholder="Commentaire..."
          />
        </div>
        {/* Submit Buttons */}
        <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleFormSubmit}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
            >
              Enregistrer
            </button>
          </div>
    </div>
  </div>
  );
}
